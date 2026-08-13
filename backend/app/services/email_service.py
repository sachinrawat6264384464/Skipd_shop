import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_email_notification(to_email: str, subject: str, html_content: str) -> bool:
    """Send HTML Email via SMTP or Fallback Console Logger for Async Tasks."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"SKIPD Commerce <{smtp_user}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_user, to_email, msg.as_string())
            print(f"✉️ [EMAIL SENT SUCCESSFULLY] To: {to_email} | Subject: '{subject}'")
            return True
        except Exception as e:
            print(f"❌ [SMTP EMAIL ERROR] {e}")
            return False
    else:
        print(f"\n📧 [SIMULATED EMAIL FLOW] To: {to_email} | Subject: '{subject}'")
        print(f"--- HTML BODY ---\n{html_content[:300]}...\n-----------------\n")
        return True


def send_otp_email(to_email: str, otp_code: str):
    """Send 6-digit OTP email."""
    subject = f"Your SKIPD Login OTP: {otp_code}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; background: #ffffff;">
        <h2 style="color: #059669; margin-top: 0;">SKIPD Commerce Security</h2>
        <p style="font-size: 14px; color: #374151;">Use the 6-digit OTP code below to sign in to your account. Valid for 60 seconds.</p>
        <div style="background: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #065f46;">{otp_code}</span>
        </div>
        <p style="font-size: 12px; color: #6b7280;">If you did not request this OTP, please ignore this email.</p>
    </div>
    """
    return send_email_notification(to_email, subject, html_content)


def send_order_confirmation_email(to_email: str, order_number: str, total_amount: float, customer_name: str):
    """Send Order Confirmation Email."""
    subject = f"Order Confirmed #{order_number} - SKIPD Commerce"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; background: #ffffff;">
        <h2 style="color: #059669;">Thank you for your order, {customer_name}!</h2>
        <p style="font-size: 14px; color: #374151;">We've received your order <strong>#{order_number}</strong> and are preparing it for shipment.</p>
        <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: #111827;">Total Amount Paid: ₹{total_amount:,.2f}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Status: Paid &amp; Confirmed</p>
        </div>
        <p style="font-size: 12px; color: #6b7280;">You can track your live shipment anytime at <a href="http://localhost:3003/track-order" style="color: #059669;">SKIPD Track Order</a>.</p>
    </div>
    """
    return send_email_notification(to_email, subject, html_content)


def send_shipping_update_email(to_email: str, order_number: str, tracking_number: str, courier_name: str):
    """Send Shipment Tracking Email."""
    subject = f"Your Order #{order_number} Has Been Shipped! 🚀"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; background: #ffffff;">
        <h2 style="color: #2563eb;">On Its Way! 📦</h2>
        <p style="font-size: 14px; color: #374151;">Your order <strong>#{order_number}</strong> has been handed over to <strong>{courier_name}</strong>.</p>
        <div style="background: #eff6ff; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: #1e40af;">Tracking AWB: {tracking_number}</p>
        </div>
    </div>
    """
    return send_email_notification(to_email, subject, html_content)
