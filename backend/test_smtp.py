import os, sys
from dotenv import load_dotenv
load_dotenv()

# Temporarily fix sys.path
sys.path.insert(0, '.')
from app.services.email_service import send_order_confirmation_email, send_welcome_account_email

print("Sending test order confirmation email...")
result = send_order_confirmation_email(
    to_email="sachinrawat6264384464@gmail.com",
    order_number="E-COM-TEST001",
    total_amount=1299.00,
    customer_name="Sachin Rawat",
    order_items=[{"title": "Minimalist Oversized Graphic Tee", "quantity": 1, "unit_price": 1299, "total_price": 1299}],
    shipping_address={"address_line1": "123 Test Street", "city": "Delhi", "state": "Delhi", "pincode": "110001", "phone": "9876543210"},
    payment_method="Razorpay Online"
)
print(f"Order email result: {'SENT' if result else 'FAILED'}")

print("\nSending test welcome email...")
result2 = send_welcome_account_email(
    to_email="sachinrawat6264384464@gmail.com",
    full_name="Test Customer",
    raw_password="TestPass@123"
)
print(f"Welcome email result: {'SENT' if result2 else 'FAILED'}")
