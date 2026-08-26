from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.models import User, Review, Product, Order, OrderItem

router = APIRouter(prefix="/reviews", tags=["Reviews"])

class CreateReviewSchema(BaseModel):
    product_id: int
    rating: int
    comment: Optional[str] = ""
    images: Optional[List[str]] = []
    videos: Optional[List[str]] = []

@router.get("/admin/all")
async def get_all_admin_reviews(db: AsyncSession = Depends(get_db)):
    """Fetch all reviews across all products in store for CRM admin dashboard."""
    res = await db.execute(select(Review).order_by(Review.id.desc()))
    reviews = res.scalars().all()
    
    output = []
    for r in reviews:
        prod_res = await db.execute(select(Product).where(Product.id == r.product_id))
        prod = prod_res.scalars().first()
        
        output.append({
            "id": r.id,
            "product_id": r.product_id,
            "user_id": r.user_id,
            "user_name": r.user_name or "Anonymous Customer",
            "rating": float(r.rating or 5.0),
            "comment": r.comment or "",
            "images": r.images or [],
            "videos": r.videos or [],
            "is_verified_purchase": r.is_verified_purchase if r.is_verified_purchase is not None else True,
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
    """
    Fetch reviews for a product with rating distribution breakdown (5★ - 1★),
    average rating score, and customer photo/video media gallery.
    """
    res = await db.execute(select(Review).where(Review.product_id == product_id).order_by(Review.id.desc()))
    reviews = res.scalars().all()

    rating_counts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    total_stars = 0
    media_gallery = []
    verified_count = 0

    formatted_reviews = []
    for r in reviews:
        r_rating = int(r.rating or 5)
        if r_rating in rating_counts:
            rating_counts[r_rating] += 1
        total_stars += r_rating

        if r.is_verified_purchase:
            verified_count += 1

        r_images = r.images if isinstance(r.images, list) else []
        r_videos = r.videos if isinstance(r.videos, list) else []

        for img in r_images:
            media_gallery.append({"type": "image", "url": img, "user_name": r.user_name})
        for vid in r_videos:
            media_gallery.append({"type": "video", "url": vid, "user_name": r.user_name})

        formatted_reviews.append({
            "id": r.id,
            "product_id": r.product_id,
            "user_name": r.user_name or "Verified Customer",
            "rating": r_rating,
            "comment": r.comment or "",
            "images": r_images,
            "videos": r_videos,
            "is_verified_purchase": r.is_verified_purchase if r.is_verified_purchase is not None else True,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    count = len(reviews)
    avg_rating = round(total_stars / count, 1) if count > 0 else 4.8

    return {
        "reviews": formatted_reviews,
        "count": count,
        "average_rating": avg_rating,
        "rating_breakdown": rating_counts,
        "verified_buyers_count": verified_count,
        "media_gallery": media_gallery
    }


@router.post("")
@router.post("/create")
async def create_product_review(
    payload: CreateReviewSchema,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a review with ratings and optional photo/video media links."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to submit review")

    # Check if user actually bought this product in PostgreSQL orders
    verified_res = await db.execute(
        select(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .where(
            Order.user_id == current_user.id,
            OrderItem.product_id == payload.product_id
        )
    )
    has_order = verified_res.scalars().first() is not None

    review = Review(
        product_id=payload.product_id,
        user_id=current_user.id,
        user_name=current_user.full_name or "Verified Customer",
        rating=payload.rating,
        comment=payload.comment or "",
        images=payload.images or [],
        videos=payload.videos or [],
        is_verified_purchase=has_order
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    return {
        "status": "success",
        "message": "Review submitted successfully",
        "review_id": review.id,
        "is_verified_purchase": has_order
    }
