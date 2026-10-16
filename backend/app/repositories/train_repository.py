from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.train import TrainSchedule


class TrainRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        corridor_id: Optional[str] = None,
        train_type: Optional[str] = None
    ) -> List[TrainSchedule]:
        query = self.db.query(TrainSchedule)
        if corridor_id:
            query = query.filter(TrainSchedule.corridor_id == corridor_id)
        if train_type:
            query = query.filter(TrainSchedule.train_type == train_type)
        return query.order_by(TrainSchedule.scheduled_start.asc()).all()

    def get_by_id(self, train_id: str) -> Optional[TrainSchedule]:
        return self.db.query(TrainSchedule).filter(TrainSchedule.id == train_id).first()
