import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.inventory_movement import InventoryMovement, InventoryMovementType
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderListResponse,
    OrderResponse,
    OrderStatusUpdate,
)
from app.services.audit import create_audit_log
from app.services.permissions import (
    require_organization_manager,
    require_organization_member,
)


router = APIRouter(
    prefix="/api/organizations/{organization_id}/orders",
    tags=["orders"],
)


def generate_order_number() -> str:
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_part = str(uuid.uuid4()).split("-")[0].upper()

    return f"ORD-{timestamp}-{random_part}"


def get_order_or_404(
    db: Session,
    organization_id: uuid.UUID,
    order_id: uuid.UUID,
) -> Order:
    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.organization_id == organization_id,
        )
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    return order


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    organization_id: uuid.UUID,
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    require_organization_manager(db, organization_id, current_user)

    product_ids = [item.product_id for item in payload.items]

    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate products are not allowed in the same order",
        )

    products = (
        db.query(Product)
        .filter(
            Product.organization_id == organization_id,
            Product.id.in_(product_ids),
            Product.is_active.is_(True),
        )
        .all()
    )

    products_by_id = {product.id: product for product in products}

    if len(products_by_id) != len(product_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more products were not found",
        )

    order = Order(
        organization_id=organization_id,
        order_number=generate_order_number(),
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        status=OrderStatus.pending,
        total_amount=Decimal("0.00"),
        created_by=current_user.id,
    )

    db.add(order)
    db.flush()

    total_amount = Decimal("0.00")

    for item in payload.items:
        product = products_by_id[item.product_id]

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product: {product.name}",
            )

        previous_stock = product.stock_quantity
        new_stock = previous_stock - item.quantity

        product.stock_quantity = new_stock

        unit_price = product.unit_price
        line_total = unit_price * item.quantity
        total_amount += line_total

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=unit_price,
            line_total=line_total,
        )

        db.add(order_item)

        movement = InventoryMovement(
            organization_id=organization_id,
            product_id=product.id,
            movement_type=InventoryMovementType.stock_out,
            quantity=item.quantity,
            previous_stock=previous_stock,
            new_stock=new_stock,
            reason=f"Order created: {order.order_number}",
            created_by=current_user.id,
        )

        db.add(movement)

    order.total_amount = total_amount

    create_audit_log(
        db=db,
        organization_id=organization_id,
        user_id=current_user.id,
        action="order.created",
        entity_type="order",
        entity_id=order.id,
        details={
            "order_number": order.order_number,
            "customer_name": order.customer_name,
            "total_amount": str(order.total_amount),
            "items_count": len(payload.items),
        },
    )

    db.commit()
    db.refresh(order)

    return get_order_or_404(db, organization_id, order.id)


@router.get("", response_model=OrderListResponse)
def list_orders(
    organization_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: OrderStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderListResponse:
    require_organization_member(db, organization_id, current_user)

    query = db.query(Order).filter(Order.organization_id == organization_id)

    if status_filter is not None:
        query = query.filter(Order.status == status_filter)

    total = query.with_entities(func.count(Order.id)).scalar() or 0
    pages = (total + page_size - 1) // page_size if total > 0 else 0
    offset = (page - 1) * page_size

    orders = (
        query.order_by(Order.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return OrderListResponse(
        items=orders,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    organization_id: uuid.UUID,
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    require_organization_member(db, organization_id, current_user)

    return get_order_or_404(db, organization_id, order_id)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    organization_id: uuid.UUID,
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Order:
    require_organization_manager(db, organization_id, current_user)

    order = get_order_or_404(db, organization_id, order_id)

    if order.status == OrderStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cancelled orders cannot be updated",
        )

    previous_status = order.status

    if payload.status == OrderStatus.cancelled:
        for item in order.items:
            product = (
                db.query(Product)
                .filter(
                    Product.id == item.product_id,
                    Product.organization_id == organization_id,
                )
                .first()
            )

            if product is None:
                continue

            previous_stock = product.stock_quantity
            new_stock = previous_stock + item.quantity

            product.stock_quantity = new_stock

            movement = InventoryMovement(
                organization_id=organization_id,
                product_id=product.id,
                movement_type=InventoryMovementType.stock_in,
                quantity=item.quantity,
                previous_stock=previous_stock,
                new_stock=new_stock,
                reason=f"Order cancelled: {order.order_number}",
                created_by=current_user.id,
            )

            db.add(movement)

    order.status = payload.status

    create_audit_log(
        db=db,
        organization_id=organization_id,
        user_id=current_user.id,
        action="order.status_changed",
        entity_type="order",
        entity_id=order.id,
        details={
            "order_number": order.order_number,
            "previous_status": previous_status.value,
            "new_status": payload.status.value,
        },
    )

    db.commit()
    db.refresh(order)

    return get_order_or_404(db, organization_id, order.id)
