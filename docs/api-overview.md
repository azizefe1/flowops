# FlowOps API Overview

This document provides an overview of the main API modules in the FlowOps backend.

FlowOps is a multi-tenant B2B operations platform. Most business endpoints are organization-based and require JWT authentication.

## Base URL

For local development:

~~~text
http://127.0.0.1:8000
~~~

Swagger documentation:

~~~text
http://127.0.0.1:8000/docs
~~~

## Authentication

Protected endpoints require a JWT access token.

The token must be sent in the Authorization header:

~~~text
Authorization: Bearer <access_token>
~~~

In Swagger UI, the token can be entered through the `Authorize` button.

## Health Endpoints

### Root Endpoint

~~~http
GET /
~~~

Purpose:

- Check if the API is running.

Example response:

~~~json
{
  "message": "FlowOps API is running",
  "environment": "development"
}
~~~

### Health Check

~~~http
GET /api/health
~~~

Purpose:

- Check application health.

Example response:

~~~json
{
  "status": "ok",
  "app": "FlowOps"
}
~~~

### Database Health Check

~~~http
GET /api/health/database
~~~

Purpose:

- Check database connection status.

Example response:

~~~json
{
  "status": "ok",
  "database": "connected"
}
~~~

## Auth API

Base path:

~~~text
/api/auth
~~~

### Register User

~~~http
POST /api/auth/register
~~~

Purpose:

- Create a new user account.

Example request:

~~~json
{
  "email": "user@example.com",
  "password": "Test12345",
  "full_name": "Test User"
}
~~~

### Login User

~~~http
POST /api/auth/login
~~~

Purpose:

- Authenticate user and return JWT token.

Example request:

~~~json
{
  "email": "user@example.com",
  "password": "Test12345"
}
~~~

Example response:

~~~json
{
  "access_token": "jwt_token_value",
  "token_type": "bearer"
}
~~~

## Organization API

Base path:

~~~text
/api/organizations
~~~

Organization endpoints require authentication.

### Create Organization

~~~http
POST /api/organizations
~~~

Purpose:

- Create a new organization.
- The authenticated user becomes the owner of the organization.
- An audit log is created for the organization creation action.

Example request:

~~~json
{
  "name": "Aziz Tech Solutions"
}
~~~

### List Organizations

~~~http
GET /api/organizations
~~~

Purpose:

- List organizations that the authenticated user belongs to.

### Get Organization Detail

~~~http
GET /api/organizations/{organization_id}
~~~

Purpose:

- Get details of a specific organization.
- User must be a member of the organization.

## Product API

Base path:

~~~text
/api/organizations/{organization_id}/products
~~~

Product endpoints require authentication and organization membership.

Write operations require owner or manager role. Staff users can view products but cannot create, update, or deactivate products.

### Create Product

~~~http
POST /api/organizations/{organization_id}/products
~~~

Purpose:

- Create a product inside an organization.
- SKU must be unique inside the organization.
- An audit log is created for product creation.

Example request:

~~~json
{
  "name": "Industrial Generator",
  "sku": "GEN-001",
  "category": "generator",
  "description": "Diesel generator for business use",
  "unit_price": "15000.00",
  "stock_quantity": 10,
  "low_stock_threshold": 2
}
~~~

### List Products

~~~http
GET /api/organizations/{organization_id}/products?page=1&page_size=20&search=generator
~~~

Purpose:

- List products that belong to the organization.
- Supports pagination.
- Supports search by product name, SKU, or category.

Query parameters:

~~~text
page
page_size
search
~~~

Example response:

~~~json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "pages": 0
}
~~~

### Get Product Detail

~~~http
GET /api/organizations/{organization_id}/products/{product_id}
~~~

Purpose:

- Get details of a specific product.

### Update Product

~~~http
PUT /api/organizations/{organization_id}/products/{product_id}
~~~

Purpose:

- Update product information.
- An audit log is created for product update.

### Deactivate Product

~~~http
DELETE /api/organizations/{organization_id}/products/{product_id}
~~~

Purpose:

- Deactivate a product instead of permanently deleting it.
- An audit log is created for product deactivation.

## Inventory API

Base path:

~~~text
/api/organizations/{organization_id}/inventory-movements
~~~

Inventory endpoints require authentication and organization membership.

Creating inventory movements requires owner or manager role. Staff users can view inventory movement history.

### Create Inventory Movement

~~~http
POST /api/organizations/{organization_id}/inventory-movements
~~~

Purpose:

- Create stock-in, stock-out, or stock adjustment movement.
- Update product stock quantity.
- Create inventory movement history.
- Create audit log record.

Accepted movement types:

~~~text
stock_in
stock_out
adjustment
~~~

Example stock-in request:

~~~json
{
  "product_id": "product_uuid",
  "movement_type": "stock_in",
  "quantity": 5,
  "reason": "New stock added"
}
~~~

Example stock-out request:

~~~json
{
  "product_id": "product_uuid",
  "movement_type": "stock_out",
  "quantity": 2,
  "reason": "Manual stock removal"
}
~~~

Example adjustment request:

~~~json
{
  "product_id": "product_uuid",
  "movement_type": "adjustment",
  "quantity": 20,
  "reason": "Stock count correction"
}
~~~

### List Inventory Movements

~~~http
GET /api/organizations/{organization_id}/inventory-movements?page=1&page_size=20&movement_type=stock_in
~~~

Purpose:

- List inventory movement history for the organization.
- Supports pagination.
- Supports filtering by movement type.

Query parameters:

~~~text
page
page_size
movement_type
~~~

Accepted movement type filter values:

~~~text
stock_in
stock_out
adjustment
~~~

Example response:

~~~json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "pages": 0
}
~~~

## Order API

Base path:

~~~text
/api/organizations/{organization_id}/orders
~~~

Order endpoints require authentication and organization membership.

Creating orders and updating order status require owner or manager role. Staff users can view orders.

### Create Order

~~~http
POST /api/organizations/{organization_id}/orders
~~~

Purpose:

- Create a customer order.
- Add one or more products to the order.
- Check product stock.
- Automatically reduce stock.
- Create stock-out inventory movements.
- Create audit log record.

Example request:

~~~json
{
  "customer_name": "Demo Customer",
  "customer_email": "customer@example.com",
  "items": [
    {
      "product_id": "product_uuid",
      "quantity": 1
    }
  ]
}
~~~

### List Orders

~~~http
GET /api/organizations/{organization_id}/orders?page=1&page_size=20&status=pending
~~~

Purpose:

- List organization orders.
- Supports pagination.
- Supports filtering by order status.

Query parameters:

~~~text
page
page_size
status
~~~

Accepted status filter values:

~~~text
pending
approved
shipped
completed
cancelled
~~~

Example response:

~~~json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "pages": 0
}
~~~

### Get Order Detail

~~~http
GET /api/organizations/{organization_id}/orders/{order_id}
~~~

Purpose:

- Get details of a specific order with order items.

### Update Order Status

~~~http
PATCH /api/organizations/{organization_id}/orders/{order_id}/status
~~~

Purpose:

- Update order status.
- Create audit log record.
- If the order is cancelled, product stock is restored automatically.

Accepted order statuses:

~~~text
pending
approved
shipped
completed
cancelled
~~~

Example request:

~~~json
{
  "status": "approved"
}
~~~

Cancel example:

~~~json
{
  "status": "cancelled"
}
~~~

## Dashboard API

Base path:

~~~text
/api/organizations/{organization_id}/dashboard
~~~

Dashboard endpoint requires authentication and organization membership.

### Get Dashboard Summary

~~~http
GET /api/organizations/{organization_id}/dashboard
~~~

Purpose:

- Return summary metrics for the organization.

Returned data includes:

~~~text
total_products
active_products
low_stock_products
total_orders
pending_orders
completed_orders
cancelled_orders
total_order_value
total_inventory_movements
recent_orders
low_stock_items
~~~

Example response:

~~~json
{
  "total_products": 2,
  "active_products": 2,
  "low_stock_products": 0,
  "total_orders": 1,
  "pending_orders": 1,
  "completed_orders": 0,
  "cancelled_orders": 0,
  "total_order_value": "15000.00",
  "total_inventory_movements": 3,
  "recent_orders": [],
  "low_stock_items": []
}
~~~

## Audit Log API

Base path:

~~~text
/api/organizations/{organization_id}/audit-logs
~~~

Audit log endpoint requires authentication and organization membership.

Viewing audit logs requires owner or manager role.

### List Audit Logs

~~~http
GET /api/organizations/{organization_id}/audit-logs?page=1&page_size=20&action=product.created
~~~

Purpose:

- List recent audit logs for the organization.
- Helps track important user and system actions.
- Supports pagination.
- Supports filtering by action.

Query parameters:

~~~text
page
page_size
action
~~~

Common action filter values:

~~~text
organization.created
product.created
product.updated
product.deactivated
inventory.movement.created
order.created
order.status_changed
~~~

Example response:

~~~json
{
  "items": [
    {
      "id": "audit_log_uuid",
      "organization_id": "organization_uuid",
      "user_id": "user_uuid",
      "action": "product.created",
      "entity_type": "product",
      "entity_id": "product_uuid",
      "details": {
        "name": "Industrial Generator",
        "sku": "GEN-001"
      },
      "created_at": "2026-06-19T19:00:00"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "pages": 1
}
~~~

## Common API Workflow

~~~text
1. Register a user
2. Login and get access token
3. Create an organization
4. Create products inside the organization
5. Create inventory movements
6. Create orders
7. View dashboard summary
8. Review audit logs
~~~

## Error Handling

Common response codes:

~~~text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Content
500 Internal Server Error
~~~

Examples:

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User does not have permission for the requested action
- `404 Not Found`: Organization, product, or order not found
- `409 Conflict`: Duplicate organization name or duplicate SKU
- `422 Unprocessable Content`: Invalid request body
