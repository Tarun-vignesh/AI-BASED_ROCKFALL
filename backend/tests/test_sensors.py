from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_sensor_endpoints():
    response = client.get("/api/sensors/?mine_site_id=ms-001-demo-mine")
    assert response.status_code == 200
    sensors = response.json()
    assert isinstance(sensors, list)

    if sensors:
        s_id = sensors[0]["id"]
        history_resp = client.get(f"/api/sensors/{s_id}/history")
        assert history_resp.status_code == 200
