import asyncio
from app.core.database import engine
from sqlalchemy import text

async def run_migration():
    async with engine.begin() as conn:
        print("Executing PostgreSQL Schema Migration for firebase_uid...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128);"))
        await conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_firebase_uid ON users(firebase_uid);"))
        print("Migration Completed: firebase_uid column & index added to PostgreSQL users table!")

if __name__ == "__main__":
    asyncio.run(run_migration())
