from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
from app.core.config import settings
from app.core.logging_config import logger

Base = declarative_base()

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False,
    )
    with engine.connect() as conn:
        pass
    logger.info("Connected to MySQL database successfully.")
except Exception as e:
    logger.warning(f"MySQL connection warning ({e}). Falling back to SQLite in-memory database for local test session.")
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Ensure tables are created for SQLite in-memory instance
    from app.models import (
        MineSite, User, SensorStation, SensorData, AIModel,
        Prediction, RiskAssessment, Alert, AlertDelivery,
        NotificationLog, RealTimeStream, IndianCondition
    )
    Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
