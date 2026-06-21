import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.inventory_movement import InventoryMovement, InventoryMovementType
from app.models.product import Product
from app.models.user import User
from app.schemas.inventory import InventoryMovementCreate, InventoryMovementResponse
from app.services.audit import create_audit_log
from app.services.permissions import (
    require_organization_manager,
    require_organization_member,
)


router = APIRouter(
    prefix="/api/organizations/{organization_id}/inventory-movements",
    tags=["inventory"],
)


def get_product_or_404(
    db: Session,
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
) -> Product:
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.organization_id == organization_id,
            Product.is_active.is_(True),
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.post("", response_model=InventoryMovementResponse, status_code=status.HTTP_201_CREATED)
def create_stock_movement(
    organization_id: uuid.UUID,
    payload: InventoryMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InventoryMovement:
    require_organization_manager(db, organization_id, current_user)

    product = get_product_or_404(db, organization_id, payload.product_id)

    previous_stock = product.stock_quantity

    if payload.movement_type == InventoryMovementType.stock_in:
        new_stock = previous_stock + payload.quantity

    elif payload.movement_type == InventoryMovementType.stock_out:
        if previous_stock < payload.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock for this movement",
            )

        new_stock = previous_stock - payload.quantity

    else:
        new_stock = payload.quantity

    product.stock_quantity = new_stock

    movement = InventoryMovement(
        organization_id=organization_id,
        product_id=product.id,
        movement_type=payload.movement_type,
        quantity=payload.quantity,
        previous_stock=previous_stock,
        new_stock=new_stock,
        reason=payload.reason,
        created_by=current_user.id,
    )

    db.add(movement)
    db.flush()

    create_audit_log(
        db=db,
        organization_id=organization_id,
        user_id=current_user.id,
        action="inventory.movement.created",
        entity_type="inventory_movement",
        entity_id=movement.id,
        details={
            "product_id": str(product.id),
            "movement_type": payload.movement_type.value,
            "quantity": payload.quantity,
            "previous_stock": previous_stock,
            "new_stock": new_stock,
            "reason": payload.reason,
        },
    )

    db.commit()
    db.refresh(movement)

    return movement


@router.get("", response_model=list[InventoryMovementResponse])
def list_inventory_movements(
    organization_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[InventoryMovement]:
    require_organization_member(db, organization_id, current_user)

    movements = (
        db.query(InventoryMovement)
        .filter(InventoryMovement.organization_id == organization_id)
        .order_by(InventoryMovement.created_at.desc())
        .all()
    )

    return movements
