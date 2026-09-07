import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_registration_and_login():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@rockfall.ai"
    password = "TestPassword123"

    # Register
    reg_response = client.post(
        "/api/auth/register",
        json={
            "email": unique_email,
            "password": password,
            "full_name": "Test Engineer",
            "role": "engineer",
        },
    )
    assert reg_response.status_code == 200, reg_response.text
    user_data = reg_response.json()
    assert user_data["email"] == unique_email

    # Login JSON
    login_response = client.post(
        "/api/auth/login",
        json={"email": unique_email, "password": password},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Access /me
    me_response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == unique_email
