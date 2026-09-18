from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    home_location: Optional[str] = "Hyderabad"
    preferred_travel_style: Optional[str] = "balanced"
    default_budget: Optional[float] = 5000.0
    interests: Optional[str] = "Nature,Food,Sightseeing"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    home_location: Optional[str] = "Hyderabad"
    preferred_travel_style: Optional[str] = "balanced"
    default_budget: Optional[float] = 5000.0
    interests: Optional[str] = "Nature,Food,Sightseeing"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    home_location: Optional[str] = None
    preferred_travel_style: Optional[str] = None
    default_budget: Optional[float] = None
    interests: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None
