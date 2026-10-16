from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.task import ensure_utc


class BlockWindowBase(BaseModel):
    corridor_id: str = Field(..., description="Corridor reference ID")
    name: str = Field(..., max_length=128, description="Identifier for this maintenance window")
    start_time: datetime = Field(..., description="Window commencement timestamp (UTC)")
    end_time: datetime = Field(..., description="Window termination timestamp (UTC)")
    available_capacity_minutes: int = Field(..., gt=0, description="Usable maintenance capacity in minutes")
    department_restrictions: Optional[str] = Field(
        None,
        description="Comma-separated permitted departments, or null for open joint window"
    )
    line_affected: str = Field("BOTH", description="Track affected: UP, DOWN, BOTH")
    is_active: bool = Field(True, description="Whether window is active and bookable")

    @model_validator(mode="after")
    def validate_window_intervals(self) -> "BlockWindowBase":
        self.start_time = ensure_utc(self.start_time)
        self.end_time = ensure_utc(self.end_time)

        if self.end_time <= self.start_time:
            raise ValueError(
                f"Block window end time ({self.end_time}) must be after start time ({self.start_time})"
            )
        
        # Check that available_capacity_minutes does not exceed the absolute interval
        duration_minutes = int((self.end_time - self.start_time).total_seconds() / 60)
        if self.available_capacity_minutes > duration_minutes:
            raise ValueError(
                f"Available capacity ({self.available_capacity_minutes} min) cannot exceed total window duration ({duration_minutes} min)"
            )
        return self


class BlockWindowCreate(BlockWindowBase):
    id: Optional[str] = None


class BlockWindowResponse(BlockWindowBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
