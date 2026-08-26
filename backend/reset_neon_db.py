import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, AsyncSessionLocal
from app.models.models import Base, User, UserRole, Category, Product, ProductVariant
from app.core.security import get_password_hash
from seed_full_db import ALL_CATEGORIES, ALL_PRODUCTS

async def reset_neon_database():
    print("==================================================================")
    print("[RESET] RESETTING NEON CLOUD POSTGRESQL DATABASE TO PURE CLEAN STATE...")
    print("==================================================================")

    # 1. Drop & Recreate all tables cleanly
    async with engine.begin() as conn:
        print("[1/4] Dropping existing database tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("[2/4] Creating fresh PostgreSQL tables...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 2. Create Master SuperAdmin Account
        print("[3/4] Creating Master SuperAdmin user (admin@e-com.in)...")
        admin_user = User(
            full_name="Sachin Rawat (Super Admin)",
            email="admin@e-com.in",
            phone="9876543210",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        session.add(admin_user)
        await session.flush()

        # 3. Seed Clean Categories
        print("[4/4] Seeding clean 30-product catalog & categories...")
        cat_map = {}
        for cdata in ALL_CATEGORIES:
            cat = Category(
                name=cdata["name"],
                slug=cdata["slug"],
                description=cdata["description"],
                image_url=cdata["image_url"]
            )
            session.add(cat)
            await session.flush()
            cat_map[cdata["slug"]] = cat.id

        # 4. Seed Clean Products
        seeded_count = 0
        for pdata in ALL_PRODUCTS:
            cat_id = cat_map.get(pdata["cat_slug"])
            prod = Product(
                title=pdata["title"],
                handle=pdata["handle"],
                description=pdata["description"],
                price=pdata["price"],
                compare_at_price=pdata["compare_at_price"],
                category_id=cat_id,
                featured=pdata["featured"],
                images=pdata["images"],
                tags=pdata["tags"]
            )
            session.add(prod)
            await session.flush()

            # Add initial stock variant
            var = ProductVariant(
                product_id=prod.id,
                title="Standard Edition",
                sku=f"{prod.handle[:8].upper()}-STD",
                price=prod.price,
                stock_quantity=100
            )
            session.add(var)
            seeded_count += 1

        await session.commit()
        print(f" -> Successfully seeded {seeded_count} products into Neon PostgreSQL DB!")

    print("==================================================================")
    print("[SUCCESS] NEON POSTGRESQL DATABASE HAS BEEN 100% RESET & FRESHLY SEEDED!")
    print("==================================================================")

if __name__ == "__main__":
    asyncio.run(reset_neon_database())
