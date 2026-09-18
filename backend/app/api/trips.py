from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.itinerary import ItineraryDay, ItineraryItem
from app.schemas.trip import TripCreate, TripUpdate, TripSummaryResponse, TripDetailResponse
from app.api.deps import get_current_user
from app.services.itinerary_engine import generate_trip_itinerary
from app.services.checklist_service import get_or_create_trip_checklist
from app.services.budget_service import calculate_trip_budget

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("", response_model=TripDetailResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Creates a new trip and automatically generates itinerary and packing checklist."""
    trip = Trip(
        user_id=current_user.id,
        title=trip_in.title.strip() or f"{trip_in.number_of_days}-Day Trip to {trip_in.destination}",
        starting_location=trip_in.starting_location.strip(),
        destination=trip_in.destination.strip(),
        number_of_days=trip_in.number_of_days,
        number_of_travelers=trip_in.number_of_travelers,
        budget=trip_in.budget,
        travel_style=trip_in.travel_style,
        interests=trip_in.interests,
        status="planned"
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    # Automatically generate day-wise itinerary and checklist if requested
    if trip_in.auto_generate:
        generate_trip_itinerary(db, trip)
        get_or_create_trip_checklist(db, trip)

    # Fetch loaded trip with relationships
    db.refresh(trip)
    budget_data = calculate_trip_budget(db, trip)
    
    resp = TripDetailResponse.model_validate(trip)
    resp.total_days = trip.number_of_days
    resp.estimated_cost = budget_data.total_estimated_cost
    return resp


@router.get("", response_model=List[TripSummaryResponse])
def get_user_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all trips created by the authenticated user."""
    trips = (
        db.query(Trip)
        .filter(Trip.user_id == current_user.id)
        .order_by(Trip.updated_at.desc())
        .all()
    )
    
    res = []
    for t in trips:
        budget_data = calculate_trip_budget(db, t)
        summary = TripSummaryResponse.model_validate(t)
        summary.total_days = t.number_of_days
        summary.estimated_cost = budget_data.total_estimated_cost
        res.append(summary)
    return res


@router.get("/{trip_id}", response_model=TripDetailResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves full details for a specific trip, including itinerary and checklist."""
    trip = (
        db.query(Trip)
        .options(
            joinedload(Trip.itinerary_days).joinedload(ItineraryDay.items).joinedload(ItineraryItem.place)
        )
        .filter(Trip.id == trip_id, Trip.user_id == current_user.id)
        .first()
    )
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found."
        )

    # Ensure checklist exists
    checklist_resp = get_or_create_trip_checklist(db, trip)
    budget_data = calculate_trip_budget(db, trip)

    resp = TripDetailResponse.model_validate(trip)
    resp.total_days = trip.number_of_days
    resp.estimated_cost = budget_data.total_estimated_cost
    resp.checklist = checklist_resp
    return resp


@router.put("/{trip_id}", response_model=TripDetailResponse)
def update_trip(
    trip_id: int,
    trip_update: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates a trip's preferences and parameters."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found."
        )

    regenerate_needed = False
    if trip_update.title is not None:
        trip.title = trip_update.title.strip()
    if trip_update.starting_location is not None:
        trip.starting_location = trip_update.starting_location.strip()
        regenerate_needed = True
    if trip_update.destination is not None:
        trip.destination = trip_update.destination.strip()
        regenerate_needed = True
    if trip_update.number_of_days is not None and trip_update.number_of_days != trip.number_of_days:
        trip.number_of_days = trip_update.number_of_days
        regenerate_needed = True
    if trip_update.number_of_travelers is not None:
        trip.number_of_travelers = trip_update.number_of_travelers
    if trip_update.budget is not None:
        trip.budget = trip_update.budget
    if trip_update.travel_style is not None and trip_update.travel_style != trip.travel_style:
        trip.travel_style = trip_update.travel_style
        regenerate_needed = True
    if trip_update.interests is not None and trip_update.interests != trip.interests:
        trip.interests = trip_update.interests
        regenerate_needed = True
    if trip_update.status is not None:
        trip.status = trip_update.status

    db.commit()
    db.refresh(trip)

    if regenerate_needed:
        generate_trip_itinerary(db, trip)
        get_or_create_trip_checklist(db, trip)

    db.refresh(trip)
    return get_trip(trip.id, db, current_user)


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a trip along with its itinerary and checklist."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found."
        )
    db.delete(trip)
    db.commit()
    return None
