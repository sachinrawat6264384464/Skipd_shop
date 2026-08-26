from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, CartItem, WishlistItem, Product
from app.services.email_service import send_abandoned_reminder_email

router = APIRouter(prefix="/abandoned-reminders", tags=["Abandoned Reminders"])

class RemoveAbandonedItemSchema(BaseModel):
    item_id: int
    item_type: str  # "cart" or "wishlist"

@router.get("/active")
async def get_active_abandoned_reminder(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Check if current user has any CartItem or WishlistItem added >= 1 minute ago.
    Returns product info for modal popup and triggers email notification.
    """
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    one_minute_ago = datetime.utcnow() - timedelta(minutes=1)
    
    # 1. Check Cart Items first (higher conversion priority)
    cart_res = await db.execute(
        select(CartItem)
        .where(
            CartItem.user_id == current_user.id,
            CartItem.created_at <= one_minute_ago
        )
        .order_by(CartItem.created_at.desc())
    )
    cart_item = cart_res.scalars().first()

    if cart_item:
        prod_res = await db.execute(select(Product).where(Product.id == cart_item.product_id))
        product = prod_res.scalars().first()
        if product:
            img_url = product.images[0] if (product.images and len(product.images) > 0) else ""
            
            # Send Email Notification
            try:
                send_abandoned_reminder_email(
                    to_email=current_user.email,
                    customer_name=current_user.full_name,
                    product_title=product.title,
                    product_price=float(product.price or 0),
                    image_url=img_url,
                    item_type="cart",
                    product_handle=product.handle
                )
            except Exception as e:
                print(f"[ABANDONED EMAIL ERROR] {e}")

            return {
                "has_abandoned_item": True,
                "item_type": "cart",
                "item_id": cart_item.id,
                "quantity": cart_item.quantity,
                "created_at": cart_item.created_at.isoformat() if cart_item.created_at else "",
                "product": {
                    "id": product.id,
                    "title": product.title,
                    "handle": product.handle,
                    "price": float(product.price or 0),
                    "compare_at_price": float(product.compare_at_price or product.price or 0),
                    "image": img_url,
                    "category": "Electronics"
                }
            }

    # 2. Check Wishlist Items
    wish_res = await db.execute(
        select(WishlistItem)
        .where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.created_at <= one_minute_ago
        )
        .order_by(WishlistItem.created_at.desc())
    )
    wishlist_item = wish_res.scalars().first()

    if wishlist_item:
        prod_res = await db.execute(select(Product).where(Product.id == wishlist_item.product_id))
        product = prod_res.scalars().first()
        if product:
            img_url = product.images[0] if (product.images and len(product.images) > 0) else ""
            
            # Send Email Notification
            try:
                send_abandoned_reminder_email(
                    to_email=current_user.email,
                    customer_name=current_user.full_name,
                    product_title=product.title,
                    product_price=float(product.price or 0),
                    image_url=img_url,
                    item_type="wishlist",
                    product_handle=product.handle
                )
            except Exception as e:
                print(f"[ABANDONED EMAIL ERROR] {e}")

            return {
                "has_abandoned_item": True,
                "item_type": "wishlist",
                "item_id": wishlist_item.id,
                "created_at": wishlist_item.created_at.isoformat() if wishlist_item.created_at else "",
                "product": {
                    "id": product.id,
                    "title": product.title,
                    "handle": product.handle,
                    "price": float(product.price or 0),
                    "compare_at_price": float(product.compare_at_price or product.price or 0),
                    "image": img_url,
                    "category": "Electronics"
                }
            }

    return {"has_abandoned_item": False}


@router.delete("/remove")
async def remove_abandoned_item(
    payload: RemoveAbandonedItemSchema,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Remove abandoned item from Cart or Wishlist directly from Popup Modal.
    """
    if current_user:
        if payload.item_type == "cart":
            res = await db.execute(
                select(CartItem).where(
                    CartItem.user_id == current_user.id,
                    or_(CartItem.id == payload.item_id, CartItem.product_id == payload.item_id)
                )
            )
            items = res.scalars().all()
            for item in items:
                await db.delete(item)
            if items:
                await db.commit()
                return {"success": True, "message": "Item removed from cart successfully"}

        elif payload.item_type == "wishlist":
            res = await db.execute(
                select(WishlistItem).where(
                    WishlistItem.user_id == current_user.id,
                    or_(WishlistItem.id == payload.item_id, WishlistItem.product_id == payload.item_id)
                )
            )
            items = res.scalars().all()
            for item in items:
                await db.delete(item)
            if items:
                await db.commit()
                return {"success": True, "message": "Item removed from wishlist successfully"}

    return {"success": True, "message": "Item removed successfully"}
