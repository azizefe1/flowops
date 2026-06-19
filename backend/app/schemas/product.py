from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    sku: str = Field(min_length=2, max_length=80)
    category: str | None = Field(default=None, max_length=120)
    description: str | None = None
    unit_price: Decimal = Field(gt=0)
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    sku: str | None = Field(default=None, min_length=2, max_length=80)
    category: str | None = Field(default=None, max_length=120)
    description: str | None = None
    unit_price: Decimal | None = Field(default=None, gt=0)
    stock_quantity: int | None = Field(default=None, ge=0)
    low_stock_threshold: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    sku: str
    category: str | None
    description: str | None
    unit_price: Decimal
    stock_quantity: int
    low_stock_threshold: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }