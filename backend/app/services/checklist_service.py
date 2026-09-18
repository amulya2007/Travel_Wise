from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.checklist import Checklist, ChecklistItem
from app.schemas.checklist import ChecklistResponse, ChecklistItemResponse


DEFAULT_ESSENTIALS = [
    ("Government ID proof (Aadhaar / Driving License / Passport)", "Essentials"),
    ("Train / Bus / Vehicle registration documents & tickets", "Essentials"),
    ("Phone charger & heavy-duty cables", "Electronics"),
    ("10,000+ mAh portable power bank", "Electronics"),
    ("Emergency physical cash in small denominations", "Essentials"),
    ("Debit / Credit cards & UPI apps set up", "Essentials"),
    ("Prescription medicines & motion sickness / headache tablets", "Health"),
    ("Hand sanitizer & disinfectant wipes", "Health"),
    ("Comfortable walking sneakers / shoes", "Clothing"),
    ("Change of clothes (1 extra set beyond trip days)", "Clothing"),
]

INTEREST_SPECIFIC_ITEMS = {
    "beach": [
        ("Sunscreen lotion with high SPF 50+", "Activity-Specific"),
        ("Swimwear / quick-dry beach apparel", "Activity-Specific"),
        ("Waterproof phone pouch", "Electronics"),
        ("Beach flip-flops / sandals", "Clothing"),
        ("Polarized sunglasses", "Accessories"),
    ],
    "nature": [
        ("Trekking / trail shoes with firm grip", "Activity-Specific"),
        ("Mosquito & insect repellent spray", "Health"),
        ("Reusable insulated water bottle", "Accessories"),
        ("Light rain poncho or compact umbrella", "Clothing"),
        ("Binoculars or camera zoom lens", "Electronics"),
    ],
    "adventure": [
        ("Mini first-aid kit with band-aids & crepe bandage", "Health"),
        ("Lightweight hydration daypack", "Accessories"),
        ("Sweat-wicking sportswear & cap", "Clothing"),
        ("Energy snack bars & hydration electrolytes", "Health"),
    ],
    "history": [
        ("Comfortable slip-on footwear for temple/monument entry", "Clothing"),
        ("Wide-brim sun hat or UV cap", "Accessories"),
        ("Modest cover-up scarf for religious heritage sites", "Clothing"),
    ],
    "culture": [
        ("Modest clothing for heritage & religious monuments", "Clothing"),
        ("Compact camera with spare memory card", "Electronics"),
    ],
    "food": [
        ("Antacid & digestive enzyme tablets", "Health"),
        ("Pack of mints and mouth fresheners", "Health"),
    ]
}


def get_or_create_trip_checklist(db: Session, trip: Trip) -> ChecklistResponse:
    """
    Retrieves or generates a tailored packing checklist for the given trip.
    """
    checklist = db.query(Checklist).filter(Checklist.trip_id == trip.id).first()
    
    if not checklist:
        checklist = Checklist(trip_id=trip.id)
        db.add(checklist)
        db.flush()

        # Seed default essentials
        for item_text, cat in DEFAULT_ESSENTIALS:
            db.add(ChecklistItem(
                checklist_id=checklist.id,
                item=item_text,
                category=cat,
                is_completed=False,
                is_custom=False
            ))

        # Check interests
        trip_interests_str = (trip.interests or "").lower()
        added_items = set()

        for interest_key, items in INTEREST_SPECIFIC_ITEMS.items():
            if interest_key in trip_interests_str:
                for item_text, cat in items:
                    if item_text not in added_items:
                        db.add(ChecklistItem(
                            checklist_id=checklist.id,
                            item=item_text,
                            category=cat,
                            is_completed=False,
                            is_custom=False
                        ))
                        added_items.add(item_text)

        db.commit()
        db.refresh(checklist)

    # Compute progress stats
    items = db.query(ChecklistItem).filter(ChecklistItem.checklist_id == checklist.id).order_by(ChecklistItem.id).all()
    total_count = len(items)
    completed_count = sum(1 for it in items if it.is_completed)
    progress_pct = round((completed_count / total_count * 100.0), 1) if total_count > 0 else 0.0

    return ChecklistResponse(
        id=checklist.id,
        trip_id=trip.id,
        total_items=total_count,
        completed_items=completed_count,
        progress_percentage=progress_pct,
        items=[ChecklistItemResponse.model_validate(it) for it in items]
    )
