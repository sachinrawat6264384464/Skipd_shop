from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Review, Product

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/admin/all")
async def get_all_admin_reviews(db: AsyncSession = Depends(get_db)):
    """Fetch all reviews across all products in store for CRM admin dashboard."""
    res = await db.execute(select(Review).order_by(Review.id.desc()))
    reviews = res.scalars().all()
    
    output = []
    for r in reviews:
        # Fetch associated product
        prod_res = await db.execute(select(Product).where(Product.id == r.product_id))
        prod = prod_res.scalars().first()
        
        output.append({
            "id": r.id,
            "product_id": r.product_id,
            "user_id": r.user_id,
            "user_name": r.user_name or "Anonymous Customer",
            "rating": float(r.rating or 5.0),
            "comment": r.comment or "",
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "product_title": prod.title if prod else f"Product #{r.product_id}",
            "product_price": f"₹{prod.price:,.0f}" if prod else "₹2,999",
            "product_image": prod.images[0] if (prod and prod.images and len(prod.images) > 0) else "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"
        })
    return output

@router.delete("/admin/{review_id}")
async def delete_admin_review(review_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a review from PostgreSQL database."""
    res = await db.execute(select(Review).where(Review.id == review_id))
    review = res.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    await db.delete(review)
    await db.commit()
    return {"status": "success", "message": f"Review #{review_id} deleted successfully"}

@router.get("/{product_id}")
async def get_product_reviews(product_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch all reviews for a product."""
    res = await db.execute(select(Review).where(Review.product_id == product_id).order_by(Review.id.desc()))
    reviews = res.scalars().all()
    return {"reviews": reviews, "count": len(reviews)}

@router.post("")
async def create_product_review(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a review and rating for a product."""
    review = Review(
        product_id=payload.get("product_id"),
        user_id=current_user.id,
        user_name=current_user.full_name,
        rating=payload.get("rating", 5),
        comment=payload.get("comment", "")
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return {"status": "success", "message": "Review submitted successfully", "review_id": review.id}
