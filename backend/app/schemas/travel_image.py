from typing import Optional
from pydantic import BaseModel, ConfigDict


class TravelImageResponse(BaseModel):
    id: int
    image_url: str
    original_filename: str
    location_name: Optional[str] = None
    place_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geo_tagged: bool
    geo_verified: bool
    distance_to_place_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
