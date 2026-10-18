import asyncio
import json
import logging
from typing import Set, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("railblock-ws")


class ConnectionManager:
    """Manages active WebSocket connections for live railway telemetry broadcasting."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total active clients: {len(self.active_connections)}")

    async def disconnect(self, websocket: WebSocket):
        async with self._lock:
            self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total active clients: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcasts a JSON message to all connected clients."""
        if not self.active_connections:
            return

        payload = json.dumps(message)
        to_remove = set()

        async with self._lock:
            for connection in self.active_connections:
                try:
                    await connection.send_text(payload)
                except Exception as exc:
                    logger.warning(f"Failed to send to client: {exc}")
                    to_remove.add(connection)

            for dead_conn in to_remove:
                self.active_connections.discard(dead_conn)


ws_manager = ConnectionManager()
