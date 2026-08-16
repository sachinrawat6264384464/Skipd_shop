import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import User, Review, Order
from sqlalchemy import select

async def check_db_users():
    async with AsyncSessionLocal() as session:
        # Check users
        users_res = await session.execute(select(User))
        users = users_res.scalars().all()
        print(f"--- POSTGRESQL USERS COUNT: {len(users)} ---")
        for u in users:
            print(f"ID: {u.id} | Name: {u.full_name} | Email: {u.email} | Role: {u.role}")

        # Check reviews
        reviews_res = await session.execute(select(Review))
        reviews = reviews_res.scalars().all()
        print(f"\n--- POSTGRESQL REVIEWS COUNT: {len(reviews)} ---")
        for r in reviews:
            print(f"ID: {r.id} | User: {r.user_name} | Rating: {r.rating} | Comment: {r.comment}")

if __name__ == "__main__":
    asyncio.run(check_db_users())
