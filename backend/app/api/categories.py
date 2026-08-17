from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import Category, Product
from app.schemas.schemas import CategorySchema, CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])

DEFAULT_CATEGORIES_DATA = [
    {"name": "Electronics", "slug": "electronics", "icon": "⚡", "description": "Gadgets, audio, power banks and electronics accessories"},
    {"name": "Mobiles & Tablets", "slug": "mobiles", "icon": "📱", "description": "Smartphones, flagship phones, and tablets"},
    {"name": "Laptops & Computers", "slug": "laptops", "icon": "💻", "description": "Laptops, MacBooks, PC accessories"},
    {"name": "Fashion & Apparel", "slug": "fashion", "icon": "👕", "description": "Ethnic wear, graphic tees, jackets and clothing"},
    {"name": "Footwear & Shoes", "slug": "footwear", "icon": "👟", "description": "Sneakers, formal shoes and footwear"},
    {"name": "Watches & Smartwear", "slug": "watches", "icon": "⌚", "description": "Smartwatches, analog chronographs and wearables"},
    {"name": "Home & Living", "slug": "home", "icon": "🏡", "description": "Cushion covers, home decor and kitchen items"}
]

async def ensure_default_categories(db: AsyncSession):
    """Ensure all 7 primary store categories exist in PostgreSQL database."""
    try:
        existing_res = await db.execute(select(Category))
        existing_cats = existing_res.scalars().all()
        existing_slugs = {c.slug for c in existing_cats}
        
        added = False
        for item in DEFAULT_CATEGORIES_DATA:
            if item["slug"] not in existing_slugs:
                db.add(Category(
                    name=item["name"],
                    slug=item["slug"],
                    icon=item["icon"],
                    description=item["description"],
                    status="Active"
                ))
                added = True
        if added:
            await db.commit()
    except Exception as e:
        print(f"[Categories API Warning] Auto-seed error: {e}")

@router.get("", response_model=List[CategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Fetch all product categories from PostgreSQL DB."""
    await ensure_default_categories(db)
    result = await db.execute(select(Category).order_by(Category.id.asc()))
    categories = result.scalars().all()
    return categories

@router.get("/admin/all")
async def list_categories_admin(db: AsyncSession = Depends(get_db)):
    """Fetch all product categories with associated products count for Admin panel."""
    await ensure_default_categories(db)
    result = await db.execute(select(Category).order_by(Category.id.asc()))
    categories = result.scalars().all()
    
    output = []
    for cat in categories:
        # Count products assigned to this category
        count_res = await db.execute(select(func.count(Product.id)).where(Product.category_id == cat.id))
        prod_count = count_res.scalar() or 0
        
        output.append({
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description or "",
            "image_url": cat.image_url or "",
            "icon": cat.icon or "📁",
            "status": cat.status or "Active",
            "count": prod_count
        })
    return output

@router.post("/admin", response_model=CategorySchema)
async def create_admin_category(payload: CategoryCreate, db: AsyncSession = Depends(get_db)):
    """Create a new category in PostgreSQL database."""
    slug = payload.slug or payload.name.lower().replace(" ", "-").replace("&", "and")
    
    # Check if slug exists
    res = await db.execute(select(Category).where(Category.slug == slug))
    existing = res.scalars().first()
    if existing:
        slug = f"{slug}-{int(func.random() * 1000)}"

    category = Category(
        name=payload.name,
        slug=slug,
        description=payload.description,
        image_url=payload.image_url,
        icon=payload.icon or "📁",
        status=payload.status or "Active"
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.put("/admin/{category_id}", response_model=CategorySchema)
async def update_admin_category(category_id: int, payload: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    """Update an existing category in PostgreSQL database."""
    res = await db.execute(select(Category).where(Category.id == category_id))
    category = res.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if payload.name is not None:
        category.name = payload.name
    if payload.slug is not None:
        category.slug = payload.slug
    if payload.description is not None:
        category.description = payload.description
    if payload.image_url is not None:
        category.image_url = payload.image_url
    if payload.icon is not None:
        category.icon = payload.icon
    if payload.status is not None:
        category.status = payload.status

    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.delete("/admin/{category_id}")
async def delete_admin_category(category_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a category from PostgreSQL database."""
    res = await db.execute(select(Category).where(Category.id == category_id))
    category = res.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await db.delete(category)
    await db.commit()
    return {"status": "success", "message": f"Category #{category_id} deleted successfully"}

@router.get("/{slug}", response_model=CategorySchema)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    """Get single category by slug."""
    result = await db.execute(select(Category).where(Category.slug == slug))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
