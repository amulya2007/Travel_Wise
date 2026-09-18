from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    starting_location = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    number_of_days = Column(Integer, default=2)
    number_of_travelers = Column(Integer, default=1)
    budget = Column(Float, nullable=False, default=5000.0)
    travel_style = Column(String(50), default="balanced")  # relaxed, balanced, packed
    interests = Column(Text, default="Nature,Food,Sightseeing")  # Comma separated
    status = Column(String(50), default="planned")  # draft, planned, active, completed
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="trips")
    itinerary_days = relationship("ItineraryDay", back_populates="trip", cascade="all, delete-orphan", order_by="ItineraryDay.day_number")
    checklist = relationship("Checklist", back_populates="trip", uselist=False, cascade="all, delete-orphan")
