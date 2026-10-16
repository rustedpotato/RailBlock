from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.task import MaintenanceTaskResponse


class ScheduleGenerateRequest(BaseModel):
    corridor_id: Optional[str] = Field(None, description="Optional target corridor to schedule; all corridors if null")
    horizon_start: Optional[datetime] = Field(None, description="Start of planning window (UTC); defaults to earliest window")
    horizon_end: Optional[datetime] = Field(None, description="End of planning window (UTC); defaults to latest window")
    task_ids: Optional[List[str]] = Field(None, description="Explicit subset of task IDs to schedule, or null for all pending")
    safety_buffer_minutes: int = Field(15, ge=5, le=60, description="Safety clearance buffer before and after train pass-through (minutes)")
    allow_joint_maintenance: bool = Field(True, description="Allow compatible TRD/ENG/S&T tasks to share designated joint block windows")
    solver_timeout_seconds: float = Field(10.0, ge=1.0, le=60.0, description="CP-SAT solver timeout limit in seconds")


class ScheduledMaintenanceResponse(BaseModel):
    id: str
    plan_id: str
    task_id: str
    block_window_id: str
    corridor_id: str
    assigned_start: datetime
    assigned_end: datetime
    duration_minutes: int
    status: str
    priority_score: float
    explanation: str
    task_title: Optional[str] = None
    department: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UnscheduledTaskResponse(BaseModel):
    id: str
    plan_id: str
    task_id: str
    reason: str
    priority_score: float
    details: Optional[str] = None
    task_title: Optional[str] = None
    department: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MaintenancePlanResponse(BaseModel):
    id: str
    name: str
    planning_horizon_start: datetime
    planning_horizon_end: datetime
    created_at: datetime
    status: str
    algorithm_used: str
    total_tasks_considered: int
    scheduled_task_count: int
    unscheduled_task_count: int
    total_maintenance_minutes: int
    overdue_high_priority_covered: int
    conflicts_detected: int
    block_utilization_percent: float
    notes: Optional[str] = None
    safety_disclaimer: str
    scheduled_tasks: List[ScheduledMaintenanceResponse] = []
    unscheduled_tasks: List[UnscheduledTaskResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ConflictDetail(BaseModel):
    conflict_type: str = Field(..., description="Type: OVERLAPPING_MAINTENANCE, TRAIN_COLLISION, WINDOW_OUT_OF_BOUNDS, DURATION_MISMATCH")
    severity: str = Field(..., description="CRITICAL, HIGH, WARNING")
    message: str
    task_id: Optional[str] = None
    conflicting_entity_id: Optional[str] = None
    corridor_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class ScheduleConflictResponse(BaseModel):
    plan_id: str
    is_valid: bool
    total_conflicts: int
    critical_conflicts: int
    conflicts: List[ConflictDetail]
    summary: str


class PlanMetrics(BaseModel):
    scheduled_task_count: int
    unscheduled_task_count: int
    total_maintenance_minutes: int
    overdue_high_priority_covered: int
    conflicts_detected: int
    block_utilization_percent: float


class ScheduleComparisonResponse(BaseModel):
    plan_id: str
    baseline: PlanMetrics
    optimized: PlanMetrics
    comparison_summary: Dict[str, Any]
    insights: List[str]
