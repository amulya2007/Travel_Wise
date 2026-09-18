from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.places import router as places_router
from app.api.trips import router as trips_router
from app.api.itinerary import router as itinerary_router
from app.api.budget import router as budget_router
from app.api.checklist import router as checklist_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(places_router)
api_router.include_router(trips_router)
api_router.include_router(itinerary_router)
api_router.include_router(budget_router)
api_router.include_router(checklist_router)
