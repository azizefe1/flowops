from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class OrganizationCreate(BaseModel):
    name: str


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class OrganizationMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    organization_id: UUID
    role: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }