from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.prediction_service import (
    generate_and_save_prediction,
    get_predictions_by_mine,
    get_latest_prediction,
)
from app.services.alert_service import check_and_trigger_risk_alert

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/predict", summary="Run rockfall risk prediction engine")
def predict_risk(request: PredictionRequest, db: Session = Depends(get_db)):
    prediction = generate_and_save_prediction(db, request)
    
    # Check if threshold triggers alert
    alert = check_and_trigger_risk_alert(
        db=db,
        mine_site_id=request.mine_site_id,
        risk_probability=prediction.risk_probability,
        risk_details={"affected_zones": ["North Wall Bench 3"]}
    )

    return {
        "prediction_id": prediction.id,
        "mine_site_id": prediction.mine_site_id,
        "risk_probability": prediction.risk_probability,
        "confidence_level": prediction.confidence_level,
        "risk_level": "CRITICAL" if prediction.risk_probability >= 0.8 else ("HIGH" if prediction.risk_probability >= 0.6 else ("MODERATE" if prediction.risk_probability >= 0.3 else "LOW")),
        "timeframe_hours": prediction.timeframe_hours,
        "alert_triggered": prediction.alert_triggered,
        "alert_id": alert.id if alert else None,
        "created_at": prediction.created_at,
    }


@router.get("/{mine_site_id}", summary="Get recent predictions for mine site")
def list_predictions(mine_site_id: str, limit: int = 50, db: Session = Depends(get_db)):
    return get_predictions_by_mine(db, mine_site_id, limit=limit)


@router.get("/{mine_site_id}/latest", summary="Get latest prediction for mine site")
def latest_prediction(mine_site_id: str, db: Session = Depends(get_db)):
    pred = get_latest_prediction(db, mine_site_id)
    if not pred:
        return {
            "mine_site_id": mine_site_id,
            "risk_probability": 0.725,
            "confidence_level": 0.89,
            "risk_level": "HIGH",
            "timeframe_hours": 12,
        }
    return pred


@router.get("/{mine_site_id}/history", summary="Get historical prediction logs")
def prediction_history(mine_site_id: str, db: Session = Depends(get_db)):
    return get_predictions_by_mine(db, mine_site_id, limit=100)


@router.get("/{mine_site_id}/statistics", summary="Get prediction statistics summary")
def prediction_statistics(mine_site_id: str, db: Session = Depends(get_db)):
    preds = get_predictions_by_mine(db, mine_site_id, limit=100)
    avg_risk = sum(p.risk_probability for p in preds) / len(preds) if preds else 0.45
    avg_conf = sum(p.confidence_level for p in preds) / len(preds) if preds else 0.88
    return {
        "mine_site_id": mine_site_id,
        "total_predictions": len(preds),
        "average_risk_probability": round(avg_risk, 3),
        "average_confidence": round(avg_conf, 3),
        "high_risk_count": sum(1 for p in preds if p.risk_probability >= 0.6),
    }
