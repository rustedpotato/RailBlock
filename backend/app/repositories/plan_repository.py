from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.plan import MaintenancePlan, ScheduledMaintenance, UnscheduledTaskRecord


class PlanRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, limit: int = 20) -> List[MaintenancePlan]:
        return (
            self.db.query(MaintenancePlan)
            .order_by(MaintenancePlan.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_by_id(self, plan_id: str) -> Optional[MaintenancePlan]:
        return (
            self.db.query(MaintenancePlan)
            .options(
                joinedload(MaintenancePlan.scheduled_tasks).joinedload(ScheduledMaintenance.task),
                joinedload(MaintenancePlan.unscheduled_tasks).joinedload(UnscheduledTaskRecord.task),
            )
            .filter(MaintenancePlan.id == plan_id)
            .first()
        )

    def create(self, plan: MaintenancePlan) -> MaintenancePlan:
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def save_scheduled_items(self, items: List[ScheduledMaintenance]) -> None:
        self.db.add_all(items)
        self.db.commit()

    def save_unscheduled_items(self, items: List[UnscheduledTaskRecord]) -> None:
        self.db.add_all(items)
        self.db.commit()
