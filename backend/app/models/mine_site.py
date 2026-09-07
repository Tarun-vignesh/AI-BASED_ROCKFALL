import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base


class MineSite(Base):
    __tablename__ = "mine_sites"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(JSON, nullable=False)
    area_boundaries = Column(JSON, nullable=True)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="mine_site")
    sensor_stations = relationship("SensorStation", back_populates="mine_site", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="mine_site", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="mine_site", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="mine_site", cascade="all, delete-orphan")
    real_time_streams = relationship("RealTimeStream", back_populates="mine_site", cascade="all, delete-orphan")
    indian_conditions = relationship("IndianCondition", back_populates="mine_site", cascade="all, delete-orphan")
