from typing import Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.real_time_stream import RealTimeStream
from app.services.prediction_service import generate_and_save_prediction
from app.services.alert_service import check_and_trigger_risk_alert
from app.schemas.prediction import PredictionRequest

router = APIRouter(prefix="/data", tags=["Data Ingestion"])


class IngestionRequest(BaseModel):
    streamType: str = "sensor"
    mineSiteId: str = "ms-001-demo-mine"
    data: Dict[str, Any]
    source: str = "simulator_sensor"
    indianConditions: Dict[str, Any] = None


@router.post("/ingestion", summary="Ingest real-time sensor & environmental stream payload")
def ingest_data(payload: IngestionRequest, db: Session = Depends(get_db)):
    mine_site_id = payload.mineSiteId
    
    # Store stream payload
    stream_record = RealTimeStream(
        mine_site_id=mine_site_id,
        stream_type=payload.streamType,
        stream_source=payload.source,
        data_payload=payload.data,
        indian_conditions=payload.indianConditions,
        processed_by_ai=True,
    )
    db.add(stream_record)
    db.commit()

    # Trigger prediction pipeline
    pred_req = PredictionRequest(
        mine_site_id=mine_site_id,
        sensor_data=payload.data,
        weather_data={"rainfall": payload.data.get("rainfall", 25.0)},
        indian_conditions=payload.indianConditions,
    )
    prediction = generate_and_save_prediction(db, pred_req)

    # Check alert threshold
    alert = check_and_trigger_risk_alert(
        db, mine_site_id, prediction.risk_probability, {"affected_zones": ["Bench 3"]}
    )

    return {
        "status": "success",
        "stream_id": stream_record.id,
        "prediction_id": prediction.id,
        "risk_probability": prediction.risk_probability,
        "risk_level": "HIGH" if prediction.risk_probability >= 0.6 else "MODERATE",
        "alert_triggered": alert is not None,
    }
