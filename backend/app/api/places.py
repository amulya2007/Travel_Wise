from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.place import Place
from app.schemas.place import PlaceResponse, PlaceCreate, RecommendationRequest, LocationSearchRequest, NearbyPlaceResponse, GeocodedLocation
from app.services.recommendation import get_recommended_places
from app.services.places_provider import curated_nearby, geocode, google_nearby, fetch_google_photo

router = APIRouter(prefix="/places", tags=["Places"])


@router.post("/nearby", response_model=List[NearbyPlaceResponse])
async def get_nearby_places(request: LocationSearchRequest, db: Session = Depends(get_db)):
    """Returns provider places when configured, otherwise real catalogue places by coordinate."""
    if not 0 < request.radius_km <= 50:
        raise HTTPException(status_code=422, detail="Search radius must be between 0 and 50 km.")
    provider_results = await google_nearby(request.latitude, request.longitude, request.radius_km, request.category, request.limit)
    return provider_results or curated_nearby(db, request.latitude, request.longitude, request.radius_km, request.category, request.limit)


@router.get("/geocode", response_model=GeocodedLocation)
async def geocode_location(query: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    return await geocode(query, db)


@router.get("/photo")
async def get_provider_photo(name: str = Query(..., min_length=1)):
    """Safely proxies a place-owned Google photo without exposing API keys."""
    image, content_type = await fetch_google_photo(name)
    return Response(content=image, media_type=content_type, headers={"Cache-Control": "public, max-age=86400"})


@router.get("", response_model=List[PlaceResponse])
def get_places(
    city: Optional[str] = Query(None, description="Filter by city name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search term in name or description"),
    max_cost: Optional[float] = Query(None, description="Filter places by maximum estimated cost"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lists destination places with optional filters."""
    query = db.query(Place)
    
    if city and city.lower() != "all":
        query = query.filter(Place.city.ilike(f"%{city.strip()}%"))
    if category and category.lower() != "all":
        query = query.filter(Place.category.ilike(f"%{category.strip()}%"))
    if max_cost is not None:
        query = query.filter(Place.estimated_cost <= max_cost)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(or_(Place.name.ilike(s), Place.description.ilike(s), Place.city.ilike(s)))
        
    places = query.order_by(Place.rating.desc()).limit(limit).all()
    return [PlaceResponse.model_validate(p) for p in places]


@router.get("/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """Returns all unique place categories available in the database."""
    distinct_cats = db.query(Place.category).distinct().all()
    return sorted([cat[0] for cat in distinct_cats if cat[0]])


@router.get("/cities", response_model=List[str])
def get_cities(db: Session = Depends(get_db)):
    """Returns all unique destination cities available in the database."""
    distinct_cities = db.query(Place.city).distinct().all()
    return sorted([c[0] for c in distinct_cities if c[0]])


@router.get("/{place_id}", response_model=PlaceResponse)
def get_place(place_id: int, db: Session = Depends(get_db)):
    """Returns details for a specific place."""
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found."
        )
    return PlaceResponse.model_validate(place)


@router.post("/recommendations", response_model=List[PlaceResponse])
def recommend_places(request: RecommendationRequest, db: Session = Depends(get_db)):
    """Generates scored recommendations matching user travel constraints."""
    recommendations = get_recommended_places(db, request, limit=request.limit or 15)
    return recommendations
