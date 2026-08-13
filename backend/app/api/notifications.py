from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/notifications", tags=["Notifications & Email Flow"])

class EmailNotificationRequest(BaseModel):
    to_email: EmailStr
    subject: str
    template_type: str  # "order_confirmation", "otp_login", "shipping_update", "gift_card"
    order_id: Optional[str] = None
    tracking_number: Optional[str] = None
    customer_name: Optional[str] = "Customer"

def send_email_background(email: str, subject: str, body: str):
    """Simulated Async Background Email Service (SMTP/SendGrid ready)"""
    print(f"[EMAIL SERVICE DISPATCHED] To: {email} | Subject: '{subject}'")
    print(f"--- EMAIL BODY ---\n{body}\n--- END EMAIL ---")

@router.post("/send-email")
async def send_email_notification(payload: EmailNotificationRequest, background_tasks: BackgroundTasks):
    """Send Order / Auth / Shipping Email notification via Async Background Tasks"""
    
    if payload.template_type == "order_confirmation":
        body = f"Hi {payload.customer_name},\n\nThank you for your order #{payload.order_id}! Your payment is confirmed and we are preparing your package for shipment.\n\nTrack your order here: http://localhost:3003/track-order?orderId={payload.order_id}\n\nBest,\nSKIPD Commerce Team"
    elif payload.template_type == "shipping_update":
        body = f"Hi {payload.customer_name},\n\nGreat news! Your order #{payload.order_id} has been dispatched via BlueDart Express. Tracking AWB: {payload.tracking_number}.\n\nFollow your package live: http://localhost:3003/track-order?awb={payload.tracking_number}\n\nBest,\nSKIPD Logistics"
    else:
        body = f"Hi {payload.customer_name},\n\n{payload.subject}\n\nThank you for shopping with SKIPD Commerce!"

    background_tasks.add_task(send_email_background, payload.to_email, payload.subject, body)
    
    return {
        "status": "success",
        "message": f"Email notification for '{payload.template_type}' queued for {payload.to_email}",
        "recipient": payload.to_email
    }
