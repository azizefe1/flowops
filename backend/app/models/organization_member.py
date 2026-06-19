import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrganizationRole(str, enum.Enum):
    owner = "owner"
    manager = "manager"
    staff = "staff"


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[OrganizationRole] = mapped_column(
        Enum(OrganizationRole, name="organization_role"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User", back_populates="memberships")
    organization = relationship("Organization", back_populates="members")

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "organization_id",
            name="uq_user_organization_membership",
        ),
    )