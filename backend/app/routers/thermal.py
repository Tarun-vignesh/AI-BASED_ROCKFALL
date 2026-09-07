from typing import Dict, Any, List
from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db

router = APIRouter(prefix="/thermal", tags=["Thermal Telemetry"])


class ThermalPayload(BaseModel):
    mine_site_id: str = "ms-001-demo-mine"
    average_temperature: float
    max_temperature: float
    hot_spots: int
    thermal_anomaly: bool


@router.post("/data", summary="Record thermal monitoring reading")
def post_thermal(payload: ThermalPayload, db: Session = Depends(get_db)):
    return {
        "status": "recorded",
        "timestamp": datetime.utcnow().isoformat(),
        "payload": payload.model_dump(),
    }


@router.get("/{mine_site_id}/latest", summary="Get latest thermal reading")
def get_latest_thermal(mine_site_id: str):
    return {
        "mine_site_id": mine_site_id,
        "average_temperature": 36.4,
        "max_temperature": 48.2,
        "hot_spots": 2,
        "thermal_anomaly": False,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/{mine_site_id}/history", summary="Get historical thermal readings")
def get_thermal_history(mine_site_id: str):
    return [
        {"timestamp": "08:00", "avg_temp": 32.1, "max_temp": 41.5, "hot_spots": 0},
        {"timestamp": "12:00", "avg_temp": 38.5, "max_temp": 49.1, "hot_spots": 2},
        {"timestamp": "16:00", "avg_temp": 36.0, "max_temp": 46.3, "hot_spots": 1},
    ]
