import json
import urllib.error
import urllib.request

BASE_URL = "http://localhost:8000"

DEMO_USER = {
    "full_name": "Demo User",
    "email": "demo@flowops.dev",
    "password": "Demo12345",
}

ORGANIZATION_NAME = "FlowOps Demo Company"

PRODUCTS = [
    {
        "name": "Industrial Compressor X100",
        "sku": "COMP-X100",
        "description": "High-performance industrial compressor for B2B operations.",
        "unit_price": 12500,
        "stock_quantity": 15,
    },
    {
        "name": "Diesel Generator G500",
        "sku": "GEN-G500",
        "description": "Reliable diesel generator for factories and warehouses.",
        "unit_price": 18500,
        "stock_quantity": 8,
    },
    {
        "name": "Hydraulic Pump H220",
        "sku": "PUMP-H220",
        "description": "Durable hydraulic pump for production lines.",
        "unit_price": 7400,
        "stock_quantity": 22,
    },
]


def request_json(method, path, data=None, token=None):
    url = f"{BASE_URL}{path}"

    headers = {
        "Content-Type": "application/json",
    }

    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = None

    if data is not None:
        body = json.dumps(data).encode("utf-8")

    request = urllib.request.Request(
        url=url,
        data=body,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(request) as response:
            response_body = response.read().decode("utf-8")

            if not response_body:
                return None

            return json.loads(response_body)

    except urllib.error.HTTPError as error:
        response_body = error.read().decode("utf-8")

        try:
            parsed_error = json.loads(response_body)
        except json.JSONDecodeError:
            parsed_error = response_body

        return {
            "error": True,
            "status": error.code,
            "detail": parsed_error,
        }


def register_demo_user():
    response = request_json("POST", "/api/auth/register", DEMO_USER)

    if isinstance(response, dict) and response.get("error"):
        print("Demo user may already exist. Continuing...")
    else:
        print("Demo user created.")

    return response


def login_demo_user():
    response = request_json(
        "POST",
        "/api/auth/login",
        {
            "email": DEMO_USER["email"],
            "password": DEMO_USER["password"],
        },
    )

    if not response or response.get("error") or "access_token" not in response:
        raise RuntimeError(f"Login failed: {response}")

    print("Demo user logged in.")
    return response["access_token"]


def get_or_create_organization(token):
    organizations = request_json("GET", "/api/organizations", token=token)

    if isinstance(organizations, list):
        for organization in organizations:
            if organization.get("name") == ORGANIZATION_NAME:
                print("Demo organization already exists.")
                return organization

    response = request_json(
        "POST",
        "/api/organizations",
        {
            "name": ORGANIZATION_NAME,
        },
        token=token,
    )

    if not response or response.get("error"):
        raise RuntimeError(f"Organization creation failed: {response}")

    print("Demo organization created.")
    return response


def get_products(organization_id, token):
    response = request_json(
        "GET",
        f"/api/organizations/{organization_id}/products",
        token=token,
    )

    if isinstance(response, list):
        return response

    if isinstance(response, dict) and "items" in response:
        return response["items"]

    return []

def create_missing_products(organization_id, token):
    existing_products = get_products(organization_id, token)
    existing_skus = {product.get("sku") for product in existing_products}

    for product in PRODUCTS:
        if product["sku"] in existing_skus:
            print(f"Product already exists: {product['sku']}")
            continue

        response = request_json(
            "POST",
            f"/api/organizations/{organization_id}/products",
            product,
            token=token,
        )

        if isinstance(response, dict) and response.get("error"):
            print(f"Product could not be created: {product['sku']}")
            print(response)
        else:
            print(f"Product created: {product['sku']}")

    return get_products(organization_id, token)


def create_demo_order(organization_id, products, token):
    if len(products) < 2:
        print("Not enough products to create a demo order.")
        return None

    response = request_json(
        "POST",
        f"/api/organizations/{organization_id}/orders",
        {
            "customer_name": "ABC Manufacturing Ltd.",
            "customer_email": "purchasing@abcmanufacturing.com",
            "items": [
                {
                    "product_id": products[0]["id"],
                    "quantity": 2,
                },
                {
                    "product_id": products[1]["id"],
                    "quantity": 1,
                },
            ],
        },
        token=token,
    )

    if isinstance(response, dict) and response.get("error"):
        print("Demo order could not be created.")
        print(response)
        return None

    print("Demo order created.")
    return response


def main():
    print("Starting FlowOps demo seed...")

    register_demo_user()
    token = login_demo_user()

    organization = get_or_create_organization(token)
    organization_id = organization["id"]

    products = create_missing_products(organization_id, token)
    create_demo_order(organization_id, products, token)

    print("Demo seed completed.")
    print(f"Frontend: {BASE_URL.replace(':8000', ':3000')}")
    print(f"Backend docs: {BASE_URL}/docs")


if __name__ == "__main__":
    main()
