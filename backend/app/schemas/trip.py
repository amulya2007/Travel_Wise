from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.itinerary import ItineraryDayResponse
from app.schemas.checklist import ChecklistResponse


class TripBase(BaseModel):
    title: str
    starting_location: str
    destination: str
    number_of_days: int = Field(default=2, ge=1, le=14)
    number_of_travelers: int = Field(default=1, ge=1, le=50)
    budget: float = Field(default=5000.0, ge=100.0)
    travel_style: str = "balanced"  # relaxed, balanced, packed
    interests: str = "Nature,Food,Sightseeing"
    selected_place_ids: str = ""


class TripCreate(TripBase):
    auto_generate: Optional[bool] = True


class TripUpdate(BaseModel):
    title: Optional[str] = None
    starting_location: Optional[str] = None
    destination: Optional[str] = None
    number_of_days: Optional[int] = Field(default=None, ge=1, le=14)
    number_of_travelers: Optional[int] = Field(default=None, ge=1, le=50)
    budget: Optional[float] = Field(default=None, ge=100.0)
    travel_style: Optional[str] = None
    interests: Optional[str] = None
    selected_place_ids: Optional[str] = None
    status: Optional[str] = None


class TripSummaryResponse(TripBase):
    id: int
    user_id: int
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    total_days: int = 0
    estimated_cost: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class TripDetailResponse(TripSummaryResponse):
    itinerary_days: List[ItineraryDayResponse] = []
    checklist: Optional[ChecklistResponse] = None

    model_config = ConfigDict(from_attributes=True)
