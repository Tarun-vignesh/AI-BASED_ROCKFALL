from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.schemas.alert import AlertCreate


def create_alert(db: Session, alert_in: AlertCreate) -> Alert:
    alert = Alert(
        mine_site_id=alert_in.mine_site_id,
        risk_assessment_id=alert_in.risk_assessment_id,
        alert_type=alert_in.alert_type,
        severity=alert_in.severity,
        title=alert_in.title,
        description=alert_in.description,
        affected_areas=alert_in.affected_areas,
        action_required=alert_in.action_required,
        status="active",
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def check_and_trigger_risk_alert(db: Session, mine_site_id: str, risk_probability: float, risk_details: dict) -> Optional[Alert]:
    if risk_probability >= 0.80:
        severity = "critical"
        alert_type = "critical_rockfall_hazard"
        title = "CRITICAL ROCKFALL HAZARD DETECTED"
        desc = f"Probability exceeds 80% ({risk_probability * 100:.1f}%). High slope displacement and severe monsoon saturation."
        action = "Evacuate Bench level immediately. Cease haulage operations."
    elif risk_probability >= 0.60:
        severity = "high"
        alert_type = "high_rockfall_warning"
        title = "High Slope Deformation Warning"
        desc = f"Probability reaches {risk_probability * 100:.1f}%. Elevated extensometer displacement."
        action = "Inspect slope crest for tension cracks. Restrict access."
    elif risk_probability >= 0.30:
        severity = "moderate"
        alert_type = "moderate_slope_advisory"
        title = "Slope Stability Advisory"
        desc = f"Moderate risk score ({risk_probability * 100:.1f}%). Increased moisture levels."
        action = "Routine inspection during shift change."
    else:
        return None

    # Check if active alert already exists for same site within last hour
    recent_alert = (
        db.query(Alert)
        .filter(Alert.mine_site_id == mine_site_id, Alert.status == "active", Alert.severity == severity)
        .first()
    )
    if recent_alert:
        return recent_alert

    alert_in = AlertCreate(
        mine_site_id=mine_site_id,
        alert_type=alert_type,
        severity=severity,
        title=title,
        description=desc,
        affected_areas=risk_details.get("affected_zones", ["North Wall Bench 3"]),
        action_required=action,
    )
    return create_alert(db, alert_in)


def get_alerts_by_mine(db: Session, mine_site_id: str, active_only: bool = False) -> List[Alert]:
    query = db.query(Alert).filter(Alert.mine_site_id == mine_site_id)
    if active_only:
        query = query.filter(Alert.status == "active")
    return query.order_by(Alert.created_at.desc()).all()


def acknowledge_alert(db: Session, alert_id: str, user_name: str) -> Optional[Alert]:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.status = "acknowledged"
        alert.acknowledged_by = user_name
        alert.acknowledged_at = datetime.utcnow()
        db.commit()
        db.refresh(alert)
    return alert


def resolve_alert(db: Session, alert_id: str) -> Optional[Alert]:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.status = "resolved"
        alert.resolved_at = datetime.utcnow()
        db.commit()
        db.refresh(alert)
    return alert
