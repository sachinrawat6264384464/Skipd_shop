import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from dotenv import load_dotenv

load_dotenv()

def send_email_notification(to_email: str, subject: str, html_content: str) -> bool:
    """Send HTML Email via Gmail SMTP with auto space sanitization & SSL fallback."""
    smtp_host = os.getenv("SMTP_HOST", os.getenv("EMAIL_HOST", "smtp.gmail.com")).strip()
    smtp_port = int(os.getenv("SMTP_PORT", os.getenv("EMAIL_PORT", 587)))
    smtp_user = os.getenv("SMTP_USER", os.getenv("EMAIL_HOST_USER", "")).strip()
    raw_pwd = os.getenv("SMTP_PASSWORD", os.getenv("EMAIL_HOST_PASSWORD", "")).strip()
    smtp_password = raw_pwd.replace(" ", "")

    if smtp_user and smtp_password:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = Header(subject, "utf-8")
        msg["From"] = f"E-COM Commerce <{smtp_user}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        # Try Port 587 with STARTTLS
        try:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            print(f"✅ [EMAIL SENT SUCCESSFULLY] To: {to_email} | Subject: {subject}")
            return True
        except Exception as e1:
            print(f"⚠️ [SMTP TLS 587 ERROR] {type(e1).__name__}: {e1}. Retrying with SSL Port 465...")
            try:
                with smtplib.SMTP_SSL(smtp_host, 465, timeout=15) as server:
                    server.login(smtp_user, smtp_password)
                    server.send_message(msg)
                print(f"✅ [EMAIL SENT VIA SSL 465] To: {to_email} | Subject: {subject}")
                return True
            except Exception as e2:
                print(f"❌ [SMTP EMAIL FAILED BOTH PORTS] {type(e2).__name__}: {e2}")
                return False
    else:
        print(f"\n[SIMULATED EMAIL FLOW] To: {to_email} | Subject: {subject}")
        return True


def send_otp_email(to_email: str, otp_code: str):
    """Send ultra-premium HTML 6-digit OTP email with branding, security notices and timestamp."""
    from datetime import datetime
    formatted_time = datetime.now().strftime("%b %d, %Y • %I:%M %p IST")
    subject = f"🔐 {otp_code} is your E-COM Security Verification Code"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>E-COM Security OTP</title>
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
                    E-COM<span style="color: #6ee7b7;">.</span>
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
                    You recently requested a security code to sign in or verify your account on <strong>E-COM Commerce</strong>. Use the 6-digit code below to proceed:
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
                      Never share this code with anyone. E-COM Commerce employees will never call or message asking for your password or OTP. If you did not initiate this request, please change your password immediately.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- ⚓ Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 28px; border-top: 1px solid #f3f4f6; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #6b7280;">
                    © 2026 E-COM Commerce Inc. • 256-Bit Encrypted Commerce Portal
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
    subject = f"🎉 Order Confirmed! #{order_number} - E-COM Commerce"
    
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
    if isinstance(shipping_address, dict):
        line1 = shipping_address.get("address_line1", "")
        city = shipping_address.get("city", "")
        state = shipping_address.get("state", "")
        pincode = shipping_address.get("pincode", "")
        phone = shipping_address.get("phone", "")
        address_str = f"{line1}, {city}, {state} - {pincode} (Mob: {phone})"
    elif isinstance(shipping_address, str) and shipping_address.strip():
        address_str = shipping_address.strip()

    awb_demo = f"SKP{order_number.replace('E-COM-', '')}IN"
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
          <p>Thank you for shopping with E-COM Commerce</p>
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

          <!-- 📁 SHARED GOOGLE DRIVE ACCESS BOX -->
          <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 16px; padding: 18px; margin: 20px 0; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
              📁 Shared Google Drive Media &amp; Assets Folder
            </div>
            <p style="font-size: 12px; color: #1e40af; margin: 0 0 12px 0;">
              Access official media files, documents &amp; digital assets on Google Drive:
            </p>
            <a href="https://drive.google.com/drive/folders/1Cy1m0r-_4EhjDrBVNzvuMT_KGL48VAdb?usp=sharing" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 900; text-decoration: none; padding: 10px 22px; border-radius: 12px; font-size: 13px;">
              📂 Open Shared Google Drive Folder &rsaquo;
            </a>
          </div>

          <div style="text-align: center; margin: 28px 0 12px 0;">
            <a href="{tracking_url}" class="btn">📦 Track Live Order Shipment &rsaquo;</a>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 4px 0; font-weight: bold; color: #374151;">E-COM Commerce Pvt Ltd • BlueDart &amp; Shiprocket Express Logistics</p>
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
        <div style="text-align: center; margin-top: 16px;">
            <a href="https://drive.google.com/drive/folders/1Cy1m0r-_4EhjDrBVNzvuMT_KGL48VAdb?usp=sharing" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-size: 12px;">
              📁 Open Shared Google Drive Folder &rsaquo;
            </a>
        </div>
    </div>
    """
    return send_email_notification(to_email, subject, html_content)


def send_welcome_account_email(to_email: str, full_name: str, raw_password: str):
    """Send Welcome Email containing login credentials & welcome message upon registration."""
    subject = f"🎉 Welcome to E-COM Commerce, {full_name}! Your Account Credentials"
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
          <h1>🎉 Welcome to E-COM!</h1>
          <p>Your Commerce Account is Activated &amp; Ready to Shop</p>
        </div>

        <div class="body">
          <div class="greeting">Hello {full_name}, 👋</div>
          <p style="font-size: 14px; color: #4b5563; margin-top: 0;">
            Thank you for creating your account with <strong>E-COM Commerce</strong>! We are thrilled to have you onboard. Below are your official account details and login credentials:
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

          <!-- 📁 SHARED GOOGLE DRIVE ACCESS BOX -->
          <div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 16px; padding: 18px; margin: 20px 0; text-align: center;">
            <div style="font-size: 11px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
              📁 Shared Google Drive Media &amp; Assets Folder
            </div>
            <p style="font-size: 12px; color: #1e40af; margin: 0 0 12px 0;">
              Access official media files, documents &amp; digital assets on Google Drive:
            </p>
            <a href="https://drive.google.com/drive/folders/1Cy1m0r-_4EhjDrBVNzvuMT_KGL48VAdb?usp=sharing" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 900; text-decoration: none; padding: 10px 22px; border-radius: 12px; font-size: 13px;">
              📂 Open Shared Google Drive Folder &rsaquo;
            </a>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #92400e;">
            🔒 <strong>Security Tip:</strong> Please keep your login details safe and never share your password with anyone. You can update your password anytime from your Account Settings.
          </div>

          <div style="text-align: center;">
            <a href="{os.getenv('SITE_URL', 'https://ecom.botmartz.com')}/auth/login" class="btn">⚡ Login to Your Account</a>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 6px 0; font-weight: bold; color: #374151;">E-COM Commerce India • 24x7 Customer Helpdesk</p>
          <p style="margin: 0;">If you did not initiate this registration, please contact support@e-com.in immediately.</p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email_notification(to_email, subject, html_content)


def send_abandoned_reminder_email(
    to_email: str,
    customer_name: str = "Valued Customer",
    product_title: str = "Featured Product",
    product_price: float = 0.0,
    image_url: str = "",
    item_type: str = "wishlist",
    product_handle: str = "",
    items_list: list = None
):
    """Send Rich Abandoned Wishlist/Cart Email with single or multi-item support."""
    site_domain = os.getenv("SITE_URL", "https://ecom.botmartz.com")
    is_cart = item_type == "cart"
    
    # Determine item count
    count = len(items_list) if items_list and len(items_list) > 0 else 1
    badge_title = f"🛒 {count} Items Waiting in Your Cart!" if is_cart else f"❤️ {count} Saved Items in Your Wishlist!"
    subject = f"{badge_title} Complete your purchase — E-COM"
    
    # Build HTML for list of products
    products_html = ""
    if items_list and len(items_list) > 0:
        for item in items_list:
            t_title = item.get("title", "Product")
            t_price = float(item.get("price", 0.0))
            t_img = item.get("image") or image_url or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
            t_handle = item.get("handle") or product_handle
            t_url = f"{site_domain}/product/{t_handle}" if t_handle else f"{site_domain}/account/wishlist"
            
            products_html += f"""
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 14px;">
              <img src="{t_img}" alt="{t_title}" style="width: 70px; height: 70px; object-fit: contain; border-radius: 12px; background: #f8fafc; border: 1px solid #f1f5f9;" />
              <div style="flex: 1; min-width: 0;">
                <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{t_title}</h4>
                <div style="font-size: 15px; font-weight: 900; color: #059669;">₹{t_price:,.2f}</div>
              </div>
              <a href="{t_url}" style="background: #ecfdf5; color: #047857; text-decoration: none; font-size: 11px; font-weight: 800; padding: 8px 14px; border-radius: 10px; border: 1px solid #a7f3d0; text-transform: uppercase;">View</a>
            </div>
            """
    else:
        product_url = f"{site_domain}/product/{product_handle}" if product_handle else f"{site_domain}/cart"
        img_src = image_url if image_url else "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
        products_html = f"""
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin: 16px 0; display: flex; align-items: center; gap: 16px;">
          <img src="{img_src}" alt="{product_title}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 12px; background: #f8fafc; border: 1px solid #f1f5f9;" />
          <div style="flex: 1;">
            <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">{product_title}</h4>
            <div style="font-size: 18px; font-weight: 900; color: #059669;">₹{product_price:,.2f}</div>
          </div>
        </div>
        """

    cta_url = f"{site_domain}/cart" if is_cart else f"{site_domain}/account/wishlist"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
        .card {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }}
        .header {{ background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
        .badge {{ background: #10b981; color: #ffffff; font-weight: 800; font-size: 11px; padding: 5px 14px; border-radius: 99px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 10px; }}
        .header h1 {{ margin: 0; font-size: 22px; font-weight: 900; }}
        .body {{ padding: 28px 24px; color: #1e293b; line-height: 1.6; background-color: #fafafa; }}
        .btn {{ display: block; background: #10b981; color: #ffffff !important; font-weight: 900; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 14px; text-align: center; margin: 24px 0 10px 0; box-shadow: 0 4px 12px rgba(16,185,129,0.3); text-transform: uppercase; letter-spacing: 0.5px; }}
        .footer {{ background: #ffffff; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="badge">{badge_title}</div>
          <h1>Don't Miss Out on Your Saved Items 👋</h1>
        </div>
        <div class="body">
          <p style="font-size: 14px; color: #334155; margin-top: 0;">
            Hi <strong>{customer_name}</strong>, we noticed you have <strong>{count} item(s)</strong> saved in your {item_type} over a minute ago. Stock is limited — finish your purchase before items sell out!
          </p>
          
          <div style="margin: 20px 0;">
            {products_html}
          </div>

          <div style="text-align: center;">
            <a href="{cta_url}" class="btn">⚡ View All {count} Saved Items &amp; Checkout &rsaquo;</a>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">E-COM Commerce Inc. • 24x7 Customer Care Support</p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email_notification(to_email, subject, html_content)


def send_weekly_merchant_digest_email(
    admin_email: str,
    weekly_revenue: float,
    weekly_orders: int,
    weekly_customers: int,
    top_products_list: list = None,
    low_stock_count: int = 0
):
    """Send Automated 7-Day Executive Merchant Analytics Email Digest to Admin."""
    subject = f"📊 Weekly Executive Sales Digest (Last 7 Days) — E-COM Commerce"
    site_domain = os.getenv("SITE_URL", "https://ecom.botmartz.com")
    
    top_prods_html = ""
    if top_products_list and len(top_products_list) > 0:
        for item in top_products_list[:4]:
            t_title = item.get("title", "Product Item")
            t_sold = item.get("sold", "1 unit")
            t_price = item.get("price", 0.0)
            top_prods_html += f"""
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: bold; color: #0f172a; font-size: 13px;">{t_title}</td>
                <td style="padding: 10px; text-align: center; color: #059669; font-weight: bold; font-size: 12px;">{t_sold}</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; color: #1e293b; font-size: 13px;">₹{float(t_price):,.2f}</td>
            </tr>
            """
    else:
        top_prods_html = """
        <tr>
            <td colspan="3" style="padding: 12px; color: #64748b; text-align: center; font-size: 13px;">No orders recorded in the last 7 days.</td>
        </tr>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
        .card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }}
        .header {{ background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); padding: 36px 30px; text-align: center; color: #ffffff; }}
        .badge {{ background: #10b981; color: #ffffff; font-weight: 900; font-size: 11px; padding: 4px 14px; border-radius: 99px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 10px; }}
        .header h1 {{ margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }}
        .header p {{ margin: 6px 0 0 0; opacity: 0.9; font-size: 13px; }}
        .body {{ padding: 32px 30px; color: #1e293b; line-height: 1.6; }}
        .stats-grid {{ display: flex; gap: 12px; margin: 24px 0; }}
        .stat-box {{ flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 16px; text-align: center; }}
        .stat-label {{ font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; }}
        .stat-val {{ font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 4px; }}
        .table-box {{ width: 100%; border-collapse: collapse; margin-top: 16px; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }}
        .btn {{ display: inline-block; background: #059669; color: #ffffff !important; font-weight: 900; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 14px; text-align: center; margin: 24px 0 8px 0; box-shadow: 0 4px 14px rgba(5,150,105,0.3); uppercase; letter-spacing: 0.5px; }}
        .footer {{ background: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="badge">7-Day Automated Digest</div>
          <h1>📊 Weekly Store Performance Report</h1>
          <p>Executive Analytics Summary for Store Admin</p>
        </div>

        <div class="body">
          <p style="font-size: 14px; color: #334155; margin-top: 0;">
            Hello Store Manager! 👋 Here is your <strong>7-day automated store performance summary</strong> generated directly from PostgreSQL database metrics:
          </p>

          <!-- 3 Stat Metrics -->
          <table style="width: 100%; margin: 20px 0; border-spacing: 10px;">
            <tr>
              <td style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 16px; text-align: center; width: 33%;">
                <div style="font-size: 10px; font-weight: 800; color: #047857; text-transform: uppercase;">7-Day Revenue</div>
                <div style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 4px;">₹{weekly_revenue:,.2f}</div>
              </td>
              <td style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 16px; text-align: center; width: 33%;">
                <div style="font-size: 10px; font-weight: 800; color: #1d4ed8; text-transform: uppercase;">7-Day Orders</div>
                <div style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 4px;">{weekly_orders}</div>
              </td>
              <td style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 16px; padding: 16px; text-align: center; width: 33%;">
                <div style="font-size: 10px; font-weight: 800; color: #6b21a8; text-transform: uppercase;">New Customers</div>
                <div style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 4px;">{weekly_customers}</div>
              </td>
            </tr>
          </table>

          {f'<div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; font-size: 12px; color: #b45309; font-weight: bold;">⚠️ Inventory Alert: {low_stock_count} items need stock re-ordering.</div>' if low_stock_count > 0 else ''}

          <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 20px 0 8px 0;">🏆 Top Performing Products (7 Days):</h4>
          <table class="table-box">
            <thead style="background: #f8fafc; text-transform: uppercase; font-size: 10px; color: #64748b;">
              <tr>
                <th style="padding: 10px; text-align: left;">Product Name</th>
                <th style="padding: 10px; text-align: center;">Sales Velocity</th>
                <th style="padding: 10px; text-align: right;">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {top_prods_html}
            </tbody>
          </table>

          <div style="text-align: center;">
            <a href="{site_domain}/admin" class="btn">⚡ Open Admin Control Center &rsaquo;</a>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 4px 0; font-weight: bold; color: #334155;">E-COM Commerce Executive Analytics System</p>
          <p style="margin: 0;">Automated 7-day report dispatched to {admin_email}</p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email_notification(admin_email, subject, html_content)



