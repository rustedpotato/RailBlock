from app.api.routes.health import router as health_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.tasks import router as tasks_router
from app.api.routes.assets import router as assets_router
from app.api.routes.trains import router as trains_router
from app.api.routes.block_windows import router as block_windows_router
from app.api.routes.schedules import router as schedules_router
from app.api.routes.realtime import router as realtime_router
from app.api.routes.corridors import router as corridors_router
from app.api.routes.pipeline import router as pipeline_router
from app.api.routes.ingest import router as ingest_router
from app.api.routes.dispatch import router as dispatch_router

__all__ = [
    "health_router",
    "dashboard_router",
    "tasks_router",
    "assets_router",
    "trains_router",
    "block_windows_router",
    "schedules_router",
    "realtime_router",
    "corridors_router",
    "pipeline_router",
    "ingest_router",
    "dispatch_router",
]