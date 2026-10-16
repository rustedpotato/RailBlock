from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field


class AvailabilityStatusEnum(str, Enum):
    OPERATIONAL = "OPERATIONAL"
    DEGRADED = "DEGRADED"
    MAINTENANCE_REQUIRED = "MAINTENANCE_REQUIRED"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"


class AssetBase(BaseModel):
    name: str = Field(..., max_length=128)
    asset_type: str = Field(..., max_length=64, description="Type: TRACK_SEGMENT, OHE_LINE, POINT_MACHINE, etc.")
    corridor_id: str = Field(..., description="Corridor reference ID")
    department: str = Field(..., description="Responsible department")
    availability_status: AvailabilityStatusEnum = Field(
        AvailabilityStatusEnum.OPERATIONAL,
        description="Current operational status"
    )
    location_km: Optional[float] = Field(None, ge=0.0, description="Corridor kilometer mark")


class AssetCreate(AssetBase):
    id: str = Field(..., description="Unique asset identifier (e.g. AST-TRK-101)")


class AssetResponse(AssetBase):
    id: str

    class Config:
        from_attributes = True
