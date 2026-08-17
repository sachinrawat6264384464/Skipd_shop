from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.models.models import Category, Product, ProductVariant, User, UserRole
from app.core.security import get_password_hash

from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.payments import router as payments_router
from app.api.shipping import router as shipping_router
from app.api.admin import router as admin_router
from app.api.whatsapp import router as whatsapp_router
from app.api.rewards import router as rewards_router
from app.api.sales import router as sales_router
from app.api.homepage import router as homepage_router
from app.api.categories import router as categories_router
from app.api.users import router as users_router
from app.api.cart import router as cart_router
from app.api.wishlist import router as wishlist_router
from app.api.addresses import router as addresses_router
from app.api.coupons import router as coupons_router
from app.api.reviews import router as reviews_router
from app.api.gift_cards import router as gift_cards_router
from app.api.inventory import router as inventory_router
from app.api.wallet import router as wallet_router
from app.models.models import SaleEvent, SaleProduct, SaleStatus, HomepageSection

from init_db_tables import initialize_and_migrate_all_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create & migrate all tables on startup
    try:
        await initialize_and_migrate_all_tables()
        print("[Backend Startup] Master Database Migration & Tables Initialized!")
    except Exception as err:
        print(f"[Backend Startup Warning] DB auto-migration skipped ({err}). Startup continuing...")

    
    # Seed initial B2C categories and products if database is fresh or categories missing
    try:
        async with AsyncSessionLocal() as db:
            default_cats = [
                {"name": "Electronics", "slug": "electronics", "icon": "⚡", "description": "Gadgets, audio, power banks and electronics accessories"},
                {"name": "Mobiles & Tablets", "slug": "mobiles", "icon": "📱", "description": "Smartphones, flagship phones, and tablets"},
                {"name": "Laptops & Computers", "slug": "laptops", "icon": "💻", "description": "Laptops, MacBooks, PC accessories"},
                {"name": "Fashion & Apparel", "slug": "fashion", "icon": "👕", "description": "Ethnic wear, graphic tees, jackets and clothing"},
                {"name": "Footwear & Shoes", "slug": "footwear", "icon": "👟", "description": "Sneakers, formal shoes and footwear"},
                {"name": "Watches & Smartwear", "slug": "watches", "icon": "⌚", "description": "Smartwatches, analog chronographs and wearables"},
                {"name": "Home & Living", "slug": "home", "icon": "🏡", "description": "Cushion covers, home decor and kitchen items"}
            ]

            existing_res = await db.execute(select(Category))
            existing_cats = existing_res.scalars().all()
            existing_slugs = {c.slug for c in existing_cats}

            cats_to_add = []
            for item in default_cats:
                if item["slug"] not in existing_slugs:
                    cats_to_add.append(
                        Category(
                            name=item["name"],
                            slug=item["slug"],
                            icon=item["icon"],
                            description=item["description"],
                            status="Active"
                        )
                    )
            if cats_to_add:
                db.add_all(cats_to_add)
                await db.commit()
                print(f"[Backend Startup] Seeded {len(cats_to_add)} default categories into PostgreSQL database!")

            res = await db.execute(select(Product))
            if not res.scalars().first():
                print("[Backend Startup] Seeding initial B2C catalog data...")
                cat_apparel_res = await db.execute(select(Category).where(Category.slug == "fashion"))
                cat_apparel = cat_apparel_res.scalars().first()
                cat_tech_res = await db.execute(select(Category).where(Category.slug == "electronics"))
                cat_tech = cat_tech_res.scalars().first()
                cat_lifestyle_res = await db.execute(select(Category).where(Category.slug == "watches"))
                cat_lifestyle = cat_lifestyle_res.scalars().first()

                p1 = Product(
                    title="Minimalist Oversized Graphic Tee",
                    handle="minimalist-graphic-tee",
                    description="Heavyweight 240 GSM organic cotton t-shirt with premium screen-printed typography.",
                    price=1299.0,
                    compare_at_price=1999.0,
                    category_id=cat_apparel.id,
                    featured=True,
                    images=[
                        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
                        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800"
                    ],
                    tags=["bestseller", "apparel", "cotton"]
                )
                p2 = Product(
                    title="Active ANC Wireless Headphones",
                    handle="active-anc-headphones",
                    description="Studio-grade noise cancelling headphones with 40-hour battery life and spatial audio.",
                    price=4999.0,
                    compare_at_price=7999.0,
                    category_id=cat_tech.id,
                    featured=True,
                    images=[
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"
                    ],
                    tags=["audio", "tech", "wireless"]
                )
                p3 = Product(
                    title="Matte Black Matte Leather Chrono Watch",
                    handle="matte-black-chrono-watch",
                    description="Water-resistant stainless steel chronograph watch with full grain genuine leather strap.",
                    price=3499.0,
                    compare_at_price=5499.0,
                    category_id=cat_lifestyle.id,
                    featured=True,
                    images=[
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
                    ],
                    tags=["lifestyle", "watch", "accessories"]
                )
                p4 = Product(
                    title="OnePlus Nord 6 | 8GB+256GB | Pitch Black",
                    handle="oneplus-nord-6",
                    description="Snapdragon 8s Gen 4 | Segment-first stable 165FPS gaming | Segment-largest 9000mAh battery | Personalized AI",
                    price=44499.0,
                    compare_at_price=52999.0,
                    category_id=cat_tech.id,
                    featured=True,
                    images=[
                        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
                        "https://images.unsplash.com/photo-1523206489230-c012c64b2047?w=800"
                    ],
                    tags=["mobiles", "bestseller", "oneplus"]
                )
                p5 = Product(
                    title="Apple Watch Series 9 GPS 45mm",
                    handle="apple-watch-series-9",
                    description="Always-On Retina display, S9 SiP, Double tap gesture, Precision Finding for iPhone.",
                    price=41900.0,
                    compare_at_price=44900.0,
                    category_id=cat_tech.id,
                    featured=True,
                    images=["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800"],
                    tags=["watches", "tech"]
                )
                p6 = Product(
                    title="Nike Air Force 1 '07 Sneakers",
                    handle="nike-air-force-1",
                    description="Classic white leather basketball shoes with responsive Nike Air cushioning.",
                    price=7495.0,
                    compare_at_price=8995.0,
                    category_id=cat_apparel.id,
                    featured=True,
                    images=["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"],
                    tags=["footwear", "sneakers"]
                )
                p7 = Product(
                    title="RC 4K Camera Pro Toy Drone",
                    handle="rc-4k-toy-drone",
                    description="Foldable quadcopter drone with 4K UHD camera, altitude hold, and gesture control.",
                    price=2499.0,
                    compare_at_price=4999.0,
                    category_id=cat_tech.id,
                    featured=True,
                    images=["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800"],
                    tags=["drone", "gadget"]
                )
                p8 = Product(
                    title="Winter Heavy Trench Wool Jacket",
                    handle="winter-trench-jacket",
                    description="Insulated fleece-lined winter trench jacket for sub-zero weather protection.",
                    price=3999.0,
                    compare_at_price=6999.0,
                    category_id=cat_apparel.id,
                    featured=True,
                    images=["https://images.unsplash.com/photo-1544441893-675973e31985?w=800"],
                    tags=["winter", "jacket"]
                )
                db.add_all([p1, p2, p3, p4, p5, p6, p7, p8])
                await db.commit()

                # Add variants
                v1 = ProductVariant(product_id=p1.id, title="Size M", sku="TEE-BLK-M", price=1299.0, stock_quantity=50)
                v2 = ProductVariant(product_id=p1.id, title="Size L", sku="TEE-BLK-L", price=1299.0, stock_quantity=35)
                v3 = ProductVariant(product_id=p2.id, title="Matte Black", sku="HP-BLK-01", price=4999.0, stock_quantity=20)
                db.add_all([v1, v2, v3])

                # Admin User
                admin_user = User(
                    full_name="SKIPD Store Admin",
                    email="admin@skipd.in",
                    phone="9876543210",
                    hashed_password=get_password_hash("admin123"),
                    role=UserRole.ADMIN
                )
                db.add(admin_user)
                await db.commit()
                print("[Backend Startup] Seed complete! Admin login: admin@skipd.in / admin123")
    except Exception as e:
        print(f"[Backend Startup Warning] DB seed skipped ({e}). Server starting cleanly...")

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set CORS origins
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Router
from app.api.search import router as search_router

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(payments_router, prefix=settings.API_V1_STR)
app.include_router(shipping_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(whatsapp_router, prefix=settings.API_V1_STR)
app.include_router(rewards_router, prefix=settings.API_V1_STR)
app.include_router(sales_router, prefix=settings.API_V1_STR)
app.include_router(homepage_router, prefix=settings.API_V1_STR)
app.include_router(wallet_router, prefix=settings.API_V1_STR)
app.include_router(coupons_router, prefix=settings.API_V1_STR)
app.include_router(categories_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to SKIPD Custom B2C E-Commerce Platform API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health():
    return {"status": "online", "environment": settings.ENVIRONMENT}
