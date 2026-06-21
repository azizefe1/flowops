import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services.audit import create_audit_log
from app.services.permissions import (
    require_organization_manager,
    require_organization_member,
)


router = APIRouter(
    prefix="/api/organizations/{organization_id}/products",
    tags=["products"],
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
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    organization_id: uuid.UUID,
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    require_organization_manager(db, organization_id, current_user)

    product = Product(
        organization_id=organization_id,
        name=payload.name,
        sku=payload.sku,
        category=payload.category,
        description=payload.description,
        unit_price=payload.unit_price,
        stock_quantity=payload.stock_quantity,
        low_stock_threshold=payload.low_stock_threshold,
    )

    db.add(product)

    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists in this organization",
        )

    create_audit_log(
        db=db,
        organization_id=organization_id,
        user_id=current_user.id,
        action="product.created",
        entity_type="product",
        entity_id=product.id,
        details={
            "name": product.name,
            "sku": product.sku,
            "unit_price": str(product.unit_price),
            "stock_quantity": product.stock_quantity,
        },
    )

    db.commit()
    db.refresh(product)

    return product


@router.get("", response_model=ProductListResponse)
def list_products(
    organization_id: uuid.UUID,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=120),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProductListResponse:
    require_organization_member(db, organization_id, current_user)

    query = db.query(Product).filter(Product.organization_id == organization_id)

    if search:
        search_value = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_value),
                Product.sku.ilike(search_value),
                Product.category.ilike(search_value),
            )
        )

    total = query.with_entities(func.count(Product.id)).scalar() or 0
    pages = (total + page_size - 1) // page_size if total > 0 else 0
    offset = (page - 1) * page_size

    products = (
        query.order_by(Product.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return ProductListResponse(
        items=products,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    require_organization_member(db, organization_id, current_user)

    return get_product_or_404(db, organization_id, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    require_organization_manager(db, organization_id, current_user)

    product = get_product_or_404(db, organization_id, product_id)

    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(product, key, value)

    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists in this organization",
        )

    create_audit_log(
        db=db,
        organization_id=organization_id,
        user_id=current_user.id,
        action="product.updated",
        entity_type="product",
        entity_id=product.id,
        details={
            "updated_fields": {
                key: str(value) for key, value in update_data.items()
            }
        },
    )

    db.commit()
    db.refresh(product)

    return product


@router.delete("/{product_id}", response_model=ProductResponse)
def delete_product(
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    require_organization_manager(db, organization_id, current_user)

    product = get_product_or_404(db, organization_id, product_id)

    product.is_active = False

    create_audit_log(
        db=db,
        organization_id=organization_id,
        user_id=current_user.id,
        action="product.deactivated",
        entity_type="product",
        entity_id=product.id,
        details={
            "name": product.name,
            "sku": product.sku,
        },
    )

    db.commit()
    db.refresh(product)

    return product
