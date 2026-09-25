from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from app.database.session import Base


class TravelImage(Base):
    """A user-provided image and only the location evidence supplied with it."""
    __tablename__ = "travel_images"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    location_name = Column(String(255), nullable=True)
    place_id = Column(Integer, ForeignKey("places.id"), nullable=True, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    geo_tagged = Column(Boolean, default=False, nullable=False)
    geo_verified = Column(Boolean, default=False, nullable=False)
    distance_to_place_km = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
