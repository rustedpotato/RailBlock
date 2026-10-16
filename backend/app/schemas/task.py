from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class DepartmentEnum(str, Enum):
    ENGINEERING = "ENGINEERING"
    TRACTION_DISTRIBUTION = "TRACTION_DISTRIBUTION"
    SIGNAL_TELECOMMUNICATION = "SIGNAL_TELECOMMUNICATION"


class TaskStatusEnum(str, Enum):
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


def ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class MaintenanceTaskBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255, description="Brief task description")
    description: Optional[str] = Field(None, description="Detailed scope of work and machine requirements")
    department: DepartmentEnum = Field(..., description="Operating department")
    asset_id: str = Field(..., description="Target railway asset identifier")
    corridor_id: str = Field(..., description="Target corridor identifier")
    duration_minutes: int = Field(..., gt=0, description="Required block duration in minutes")
    criticality: int = Field(3, ge=1, le=5, description="Safety criticality rating (1=Routine, 5=Safety Critical)")
    urgency: int = Field(3, ge=1, le=5, description="Operational urgency rating (1=Low, 5=Immediate)")
    overdue_days: int = Field(0, ge=0, description="Days overdue past periodic maintenance interval")
    earliest_start: datetime = Field(..., description="Earliest permissible start time (UTC)")
    deadline: datetime = Field(..., description="Latest permissible completion deadline (UTC)")
    status: TaskStatusEnum = Field(TaskStatusEnum.PENDING, description="Task status")

    @model_validator(mode="after")
    def validate_task_intervals(self) -> "MaintenanceTaskBase":
        self.earliest_start = ensure_utc(self.earliest_start)
        self.deadline = ensure_utc(self.deadline)

        if self.deadline < self.earliest_start:
            raise ValueError(
                f"Task deadline ({self.deadline}) cannot be earlier than earliest start time ({self.earliest_start})"
            )
        return self


class MaintenanceTaskCreate(MaintenanceTaskBase):
    id: Optional[str] = Field(None, description="Optional custom ID; auto-generated if omitted")


class MaintenanceTaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    department: Optional[DepartmentEnum] = None
    asset_id: Optional[str] = None
    corridor_id: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, gt=0)
    criticality: Optional[int] = Field(None, ge=1, le=5)
    urgency: Optional[int] = Field(None, ge=1, le=5)
    overdue_days: Optional[int] = Field(None, ge=0)
    earliest_start: Optional[datetime] = None
    deadline: Optional[datetime] = None
    status: Optional[TaskStatusEnum] = None

    @model_validator(mode="after")
    def validate_update_intervals(self) -> "MaintenanceTaskUpdate":
        if self.earliest_start:
            self.earliest_start = ensure_utc(self.earliest_start)
        if self.deadline:
            self.deadline = ensure_utc(self.deadline)
        if self.earliest_start and self.deadline and self.deadline < self.earliest_start:
            raise ValueError("Updated deadline cannot be earlier than earliest start time")
        return self


class MaintenanceTaskResponse(MaintenanceTaskBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
