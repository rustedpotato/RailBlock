from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.block_window import BlockWindow


class BlockWindowRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        corridor_id: Optional[str] = None,
        is_active: bool = True
    ) -> List[BlockWindow]:
        query = self.db.query(BlockWindow)
        if corridor_id:
            query = query.filter(BlockWindow.corridor_id == corridor_id)
        if is_active:
            query = query.filter(BlockWindow.is_active == is_active)
        return query.order_by(BlockWindow.start_time.asc()).all()

    def get_by_id(self, window_id: str) -> Optional[BlockWindow]:
        return self.db.query(BlockWindow).filter(BlockWindow.id == window_id).first()
