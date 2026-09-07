import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base


class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_name = Column(String(255), nullable=False)
    model_type = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    accuracy_score = Column(Float, nullable=True)
    training_data_size = Column(Integer, nullable=True)
    indian_specific = Column(Boolean, default=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="ai_model")
