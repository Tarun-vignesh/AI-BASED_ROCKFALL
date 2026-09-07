import uuid
from datetime import datetime
from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class SensorStation(Base):
    __tablename__ = "sensor_stations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mine_site_id = Column(String(36), ForeignKey("mine_sites.id", ondelete="CASCADE"), nullable=False)
    station_name = Column(String(255), nullable=False)
    sensor_type = Column(String(100), nullable=False)
    location = Column(JSON, nullable=False)
    configuration = Column(JSON, nullable=True)
    status = Column(String(50), default="active")
    last_reading_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    mine_site = relationship("MineSite", back_populates="sensor_stations")
    sensor_data = relationship("SensorData", back_populates="sensor_station", cascade="all, delete-orphan")
