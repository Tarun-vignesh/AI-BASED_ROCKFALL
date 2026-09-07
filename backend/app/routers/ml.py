from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.ai_model import AIModel
from app.ml.model import model_instance
from app.ml.training import train_and_save_model

router = APIRouter(prefix="/ml", tags=["ML Models"])


@router.get("/models", summary="List all registered AI models")
def list_models(db: Session = Depends(get_db)):
    models = db.query(AIModel).all()
    if not models:
        return [
            {
                "id": "mod-001-rf-v1",
                "model_name": model_instance.model_name,
                "model_type": "RandomForestClassifier",
                "model_version": model_instance.model_version,
                "accuracy_score": model_instance.accuracy_score,
                "training_data_size": 15000,
                "indian_specific": True,
                "active": True,
            }
        ]
    return models


@router.get("/models/active", summary="Get current active AI model")
def active_model(db: Session = Depends(get_db)):
    model = db.query(AIModel).filter(AIModel.active == True).first()
    if not model:
        return {
            "id": "mod-001-rf-v1",
            "model_name": model_instance.model_name,
            "model_type": "RandomForestClassifier",
            "model_version": model_instance.model_version,
            "accuracy_score": model_instance.accuracy_score,
            "training_data_size": 15000,
            "indian_specific": True,
            "active": True,
        }
    return model


@router.post("/models/train", summary="Train scikit-learn ML model on synthetic dataset")
def train_model(db: Session = Depends(get_db)):
    acc = train_and_save_model()
    # Update active model in DB
    model = db.query(AIModel).filter(AIModel.active == True).first()
    if model:
        model.accuracy_score = acc
        db.commit()

    return {
        "status": "success",
        "message": f"Successfully trained RandomForest rockfall model with accuracy {acc * 100:.2f}%",
        "accuracy": acc,
        "is_synthetic": True,
        "note": "Demo / Synthetic Training Model",
    }


@router.get("/models/{model_id}", summary="Get specific model details")
def model_details(model_id: str, db: Session = Depends(get_db)):
    model = db.query(AIModel).filter(AIModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model
