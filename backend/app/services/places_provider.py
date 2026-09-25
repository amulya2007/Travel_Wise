"""Server-side place discovery and geographic utilities.

Google's Places API is deliberately kept here: browser clients receive only
normalized place data and never receive a provider key or photo reference.
"""
from __future__ import annotations

from math import asin, cos, radians, sin, sqrt
from typing import Any, Optional
from urllib.parse import quote

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.place import Place


def haversine_km(lat_a: float, lon_a: float, lat_b: float, lon_b: float) -> float:
    """Great-circle distance between two GPS points, in kilometres."""
    radius_km = 6371.0088
    lat_delta = radians(lat_b - lat_a)
    lon_delta = radians(lon_b - lon_a)
    a = sin(lat_delta / 2) ** 2 + cos(radians(lat_a)) * cos(radians(lat_b)) * sin(lon_delta / 2) ** 2
    return radius_km * 2 * asin(sqrt(a))


def _photo_url(photo_name: Optional[str]) -> Optional[str]:
    if not photo_name or not settings.GOOGLE_MAPS_API_KEY:
        return None
    # Proxy the provider photo through our API so the Google key is never
    # present in a browser URL, page source, or network request.
    return f"/api/places/photo?name={quote(photo_name, safe='')}"


async def fetch_google_photo(photo_name: str) -> tuple[bytes, str]:
    if not settings.GOOGLE_MAPS_API_KEY:
        raise HTTPException(status_code=404, detail="Place photos are not configured.")
    try:
        async with httpx.AsyncClient(timeout=settings.PLACES_PROVIDER_TIMEOUT_SECONDS) as client:
            response = await client.get(
                f"https://places.googleapis.com/v1/{photo_name}/media",
                params={"maxHeightPx": 640, "maxWidthPx": 960, "key": settings.GOOGLE_MAPS_API_KEY},
            )
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Unable to retrieve this place photo.") from exc
    return response.content, response.headers.get("content-type", "image/jpeg")


async def google_nearby(latitude: float, longitude: float, radius_km: float, category: Optional[str], limit: int) -> list[dict[str, Any]]:
    if not settings.GOOGLE_MAPS_API_KEY:
        return []
    payload: dict[str, Any] = {
        "includedTypes": ["tourist_attraction", "restaurant", "cafe", "lodging"],
        "maxResultCount": min(max(limit, 1), 20),
        "locationRestriction": {"circle": {"center": {"latitude": latitude, "longitude": longitude}, "radius": radius_km * 1000}},
    }
    if category:
        payload["includedTypes"] = [category.lower().replace(" ", "_")]
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.primaryTypeDisplayName,places.rating,places.photos",
    }
    try:
        async with httpx.AsyncClient(timeout=settings.PLACES_PROVIDER_TIMEOUT_SECONDS) as client:
            response = await client.post("https://places.googleapis.com/v1/places:searchNearby", json=payload, headers=headers)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Unable to find nearby places right now. Please try again.") from exc

    results = []
    for place in response.json().get("places", []):
        location = place.get("location") or {}
        if "latitude" not in location or "longitude" not in location:
            continue
        results.append({
            "place_id": place["id"], "provider": "google_places",
            "name": (place.get("displayName") or {}).get("text", "Unnamed place"),
            "category": (place.get("primaryTypeDisplayName") or {}).get("text", "Place"),
            "address": place.get("formattedAddress"), "city": None,
            "latitude": location["latitude"], "longitude": location["longitude"],
            "distance_km": round(haversine_km(latitude, longitude, location["latitude"], location["longitude"]), 2),
            "rating": place.get("rating"),
            "image_url": _photo_url((place.get("photos") or [{}])[0].get("name")),
            "description": None, "estimated_cost": None,
        })
    return sorted(results, key=lambda item: item["distance_km"])


def curated_nearby(db: Session, latitude: float, longitude: float, radius_km: float, category: Optional[str], limit: int) -> list[dict[str, Any]]:
    """Offline fallback using the application's verified-coordinate catalogue."""
    places = db.query(Place).all()
    results = []
    for place in places:
        if category and category.lower() not in place.category.lower():
            continue
        distance = haversine_km(latitude, longitude, place.latitude, place.longitude)
        if distance <= radius_km:
            results.append({
                "place_id": f"curated:{place.id}", "provider": "curated",
                "name": place.name, "category": place.category, "address": place.address, "city": place.city,
                "latitude": place.latitude, "longitude": place.longitude, "distance_km": round(distance, 2),
                "rating": place.rating, "image_url": None, "description": place.description,
                "estimated_cost": place.estimated_cost,
            })
    return sorted(results, key=lambda item: item["distance_km"])[:limit]


async def geocode(query: str, db: Session) -> dict[str, Any]:
    query = query.strip()
    if settings.GOOGLE_MAPS_API_KEY:
        headers = {"X-Goog-Api-Key": settings.GOOGLE_MAPS_API_KEY, "X-Goog-FieldMask": "places.displayName,places.location"}
        try:
            async with httpx.AsyncClient(timeout=settings.PLACES_PROVIDER_TIMEOUT_SECONDS) as client:
                response = await client.post("https://places.googleapis.com/v1/places:searchText", headers=headers, json={"textQuery": query, "maxResultCount": 1})
                response.raise_for_status()
            place = response.json().get("places", [None])[0]
            if place and place.get("location"):
                return {"label": (place.get("displayName") or {}).get("text", query), **place["location"], "provider": "google_places"}
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail="Unable to look up that location right now. Please try again.") from exc
    place = db.query(Place).filter(Place.city.ilike(f"%{query}%")).first()
    if place:
        return {"label": place.city, "latitude": place.latitude, "longitude": place.longitude, "provider": "curated"}
    raise HTTPException(status_code=404, detail="Location not found. Try a city covered by TravelWise or configure Google Places.")


async def reverse_geocode(latitude: float, longitude: float, db: Session) -> dict[str, Any]:
    """Turns an explicit GPS coordinate into a readable address without storage."""
    if settings.GOOGLE_MAPS_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=settings.PLACES_PROVIDER_TIMEOUT_SECONDS) as client:
                response = await client.get(
                    "https://maps.googleapis.com/maps/api/geocode/json",
                    params={"latlng": f"{latitude},{longitude}", "key": settings.GOOGLE_MAPS_API_KEY},
                )
                response.raise_for_status()
            result = (response.json().get("results") or [None])[0]
            if result:
                return {"label": result.get("formatted_address", "Selected location"), "latitude": latitude, "longitude": longitude, "provider": "google_geocoding"}
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail="Unable to name your current location right now. Nearby places can still be shown.") from exc
    # Offline catalogue fallback is used only where a known location is nearby;
    # it never invents a city for a distant coordinate.
    nearest = min(db.query(Place).all(), key=lambda item: haversine_km(latitude, longitude, item.latitude, item.longitude), default=None)
    if nearest and haversine_km(latitude, longitude, nearest.latitude, nearest.longitude) <= 25:
        return {"label": f"{nearest.city}, {nearest.state}" if nearest.state else nearest.city, "latitude": latitude, "longitude": longitude, "provider": "curated"}
    return {"label": "Current location", "latitude": latitude, "longitude": longitude, "provider": "coordinates"}
