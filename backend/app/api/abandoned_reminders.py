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
    Returns product info for ALL saved items for modal popup and triggers multi-item email notification.
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
    cart_items = cart_res.scalars().all()

    if cart_items and len(cart_items) > 0:
        cart_product_ids = [c.product_id for c in cart_items]
        prods_res = await db.execute(select(Product).where(Product.id.in_(cart_product_ids)))
        prods_map = {p.id: p for p in prods_res.scalars().all()}
        
        items_list = []
        for c_item in cart_items:
            prod = prods_map.get(c_item.product_id)
            if prod:
                img_url = prod.images[0] if (prod.images and len(prod.images) > 0) else ""
                items_list.append({
                    "item_id": c_item.id,
                    "product_id": prod.id,
                    "id": prod.id,
                    "title": prod.title,
                    "handle": prod.handle,
                    "price": float(prod.price or 0),
                    "compare_at_price": float(prod.compare_at_price or prod.price or 0),
                    "image": img_url,
                    "stock_quantity": prod.stock_quantity if prod.stock_quantity is not None else 12,
                    "category": "Electronics"
                })

        if len(items_list) > 0:
            first_prod = items_list[0]
            try:
                send_abandoned_reminder_email(
                    to_email=current_user.email,
                    customer_name=current_user.full_name,
                    product_title=first_prod["title"],
                    product_price=first_prod["price"],
                    image_url=first_prod["image"],
                    item_type="cart",
                    product_handle=first_prod["handle"],
                    items_list=items_list
                )
            except Exception as e:
                print(f"[ABANDONED EMAIL ERROR] {e}")

            return {
                "has_abandoned_item": True,
                "item_type": "cart",
                "total_count": len(items_list),
                "item_id": cart_items[0].id,
                "created_at": cart_items[0].created_at.isoformat() if cart_items[0].created_at else "",
                "product": first_prod,
                "items": items_list
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
    wishlist_items = wish_res.scalars().all()

    if wishlist_items and len(wishlist_items) > 0:
        wish_product_ids = [w.product_id for w in wishlist_items]
        prods_res = await db.execute(select(Product).where(Product.id.in_(wish_product_ids)))
        prods_map = {p.id: p for p in prods_res.scalars().all()}
        
        items_list = []
        for w_item in wishlist_items:
            prod = prods_map.get(w_item.product_id)
            if prod:
                img_url = prod.images[0] if (prod.images and len(prod.images) > 0) else ""
                items_list.append({
                    "item_id": w_item.id,
                    "product_id": prod.id,
                    "id": prod.id,
                    "title": prod.title,
                    "handle": prod.handle,
                    "price": float(prod.price or 0),
                    "compare_at_price": float(prod.compare_at_price or prod.price or 0),
                    "image": img_url,
                    "stock_quantity": prod.stock_quantity if prod.stock_quantity is not None else 12,
                    "category": "Electronics"
                })

        if len(items_list) > 0:
            first_prod = items_list[0]
            try:
                send_abandoned_reminder_email(
                    to_email=current_user.email,
                    customer_name=current_user.full_name,
                    product_title=first_prod["title"],
                    product_price=first_prod["price"],
                    image_url=first_prod["image"],
                    item_type="wishlist",
                    product_handle=first_prod["handle"],
                    items_list=items_list
                )
            except Exception as e:
                print(f"[ABANDONED EMAIL ERROR] {e}")

            return {
                "has_abandoned_item": True,
                "item_type": "wishlist",
                "total_count": len(items_list),
                "item_id": wishlist_items[0].id,
                "created_at": wishlist_items[0].created_at.isoformat() if wishlist_items[0].created_at else "",
                "product": first_prod,
                "items": items_list
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
