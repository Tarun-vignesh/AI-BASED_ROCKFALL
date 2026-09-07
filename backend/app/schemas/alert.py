from datetime import datetime
from typing import Optional, Any, Dict, List
from pydantic import BaseModel, ConfigDict


class AlertCreate(BaseModel):
    mine_site_id: str
    risk_assessment_id: Optional[str] = None
    alert_type: str
    severity: str
    title: str
    description: str
    affected_areas: Optional[List[str]] = None
    action_required: Optional[str] = None


class AlertResponse(AlertCreate):
    id: str
    status: str
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertAcknowledgeRequest(BaseModel):
    acknowledged_by: Optional[str] = "Operator"
