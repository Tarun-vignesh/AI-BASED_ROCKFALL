from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class MineSiteBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Dict[str, Any]
    area_boundaries: Optional[Dict[str, Any]] = None
    status: Optional[str] = "active"


class MineSiteCreate(MineSiteBase):
    pass


class MineSiteResponse(MineSiteBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
