from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: str = "operator"
    mine_site_id: Optional[str] = None
    notification_preferences: Optional[Dict[str, Any]] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = None
    mine_site_id: Optional[str] = None
    notification_preferences: Optional[Dict[str, Any]] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
