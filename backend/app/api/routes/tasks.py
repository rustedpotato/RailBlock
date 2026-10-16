from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.task_repository import TaskRepository
from app.repositories.asset_repository import AssetRepository
from app.schemas.task import (
    MaintenanceTaskCreate,
    MaintenanceTaskUpdate,
    MaintenanceTaskResponse,
    DepartmentEnum,
    TaskStatusEnum
)

router = APIRouter(prefix="/tasks", tags=["Maintenance Tasks"])


@router.get("", response_model=List[MaintenanceTaskResponse], summary="List Maintenance Tasks")
def list_tasks(
    department: Optional[DepartmentEnum] = None,
    status: Optional[TaskStatusEnum] = None,
    corridor_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve all maintenance tasks submitted by Engineering, TRD, or S&T departments.
    """
    repo = TaskRepository(db)
    dept_val = department.value if department else None
    stat_val = status.value if status else None
    return repo.get_all(department=dept_val, status=stat_val, corridor_id=corridor_id)


@router.get("/{task_id}", response_model=MaintenanceTaskResponse, summary="Get Maintenance Task by ID")
def get_task(task_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full details of a specific maintenance task.
    """
    repo = TaskRepository(db)
    task = repo.get_by_id(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance task '{task_id}' not found."
        )
    return task


@router.post(
    "",
    response_model=MaintenanceTaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit New Maintenance Task"
)
def create_task(task_in: MaintenanceTaskCreate, db: Session = Depends(get_db)):
    """
    Submit a new maintenance demand with required duration, criticality, and time bounds.
    """
    # Verify corridor and asset exist
    asset_repo = AssetRepository(db)
    asset = asset_repo.get_by_id(task_in.asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Target asset '{task_in.asset_id}' does not exist in registry."
        )

    task_repo = TaskRepository(db)
    return task_repo.create(task_in)


@router.put("/{task_id}", response_model=MaintenanceTaskResponse, summary="Update Maintenance Task")
def update_task(task_id: str, task_in: MaintenanceTaskUpdate, db: Session = Depends(get_db)):
    """
    Update parameters or status of an existing maintenance task.
    """
    task_repo = TaskRepository(db)
    db_task = task_repo.get_by_id(task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance task '{task_id}' not found."
        )

    if task_in.asset_id:
        asset_repo = AssetRepository(db)
        if not asset_repo.get_by_id(task_in.asset_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Updated asset '{task_in.asset_id}' does not exist in registry."
            )

    return task_repo.update(db_task, task_in)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete Maintenance Task")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    """
    Remove a maintenance task from the planning queue.
    """
    task_repo = TaskRepository(db)
    db_task = task_repo.get_by_id(task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance task '{task_id}' not found."
        )
    task_repo.delete(db_task)
    return None
