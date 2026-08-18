from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Product, Category, ProductVariant, WishlistItem, CartItem, Review, InventoryLog, SaleProduct, OrderItem
from app.schemas.schemas import ProductSchema, CategorySchema
from app.core.redis_cache import get_cached_json, set_cached_json, invalidate_cache_pattern
import datetime

router = APIRouter(prefix="/products", tags=["Product Catalog"])

@router.get("", response_model=List[ProductSchema])
async def list_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. REDIS CACHE FIRST CHECK (Guarded against connection errors)
        cache_key = f"products:list:{category}:{search}:{featured}:{skip}:{limit}"
        try:
            cached_data = await get_cached_json(cache_key)
            if cached_data is not None:
                print(f"[REDIS CACHE HIT] {cache_key}")
                return cached_data
        except BaseException as c_err:
            print(f"[REDIS CACHE BYPASS] {c_err}")

        # 2. PostgreSQL DB Query on Cache Miss
        query = select(Product).options(selectinload(Product.category), selectinload(Product.variants))
        
        if featured is not None:
            query = query.where(Product.featured == featured)

        if category and category != "all":
            cat_check = await db.execute(select(Category).where(Category.slug == category))
            cat_obj = cat_check.scalars().first()
            if cat_obj:
                query = query.where(Product.category_id == cat_obj.id)
            else:
                query = query.join(Category).where(Category.slug == category)

        if search and search.lower() not in ["all", "all-categories", "catalog"]:
            query = query.where(Product.title.ilike(f"%{search}%"))

        query = query.order_by(Product.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        products = result.scalars().all()

        # 3. Store in Redis Cache safely
        try:
            serialized = [ProductSchema.model_validate(p).model_dump(mode="json") for p in products]
            await set_cached_json(cache_key, serialized, expire_seconds=300)
        except BaseException as err:
            print(f"[CACHE SERDE ERROR] {err}")

        return products
    except Exception as err:
        print(f"[LIST PRODUCTS ERROR] {err}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(err)}")

@router.get("/categories", response_model=List[CategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)):
    cache_key = "products:categories:list"
    cached_data = await get_cached_json(cache_key)
    if cached_data is not None:
        print(f"[REDIS CACHE HIT] {cache_key}")
        return cached_data

    result = await db.execute(select(Category))
    categories = result.scalars().all()

    try:
        serialized = [CategorySchema.model_validate(c).model_dump(mode="json") for c in categories]
        await set_cached_json(cache_key, serialized, expire_seconds=600)
    except Exception as err:
        print(f"[CACHE SERDE ERROR] {err}")

    return categories

@router.get("/{handle}", response_model=ProductSchema)
async def get_product(handle: str, db: AsyncSession = Depends(get_db)):
    # 1. REDIS CACHE FIRST CHECK
    cache_key = f"products:detail:{handle}"
    cached_data = await get_cached_json(cache_key)
    if cached_data is not None:
        print(f"[REDIS CACHE HIT] {cache_key}")
        return cached_data

    query = select(Product).options(selectinload(Product.category), selectinload(Product.variants)).where(Product.handle == handle)
    result = await db.execute(query)
    product = result.scalars().first()
    
    if not product:
        if handle.isdigit():
            query_id = select(Product).options(selectinload(Product.category), selectinload(Product.variants)).where(Product.id == int(handle))
            res_id = await db.execute(query_id)
            product = res_id.scalars().first()
            
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 💾 2. Store in Redis Cache with 300s TTL
    try:
        serialized = ProductSchema.model_validate(product).model_dump(mode="json")
        await set_cached_json(cache_key, serialized, expire_seconds=300)
    except Exception as err:
        print(f"[CACHE SERDE ERROR] {err}")

    return product


# ─────────────────────────────────────────────
# ADMIN PRODUCT MANAGEMENT ENDPOINTS
# ─────────────────────────────────────────────

@router.post("/admin/create")
async def admin_create_product(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Admin: Create single new product with full safety & unique handles."""
    try:
        title = payload.get("title", "New Product")
        raw_handle = payload.get("handle") or title.lower().replace(" ", "-").replace("/", "-")
        clean_handle = "".join([c if c.isalnum() or c == "-" else "" for c in raw_handle]).strip("-")
        if not clean_handle:
            clean_handle = "product"
        
        # Check if handle already exists and ensure uniqueness
        existing = await db.execute(select(Product).where(Product.handle == clean_handle))
        if existing.scalars().first():
            clean_handle = f"{clean_handle}-{int(datetime.datetime.utcnow().timestamp())}"

        cat_slug = payload.get("category_slug", "tech")
        category = None
        if cat_slug:
            cat_res = await db.execute(select(Category).where(Category.slug == cat_slug))
            category = cat_res.scalars().first()

            if not category:
                cat_res_name = await db.execute(select(Category).where(Category.name.ilike(cat_slug)))
                category = cat_res_name.scalars().first()

            # Dynamically auto-create category if missing in DB
            if not category:
                category = Category(
                    name=cat_slug.replace("-", " ").title(),
                    slug=cat_slug.lower().replace(" ", "-"),
                    icon="📁",
                    status="Active"
                )
                db.add(category)
                await db.commit()
                await db.refresh(category)

        category_id = category.id if category else None

        product = Product(
            title=title,
            handle=clean_handle,
            description=payload.get("description", "Premium quality product"),
            price=float(payload.get("price", 999.0)),
            compare_at_price=float(payload.get("compare_at_price")) if payload.get("compare_at_price") else None,
            category_id=category_id,
            featured=payload.get("featured", True),
            images=payload.get("images", ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]),
            tags=payload.get("tags", ["bestseller"]),
            stock_quantity=int(payload.get("stock_quantity", 100))
        )
        db.add(product)
        await db.commit()
        await db.refresh(product)

        try:
            await invalidate_cache_pattern("products:*")
        except BaseException as cache_err:
            print(f"[CACHE BYPASS WARNING] {cache_err}")

        return {"message": "Product created successfully", "id": product.id, "handle": product.handle}
    except HTTPException:
        raise
    except Exception as err:
        await db.rollback()
        print(f"[PRODUCT CREATE ERROR] {err}")
        raise HTTPException(status_code=400, detail=f"Failed to create product: {str(err)}")


@router.post("/admin/bulk-create")
async def admin_bulk_create_products(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Admin: Bulk import and save products array directly into PostgreSQL database."""
    products_list = payload.get("products", [])
    if not isinstance(products_list, list) or len(products_list) == 0:
        raise HTTPException(status_code=400, detail="No products array provided in payload")

    created_products = []
    ts = int(datetime.datetime.utcnow().timestamp())

    try:
        # Pre-fetch existing categories for fast mapping
        cats_res = await db.execute(select(Category))
        all_cats = cats_res.scalars().all()
        cat_map = {c.slug.lower(): c.id for c in all_cats}
        cat_name_map = {c.name.lower(): c.id for c in all_cats}

        for idx, item in enumerate(products_list):
            title = item.get("title", f"Imported Product {idx+1}")
            raw_handle = item.get("handle") or title.lower().replace(" ", "-").replace("/", "-")
            clean_handle = "".join([c if c.isalnum() or c == "-" else "" for c in raw_handle]).strip("-")
            if not clean_handle:
                clean_handle = f"product-{idx+1}"
            
            # Ensure unique handle
            clean_handle = f"{clean_handle}-{ts}-{idx}"

            cat_slug = (item.get("category_slug") or item.get("category") or "general").lower().replace(" ", "-")
            category_id = cat_map.get(cat_slug) or cat_name_map.get(cat_slug.replace("-", " "))

            # Auto-create category if missing
            if not category_id and cat_slug:
                new_cat = Category(
                    name=cat_slug.replace("-", " ").title(),
                    slug=cat_slug,
                    icon="📁",
                    status="Active"
                )
                db.add(new_cat)
                await db.commit()
                await db.refresh(new_cat)
                category_id = new_cat.id
                cat_map[cat_slug] = category_id

            images_raw = item.get("images")
            if isinstance(images_raw, str):
                images_list = [images_raw]
            elif isinstance(images_raw, list) and len(images_raw) > 0:
                images_list = [str(img) for img in images_raw if img]
            else:
                images_list = ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]

            tags_raw = item.get("tags")
            if isinstance(tags_raw, str):
                tags_list = [tags_raw]
            elif isinstance(tags_raw, list):
                tags_list = [str(t) for t in tags_raw if t]
            else:
                tags_list = ["bestseller"]

            prod = Product(
                title=title,
                handle=clean_handle,
                description=item.get("description", f"{title} catalog product."),
                price=float(item.get("price", 999.0)),
                compare_at_price=float(item.get("compare_at_price")) if item.get("compare_at_price") else None,
                category_id=category_id,
                featured=item.get("featured", True),
                images=images_list,
                tags=tags_list,
                stock_quantity=int(item.get("stock_quantity") or item.get("stock") or 50)
            )
            db.add(prod)
            created_products.append(prod)

        await db.commit()

        try:
            await invalidate_cache_pattern("products:*")
        except BaseException as cache_err:
            print(f"[CACHE BYPASS WARNING] {cache_err}")

        return {
            "message": f"Successfully created {len(created_products)} products in Neon PostgreSQL DB",
            "count": len(created_products)
        }
    except Exception as err:
        await db.rollback()
        print(f"[BULK CREATE ERROR] {err}")
        raise HTTPException(status_code=400, detail=f"Bulk creation failed: {str(err)}")


@router.put("/admin/{product_id}")
async def admin_update_product(product_id: int, payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Admin: Update existing product."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if "title" in payload:
        product.title = payload["title"]
    if "price" in payload:
        product.price = float(payload["price"])
    if "compare_at_price" in payload and payload["compare_at_price"]:
        product.compare_at_price = float(payload["compare_at_price"])
    if "description" in payload:
        product.description = payload["description"]
    if "featured" in payload:
        product.featured = payload["featured"]
    if "images" in payload:
        product.images = payload["images"]
    if "stock_quantity" in payload:
        product.stock_quantity = int(payload["stock_quantity"])

    await db.commit()
    try:
        await invalidate_cache_pattern("products:*")
    except BaseException as cache_err:
        print(f"[CACHE BYPASS WARNING] {cache_err}")

    return {"message": "Product updated successfully", "id": product.id}


@router.delete("/admin/{product_id}")
async def admin_delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Admin: Safely delete product and all associated FK rows."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        # Delete referencing foreign key rows first to prevent FK constraint failures
        await db.execute(delete(OrderItem).where(OrderItem.product_id == product_id))
        await db.execute(delete(WishlistItem).where(WishlistItem.product_id == product_id))
        await db.execute(delete(CartItem).where(CartItem.product_id == product_id))
        await db.execute(delete(Review).where(Review.product_id == product_id))
        await db.execute(delete(InventoryLog).where(InventoryLog.product_id == product_id))
        await db.execute(delete(SaleProduct).where(SaleProduct.product_id == product_id))
        await db.execute(delete(ProductVariant).where(ProductVariant.product_id == product_id))

        await db.delete(product)
        await db.commit()
        try:
            await invalidate_cache_pattern("products:*")
        except BaseException as cache_err:
            print(f"[CACHE BYPASS WARNING] {cache_err}")

        return {"message": "Product deleted successfully", "id": product_id}
    except Exception as err:
        await db.rollback()
        print(f"[PRODUCT DELETE ERROR] {err}")
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(err)}")


@router.post("/admin/bulk-seed")
async def admin_bulk_seed_catalog(db: AsyncSession = Depends(get_db)):
    """Admin: Seed 10+ rich catalog items to database."""
    # Ensure categories exist
    cats_data = [
        {"name": "Apparel & Wear", "slug": "apparel", "image": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"},
        {"name": "Tech Essentials", "slug": "tech", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"},
        {"name": "Lifestyle Accessories", "slug": "lifestyle", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"}
    ]
    
    cat_map = {}
    for cdata in cats_data:
        cres = await db.execute(select(Category).where(Category.slug == cdata["slug"]))
        cat = cres.scalars().first()
        if not cat:
            cat = Category(name=cdata["name"], slug=cdata["slug"], image_url=cdata["image"])
            db.add(cat)
            await db.commit()
            await db.refresh(cat)
        cat_map[cdata["slug"]] = cat.id

    # Rich products catalog
    seed_products = [
        {
            "title": "OnePlus Nord 6 | 8GB+256GB | Pitch Black",
            "handle": "oneplus-nord-6",
            "description": "Snapdragon 8s Gen 4 | Segment-first stable 165FPS gaming | Segment-largest 9000mAh battery | Personalized AI",
            "price": 44499.0,
            "compare_at_price": 52999.0,
            "category_slug": "tech",
            "images": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", "https://images.unsplash.com/photo-1523206489230-c012c64b2047?w=800"],
            "tags": ["smartphone", "oneplus", "flagship"]
        },
        {
            "title": "Active ANC Wireless Headphones",
            "handle": "active-anc-headphones",
            "description": "Studio-grade noise cancelling headphones with 40-hour battery life and spatial audio.",
            "price": 4999.0,
            "compare_at_price": 7999.0,
            "category_slug": "tech",
            "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"],
            "tags": ["audio", "headphones", "anc"]
        },
        {
            "title": "Apple Watch Series 9 GPS 45mm",
            "handle": "apple-watch-series-9",
            "description": "Always-On Retina display, S9 SiP, Double tap gesture, Precision Finding for iPhone.",
            "price": 41900.0,
            "compare_at_price": 44900.0,
            "category_slug": "tech",
            "images": ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"],
            "tags": ["watch", "apple", "smartwatch"]
        },
        {
            "title": "Minimalist Oversized Graphic Tee",
            "handle": "minimalist-graphic-tee",
            "description": "Heavyweight 240 GSM organic cotton t-shirt with premium screen-printed typography.",
            "price": 1299.0,
            "compare_at_price": 1999.0,
            "category_slug": "apparel",
            "images": ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"],
            "tags": ["apparel", "tshirt", "fashion"]
        },
        {
            "title": "Nike Air Force 1 '07 Sneakers",
            "handle": "nike-air-force-1",
            "description": "Classic white leather basketball shoes with responsive Nike Air cushioning.",
            "price": 7495.0,
            "compare_at_price": 8995.0,
            "category_slug": "apparel",
            "images": ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"],
            "tags": ["footwear", "sneakers", "nike"]
        },
        {
            "title": "Matte Black Leather Chrono Watch",
            "handle": "matte-black-chrono-watch",
            "description": "Water-resistant stainless steel chronograph watch with full grain genuine leather strap.",
            "price": 3499.0,
            "compare_at_price": 5499.0,
            "category_slug": "lifestyle",
            "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"],
            "tags": ["watch", "lifestyle", "leather"]
        },
        {
            "title": "RC 4K Camera Pro Toy Drone",
            "handle": "rc-4k-toy-drone",
            "description": "Foldable quadcopter drone with 4K UHD camera, altitude hold, and gesture control.",
            "price": 2499.0,
            "compare_at_price": 4999.0,
            "category_slug": "tech",
            "images": ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800"],
            "tags": ["drone", "gadget", "toy"]
        },
        {
            "title": "Winter Heavy Trench Wool Jacket",
            "handle": "winter-trench-jacket",
            "description": "Insulated fleece-lined winter trench jacket for sub-zero weather protection.",
            "price": 3999.0,
            "compare_at_price": 6999.0,
            "category_slug": "apparel",
            "images": ["https://images.unsplash.com/photo-1544441893-675973e31985?w=800"],
            "tags": ["winter", "jacket", "apparel"]
        }
    ]

    added = 0
    for pdata in seed_products:
        pres = await db.execute(select(Product).where(Product.handle == pdata["handle"]))
        if not pres.scalars().first():
            prod = Product(
                title=pdata["title"],
                handle=pdata["handle"],
                description=pdata["description"],
                price=pdata["price"],
                compare_at_price=pdata["compare_at_price"],
                category_id=cat_map.get(pdata["category_slug"]),
                featured=True,
                images=pdata["images"],
                tags=pdata["tags"]
            )
            db.add(prod)
            added += 1

    await db.commit()
    return {"message": f"{added} products seeded to database catalog", "total_seeded": len(seed_products)}
