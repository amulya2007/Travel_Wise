from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class Checklist(Base):
    __tablename__ = "checklists"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Relationships
    trip = relationship("Trip", back_populates="checklist")
    items = relationship("ChecklistItem", back_populates="checklist", cascade="all, delete-orphan", order_by="ChecklistItem.id")


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    checklist_id = Column(Integer, ForeignKey("checklists.id", ondelete="CASCADE"), nullable=False, index=True)
    item = Column(String(255), nullable=False)
    category = Column(String(100), default="General")  # Essentials, Clothing, Electronics, Health, Activity-Specific
    is_completed = Column(Boolean, default=False)
    is_custom = Column(Boolean, default=False)

    # Relationships
    checklist = relationship("Checklist", back_populates="items")
