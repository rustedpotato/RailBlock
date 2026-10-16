from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.train_repository import TrainRepository
from app.schemas.train import TrainScheduleResponse

router = APIRouter(prefix="/trains", tags=["Train Timetable"])


@router.get("", response_model=List[TrainScheduleResponse], summary="List Timetabled Train Movements")
def list_trains(
    corridor_id: Optional[str] = None,
    train_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List timetabled train movements on railway corridors.
    """
    repo = TrainRepository(db)
    return repo.get_all(corridor_id=corridor_id, train_type=train_type)
