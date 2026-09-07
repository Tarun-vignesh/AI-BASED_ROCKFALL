from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.mine_site import MineSiteResponse, MineSiteCreate
from app.models.mine_site import MineSite

router = APIRouter(prefix="/mine-sites", tags=["Mine Sites"])


@router.get("/", response_model=List[MineSiteResponse], summary="List all mine sites")
def list_mine_sites(db: Session = Depends(get_db)):
    return db.query(MineSite).all()


@router.get("/{mine_site_id}", response_model=MineSiteResponse, summary="Get mine site by ID")
def get_mine_site(mine_site_id: str, db: Session = Depends(get_db)):
    site = db.query(MineSite).filter(MineSite.id == mine_site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Mine site not found")
    return site


@router.post("/", response_model=MineSiteResponse, summary="Create new mine site")
def create_mine_site(site_in: MineSiteCreate, db: Session = Depends(get_db)):
    site = MineSite(**site_in.model_dump())
    db.add(site)
    db.commit()
    db.refresh(site)
    return site
