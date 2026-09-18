from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.checklist import Checklist, ChecklistItem
from app.schemas.checklist import (
    ChecklistResponse,
    ChecklistItemResponse,
    ChecklistItemCreate,
    ChecklistItemUpdate,
)
from app.api.deps import get_current_user
from app.services.checklist_service import get_or_create_trip_checklist

router = APIRouter(tags=["Checklist"])


@router.get("/trips/{trip_id}/checklist", response_model=ChecklistResponse)
def get_checklist(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves the travel checklist for a given trip."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found."
        )

    return get_or_create_trip_checklist(db, trip)


@router.post("/trips/{trip_id}/checklist/items", response_model=ChecklistItemResponse, status_code=status.HTTP_201_CREATED)
def add_checklist_item(
    trip_id: int,
    item_in: ChecklistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Adds a custom user item to the trip's packing checklist."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found."
        )

    checklist = db.query(Checklist).filter(Checklist.trip_id == trip.id).first()
    if not checklist:
        get_or_create_trip_checklist(db, trip)
        checklist = db.query(Checklist).filter(Checklist.trip_id == trip.id).first()

    new_item = ChecklistItem(
        checklist_id=checklist.id,
        item=item_in.item.strip(),
        category=item_in.category or "Custom",
        is_completed=item_in.is_completed,
        is_custom=True
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return ChecklistItemResponse.model_validate(new_item)


@router.put("/checklist/items/{item_id}", response_model=ChecklistItemResponse)
def update_checklist_item(
    item_id: int,
    item_update: ChecklistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggles checklist completion status or updates item details."""
    item = (
        db.query(ChecklistItem)
        .join(Checklist)
        .join(Trip)
        .filter(ChecklistItem.id == item_id, Trip.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checklist item not found."
        )

    if item_update.is_completed is not None:
        item.is_completed = item_update.is_completed
    if item_update.item is not None:
        item.item = item_update.item.strip()
    if item_update.category is not None:
        item.category = item_update.category.strip()

    db.commit()
    db.refresh(item)
    return ChecklistItemResponse.model_validate(item)


@router.delete("/checklist/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checklist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Removes an item from the checklist."""
    item = (
        db.query(ChecklistItem)
        .join(Checklist)
        .join(Trip)
        .filter(ChecklistItem.id == item_id, Trip.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Checklist item not found."
        )

    db.delete(item)
    db.commit()
    return None
