from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.asset_repository import AssetRepository
from app.schemas.asset import AssetResponse

router = APIRouter(prefix="/assets", tags=["Railway Assets"])


@router.get("", response_model=List[AssetResponse], summary="List Railway Assets")
def list_assets(
    department: Optional[str] = None,
    corridor_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List physical rail assets across Permanent Way, Traction OHE, and Signalling.
    """
    repo = AssetRepository(db)
    return repo.get_all(department=department, corridor_id=corridor_id, status=status)
