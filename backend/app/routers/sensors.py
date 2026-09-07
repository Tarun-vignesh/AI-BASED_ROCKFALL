from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.sensor import SensorStationResponse, SensorDataCreate, SensorDataResponse
from app.services.sensor_service import (
    get_sensors_by_mine,
    get_sensor_by_id,
    record_sensor_data,
    get_sensor_history,
)

router = APIRouter(prefix="/sensors", tags=["Sensors"])


@router.get("/", response_model=List[SensorStationResponse], summary="Get sensors by mine site")
def list_sensors(mine_site_id: str = "ms-001-demo-mine", db: Session = Depends(get_db)):
    return get_sensors_by_mine(db, mine_site_id)


@router.get("/{sensor_id}", response_model=SensorStationResponse, summary="Get sensor details")
def get_sensor(sensor_id: str, db: Session = Depends(get_db)):
    sensor = get_sensor_by_id(db, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor station not found")
    return sensor


@router.post("/data", response_model=SensorDataResponse, summary="Record new sensor telemetry reading")
def post_sensor_data(data_in: SensorDataCreate, db: Session = Depends(get_db)):
    return record_sensor_data(db, data_in)


@router.get("/{sensor_id}/history", response_model=List[SensorDataResponse], summary="Get historical telemetry for sensor")
def sensor_history(sensor_id: str, limit: int = 100, db: Session = Depends(get_db)):
    return get_sensor_history(db, sensor_id, limit=limit)


@router.get("/mine-site/{mine_site_id}", response_model=List[SensorStationResponse], summary="Get sensors by mine site path")
def sensors_by_mine_path(mine_site_id: str, db: Session = Depends(get_db)):
    return get_sensors_by_mine(db, mine_site_id)
