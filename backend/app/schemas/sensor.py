from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class SensorStationBase(BaseModel):
    mine_site_id: str
    station_name: str
    sensor_type: str
    location: Dict[str, Any]
    configuration: Optional[Dict[str, Any]] = None
    status: Optional[str] = "active"


class SensorStationCreate(SensorStationBase):
    pass


class SensorStationResponse(SensorStationBase):
    id: str
    last_reading_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SensorDataCreate(BaseModel):
    sensor_station_id: str
    data_type: str
    value: Optional[float] = None
    unit: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None
    quality_score: Optional[float] = 1.0
    timestamp: Optional[datetime] = None


class SensorDataResponse(SensorDataCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
