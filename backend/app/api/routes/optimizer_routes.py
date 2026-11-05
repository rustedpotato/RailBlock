"""
RailBlock AI — Multi-Objective Optimizer & UIC 406 Capacity Endpoints (SIH26027)
================================================================================
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.task import MaintenanceTask
from app.models.block_window import BlockWindow
from app.models.train import TrainSchedule
from app.services.scheduling.multi_objective_optimizer import multi_objective_optimizer
from app.services.scheduling.corridor_capacity import corridor_capacity_analyzer
from app.core.security import get_current_user

router = APIRouter(prefix="/optimizer", tags=["Advanced Optimization Engine"])


class ParetoSolveRequest(BaseModel):
    preset: str = Field("BALANCED_PARETO", description="BALANCED_PARETO | SAFETY_MAX | PUNCTUALITY_FIRST | FAST_HEURISTIC")
    safety_weight: float = Field(0.5, ge=0.0, le=1.0)
    punctuality_weight: float = Field(0.5, ge=0.0, le=1.0)
    crew_cost_weight: float = Field(0.2, ge=0.0, le=1.0)
    safety_buffer_minutes: int = Field(15, ge=5, le=45)
    solver_timeout_seconds: float = Field(10.0, ge=1.0, le=60.0)


@router.post("/pareto-solve", summary="Execute Multi-Objective Pareto Optimization")
def execute_pareto_optimization(
    req: ParetoSolveRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Executes Google OR-Tools CP-SAT or Fast Heuristic with dynamic Pareto weight tuning.
    Allows railway controllers to dial the balance between passenger punctuality and track maintenance volume.
    """
    tasks = db.query(MaintenanceTask).all()
    windows = db.query(BlockWindow).all()
    trains = db.query(TrainSchedule).all()

    result = multi_objective_optimizer.run_pareto_optimization(
        tasks=tasks,
        windows=windows,
        trains=trains,
        preset=req.preset,
        safety_weight=req.safety_weight,
        punctuality_weight=req.punctuality_weight,
        crew_cost_weight=req.crew_cost_weight,
        buffer_minutes=req.safety_buffer_minutes,
        timeout_seconds=req.solver_timeout_seconds
    )
    return result


@router.get("/capacity-analysis", summary="UIC 406 Railway Corridor Capacity & Headroom")
def get_corridor_capacity_analysis(
    section: Optional[str] = Query(None, description="Optional specific corridor section name")
):
    """
    Computes International Railway standard (UIC 406) capacity consumption rate (K %),
    theoretical/practical train throughput, and safe continuous maintenance headroom.
    """
    if section:
        return corridor_capacity_analyzer.analyze_corridor_capacity(section)
    return {
        "status": "COMPLETED",
        "methodology": "UIC 406 International Railway Union Standard",
        "corridors": corridor_capacity_analyzer.analyze_network_overview()
    }


@router.post("/fast-reschedule", summary="Fast O(N log N) Dynamic Local Search Rescheduler")
def execute_fast_reschedule(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Runs rapid heuristic local-search rescheduling (<50ms) for real-time incident resolution.
    """
    tasks = db.query(MaintenanceTask).all()
    windows = db.query(BlockWindow).all()
    trains = db.query(TrainSchedule).all()

    tasks_data = [
        {
            "id": t.id,
            "section": getattr(t, "corridor_id", ""),
            "priority_score": getattr(t, "criticality", 3) * 20.0,
            "duration_minutes": t.duration_minutes
        }
        for t in tasks
    ]
    windows_data = [
        {
            "id": w.id,
            "section": getattr(w, "corridor_id", ""),
            "duration_minutes": getattr(w, "duration_minutes", 180),
            "block_type": getattr(w, "block_type", "TRAFFIC")
        }
        for w in windows
    ]
    trains_data = [{"train_number": tr.train_number} for tr in trains]

    return multi_objective_optimizer._run_fast_heuristic(tasks_data, windows_data, trains_data, buffer_minutes=15)
