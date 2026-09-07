from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.alert import AlertResponse, AlertCreate, AlertAcknowledgeRequest
from app.services.alert_service import (
    create_alert,
    get_alerts_by_mine,
    acknowledge_alert,
    resolve_alert,
)

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/{mine_site_id}", response_model=List[AlertResponse], summary="List all alerts for mine site")
def list_alerts(mine_site_id: str, db: Session = Depends(get_db)):
    return get_alerts_by_mine(db, mine_site_id, active_only=False)


@router.get("/{mine_site_id}/active", response_model=List[AlertResponse], summary="List active alerts for mine site")
def list_active_alerts(mine_site_id: str, db: Session = Depends(get_db)):
    return get_alerts_by_mine(db, mine_site_id, active_only=True)


@router.post("/", response_model=AlertResponse, summary="Create new alert")
def post_alert(alert_in: AlertCreate, db: Session = Depends(get_db)):
    return create_alert(db, alert_in)


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse, summary="Acknowledge active alert")
def acknowledge(alert_id: str, body: AlertAcknowledgeRequest = AlertAcknowledgeRequest(), db: Session = Depends(get_db)):
    alert = acknowledge_alert(db, alert_id, body.acknowledged_by or "Operator")
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/{alert_id}/resolve", response_model=AlertResponse, summary="Resolve alert")
def resolve(alert_id: str, db: Session = Depends(get_db)):
    alert = resolve_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
