from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.itinerary import ItineraryDay, ItineraryItem
from app.schemas.itinerary import ItineraryResponse, ItineraryDayResponse
from app.api.deps import get_current_user
from app.services.itinerary_engine import generate_trip_itinerary

router = APIRouter(prefix="/trips", tags=["Itinerary"])


@router.post("/{trip_id}/generate", response_model=ItineraryResponse)
def generate_itinerary(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Regenerates the complete day-wise itinerary based on current trip parameters."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found."
        )

    created_days = generate_trip_itinerary(db, trip)
    
    # Reload full days with items and places
    days = (
        db.query(ItineraryDay)
        .options(joinedload(ItineraryDay.items).joinedload(ItineraryItem.place))
        .filter(ItineraryDay.trip_id == trip.id)
        .order_by(ItineraryDay.day_number)
        .all()
    )

    total_places = sum(len([i for i in d.items if i.item_type == "place"]) for d in days)
    total_dist = sum(sum(i.travel_distance_km for i in d.items) for d in days)

    return ItineraryResponse(
        trip_id=trip.id,
        number_of_days=trip.number_of_days,
        days=[ItineraryDayResponse.model_validate(d) for d in days],
        total_places_visited=total_places,
        total_travel_distance_km=round(total_dist, 1)
    )


@router.get("/{trip_id}/itinerary", response_model=ItineraryResponse)
def get_itinerary(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches the day-wise itinerary for a trip."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found."
        )

    days = (
        db.query(ItineraryDay)
        .options(joinedload(ItineraryDay.items).joinedload(ItineraryItem.place))
        .filter(ItineraryDay.trip_id == trip.id)
        .order_by(ItineraryDay.day_number)
        .all()
    )

    # If itinerary has not been generated yet, auto-generate it
    if not days:
        generate_trip_itinerary(db, trip)
        days = (
            db.query(ItineraryDay)
            .options(joinedload(ItineraryDay.items).joinedload(ItineraryItem.place))
            .filter(ItineraryDay.trip_id == trip.id)
            .order_by(ItineraryDay.day_number)
            .all()
        )

    total_places = sum(len([i for i in d.items if i.item_type == "place"]) for d in days)
    total_dist = sum(sum(i.travel_distance_km for i in d.items) for d in days)

    return ItineraryResponse(
        trip_id=trip.id,
        number_of_days=trip.number_of_days,
        days=[ItineraryDayResponse.model_validate(d) for d in days],
        total_places_visited=total_places,
        total_travel_distance_km=round(total_dist, 1)
    )
