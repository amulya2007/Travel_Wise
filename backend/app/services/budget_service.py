from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.itinerary import ItineraryDay, ItineraryItem
from app.schemas.budget import BudgetResponse, BudgetCategoryBreakdown


def calculate_trip_budget(db: Session, trip: Trip) -> BudgetResponse:
    """
    Calculates detailed itemized expenses across transportation, food, activities,
    stay, and miscellaneous, and evaluates against user budget.
    """
    days = max(1, trip.number_of_days)
    travelers = max(1, trip.number_of_travelers)
    user_budget = float(trip.budget)

    # Gather all items from itinerary
    itinerary_items = (
        db.query(ItineraryItem)
        .join(ItineraryDay)
        .filter(ItineraryDay.trip_id == trip.id)
        .all()
    )

    # 1. Activities / Entry Fees
    activities_sum = 0.0
    transit_items_sum = 0.0
    meal_items_sum = 0.0

    for item in itinerary_items:
        if item.item_type == "place":
            activities_sum += item.estimated_cost
        elif item.item_type == "travel":
            transit_items_sum += item.estimated_cost
        elif item.item_type == "meal":
            meal_items_sum += item.estimated_cost

    # If itinerary was not generated yet, calculate realistic defaults
    if activities_sum == 0.0:
        activities_sum = 250.0 * days * travelers

    # 2. Transportation
    # Local cabs/autos/fuel: minimum baseline of ₹300/day plus item distances
    transportation_cost = max(transit_items_sum, 350.0 * days) + (100.0 * travelers)

    # 3. Food & Dining
    # Baseline food allowance per person per day (₹450/day/traveler for 3 meals)
    standard_food_allowance = 450.0 * days * travelers
    food_cost = max(meal_items_sum, standard_food_allowance)

    # 4. Accommodation
    # If 1-day trip, no accommodation needed.
    # For multi-day trips, estimate hotel/homestay rooms needed (1 room per 2 travelers)
    if days > 1:
        nights = days - 1
        rooms_needed = max(1, (travelers + 1) // 2)
        # Average comfortable budget hotel in India: ₹1,600 / room / night
        accommodation_cost = float(nights * rooms_needed * 1600.0)
    else:
        accommodation_cost = 0.0

    # 5. Miscellaneous / Buffer (8% safety buffer)
    subtotal = activities_sum + transportation_cost + food_cost + accommodation_cost
    misc_cost = round(subtotal * 0.08, 0)

    total_estimated = round(subtotal + misc_cost, 0)
    remaining_budget = round(user_budget - total_estimated, 0)
    cost_per_traveler = round(total_estimated / travelers, 0)
    usage_percentage = round((total_estimated / max(1.0, user_budget)) * 100.0, 1)

    is_over = remaining_budget < 0

    if usage_percentage <= 80.0:
        status = "Within Budget"
        status_color = "emerald"
        message = f"Comfortable plan! You have an estimated surplus of ₹{int(remaining_budget):,} for shopping and treats."
    elif usage_percentage <= 100.0:
        status = "Near Limit"
        status_color = "amber"
        message = f"Well-balanced plan! Budget is closely matched with ₹{int(remaining_budget):,} cushion remaining."
    else:
        status = "Budget Exceeded"
        status_color = "rose"
        deficit = abs(int(remaining_budget))
        message = f"Estimated expenses exceed budget by ₹{deficit:,}. Consider opting for budget accommodation or public transit."

    breakdown = {
        "transportation": BudgetCategoryBreakdown(
            category="Transportation",
            amount=round(transportation_cost, 0),
            percentage=round((transportation_cost / total_estimated) * 100, 1) if total_estimated > 0 else 0,
            description="Local cabs, autos, fuel, and inter-city transit buffer"
        ),
        "food": BudgetCategoryBreakdown(
            category="Food & Dining",
            amount=round(food_cost, 0),
            percentage=round((food_cost / total_estimated) * 100, 1) if total_estimated > 0 else 0,
            description="Breakfast, authentic regional lunches, dinners, and refreshments"
        ),
        "activities": BudgetCategoryBreakdown(
            category="Activities & Entry Fees",
            amount=round(activities_sum, 0),
            percentage=round((activities_sum / total_estimated) * 100, 1) if total_estimated > 0 else 0,
            description="Monument tickets, museum passes, and sightseeing access"
        ),
        "accommodation": BudgetCategoryBreakdown(
            category="Accommodation",
            amount=round(accommodation_cost, 0),
            percentage=round((accommodation_cost / total_estimated) * 100, 1) if total_estimated > 0 else 0,
            description=f"{max(0, days - 1)} night(s) hotel/homestay stay for {travelers} traveler(s)"
        ),
        "miscellaneous": BudgetCategoryBreakdown(
            category="Emergency & Contingency",
            amount=round(misc_cost, 0),
            percentage=round((misc_cost / total_estimated) * 100, 1) if total_estimated > 0 else 0,
            description="8% safety reserve for bottled water, tips, and unexpected expenses"
        )
    }

    return BudgetResponse(
        trip_id=trip.id,
        user_budget=user_budget,
        total_estimated_cost=total_estimated,
        remaining_budget=remaining_budget,
        cost_per_traveler=cost_per_traveler,
        is_over_budget=is_over,
        budget_usage_percentage=usage_percentage,
        status=status,
        status_color=status_color,
        message=message,
        breakdown=breakdown
    )
