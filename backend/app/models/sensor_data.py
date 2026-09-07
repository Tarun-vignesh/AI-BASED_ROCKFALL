import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, JSON, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.database import Base


class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sensor_station_id = Column(String(36), ForeignKey("sensor_stations.id", ondelete="CASCADE"), nullable=False)
    data_type = Column(String(100), nullable=False)
    value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    raw_data = Column(JSON, nullable=True)
    quality_score = Column(Float, default=1.0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    sensor_station = relationship("SensorStation", back_populates="sensor_data")

    __table_args__ = (
        Index("idx_sensor_station_timestamp", "sensor_station_id", "timestamp"),
    )
