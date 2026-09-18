from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.trip import Trip
from app.schemas.budget import BudgetResponse
from app.api.deps import get_current_user
from app.services.budget_service import calculate_trip_budget

router = APIRouter(prefix="/trips", tags=["Budget"])


@router.get("/{trip_id}/budget", response_model=BudgetResponse)
def get_trip_budget(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculates comprehensive estimated expenses for transportation, stay, dining, and entry fees."""
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found."
        )

    budget_evaluation = calculate_trip_budget(db, trip)
    return budget_evaluation
