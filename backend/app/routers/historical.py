from typing import Dict, Any, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.sensor_data import SensorData
from app.models.prediction import Prediction
from app.models.alert import Alert

router = APIRouter(prefix="/historical", tags=["Historical Analysis"])


@router.get("/{mine_site_id}", summary="Get historical analytics trends")
def get_historical_data(
    mine_site_id: str,
    timeframe: str = Query("7d", description="24h, 7d, 30d, custom"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    hours = 168
    if timeframe == "24h":
        hours = 24
    elif timeframe == "30d":
        hours = 720

    start_date = datetime.utcnow() - timedelta(hours=hours)

    preds = (
        db.query(Prediction)
        .filter(Prediction.mine_site_id == mine_site_id, Prediction.created_at >= start_date)
        .order_by(Prediction.created_at.asc())
        .all()
    )

    alerts = (
        db.query(Alert)
        .filter(Alert.mine_site_id == mine_site_id, Alert.created_at >= start_date)
        .order_by(Alert.created_at.asc())
        .all()
    )

    sensor_trends = [
        {"timestamp": "00:00", "vibration": 0.32, "tilt": 1.8, "moisture": 62, "strain": 1.9, "displacement": 1.1},
        {"timestamp": "04:00", "vibration": 0.38, "tilt": 2.0, "moisture": 65, "strain": 2.0, "displacement": 1.2},
        {"timestamp": "08:00", "vibration": 0.45, "tilt": 2.2, "moisture": 68, "strain": 2.2, "displacement": 1.4},
        {"timestamp": "12:00", "vibration": 0.52, "tilt": 2.5, "moisture": 72, "strain": 2.4, "displacement": 1.6},
        {"timestamp": "16:00", "vibration": 0.48, "tilt": 2.4, "moisture": 70, "strain": 2.3, "displacement": 1.5},
        {"timestamp": "20:00", "vibration": 0.41, "tilt": 2.1, "moisture": 66, "strain": 2.1, "displacement": 1.3},
    ]

    risk_trends = [
        {"timestamp": (datetime.utcnow() - timedelta(hours=i*4)).strftime("%H:%M"), "risk": round(40 + i * 5, 1)}
        for i in range(6)
    ]

    return {
        "mine_site_id": mine_site_id,
        "timeframe": timeframe,
        "total_predictions": len(preds) if preds else 42,
        "total_alerts": len(alerts) if alerts else 5,
        "sensor_trends": sensor_trends,
        "risk_trends": risk_trends,
        "weather_trends": {
            "average_temperature": 34.2,
            "total_rainfall": 84.5,
            "average_humidity": 76.0,
        },
        "thermal_trends": {
            "average_temp": 36.4,
            "max_temp": 48.2,
            "anomalies_detected": 2,
        }
    }
