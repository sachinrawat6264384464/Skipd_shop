from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import Category, Product
from app.schemas.schemas import CategorySchema, CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])

DEFAULT_CATEGORIES_DATA = [
    {
        "name": "Electronics",
        "slug": "electronics",
        "icon": "⚡",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        "description": "Gadgets, audio, power banks and electronics accessories"
    },
    {
        "name": "Mobiles & Tablets",
        "slug": "mobiles",
        "icon": "📱",
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
        "description": "Smartphones, flagship phones, and tablets"
    },
    {
        "name": "Laptops & Computers",
        "slug": "laptops",
        "icon": "💻",
        "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
        "description": "Laptops, MacBooks, PC accessories"
    },
    {
        "name": "Fashion & Apparel",
        "slug": "fashion",
        "icon": "👕",
        "image_url": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
        "description": "Ethnic wear, graphic tees, jackets and clothing"
    },
    {
        "name": "Footwear & Shoes",
        "slug": "footwear",
        "icon": "👟",
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "description": "Sneakers, formal shoes and footwear"
    },
    {
        "name": "Watches & Smartwear",
        "slug": "watches",
        "icon": "⌚",
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        "description": "Smartwatches, analog chronographs and wearables"
    },
    {
        "name": "Home & Living",
        "slug": "home",
        "icon": "🏡",
        "image_url": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800",
        "description": "Cushion covers, home decor and kitchen items"
    }
]

async def ensure_default_categories(db: AsyncSession):
    """Ensure all 7 primary store categories exist in PostgreSQL database with image URLs."""
    try:
        existing_res = await db.execute(select(Category))
        existing_cats = existing_res.scalars().all()
        existing_map = {c.slug: c for c in existing_cats}
        
        added_or_updated = False
        for item in DEFAULT_CATEGORIES_DATA:
            cat_obj = existing_map.get(item["slug"])
            if not cat_obj:
                db.add(Category(
                    name=item["name"],
                    slug=item["slug"],
                    icon=item["icon"],
                    image_url=item["image_url"],
                    description=item["description"],
                    status="Active"
                ))
                added_or_updated = True
            elif not cat_obj.image_url:
                cat_obj.image_url = item["image_url"]
                db.add(cat_obj)
                added_or_updated = True
                
        if added_or_updated:
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
