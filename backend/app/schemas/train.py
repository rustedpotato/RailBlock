from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.task import ensure_utc


class TrainTypeEnum(str, Enum):
    VANDE_BHARAT = "VANDE_BHARAT"
    RAJDHANI = "RAJDHANI"
    SUPERFAST = "SUPERFAST"
    EXPRESS = "EXPRESS"
    FREIGHT = "FREIGHT"


class TrainScheduleBase(BaseModel):
    train_number: str = Field(..., max_length=32)
    train_name: str = Field(..., max_length=128)
    train_type: TrainTypeEnum = Field(..., description="Train operational classification")
    corridor_id: str = Field(..., description="Corridor reference ID")
    direction: str = Field("UP", description="Direction of travel: UP or DOWN")
    scheduled_start: datetime = Field(..., description="Corridor entry timestamp (UTC)")
    scheduled_end: datetime = Field(..., description="Corridor exit timestamp (UTC)")
    priority_level: int = Field(3, ge=1, le=5, description="Priority rating (5 = High, 1 = Low)")

    @model_validator(mode="after")
    def validate_train_intervals(self) -> "TrainScheduleBase":
        self.scheduled_start = ensure_utc(self.scheduled_start)
        self.scheduled_end = ensure_utc(self.scheduled_end)

        if self.scheduled_end <= self.scheduled_start:
            raise ValueError(
                f"Train scheduled end time ({self.scheduled_end}) must be after scheduled start time ({self.scheduled_start})"
            )
        return self


class TrainScheduleCreate(TrainScheduleBase):
    id: Optional[str] = None


class TrainScheduleResponse(TrainScheduleBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
