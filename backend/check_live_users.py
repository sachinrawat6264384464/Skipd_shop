import sys
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.models import User

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        print(f"=== TOTAL USERS COUNT: {len(users)} ===")
        for u in users:
            print(f"ID: {u.id} | Name: '{u.full_name}' | Email: '{u.email}' | Role: {u.role} | Created: {u.created_at}")

if __name__ == "__main__":
    asyncio.run(main())
