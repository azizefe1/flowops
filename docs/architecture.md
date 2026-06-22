# FlowOps Architecture

FlowOps is designed as a modular full-stack application for a multi-tenant B2B operations platform.

The backend is built with FastAPI and follows a layered structure that separates API routing, database models, request/response schemas, configuration, database access, authorization helpers, and business services.

The frontend is built with Next.js and communicates with the backend through authenticated API requests.

## High-Level Architecture

~~~text
Client / Browser / Swagger UI
        |
        v
Next.js Frontend
        |
        v
FastAPI Application
        |
        v
API Routers
        |
        v
Schemas / Validation
        |
        v
Authorization and Business Logic
        |
        v
SQLAlchemy ORM
        |
        v
PostgreSQL Database
~~~

## Main Backend Layers

### API Layer

The API layer contains FastAPI routers.
Each router is responsible for a specific business module.

Main API modules:

~~~text
auth.py
organizations.py
products.py
inventory.py
orders.py
dashboard.py
audit_logs.py
~~~

The API layer handles:

- HTTP request routing
- Authentication dependency checks
- Organization membership checks
- Role-based authorization checks
- Request validation
- Pagination, search, and filtering query parameters
- Response formatting
- Error responses

## Schema Layer

Schemas are built with Pydantic and define request and response structures.

Schema modules include:

~~~text
auth.py
user.py
organization.py
product.py
inventory.py
order.py
dashboard.py
audit_log.py
~~~

The schema layer helps keep the API consistent and prevents invalid data from reaching the business logic.

Several list endpoints use paginated response schemas with the following common structure:

~~~json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "pages": 0
}
~~~

This structure is used by products, inventory movements, orders, and audit logs.

## Model Layer

The model layer uses SQLAlchemy ORM models.

Main models:

~~~text
User
Organization
OrganizationMember
Product
InventoryMovement
Order
OrderItem
AuditLog
~~~

These models represent the main database tables and relationships.

## Service Layer

The service layer contains reusable helper logic.

Current services:

~~~text
security.py
slug.py
audit.py
permissions.py
~~~

Examples:

- Password hashing
- JWT token creation
- Slug generation
- Audit log creation
- Organization membership checks
- Role-based permission checks

## Multi-Tenant Design

FlowOps uses organization-based data separation.

Most business records include an `organization_id` field.
This ensures that products, inventory movements, orders, dashboard data, and audit logs belong to a specific organization.

Before accessing organization data, the backend checks whether the current user is a member of that organization.

This is handled through centralized permission helpers:

~~~text
require_organization_member()
require_organization_manager()
require_organization_owner()
~~~

## Role-Based Authorization

FlowOps supports organization-level roles.

Current roles:

~~~text
owner
manager
staff
~~~

Permission behavior:

- Owners have full organization-level access.
- Managers can manage operational resources such as products, inventory movements, and orders.
- Staff users can view allowed operational data but cannot create or modify protected resources.

This authorization logic is centralized in the permission service so API routers do not duplicate role-checking code.

## Authentication Flow

FlowOps uses JWT-based authentication.

Basic flow:

~~~text
1. User registers
2. User logs in
3. Backend returns an access token
4. Client stores the token
5. Client sends the token with protected requests
6. Backend validates the token and identifies the current user
~~~

Protected endpoints use:

~~~text
get_current_user
~~~

## Pagination, Search, and Filtering

FlowOps includes pagination and filtering for operational data that can grow over time.

Current list capabilities:

| Module | Pagination | Search | Filter |
| --- | ---: | ---: | --- |
| Products | Yes | Yes | Search by name, SKU, or category |
| Orders | Yes | No | Filter by order status |
| Inventory Movements | Yes | No | Filter by movement type |
| Audit Logs | Yes | No | Filter by action |

These features make the system closer to a real production dashboard because large datasets are not returned all at once.

## Frontend Architecture

The frontend is built with Next.js, React, TypeScript, and Tailwind CSS.

Main frontend areas:

~~~text
Landing page
Login page
Dashboard page
Products page
Inventory page
Orders page
Audit Logs page
Shared AppShell navigation
API helper utilities
Authentication token utilities
~~~

Frontend pages use the saved JWT token to call protected backend endpoints.

The shared `AppShell` component provides the authenticated layout and navigation between dashboard, products, inventory, orders, and audit logs.

## Database and Migrations

PostgreSQL is used as the main database.

Alembic is used for schema migrations.

Database changes are handled through migration files inside:

~~~text
backend/alembic/versions
~~~

Common migration commands:

~~~bash
alembic revision --autogenerate -m "migration message"
alembic upgrade head
~~~

## Docker-Based Development

FlowOps uses Docker Compose for local infrastructure and full-stack execution.

Current Docker Compose services:

~~~text
PostgreSQL
Redis
FastAPI backend
Next.js frontend
~~~

Docker Compose allows the application to run with a consistent local database, cache service, backend API, and frontend application.

## Audit Logging Design

Important business actions are recorded in the `audit_logs` table.

Examples:

~~~text
organization.created
product.created
product.updated
product.deactivated
inventory.movement.created
order.created
order.status_changed
~~~

Audit logs make the system easier to monitor and debug.

Audit logs are also exposed through a paginated and filterable API endpoint.

## Testing Strategy

The backend uses Pytest for automated API testing.

Current tests cover:

~~~text
Health endpoints
Authentication flow
Organization creation
Product creation
Dashboard summary
Audit log validation
Role-based authorization
Paginated response compatibility
Main workflow validation
~~~

These tests help verify that the main backend workflow continues to work after changes.

## Current Architecture Status

The current architecture supports:

- Modular FastAPI routing
- JWT authentication
- Multi-tenant organization logic
- Centralized role-based authorization
- Product management with pagination and search
- Inventory movement tracking with pagination and movement type filtering
- Order management with pagination and status filtering
- Dashboard summary reporting
- Audit logging with pagination and action filtering
- Connected Next.js frontend pages
- Docker Compose full-stack setup
- Automated API tests
- GitHub Actions CI validation
