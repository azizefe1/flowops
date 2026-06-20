# FlowOps

[![FlowOps CI](https://github.com/azizefe1/flowops/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/azizefe1/flowops/actions/workflows/backend-ci.yml)

FlowOps is a multi-tenant B2B operations platform built with FastAPI, PostgreSQL, SQLAlchemy, Alembic, JWT authentication, and Docker.

The project is designed as a portfolio-level backend system that demonstrates real-world business operations such as organization management, product management, inventory tracking, order processing, dashboard reporting, audit logging, and automated API testing.

## Project Purpose

FlowOps focuses on the backend architecture of a modern business management platform.
The system allows users to create organizations, manage products, track inventory movements, create customer orders, monitor dashboard metrics, and review audit logs for important actions.

This project was developed to demonstrate clean API design, database modeling, authentication, multi-tenant data separation, and backend testing practices.

## Tech Stack
### Backend

* Python
* FastAPI
* PostgreSQL
* SQLAlchemy
* Alembic
* Pydantic
* JWT Authentication
* Docker
* Redis
* Pytest

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* App Router

### DevOps & Tooling

* Docker Compose
* Backend Dockerfile
* Frontend Dockerfile
* GitHub Actions CI
* Automated backend tests
* Automated frontend build check

## Frontend Status

FlowOps also includes a Next.js frontend application.

The frontend currently includes:

* Landing page
* Login page connected to the FastAPI backend
* JWT token handling with localStorage
* Dashboard page with live backend data
* Products page with live backend data
* Orders page with live backend data
* Audit Logs page with live backend data
* Shared authenticated layout with navigation
* Tailwind-based dark UI design

Frontend source code is located in:

```text
frontend/
```

Frontend documentation:

```text
frontend/README.md
```


## Main Features

### Authentication

* User registration
* User login
* JWT-based authentication
* Protected API endpoints

### Multi-Tenant Organization Management

* Create organizations
* List user organizations
* Organization membership control
* Organization-based data isolation

### Product Management

* Create products
* List products
* View product details
* Update products
* Deactivate products
* SKU uniqueness per organization

### Inventory Management

* Stock-in movements
* Stock-out movements
* Stock adjustment movements
* Stock history tracking
* Insufficient stock validation

### Order Management

* Create customer orders
* Add multiple order items
* Automatic stock deduction
* Order status updates
* Cancelled order stock restoration
* Order history listing

### Dashboard Summary

* Total product count
* Active product count
* Low stock product count
* Total order count
* Pending, completed, and cancelled order counts
* Total order value
* Inventory movement count
* Recent orders
* Low stock items

### Audit Logging

* Organization creation logs
* Product creation logs
* Product update logs
* Product deactivation logs
* Inventory movement logs
* Order creation logs
* Order status change logs

### Automated Tests

* Health endpoint tests
* Authentication tests
* Full API workflow test
* Organization, product, dashboard, and audit log flow validation

## Project Structure

```text
flowops/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── docs/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## API Modules

```text
/api/auth
/api/organizations
/api/organizations/{organization_id}/products
/api/organizations/{organization_id}/inventory-movements
/api/organizations/{organization_id}/orders
/api/organizations/{organization_id}/dashboard
/api/organizations/{organization_id}/audit-logs
/api/health
```

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/azizefe1/flowops.git
cd flowops
```

### 2. Start Docker services

```bash
docker compose up -d
```

### 3. Create and activate virtual environment

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file inside the `backend` directory by using `.env.example` as a reference.

### 6. Run database migrations

```bash
alembic upgrade head
```

### 7. Start the API server

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```
## Documentation

Additional project documentation is available in the `docs` directory:

- [Architecture](docs/architecture.md)
- [Database Design](docs/database-design.md)
- [API Overview](docs/api-overview.md)
- [Deployment Guide](docs/deployment.md)

## Running Tests

From the `backend` directory:

```bash
pytest
```

Expected result:

```text
5 passed
```

## Example Workflow

```text
1. Register a user
2. Login and receive JWT token
3. Create an organization
4. Create products inside the organization
5. Create inventory movements
6. Create customer orders
7. View dashboard summary
8. Review audit logs
```

## CI/CD Status

FlowOps includes a GitHub Actions workflow that runs automatically on every push and pull request to the `main` branch.

The CI pipeline currently includes:

* PostgreSQL service setup
* Redis service setup
* Backend dependency installation
* Alembic database migrations
* Python compile check
* Pytest backend API tests
* Frontend dependency installation
* Next.js production build check

This helps ensure that both backend and frontend changes are verified before being considered stable.

## Docker Support

FlowOps includes Docker support for both backend and frontend.

Backend Docker support:

```text
backend/Dockerfile
backend/.dockerignore
```

Frontend Docker support:

```text
frontend/Dockerfile
frontend/.dockerignore
```

Local infrastructure is managed with:

```text
docker-compose.yml
```

The project currently supports containerized PostgreSQL, Redis, backend deployment preparation, and frontend production build preparation.


## Current Backend Status

The backend currently includes:

* FastAPI application structure
* PostgreSQL database integration
* Alembic migration system
* JWT authentication
* Multi-tenant organization logic
* Product management
* Inventory movement tracking
* Order management
* Dashboard summary endpoint
* Audit logging system
* Automated backend API tests

## Author

Aziz Efe Eryılmaz

GitHub: [azizefe1](https://github.com/azizefe1)
