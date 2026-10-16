import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.task import MaintenanceTask
from app.schemas.task import MaintenanceTaskCreate, MaintenanceTaskUpdate


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        department: Optional[str] = None,
        status: Optional[str] = None,
        corridor_id: Optional[str] = None
    ) -> List[MaintenanceTask]:
        query = self.db.query(MaintenanceTask)
        if department:
            query = query.filter(MaintenanceTask.department == department)
        if status:
            query = query.filter(MaintenanceTask.status == status)
        if corridor_id:
            query = query.filter(MaintenanceTask.corridor_id == corridor_id)
        return query.order_by(MaintenanceTask.criticality.desc(), MaintenanceTask.overdue_days.desc()).all()

    def get_by_id(self, task_id: str) -> Optional[MaintenanceTask]:
        return self.db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()

    def create(self, task_in: MaintenanceTaskCreate) -> MaintenanceTask:
        task_data = task_in.model_dump()
        if not task_data.get("id"):
            task_data["id"] = f"TSK-{uuid.uuid4().hex[:8].upper()}"
        
        db_task = MaintenanceTask(**task_data)
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def update(self, db_task: MaintenanceTask, task_in: MaintenanceTaskUpdate) -> MaintenanceTask:
        update_data = task_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def delete(self, db_task: MaintenanceTask) -> None:
        self.db.delete(db_task)
        self.db.commit()
