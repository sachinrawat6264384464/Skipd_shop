import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, AsyncSessionLocal
from app.models.models import Base, User, UserRole
from app.core.security import get_password_hash

async def empty_neon_database():
    print("==================================================================")
    print("[EMPTY] PURGING ALL DATA FROM NEON CLOUD POSTGRESQL DATABASE...")
    print("==================================================================")

    # 1. Drop & Recreate all tables cleanly
    async with engine.begin() as conn:
        print("[1/2] Dropping all database tables & records...")
        await conn.run_sync(Base.metadata.drop_all)
        print("[2/2] Recreating empty PostgreSQL table schemas...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Create ONLY Master SuperAdmin Account (so admin can log in)
        print("Creating Master SuperAdmin account (admin@skipd.in)...")
        admin_user = User(
            full_name="Sachin Rawat (Super Admin)",
            email="admin@skipd.in",
            phone="9876543210",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        session.add(admin_user)
        await session.commit()
        print(" -> Master SuperAdmin user ready.")

    print("==================================================================")
    print("[SUCCESS] NEON POSTGRESQL DATABASE IS NOW 100% EMPTY (0 PRODUCTS, 0 ORDERS, 0 CATEGORIES)!")
    print("==================================================================")

if __name__ == "__main__":
    asyncio.run(empty_neon_database())
