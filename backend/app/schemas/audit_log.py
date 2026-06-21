from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    id: UUID
    organization_id: UUID
    user_id: UUID | None
    action: str
    entity_type: str
    entity_id: UUID | None
    details: dict[str, Any] | None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AuditLogListResponse(BaseModel):
    items: list[AuditLogResponse]
    total: int
    page: int
    page_size: int
    pages: int
