from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_prediction_endpoint():
    payload = {
        "mine_site_id": "ms-001-demo-mine",
        "sensor_data": {
            "vibration": 1.2,
            "tilt": 3.4,
            "displacement": 2.5,
            "moisture": 75.0,
        },
        "weather_data": {"rainfall": 45.0},
        "indian_conditions": {"geological_type": "Laterite", "monsoon_season": True},
    }

    response = client.post("/api/predictions/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_probability" in data
    assert "confidence_level" in data
    assert "risk_level" in data
