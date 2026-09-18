from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from sqlalchemy.orm import relationship
from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # Profile & Preferences
    home_location = Column(String(255), default="Hyderabad")
    preferred_travel_style = Column(String(50), default="balanced")  # relaxed, balanced, packed
    default_budget = Column(Float, default=5000.0)
    interests = Column(Text, default="Nature,Food,Sightseeing")  # Comma separated
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
