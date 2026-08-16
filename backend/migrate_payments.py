import asyncio
from app.core.database import engine
from sqlalchemy import text

async def run_payment_migration():
    async with engine.begin() as conn:
        print("Executing PostgreSQL Schema Migration for payment_transactions...")
        await conn.execute(text("ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'UPI';"))
        await conn.execute(text("ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS gateway VARCHAR(50) DEFAULT 'Razorpay';"))
        print("Migration Completed: payment_method and gateway columns added to PostgreSQL payment_transactions table!")

if __name__ == "__main__":
    asyncio.run(run_payment_migration())
