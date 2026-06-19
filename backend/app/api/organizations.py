import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember, OrganizationRole
from app.models.user import User
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationMemberResponse,
    OrganizationResponse,
)
from app.services.slug import generate_unique_organization_slug


router = APIRouter(prefix="/api/organizations", tags=["organizations"])


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

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )

    return membership


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Organization:
    slug = generate_unique_organization_slug(db, payload.name)

    organization = Organization(
        name=payload.name,
        slug=slug,
    )

    db.add(organization)
    db.flush()

    membership = OrganizationMember(
        user_id=current_user.id,
        organization_id=organization.id,
        role=OrganizationRole.owner,
    )

    db.add(membership)
    db.commit()
    db.refresh(organization)

    return organization


@router.get("", response_model=list[OrganizationResponse])
def list_organizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Organization]:
    organizations = (
        db.query(Organization)
        .join(OrganizationMember)
        .filter(OrganizationMember.user_id == current_user.id)
        .order_by(Organization.created_at.desc())
        .all()
    )

    return organizations


@router.get("/{organization_id}", response_model=OrganizationResponse)
def get_organization(
    organization_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Organization:
    get_membership_or_404(db, organization_id, current_user.id)

    organization = db.get(Organization, organization_id)

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )

    return organization


@router.get("/{organization_id}/members", response_model=list[OrganizationMemberResponse])
def list_organization_members(
    organization_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[OrganizationMember]:
    get_membership_or_404(db, organization_id, current_user.id)

    members = (
        db.query(OrganizationMember)
        .filter(OrganizationMember.organization_id == organization_id)
        .order_by(OrganizationMember.created_at.asc())
        .all()
    )

    return members