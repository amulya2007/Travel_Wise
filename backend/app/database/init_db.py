import logging
from sqlalchemy.orm import Session
from app.database.session import engine, Base, SessionLocal
from app.models.place import Place
from app.models.user import User
from app.core.security import get_password_hash
from app.core.seed_data import SAMPLE_PLACES

logger = logging.getLogger(__name__)


def init_db():
    # Create all database tables
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Seed places if database has no places
        existing_places_count = db.query(Place).count()
        if existing_places_count == 0:
            logger.info("Seeding initial places data...")
            for place_dict in SAMPLE_PLACES:
                place = Place(**place_dict)
                db.add(place)
            db.commit()
            logger.info(f"Successfully seeded {len(SAMPLE_PLACES)} destinations and places.")

        # Ensure demo user exists
        demo_user = db.query(User).filter(User.email == "demo@travelwise.io").first()
        if not demo_user:
            demo_user = User(
                email="demo@travelwise.io",
                hashed_password=get_password_hash("Travel@123"),
                full_name="Demo Traveler",
                home_location="Hyderabad",
                preferred_travel_style="balanced",
                default_budget=5000.0,
                interests="Nature,Food,Sightseeing",
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            logger.info("Demo user 'demo@travelwise.io' created successfully.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
