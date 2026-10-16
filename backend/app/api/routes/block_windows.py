from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.block_window_repository import BlockWindowRepository
from app.schemas.block_window import BlockWindowResponse

router = APIRouter(prefix="/block-windows", tags=["Block Windows"])


@router.get("", response_model=List[BlockWindowResponse], summary="List Authorized Track Block Windows")
def list_block_windows(
    corridor_id: Optional[str] = None,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """
    List authorized track and power block windows available for maintenance.
    """
    repo = BlockWindowRepository(db)
    return repo.get_all(corridor_id=corridor_id, is_active=is_active)
