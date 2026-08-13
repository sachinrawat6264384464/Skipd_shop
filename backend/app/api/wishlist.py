from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, WishlistItem, Product

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("")
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch logged-in user wishlist items."""
    res = await db.execute(select(WishlistItem).where(WishlistItem.user_id == current_user.id))
    items = res.scalars().all()

    wishlist = []
    for item in items:
        p_res = await db.execute(select(Product).where(Product.id == item.product_id))
        p = p_res.scalars().first()
        if p:
            wishlist.append({
                "wishlist_id": item.id,
                "product_id": p.id,
                "title": p.title,
                "handle": p.handle,
                "price": p.price,
                "image": p.images[0] if p.images else None
            })

    return {"wishlist": wishlist, "count": len(wishlist)}

@router.post("/toggle")
async def toggle_wishlist(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle product in user wishlist."""
    product_id = payload.get("product_id")
    res = await db.execute(
        select(WishlistItem).where(WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id)
    )
    existing = res.scalars().first()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"status": "removed", "message": "Removed from wishlist"}
    else:
        new_w = WishlistItem(user_id=current_user.id, product_id=product_id)
        db.add(new_w)
        await db.commit()
        return {"status": "added", "message": "Added to wishlist"}
