import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Order, OrderItem, Product, ProductVariant, OrderStatus, User
from app.schemas.schemas import CheckoutInput, OrderResponse
from app.services.razorpay_svc import razorpay_svc
from app.api.deps import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders & Checkout"])

@router.post("/checkout", response_model=OrderResponse)
async def create_checkout(
    data: CheckoutInput,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_number = f"SKIPD-{random.randint(100000, 999999)}"
    total_amount = 0.0
    order_items = []

    for item in data.items:
        prod_res = await db.execute(select(Product).where(Product.id == item.product_id))
        product = prod_res.scalars().first()
        if not product:
            continue
        
        unit_price = product.price
        item_total = unit_price * item.quantity
        total_amount += item_total

        order_items.append(OrderItem(
            product_id=product.id,
            variant_id=item.variant_id,
            product_name=product.title,
            quantity=item.quantity,
            unit_price=unit_price
        ))

    # Create Razorpay Order
    rzp_order = razorpay_svc.create_order(
        amount_in_rupees=total_amount,
        order_receipt_id=order_number
    )

    new_order = Order(
        order_number=order_number,
        user_id=current_user.id if current_user else None,
        customer_email=data.customer_email,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        shipping_address=data.shipping_address.dict(),
        total_amount=total_amount,
        currency="INR",
        status=OrderStatus.PENDING_PAYMENT,
        razorpay_order_id=rzp_order["id"],
        items=order_items
    )

    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)

    return new_order

@router.get("", response_model=List[OrderResponse])
async def list_user_orders(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user:
        return []
    query = select(Order).options(selectinload(Order.items)).where(Order.user_id == current_user.id).order_by(Order.created_at.desc())
    result = await db.execute(query)
    orders = result.scalars().all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_by_id(
    order_id: str,
    db: AsyncSession = Depends(get_db)
):
    query = select(Order).options(selectinload(Order.items))
    if order_id.isdigit():
        query = query.where(Order.id == int(order_id))
    else:
        query = query.where(Order.order_number == order_id)
        
    result = await db.execute(query)
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
