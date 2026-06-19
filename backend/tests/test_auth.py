from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_register_and_login_user():
    unique_email = f"test-{uuid4()}@example.com"

    register_response = client.post(
        "/api/auth/register",
        json={
            "email": unique_email,
            "password": "Test12345",
            "full_name": "Test User",
        },
    )

    assert register_response.status_code in [200, 201]

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": unique_email,
            "password": "Test12345",
        },
    )

    assert login_response.status_code == 200

    data = login_response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_with_wrong_password_fails():
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "not-existing-user@example.com",
            "password": "WrongPassword123",
        },
    )

    assert login_response.status_code in [401, 404]