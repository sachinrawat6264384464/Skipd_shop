from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Category
from app.schemas.schemas import CategorySchema

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Fetch all product categories."""
    result = await db.execute(select(Category).order_by(Category.id.asc()))
    categories = result.scalars().all()
    return categories

@router.get("/{slug}", response_model=CategorySchema)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    """Get single category by slug."""
    result = await db.execute(select(Category).where(Category.slug == slug))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=44, detail="Category not found")
    return category
