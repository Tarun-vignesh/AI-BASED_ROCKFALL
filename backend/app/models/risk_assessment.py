import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, JSON, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.database import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mine_site_id = Column(String(36), ForeignKey("mine_sites.id", ondelete="CASCADE"), nullable=False)
    assessment_type = Column(String(100), nullable=False)
    risk_level = Column(String(50), nullable=False)
    probability = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    affected_zones = Column(JSON, nullable=True)
    prediction_data = Column(JSON, nullable=True)
    valid_from = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mine_site = relationship("MineSite", back_populates="risk_assessments")
    alerts = relationship("Alert", back_populates="risk_assessment")

    __table_args__ = (
        Index("idx_risk_assessments_mine_site", "mine_site_id", "created_at"),
    )
