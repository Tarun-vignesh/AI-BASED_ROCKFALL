import os
import sys
import time
import random
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.services.sensor_service import record_sensor_data
from app.schemas.sensor import SensorDataCreate
from app.services.prediction_service import generate_and_save_prediction
from app.schemas.prediction import PredictionRequest


def generate_stream():
    db = SessionLocal()
    print("[Simulator] Starting continuous sensor telemetry stream generation...")
    try:
        stations = ["ss-001", "ss-002", "ss-003", "ss-004"]
        data_types = ["vibration", "tilt", "displacement", "moisture", "rainfall"]

        for _ in range(5):
            station_id = random.choice(stations)
            dtype = random.choice(data_types)
            val = round(random.uniform(0.1, 3.5), 2)
            unit = "g" if dtype == "vibration" else ("°" if dtype == "tilt" else ("mm/hr" if dtype in ["displacement", "rainfall"] else "%"))

            reading_in = SensorDataCreate(
                sensor_station_id=station_id,
                data_type=dtype,
                value=val,
                unit=unit,
                raw_data={"simulated": True, "generated_at": datetime.utcnow().isoformat()},
            )
            record_sensor_data(db, reading_in)

        # Trigger prediction update
        pred_req = PredictionRequest(
            mine_site_id="ms-001-demo-mine",
            sensor_data={
                "vibration": round(random.uniform(0.2, 1.5), 2),
                "tilt": round(random.uniform(1.0, 4.0), 2),
                "displacement": round(random.uniform(0.5, 3.0), 2),
                "moisture": round(random.uniform(50.0, 90.0), 1),
            },
            weather_data={"rainfall": round(random.uniform(10.0, 60.0), 1)},
            indian_conditions={"geological_type": "Laterite", "monsoon_season": True},
        )
        pred = generate_and_save_prediction(db, pred_req)
        print(f"[Simulator] Generated reading & prediction: Risk = {pred.risk_probability * 100:.1f}%")

    except Exception as e:
        print(f"[Simulator] Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    generate_stream()
