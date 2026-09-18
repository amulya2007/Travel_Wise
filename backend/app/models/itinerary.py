from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)  # 1, 2, ...
    title = Column(String(255), default="Day Schedule")
    description = Column(Text, nullable=True)

    # Relationships
    trip = relationship("Trip", back_populates="itinerary_days")
    items = relationship("ItineraryItem", back_populates="day", cascade="all, delete-orphan", order_by="ItineraryItem.order_index")


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("itinerary_days.id", ondelete="CASCADE"), nullable=False, index=True)
    place_id = Column(Integer, ForeignKey("places.id", ondelete="SET NULL"), nullable=True)
    order_index = Column(Integer, default=0)
    time_slot = Column(String(50), nullable=False)  # e.g. "09:00 AM - 11:30 AM"
    title = Column(String(255), nullable=False)  # e.g. "Visit Golconda Fort" or "Lunch at Paradise Biryani"
    item_type = Column(String(50), default="place")  # place, meal, travel, leisure
    description = Column(Text, nullable=True)
    duration_hours = Column(Float, default=1.5)
    estimated_cost = Column(Float, default=0.0)
    travel_time_from_prev_mins = Column(Integer, default=0)
    travel_distance_km = Column(Float, default=0.0)

    # Relationships
    day = relationship("ItineraryDay", back_populates="items")
    place = relationship("Place")
