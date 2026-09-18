from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class PlaceBase(BaseModel):
    name: str
    description: str
    city: str
    state: Optional[str] = None
    address: Optional[str] = None
    latitude: float
    longitude: float
    category: str
    estimated_duration_hours: float = 2.0
    estimated_cost: float = 0.0
    best_visiting_time: str = "Anytime"
    suitable_interests: str = ""
    rating: float = 4.5
    image_url: Optional[str] = None
    opening_time: Optional[str] = "09:00"
    closing_time: Optional[str] = "18:00"


class PlaceCreate(PlaceBase):
    pass


class PlaceResponse(PlaceBase):
    id: int
    distance_km: Optional[float] = None
    match_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class PlaceFilter(BaseModel):
    city: Optional[str] = None
    category: Optional[str] = None
    max_cost: Optional[float] = None
    interests: Optional[str] = None
    search: Optional[str] = None


class RecommendationRequest(BaseModel):
    starting_location: str = "Hyderabad"
    destination: Optional[str] = None
    interests: List[str] = ["Nature", "Food", "Sightseeing"]
    number_of_days: int = 2
    budget: float = 5000.0
    number_of_travelers: int = 1
    travel_style: str = "balanced"  # relaxed, balanced, packed
    limit: Optional[int] = 12
