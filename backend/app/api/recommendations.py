from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.models import User
from app.api.deps import get_current_user
from app.services.recommendation_svc import recommendation_svc

router = APIRouter(prefix="/recommendations", tags=["ML Intelligent Recommendations"])

@router.get("/products/{product_id}/similar")
async def get_similar_products_route(
    product_id: int,
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    """
    Get Machine Learning Content-Based Similar Products computed via scikit-learn TF-IDF & Cosine Similarity.
    100% Real Database Queries.
    """
    results = await recommendation_svc.get_similar_products(
        product_id=product_id,
        db=db,
        limit=limit
    )
    return results

@router.get("/products/{product_id}/frequently-bought-together")
async def get_frequently_bought_together_route(
    product_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get Frequently Bought Together bundle recommendation calculated from PostgreSQL order co-occurrence matrix.
    Includes 10% Bundle Discount price calculation.
    """
    bundle = await recommendation_svc.get_frequently_bought_together(
        product_id=product_id,
        db=db
    )
    if not bundle:
        raise HTTPException(status_code=404, detail="Product not found in database catalog")
    return bundle

@router.post("/products/{product_id}/track-view")
async def track_product_view_route(
    product_id: int,
    payload: dict = Body(default={}),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Tracks user product view activity in PostgreSQL user_views table.
    """
    session_id = payload.get("session_id")
    user_id = current_user.id if current_user else None
    
    success = await recommendation_svc.record_user_view(
        product_id=product_id,
        user_id=user_id,
        session_id=session_id,
        db=db
    )
    return {"status": "success" if success else "error", "product_id": product_id}
