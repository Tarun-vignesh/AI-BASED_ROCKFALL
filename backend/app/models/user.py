import uuid
from datetime import datetime
from sqlalchemy import Column, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    role = Column(String(50), nullable=False, default="operator")
    mine_site_id = Column(String(36), ForeignKey("mine_sites.id", ondelete="SET NULL"), nullable=True)
    notification_preferences = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    mine_site = relationship("MineSite", back_populates="users")
    alert_deliveries = relationship("AlertDelivery", back_populates="recipient")
    notification_logs = relationship("NotificationLog", back_populates="recipient")
