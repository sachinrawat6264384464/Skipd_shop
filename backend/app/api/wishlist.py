from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, WishlistItem, Product

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("/admin/stats")
async def get_admin_wishlist_stats(db: AsyncSession = Depends(get_db)):
    """
    Admin: Fetch real per-product wishlist save counts from PostgreSQL wishlist_items table.
    """
    count_res = await db.execute(
        select(WishlistItem.product_id, func.count(WishlistItem.id).label("wishlist_count"))
        .group_by(WishlistItem.product_id)
        .order_by(func.count(WishlistItem.id).desc())
    )
    counts_by_product = {row.product_id: row.wishlist_count for row in count_res.all()}

    prods_res = await db.execute(select(Product))
    products = prods_res.scalars().all()

    total_wishlist_saves = sum(counts_by_product.values())

    output = []
    for p in products:
        count = counts_by_product.get(p.id, 0)
        output.append({
            "product_id": p.id,
            "title": p.title,
            "handle": p.handle,
            "price": float(p.price or 0),
            "images": p.images or [],
            "category_name": "General Catalog",
            "wishlist_count": count
        })

    output.sort(key=lambda x: (x["wishlist_count"], x["product_id"]), reverse=True)

    return {
        "total_wishlist_saves": total_wishlist_saves,
        "total_products": len(products),
        "products": output
    }


@router.get("")
@router.get("/")
async def get_wishlist(
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch logged-in user wishlist items from PostgreSQL DB."""
    if not current_user:
        return {"wishlist": [], "count": 0}

    res = await db.execute(select(WishlistItem).where(WishlistItem.user_id == current_user.id))
    items = res.scalars().all()

    wishlist = []
    seen_products = set()
    for item in items:
        p_id = item.product_id
        if p_id in seen_products:
            continue
        seen_products.add(p_id)

        p_res = await db.execute(select(Product).where(Product.id == p_id))
        p = p_res.scalars().first()
        if p:
            wishlist.append({
                "wishlist_id": item.id,
                "product_id": p.id,
                "title": p.title,
                "handle": p.handle,
                "price": float(p.price or 0),
                "compare_at_price": float(p.compare_at_price or 0) if p.compare_at_price else None,
                "image": p.images[0] if p.images else None,
                "category": None
            })

    return {"wishlist": wishlist, "count": len(wishlist)}


@router.post("/toggle")
async def toggle_wishlist(
    payload: dict = Body(...),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle product in user wishlist — saved directly in PostgreSQL DB with int type conversion."""
    raw_p_id = payload.get("product_id")
    if raw_p_id is None:
        raise HTTPException(status_code=400, detail="product_id is required")

    try:
        product_id = int(raw_p_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid product_id format")

    if not current_user:
        return {"status": "guest_saved", "message": "Saved locally for guest user", "product_id": product_id}

    res = await db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id
        )
    )
    existing_items = res.scalars().all()

    if existing_items:
        for item in existing_items:
            await db.delete(item)
        await db.commit()
        return {"status": "removed", "message": "Removed from wishlist in PostgreSQL DB", "product_id": product_id}
    else:
        new_w = WishlistItem(user_id=current_user.id, product_id=product_id)
        db.add(new_w)
        await db.commit()
        return {"status": "added", "message": "Added to wishlist in PostgreSQL DB", "product_id": product_id}
