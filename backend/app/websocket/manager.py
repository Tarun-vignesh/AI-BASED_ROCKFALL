import json
from typing import Dict, List
from fastapi import WebSocket
from app.core.logging_config import logger


class ConnectionManager:
    def __init__(self):
        # mine_site_id -> list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, mine_site_id: str):
        await websocket.accept()
        if mine_site_id not in self.active_connections:
            self.active_connections[mine_site_id] = []
        self.active_connections[mine_site_id].append(websocket)
        logger.info(f"WebSocket connected for mine_site_id: {mine_site_id}")

    def disconnect(self, websocket: WebSocket, mine_site_id: str):
        if mine_site_id in self.active_connections:
            if websocket in self.active_connections[mine_site_id]:
                self.active_connections[mine_site_id].remove(websocket)
            if not self.active_connections[mine_site_id]:
                del self.active_connections[mine_site_id]
        logger.info(f"WebSocket disconnected for mine_site_id: {mine_site_id}")

    async def broadcast_to_mine(self, mine_site_id: str, message: dict):
        if mine_site_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[mine_site_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.warning(f"Error sending WebSocket message: {e}")
                    dead_connections.append(connection)

            for dead in dead_connections:
                self.disconnect(dead, mine_site_id)


ws_manager = ConnectionManager()
