import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from dotenv import load_dotenv

load_dotenv()

def send_email_notification(to_email: str, subject: str, html_content: str) -> bool:
    """Send HTML Email via SMTP or Fallback Console Logger for Async Tasks."""
    smtp_host = os.getenv("SMTP_HOST", os.getenv("EMAIL_HOST", "smtp.gmail.com")).strip()
    smtp_port = int(os.getenv("SMTP_PORT", os.getenv("EMAIL_PORT", 587)))
    smtp_user = os.getenv("SMTP_USER", os.getenv("EMAIL_HOST_USER", "")).strip()
    smtp_password = os.getenv("SMTP_PASSWORD", os.getenv("EMAIL_HOST_PASSWORD", "")).strip()

    if smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = Header(subject, "utf-8")
            msg["From"] = f"SKIPD Security <{smtp_user}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            print(f"[EMAIL SENT SUCCESSFULLY] To: {to_email}")
            return True
        except Exception as e:
            print(f"[SMTP EMAIL ERROR] {type(e).__name__}: {str(e).encode('ascii', 'replace').decode('ascii')}")
            return False
    else:
        print(f"\n[SIMULATED EMAIL FLOW] To: {to_email}")
        return True


def send_otp_email(to_email: str, otp_code: str):
    """Send ultra-premium HTML 6-digit OTP email with branding, security notices and timestamp."""
    from datetime import datetime
    formatted_time = datetime.now().strftime("%b %d, %Y • %I:%M %p IST")
    subject = f"🔐 {otp_code} is your SKIPD Security Verification Code"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SKIPD Security OTP</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 30px 15px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
              
              <!-- 🟢 Header Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%); padding: 32px 28px; text-align: center;">
                  <div style="font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 4px;">
                    SKIPD<span style="color: #6ee7b7;">.</span>
                  </div>
                  <div style="font-size: 11px; font-weight: 700; color: #a7f3d0; text-transform: uppercase; letter-spacing: 2px;">
                    Official Account Security Verification
                  </div>
                </td>
              </tr>

              <!-- 📄 Email Body -->
              <tr>
                <td style="padding: 32px 28px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #111827;">
                    Security Verification Code 👋
                  </h3>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                    You recently requested a security code to sign in or verify your account on <strong>SKIPD Commerce</strong>. Use the 6-digit code below to proceed:
                  </p>

                  <!-- 🔢 6-DIGIT OTP BOX -->
                  <div style="background-color: #ecfdf5; border: 2px dashed #10b981; border-radius: 20px; padding: 24px 16px; text-align: center; margin: 24px 0;">
                    <div style="font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                      Your One-Time Password (OTP)
                    </div>
                    <div style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #065f46; font-family: 'Courier New', Courier, monospace; line-height: 1;">
                      {otp_code}
                    </div>
                  </div>

                  <!-- ⏱️ Expiration & Security Warnings -->
                  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 14px; padding: 14px 16px; margin-bottom: 24px;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #92400e; display: flex; items-center;">
                      ⏱️ Valid for 60 Seconds (1 Minute)
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #b45309; line-height: 1.5;">
                      This code expires at <strong>{formatted_time}</strong>. Please do not close your browser tab.
                    </p>
                  </div>

                  <div style="border-top: 1px solid #f3f4f6; pt: 20px; margin-top: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #374151;">
                      🔒 Security Tip:
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                      Never share this code with anyone. SKIPD Commerce employees will never call or message asking for your password or OTP. If you did not initiate this request, please change your password immediately.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- ⚓ Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 28px; border-top: 1px solid #f3f4f6; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #6b7280;">
                    © 2026 SKIPD Commerce Inc. • 256-Bit Encrypted Commerce Portal
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                    Sent to {to_email} • Request Time: {formatted_time}
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    return send_email_notification(to_email, subject, html_content)


def send_order_confirmation_email(
    to_email: str,
    order_number: str,
    total_amount: float,
    customer_name: str,
    order_items: list = None,
    shipping_address: dict = None,
    payment_method: str = "Online Payment / UPI"
):
    """Send Rich Order Confirmation Email with product details and live tracking CTA."""
    subject = f"🎉 Order Confirmed! #{order_number} - SKIPD Commerce"
    
    # Build Items Rows
    items_html = ""
    if order_items and len(order_items) > 0:
        for item in order_items:
            title = item.get("title", "Product Item")
            qty = item.get("quantity", 1)
            price = item.get("unit_price", 0.0)
            subtotal = item.get("total_price", price * qty)
            items_html += f"""
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; font-weight: bold; color: #1f2937; font-size: 13px;">{title}</td>
                <td style="padding: 12px; text-align: center; color: #4b5563; font-size: 13px;">x{qty}</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; color: #111827; font-size: 13px;">₹{subtotal:,.2f}</td>
            </tr>
            """
    else:
        items_html = """
        <tr>
            <td colspan="3" style="padding: 12px; color: #6b7280; text-align: center; font-size: 13px;">Items verified &amp; packed</td>
        </tr>
        """

    # Build Shipping Address HTML
    address_str = "Customer Address"
    if shipping_address:
        line1 = shipping_address.get("address_line1", "")
        city = shipping_address.get("city", "")
        state = shipping_address.get("state", "")
        pincode = shipping_address.get("pincode", "")
        phone = shipping_address.get("phone", "")
        address_str = f"{line1}, {city}, {state} - {pincode} (Mob: {phone})"

    awb_demo = f"SKP{order_number.replace('SKIPD-', '')}IN"
    # Use production domain if available, else fallback
    site_domain = os.getenv("SITE_URL", "https://ecom.botmartz.com")
    tracking_url = f"{site_domain}/track-order?awb={awb_demo}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }}
        .header {{ background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%); color: #ffffff; padding: 32px 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }}
        .header p {{ margin: 8px 0 0 0; color: #a7f3d0; font-size: 13px; font-weight: 600; }}
        .body {{ padding: 28px 24px; }}
        .greeting {{ font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 12px; }}
        .summary-box {{ background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 16px; padding: 18px; margin: 20px 0; text-align: center; }}
        .order-num {{ font-size: 20px; font-weight: 900; color: #047857; letter-spacing: 1px; }}
        .amount {{ font-size: 26px; font-weight: 900; color: #065f46; margin: 6px 0; }}
        .table-container {{ border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; margin: 20px 0; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th {{ background: #f9fafb; padding: 12px; font-size: 11px; text-transform: uppercase; color: #6b7280; text-align: left; font-weight: 800; border-bottom: 1px solid #e5e7eb; }}
        .addr-box {{ background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; font-size: 12px; color: #374151; margin-bottom: 24px; }}
        .btn {{ display: inline-block; background: #059669; color: #ffffff !important; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 14px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(5,150,105,0.3); }}
        .footer {{ background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 20px; text-align: center; font-size: 11px; color: #6b7280; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🎉 ORDER CONFIRMED!</h1>
          <p>Thank you for shopping with SKIPD Commerce</p>
        </div>

        <div class="body">
          <div class="greeting">Hello {customer_name}, 👋</div>
          <p style="font-size: 13px; color: #4b5563; margin: 0 0 16px 0;">
            Great news! Your order <strong>#{order_number}</strong> has been successfully placed and is now being packed for express shipping.
          </p>

          <div class="summary-box">
            <div class="order-num">#{order_number}</div>
            <div class="amount">₹{total_amount:,.2f}</div>
            <div style="font-size: 12px; color: #047857; font-weight: bold;">Payment Status: PAID ({payment_method})</div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                {items_html}
              </tbody>
            </table>
          </div>

          <div class="addr-box">
            <strong style="color: #111827; display: block; margin-bottom: 4px;">📍 Shipping Address:</strong>
            <span>{customer_name} — {address_str}</span>
          </div>

          <div style="text-align: center; margin: 28px 0 12px 0;">
            <a href="{tracking_url}" class="btn">📦 Track Live Order Shipment &rsaquo;</a>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 4px 0; font-weight: bold; color: #374151;">SKIPD Commerce Pvt Ltd • BlueDart &amp; Shiprocket Express Logistics</p>
          <p style="margin: 0;">24x7 Customer Support | AWB: {awb_demo}</p>
        </div>
      </div>
    </body>
    </html>
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


def send_welcome_account_email(to_email: str, full_name: str, raw_password: str):
    """Send Welcome Email containing login credentials & welcome message upon registration."""
    subject = f"🎉 Welcome to SKIPD Commerce, {full_name}! Your Account Credentials"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }}
        .header {{ background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 36px 30px; text-align: center; color: #ffffff; }}
        .header h1 {{ margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }}
        .header p {{ margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; font-weight: 500; }}
        .body {{ padding: 32px 30px; color: #1f2937; line-height: 1.6; }}
        .greeting {{ font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 12px; }}
        .creds-box {{ background: #f0fdf4; border: 2px solid #a7f3d0; border-radius: 18px; padding: 20px; margin: 24px 0; }}
        .cred-item {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; }}
        .cred-item:last-child {{ border-bottom: none; }}
        .label {{ font-weight: 700; color: #047857; }}
        .val {{ font-weight: 800; color: #0f172a; font-family: monospace; font-size: 15px; }}
        .btn {{ display: inline-block; background: #059669; color: #ffffff !important; font-weight: 900; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 14px; text-align: center; margin: 16px 0; box-shadow: 0 4px 12px rgba(5,150,105,0.25); }}
        .footer {{ background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 20px 30px; text-align: center; font-size: 12px; color: #6b7280; }}
        .badge {{ background: #d1fae5; color: #065f46; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; margin-bottom: 12px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="badge">Official Welcome</div>
          <h1>🎉 Welcome to SKIPD!</h1>
          <p>Your Commerce Account is Activated &amp; Ready to Shop</p>
        </div>

        <div class="body">
          <div class="greeting">Hello {full_name}, 👋</div>
          <p style="font-size: 14px; color: #4b5563; margin-top: 0;">
            Thank you for creating your account with <strong>SKIPD Commerce</strong>! We are thrilled to have you onboard. Below are your official account details and login credentials:
          </p>

          <div class="creds-box">
            <div style="font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #065f46; margin-bottom: 12px;">
              🔑 Your Registered Credentials
            </div>
            <div class="cred-item">
              <span class="label">Registered Name:</span>
              <span class="val" style="font-family: inherit;">{full_name}</span>
            </div>
            <div class="cred-item">
              <span class="label">Email Address:</span>
              <span class="val">{to_email}</span>
            </div>
            <div class="cred-item">
              <span class="label">Account Password:</span>
              <span class="val" style="color: #dc2626;">{raw_password}</span>
            </div>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #92400e;">
            🔒 <strong>Security Tip:</strong> Please keep your login details safe and never share your password with anyone. You can update your password anytime from your Account Settings.
          </div>

          <div style="text-align: center;">
            <a href="{os.getenv('SITE_URL', 'https://ecom.botmartz.com')}/auth/login" class="btn">⚡ Login to Your Account</a>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 6px 0; font-weight: bold; color: #374151;">SKIPD Commerce India • 24x7 Customer Helpdesk</p>
          <p style="margin: 0;">If you did not initiate this registration, please contact support@skipd.in immediately.</p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email_notification(to_email, subject, html_content)

