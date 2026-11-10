"""Database seed script — populates demo data."""
import asyncio
import uuid
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from app.database import AsyncSessionLocal, engine, Base
from app.models import *
from app.utils.data_simulator import generate_historical_accidents, generate_simulated_ambulances
from app.auth.service import hash_password
from datetime import datetime


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Create admin user
        admin = User(
            id=uuid.uuid4(),
            name="Admin User",
            email="admin@roadsafety.ai",
            password_hash=hash_password("Admin@123"),
            role=UserRole.ADMIN,
        )
        officer = User(
            id=uuid.uuid4(),
            name="Traffic Officer",
            email="officer@roadsafety.ai",
            password_hash=hash_password("Officer@123"),
            role=UserRole.OFFICER,
        )
        public_user = User(
            id=uuid.uuid4(),
            name="Demo User",
            email="demo@roadsafety.ai",
            password_hash=hash_password("Demo@123"),
            role=UserRole.PUBLIC,
        )
        db.add_all([admin, officer, public_user])

        # Seed accidents
        accidents = generate_historical_accidents(200)
        severity_map = {"minor": AccidentSeverity.MINOR, "moderate": AccidentSeverity.MODERATE,
                        "severe": AccidentSeverity.SEVERE, "fatal": AccidentSeverity.FATAL}
        for a in accidents:
            acc = Accident(
                id=uuid.UUID(a["id"]),
                latitude=a["latitude"],
                longitude=a["longitude"],
                severity=severity_map[a["severity"]],
                date_time=datetime.fromisoformat(a["date_time"]),
                weather_condition=a["weather_condition"],
                road_type=a["road_type"],
                vehicle_count=a["vehicle_count"],
                casualties=a["casualties"],
                is_predicted=False,
                source=a["source"],
            )
            db.add(acc)

        # Seed ambulances
        ambulances = generate_simulated_ambulances(20)
        for amb in ambulances:
            a = Ambulance(
                id=uuid.UUID(amb["id"]),
                registration_no=amb["registration_no"],
                latitude=amb["latitude"],
                longitude=amb["longitude"],
                status=amb["status"],
                hospital_name=amb["hospital_name"],
                hospital_lat=amb["hospital_lat"],
                hospital_lng=amb["hospital_lng"],
                contact_number=amb["contact_number"],
                is_simulated=True,
            )
            db.add(a)

        await db.commit()
        print("✅ Seed data created successfully!")
        print("   Admin:   admin@roadsafety.ai / Admin@123")
        print("   Officer: officer@roadsafety.ai / Officer@123")
        print("   Public:  demo@roadsafety.ai / Demo@123")


if __name__ == "__main__":
    asyncio.run(seed())
