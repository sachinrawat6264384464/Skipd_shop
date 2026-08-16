import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import Order, PaymentTransaction, OrderStatus
from sqlalchemy import select

async def seed_payments():
    async with AsyncSessionLocal() as session:
        print("Seeding Real Payment Transactions into PostgreSQL Database...")

        # 1. Fetch Orders
        orders_res = await session.execute(select(Order))
        orders = orders_res.scalars().all()

        real_txns = [
            {
                "txn_id": "PAY-99201",
                "order_number": "#SKIPD-25879",
                "customer_name": "Amit Sharma",
                "customer_email": "amit@gmail.com",
                "payment_method": "Razorpay UPI",
                "gateway": "Razorpay",
                "rzp_id": "pay_MB42910481",
                "amount": 2999,
                "status": "SUCCESS"
            },
            {
                "txn_id": "PAY-99202",
                "order_number": "#SKIPD-25878",
                "customer_name": "Priya Verma",
                "customer_email": "priya@yahoo.com",
                "payment_method": "VISA Credit Card",
                "gateway": "Razorpay",
                "rzp_id": "pay_MB42910482",
                "amount": 1799,
                "status": "SUCCESS"
            },
            {
                "txn_id": "PAY-99203",
                "order_number": "#SKIPD-25877",
                "customer_name": "Rahul Singh",
                "customer_email": "rahul@gmail.com",
                "payment_method": "Mastercard Debit",
                "gateway": "Razorpay",
                "rzp_id": "pay_MB42910483",
                "amount": 4499,
                "status": "SUCCESS"
            },
            {
                "txn_id": "PAY-99204",
                "order_number": "#SKIPD-25876",
                "customer_name": "Sneha Patel",
                "customer_email": "sneha@gmail.com",
                "payment_method": "Razorpay UPI",
                "gateway": "Razorpay",
                "rzp_id": "pay_MB42910484",
                "amount": 3199,
                "status": "SUCCESS"
            },
            {
                "txn_id": "PAY-99205",
                "order_number": "#SKIPD-25875",
                "customer_name": "Vikram Joshi",
                "customer_email": "vikram@gmail.com",
                "payment_method": "Razorpay NetBanking",
                "gateway": "Razorpay",
                "rzp_id": "pay_MB42910485",
                "amount": 7499,
                "status": "REFUNDED"
            },
            {
                "txn_id": "PAY-99206",
                "order_number": "#SKIPD-25874",
                "customer_name": "Karan Mehta",
                "customer_email": "karan@gmail.com",
                "payment_method": "Amazon Pay",
                "gateway": "Razorpay",
                "rzp_id": "pay_MB42910486",
                "amount": 2299,
                "status": "SUCCESS"
            },
            {
                "txn_id": "PAY-99207",
                "order_number": "#SKIPD-25873",
                "customer_name": "Ananya Roy",
                "customer_email": "ananya@gmail.com",
                "payment_method": "Paytm Wallet",
                "gateway": "Razorpay",
                "rzp_id": "pay_MB42910487",
                "amount": 1249,
                "status": "FAILED"
            }
        ]

        for idx, t_data in enumerate(real_txns):
            # Pick existing order or create linked order
            order_id = orders[idx % len(orders)].id if orders else 1
            
            res = await session.execute(
                select(PaymentTransaction).where(PaymentTransaction.razorpay_payment_id == t_data["rzp_id"])
            )
            if not res.scalars().first():
                pt = PaymentTransaction(
                    order_id=order_id,
                    razorpay_order_id=f"order_rzp_{idx+100}",
                    razorpay_payment_id=t_data["rzp_id"],
                    razorpay_signature="sig_verified_skipd",
                    amount=float(t_data["amount"]),
                    payment_method=t_data["payment_method"],
                    gateway=t_data["gateway"],
                    status=t_data["status"]
                )
                session.add(pt)

        await session.commit()
        print("Successfully seeded Real Payment Transactions into PostgreSQL Database!")

if __name__ == "__main__":
    asyncio.run(seed_payments())
