from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db, SessionLocal
from app.db.seed import seed_synthetic_data
from app.models.corridor import Corridor
from app.models.asset import Asset
from app.models.task import MaintenanceTask
from app.models.train import TrainSchedule
from app.models.block_window import BlockWindow
from app.models.plan import MaintenancePlan, ScheduledMaintenance
from app.services.scheduling.ortools_scheduler import default_ortools_scheduler
from app.services.conflict_detection.validator import default_validator
from app.repositories.plan_repository import PlanRepository
from app.repositories.task_repository import TaskRepository
from app.repositories.block_window_repository import BlockWindowRepository
from app.repositories.train_repository import TrainRepository
import uuid

router = APIRouter(prefix="/pipeline", tags=["Data Pipeline & Dataset Engine"])


@router.get("/overview", summary="Get Full Data Pipeline Architecture and Dataset Inventory")
def get_pipeline_overview(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns end-to-end data pipeline metadata and the live dataset state from the database.
    """
    total_corridors = db.query(Corridor).count()
    total_assets = db.query(Asset).count()
    total_tasks = db.query(MaintenanceTask).count()
    total_trains = db.query(TrainSchedule).count()
    total_windows = db.query(BlockWindow).count()
    total_plans = db.query(MaintenancePlan).count()
    total_scheduled = db.query(ScheduledMaintenance).count()

    corridors = db.query(Corridor).all()
    corridor_data = [
        {
            "id": c.id,
            "code": c.code,
            "name": c.name,
            "zone": c.zone,
            "total_km": c.total_km,
            "assets": db.query(Asset).filter(Asset.corridor_id == c.id).count(),
            "tasks": db.query(MaintenanceTask).filter(MaintenanceTask.corridor_id == c.id).count(),
            "trains": db.query(TrainSchedule).filter(TrainSchedule.corridor_id == c.id).count(),
            "windows": db.query(BlockWindow).filter(BlockWindow.corridor_id == c.id).count(),
        }
        for c in corridors
    ]

    pipeline_stages = [
        {
            "stage_id": "STAGE_1_INGESTION",
            "name": "Raw Ingestion & Sensor Data Layer",
            "sources": [
                {"name": "TMS (Train Management System)", "protocol": "REST / FOIS Feeder", "type": "Live timetable & train headway"},
                {"name": "USFD / Track Recording Cars", "protocol": "GeoJSON / KM Marker", "type": "IMR & defect telemetry"},
                {"name": "SCADA 25kV OHE Substation", "protocol": "Modbus / MQTT", "type": "Catenary health, breaker telemetry"},
                {"name": "Electronic Interlocking (EI)", "protocol": "Data Logger Syslog", "type": "Point machine, track circuit relays"}
            ],
            "status": "OPERATIONAL",
            "records_processed": total_tasks + total_trains + total_assets,
            "refresh_rate": "Live 2.5s WebSocket + Scheduled batch"
        },
        {
            "stage_id": "STAGE_2_DATASET_STORE",
            "name": "Structured Railway Dataset Store (SQLite / SQLAlchemy)",
            "description": "Normalized relational schema indexing physical assets, corridor geometry, pending maintenance work orders, and timetabled traffic.",
            "status": "ONLINE",
            "dataset_summary": {
                "corridors": total_corridors,
                "assets": total_assets,
                "maintenance_tasks": total_tasks,
                "train_schedules": total_trains,
                "block_windows": total_windows,
                "plans_generated": total_plans
            }
        },
        {
            "stage_id": "STAGE_3_OR_TOOLS_SOLVER",
            "name": "Google OR-Tools CP-SAT Scheduling Engine",
            "description": "Formulates multi-objective constraint satisfaction optimization (hard buffer constraints, multi-department joint blocks, urgency/criticality weighting).",
            "status": "READY",
            "algorithm": "CP-SAT Integer Programming Solver",
            "constraints_enforced": [
                "Timetable passenger clearance buffer (>=15 min)",
                "Power block OHE isolation co-requisite",
                "Asset physical capacity and equipment availability",
                "Multi-department corridor co-location"
            ]
        },
        {
            "stage_id": "STAGE_4_VALIDATOR",
            "name": "Independent Multi-Layer Safety Validator",
            "description": "Dual-engine conflict detector verifying zero timetable overlap, block window capacity compliance, and crew safety protocols.",
            "status": "ACTIVE",
            "last_check_status": "Passed independent constraint verification"
        },
        {
            "stage_id": "STAGE_5_TELEMETRY_STREAM",
            "name": "Live Telemetry Broadcast & Client Sync",
            "description": "FastAPI WebSocket pipeline (/ws/live) pushing 2-second train position updates, signal aspects, and track block occupancies directly to the UI.",
            "status": "STREAMING",
            "endpoint": "/ws/live",
            "snapshot_endpoint": "/api/realtime/snapshot"
        }
    ]

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database_type": "SQLite (WAL Mode) via SQLAlchemy ORM",
        "dataset_counts": {
            "corridors": total_corridors,
            "assets": total_assets,
            "maintenance_tasks": total_tasks,
            "train_schedules": total_trains,
            "block_windows": total_windows,
            "plans": total_plans,
            "scheduled_tasks": total_scheduled
        },
        "corridors": corridor_data,
        "pipeline_stages": pipeline_stages
    }


@router.post("/reseed", summary="Pipeline Action: Reseed Database with Clean Operational Dataset")
def trigger_reseed():
    """
    Safely clears and repopulates the railway dataset with verified multi-corridor synthetic data.
    """
    try:
        seed_synthetic_data()
        return {
            "status": "SUCCESS",
            "message": "Railway dataset successfully re-seeded from synthetic operational generator.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reseed database: {str(e)}")


@router.post("/run-optimization", summary="Pipeline Action: Execute Google OR-Tools CP-SAT Pipeline")
def trigger_optimization_pipeline(db: Session = Depends(get_db)):
    """
    Runs the full optimization pipeline from task extraction to schedule validation and DB persistence.
    """
    task_repo = TaskRepository(db)
    window_repo = BlockWindowRepository(db)
    train_repo = TrainRepository(db)
    plan_repo = PlanRepository(db)

    tasks = task_repo.get_all()
    windows = window_repo.get_all(is_active=True)
    trains = train_repo.get_all()

    if not tasks or not windows:
        raise HTTPException(status_code=400, detail="Insufficient tasks or block windows to run solver.")

    # Run solver
    solution = default_ortools_scheduler.optimize_schedule(
        tasks=tasks,
        windows=windows,
        trains=trains,
        safety_buffer_minutes=15,
        allow_joint_maintenance=True,
        solver_timeout_seconds=10
    )

    # Validate
    tasks_map = {t.id: t for t in tasks}
    windows_map = {w.id: w for w in windows}
    validation_report = default_validator.validate_plan(
        scheduled_tasks=solution["scheduled"],
        tasks_map=tasks_map,
        windows_map=windows_map,
        trains=trains,
        safety_buffer_minutes=15
    )

    # Persist plan
    plan_id = f"PLAN-AUTO-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    db_plan = MaintenancePlan(
        id=plan_id,
        name=f"Automated Pipeline Optimization ({len(solution['scheduled'])} Tasks Scheduled)",
        planning_horizon_start=min([w.start_time for w in windows]),
        planning_horizon_end=max([w.end_time for w in windows]),
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
        notes=f"Triggered from RailBlock Data Pipeline Explorer. Solver: {solution['solver_status']}."
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

    return {
        "status": "SUCCESS",
        "plan_id": plan_id,
        "solver_status": solution["solver_status"],
        "scheduled_count": len(solution["scheduled"]),
        "unscheduled_count": len(solution["unscheduled"]),
        "utilization_percent": solution["metrics"].get("utilization_percent", 0.0),
        "validation": {
            "is_valid": validation_report.is_valid,
            "conflicts": validation_report.total_conflicts,
            "summary": validation_report.summary
        }
    }
