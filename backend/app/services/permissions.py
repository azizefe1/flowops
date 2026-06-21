import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.organization_member import OrganizationMember, OrganizationRole
from app.models.user import User


def get_membership_or_404(
    db: Session,
    organization_id: uuid.UUID,
    user_id: uuid.UUID,
) -> OrganizationMember:
    membership = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == user_id,
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )

    return membership


def require_organization_member(
    db: Session,
    organization_id: uuid.UUID,
    user: User,
) -> OrganizationMember:
    return get_membership_or_404(
        db=db,
        organization_id=organization_id,
        user_id=user.id,
    )


def require_organization_manager(
    db: Session,
    organization_id: uuid.UUID,
    user: User,
) -> OrganizationMember:
    membership = get_membership_or_404(
        db=db,
        organization_id=organization_id,
        user_id=user.id,
    )

    allowed_roles = {
        OrganizationRole.owner,
        OrganizationRole.manager,
    }

    if membership.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action",
        )

    return membership


def require_organization_owner(
    db: Session,
    organization_id: uuid.UUID,
    user: User,
) -> OrganizationMember:
    membership = get_membership_or_404(
        db=db,
        organization_id=organization_id,
        user_id=user.id,
    )

    if membership.role != OrganizationRole.owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organization owners can perform this action",
        )

    return membership