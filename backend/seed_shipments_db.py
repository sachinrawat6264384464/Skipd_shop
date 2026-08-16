import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import Order, Shipment
from sqlalchemy import select

async def seed_shipments():
    async with AsyncSessionLocal() as session:
        print("Seeding Real Shipments into PostgreSQL Database...")

        # 1. Fetch Orders
        orders_res = await session.execute(select(Order))
        orders = orders_res.scalars().all()

        real_shipments = [
            {
                "awb_code": "SR-8849201",
                "order_number": "#SKIPD-25879",
                "customer_name": "Amit Sharma",
                "customer_email": "amit@gmail.com",
                "courier_name": "Delhivery Surface",
                "destination": "Gwalior, Madhya Pradesh",
                "pin_code": "474001",
                "est_delivery_date": "May 27, 2026 (2 Days Left)",
                "status": "IN TRANSIT",
                "current_location": "Bhopal Sort Center (May 25, 2025 02:32 PM)"
            },
            {
                "awb_code": "SR-8849202",
                "order_number": "#SKIPD-25878",
                "customer_name": "Priya Verma",
                "customer_email": "priya.verma@gmail.com",
                "courier_name": "Bluedart Express Air",
                "destination": "Ahmedabad, Gujarat",
                "pin_code": "380001",
                "est_delivery_date": "May 26, 2026 (1 Day Left)",
                "status": "OUT FOR DELIVERY",
                "current_location": "Out for Delivery (May 25, 2025 09:15 AM)"
            },
            {
                "awb_code": "SR-8849203",
                "order_number": "#SKIPD-25877",
                "customer_name": "Rahul Singh",
                "customer_email": "rahul.singh@gmail.com",
                "courier_name": "Xpressbees Surface",
                "destination": "New Delhi, Delhi",
                "pin_code": "110001",
                "est_delivery_date": "May 28, 2026 (3 Days Left)",
                "status": "PICKED UP",
                "current_location": "Seller Warehouse (May 25, 2025 08:40 AM)"
            },
            {
                "awb_code": "SR-8849204",
                "order_number": "#SKIPD-25876",
                "customer_name": "Sneha Patel",
                "customer_email": "sneha.patel@gmail.com",
                "courier_name": "Ekart Surface",
                "destination": "Pune, Maharashtra",
                "pin_code": "411001",
                "est_delivery_date": "May 29, 2026 (4 Days Left)",
                "status": "DELIVERED",
                "current_location": "Delivered (May 24, 2025 06:20 PM)"
            },
            {
                "awb_code": "SR-8849205",
                "order_number": "#SKIPD-25875",
                "customer_name": "Vikram Joshi",
                "customer_email": "vikram.joshi@gmail.com",
                "courier_name": "Shadowfax Express",
                "destination": "Jaipur, Rajasthan",
                "pin_code": "302001",
                "est_delivery_date": "May 27, 2026 (2 Days Left)",
                "status": "RTO INITIATED",
                "current_location": "Delivery Failed (May 24, 2025 11:10 AM)"
            }
        ]

        for idx, s_data in enumerate(real_shipments):
            order_id = orders[idx % len(orders)].id if orders else 1

            res = await session.execute(
                select(Shipment).where(Shipment.awb_code == s_data["awb_code"])
            )
            if not res.scalars().first():
                sh = Shipment(
                    order_id=order_id,
                    awb_code=s_data["awb_code"],
                    courier_name=s_data["courier_name"],
                    destination=s_data["destination"],
                    pin_code=s_data["pin_code"],
                    est_delivery_date=s_data["est_delivery_date"],
                    current_location=s_data["current_location"],
                    status=s_data["status"]
                )
                session.add(sh)

        await session.commit()
        print("Successfully seeded Real Shipments into PostgreSQL Database!")

if __name__ == "__main__":
    asyncio.run(seed_shipments())
