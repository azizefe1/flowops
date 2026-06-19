from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def create_test_user_and_token() -> str:
    unique_email = f"workflow-{uuid4()}@example.com"

    register_response = client.post(
        "/api/auth/register",
        json={
            "email": unique_email,
            "password": "Test12345",
            "full_name": "Workflow Test User",
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

    return login_response.json()["access_token"]


def test_organization_product_dashboard_and_audit_log_flow():
    token = create_test_user_and_token()

    headers = {
        "Authorization": f"Bearer {token}",
    }

    organization_response = client.post(
        "/api/organizations",
        json={
            "name": f"Workflow Organization {uuid4()}",
        },
        headers=headers,
    )

    assert organization_response.status_code == 201

    organization_id = organization_response.json()["id"]

    product_response = client.post(
        f"/api/organizations/{organization_id}/products",
        json={
            "name": "Workflow Test Product",
            "sku": f"WF-{uuid4()}",
            "category": "generator",
            "description": "Created by automated workflow test",
            "unit_price": "15000.00",
            "stock_quantity": 10,
            "low_stock_threshold": 2,
        },
        headers=headers,
    )

    assert product_response.status_code == 201

    dashboard_response = client.get(
        f"/api/organizations/{organization_id}/dashboard",
        headers=headers,
    )

    assert dashboard_response.status_code == 200
    assert dashboard_response.json()["total_products"] >= 1

    audit_logs_response = client.get(
        f"/api/organizations/{organization_id}/audit-logs",
        headers=headers,
    )

    assert audit_logs_response.status_code == 200

    audit_logs = audit_logs_response.json()

    assert any(
        audit_log["action"] == "product.created"
        for audit_log in audit_logs
    )