import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, AsyncSessionLocal
from app.models.models import Base, User, UserRole, Category, Product, ProductVariant
from app.core.security import get_password_hash
from seed_full_db import ALL_CATEGORIES, ALL_PRODUCTS
from app.core.firebase import init_firebase_admin

def purge_firebase_users():
    print("\n[FIREBASE PURGE] Initializing Firebase Admin SDK...")
    try:
        init_firebase_admin()
        import firebase_admin
        from firebase_admin import auth

        if not firebase_admin._apps:
            print("[FIREBASE PURGE WARN] Firebase Admin SDK is not configured (missing JSON cert/env). Skipping Firebase user deletion.")
            return

        print("[FIREBASE PURGE] Listing all Firebase Auth users...")
        page = auth.list_users()
        deleted_count = 0
        while page:
            for user in page.users:
                try:
                    # Do not delete admin email if matches admin@e-com.in
                    if user.email and "admin" in user.email.lower():
                        print(f" -> Skipping Admin Firebase user: {user.email} ({user.uid})")
                        continue
                    auth.delete_user(user.uid)
                    deleted_count += 1
                    print(f" -> Deleted Firebase user: {user.email or user.uid}")
                except Exception as e:
                    print(f" -> Error deleting Firebase user {user.uid}: {e}")
            page = page.get_next_page()

        print(f"[FIREBASE PURGE SUCCESS] Deleted {deleted_count} customer accounts from Firebase Auth!")
    except Exception as e:
        print(f"[FIREBASE PURGE WARN] Firebase user purge skipped or encountered exception: {e}")

async def reset_all_database():
    print("==================================================================")
    print("[MASTER RESET] RESETTING ENTIRE POSTGRESQL DB & FIREBASE CUSTOMERS...")
    print("==================================================================")

    # 1. Drop & Recreate all tables cleanly
    async with engine.begin() as conn:
        print("[1/4] Dropping all existing PostgreSQL database tables & records...")
        await conn.run_sync(Base.metadata.drop_all)
        print("[2/4] Recreating fresh PostgreSQL table schemas...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 2. Create Master SuperAdmin Account
        print("[3/4] Creating Master SuperAdmin user (admin@e-com.in)...")
        admin_user = User(
            full_name="Sachin Rawat (Super Admin)",
            email="admin@e-com.in",
            phone="9876543210",
            hashed_password=get_password_hash("AdminPass123!"),
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
        print(f" -> Successfully seeded {seeded_count} products into PostgreSQL DB!")

    # 5. Purge Firebase Users
    purge_firebase_users()

    print("==================================================================")
    print("[SUCCESS] POSTGRESQL DB & FIREBASE CUSTOMER ACCOUNTS RESET COMPLETED 100%!")
    print("==================================================================")

if __name__ == "__main__":
    asyncio.run(reset_all_database())
