import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.task import MaintenanceTask
from app.models.block_window import BlockWindow
from app.models.train import TrainSchedule
from app.models.plan import MaintenancePlan, ScheduledMaintenance, UnscheduledTaskRecord
from app.repositories.plan_repository import PlanRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.block_window_repository import BlockWindowRepository
from app.repositories.train_repository import TrainRepository
from app.services.scheduling.ortools_scheduler import default_ortools_scheduler
from app.services.scheduling.baseline_scheduler import default_baseline_scheduler
from app.services.conflict_detection.validator import default_validator
from app.schemas.schedule import (
    ScheduleGenerateRequest,
    MaintenancePlanResponse,
    ScheduledMaintenanceResponse,
    UnscheduledTaskResponse,
    ScheduleConflictResponse,
    ScheduleComparisonResponse,
    PlanMetrics
)

router = APIRouter(prefix="/schedules", tags=["Block Scheduling"])


def _build_plan_response(plan: MaintenancePlan) -> MaintenancePlanResponse:
    scheduled_items = []
    for item in plan.scheduled_tasks:
        scheduled_items.append(
            ScheduledMaintenanceResponse(
                id=item.id,
                plan_id=item.plan_id,
                task_id=item.task_id,
                block_window_id=item.block_window_id,
                corridor_id=item.corridor_id,
                assigned_start=item.assigned_start,
                assigned_end=item.assigned_end,
                duration_minutes=item.duration_minutes,
                status=item.status,
                priority_score=item.priority_score,
                explanation=item.explanation,
                task_title=item.task.title if item.task else None,
                department=item.task.department if item.task else None
            )
        )

    unscheduled_items = []
    for item in plan.unscheduled_tasks:
        unscheduled_items.append(
            UnscheduledTaskResponse(
                id=item.id,
                plan_id=item.plan_id,
                task_id=item.task_id,
                reason=item.reason,
                priority_score=item.priority_score,
                details=item.details,
                task_title=item.task.title if item.task else None,
                department=item.task.department if item.task else None
            )
        )

    return MaintenancePlanResponse(
        id=plan.id,
        name=plan.name,
        planning_horizon_start=plan.planning_horizon_start,
        planning_horizon_end=plan.planning_horizon_end,
        created_at=plan.created_at,
        status=plan.status,
        algorithm_used=plan.algorithm_used,
        total_tasks_considered=plan.total_tasks_considered,
        scheduled_task_count=plan.scheduled_task_count,
        unscheduled_task_count=plan.unscheduled_task_count,
        total_maintenance_minutes=plan.total_maintenance_minutes,
        overdue_high_priority_covered=plan.overdue_high_priority_covered,
        conflicts_detected=plan.conflicts_detected,
        block_utilization_percent=plan.block_utilization_percent,
        notes=plan.notes,
        safety_disclaimer=plan.safety_disclaimer,
        scheduled_tasks=scheduled_items,
        unscheduled_tasks=unscheduled_items
    )


@router.post("/generate", response_model=MaintenancePlanResponse, summary="Generate Optimized Block Plan via OR-Tools")
def generate_schedule(req: ScheduleGenerateRequest, db: Session = Depends(get_db)):
    """
    Solves constraint satisfaction problem to generate conflict-free maintenance block assignments.
    Prioritizes safety-critical and overdue tasks while respecting train timetable buffers.
    """
    task_repo = TaskRepository(db)
    window_repo = BlockWindowRepository(db)
    train_repo = TrainRepository(db)
    plan_repo = PlanRepository(db)

    # 1. Fetch eligible tasks
    if req.task_ids:
        tasks = [task_repo.get_by_id(t_id) for t_id in req.task_ids if task_repo.get_by_id(t_id)]
    else:
        tasks = task_repo.get_all(corridor_id=req.corridor_id)

    if not tasks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No eligible maintenance tasks found for scheduling in the selected scope."
        )

    # 2. Fetch block windows and trains
    windows = window_repo.get_all(corridor_id=req.corridor_id, is_active=True)
    if not windows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active block windows registered for the selected scope."
        )

    trains = train_repo.get_all(corridor_id=req.corridor_id)

    # 3. Determine planning horizon
    win_starts = [w.start_time for w in windows]
    win_ends = [w.end_time for w in windows]
    horizon_start = req.horizon_start or min(win_starts)
    horizon_end = req.horizon_end or max(win_ends)

    # 4. Run Google OR-Tools CP-SAT Optimization
    solution = default_ortools_scheduler.optimize_schedule(
        tasks=tasks,
        windows=windows,
        trains=trains,
        safety_buffer_minutes=req.safety_buffer_minutes,
        allow_joint_maintenance=req.allow_joint_maintenance,
        solver_timeout_seconds=req.solver_timeout_seconds
    )

    # 5. Independent Validation
    tasks_map = {t.id: t for t in tasks}
    windows_map = {w.id: w for w in windows}
    validation_report = default_validator.validate_plan(
        scheduled_tasks=solution["scheduled"],
        tasks_map=tasks_map,
        windows_map=windows_map,
        trains=trains,
        safety_buffer_minutes=req.safety_buffer_minutes
    )

    # 6. Save Plan and Assignments to Database
    plan_id = f"PLAN-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    plan_name = f"Optimization Plan ({len(solution['scheduled'])} tasks, {validation_report.total_conflicts} conflicts)"

    db_plan = MaintenancePlan(
        id=plan_id,
        name=plan_name,
        planning_horizon_start=horizon_start,
        planning_horizon_end=horizon_end,
        created_at=datetime.now(timezone.utc),
        status="VALIDATED" if validation_report.is_valid else "CONFLICT_DETECTED",
        algorithm_used=f"Google OR-Tools CP-SAT ({solution['solver_status']})",
        total_tasks_considered=len(tasks),
        scheduled_task_count=len(solution["scheduled"]),
        unscheduled_task_count=len(solution["unscheduled"]),
        total_maintenance_minutes=solution["total_maintenance_minutes"],
        overdue_high_priority_covered=solution["metrics"].get("overdue_high_priority_covered", 0),
        conflicts_detected=validation_report.total_conflicts,
        block_utilization_percent=solution["metrics"].get("utilization_percent", 0.0),
        notes=f"Solver: {solution['solver_status']}. Validation: {validation_report.summary}"
    )
    plan_repo.create(db_plan)

    scheduled_entities = []
    for s in solution["scheduled"]:
        scheduled_entities.append(
            ScheduledMaintenance(
                id=f"SCH-{uuid.uuid4().hex[:8].upper()}",
                plan_id=plan_id,
                task_id=s["task_id"],
                block_window_id=s["block_window_id"],
                corridor_id=s["corridor_id"],
                assigned_start=s["assigned_start"],
                assigned_end=s["assigned_end"],
                duration_minutes=s["duration_minutes"],
                status=s["status"],
                priority_score=s["priority_score"],
                explanation=s["explanation"]
            )
        )
    plan_repo.save_scheduled_items(scheduled_entities)

    unscheduled_entities = []
    for u in solution["unscheduled"]:
        unscheduled_entities.append(
            UnscheduledTaskRecord(
                id=f"UNS-{uuid.uuid4().hex[:8].upper()}",
                plan_id=plan_id,
                task_id=u["task_id"],
                reason=u["reason"],
                priority_score=u["priority_score"],
                details=u.get("details")
            )
        )
    plan_repo.save_unscheduled_items(unscheduled_entities)

    # Return refreshed plan
    saved_plan = plan_repo.get_by_id(plan_id)
    return _build_plan_response(saved_plan)


@router.get("", response_model=List[MaintenancePlanResponse], summary="List Maintenance Block Plans")
def list_schedules(limit: int = 20, db: Session = Depends(get_db)):
    """
    List generated maintenance block plans with summary metrics.
    """
    plan_repo = PlanRepository(db)
    plans = plan_repo.get_all(limit=limit)
    return [_build_plan_response(p) for p in plans]


@router.get("/{plan_id}", response_model=MaintenancePlanResponse, summary="Get Maintenance Block Plan Details")
def get_schedule(plan_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full details of a specific maintenance plan, including task slot assignments
    and unscheduled task diagnostic explanations.
    """
    plan_repo = PlanRepository(db)
    plan = plan_repo.get_by_id(plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance plan '{plan_id}' not found."
        )
    return _build_plan_response(plan)


@router.get("/{plan_id}/conflicts", response_model=ScheduleConflictResponse, summary="Audit Schedule for Safety Conflicts")
def audit_schedule_conflicts(
    plan_id: str,
    safety_buffer_minutes: int = 15,
    db: Session = Depends(get_db)
):
    """
    Independently inspects an existing plan for track collisions, train timetable encroaches,
    and block window boundary breaches. Never reports 0 conflicts without independent verification.
    """
    plan_repo = PlanRepository(db)
    plan = plan_repo.get_by_id(plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance plan '{plan_id}' not found."
        )

    task_repo = TaskRepository(db)
    window_repo = BlockWindowRepository(db)
    train_repo = TrainRepository(db)

    scheduled_dicts = [
        {
            "task_id": s.task_id,
            "block_window_id": s.block_window_id,
            "corridor_id": s.corridor_id,
            "assigned_start": s.assigned_start,
            "assigned_end": s.assigned_end,
            "duration_minutes": s.duration_minutes
        }
        for s in plan.scheduled_tasks
    ]

    all_tasks = {t.id: t for t in task_repo.get_all()}
    all_windows = {w.id: w for w in window_repo.get_all(is_active=None)}
    all_trains = train_repo.get_all()

    report = default_validator.validate_plan(
        scheduled_tasks=scheduled_dicts,
        tasks_map=all_tasks,
        windows_map=all_windows,
        trains=all_trains,
        safety_buffer_minutes=safety_buffer_minutes
    )

    return report.to_schema(plan_id=plan_id)


@router.get("/{plan_id}/comparison", response_model=ScheduleComparisonResponse, summary="Compare Plan against Baseline FIFO Heuristic")
def compare_schedule_with_baseline(plan_id: str, db: Session = Depends(get_db)):
    """
    Compares the OR-Tools optimized schedule against a greedy first-fit baseline plan
    across metrics like scheduled task count, high-priority coverage, and conflicts.
    """
    plan_repo = PlanRepository(db)
    plan = plan_repo.get_by_id(plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance plan '{plan_id}' not found."
        )

    task_repo = TaskRepository(db)
    window_repo = BlockWindowRepository(db)
    train_repo = TrainRepository(db)

    # Gather candidate tasks from the plan
    task_ids = [s.task_id for s in plan.scheduled_tasks] + [u.task_id for u in plan.unscheduled_tasks]
    tasks = [task_repo.get_by_id(t_id) for t_id in task_ids if task_repo.get_by_id(t_id)]
    windows = window_repo.get_all(is_active=True)
    trains = train_repo.get_all()

    # Run baseline heuristic
    baseline_result = default_baseline_scheduler.generate_baseline(
        tasks=tasks,
        windows=windows,
        trains=trains,
        safety_buffer_minutes=15
    )

    # Validate baseline
    tasks_map = {t.id: t for t in tasks}
    windows_map = {w.id: w for w in windows}
    baseline_val = default_validator.validate_plan(
        scheduled_tasks=baseline_result["scheduled"],
        tasks_map=tasks_map,
        windows_map=windows_map,
        trains=trains,
        safety_buffer_minutes=15
    )

    baseline_metrics = PlanMetrics(
        scheduled_task_count=len(baseline_result["scheduled"]),
        unscheduled_task_count=len(baseline_result["unscheduled"]),
        total_maintenance_minutes=baseline_result["total_maintenance_minutes"],
        overdue_high_priority_covered=sum(
            1 for b in baseline_result["scheduled"]
            if getattr(tasks_map.get(b["task_id"]), "overdue_days", 0) > 0
            and getattr(tasks_map.get(b["task_id"]), "criticality", 0) >= 4
        ),
        conflicts_detected=baseline_val.total_conflicts,
        block_utilization_percent=baseline_result["metrics"]["utilization_percent"]
    )

    optimized_metrics = PlanMetrics(
        scheduled_task_count=plan.scheduled_task_count,
        unscheduled_task_count=plan.unscheduled_task_count,
        total_maintenance_minutes=plan.total_maintenance_minutes,
        overdue_high_priority_covered=plan.overdue_high_priority_covered,
        conflicts_detected=plan.conflicts_detected,
        block_utilization_percent=plan.block_utilization_percent
    )

    task_gain = optimized_metrics.scheduled_task_count - baseline_metrics.scheduled_task_count
    high_prio_gain = optimized_metrics.overdue_high_priority_covered - baseline_metrics.overdue_high_priority_covered
    minutes_gain = optimized_metrics.total_maintenance_minutes - baseline_metrics.total_maintenance_minutes

    insights = [
        f"OR-Tools CP-SAT scheduled {optimized_metrics.scheduled_task_count} tasks vs. baseline's {baseline_metrics.scheduled_task_count} ({'+' if task_gain>=0 else ''}{task_gain} tasks).",
        f"Critical overdue maintenance coverage: {optimized_metrics.overdue_high_priority_covered} tasks vs. {baseline_metrics.overdue_high_priority_covered} in baseline.",
        f"Total maintenance minutes delivered: {optimized_metrics.total_maintenance_minutes} min vs. {baseline_metrics.total_maintenance_minutes} min.",
        f"Independent conflicts verified: {optimized_metrics.conflicts_detected} conflicts in optimized plan vs. {baseline_metrics.conflicts_detected} in baseline."
    ]

    return ScheduleComparisonResponse(
        plan_id=plan_id,
        baseline=baseline_metrics,
        optimized=optimized_metrics,
        comparison_summary={
            "task_count_gain": task_gain,
            "high_priority_gain": high_prio_gain,
            "maintenance_minutes_gain": minutes_gain,
            "utilization_improvement_percent": round(optimized_metrics.block_utilization_percent - baseline_metrics.block_utilization_percent, 2)
        },
        insights=insights
    )
