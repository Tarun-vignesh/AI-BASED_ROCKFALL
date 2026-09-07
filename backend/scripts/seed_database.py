import os
import sys
import uuid
from datetime import datetime

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, engine
from app.db.init_db import init_db
from app.models.mine_site import MineSite
from app.models.user import User
from app.models.sensor_station import SensorStation
from app.models.ai_model import AIModel
from app.models.prediction import Prediction
from app.models.risk_assessment import RiskAssessment
from app.models.alert import Alert
from app.models.indian_conditions import IndianCondition
from app.core.security import get_password_hash


def seed():
    db = SessionLocal()
    try:
        print("[Seed] Initializing MySQL tables...")
        init_db(db)

        # 1. Mine Site
        mine = db.query(MineSite).filter(MineSite.id == "ms-001-demo-mine").first()
        if not mine:
            mine = MineSite(
                id="ms-001-demo-mine",
                name="Bellary Iron Ore Open Pit Mine",
                description="Primary open-cast iron ore mine in Karnataka, India",
                location={"latitude": 15.1424, "longitude": 76.9214, "elevation": 485, "region": "Karnataka, India"},
                area_boundaries={"type": "Polygon", "coordinates": [[[76.92, 15.14], [76.93, 15.14], [76.93, 15.15], [76.92, 15.15], [76.92, 15.14]]]},
                status="active",
            )
            db.add(mine)
            db.commit()
            print("[Seed] Created demo mine site: Bellary Iron Ore Open Pit Mine")

        # 2. Users
        users_data = [
            ("admin@rockfall.ai", "Admin@123", "Chief Mine Safety Officer", "admin"),
            ("engineer@rockfall.ai", "Engineer@123", "Senior Geotechnical Engineer", "engineer"),
            ("operator@rockfall.ai", "Operator@123", "Field Safety Operator", "operator"),
        ]

        for email, passw, name, role in users_data:
            existing = db.query(User).filter(User.email == email).first()
            if not existing:
                u = User(
                    email=email,
                    password_hash=get_password_hash(passw),
                    full_name=name,
                    role=role,
                    mine_site_id="ms-001-demo-mine",
                    notification_preferences={"email": True, "sms": True, "inApp": True},
                )
                db.add(u)
                print(f"[Seed] Created user: {email} ({role})")
        db.commit()

        # 3. AI Model
        model = db.query(AIModel).filter(AIModel.id == "mod-001-rf-v1").first()
        if not model:
            model = AIModel(
                id="mod-001-rf-v1",
                model_name="RandomForest Rockfall Classifier",
                model_type="RandomForestClassifier",
                model_version="1.2.0",
                accuracy_score=0.947,
                training_data_size=15000,
                indian_specific=True,
                active=True,
            )
            db.add(model)
            db.commit()
            print("[Seed] Created AI Model record")

        # 4. Sensor Stations
        stations = [
            ("ss-001", "North Wall Piezometer & Tilt Alpha", "tiltmeter", {"latitude": 15.1430, "longitude": 76.9220}),
            ("ss-002", "East Slope Extensometer Beta", "extensometer", {"latitude": 15.1440, "longitude": 76.9230}),
            ("ss-003", "South Bench Seismometer Gamma", "seismometer", {"latitude": 15.1410, "longitude": 76.9210}),
            ("ss-004", "West Crest Weather Station", "weather_station", {"latitude": 15.1450, "longitude": 76.9200}),
        ]

        for s_id, s_name, s_type, loc in stations:
            st = db.query(SensorStation).filter(SensorStation.id == s_id).first()
            if not st:
                st = SensorStation(
                    id=s_id,
                    mine_site_id="ms-001-demo-mine",
                    station_name=s_name,
                    sensor_type=s_type,
                    location=loc,
                    status="active",
                    last_reading_at=datetime.utcnow(),
                )
                db.add(st)
        db.commit()
        print("[Seed] Created sensor stations")

        # 5. Indian Conditions
        ic = db.query(IndianCondition).filter(IndianCondition.id == "ic-001").first()
        if not ic:
            ic = IndianCondition(
                id="ic-001",
                mine_site_id="ms-001-demo-mine",
                geological_type="Laterite",
                groundwater_level=4.5,
                humidity_percent=78.0,
                monsoon_season=True,
                rainfall_intensity="Heavy",
                seismic_activity_level="Low",
                temperature_celsius=31.5,
                wind_speed_kmh=18.5,
            )
            db.add(ic)
            db.commit()

        # 6. Sample Alert
        alt = db.query(Alert).filter(Alert.id == "alt-001").first()
        if not alt:
            alt = Alert(
                id="alt-001",
                mine_site_id="ms-001-demo-mine",
                alert_type="rockfall_warning",
                severity="high",
                title="Elevated Slope Deformation Detected on North Wall",
                description="Extensometer readings indicate displacement rate exceeds 1.5mm/hr combined with heavy monsoon saturation.",
                affected_areas=["North Wall Bench 3", "Haul Road B"],
                action_required="Evacuate personnel from Bench 3. Restrict heavy vehicle movement on Haul Road B.",
                status="active",
            )
            db.add(alt)
            db.commit()
            print("[Seed] Created initial alert")

        print("[Seed] Database seeding complete!")
    except Exception as e:
        print(f"[Seed] Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
