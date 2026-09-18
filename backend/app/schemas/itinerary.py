from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.place import PlaceResponse


class ItineraryItemBase(BaseModel):
    order_index: int
    time_slot: str
    title: str
    item_type: str = "place"  # place, meal, travel, leisure
    description: Optional[str] = None
    duration_hours: float = 1.5
    estimated_cost: float = 0.0
    travel_time_from_prev_mins: int = 0
    travel_distance_km: float = 0.0
    place_id: Optional[int] = None


class ItineraryItemResponse(ItineraryItemBase):
    id: int
    day_id: int
    place: Optional[PlaceResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ItineraryDayResponse(BaseModel):
    id: int
    trip_id: int
    day_number: int
    title: str
    description: Optional[str] = None
    items: List[ItineraryItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ItineraryResponse(BaseModel):
    trip_id: int
    number_of_days: int
    days: List[ItineraryDayResponse] = []
    total_places_visited: int = 0
    total_travel_distance_km: float = 0.0
