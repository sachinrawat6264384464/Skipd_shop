from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Product, Category, ProductVariant
from app.schemas.schemas import ProductSchema, CategorySchema
import datetime

router = APIRouter(prefix="/products", tags=["Product Catalog"])

@router.get("", response_model=List[ProductSchema])
async def list_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).options(selectinload(Product.category), selectinload(Product.variants))
    
    if featured is not None:
        query = query.where(Product.featured == featured)

    if category and category != "all":
        query = query.join(Category).where(Category.slug == category)

    if search:
        query = query.where(Product.title.ilike(f"%{search}%"))

    query = query.order_by(Product.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()
    return products

@router.get("/categories", response_model=List[CategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    categories = result.scalars().all()
    return categories

@router.get("/{handle}", response_model=ProductSchema)
async def get_product(handle: str, db: AsyncSession = Depends(get_db)):
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
        
    return product


# ─────────────────────────────────────────────
# ADMIN PRODUCT MANAGEMENT ENDPOINTS
# ─────────────────────────────────────────────

@router.post("/admin/create")
async def admin_create_product(payload: dict = Body(...), db: AsyncSession = Depends(get_db)):
    """Admin: Create single new product."""
    title = payload.get("title", "New Product")
    handle = payload.get("handle") or title.lower().replace(" ", "-").replace("/", "-") + f"-{int(datetime.datetime.utcnow().timestamp())}"
    
    cat_slug = payload.get("category_slug", "tech")
    cat_res = await db.execute(select(Category).where(Category.slug == cat_slug))
    category = cat_res.scalars().first()
    category_id = category.id if category else None

    product = Product(
        title=title,
        handle=handle,
        description=payload.get("description", "Premium quality product"),
        price=float(payload.get("price", 999.0)),
        compare_at_price=float(payload.get("compare_at_price")) if payload.get("compare_at_price") else None,
        category_id=category_id,
        featured=payload.get("featured", True),
        images=payload.get("images", ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]),
        tags=payload.get("tags", ["new-arrival"])
    )
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return {"message": "Product created successfully", "id": product.id, "handle": product.handle}


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

    await db.commit()
    return {"message": "Product updated successfully", "id": product.id}


@router.delete("/admin/{product_id}")
async def admin_delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """Admin: Delete product."""
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted successfully"}


@router.post("/admin/bulk-seed")
async def admin_bulk_seed_catalog(db: AsyncSession = Depends(get_db)):
    """Admin: Seed all catalog items (including Freedom Sale deal products) to database."""
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

    # Full product catalog including Freedom Sale / Deals page products
    seed_products = [
        # ─── MAIN CATALOG ───
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
        },
        # ─── FREEDOM SALE / DEALS PAGE PRODUCTS ───
        {
            "title": "Saree Premium Silk",
            "handle": "saree-premium-silk",
            "description": "Exquisite hand-woven premium silk saree with intricate golden zari border. Ideal for weddings, festivities and special occasions. Pure silk with traditional Banarasi weaving craft.",
            "price": 299.0,
            "compare_at_price": 590.0,
            "category_slug": "apparel",
            "images": [
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
                "https://images.unsplash.com/photo-1599841222-e3d3a6e7de04?w=800"
            ],
            "tags": ["fashion", "saree", "silk", "ethnic", "deals"]
        },
        {
            "title": "Cold Pressed Oil 1L",
            "handle": "cold-pressed-oil-1l",
            "description": "100% pure wood-pressed cold pressed oil, extracted without heat to retain all nutrients. Rich in Omega fatty acids and antioxidants. No chemicals, no preservatives — straight from the farm.",
            "price": 249.0,
            "compare_at_price": 499.0,
            "category_slug": "lifestyle",
            "images": [
                "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800",
                "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800"
            ],
            "tags": ["organic", "oil", "kitchen", "health", "deals"]
        },
        {
            "title": "Velvet Cushion Cover",
            "handle": "velvet-cushion-cover",
            "description": "Luxurious premium velvet cushion cover with hidden zipper. Super soft feel with vibrant color retention. Machine washable and wrinkle-resistant. Perfect for sofa, bed and home decor.",
            "price": 800.0,
            "compare_at_price": 1499.0,
            "category_slug": "lifestyle",
            "images": [
                "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800",
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
            ],
            "tags": ["home", "decor", "cushion", "deals"]
        },
        {
            "title": "20000mAh Power Bank",
            "handle": "20000mah-power-bank",
            "description": "Ultra-capacity 20000mAh fast-charging power bank with 22.5W PD charging. Features dual USB-A and USB-C outputs with LED indicator. Airline-approved, compact design with built-in safety protections.",
            "price": 999.0,
            "compare_at_price": 1999.0,
            "category_slug": "tech",
            "images": [
                "https://images.unsplash.com/photo-1609592424089-a2e4b3c4342d?w=800",
                "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"
            ],
            "tags": ["electronics", "power bank", "charging", "deals"]
        },
        {
            "title": "Nike Running Shoe",
            "handle": "nike-running-shoe",
            "description": "High-performance Nike running shoes with React foam midsole for maximum cushioning and energy return. Breathable Flyknit upper keeps feet cool. Rubber outsole provides traction on all surfaces.",
            "price": 700.0,
            "compare_at_price": 1299.0,
            "category_slug": "apparel",
            "images": [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
                "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"
            ],
            "tags": ["footwear", "nike", "sports", "running", "deals"]
        },
        {
            "title": "Leather Jacket",
            "handle": "leather-jacket",
            "description": "Premium genuine leather biker jacket with quilted lining, side buckles and YKK zippers. Timeless design that gets better with age. Available in multiple sizes. Perfect for winters and style.",
            "price": 999.0,
            "compare_at_price": 3499.0,
            "category_slug": "apparel",
            "images": [
                "https://images.unsplash.com/photo-1544441893-675973e31985?w=800",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"
            ],
            "tags": ["fashion", "jacket", "leather", "deals"]
        },
        {
            "title": "FPV Toy Drone",
            "handle": "fpv-toy-drone",
            "description": "Feature-packed FPV toy drone with 4K HD camera, altitude hold, one-key return and gesture photo/video control. 25-min flight time, 300m range, foldable design for easy carry.",
            "price": 999.0,
            "compare_at_price": 2499.0,
            "category_slug": "tech",
            "images": [
                "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800",
                "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800"
            ],
            "tags": ["electronics", "drone", "gadget", "deals"]
        },
        {
            "title": "Pro Headphones",
            "handle": "pro-headphones",
            "description": "Studio-grade over-ear headphones with 40mm dynamic drivers, active noise cancellation and 35-hour playtime. Foldable design with premium memory foam ear cups. Compatible with all devices via 3.5mm and Bluetooth 5.3.",
            "price": 950.0,
            "compare_at_price": 2499.0,
            "category_slug": "tech",
            "images": [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"
            ],
            "tags": ["electronics", "audio", "headphones", "deals"]
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
