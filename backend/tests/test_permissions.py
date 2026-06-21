from uuid import uuid4

from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app
from app.models.organization_member import OrganizationMember, OrganizationRole
from app.models.user import User


client = TestClient(app)


def create_test_user_and_token(prefix: str) -> tuple[str, str]:
    unique_email = f"{prefix}-{uuid4()}@example.com"

    register_response = client.post(
        "/api/auth/register",
        json={
            "email": unique_email,
            "password": "Test12345",
            "full_name": f"{prefix.title()} Test User",
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

    return unique_email, login_response.json()["access_token"]


def get_user_id_by_email(email: str):
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        return user.id
    finally:
        db.close()


def add_staff_member_to_organization(organization_id: str, user_id: str) -> None:
    db = SessionLocal()

    try:
        membership = OrganizationMember(
            organization_id=organization_id,
            user_id=user_id,
            role=OrganizationRole.staff,
        )

        db.add(membership)
        db.commit()
    finally:
        db.close()


def test_staff_can_list_products_but_cannot_create_product():
    owner_email, owner_token = create_test_user_and_token("owner")
    staff_email, staff_token = create_test_user_and_token("staff")

    owner_headers = {
        "Authorization": f"Bearer {owner_token}",
    }

    staff_headers = {
        "Authorization": f"Bearer {staff_token}",
    }

    organization_response = client.post(
        "/api/organizations",
        json={
            "name": f"Permission Organization {uuid4()}",
        },
        headers=owner_headers,
    )

    assert organization_response.status_code == 201

    organization_id = organization_response.json()["id"]

    staff_user_id = get_user_id_by_email(staff_email)
    add_staff_member_to_organization(organization_id, staff_user_id)

    owner_product_response = client.post(
        f"/api/organizations/{organization_id}/products",
        json={
            "name": "Permission Test Product",
            "sku": f"PERM-{uuid4()}",
            "category": "generator",
            "description": "Created by owner during permission test",
            "unit_price": "12000.00",
            "stock_quantity": 5,
            "low_stock_threshold": 1,
        },
        headers=owner_headers,
    )

    assert owner_product_response.status_code == 201

    staff_list_response = client.get(
        f"/api/organizations/{organization_id}/products",
        headers=staff_headers,
    )

    assert staff_list_response.status_code == 200
    assert len(staff_list_response.json()) >= 1

    staff_create_response = client.post(
        f"/api/organizations/{organization_id}/products",
        json={
            "name": "Unauthorized Staff Product",
            "sku": f"STAFF-{uuid4()}",
            "category": "generator",
            "description": "Staff should not be able to create this product",
            "unit_price": "9000.00",
            "stock_quantity": 3,
            "low_stock_threshold": 1,
        },
        headers=staff_headers,
    )

    assert staff_create_response.status_code == 403
