from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, text
from app.core.database import get_db
from app.models.models import Category, Product, OrderItem, WishlistItem, CartItem, Review, InventoryLog, SaleProduct, ProductVariant, NewArrival
from app.schemas.schemas import CategorySchema, CategoryCreate, CategoryUpdate
from app.core.redis_cache import invalidate_cache_pattern

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
    },
    {
        "name": "Sports & Fitness",
        "slug": "sports",
        "icon": "⚽",
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        "description": "Athletic gear, fitness equipment and sportswear"
    },
    {
        "name": "Artisan & Crafts",
        "slug": "artisan",
        "icon": "🎨",
        "image_url": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800",
        "description": "Handcrafted items, pottery, and art"
    },
    {
        "name": "Beauty & Care",
        "slug": "beauty",
        "icon": "✨",
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
        "description": "Skincare, cosmetics, and wellness products"
    }
]

async def ensure_default_categories(db: AsyncSession):
    """Ensure default categories exist ONLY if PostgreSQL Category table is completely empty."""
    try:
        existing_res = await db.execute(select(Category))
        existing_cats = existing_res.scalars().all()
        if not existing_cats:
            for item in DEFAULT_CATEGORIES_DATA:
                db.add(Category(
                    name=item["name"],
                    slug=item["slug"],
                    icon=item["icon"],
                    image_url=item["image_url"],
                    description=item["description"],
                    status="Active"
                ))
            await db.commit()
    except Exception as e:
        print(f"[Categories API Warning] Auto-seed error: {e}")


@router.get("", response_model=List[CategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Fetch all product categories from PostgreSQL DB."""
    result = await db.execute(select(Category).order_by(Category.id.asc()))
    categories = result.scalars().all()
    return categories

@router.get("/admin/all")
async def list_categories_admin(db: AsyncSession = Depends(get_db)):
    """Fetch all product categories with associated products count for Admin panel."""
    result = await db.execute(select(Category).order_by(Category.id.asc()))
    categories = result.scalars().all()
    
    # Fetch all active products for fallback matching if category_id is missing
    prods_res = await db.execute(select(Product))
    all_products = prods_res.scalars().all()
    
    output = []
    for cat in categories:
        cat_slug = (cat.slug or "").lower().strip()
        cat_prefix = cat_slug.split("-")[0] if cat_slug else ""
        
        # Count products assigned to this category by category_id or tag/slug match
        prod_count = 0
        for p in all_products:
            is_match = False
            if p.category_id == cat.id:
                is_match = True
            elif p.tags and isinstance(p.tags, list):
                tags_lower = [str(t).lower() for t in p.tags]
                if cat_slug in tags_lower or cat_prefix in tags_lower:
                    is_match = True
            if is_match:
                prod_count += 1
        
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

    img_url = payload.image_url
    if not img_url and payload.icon and (payload.icon.startswith("data:") or payload.icon.startswith("http") or payload.icon.startswith("/")):
        img_url = payload.icon

    category = Category(
        name=payload.name,
        slug=slug,
        description=payload.description,
        image_url=img_url,
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
        if payload.icon.startswith("data:") or payload.icon.startswith("http") or payload.icon.startswith("/"):
            category.image_url = payload.icon
    if payload.status is not None:
        category.status = payload.status

    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.delete("/admin/{category_id}")
async def delete_admin_category(category_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a category from PostgreSQL database with cascade deletion of all mapped products."""
    res = await db.execute(select(Category).where(Category.id == category_id))
    category = res.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    cat_id = category.id
    cat_slug = (category.slug or "").lower().strip()
    cat_name = (category.name or "").lower().strip()
    cat_prefix = cat_slug.split("-")[0] if cat_slug else ""

    # 1. Fetch all products to find matches by category_id, sub_category, tags, title, or handle
    all_prods_res = await db.execute(select(Product))
    all_products = all_prods_res.scalars().all()

    target_prod_ids = []
    for p in all_products:
        is_match = False
        if p.category_id == cat_id:
            is_match = True
        
        # Check sub_category string match
        sub_cat = (p.sub_category or "").lower().strip()
        if not is_match and sub_cat:
            if cat_slug in sub_cat or cat_name in sub_cat or (cat_prefix and len(cat_prefix) >= 3 and cat_prefix in sub_cat) or sub_cat in cat_slug or sub_cat in cat_name:
                is_match = True

        # Check tags (whether list or pipe-separated string)
        if not is_match and p.tags:
            tag_tokens = []
            if isinstance(p.tags, list):
                for t in p.tags:
                    tag_tokens.extend(str(t).lower().replace("|", " ").replace(",", " ").replace("-", " ").split())
            else:
                tag_tokens = str(p.tags).lower().replace("|", " ").replace(",", " ").replace("-", " ").split()

            for token in tag_tokens:
                if token and (token == cat_slug or token == cat_prefix or token in cat_slug or token in cat_name):
                    is_match = True
                    break

        # Check handle & title for orphaned products (category_id is None)
        if not is_match and not p.category_id:
            p_handle = (p.handle or "").lower()
            p_title = (p.title or "").lower()
            if cat_slug in p_handle or (cat_prefix and len(cat_prefix) >= 3 and cat_prefix in p_handle) or cat_slug in p_title:
                is_match = True

        if is_match:
            target_prod_ids.append(p.id)


    # 2. Batch cascade delete all foreign key dependencies for these products
    if target_prod_ids:
        await db.execute(delete(OrderItem).where(OrderItem.product_id.in_(target_prod_ids)))
        await db.execute(delete(WishlistItem).where(WishlistItem.product_id.in_(target_prod_ids)))
        await db.execute(delete(CartItem).where(CartItem.product_id.in_(target_prod_ids)))
        await db.execute(delete(Review).where(Review.product_id.in_(target_prod_ids)))
        await db.execute(delete(InventoryLog).where(InventoryLog.product_id.in_(target_prod_ids)))
        await db.execute(delete(SaleProduct).where(SaleProduct.product_id.in_(target_prod_ids)))
        await db.execute(delete(ProductVariant).where(ProductVariant.product_id.in_(target_prod_ids)))
        await db.execute(delete(NewArrival).where(NewArrival.product_id.in_(target_prod_ids)))

        # Clean up optional/dynamic tables referencing product_id
        for tbl_name, col_name in [
            ("return_requests", "product_id"),
            ("product_queries", "product_id"),
            ("user_views", "product_id"),
            ("user_activities", "product_id"),
            ("search_history", "clicked_product_id"),
            ("product_embeddings", "product_id"),
            ("recommendations", "product_id"),
        ]:
            try:
                await db.execute(text(f"DELETE FROM {tbl_name} WHERE {col_name} = ANY(:pids)"), {"pids": list(target_prod_ids)})
            except Exception:
                pass
        
        # 3. Delete the matching products
        await db.execute(delete(Product).where(Product.id.in_(target_prod_ids)))

    # Clean up user_activities pointing directly to category_id
    try:
        await db.execute(text("DELETE FROM user_activities WHERE category_id = :cid"), {"cid": cat_id})
    except Exception as e:
        print(f"[FK Cleanup Warning] user_activities: {e}")

    # 4. Delete the category itself from DB
    await db.delete(category)
    await db.commit()

    # 5. Invalidate Redis Cache immediately across products and categories
    try:
        await invalidate_cache_pattern("products:*")
        await invalidate_cache_pattern("categories:*")
        await invalidate_cache_pattern("catalog:*")
    except BaseException:
        pass

    return {
        "status": "success", 
        "message": f"Category #{category_id} ({category.name}) and {len(target_prod_ids)} mapped product(s) deleted successfully"
    }


@router.get("/{slug}", response_model=CategorySchema)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    """Get single category by slug."""
    result = await db.execute(select(Category).where(Category.slug == slug))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
