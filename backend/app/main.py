from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.organizations import router as organizations_router
from app.api.products import router as products_router
from app.core.config import settings
from app.db.session import check_database_connection


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="FlowOps API - Multi-tenant B2B operations platform",
)


app.include_router(auth_router)
app.include_router(organizations_router)
app.include_router(products_router)


@app.get("/")
def root():
    return {
        "message": "FlowOps API is running",
        "environment": settings.app_env,
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.app_name,
    }


@app.get("/api/health/database")
def database_health_check():
    is_connected = check_database_connection()

    return {
        "status": "ok" if is_connected else "error",
        "database": "connected" if is_connected else "not connected",
    }