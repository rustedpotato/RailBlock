from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.corridor import Corridor
from app.models.asset import Asset
from app.models.task import MaintenanceTask
from app.models.train import TrainSchedule
from app.models.block_window import BlockWindow

router = APIRouter(prefix="/corridors", tags=["Railway Corridors"])


class CorridorSummaryResponse(BaseModel):
    id: str
    code: str
    name: str
    description: str | None
    zone: str
    total_km: float
    asset_count: int
    task_count: int
    train_count: int
    block_window_count: int

    class Config:
        from_attributes = True


@router.get("", response_model=List[CorridorSummaryResponse], summary="List All Railway Corridors with Dataset Aggregations")
def list_corridors(db: Session = Depends(get_db)):
    """
    Returns all registered corridors with counts of physical assets, pending maintenance tasks,
    timetabled trains, and block windows in the SQLite database.
    """
    corridors = db.query(Corridor).all()
    result = []
    for c in corridors:
        asset_count = db.query(Asset).filter(Asset.corridor_id == c.id).count()
        task_count = db.query(MaintenanceTask).filter(MaintenanceTask.corridor_id == c.id).count()
        train_count = db.query(TrainSchedule).filter(TrainSchedule.corridor_id == c.id).count()
        bw_count = db.query(BlockWindow).filter(BlockWindow.corridor_id == c.id).count()

        result.append(CorridorSummaryResponse(
            id=c.id,
            code=c.code,
            name=c.name,
            description=c.description,
            zone=c.zone,
            total_km=c.total_km,
            asset_count=asset_count,
            task_count=task_count,
            train_count=train_count,
            block_window_count=bw_count
        ))
    return result
