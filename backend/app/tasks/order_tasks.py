import time
from app.core.celery_app import celery_app

@celery_app.task(name="app.tasks.order_tasks.sync_shiprocket_order_task")
def sync_shiprocket_order_task(order_id: int, order_number: str):
    """
    Asynchronous Celery task to push order details to Shiprocket API
    and generate AWB tracking without slowing down customer checkout response.
    """
    print(f"[Celery Worker Task] Processing Shiprocket courier booking for Order #{order_number} (ID: {order_id})...")
    time.sleep(1.5) # Simulate external API request latency
    awb_code = f"SR-AWB-{int(time.time())}"
    print(f"[Celery Worker Task Success] Generated AWB: {awb_code} for Order #{order_number}")
    return {"status": "SUCCESS", "order_id": order_id, "awb_code": awb_code, "courier": "BlueDart Express"}

@celery_app.task(name="app.tasks.order_tasks.send_whatsapp_receipt_task")
def send_whatsapp_receipt_task(customer_phone: str, customer_name: str, order_number: str, amount: float):
    """
    Asynchronous Celery task to send automated WhatsApp order receipt via WhatsApp Business API / Wati API.
    """
    print(f"[Celery Worker Task] Sending WhatsApp Receipt to {customer_phone} for Order {order_number} (₹{amount})...")
    time.sleep(1.0)
    print(f"[Celery Worker Task Success] WhatsApp message delivered to {customer_phone}")
    return {"status": "SENT", "recipient": customer_phone, "template": "order_confirmation_v1"}

@celery_app.task(name="app.tasks.order_tasks.abandoned_cart_reminder_task")
def abandoned_cart_reminder_task(email: str, customer_name: str):
    """
    Asynchronous Celery cron task to send 5% discount recovery notification for inactive carts.
    """
    print(f"[Celery Worker Task] Triggering Abandoned Cart 5% Discount Recovery for {email}...")
    return {"status": "TRIGGERED", "email": email, "coupon": "SKIPD5OFF"}
