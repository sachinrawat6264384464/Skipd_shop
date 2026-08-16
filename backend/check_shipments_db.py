import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import Shipment
from sqlalchemy import select

async def check_db():
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Shipment))
        shipments = res.scalars().all()
        print(f"TOTAL SHIPMENTS IN POSTGRESQL DB: {len(shipments)}")
        for s in shipments:
            print(f"ID: {s.id} | AWB: {s.awb_code} | Courier: {s.courier_name} | Dest: {s.destination} ({s.pin_code}) | Status: {s.status}")

if __name__ == "__main__":
    asyncio.run(check_db())
