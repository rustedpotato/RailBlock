from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
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
    model_config = ConfigDict(from_attributes=True)

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


@router.get("", response_model=List[CorridorSummaryResponse], summary="List All Railway Corridors with Dataset Aggregations")
def list_corridors(db: Session = Depends(get_db)):
    """
    Returns all registered corridors with counts of physical assets, pending maintenance tasks,
    timetabled trains, and block windows in the database using efficient aggregated queries.
    """
    corridors = db.query(Corridor).all()
    if not corridors:
        return []

    # Efficient aggregate queries grouped by corridor_id (prevents N+1 database queries)
    asset_counts = dict(
        db.query(Asset.corridor_id, func.count(Asset.id))
        .group_by(Asset.corridor_id)
        .all()
    )
    task_counts = dict(
        db.query(MaintenanceTask.corridor_id, func.count(MaintenanceTask.id))
        .group_by(MaintenanceTask.corridor_id)
        .all()
    )
    train_counts = dict(
        db.query(TrainSchedule.corridor_id, func.count(TrainSchedule.id))
        .group_by(TrainSchedule.corridor_id)
        .all()
    )
    bw_counts = dict(
        db.query(BlockWindow.corridor_id, func.count(BlockWindow.id))
        .group_by(BlockWindow.corridor_id)
        .all()
    )

    return [
        CorridorSummaryResponse(
            id=c.id,
            code=c.code,
            name=c.name,
            description=c.description,
            zone=c.zone,
            total_km=c.total_km,
            asset_count=asset_counts.get(c.id, 0),
            task_count=task_counts.get(c.id, 0),
            train_count=train_counts.get(c.id, 0),
            block_window_count=bw_counts.get(c.id, 0),
        )
        for c in corridors
    ]
