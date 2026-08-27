from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.core.database import get_db
from app.models.models import Order

router = APIRouter()

@router.get("/{order_id}/invoice-html", response_class=HTMLResponse)
async def get_order_tax_invoice_html(
    order_id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Order).where(Order.id == order_id))
    order = res.scalars().first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items_html = ""
    subtotal = 0.0
    for idx, item in enumerate(order.items or [], 1):
        price = float(item.get("price", 0))
        qty = int(item.get("quantity", 1))
        item_total = price * qty
        subtotal += item_total
        items_html += f"""
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px; font-weight: bold;">{idx}</td>
            <td style="padding: 10px;">{item.get('title', 'Product Item')}</td>
            <td style="padding: 10px; text-align: center;">{qty}</td>
            <td style="padding: 10px; text-align: right;">₹{price:,.2f}</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">₹{item_total:,.2f}</td>
        </tr>
        """

    gst_amount = round(subtotal * 0.18, 2)
    grand_total = float(order.total_amount)
    order_date = order.created_at.strftime("%d %B %Y, %I:%M %p") if order.created_at else datetime.now().strftime("%d %B %Y")

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>GST Tax Invoice #{order.id}</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 20px; color: #111827; }}
            .invoice-box {{ max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
            .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 20px; }}
            .logo {{ font-size: 24px; font-weight: 900; color: #10b981; text-transform: uppercase; tracking-wide: 2px; }}
            .invoice-title {{ font-size: 18px; font-weight: 800; color: #374151; text-align: right; }}
            .details-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; font-size: 13px; }}
            table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }}
            th {{ background-color: #f3f4f6; color: #374151; text-align: left; padding: 10px; font-weight: 700; border-bottom: 2px solid #e5e7eb; }}
            .totals {{ float: right; width: 300px; font-size: 13px; }}
            .totals div {{ display: flex; justify-content: space-between; padding: 6px 0; }}
            .totals .grand-total {{ border-top: 2px solid #10b981; font-size: 16px; font-weight: 900; color: #10b981; padding-top: 10px; }}
            .footer {{ clear: both; text-align: center; margin-top: 40px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; }}
            @media print {{ body {{ background: white; padding: 0; }} .invoice-box {{ border: none; shadow: none; }} .no-print {{ display: none; }} }}
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="no-print" style="text-align: right; margin-bottom: 15px;">
                <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer;">🖨️ Print / Download PDF</button>
            </div>

            <div class="header">
                <div>
                    <div class="logo">E-COM STORE</div>
                    <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">GSTIN: 23AAAAA0000A1Z5 | Regd: Gwalior, MP</div>
                </div>
                <div class="invoice-title">
                    TAX INVOICE
                    <div style="font-size: 12px; color: #6b7280; font-weight: normal;">Invoice #: INV-{order.id:06d}</div>
                    <div style="font-size: 12px; color: #6b7280; font-weight: normal;">Date: {order_date}</div>
                </div>
            </div>

            <div class="details-grid">
                <div>
                    <strong>Billed To / Shipping Address:</strong><br/>
                    <span style="font-weight: 600; color: #111827;">{order.shipping_address.get('full_name', 'Customer')}</span><br/>
                    {order.shipping_address.get('address', 'Gwalior, Madhya Pradesh')}<br/>
                    Phone: {order.shipping_address.get('phone', '+91 6264384464')}<br/>
                    Payment Method: <span style="font-weight: 700; color: #10b981;">{order.payment_method}</span>
                </div>
                <div>
                    <strong>Order Status:</strong> <span style="color: #10b981; font-weight: 800;">{order.status}</span><br/>
                    <strong>Tracking AWB:</strong> {order.tracking_number or 'AWB-ECOM-88391'}<br/>
                    <strong>Carrier:</strong> Delhivery Express / E-COM Logistics<br/>
                    <strong>GST State Code:</strong> 23 (Madhya Pradesh)
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>

            <div class="totals">
                <div><span>Items Subtotal:</span> <span>₹{subtotal:,.2f}</span></div>
                <div><span>CGST (9%):</span> <span>₹{gst_amount/2:,.2f}</span></div>
                <div><span>SGST (9%):</span> <span>₹{gst_amount/2:,.2f}</span></div>
                <div><span>Shipping & Delivery:</span> <span style="color: #10b981; font-weight: bold;">FREE</span></div>
                <div class="grand-total"><span>Total Amount Paid:</span> <span>₹{grand_total:,.2f}</span></div>
            </div>

            <div class="footer">
                Thank you for shopping with E-COM! This is a computer-generated tax invoice and requires no physical signature.<br/>
                For support, contact support@e-com.in or call +91 62643 84464.
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
