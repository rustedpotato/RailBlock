import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, status
from pydantic import BaseModel
from app.core.ws_manager import ws_manager
from app.services.live_telemetry_engine import telemetry_engine

logger = logging.getLogger("railblock-realtime-route")

router = APIRouter(tags=["Real-Time Railway Telemetry"])


class EmergencyDefectRequest(BaseModel):
    section: str = "Mumbai Central – Bandra Fast"
    description: str = "Severe transverse rail flaw detected at KM 14/18"


class TrainDelayRequest(BaseModel):
    train_number: str = "12951"
    delay_minutes: int = 25


@router.get("/api/realtime/snapshot", summary="Get Current Real-Time Railway Telemetry Snapshot")
def get_snapshot():
    """
    Returns current active trains, block section occupancies, signal aspects,
    and recent activity events without requiring a persistent WebSocket connection.
    """
    return telemetry_engine.get_snapshot()


@router.post("/api/realtime/trigger-defect", summary="Trigger Simulated Emergency Track Flaw")
async def trigger_defect(req: EmergencyDefectRequest):
    """
    Simulates a live track-circuit or USFD flaw alert, immediately imposing a speed
    restriction and broadcasting the incident to all connected clients.
    """
    event = telemetry_engine.trigger_emergency_defect(req.section, req.description)
    await ws_manager.broadcast({
        "type": "EMERGENCY_ALERT",
        "data": event,
        "snapshot": telemetry_engine.get_snapshot()
    })
    return {"status": "SUCCESS", "event": event}


@router.post("/api/realtime/trigger-delay", summary="Simulate Train Delay")
async def trigger_delay(req: TrainDelayRequest):
    """
    Simulates an unexpected express passenger train delay, prompting automated
    block window recalculation and clash detection.
    """
    event = telemetry_engine.trigger_train_delay(req.train_number, req.delay_minutes)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Train number '{req.train_number}' not found in active roster."
        )

    await ws_manager.broadcast({
        "type": "TRAIN_DELAY_ALERT",
        "data": event,
        "snapshot": telemetry_engine.get_snapshot()
    })
    return {"status": "SUCCESS", "event": event}


@router.websocket("/ws/live")
async def websocket_live_feed(websocket: WebSocket):
    """
    WebSocket endpoint streaming live 2-second train telemetry packets,
    signal aspects, and occupancy status.
    """
    await ws_manager.connect(websocket)
    try:
        # Send initial full state immediately upon connect
        await websocket.send_json({
            "type": "INITIAL_SNAPSHOT",
            "data": telemetry_engine.get_snapshot()
        })

        while True:
            # Keep connection alive & handle any incoming messages from client
            client_msg = await websocket.receive_text()
            if client_msg == "ping":
                await websocket.send_text("pong")
            elif client_msg == "request_snapshot":
                await websocket.send_json({
                    "type": "INITIAL_SNAPSHOT",
                    "data": telemetry_engine.get_snapshot()
                })
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)
    except Exception as exc:
        logger.warning(f"WebSocket client error: {exc}")
        await ws_manager.disconnect(websocket)
