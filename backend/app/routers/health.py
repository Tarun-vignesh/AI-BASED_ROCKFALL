from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.ml.model import model_instance

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health Check Endpoint")
def health_check(db: Session = Depends(get_db)):
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    ml_status = "loaded" if model_instance.model is not None or model_instance.accuracy_score > 0 else "fallback_heuristic"

    return {
        "status": "ok",
        "database": db_status,
        "ml_model": ml_status,
        "version": "1.0.0",
    }
