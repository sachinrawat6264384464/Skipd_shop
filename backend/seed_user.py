import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import User, UserRole
from app.core.security import get_password_hash
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == 'customer@skipd.in'))
        user = res.scalars().first()
        if not user:
            user = User(
                full_name='Sachin Rawat',
                email='customer@skipd.in',
                phone='9876543210',
                hashed_password=get_password_hash('pass1234'),
                role=UserRole.CUSTOMER
            )
            db.add(user)
            await db.commit()
            print("CREATED CUSTOMER USER: customer@skipd.in")
        else:
            print("CUSTOMER USER ALREADY EXISTS:", user.email)

if __name__ == "__main__":
    asyncio.run(main())
