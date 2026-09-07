import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.database import Base


class IndianCondition(Base):
    __tablename__ = "indian_conditions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mine_site_id = Column(String(36), ForeignKey("mine_sites.id", ondelete="CASCADE"), nullable=False)
    geological_type = Column(String(100), default="Laterite")
    groundwater_level = Column(Float, nullable=True)
    humidity_percent = Column(Float, nullable=True)
    monsoon_season = Column(Boolean, default=False)
    rainfall_intensity = Column(String(50), default="Light")
    recorded_at = Column(DateTime, default=datetime.utcnow)
    seismic_activity_level = Column(String(50), default="Low")
    temperature_celsius = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, nullable=True)

    mine_site = relationship("MineSite", back_populates="indian_conditions")

    __table_args__ = (
        Index("idx_indian_conditions_mine_site", "mine_site_id", "recorded_at"),
    )
