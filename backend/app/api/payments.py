from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Order, PaymentTransaction, OrderStatus
from app.schemas.schemas import PaymentVerifyInput
from app.services.razorpay_svc import razorpay_svc

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/verify")
async def verify_payment(data: PaymentVerifyInput, db: AsyncSession = Depends(get_db)):
    is_valid = razorpay_svc.verify_payment_signature(
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        razorpay_signature=data.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid Razorpay payment signature")

    result = await db.execute(select(Order).where(Order.id == data.order_id))
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

    return {"status": "success", "message": "Payment verified successfully", "order_id": order.id}

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
                await db.commit()

    return {"status": "ok"}
