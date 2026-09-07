import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, JSON, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.database import Base


class RealTimeStream(Base):
    __tablename__ = "real_time_streams"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mine_site_id = Column(String(36), ForeignKey("mine_sites.id", ondelete="CASCADE"), nullable=False)
    stream_type = Column(String(100), nullable=False)
    stream_source = Column(String(100), nullable=False)
    data_payload = Column(JSON, nullable=False)
    indian_conditions = Column(JSON, nullable=True)
    risk_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    processed_by_ai = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    mine_site = relationship("MineSite", back_populates="real_time_streams")

    __table_args__ = (
        Index("idx_real_time_streams_mine_site", "mine_site_id", "created_at"),
    )
