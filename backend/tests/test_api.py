import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.session import Base, get_db
from app.core.seed_data import SAMPLE_PLACES
from app.models.place import Place

# Setup an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True, scope="module")
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Seed sample places
    for p_dict in SAMPLE_PLACES:
        db.add(Place(**p_dict))
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_user_registration_and_login():
    # 1. Register
    reg_payload = {
        "email": "traveler@test.com",
        "password": "Password@123",
        "full_name": "Test Traveler",
        "home_location": "Hyderabad",
        "preferred_travel_style": "balanced",
        "default_budget": 5000.0,
        "interests": "Nature,Food,Sightseeing"
    }
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "traveler@test.com"

    # Duplicate registration should fail
    dup_resp = client.post("/api/auth/register", json=reg_payload)
    assert dup_resp.status_code == 400

    # 2. Login
    login_resp = client.post("/api/auth/login", json={
        "email": "traveler@test.com",
        "password": "Password@123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # 3. Access protected route /api/auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["full_name"] == "Test Traveler"


def test_places_and_recommendations():
    # Fetch places
    resp = client.get("/api/places?city=Hyderabad")
    assert resp.status_code == 200
    places = resp.json()
    assert len(places) > 0
    assert all(p["city"] == "Hyderabad" for p in places)

    # Post recommendation request
    rec_payload = {
        "starting_location": "Hyderabad",
        "destination": "Hyderabad",
        "interests": ["Nature", "Food", "Sightseeing"],
        "number_of_days": 2,
        "budget": 5000.0,
        "number_of_travelers": 2,
        "travel_style": "balanced"
    }
    rec_resp = client.post("/api/places/recommendations", json=rec_payload)
    assert rec_resp.status_code == 200
    recs = rec_resp.json()
    assert len(recs) > 0
    assert recs[0]["match_score"] is not None


def test_trip_creation_itinerary_and_budget():
    # Login as traveler
    login_resp = client.post("/api/auth/login", json={
        "email": "traveler@test.com",
        "password": "Password@123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create 2-day trip to Hyderabad
    trip_payload = {
        "title": "Weekend Getaway in Hyderabad",
        "starting_location": "Hyderabad",
        "destination": "Hyderabad",
        "number_of_days": 2,
        "number_of_travelers": 2,
        "budget": 5000.0,
        "travel_style": "balanced",
        "interests": "Nature,Food,Sightseeing",
        "auto_generate": True
    }
    trip_resp = client.post("/api/trips", json=trip_payload, headers=headers)
    assert trip_resp.status_code == 201
    trip_data = trip_resp.json()
    trip_id = trip_data["id"]

    assert len(trip_data["itinerary_days"]) == 2
    # Verify items exist in Day 1 and Day 2
    assert len(trip_data["itinerary_days"][0]["items"]) > 0
    assert len(trip_data["itinerary_days"][1]["items"]) > 0

    # Test Budget API
    budget_resp = client.get(f"/api/trips/{trip_id}/budget", headers=headers)
    assert budget_resp.status_code == 200
    budget = budget_resp.json()
    assert budget["user_budget"] == 5000.0
    assert "breakdown" in budget
    assert "transportation" in budget["breakdown"]
    assert "food" in budget["breakdown"]

    # Test Checklist API
    checklist_resp = client.get(f"/api/trips/{trip_id}/checklist", headers=headers)
    assert checklist_resp.status_code == 200
    checklist = checklist_resp.json()
    assert checklist["total_items"] > 0
    first_item = checklist["items"][0]

    # Toggle checklist item
    item_id = first_item["id"]
    put_resp = client.put(f"/api/checklist/items/{item_id}", json={"is_completed": True}, headers=headers)
    assert put_resp.status_code == 200
    assert put_resp.json()["is_completed"] is True
