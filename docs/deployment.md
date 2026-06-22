# FlowOps Deployment Guide

This document explains how FlowOps can be prepared for local Docker execution and production-style deployment.

FlowOps is a full-stack B2B operations platform with a FastAPI backend, PostgreSQL database, Redis service, Alembic migrations, Next.js frontend, Docker support, automated tests, and GitHub Actions CI.

## Deployment Goals

The deployment setup should provide:

- FastAPI backend running in production mode
- Next.js frontend application
- PostgreSQL database
- Redis service
- Environment variable based configuration
- Alembic database migrations
- Docker-based backend and frontend images
- Automated tests and build checks through GitHub Actions before deployment

## Required Services

FlowOps requires the following services:

~~~text
Backend API
Frontend application
PostgreSQL database
Redis service
~~~

## Required Backend Environment Variables

The backend requires these environment variables:

~~~text
APP_NAME
APP_ENV
DATABASE_URL
SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES
~~~

Example values:

~~~text
APP_NAME=FlowOps
APP_ENV=production
DATABASE_URL=postgresql+psycopg://username:password@host:5432/database_name
SECRET_KEY=replace_with_secure_random_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=60
~~~

The `SECRET_KEY` value must be changed in production.

## Required Frontend Environment Variables

The frontend uses the backend API URL.

Example:

~~~text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
~~~

For production, this should point to the deployed backend API URL.

## Docker Build

FlowOps includes Dockerfiles for both backend and frontend.

Backend Dockerfile:

~~~text
backend/Dockerfile
~~~

Frontend Dockerfile:

~~~text
frontend/Dockerfile
~~~

Build backend image:

~~~bash
cd backend
docker build -t flowops-backend .
~~~

Build frontend image:

~~~bash
cd frontend
docker build -t flowops-frontend .
~~~

## Running the Full Stack with Docker Compose

FlowOps can be started locally with Docker Compose.

From the project root:

~~~bash
docker compose up --build
~~~

This starts:

- PostgreSQL
- Redis
- FastAPI backend
- Next.js frontend

Application URLs:

~~~text
Frontend: http://localhost:3000
Backend API: http://localhost:8000
API Health Check: http://localhost:8000/api/health
API Documentation: http://localhost:8000/docs
~~~

To stop the stack:

~~~text
Ctrl + C
~~~

Then run:

~~~bash
docker compose down
~~~

## Database Migrations

Alembic is used for database migrations.

The Docker Compose backend command runs:

~~~bash
alembic upgrade head
~~~

before starting the FastAPI application.

This ensures the database schema is updated before the backend becomes available.

Manual migration command:

~~~bash
cd backend
alembic upgrade head
~~~

## Demo Data Seeding

FlowOps includes a demo seed script for preparing sample data.

First start the full stack:

~~~bash
docker compose up --build
~~~

Then run the seed script from the project root in a separate terminal:

~~~bash
python scripts/seed_demo_data.py
~~~

The seed script creates or reuses:

- Demo user
- Demo organization
- Demo products
- Demo order
- Inventory movement records through order stock reduction
- Audit log records

Demo credentials:

~~~text
Email: demo@flowops.dev
Password: Demo12345
~~~

## Production Start Commands

Backend production-style command:

~~~bash
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
~~~

Frontend production-style command:

~~~bash
npm run start
~~~

## Deployment Options

FlowOps can be deployed to platforms such as:

~~~text
Render
Railway
Fly.io
DigitalOcean
VPS with Docker
~~~

A typical production setup should use:

- Managed PostgreSQL or a secured PostgreSQL container
- Managed Redis or a secured Redis container
- HTTPS
- Secure environment variables
- A stable backend URL for the frontend
- A reverse proxy if deploying on a VPS

## Recommended Deployment Flow

~~~text
1. Push code to GitHub
2. GitHub Actions runs backend tests
3. GitHub Actions runs frontend production build
4. GitHub Actions checks backend Docker image build
5. GitHub Actions checks frontend Docker image build
6. Deployment platform builds Docker images
7. Environment variables are configured
8. PostgreSQL and Redis services are connected
9. Alembic migrations run
10. Backend container starts
11. Frontend container starts
12. Application becomes available
~~~

## Health Check

After deployment, check:

~~~http
GET /api/health
~~~

Expected response:

~~~json
{
  "status": "ok",
  "app": "FlowOps"
}
~~~

Database health check:

~~~http
GET /api/health/database
~~~

Expected response:

~~~json
{
  "status": "ok",
  "database": "connected"
}
~~~

## GitHub Actions Validation

FlowOps includes a GitHub Actions workflow that validates the project on push and pull request.

Current CI checks include:

- Backend dependency installation
- PostgreSQL service setup
- Redis service setup
- Alembic migrations
- Python compile check
- Pytest backend API tests
- Backend Docker image build
- Frontend dependency installation
- Next.js production build
- Frontend Docker image build

## Security Notes

For production:

- Use a strong `SECRET_KEY`
- Do not commit `.env` files
- Use HTTPS
- Restrict database access
- Use production database credentials
- Keep dependency versions updated
- Review CORS settings before exposing the frontend publicly
- Avoid exposing internal services directly to the public internet
- Use separate production credentials for database and Redis
- Rotate secrets when needed

## Current Deployment Readiness

FlowOps currently includes:

- Backend Dockerfile
- Frontend Dockerfile
- Docker Compose full-stack setup
- Environment variable based backend configuration
- PostgreSQL database support
- Redis service support
- Alembic migration system
- Demo data seed script
- GitHub Actions backend CI
- GitHub Actions frontend build validation
- GitHub Actions Docker build validation
- Automated backend API tests
- Health check endpoints
- Full-stack technical documentation
