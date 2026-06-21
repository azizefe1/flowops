from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=160)
    customer_email: EmailStr | None = None
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    line_total: Decimal

    model_config = {
        "from_attributes": True,
    }


class OrderResponse(BaseModel):
    id: UUID
    organization_id: UUID
    order_number: str
    customer_name: str
    customer_email: str | None
    status: OrderStatus
    total_amount: Decimal
    created_by: UUID | None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse]

    model_config = {
        "from_attributes": True,
    }


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
    pages: int


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
