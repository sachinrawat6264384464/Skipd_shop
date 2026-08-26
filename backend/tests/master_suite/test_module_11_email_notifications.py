import pytest
from app.services.email_service import (
    send_email_notification,
    send_welcome_account_email,
    send_order_confirmation_email,
    send_otp_email,
    send_abandoned_reminder_email
)

@pytest.mark.asyncio
async def test_mod11_001_send_generic_email_notification():
    """Case 001: Test generic send_email_notification function via SMTP."""
    result = send_email_notification(
        to_email="sachinrawat6264384464@gmail.com",
        subject="🧪 Test Generic E-COM Email Notification",
        html_content="<h1>Test Email</h1><p>Testing generic email notification dispatch.</p>"
    )
    assert result is True


@pytest.mark.asyncio
async def test_mod11_002_send_welcome_account_email():
    """Case 002: Test Welcome Account Email generation & delivery."""
    result = send_welcome_account_email(
        to_email="sachinrawat6264384464@gmail.com",
        full_name="Sachin Rawat",
        raw_password="TestPassword123!"
    )
    assert result is True


@pytest.mark.asyncio
async def test_mod11_003_send_order_confirmation_email():
    """Case 003: Test Order Confirmation HTML email delivery."""
    result = send_order_confirmation_email(
        to_email="sachinrawat6264384464@gmail.com",
        order_number="E-COM-998877",
        total_amount=2499.00,
        customer_name="Sachin Rawat",
        order_items=[{"title": "boAt Rockerz 450 Pro Headphones", "quantity": 1, "unit_price": 2499.00}],
        shipping_address="Gwalior, Madhya Pradesh - 474001",
        payment_method="Razorpay UPI / Online"
    )
    assert result is True


@pytest.mark.asyncio
async def test_mod11_004_send_otp_email():
    """Case 004: Test OTP verification code email delivery."""
    result = send_otp_email(
        to_email="sachinrawat6264384464@gmail.com",
        otp_code="984512"
    )
    assert result is True
