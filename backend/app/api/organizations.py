import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember, OrganizationRole
from app.models.user import User
from app.schemas.organization import OrganizationCreate, OrganizationResponse
from app.services.audit import create_audit_log
from app.services.permissions import require_organization_member
from app.services.slug import generate_slug


router = APIRouter(
    prefix="/api/organizations",
    tags=["organizations"],
)


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Organization:
    slug = generate_slug(payload.name)

    organization = Organization(
        name=payload.name,
        slug=slug,
    )

    db.add(organization)

    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An organization with this name already exists",
        )

    membership = OrganizationMember(
        organization_id=organization.id,
        user_id=current_user.id,
        role=OrganizationRole.owner,
    )

    db.add(membership)

    create_audit_log(
        db=db,
        organization_id=organization.id,
        user_id=current_user.id,
        action="organization.created",
        entity_type="organization",
        entity_id=organization.id,
        details={
            "name": organization.name,
            "slug": organization.slug,
        },
    )

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
        .join(
            OrganizationMember,
            OrganizationMember.organization_id == Organization.id,
        )
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
    require_organization_member(db, organization_id, current_user)

    organization = (
        db.query(Organization)
        .filter(Organization.id == organization_id)
        .first()
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )

    return organization
