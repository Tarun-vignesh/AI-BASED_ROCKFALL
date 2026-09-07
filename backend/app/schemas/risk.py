from datetime import datetime
from typing import Optional, Any, Dict, List
from pydantic import BaseModel, ConfigDict


class RiskZoneMapItem(BaseModel):
    zone: str
    latitude: float
    longitude: float
    risk_probability: float
    risk_level: str
    confidence: float
    affected_area: str
    last_updated: datetime


class RiskAssessmentResponse(BaseModel):
    id: str
    mine_site_id: str
    assessment_type: str
    risk_level: str
    probability: float
    confidence: float
    affected_zones: Optional[List[str]] = None
    prediction_data: Optional[Dict[str, Any]] = None
    valid_from: datetime
    valid_until: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
