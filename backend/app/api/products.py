import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.api.organizations import get_membership_or_404
from app.db.session import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate


router = APIRouter(
    prefix="/api/organizations/{organization_id}/products",
    tags=["products"],
)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    organization_id: uuid.UUID,
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    get_membership_or_404(db, organization_id, current_user.id)

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
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists in this organization",
        )

    db.refresh(product)

    return product


@router.get("", response_model=list[ProductResponse])
def list_products(
    organization_id: uuid.UUID,
    search: str | None = Query(default=None),
    include_inactive: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Product]:
    get_membership_or_404(db, organization_id, current_user.id)

    query = db.query(Product).filter(Product.organization_id == organization_id)

    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            Product.name.ilike(search_pattern)
            | Product.sku.ilike(search_pattern)
            | Product.category.ilike(search_pattern)
        )

    return query.order_by(Product.created_at.desc()).all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    get_membership_or_404(db, organization_id, current_user.id)

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


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    get_membership_or_404(db, organization_id, current_user.id)

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

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(product, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists in this organization",
        )

    db.refresh(product)

    return product


@router.delete("/{product_id}", response_model=ProductResponse)
def delete_product(
    organization_id: uuid.UUID,
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Product:
    get_membership_or_404(db, organization_id, current_user.id)

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

    product.is_active = False

    db.commit()
    db.refresh(product)

    return product