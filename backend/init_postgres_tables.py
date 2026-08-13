import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models.models import Base, Category, Product, ProductVariant, User, UserRole
from app.core.security import get_password_hash
from sqlalchemy import select

PG_URL = "postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/skipd_commerce_db"

async def init_tables():
    print(f"Connecting to PostgreSQL on {PG_URL}...")
    pg_engine = create_async_engine(PG_URL, echo=True)

    print("Creating all database tables in PostgreSQL (port 5433)...")
    async with pg_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[SUCCESS] PostgreSQL tables created successfully!")

    pg_session_factory = async_sessionmaker(pg_engine, class_=AsyncSession, expire_on_commit=False)

    async with pg_session_factory() as db:
        res = await db.execute(select(Category))
        if not res.scalars().first():
            print("Seeding initial B2C catalog into PostgreSQL...")
            cat_apparel = Category(name="Apparel & Wear", slug="apparel", description="Premium fashion & apparel collection", image_url="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800")
            cat_tech = Category(name="Tech Essentials", slug="tech", description="Next-gen gadgets & everyday gear", image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800")
            cat_lifestyle = Category(name="Lifestyle Accessories", slug="lifestyle", description="Modern luxury accessories", image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800")
            
            db.add_all([cat_apparel, cat_tech, cat_lifestyle])
            await db.commit()

            p1 = Product(
                title="Minimalist Oversized Graphic Tee",
                handle="minimalist-graphic-tee",
                description="Heavyweight 240 GSM organic cotton t-shirt with premium screen-printed typography.",
                price=1299.0,
                compare_at_price=1999.0,
                category_id=cat_apparel.id,
                featured=True,
                images=["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"],
                tags=["bestseller", "apparel"]
            )
            p2 = Product(
                title="Active ANC Wireless Headphones",
                handle="active-anc-headphones",
                description="Studio-grade noise cancelling headphones with 40-hour battery life.",
                price=4999.0,
                compare_at_price=7999.0,
                category_id=cat_tech.id,
                featured=True,
                images=["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
                tags=["audio", "tech"]
            )
            db.add_all([p1, p2])
            await db.commit()

            admin_user = User(
                full_name="SKIPD Store Admin",
                email="admin@skipd.in",
                phone="9876543210",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN
            )
            db.add(admin_user)
            await db.commit()
            print("[SUCCESS] Initial seed data created in PostgreSQL database 'skipd_commerce_db'!")
        else:
            print("[INFO] B2C Catalog already populated in PostgreSQL database.")

if __name__ == "__main__":
    asyncio.run(init_tables())
