from io import BytesIO
from pathlib import Path
from typing import List, Optional
from uuid import uuid4
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, status, Response, UploadFile
from PIL import Image
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.place import Place
from app.models.travel_image import TravelImage
from app.schemas.place import PlaceResponse, PlaceCreate, RecommendationRequest, LocationSearchRequest, NearbyPlaceResponse, GeocodedLocation
from app.schemas.travel_image import TravelImageResponse
from app.services.recommendation import get_recommended_places
from app.services.places_provider import curated_nearby, geocode, google_nearby, fetch_google_photo, haversine_km, reverse_geocode

router = APIRouter(prefix="/places", tags=["Places"])
UPLOADS_DIR = Path(__file__).resolve().parents[2] / "uploads"


def _gps_from_exif(raw: bytes) -> Optional[tuple[float, float]]:
    """Extract GPS only when a photo explicitly supplies valid EXIF metadata."""
    try:
        image = Image.open(BytesIO(raw))
        gps = image.getexif().get_ifd(34853)
        if not gps:
            return None
        def decimal(values):
            degrees, minutes, seconds = values
            as_float = lambda value: float(value[0]) / float(value[1]) if isinstance(value, tuple) else float(value)
            return as_float(degrees) + as_float(minutes) / 60 + as_float(seconds) / 3600
        latitude, longitude = decimal(gps[2]), decimal(gps[4])
        if gps.get(1) in (b"S", "S"):
            latitude = -latitude
        if gps.get(3) in (b"W", "W"):
            longitude = -longitude
        return latitude, longitude
    except (OSError, KeyError, TypeError, ValueError, ZeroDivisionError):
        return None


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


@router.get("/reverse-geocode", response_model=GeocodedLocation)
async def reverse_geocode_location(latitude: float = Query(..., ge=-90, le=90), longitude: float = Query(..., ge=-180, le=180), db: Session = Depends(get_db)):
    return await reverse_geocode(latitude, longitude, db)


@router.post("/images/geotag", response_model=TravelImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_geotagged_image(
    file: UploadFile = File(...),
    place_id: Optional[int] = Form(None),
    manual_latitude: Optional[float] = Form(None),
    manual_longitude: Optional[float] = Form(None),
    location_name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Stores explicit image geography and validates it against an associated place."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="Please upload an image file.")
    content = await file.read()
    if not content or len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image must be between 1 byte and 10 MB.")
    exif_coordinates = _gps_from_exif(content)
    if (manual_latitude is None) != (manual_longitude is None):
        raise HTTPException(status_code=422, detail="Provide both manual latitude and longitude, or neither.")
    coordinates = exif_coordinates or ((manual_latitude, manual_longitude) if manual_latitude is not None else None)
    if coordinates and not (-90 <= coordinates[0] <= 90 and -180 <= coordinates[1] <= 180):
        raise HTTPException(status_code=422, detail="Manual coordinates are outside valid geographic bounds.")
    place = db.query(Place).filter(Place.id == place_id).first() if place_id else None
    if place_id and not place:
        raise HTTPException(status_code=404, detail="Selected place was not found.")
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    suffix = Path(file.filename or "image.jpg").suffix.lower() or ".jpg"
    filename = f"{uuid4().hex}{suffix}"
    (UPLOADS_DIR / filename).write_bytes(content)
    distance = haversine_km(coordinates[0], coordinates[1], place.latitude, place.longitude) if coordinates and place else None
    record = TravelImage(
        image_url=f"/uploads/{filename}", original_filename=file.filename or filename,
        location_name=location_name or (place.name if place else None), place_id=place_id,
        latitude=coordinates[0] if coordinates else None, longitude=coordinates[1] if coordinates else None,
        geo_tagged=bool(exif_coordinates), geo_verified=bool(distance is not None and distance <= 2.0), distance_to_place_km=round(distance, 3) if distance is not None else None,
    )
    db.add(record); db.commit(); db.refresh(record)
    return TravelImageResponse.model_validate(record)


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
