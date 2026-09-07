from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.prediction import Prediction
from app.models.risk_assessment import RiskAssessment
from app.models.ai_model import AIModel
from app.ml.predictor import predict_rockfall_risk
from app.schemas.prediction import PredictionRequest


def generate_and_save_prediction(db: Session, request: PredictionRequest) -> Prediction:
    active_model = db.query(AIModel).filter(AIModel.active == True).first()
    model_id = active_model.id if active_model else None

    result = predict_rockfall_risk(
        sensor_data=request.sensor_data,
        weather_data=request.weather_data,
        indian_conditions=request.indian_conditions,
    )

    risk_prob = result["risk_probability"]
    confidence = result["confidence_level"]
    risk_level = result["risk_level"]
    timeframe = result["timeframe_hours"]

    alert_triggered = risk_prob >= 0.60

    prediction = Prediction(
        mine_site_id=request.mine_site_id,
        model_id=model_id,
        prediction_type="rockfall_risk",
        risk_probability=risk_prob,
        confidence_level=confidence,
        affected_coordinates=request.sensor_data.get("location") if request.sensor_data else {"latitude": 15.1435, "longitude": 76.9225},
        indian_factors=result["indian_specific_factors"],
        raw_data_sources={"sensor": request.sensor_data, "weather": request.weather_data},
        timeframe_hours=timeframe,
        alert_triggered=alert_triggered,
        valid_until=datetime.utcnow() + timedelta(hours=timeframe),
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # Save corresponding RiskAssessment
    risk_assessment = RiskAssessment(
        mine_site_id=request.mine_site_id,
        assessment_type="automated_ml_pipeline",
        risk_level=risk_level,
        probability=risk_prob,
        confidence=confidence,
        affected_zones=["North Wall Bench 3", "East Dump Wall"] if risk_prob > 0.5 else ["South Crest"],
        prediction_data=result,
        valid_from=datetime.utcnow(),
        valid_until=datetime.utcnow() + timedelta(hours=timeframe),
    )
    db.add(risk_assessment)
    db.commit()

    return prediction


def get_predictions_by_mine(db: Session, mine_site_id: str, limit: int = 50) -> List[Prediction]:
    return (
        db.query(Prediction)
        .filter(Prediction.mine_site_id == mine_site_id)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
        .all()
    )


def get_latest_prediction(db: Session, mine_site_id: str) -> Optional[Prediction]:
    return (
        db.query(Prediction)
        .filter(Prediction.mine_site_id == mine_site_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )
