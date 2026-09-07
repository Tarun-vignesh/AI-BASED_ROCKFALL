import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, JSON, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mine_site_id = Column(String(36), ForeignKey("mine_sites.id", ondelete="CASCADE"), nullable=False)
    model_id = Column(String(36), ForeignKey("ai_models.id", ondelete="SET NULL"), nullable=True)
    prediction_type = Column(String(100), nullable=False)
    risk_probability = Column(Float, nullable=False)
    confidence_level = Column(Float, nullable=False)
    affected_coordinates = Column(JSON, nullable=True)
    indian_factors = Column(JSON, nullable=True)
    raw_data_sources = Column(JSON, nullable=True)
    timeframe_hours = Column(Integer, default=24)
    alert_triggered = Column(Boolean, default=False)
    valid_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mine_site = relationship("MineSite", back_populates="predictions")
    ai_model = relationship("AIModel", back_populates="predictions")

    __table_args__ = (
        Index("idx_predictions_mine_site", "mine_site_id", "created_at"),
    )
