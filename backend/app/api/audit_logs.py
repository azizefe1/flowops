import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log import AuditLogListResponse
from app.services.permissions import require_organization_manager


router = APIRouter(
    prefix="/api/organizations/{organization_id}/audit-logs",
    tags=["audit-logs"],
)


@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    organization_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    action: str | None = Query(default=None, max_length=120),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AuditLogListResponse:
    require_organization_manager(db, organization_id, current_user)

    query = db.query(AuditLog).filter(AuditLog.organization_id == organization_id)

    if action:
        query = query.filter(AuditLog.action == action.strip())

    total = query.with_entities(func.count(AuditLog.id)).scalar() or 0
    pages = (total + page_size - 1) // page_size if total > 0 else 0
    offset = (page - 1) * page_size

    audit_logs = (
        query.order_by(AuditLog.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return AuditLogListResponse(
        items=audit_logs,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )
