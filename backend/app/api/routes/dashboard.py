from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.asset import Asset
from app.models.task import MaintenanceTask
from app.models.train import TrainSchedule
from app.models.block_window import BlockWindow
from app.models.corridor import Corridor
from app.models.plan import MaintenancePlan
from app.schemas.dashboard import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse, summary="Executive Dashboard Summary Metrics")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns aggregated KPI metrics across railway assets, pending tasks, train density,
    and active block plans.
    """
    total_assets = db.query(Asset).count()
    total_tasks = db.query(MaintenanceTask).count()
    total_trains = db.query(TrainSchedule).count()
    total_windows = db.query(BlockWindow).count()
    total_corridors = db.query(Corridor).count()

    # Assets breakdown
    status_counts = db.query(Asset.availability_status, func.count(Asset.id)).group_by(Asset.availability_status).all()
    assets_by_status = {status: count for status, count in status_counts}

    dept_asset_counts = db.query(Asset.department, func.count(Asset.id)).group_by(Asset.department).all()
    assets_by_dept = {dept: count for dept, count in dept_asset_counts}

    # Tasks breakdown
    dept_task_counts = db.query(MaintenanceTask.department, func.count(MaintenanceTask.id)).group_by(MaintenanceTask.department).all()
    tasks_by_dept = {dept: count for dept, count in dept_task_counts}

    task_status_counts = db.query(MaintenanceTask.status, func.count(MaintenanceTask.id)).group_by(MaintenanceTask.status).all()
    tasks_by_status = {status: count for status, count in task_status_counts}

    overdue_count = db.query(MaintenanceTask).filter(MaintenanceTask.overdue_days > 0).count()
    high_crit_count = db.query(MaintenanceTask).filter(MaintenanceTask.criticality >= 4).count()

    # Latest Plan summary
    latest_plan = db.query(MaintenancePlan).order_by(MaintenancePlan.created_at.desc()).first()
    latest_plan_dict = None
    if latest_plan:
        latest_plan_dict = {
            "id": latest_plan.id,
            "name": latest_plan.name,
            "status": latest_plan.status,
            "created_at": latest_plan.created_at.isoformat(),
            "scheduled_count": latest_plan.scheduled_task_count,
            "unscheduled_count": latest_plan.unscheduled_task_count,
            "total_maintenance_minutes": latest_plan.total_maintenance_minutes,
            "utilization_percent": latest_plan.block_utilization_percent,
            "conflicts_detected": latest_plan.conflicts_detected
        }

    return DashboardSummaryResponse(
        total_assets=total_assets,
        assets_by_status=assets_by_status,
        assets_by_department=assets_by_dept,
        total_tasks=total_tasks,
        tasks_by_department=tasks_by_dept,
        tasks_by_status=tasks_by_status,
        overdue_tasks_count=overdue_count,
        high_criticality_tasks_count=high_crit_count,
        total_trains=total_trains,
        total_block_windows=total_windows,
        total_corridors=total_corridors,
        latest_plan=latest_plan_dict
    )
