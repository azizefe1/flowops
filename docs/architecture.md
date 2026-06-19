# FlowOps Architecture

FlowOps is designed as a modular backend application for a multi-tenant B2B operations platform.

The backend is built with FastAPI and follows a layered structure that separates API routing, database models, request/response schemas, configuration, database access, and business helper services.

## High-Level Architecture

```text
Client / Swagger UI / Frontend
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
Business Logic
        |
        v
SQLAlchemy ORM
        |
        v
PostgreSQL Database
```

## Main Backend Layers

### API Layer

The API layer contains FastAPI routers.
Each router is responsible for a specific business module.

Main API modules:

```text
auth.py
organizations.py
products.py
inventory.py
orders.py
dashboard.py
audit_logs.py
```

The API layer handles:

* HTTP request routing
* Authentication dependency checks
* Organization membership checks
* Request validation
* Response formatting
* Error responses

## Schema Layer

Schemas are built with Pydantic and define request and response structures.

Schema modules include:

```text
auth.py
user.py
organization.py
product.py
inventory.py
order.py
dashboard.py
audit_log.py
```

The schema layer helps keep the API consistent and prevents invalid data from reaching the business logic.

## Model Layer

The model layer uses SQLAlchemy ORM models.

Main models:

```text
User
Organization
OrganizationMember
Product
InventoryMovement
Order
OrderItem
AuditLog
```

These models represent the main database tables and relationships.

## Service Layer

The service layer contains reusable helper logic.

Current services:

```text
security.py
slug.py
audit.py
```

Examples:

* Password hashing
* JWT token creation
* Slug generation
* Audit log creation

## Multi-Tenant Design

FlowOps uses organization-based data separation.

Most business records include an `organization_id` field.
This ensures that products, inventory movements, orders, dashboard data, and audit logs belong to a specific organization.

Before accessing organization data, the backend checks whether the current user is a member of that organization.

This is handled through:

```text
get_membership_or_404()
```

## Authentication Flow

FlowOps uses JWT-based authentication.

Basic flow:

```text
1. User registers
2. User logs in
3. Backend returns an access token
4. Client sends the token with protected requests
5. Backend validates the token and identifies the current user
```

Protected endpoints use:

```text
get_current_user
```

## Database and Migrations

PostgreSQL is used as the main database.

Alembic is used for schema migrations.

Database changes are handled through migration files inside:

```text
backend/alembic/versions
```

Common migration commands:

```bash
alembic revision --autogenerate -m "migration message"
alembic upgrade head
```

## Docker-Based Development

FlowOps uses Docker Compose for local infrastructure.

Current services:

```text
PostgreSQL
Redis
```

Docker Compose allows the backend to run with a consistent local database environment.

## Audit Logging Design

Important business actions are recorded in the `audit_logs` table.

Examples:

```text
organization.created
product.created
product.updated
product.deactivated
inventory.movement.created
order.created
order.status_changed
```

Audit logs make the system easier to monitor and debug.

## Testing Strategy

The backend uses Pytest for automated API testing.

Current tests cover:

```text
Health endpoints
Authentication flow
Organization creation
Product creation
Dashboard summary
Audit log validation
```

These tests help verify that the main backend workflow continues to work after changes.

## Current Architecture Status

The current backend architecture supports:

* Modular FastAPI routing
* JWT authentication
* Multi-tenant organization logic
* Product management
* Inventory movement tracking
* Order management
* Dashboard summary reporting
* Audit logging
* Automated API tests
