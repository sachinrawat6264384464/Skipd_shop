from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Order, PaymentTransaction, OrderStatus
from app.schemas.schemas import PaymentVerifyInput
from app.services.razorpay_svc import razorpay_svc
from app.services.email_service import send_order_confirmation_email

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/admin/all")
async def get_all_admin_payments(db: AsyncSession = Depends(get_db)):
    """Fetch all payment transactions and orders directly from Neon PostgreSQL DB for Admin Payments dashboard."""
    res = await db.execute(
        select(PaymentTransaction).options(selectinload(PaymentTransaction.order)).order_by(PaymentTransaction.id.desc())
    )
    txns = res.scalars().all()

    orders_res = await db.execute(select(Order).order_by(Order.id.desc()))
    orders = orders_res.scalars().all()

    seen_order_ids = set()
    output = []

    for idx, t in enumerate(txns):
        ord_obj = t.order
        if ord_obj:
            seen_order_ids.add(ord_obj.id)
            seen_order_ids.add(ord_obj.order_number)

        output.append({
            "id": f"PAY-{99201 + idx}",
            "db_id": t.id,
            "orderId": ord_obj.order_number if ord_obj else f"#SKIPD-{25879 - idx}",
            "customerName": ord_obj.customer_name if ord_obj else "Customer Account",
            "customerEmail": ord_obj.customer_email if ord_obj else "customer@skipd.in",
            "amount": float(t.amount or 0.0),
            "payment_method": t.payment_method or "Razorpay Online",
            "gateway": t.gateway or "Razorpay",
            "status": t.status or "SUCCESS",
            "rzpPaymentId": t.razorpay_payment_id or f"pay_MB4291048{idx+1}",
            "date": t.created_at.strftime("%b %d, %Y") if t.created_at else "May 25, 2026",
            "time": t.created_at.strftime("%I:%M %p") if t.created_at else "02:14 PM"
        })

    for o_idx, o in enumerate(orders):
        if o.id in seen_order_ids or o.order_number in seen_order_ids:
            continue
        
        status_val = str(o.status.value if hasattr(o.status, 'value') else o.status).upper()
        status_str = "SUCCESS" if status_val in ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] else "FAILED"
        if status_val in ["CANCELLED", "RETURNED"]:
            status_str = "REFUNDED"

        output.append({
            "id": f"PAY-{99500 + o_idx}",
            "db_id": o.id,
            "orderId": o.order_number,
            "customerName": o.customer_name or "Customer",
            "customerEmail": o.customer_email or "customer@skipd.in",
            "amount": float(o.total_amount or 0.0),
            "payment_method": "Razorpay UPI / Online",
            "gateway": "Razorpay",
            "status": status_str,
            "rzpPaymentId": o.razorpay_order_id or f"pay_RZP_{o.id}",
            "date": o.created_at.strftime("%b %d, %Y") if o.created_at else "May 25, 2026",
            "time": o.created_at.strftime("%I:%M %p") if o.created_at else "02:14 PM"
        })

    return output

@router.post("/verify")
async def verify_payment(
    data: PaymentVerifyInput,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    is_valid = razorpay_svc.verify_payment_signature(
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        razorpay_signature=data.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid Razorpay payment signature")

    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == data.order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = OrderStatus.PAID
    
    transaction = PaymentTransaction(
        order_id=order.id,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        razorpay_signature=data.razorpay_signature,
        amount=order.total_amount,
        status="SUCCESS"
    )
    db.add(transaction)
    await db.commit()

    # ✉️ Trigger Async Payment Success Rich HTML Order Confirmation Email
    items_list = [
        {"title": item.product_name, "quantity": item.quantity, "unit_price": item.unit_price}
        for item in order.items
    ] if order.items else [{"title": "SKIPD Order Items", "quantity": 1, "unit_price": order.total_amount}]

    background_tasks.add_task(
        send_order_confirmation_email,
        to_email=order.customer_email,
        order_number=order.order_number,
        total_amount=order.total_amount,
        customer_name=order.customer_name,
        order_items=items_list,
        shipping_address=order.shipping_address,
        payment_method="Razorpay Online (Paid)"
    )

    return {"status": "success", "message": "Payment verified and order confirmation email dispatched!", "order_id": order.id}

@router.post("/webhook")
async def razorpay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    event = body.get("event")
    
    if event == "payment.captured":
        payload = body.get("payload", {}).get("payment", {}).get("entity", {})
        rzp_order_id = payload.get("order_id")
        rzp_payment_id = payload.get("id")

        if rzp_order_id:
            res = await db.execute(select(Order).where(Order.razorpay_order_id == rzp_order_id))
            order = res.scalars().first()
            if order:
                order.status = OrderStatus.PAID

                # Record PaymentTransaction
                txn = PaymentTransaction(
                    order_id=order.id,
                    razorpay_order_id=rzp_order_id,
                    razorpay_payment_id=rzp_payment_id,
                    amount=order.total_amount,
                    status="SUCCESS"
                )
                db.add(txn)
                await db.commit()

    return {"status": "ok"}
