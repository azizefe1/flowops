from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.models.order import OrderStatus


class DashboardRecentOrderResponse(BaseModel):
    id: UUID
    order_number: str
    customer_name: str
    status: OrderStatus
    total_amount: Decimal
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class DashboardLowStockProductResponse(BaseModel):
    id: UUID
    name: str
    sku: str
    stock_quantity: int
    low_stock_threshold: int

    model_config = {
        "from_attributes": True,
    }


class DashboardSummaryResponse(BaseModel):
    total_products: int
    active_products: int
    low_stock_products: int

    total_orders: int
    pending_orders: int
    completed_orders: int
    cancelled_orders: int

    total_order_value: Decimal
    total_inventory_movements: int

    recent_orders: list[DashboardRecentOrderResponse]
    low_stock_items: list[DashboardLowStockProductResponse]