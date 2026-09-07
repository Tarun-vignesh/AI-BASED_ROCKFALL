from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/{mine_site_id}", response_model=DashboardSummaryResponse, summary="Get main dashboard aggregated metrics")
def dashboard_summary(mine_site_id: str, db: Session = Depends(get_db)):
    return get_dashboard_summary(db, mine_site_id)
