import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_log import AuditLogResponse
from app.services.permissions import require_organization_manager


router = APIRouter(
    prefix="/api/organizations/{organization_id}/audit-logs",
    tags=["audit-logs"],
)


@router.get("", response_model=list[AuditLogResponse])
def list_audit_logs(
    organization_id: uuid.UUID,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AuditLog]:
    require_organization_manager(db, organization_id, current_user)

    audit_logs = (
        db.query(AuditLog)
        .filter(AuditLog.organization_id == organization_id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )

    return audit_logs
