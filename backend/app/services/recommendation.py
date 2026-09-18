import math
from typing import List, Optional, Tuple, Dict
from sqlalchemy.orm import Session
from app.models.place import Place
from app.schemas.place import RecommendationRequest, PlaceResponse

# Known reference coordinates for popular Indian cities/regions
KNOWN_CITY_COORDINATES: Dict[str, Tuple[float, float]] = {
    "hyderabad": (17.3850, 78.4867),
    "secunderabad": (17.4399, 78.4983),
    "warangal": (17.9689, 79.5941),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "goa": (15.2993, 74.1240),
    "north goa": (15.5553, 73.7517),
    "south goa": (15.2000, 74.0000),
    "jaipur": (26.9124, 75.7873),
    "munnar": (10.0889, 77.0595),
    "kerala": (10.0889, 77.0595),
    "delhi": (28.6139, 77.2090),
    "agra": (27.1767, 78.0081),
    "mumbai": (19.0760, 72.8777),
    "pune": (18.5204, 73.8567),
    "chennai": (13.0827, 80.2707),
    "vizag": (17.6868, 83.2185),
    "visakhapatnam": (17.6868, 83.2185),
}


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points in kilometers."""
    r = 6371.0  # Earth's radius in kilometers
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 1)


def get_city_coords(location_name: str) -> Tuple[float, float]:
    cleaned = location_name.strip().lower()
    for city, coords in KNOWN_CITY_COORDINATES.items():
        if city in cleaned or cleaned in city:
            return coords
    # Default fallback to Hyderabad coordinates
    return (17.3850, 78.4867)


def get_recommended_places(
    db: Session,
    request: RecommendationRequest,
    limit: int = 15
) -> List[PlaceResponse]:
    """
    Intelligently recommends places matching interests, proximity, budget, and trip style.
    """
    start_lat, start_lon = get_city_coords(request.starting_location)
    target_destination = request.destination.strip().lower() if request.destination else None

    # Base query
    query = db.query(Place)
    
    # If a specific destination was targeted (e.g. Goa, Hyderabad, Jaipur)
    if target_destination and target_destination != "all":
        # Check if matches a city name
        query = query.filter(Place.city.ilike(f"%{target_destination}%"))

    all_places = query.all()
    if not all_places:
        # Fallback to all places
        all_places = db.query(Place).all()

    # User interest keywords
    user_interests = set(i.strip().lower() for i in request.interests if i.strip())
    
    daily_budget_per_person = (request.budget / max(1, request.number_of_travelers)) / max(1, request.number_of_days)

    scored_places = []
    for place in all_places:
        # Distance calculation
        dist_km = haversine_distance_km(start_lat, start_lon, place.latitude, place.longitude)
        
        # Interest match score (0.0 to 1.0)
        place_interests = set(
            [place.category.lower()] +
            [s.strip().lower() for s in place.suitable_interests.split(",") if s.strip()]
        )
        common_interests = user_interests.intersection(place_interests)
        interest_score = len(common_interests) / max(1, len(user_interests)) if user_interests else 0.5
        
        # Budget friendliness score
        # Places with reasonable entry fees compared to daily budget
        cost_ratio = place.estimated_cost / max(100.0, daily_budget_per_person)
        budget_score = max(0.0, min(1.0, 1.0 - (cost_ratio * 0.5)))
        
        # Distance penalty/score: closer places or logical getaways within reach
        # For 2-day trips, destinations within 250km get higher weight
        if dist_km <= 30:
            dist_score = 1.0
        elif dist_km <= 150:
            dist_score = 0.85
        elif dist_km <= 350:
            dist_score = 0.70
        else:
            dist_score = 0.50

        # Quality / Rating score (e.g. 4.5 -> 0.9)
        rating_score = (place.rating or 4.0) / 5.0

        # Weighted aggregate score
        total_score = (
            (interest_score * 0.40) +
            (budget_score * 0.20) +
            (dist_score * 0.25) +
            (rating_score * 0.15)
        )

        place_resp = PlaceResponse.model_validate(place)
        place_resp.distance_km = dist_km
        place_resp.match_score = round(total_score * 100, 1)

        scored_places.append((total_score, place_resp))

    # Sort descending by match score
    scored_places.sort(key=lambda x: x[0], reverse=True)
    
    return [p[1] for p in scored_places[:limit]]
