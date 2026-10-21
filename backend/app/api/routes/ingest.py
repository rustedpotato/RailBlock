from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import Corridor, BlockWindow
from app.models.ingest import Station, BlockNotice
from app.services.osm_importer import import_stations
from app.services.megablock_fetcher import fetch_megablocks

router = APIRouter(prefix="/ingest", tags=["Data Ingestion"])

LINE_NAMES = {
    "WR": ("Western Railway Suburban", "Western Railway"),
    "CR": ("Central Railway Suburban", "Central Railway"),
    "HR": ("Harbour Line Suburban", "Central Railway"),
}


def _serialize(n: BlockNotice) -> dict:
    return {
        "id": n.id, "line": n.line, "section": n.section,
        "from_station": n.from_station, "to_station": n.to_station,
        "start_time": n.start_time.isoformat(), "end_time": n.end_time.isoformat(),
        "block_type": n.block_type, "cancelled_trains": n.cancelled_trains,
        "source_url": n.source_url, "stations_verified": bool(n.stations_verified),
        "status": n.status, "block_window_id": n.block_window_id,
    }


@router.post("/stations/osm", summary="Import Mumbai stations from OpenStreetMap")
def ingest_osm(db: Session = Depends(get_db)):
    try:
        return import_stations(db)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Overpass import failed: {exc}")


@router.get("/stations", summary="List imported stations")
def list_stations(line: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Station)
    if line:
        q = q.filter(Station.line == line.upper())
    return [{"id": s.id, "name": s.name, "line": s.line, "lat": s.lat, "lon": s.lon} for s in q.all()]


@router.post("/megablocks/fetch", summary="Fetch Sunday mega-blocks via Gemini (stages as PENDING)")
def ingest_megablocks(date: str | None = None, db: Session = Depends(get_db)):
    """`date` (YYYY-MM-DD) optionally targets a specific Sunday; defaults to the next Sunday."""
    try:
        target = datetime.fromisoformat(date) if date else None
        return fetch_megablocks(db, target)
    except ValueError:
        raise HTTPException(status_code=422, detail="date must be YYYY-MM-DD")
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini fetch failed: {exc}")


@router.get("/megablocks", summary="List staged mega-block notices")
def list_notices(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(BlockNotice).order_by(BlockNotice.start_time.desc())
    if status:
        q = q.filter(BlockNotice.status == status.upper())
    return [_serialize(n) for n in q.all()]


@router.post("/megablocks/{notice_id}/approve", summary="Approve notice and create a BlockWindow")
def approve_notice(notice_id: int, db: Session = Depends(get_db)):
    n = db.get(BlockNotice, notice_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notice not found")
    if n.status == "APPROVED":
        return _serialize(n)

    name, zone = LINE_NAMES.get(n.line, (f"{n.line} Suburban", "Indian Railways"))
    corridor = db.query(Corridor).filter_by(code=n.line).first()
    if not corridor:
        corridor = Corridor(id=f"corr-{n.line.lower()}", code=n.line, name=name, zone=zone,
                            description="Mumbai suburban corridor", total_km=100.0)
        db.add(corridor)
        db.flush()

    minutes = int((n.end_time - n.start_time).total_seconds() // 60)
    win_id = f"bw-notice-{n.id}"
    db.add(BlockWindow(
        id=win_id, corridor_id=corridor.id,
        name=f"{n.line} Mega Block: {n.section}"[:128],
        start_time=n.start_time, end_time=n.end_time,
        available_capacity_minutes=max(minutes - 20, 0),  # deduct power cut/restore + clearance
        department_restrictions="ALL", line_affected="BOTH", is_active=True,
    ))
    n.status, n.block_window_id = "APPROVED", win_id
    db.commit()
    return _serialize(n)


@router.post("/megablocks/{notice_id}/reject", summary="Reject a staged notice")
def reject_notice(notice_id: int, db: Session = Depends(get_db)):
    n = db.get(BlockNotice, notice_id)
    if not n:
        raise HTTPException(status_code=404, detail="Notice not found")
    n.status = "REJECTED"
    db.commit()
    return _serialize(n)
