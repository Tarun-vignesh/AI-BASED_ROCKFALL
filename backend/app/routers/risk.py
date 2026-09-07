from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.risk import RiskZoneMapItem
from app.services.risk_service import get_risk_map_data

router = APIRouter(prefix="/risk", tags=["Risk Map"])


@router.get("/{mine_site_id}/map", response_model=List[RiskZoneMapItem], summary="Get risk map data zones")
def risk_map(mine_site_id: str, db: Session = Depends(get_db)):
    return get_risk_map_data(db, mine_site_id)
