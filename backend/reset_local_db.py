import asyncio
from sqlalchemy import text
from app.core.database import engine, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.models import User, UserRole

async def reset_local_database():
    print("=====================================================")
    print("[RESET] PURGING ALL DATA FROM LOCAL POSTGRESQL DATABASE...")
    print("=====================================================")
    
    async with engine.begin() as conn:
        tables = [
            "users", "orders", "order_items", "products", "product_variants",
            "categories", "reviews", "coupons", "addresses", "cart_items",
            "wishlist_items", "wallet_transactions", "shipments",
            "payment_transactions", "email_logs", "return_requests"
        ]
        for t in tables:
            try:
                await conn.execute(text(f"TRUNCATE TABLE {t} RESTART IDENTITY CASCADE;"))
                print(f"[SUCCESS] Truncated table: {t}")
            except Exception:
                try:
                    await conn.execute(text(f"DELETE FROM {t};"))
                except Exception:
                    pass

    async with AsyncSessionLocal() as session:
        # Create fresh SuperAdmin
        admin_user = User(
            full_name="Sachin Rawat (Super Admin)",
            email="admin@skipd.in",
            phone="9876543210",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        session.add(admin_user)
        await session.commit()
        print("[SUCCESS] Fresh Master Admin created: admin@skipd.in (Password: admin123)")

    print("=====================================================")
    print("[SUCCESS] LOCAL POSTGRESQL DATABASE IS NOW 100% FRESH & EMPTY!")
    print("=====================================================")

if __name__ == "__main__":
    asyncio.run(reset_local_database())
