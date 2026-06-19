import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.organizations import get_membership_or_404
from app.db.session import get_db
from app.models.inventory_movement import InventoryMovement
from app.models.order import Order, OrderStatus
from app.models.product import Product
from app.models.user import User
from app.schemas.dashboard import DashboardSummaryResponse


router = APIRouter(
    prefix="/api/organizations/{organization_id}/dashboard",
    tags=["dashboard"],
)


@router.get("", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    organization_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardSummaryResponse:
    get_membership_or_404(db, organization_id, current_user.id)

    total_products = (
        db.query(func.count(Product.id))
        .filter(Product.organization_id == organization_id)
        .scalar()
        or 0
    )

    active_products = (
        db.query(func.count(Product.id))
        .filter(
            Product.organization_id == organization_id,
            Product.is_active.is_(True),
        )
        .scalar()
        or 0
    )

    low_stock_products = (
        db.query(func.count(Product.id))
        .filter(
            Product.organization_id == organization_id,
            Product.is_active.is_(True),
            Product.stock_quantity <= Product.low_stock_threshold,
        )
        .scalar()
        or 0
    )

    total_orders = (
        db.query(func.count(Order.id))
        .filter(Order.organization_id == organization_id)
        .scalar()
        or 0
    )

    pending_orders = (
        db.query(func.count(Order.id))
        .filter(
            Order.organization_id == organization_id,
            Order.status == OrderStatus.pending,
        )
        .scalar()
        or 0
    )

    completed_orders = (
        db.query(func.count(Order.id))
        .filter(
            Order.organization_id == organization_id,
            Order.status == OrderStatus.completed,
        )
        .scalar()
        or 0
    )

    cancelled_orders = (
        db.query(func.count(Order.id))
        .filter(
            Order.organization_id == organization_id,
            Order.status == OrderStatus.cancelled,
        )
        .scalar()
        or 0
    )

    total_order_value = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(
            Order.organization_id == organization_id,
            Order.status != OrderStatus.cancelled,
        )
        .scalar()
        or Decimal("0.00")
    )

    total_inventory_movements = (
        db.query(func.count(InventoryMovement.id))
        .filter(InventoryMovement.organization_id == organization_id)
        .scalar()
        or 0
    )

    recent_orders = (
        db.query(Order)
        .filter(Order.organization_id == organization_id)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )

    low_stock_items = (
        db.query(Product)
        .filter(
            Product.organization_id == organization_id,
            Product.is_active.is_(True),
            Product.stock_quantity <= Product.low_stock_threshold,
        )
        .order_by(Product.stock_quantity.asc())
        .limit(5)
        .all()
    )

    return DashboardSummaryResponse(
        total_products=total_products,
        active_products=active_products,
        low_stock_products=low_stock_products,
        total_orders=total_orders,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders,
        total_order_value=total_order_value,
        total_inventory_movements=total_inventory_movements,
        recent_orders=recent_orders,
        low_stock_items=low_stock_items,
    )