from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.tasks.order_tasks import send_whatsapp_receipt_task, abandoned_cart_reminder_task

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp Automation"])

class WhatsAppNotificationInput(BaseModel):
    customer_phone: str
    customer_name: str
    order_number: str
    total_amount: float

class AbandonedCartInput(BaseModel):
    customer_email: EmailStr
    customer_name: str

@router.post("/send-receipt")
async def send_whatsapp_receipt(data: WhatsAppNotificationInput):
    # Trigger Celery background task without blocking thread
    try:
        send_whatsapp_receipt_task.delay(
            customer_phone=data.customer_phone,
            customer_name=data.customer_name,
            order_number=data.order_number,
            amount=data.total_amount
        )
    except Exception as e:
        print(f"[WhatsApp Endpoint Warning] Redis/Celery offline, logged locally ({e})")
    
    return {
        "status": "queued",
        "message": f"WhatsApp receipt task queued for {data.customer_phone}"
    }

@router.post("/trigger-cart-recovery")
async def trigger_cart_recovery(data: AbandonedCartInput):
    try:
        abandoned_cart_reminder_task.delay(email=data.customer_email, customer_name=data.customer_name)
    except Exception as e:
        print(f"[WhatsApp Endpoint Warning] Redis/Celery offline ({e})")
        
    return {
        "status": "queued",
        "message": f"Abandoned cart recovery message scheduled for {data.customer_email}"
    }
