from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.inventory_movement import InventoryMovementType


class InventoryMovementCreate(BaseModel):
    product_id: UUID
    movement_type: InventoryMovementType
    quantity: int = Field(gt=0)
    reason: str | None = None


class InventoryMovementResponse(BaseModel):
    id: UUID
    organization_id: UUID
    product_id: UUID
    movement_type: InventoryMovementType
    quantity: int
    previous_stock: int
    new_stock: int
    reason: str | None
    created_by: UUID
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }