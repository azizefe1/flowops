\# FlowOps Deployment Guide



This document explains how FlowOps can be prepared for deployment.



FlowOps is currently designed as a backend-focused FastAPI project with PostgreSQL, Redis, Alembic migrations, Docker support, automated tests, and GitHub Actions CI.



\## Deployment Goals



The deployment setup should provide:



\* FastAPI backend running in production mode

\* PostgreSQL database

\* Redis service

\* Environment variable based configuration

\* Alembic database migrations

\* Docker-based backend image

\* Automated tests through GitHub Actions before deployment



\## Required Services



FlowOps requires the following services:



```text

Backend API

PostgreSQL database

Redis service

```



\## Required Environment Variables



The backend requires these environment variables:



```text

APP\_NAME

APP\_ENV

DATABASE\_URL

SECRET\_KEY

ACCESS\_TOKEN\_EXPIRE\_MINUTES

```



Example values:



```text

APP\_NAME=FlowOps

APP\_ENV=production

DATABASE\_URL=postgresql+psycopg://username:password@host:5432/database\_name

SECRET\_KEY=replace\_with\_secure\_random\_secret\_key

ACCESS\_TOKEN\_EXPIRE\_MINUTES=60

```



The `SECRET\_KEY` value must be changed in production.



\## Docker Build



The backend includes a Dockerfile inside the `backend` directory.



Build command:



```bash

cd backend

docker build -t flowops-backend .

```



Run command example:



```bash

docker run -p 8000:8000 --env-file .env flowops-backend

```



\## Database Migrations



Before the backend starts, Alembic migrations should be applied.



The Dockerfile command already includes:



```bash

alembic upgrade head

```



This ensures the database schema is updated when the container starts.



\## Production Start Command



The backend uses this production-style command:



```bash

uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

```



\## Deployment Options



FlowOps can be deployed to platforms such as:



```text

Render

Railway

Fly.io

DigitalOcean

VPS with Docker

```



\## Recommended Deployment Flow



```text

1\. Push code to GitHub

2\. GitHub Actions runs backend tests

3\. CI checks database migrations and Pytest tests

4\. Deployment platform builds Docker image

5\. Environment variables are configured

6\. PostgreSQL and Redis services are connected

7\. Backend container starts

8\. Alembic migrations run

9\. FastAPI application becomes available

```



\## Health Check



After deployment, check:



```http

GET /api/health

```



Expected response:



```json

{

&#x20; "status": "ok",

&#x20; "app": "FlowOps"

}

```



Database health check:



```http

GET /api/health/database

```



Expected response:



```json

{

&#x20; "status": "ok",

&#x20; "database": "connected"

}

```



\## Security Notes



For production:



\* Use a strong `SECRET\_KEY`

\* Do not commit `.env` files

\* Use HTTPS

\* Restrict database access

\* Use production database credentials

\* Keep dependency versions updated

\* Review CORS settings before adding a frontend

\* Avoid exposing internal services directly to the public internet



\## Current Deployment Readiness



FlowOps currently includes:



\* Dockerfile for backend deployment

\* Environment variable based configuration

\* PostgreSQL database support

\* Redis service support

\* Alembic migration system

\* GitHub Actions backend CI

\* Automated backend API tests

\* Health check endpoints

\* Technical documentation



