"""Fetch weekly Mumbai suburban mega-block announcements using Gemini with Google Search grounding."""
import json
import re
import xml.etree.ElementTree as ET
from urllib.parse import quote_plus
from datetime import datetime, timedelta, timezone
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.ingest import BlockNotice, Station

IST = timezone(timedelta(hours=5, minutes=30))


def next_sunday(today: datetime | None = None) -> datetime:
    today = today or datetime.now(IST)
    days = (6 - today.weekday()) % 7
    return (today + timedelta(days=days)).replace(hour=0, minute=0, second=0, microsecond=0)


PROMPT = """Search the web for the official Mumbai suburban railway MEGA BLOCK / maintenance block \
announcements (Central Railway, Western Railway, Harbour line) for Sunday {date}.
Prefer Central Railway / Western Railway press releases and reputable news.
Return ONLY a JSON array (no prose, no markdown fences). Each item:
{{"line": "WR"|"CR"|"HR", "section": "text", "from_station": "name", "to_station": "name",
 "start": "YYYY-MM-DDTHH:MM" (IST 24h), "end": "YYYY-MM-DDTHH:MM" (IST 24h),
 "block_type": "UP fast"|"DOWN slow"|"Jumbo"|..., "cancelled_trains": "short text",
 "source_url": "url"}}
If no announcement is found, return []. Do not invent data."""


def _extract_json(text: str) -> list:
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    start, end = text.find("["), text.rfind("]")
    if start == -1 or end == -1:
        return []
    return json.loads(text[start:end + 1])


def _article_text(link: str) -> tuple[str, str]:
    """Resolve a Google News redirect link to the publisher URL and return (url, body text excerpt)."""
    try:
        from googlenewsdecoder import gnewsdecoder
        url = gnewsdecoder(link, interval=1).get("decoded_url") or link
        r = httpx.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=30, follow_redirects=True)
        t = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", r.text)
        t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t))
        i = max(t.lower().find("block"), 0)
        return url, t[i:i + 1800]
    except Exception:
        return link, ""


def _news_context() -> str:
    """Fallback when Search grounding is unavailable: collect recent mega-block articles from Google News RSS."""
    q = quote_plus("Mumbai mega block Sunday Central Railway Western Railway Harbour")
    url = f"https://news.google.com/rss/search?q={q}+when:7d&hl=en-IN&gl=IN&ceid=IN:en"
    r = httpx.get(url, headers={"User-Agent": "RailBlockAI/0.2"}, timeout=30, follow_redirects=True)
    r.raise_for_status()
    blocks = []
    for item in list(ET.fromstring(r.text).iter("item"))[:8]:
        title = item.findtext("title", "")
        pub = item.findtext("pubDate", "")
        real_url, body = _article_text(item.findtext("link", ""))
        blocks.append(f"### [{pub}] {title}\nURL: {real_url}\n{body}")
    return "\n\n".join(blocks)


def _generate(text: str, grounded: bool) -> str:
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent"
    )
    body = {"contents": [{"parts": [{"text": text}]}], "generationConfig": {"temperature": 0}}
    if grounded:
        body["tools"] = [{"google_search": {}}]
    r = httpx.post(url, json=body, headers={"x-goog-api-key": settings.GEMINI_API_KEY}, timeout=120)
    r.raise_for_status()
    parts = r.json()["candidates"][0]["content"]["parts"]
    return "".join(p.get("text", "") for p in parts)


def fetch_megablocks(db: Session, target: datetime | None = None) -> dict:
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set in backend/.env")

    date = (target or next_sunday()).strftime("%Y-%m-%d")
    prompt = PROMPT.format(date=date)
    mode = "google_search_grounding"
    try:
        raw = _generate(prompt, grounded=True)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code not in (400, 403, 429):
            raise
        # Grounding not available on this API key/tier: extract from news articles instead.
        mode = "news_rss_extraction"
        articles = _news_context()
        raw = _generate(
            prompt.replace("Search the web for", "From ONLY the news articles listed below, extract")
            + "\n\nArticles (source_url must be one of these links):\n" + articles,
            grounded=False,
        )
    items = _extract_json(raw)

    known = {s.name.lower() for s in db.query(Station).all()}
    added = 0
    for it in items:
        try:
            start = datetime.fromisoformat(it["start"]).replace(tzinfo=IST)
            end = datetime.fromisoformat(it["end"]).replace(tzinfo=IST)
            line = it["line"].upper()
        except (KeyError, ValueError):
            continue
        dup = db.query(BlockNotice).filter_by(
            line=line, start_time=start, end_time=end, section=it.get("section", "")
        ).first()
        if dup:
            continue
        fs_raw = it.get("from_station") or ""
        ts_raw = it.get("to_station") or ""
        def _match_known(name: str) -> bool:
            if not name or not known:
                return False
            n = re.sub(r"[^a-z0-9]", "", name.lower())
            return any(n in re.sub(r"[^a-z0-9]", "", k) or re.sub(r"[^a-z0-9]", "", k) in n for k in known)

        verified = int(_match_known(fs_raw) and _match_known(ts_raw))
        db.add(BlockNotice(
            line=line, section=it.get("section", ""), from_station=it.get("from_station"),
            to_station=it.get("to_station"), start_time=start, end_time=end,
            block_type=it.get("block_type"), cancelled_trains=it.get("cancelled_trains"),
            source_url=it.get("source_url"), stations_verified=verified,
        ))
        added += 1
    db.commit()
    return {"target_date": date, "mode": mode, "found": len(items), "staged": added}
