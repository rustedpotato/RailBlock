from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class DatabaseStatus(BaseModel):
    status: str = Field(..., description="Database connection health state ('connected' or 'disconnected')")
    engine: str = Field(..., description="Configured database engine type (e.g. 'sqlite', 'postgresql')")
    details: Optional[str] = Field(None, description="Additional status message or error details")


class HealthResponse(BaseModel):
    status: str = Field(..., description="Overall backend health status ('healthy' or 'degraded')")
    app_name: str = Field(..., description="Application name")
    version: str = Field("0.1.0", description="API version")
    environment: str = Field(..., description="Active runtime environment")
    timestamp: datetime = Field(..., description="UTC timestamp of the health check probe")
    database: DatabaseStatus = Field(..., description="Health status of the persistence layer")
    services: Dict[str, str] = Field(
        default_factory=lambda: {
            "prioritization_engine": "operational",
            "conflict_detection": "operational",
            "or_tools_solver": "ready"
        },
        description="Internal subsystem operational states"
    )
