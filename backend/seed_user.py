import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import User, UserRole
from app.core.security import get_password_hash
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        # Seed Customer
        res_cust = await db.execute(select(User).where(User.email == 'customer@skipd.in'))
        cust = res_cust.scalars().first()
        if not cust:
            cust = User(
                full_name='Sachin Rawat',
                email='customer@skipd.in',
                phone='9876543210',
                hashed_password=get_password_hash('pass1234'),
                role=UserRole.CUSTOMER
            )
            db.add(cust)
            await db.commit()
            print("[SUCCESS] CREATED CUSTOMER USER: customer@skipd.in / pass1234")
        else:
            print("[EXISTS] CUSTOMER USER ALREADY EXISTS:", cust.email)

        # Seed Admin
        res_admin = await db.execute(select(User).where(User.email == 'admin@skipd.in'))
        admin = res_admin.scalars().first()
        if not admin:
            admin = User(
                full_name='SKIPD Admin',
                email='admin@skipd.in',
                phone='6264384464',
                hashed_password=get_password_hash('admin123'),
                role=UserRole.ADMIN
            )
            db.add(admin)
            await db.commit()
            print("[SUCCESS] CREATED ADMIN USER: admin@skipd.in / admin123")
        else:
            print("[EXISTS] ADMIN USER ALREADY EXISTS:", admin.email)

if __name__ == "__main__":
    asyncio.run(main())
