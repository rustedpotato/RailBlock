import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.routes import (
    health_router,
    dashboard_router,
    tasks_router,
    assets_router,
    trains_router,
    block_windows_router,
    schedules_router,
    realtime_router,
    corridors_router,
    pipeline_router,
    ingest_router,
    dispatch_router,
)
from app.services.live_telemetry_engine import telemetry_engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("railblock-backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown routines."""
    logger.info("Initializing RailBlock AI database schema...")
    try:
        # Import models so Base.metadata knows about all tables
        import app.models  # noqa
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as exc:
        logger.error(f"Error during database initialization: {exc}")
    
    # Start live railway telemetry engine
    await telemetry_engine.start()
    
    yield
    
    # Stop live railway telemetry engine
    await telemetry_engine.stop()
    logger.info("Shutting down RailBlock AI Backend.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.2.0",
    description=(
        "SIH26027 â€” AI-Powered Automatic Block Planning to Maximize "
        "Asset Availability for Train Operations on Indian Railways.\n\n"
        "**DISCLAIMER:** Research prototype decision-support tool. "
        "All generated maintenance blocks require authorized railway controller validation."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if isinstance(settings.BACKEND_CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Root Health Route
app.include_router(health_router, prefix="")

# Register /api routes matching exact required paths
api_routers = [
    health_router,
    dashboard_router,
    tasks_router,
    assets_router,
    trains_router,
    block_windows_router,
    schedules_router,
    corridors_router,
    pipeline_router,
    ingest_router,
    dispatch_router,
]

for r in api_routers:
    app.include_router(r, prefix="/api")
    app.include_router(r, prefix=settings.API_V1_STR)

# Register Real-Time Telemetry and WebSocket routes
app.include_router(realtime_router)


import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Locate built frontend dist directory
possible_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "..", "frontend", "dist")),
]
frontend_dist = next((p for p in possible_dist_paths if os.path.isdir(p)), None)

if frontend_dist:
    logger.info(f"Serving built React frontend from: {frontend_dist}")
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend SPA"])
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith(("api", "ws", "docs", "redoc", "openapi.json")):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    logger.info("Frontend dist not found. Operating in API-only mode.")

    @app.get("/", tags=["System"])
    def root_info():
        """Root info endpoint providing basic API orientation."""
        return {
            "project": settings.PROJECT_NAME,
            "problem_statement": "SIH26027",
            "description": "AI-Powered Automatic Block Planning for Indian Railways",
            "docs_url": "/docs",
            "health_check": "/api/health",
            "dashboard_summary": "/api/dashboard/summary",
            "tasks_endpoint": "/api/tasks",
            "schedules_endpoint": "/api/schedules"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
