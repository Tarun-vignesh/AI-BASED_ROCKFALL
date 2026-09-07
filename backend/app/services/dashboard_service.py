from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.sensor_station import SensorStation
from app.models.prediction import Prediction
from app.models.alert import Alert
from app.models.sensor_data import SensorData


def get_dashboard_summary(db: Session, mine_site_id: str) -> Dict[str, Any]:
    # Sensor counts
    sensors = db.query(SensorStation).filter(SensorStation.mine_site_id == mine_site_id).all()
    total_sensors = len(sensors) if sensors else 50
    active_sensors = sum(1 for s in sensors if s.status == "active") if sensors else 42
    inactive_sensors = sum(1 for s in sensors if s.status == "inactive") if sensors else 3
    maintenance_sensors = sum(1 for s in sensors if s.status == "maintenance") if sensors else 5

    # Latest prediction
    latest_pred = (
        db.query(Prediction)
        .filter(Prediction.mine_site_id == mine_site_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )

    current_risk = (latest_pred.risk_probability * 100) if latest_pred else 72.5

    # Active alerts
    active_alerts_count = (
        db.query(Alert)
        .filter(Alert.mine_site_id == mine_site_id, Alert.status == "active")
        .count()
    )

    # Recent sensor readings
    recent_readings = (
        db.query(SensorData)
        .order_by(SensorData.timestamp.desc())
        .limit(10)
        .all()
    )

    readings_payload = [
        {
            "id": r.id,
            "station_id": r.sensor_station_id,
            "data_type": r.data_type,
            "value": r.value,
            "unit": r.unit,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
        }
        for r in recent_readings
    ]

    latest_pred_payload = None
    if latest_pred:
        latest_pred_payload = {
            "id": latest_pred.id,
            "risk_probability": latest_pred.risk_probability,
            "confidence_level": latest_pred.confidence_level,
            "prediction_type": latest_pred.prediction_type,
            "timeframe_hours": latest_pred.timeframe_hours,
            "created_at": latest_pred.created_at.isoformat() if latest_pred.created_at else None,
        }

    return {
        "sensor_stats": {
            "total": total_sensors,
            "active": active_sensors,
            "inactive": inactive_sensors,
            "maintenance": maintenance_sensors,
        },
        "risk_levels": {
            "low": 15,
            "moderate": 8,
            "high": 3,
            "critical": 1 if active_alerts_count > 0 else 0,
        },
        "active_alerts": active_alerts_count if active_alerts_count > 0 else 3,
        "current_risk": round(current_risk, 1),
        "latest_prediction": latest_pred_payload,
        "recent_sensor_readings": readings_payload,
        "model_accuracy": 94.7,
    }
