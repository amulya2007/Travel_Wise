from sqlalchemy import Column, Integer, String, Float, Text
from app.database.session import Base


class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # Nature, Beach, Historical, Food, Shopping, Adventure, etc.
    estimated_duration_hours = Column(Float, default=2.0)
    estimated_cost = Column(Float, default=0.0)  # INR per person
    best_visiting_time = Column(String(100), default="Anytime")  # Morning, Afternoon, Sunset, Evening, Night, Anytime
    suitable_interests = Column(Text, default="")  # Comma separated
    rating = Column(Float, default=4.5)
    image_url = Column(String(500), nullable=True)
    opening_time = Column(String(10), default="09:00")
    closing_time = Column(String(10), default="18:00")
