from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.risk_assessment import RiskAssessment
from app.models.prediction import Prediction


def get_risk_map_data(db: Session, mine_site_id: str) -> List[Dict[str, Any]]:
    latest_pred = (
        db.query(Prediction)
        .filter(Prediction.mine_site_id == mine_site_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )

    base_prob = latest_pred.risk_probability if latest_pred else 0.42
    base_conf = latest_pred.confidence_level if latest_pred else 0.88

    # Grid of risk zones across open pit mine site
    zones = [
        {
            "zone": "North Highwall Bench 3",
            "latitude": 15.1445,
            "longitude": 76.9215,
            "risk_probability": round(min(1.0, base_prob * 1.1), 3),
            "risk_level": "HIGH" if base_prob * 1.1 >= 0.6 else "MODERATE",
            "confidence": round(base_conf, 3),
            "affected_area": "Bench 3 Crest & Haul Road Ramp A",
            "last_updated": datetime.utcnow().isoformat(),
        },
        {
            "zone": "East Waste Dump Wall",
            "latitude": 15.1430,
            "longitude": 76.9240,
            "risk_probability": round(min(1.0, base_prob * 0.85), 3),
            "risk_level": "MODERATE" if base_prob * 0.85 >= 0.3 else "LOW",
            "confidence": round(base_conf, 3),
            "affected_area": "East Perimeter Channel",
            "last_updated": datetime.utcnow().isoformat(),
        },
        {
            "zone": "South Pit Ramp & Crusher Area",
            "latitude": 15.1410,
            "longitude": 76.9210,
            "risk_probability": round(max(0.05, base_prob * 0.4), 3),
            "risk_level": "LOW",
            "confidence": 0.95,
            "affected_area": "Crusher Access Point",
            "last_updated": datetime.utcnow().isoformat(),
        },
        {
            "zone": "West Slope Overburden Dump",
            "latitude": 15.1450,
            "longitude": 76.9195,
            "risk_probability": round(min(1.0, base_prob * 1.25), 3),
            "risk_level": "CRITICAL" if base_prob * 1.25 >= 0.8 else ("HIGH" if base_prob * 1.25 >= 0.6 else "MODERATE"),
            "confidence": round(base_conf * 0.95, 3),
            "affected_area": "Upper Tailings & Slope Toe",
            "last_updated": datetime.utcnow().isoformat(),
        },
    ]

    return zones
