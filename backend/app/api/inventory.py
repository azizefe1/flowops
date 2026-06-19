import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.organizations import get_membership_or_404
from app.db.session import get_db
from app.models.inventory_movement import InventoryMovement, InventoryMovementType
from app.models.product import Product
from app.models.user import User
from app.schemas.inventory import InventoryMovementCreate, InventoryMovementResponse


router = APIRouter(
    prefix="/api/organizations/{organization_id}",
    tags=["inventory"],
)


def get_product_for_organization_or_404(
    db: Session,
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
) -> Product:
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.organization_id == organization_id,
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.post(
    "/products/{product_id}/stock-movements",
    response_model=InventoryMovementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_stock_movement(
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
    payload: InventoryMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InventoryMovement:
    get_membership_or_404(db, organization_id, current_user.id)

    product = get_product_for_organization_or_404(
        db=db,
        organization_id=organization_id,
        product_id=product_id,
    )

    previous_stock = product.stock_quantity

    if payload.movement_type == InventoryMovementType.stock_in:
        if payload.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock in quantity must be greater than zero",
            )

        new_stock = previous_stock + payload.quantity

    elif payload.movement_type == InventoryMovementType.stock_out:
        if payload.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock out quantity must be greater than zero",
            )

        if payload.quantity > previous_stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock",
            )

        new_stock = previous_stock - payload.quantity

    else:
        new_stock = payload.quantity

    product.stock_quantity = new_stock

    movement = InventoryMovement(
        organization_id=organization_id,
        product_id=product_id,
        movement_type=payload.movement_type,
        quantity=payload.quantity,
        previous_stock=previous_stock,
        new_stock=new_stock,
        reason=payload.reason,
        created_by=current_user.id,
    )

    db.add(movement)
    db.commit()
    db.refresh(movement)

    return movement


@router.get(
    "/products/{product_id}/stock-movements",
    response_model=list[InventoryMovementResponse],
)
def list_product_stock_movements(
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[InventoryMovement]:
    get_membership_or_404(db, organization_id, current_user.id)

    get_product_for_organization_or_404(
        db=db,
        organization_id=organization_id,
        product_id=product_id,
    )

    movements = (
        db.query(InventoryMovement)
        .filter(
            InventoryMovement.organization_id == organization_id,
            InventoryMovement.product_id == product_id,
        )
        .order_by(InventoryMovement.created_at.desc())
        .all()
    )

    return movements


@router.get(
    "/inventory-movements",
    response_model=list[InventoryMovementResponse],
)
def list_organization_inventory_movements(
    organization_id: uuid.UUID,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[InventoryMovement]:
    get_membership_or_404(db, organization_id, current_user.id)

    movements = (
        db.query(InventoryMovement)
        .filter(InventoryMovement.organization_id == organization_id)
        .order_by(InventoryMovement.created_at.desc())
        .limit(limit)
        .all()
    )

    return movements