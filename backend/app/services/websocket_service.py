from datetime import datetime
from app.websocket.manager import ws_manager


async def broadcast_sensor_update(mine_site_id: str, sensor_data: dict):
    payload = {
        "type": "sensor_update",
        "mine_site_id": mine_site_id,
        "timestamp": datetime.utcnow().isoformat(),
        "data": sensor_data,
    }
    await ws_manager.broadcast_to_mine(mine_site_id, payload)


async def broadcast_prediction_update(mine_site_id: str, prediction_data: dict):
    payload = {
        "type": "prediction_update",
        "mine_site_id": mine_site_id,
        "timestamp": datetime.utcnow().isoformat(),
        "prediction": prediction_data,
    }
    await ws_manager.broadcast_to_mine(mine_site_id, payload)


async def broadcast_alert_event(mine_site_id: str, alert_data: dict):
    payload = {
        "type": "alert",
        "mine_site_id": mine_site_id,
        "timestamp": datetime.utcnow().isoformat(),
        "alert": alert_data,
    }
    await ws_manager.broadcast_to_mine(mine_site_id, payload)
