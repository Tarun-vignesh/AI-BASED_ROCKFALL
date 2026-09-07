import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class AlertDelivery(Base):
    __tablename__ = "alert_deliveries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_id = Column(String(36), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=True)
    recipient_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    recipient_contact = Column(String(255), nullable=True)
    delivery_method = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    alert = relationship("Alert", back_populates="alert_deliveries")
    recipient = relationship("User", back_populates="alert_deliveries")
