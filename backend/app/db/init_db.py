from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.database import engine
from app.core.logging_config import logger


def init_db(db: Session) -> None:
    """
    Creates all tables in MySQL if they do not exist.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Successfully initialized database tables in MySQL.")
    except Exception as e:
        logger.error(f"Error initializing MySQL database: {e}")
        raise e
