# FlowOps

[![FlowOps CI](https://github.com/azizefe1/flowops/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/azizefe1/flowops/actions/workflows/backend-ci.yml)

FlowOps is a multi-tenant B2B operations platform built with FastAPI, PostgreSQL, SQLAlchemy, Alembic, JWT authentication, Docker, Next.js, Tailwind CSS, Pytest, and GitHub Actions CI.

The project demonstrates a realistic full-stack business operations system with authentication, organization-based data isolation, inventory management, order management, dashboard metrics, audit logging, Dockerized services, automated tests, and CI validation.

## Features

- Role-based authorization with owner, manager, and staff roles
- Staff users can view operational data but cannot create or modify protected resources
- Owner and manager roles can manage products, inventory movements, and orders
- User registration and login
- JWT-based authentication
- Multi-tenant organization structure
- Product management with pagination and search
- Inventory stock tracking with movement history, pagination, and movement type filtering
- Order creation, stock reduction, pagination, and status filtering
- Dashboard summary data
- Audit log tracking with pagination and action filtering
- FastAPI Swagger documentation
- Next.js frontend
- Dedicated frontend pages for dashboard, products, inventory, orders, and audit logs
- Dockerized backend and frontend
- PostgreSQL and Redis with Docker Compose
- Automated backend tests
- Automated frontend production build check
- Automated Docker image build checks with GitHub Actions

## Role-Based Authorization

FlowOps includes organization-level role-based authorization.

Each organization member has one of the following roles:

| Role      | Description                                                                        |
| --------- | ---------------------------------------------------------------------------------- |
| `owner`   | Full organization-level access                                                     |
| `manager` | Can manage operational resources such as products, inventory movements, and orders |
| `staff`   | Can view allowed operational data but cannot perform protected write actions       |

Current permission behavior:

| Feature                       | Owner | Manager | Staff |
| ----------------------------- | ----: | ------: | ----: |
| View organizations            |   Yes |     Yes |   Yes |
| View dashboard                |   Yes |     Yes |   Yes |
| View products                 |   Yes |     Yes |   Yes |
| Create/update/delete products |   Yes |     Yes |    No |
| View inventory movements      |   Yes |     Yes |   Yes |
| Create inventory movements    |   Yes |     Yes |    No |
| View orders                   |   Yes |     Yes |   Yes |
| Create orders                 |   Yes |     Yes |    No |
| Update order status           |   Yes |     Yes |    No |
| View audit logs               |   Yes |     Yes |    No |

Role-based access control is implemented through a centralized permission helper and verified with automated backend tests.

## Pagination, Search, and Filtering

FlowOps includes pagination, search, and filtering support for core operational resources.

| Resource | Pagination | Search | Filter |
| --- | ---: | ---: | --- |
| Products | Yes | Yes | Search by name, SKU, or category |
| Orders | Yes | No | Filter by order status |
| Inventory Movements | Yes | No | Filter by movement type |
| Audit Logs | Yes | No | Filter by action |

These features make the platform more realistic for production-style operational dashboards where data grows over time.


## Screenshots

### Landing Page

![FlowOps Landing Page](docs/screenshots/landing.png)

### Login Page

![FlowOps Login Page](docs/screenshots/login.png)

### Dashboard

![FlowOps Dashboard](docs/screenshots/dashboard.png)

### Products

![FlowOps Products](docs/screenshots/products.png)

### Orders

![FlowOps Orders](docs/screenshots/orders.png)

### Audit Logs

![FlowOps Audit Logs](docs/screenshots/audit-logs.png)

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
* Automated Docker image build checks

## Project Structure

```text
flowops/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |-- core/
|   |   |-- db/
|   |   |-- models/
|   |   |-- schemas/
|   |   `-- services/
|   |-- alembic/
|   |-- tests/
|   |-- Dockerfile
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   `-- lib/
|   |-- Dockerfile
|   `-- package.json
|-- docs/
|   |-- screenshots/
|   |-- api-overview.md
|   |-- architecture.md
|   |-- database-design.md
|   `-- deployment.md
|-- scripts/
|   `-- seed_demo_data.py
|-- docker-compose.yml
`-- README.md
## CI/CD Status

FlowOps includes a GitHub Actions workflow that runs automatically on every push and pull request to the `main` branch.

The CI pipeline currently includes:

* PostgreSQL service setup
* Redis service setup
* Backend dependency installation
* Alembic database migrations
* Python compile check
* Pytest backend API tests
* Backend Docker image build check
* Frontend dependency installation
* Next.js production build check
* Frontend Docker image build check

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

The project supports containerized PostgreSQL, Redis, backend API, frontend application, migration execution, and production build preparation.

## Running the Full Stack with Docker Compose

FlowOps can be started locally with Docker Compose.

This command starts the full stack:

```bash
docker compose up --build
```

The following services will be started:

* PostgreSQL
* Redis
* FastAPI backend
* Next.js frontend

After the containers are running, the application is available at:

```text
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Health Check: http://localhost:8000/api/health
API Documentation: http://localhost:8000/docs
```

To stop the containers, press:

```text
Ctrl + C
```

Then run:

```bash
docker compose down
```

The PostgreSQL data is stored in a Docker volume named:

```text
flowops_postgres_data
```

This allows the database data to persist between container restarts.

## Demo Data Seeding

FlowOps includes a demo seed script for quickly preparing sample data.

First, start the full stack:

```bash
docker compose up --build
```

Then, in a separate terminal, run:

```bash
python scripts/seed_demo_data.py
```

The seed script creates or reuses:

* Demo user
* Demo organization
* Demo products
* Demo order
* Inventory movement records through order stock reduction
* Audit log records

Demo login credentials:

```text
Email: demo@flowops.dev
Password: Demo12345
```

After seeding, the frontend can be tested at:

```text
http://localhost:3000
```

The API documentation is available at:

```text
http://localhost:8000/docs
```

## Local Development

### Backend

Start PostgreSQL and Redis:

```bash
docker compose up postgres redis
```

Run the backend locally:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Backend API:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

### Frontend

Run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Testing

Run backend tests:

```bash
cd backend
pytest
```

Run frontend production build:

```bash
cd frontend
npm run build
```

Build backend Docker image:

```bash
cd backend
docker build -t flowops-backend:test .
```

Build frontend Docker image:

```bash
cd frontend
docker build -t flowops-frontend:test .
```

## Current Project Status

FlowOps currently includes:

- Authentication API
- Organization API
- Product API with pagination and search
- Inventory movement API with pagination and movement type filtering
- Order API with pagination and status filtering
- Dashboard summary API
- Audit logs API with pagination and action filtering
- Role-based authorization
- Connected frontend pages
- Frontend inventory movement page
- Docker Compose full-stack setup
- Demo data seed script
- Backend tests
- Frontend build validation
- GitHub Actions CI
- Project documentation

## Documentation

Additional documentation is available in the `docs` directory:

```text
docs/architecture.md
docs/database-design.md
docs/api-overview.md
docs/deployment.md
```

## Purpose

FlowOps was developed as a professional portfolio project to demonstrate full-stack backend and frontend development, API design, database modeling, Docker usage, automated testing, CI workflows, and project documentation.

## License

This project is developed for portfolio and educational purposes.
