from datetime import datetime
from typing import Optional, Any, Dict, List
from pydantic import BaseModel, ConfigDict


class PredictionRequest(BaseModel):
    mine_site_id: str
    sensor_data: Optional[Dict[str, Any]] = None
    weather_data: Optional[Dict[str, Any]] = None
    indian_conditions: Optional[Dict[str, Any]] = None


class PredictionResponse(BaseModel):
    prediction_id: str
    mine_site_id: str
    risk_probability: float
    confidence_level: float
    risk_level: str
    risk_factors: List[str]
    recommendations: List[str]
    timeframe_hours: int
    indian_specific_factors: List[str]
    affected_coordinates: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
