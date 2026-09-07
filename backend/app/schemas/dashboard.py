from typing import Optional, Any, Dict, List
from pydantic import BaseModel


class SensorStats(BaseModel):
    total: int
    active: int
    inactive: int
    maintenance: int


class RiskLevels(BaseModel):
    low: int
    moderate: int
    high: int
    critical: int


class DashboardSummaryResponse(BaseModel):
    sensor_stats: SensorStats
    risk_levels: RiskLevels
    active_alerts: int
    current_risk: float
    latest_prediction: Optional[Dict[str, Any]] = None
    recent_sensor_readings: List[Dict[str, Any]] = []
    model_accuracy: float = 94.7
