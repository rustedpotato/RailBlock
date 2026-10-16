from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.db.session import get_db
from app.schemas.health import HealthResponse, DatabaseStatus

router = APIRouter(tags=["Health & Status"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="System Health & Diagnostic Check",
    description="Returns backend liveness, runtime metadata, database connectivity, and subsystem statuses."
)
def check_health(db: Session = Depends(get_db)) -> HealthResponse:
    # Determine DB engine type
    engine_name = "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql"
    
    # Test DB connectivity
    db_connected = False
    details = None
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
        details = "Connection pool active and responding"
    except Exception as exc:
        db_connected = False
        details = f"Connection check failed: {str(exc)}"

    db_status = DatabaseStatus(
        status="connected" if db_connected else "disconnected",
        engine=engine_name,
        details=details
    )

    overall_status = "healthy" if db_connected else "degraded"

    return HealthResponse(
        status=overall_status,
        app_name=settings.PROJECT_NAME,
        version="0.1.0",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
        database=db_status,
        services={
            "prioritization_engine": "operational",
            "conflict_detection": "operational",
            "or_tools_solver": "ready"
        }
    )
