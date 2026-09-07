from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.sensor_station import SensorStation
from app.models.sensor_data import SensorData
from app.schemas.sensor import SensorDataCreate


def get_sensors_by_mine(db: Session, mine_site_id: str) -> List[SensorStation]:
    return db.query(SensorStation).filter(SensorStation.mine_site_id == mine_site_id).all()


def get_sensor_by_id(db: Session, sensor_id: str) -> Optional[SensorStation]:
    return db.query(SensorStation).filter(SensorStation.id == sensor_id).first()


def record_sensor_data(db: Session, data_in: SensorDataCreate) -> SensorData:
    station = db.query(SensorStation).filter(SensorStation.id == data_in.sensor_station_id).first()
    if station:
        station.last_reading_at = datetime.utcnow()

    sensor_data = SensorData(
        sensor_station_id=data_in.sensor_station_id,
        data_type=data_in.data_type,
        value=data_in.value,
        unit=data_in.unit,
        raw_data=data_in.raw_data,
        quality_score=data_in.quality_score or 1.0,
        timestamp=data_in.timestamp or datetime.utcnow(),
    )
    db.add(sensor_data)
    db.commit()
    db.refresh(sensor_data)
    return sensor_data


def get_sensor_history(db: Session, sensor_id: str, limit: int = 100) -> List[SensorData]:
    return (
        db.query(SensorData)
        .filter(SensorData.sensor_station_id == sensor_id)
        .order_by(SensorData.timestamp.desc())
        .limit(limit)
        .all()
    )
