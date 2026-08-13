from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Review

router = APIRouter(prefix="/reviews", tags=["Reviews"])

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
