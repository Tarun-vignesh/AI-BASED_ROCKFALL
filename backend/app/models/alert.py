import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mine_site_id = Column(String(36), ForeignKey("mine_sites.id", ondelete="CASCADE"), nullable=False)
    risk_assessment_id = Column(String(36), ForeignKey("risk_assessments.id", ondelete="SET NULL"), nullable=True)
    alert_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    affected_areas = Column(JSON, nullable=True)
    action_required = Column(Text, nullable=True)
    status = Column(String(50), default="active")
    acknowledged_by = Column(String(255), nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mine_site = relationship("MineSite", back_populates="alerts")
    risk_assessment = relationship("RiskAssessment", back_populates="alerts")
    alert_deliveries = relationship("AlertDelivery", back_populates="alert", cascade="all, delete-orphan")
    notification_logs = relationship("NotificationLog", back_populates="alert", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_alerts_mine_site_status", "mine_site_id", "status"),
    )
