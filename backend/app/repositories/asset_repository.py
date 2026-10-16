from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.asset import Asset
from app.models.corridor import Corridor


class AssetRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        department: Optional[str] = None,
        corridor_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Asset]:
        query = self.db.query(Asset)
        if department:
            query = query.filter(Asset.department == department)
        if corridor_id:
            query = query.filter(Asset.corridor_id == corridor_id)
        if status:
            query = query.filter(Asset.availability_status == status)
        return query.all()

    def get_by_id(self, asset_id: str) -> Optional[Asset]:
        return self.db.query(Asset).filter(Asset.id == asset_id).first()

    def get_corridors(self) -> List[Corridor]:
        return self.db.query(Corridor).all()
