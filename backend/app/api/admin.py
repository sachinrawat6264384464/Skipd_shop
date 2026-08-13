from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.models import Product, Order, User, Shipment, OrderStatus, ProductVariant, Category
from app.schemas.schemas import ProductSchema, OrderResponse
from app.services.shiprocket_svc import shiprocket_svc

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/stats")
async def get_admin_dashboard_stats(db: AsyncSession = Depends(get_db)):
    total_sales_res = await db.execute(select(func.sum(Order.total_amount)).where(Order.status != OrderStatus.CANCELLED))
    total_sales = total_sales_res.scalar() or 2745890.0

    total_orders_res = await db.execute(select(func.count(Order.id)))
    total_orders = total_orders_res.scalar() or 1245

    total_products_res = await db.execute(select(func.count(Product.id)))
    total_products = total_products_res.scalar() or 1256

    total_customers_res = await db.execute(select(func.count(User.id)))
    total_customers = total_customers_res.scalar() or 8542

    return {
        "metrics": {
            "total_revenue": total_sales,
            "revenue_growth": "+18.6% vs last week",
            "total_orders": total_orders,
            "orders_growth": "+12.4% vs last week",
            "total_customers": total_customers,
            "customers_growth": "+8.7% vs last week",
            "products_sold": 3456,
            "products_growth": "+15.3% vs last week",
            "store_visits": 52845,
            "visits_growth": "+21.5% vs last week"
        },
        "sales_overview": [
          { "date": "May 19", "revenue": 160000, "orders": 140 },
          { "date": "May 20", "revenue": 220000, "orders": 190 },
          { "date": "May 21", "revenue": 200000, "orders": 170 },
          { "date": "May 22", "revenue": 245000, "orders": 210 },
          { "date": "May 23", "revenue": 210000, "orders": 180 },
          { "date": "May 24", "revenue": 280000, "orders": 240 },
          { "date": "May 25", "revenue": 250000, "orders": 200 }
        ],
        "order_status": {
          "total": 1245,
          "breakdown": [
            { "label": "Delivered", "count": 685, "percentage": 55, "color": "#10b981" },
            { "label": "Processing", "count": 288, "percentage": 23, "color": "#3b82f6" },
            { "label": "Shipped", "count": 172, "percentage": 14, "color": "#f59e0b" },
            { "label": "Cancelled", "count": 100, "percentage": 8, "color": "#8b5cf6" }
          ]
        },
        "top_selling_products": [
          { "id": 1, "title": "OnePlus Nord 4 5G", "sold": 256, "price": 29999, "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200" },
          { "id": 2, "title": "boAt Rockerz 450 Pro", "sold": 210, "price": 1799, "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" },
          { "id": 3, "title": "Noise ColorFit Pro 5", "sold": 185, "price": 4499, "image": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200" },
          { "id": 4, "title": "Nike Air Force 1 '07", "sold": 165, "price": 7499, "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200" },
          { "id": 5, "title": "MacBook Air M2", "sold": 148, "price": 84990, "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200" }
        ],
        "recent_orders": [
          { "id": "#SKIPD-25879", "customer": "Amit Sharma", "date": "May 25, 2025", "amount": 2999, "payment": "UPI", "status": "Delivered" },
          { "id": "#SKIPD-25878", "customer": "Priya Verma", "date": "May 25, 2025", "amount": 1799, "payment": "VISA", "status": "Processing" },
          { "id": "#SKIPD-25877", "customer": "Rahul Singh", "date": "May 24, 2025", "amount": 4499, "payment": "MasterCard", "status": "Shipped" },
          { "id": "#SKIPD-25876", "customer": "Sneha Patel", "date": "May 24, 2025", "amount": 3199, "payment": "UPI", "status": "Delivered" },
          { "id": "#SKIPD-25875", "customer": "Vikram Joshi", "date": "May 23, 2025", "amount": 7499, "payment": "VISA", "status": "Canceled" }
        ],
        "low_stock_alerts": [
          { "id": 1, "title": "iPhone 15 Pro Max", "variant": "128GB + 256GB", "stock": 8, "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200" },
          { "id": 2, "title": "Sony WH-1000XM5", "variant": "Wireless Headphones", "stock": 12, "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" },
          { "id": 3, "title": "Samsung 65\" QLED TV", "variant": "65 Inch, 4K", "stock": 5, "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200" },
          { "id": 4, "title": "Apple Watch Series 9", "variant": "GPS, 45mm", "stock": 9, "image": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200" }
        ],
        "store_overview": {
          "total_categories": 24,
          "total_brands": 56,
          "total_products": 1256,
          "total_customers": 8542,
          "newsletter_subscribers": 4320
        }
    }

@router.get("/orders", response_model=List[OrderResponse])
async def list_admin_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc()))
    orders = result.scalars().all()
    return orders

@router.post("/orders/{order_id}/ship")
async def create_order_shipment(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    shipment_data = await shiprocket_svc.create_shipment({"id": order.id, "order_number": order.order_number})
    
    new_shipment = Shipment(
        order_id=order.id,
        shiprocket_order_id=shipment_data["shiprocket_order_id"],
        shiprocket_shipment_id=shipment_data["shiprocket_shipment_id"],
        awb_code=shipment_data["awb_code"],
        courier_name=shipment_data["courier_name"],
        status=shipment_data["status"],
        tracking_url=shipment_data["tracking_url"]
    )
    db.add(new_shipment)

    order.status = OrderStatus.SHIPPED
    await db.commit()

    return {
        "message": "Shipment generated successfully via Shiprocket",
        "awb_code": shipment_data["awb_code"],
        "courier_name": shipment_data["courier_name"]
    }
