from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_alerts_endpoints():
    response = client.get("/api/alerts/ms-001-demo-mine")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)
