import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.itinerary import ItineraryDay, ItineraryItem
from app.models.place import Place
from app.schemas.place import RecommendationRequest
from app.services.recommendation import get_recommended_places, haversine_distance_km


def cluster_places_by_proximity(places: List[Place], num_clusters: int) -> List[List[Place]]:
    """
    Partitions places into `num_clusters` groups based on geographic coordinates
    so that places visited on the same day are physically close to each other.
    """
    if not places:
        return [[] for _ in range(num_clusters)]
    
    if num_clusters <= 1:
        return [places]

    # Simple greedy k-means style clustering
    # Pick seeds with greatest spread
    sorted_by_lat = sorted(places, key=lambda p: (p.latitude, p.longitude))
    step = max(1, len(sorted_by_lat) // num_clusters)
    seeds = [sorted_by_lat[min(i * step, len(sorted_by_lat) - 1)] for i in range(num_clusters)]

    clusters: List[List[Place]] = [[] for _ in range(num_clusters)]
    for place in places:
        # Assign to nearest seed
        best_cluster = 0
        min_dist = float("inf")
        for idx, seed in enumerate(seeds):
            d = haversine_distance_km(place.latitude, place.longitude, seed.latitude, seed.longitude)
            if d < min_dist:
                min_dist = d
                best_cluster = idx
        clusters[best_cluster].append(place)

    # Rebalance if any cluster is empty
    for i in range(num_clusters):
        if not clusters[i] and places:
            # Borrow from largest cluster
            largest = max(range(num_clusters), key=lambda k: len(clusters[k]))
            if len(clusters[largest]) > 1:
                clusters[i].append(clusters[largest].pop())

    return clusters


def generate_trip_itinerary(db: Session, trip: Trip) -> List[ItineraryDay]:
    """
    Generates a realistic, chronological, day-wise schedule for the trip.
    """
    # 1. Clear any prior itinerary days for this trip
    db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip.id).delete()
    db.commit()

    # 2. Retrieve candidate places matching preferences
    interests_list = [i.strip() for i in (trip.interests or "Nature,Food,Sightseeing").split(",") if i.strip()]
    req = RecommendationRequest(
        starting_location=trip.starting_location,
        destination=trip.destination,
        interests=interests_list,
        number_of_days=trip.number_of_days,
        budget=trip.budget,
        number_of_travelers=trip.number_of_travelers,
        travel_style=trip.travel_style or "balanced",
        limit=max(10, trip.number_of_days * 5)
    )
    
    recommended_place_resps = get_recommended_places(db, req, limit=req.limit)
    place_ids = [p.id for p in recommended_place_resps]
    
    # Load actual place models
    places_map = {p.id: p for p in db.query(Place).filter(Place.id.in_(place_ids)).all()}
    candidate_places = [places_map[pid] for pid in place_ids if pid in places_map]
    selected_ids = {int(value) for value in (trip.selected_place_ids or "").split(",") if value.strip().isdigit()}
    selected_places = [place for place in candidate_places if place.id in selected_ids]
    if selected_places:
        candidate_places = selected_places + [place for place in candidate_places if place.id not in selected_ids]

    # If no places found, pull any available places
    if not candidate_places:
        candidate_places = db.query(Place).limit(trip.number_of_days * 4).all()

    # Determine slots per day according to travel style
    style = (trip.travel_style or "balanced").lower()
    if style == "relaxed":
        places_per_day = 2
        start_hour = 10
    elif style == "packed":
        places_per_day = 4
        start_hour = 8
    else:  # balanced
        places_per_day = 3
        start_hour = 9

    # 3. Cluster places geographically across the trip days
    day_clusters = cluster_places_by_proximity(candidate_places, trip.number_of_days)

    created_days = []
    
    for day_idx in range(trip.number_of_days):
        day_num = day_idx + 1
        day_places = day_clusters[day_idx][:places_per_day]
        
        # Fallback if cluster had fewer items
        if not day_places and candidate_places:
            day_places = [candidate_places[day_idx % len(candidate_places)]]

        # Determine theme title based on primary category
        categories = [p.category for p in day_places]
        primary_cat = max(set(categories), key=categories.count) if categories else "Highlights"
        day_title = f"Day {day_num}: {trip.destination} {primary_cat} & Exploration"

        itinerary_day = ItineraryDay(
            trip_id=trip.id,
            day_number=day_num,
            title=day_title,
            description=f"Curated {style} schedule focusing on {primary_cat.lower()} attractions and local favorites."
        )
        db.add(itinerary_day)
        db.flush()  # to obtain itinerary_day.id

        order_idx = 0
        curr_hour = start_hour
        curr_min = 0
        prev_place: Any = None

        # Build day items
        for p_idx, place in enumerate(day_places):
            # Transit time and distance from previous spot
            if prev_place:
                dist = haversine_distance_km(prev_place.latitude, prev_place.longitude, place.latitude, place.longitude)
                transit_mins = max(15, min(60, int(dist * 2.5)))
                
                # Add transit note if distance is notable (> 3 km)
                if dist >= 3.0:
                    t_start = f"{curr_hour:02d}:{curr_min:02d}"
                    curr_min += transit_mins
                    if curr_min >= 60:
                        curr_hour += curr_min // 60
                        curr_min = curr_min % 60
                    t_end = f"{curr_hour:02d}:{curr_min:02d}"

                    transit_item = ItineraryItem(
                        day_id=itinerary_day.id,
                        place_id=None,
                        order_index=order_idx,
                        time_slot=f"{t_start} - {t_end}",
                        title=f"Travel to {place.name}",
                        item_type="travel",
                        description=f"Scenic drive or cab transit ({dist} km, approx {transit_mins} mins).",
                        duration_hours=round(transit_mins / 60.0, 1),
                        estimated_cost=round(dist * 15.0, 0),  # approx INR 15/km transit
                        travel_time_from_prev_mins=transit_mins,
                        travel_distance_km=dist
                    )
                    db.add(transit_item)
                    order_idx += 1
            else:
                dist = 0.0
                transit_mins = 0

            # Lunch break injection around 1:00 PM
            if curr_hour >= 13 and p_idx > 0 and not any(it.item_type == "meal" for it in itinerary_day.items):
                lunch_start = f"{curr_hour:02d}:{curr_min:02d}"
                curr_hour += 1
                curr_min += 15
                if curr_min >= 60:
                    curr_hour += 1
                    curr_min %= 60
                lunch_end = f"{curr_hour:02d}:{curr_min:02d}"

                meal_item = ItineraryItem(
                    day_id=itinerary_day.id,
                    place_id=None,
                    order_index=order_idx,
                    time_slot=f"{lunch_start} - {lunch_end}",
                    title="Authentic Regional Lunch & Rest Break",
                    item_type="meal",
                    description=f"Savor authentic delicacies and refreshing beverages near {prev_place.name if prev_place else trip.destination}.",
                    duration_hours=1.25,
                    estimated_cost=350.0 * trip.number_of_travelers,
                    travel_time_from_prev_mins=0,
                    travel_distance_km=0.0
                )
                db.add(meal_item)
                order_idx += 1

            # Activity spot
            duration = place.estimated_duration_hours or 2.0
            act_start = f"{curr_hour:02d}:{curr_min:02d}"
            
            dur_mins = int(duration * 60)
            curr_min += dur_mins
            curr_hour += curr_min // 60
            curr_min = curr_min % 60
            act_end = f"{curr_hour:02d}:{curr_min:02d}"

            place_item = ItineraryItem(
                day_id=itinerary_day.id,
                place_id=place.id,
                order_index=order_idx,
                time_slot=f"{act_start} - {act_end}",
                title=f"Visit {place.name}",
                item_type="place",
                description=place.description,
                duration_hours=duration,
                estimated_cost=place.estimated_cost * trip.number_of_travelers,
                travel_time_from_prev_mins=transit_mins,
                travel_distance_km=dist
            )
            db.add(place_item)
            order_idx += 1
            prev_place = place

        # Evening sunset / leisurely wrap-up
        if curr_hour < 20:
            eve_start = f"{curr_hour:02d}:{curr_min:02d}"
            eve_item = ItineraryItem(
                day_id=itinerary_day.id,
                place_id=None,
                order_index=order_idx,
                time_slot=f"{eve_start} - 20:30",
                title="Evening Sunset Walk & Local Street Market",
                item_type="leisure",
                description="Unwind with evening sunset strolls, local shopping, tea stalls, and casual dinner.",
                duration_hours=1.5,
                estimated_cost=200.0 * trip.number_of_travelers,
                travel_time_from_prev_mins=10,
                travel_distance_km=2.0
            )
            db.add(eve_item)

        created_days.append(itinerary_day)

    db.commit()
    return created_days
