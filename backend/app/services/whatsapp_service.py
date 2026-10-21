import logging
import re
import urllib.parse
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger("railblock-whatsapp")

def clean_phone_number(phone: str) -> tuple[str, str]:
    """
    Cleans phone number into:
    1. E.164 formatted string with '+' prefix (e.g., '+919322846915')
    2. Digits-only string suitable for wa.me URLs (e.g., '919322846915')
    """
    digits = re.sub(r"[^\d]", "", phone or "")
    if not digits:
        digits = "919322846915"  # fallback default demo number
    
    # If 10 digits without country code, default to Indian Railways (+91)
    if len(digits) == 10:
        digits = "91" + digits
    
    e164 = f"+{digits}"
    return e164, digits


def format_railway_dispatch_memo(data: Dict[str, Any]) -> str:
    """
    Formats an authentic Indian Railways digital sector dispatch order.
    Designed for high readability in WhatsApp with bold labels, emojis,
    critical safety memos, and 1-tap action links.
    """
    task_id = data.get("task_id", "T-TASK")
    task_title = data.get("task_title", "Track Maintenance Work")
    section = data.get("section", "Section Corridor")
    dept = data.get("department", "ENGINEERING")
    crew = data.get("assigned_crew", "Field Gang")
    equipment = data.get("assigned_equipment", "Standard Tools")
    supervisor = data.get("supervisor", "Section Engineer In-Charge")
    slot = data.get("assigned_slot", "Immediate - Scheduled")
    speed = data.get("speed_restriction") or "Normal Section Speed"
    power = data.get("power_isolation") or "Not Required (25kV Energized)"
    signal = data.get("signal_disconnection") or "None / Interlocking Normal"
    note = data.get("note") or "Proceed as per General & Subsidiary Rules (G&SR)."
    co_reqs = data.get("co_requisite_sectors") or []

    base_url = settings.PUBLIC_BASE_URL.rstrip("/")

    # Department code styling
    dept_labels = {
        "ENGINEERING": "ENGG (Track / P-Way)",
        "TRACTION_DISTRIBUTION": "TRD (Overhead 25kV OHE)",
        "SIGNAL_TELECOMMUNICATION": "S&T (Signals & Telecom)"
    }
    dept_str = dept_labels.get(dept, dept)

    co_req_str = ""
    if co_reqs:
        co_names = [dept_labels.get(c, c) for c in co_reqs]
        co_req_str = f"🤝 *Co-ordination Required:* {', '.join(co_names)}\n"

    memo = (
        f"🚆 *RAILBLOCK AI — SECTOR DISPATCH ORDER*\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"📋 *Work Order:* #{task_id} — {task_title}\n"
        f"🏢 *Department:* {dept_str}\n"
        f"📍 *Section:* {section}\n"
        f"⏱ *Approved Block Slot:* {slot}\n"
        f"👷 *Supervisor:* {supervisor}\n"
        f"🛠 *Assigned Crew:* {crew}\n"
        f"🚜 *Machinery:* {equipment}\n\n"
        f"⚠️ *SAFETY & CAUTION ORDERS:*\n"
        f"⚡ *Power Isolation:* {power}\n"
        f"🛑 *Speed Caution:* {speed}\n"
        f"📡 *S&T Disconnection:* {signal}\n"
        f"{co_req_str}\n"
        f"📝 *Controller Directives:*\n"
        f"_{note}_\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"👉 *1-TAP FIELD ACTIONS (Tap to report):*\n"
        f"• ✅ *Acknowledge & Roll Out:*\n"
        f"  {base_url}/action?task={task_id}&act=ACK\n\n"
        f"• ⏳ *Report 15m Delay:*\n"
        f"  {base_url}/action?task={task_id}&act=DELAY\n\n"
        f"• 🏁 *Issue Fitment Certificate:*\n"
        f"  {base_url}/action?task={task_id}&act=FIT\n"
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
        f"🔒 _Divisional Rail Operating Control Room • RailBlock AI_"
    )
    return memo


async def send_whatsapp_dispatch(to_phone: str, task_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sends WhatsApp dispatch memo.
    If Twilio is configured, sends via Twilio API.
    Always returns formatted message and a direct wa.me link for zero-config testing.
    """
    e164, digits = clean_phone_number(to_phone)
    memo_text = format_railway_dispatch_memo(task_data)
    encoded_text = urllib.parse.quote(memo_text)
    wa_me_url = f"https://wa.me/{digits}?text={encoded_text}"

    account_sid = settings.TWILIO_ACCOUNT_SID.strip()
    auth_token = settings.TWILIO_AUTH_TOKEN.strip()
    from_whatsapp = settings.TWILIO_WHATSAPP_NUMBER.strip()

    result: Dict[str, Any] = {
        "success": True,
        "recipient_e164": e164,
        "digits": digits,
        "message": memo_text,
        "wa_me_url": wa_me_url,
        "channel": "direct_link",
        "task_id": task_data.get("task_id", ""),
        "timestamp": ""
    }

    if account_sid and auth_token and from_whatsapp:
        twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        from_number = from_whatsapp if from_whatsapp.startswith("whatsapp:") else f"whatsapp:{from_whatsapp}"
        to_number = f"whatsapp:{e164}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    twilio_url,
                    auth=(account_sid, auth_token),
                    data={
                        "From": from_number,
                        "To": to_number,
                        "Body": memo_text
                    }
                )
                if resp.status_code in (200, 201):
                    data = resp.json()
                    result["channel"] = "twilio"
                    result["message_sid"] = data.get("sid")
                    result["status"] = data.get("status", "sent")
                    logger.info(f"WhatsApp memo successfully sent via Twilio to {to_number} (SID: {data.get('sid')})")
                else:
                    logger.warning(f"Twilio API returned status {resp.status_code}: {resp.text}")
                    result["twilio_error"] = resp.text
                    result["channel"] = "direct_link"
        except Exception as exc:
            logger.error(f"Failed to send WhatsApp message via Twilio: {exc}")
            result["twilio_error"] = str(exc)
            result["channel"] = "direct_link"
    else:
        logger.info(f"Twilio credentials not configured; generated direct WhatsApp URL for {digits}")

    return result