from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, CartItem, Product

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("")
async def get_user_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get active user cart items."""
    result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    items = result.scalars().all()
    
    response = []
    for item in items:
        prod_res = await db.execute(select(Product).where(Product.id == item.product_id))
        prod = prod_res.scalars().first()
        if prod:
            response.append({
                "cart_item_id": item.id,
                "product_id": prod.id,
                "title": prod.title,
                "handle": prod.handle,
                "price": prod.price,
                "quantity": item.quantity,
                "image": prod.images[0] if prod.images else None
            })

    return {"cart_items": response, "count": len(response)}

@router.post("/add")
async def add_to_cart(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add product to user cart."""
    product_id = payload.get("product_id")
    quantity = payload.get("quantity", 1)

    result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id, CartItem.product_id == product_id)
    )
    existing = result.scalars().first()

    if existing:
        existing.quantity += quantity
    else:
        new_item = CartItem(user_id=current_user.id, product_id=product_id, quantity=quantity)
        db.add(new_item)

    await db.commit()
    return {"status": "success", "message": "Product added to cart"}
