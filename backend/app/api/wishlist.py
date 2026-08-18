from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, WishlistItem, Product

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("")
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch logged-in user wishlist items from PostgreSQL DB."""
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
                "compare_at_price": p.compare_at_price,
                "image": p.images[0] if p.images else None,
                "category": None
            })

    return {"wishlist": wishlist, "count": len(wishlist)}


@router.post("/toggle")
async def toggle_wishlist(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle product in user wishlist — saved directly in PostgreSQL DB."""
    product_id = payload.get("product_id")
    res = await db.execute(
        select(WishlistItem).where(WishlistItem.user_id == current_user.id, WishlistItem.product_id == product_id)
    )
    existing = res.scalars().first()

    if existing:
        await db.delete(existing)
        await db.commit()
        return {"status": "removed", "message": "Removed from wishlist in PostgreSQL DB"}
    else:
        new_w = WishlistItem(user_id=current_user.id, product_id=product_id)
        db.add(new_w)
        await db.commit()
        return {"status": "added", "message": "Added to wishlist in PostgreSQL DB"}


@router.get("/admin/stats")
async def get_admin_wishlist_stats(db: AsyncSession = Depends(get_db)):
    """
    Admin: Fetch real per-product wishlist save counts from PostgreSQL wishlist_items table.
    Returns each product with its real DB wishlist count.
    """
    # Count saves per product_id from the wishlist_items table
    count_res = await db.execute(
        select(WishlistItem.product_id, func.count(WishlistItem.id).label("wishlist_count"))
        .group_by(WishlistItem.product_id)
        .order_by(func.count(WishlistItem.id).desc())
    )
    counts_by_product = {row.product_id: row.wishlist_count for row in count_res.all()}

    # Fetch all products
    prods_res = await db.execute(select(Product).order_by(Product.id.desc()))
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
            "category_name": None,
            "wishlist_count": count
        })

    return {
        "total_wishlist_saves": total_wishlist_saves,
        "total_products": len(products),
        "products": output
    }
