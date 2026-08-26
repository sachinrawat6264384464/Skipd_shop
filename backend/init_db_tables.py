import asyncio
import os
import sys
from sqlalchemy import text, select, func
from app.core.database import engine, AsyncSessionLocal, Base
from app.models.models import (
    User, UserRole, Category, Product, ProductVariant, Order, OrderItem, OrderStatusHistory,
    PaymentTransaction, Shipment, SaleEvent, SaleProduct, HomepageSection,
    WishlistItem, CartItem, Address, Coupon, Review, GiftCard, InventoryLog,
    Wallet, WalletTransaction, ReturnRequest, EmailLog, Role, StaffUser, NewArrival, UserView
)
from app.core.security import get_password_hash

async def initialize_and_migrate_all_tables():
    """
    MASTER DATABASE MIGRATOR & SCHEMA SYNCHRONIZER
    
    Automatically creates, migrates, and seeds ALL 20+ PostgreSQL database tables
    for any target database connection URL (Neon Cloud DB, Local PostgreSQL, Staging, Production).
    """
    print("=" * 70)
    print("STARTING MASTER POSTGRESQL DATABASE MIGRATION & SCHEMA SYNC")
    print("=" * 70)

    # 1. CREATE ALL TABLES DEFINED IN MODELS.PY
    async with engine.begin() as conn:
        print("\n[STEP 1] Creating all table schemas from SQLAlchemy models...")
        await conn.run_sync(Base.metadata.create_all)
        print("[SUCCESS] All 20+ table schemas created/verified successfully!")

        # 2. DYNAMIC COLUMN ALTERATIONS & MIGRATIONS (IF NOT EXISTS)
        print("\n[STEP 2] Running dynamic column alterations & migrations...")
        
        # Add firebase_uid to users table
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128);"))
        await conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_firebase_uid ON users(firebase_uid);"))
        
        # Add payment_method and gateway to payment_transactions table
        await conn.execute(text("ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'UPI';"))
        await conn.execute(text("ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS gateway VARCHAR(50) DEFAULT 'Razorpay';"))
        
        # Add logistics columns to shipments table
        await conn.execute(text("ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination VARCHAR(255) DEFAULT 'Gwalior, Madhya Pradesh';"))
        await conn.execute(text("ALTER TABLE shipments ADD COLUMN IF NOT EXISTS pin_code VARCHAR(20) DEFAULT '474001';"))
        await conn.execute(text("ALTER TABLE shipments ADD COLUMN IF NOT EXISTS est_delivery_date VARCHAR(100) DEFAULT 'May 27, 2026';"))
        await conn.execute(text("ALTER TABLE shipments ADD COLUMN IF NOT EXISTS current_location VARCHAR(255) DEFAULT 'Bhopal Sort Center';"))
        
        # Ensure user_views table exists for recommendation tracking
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_views (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                session_id VARCHAR(100),
                product_id INTEGER NOT NULL REFERENCES products(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_user_views_product_id ON user_views(product_id);"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_user_views_user_id ON user_views(user_id);"))

        # Add media and verified purchase columns to reviews table
        await conn.execute(text("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;"))
        await conn.execute(text("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;"))
        await conn.execute(text("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT TRUE;"))

        # Ensure notifications table exists
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id),
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                link VARCHAR(255),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications(user_id);"))

        print("[SUCCESS] Schema alterations & column migrations verified!")


    # 3. SEED INITIAL BASELINE DATA (ADMIN USER, DEFAULT CATEGORIES, DEMO DATA)
    async with AsyncSessionLocal() as session:
        print("\n[STEP 3] Verifying and seeding baseline database data...")

        # Seed Default Super Admin
        admin_email = "admin@skipd.in"
        res = await session.execute(select(User).where(User.email == admin_email))
        admin = res.scalars().first()
        if not admin:
            admin_user = User(
                full_name="SKIPD Super Admin",
                email=admin_email,
                phone="+91 98765 43210",
                hashed_password=get_password_hash("AdminPass123!"),
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(admin_user)
            print("[SUCCESS] Default Super Admin created (admin@skipd.in / AdminPass123!)")

        # Seed Default Demo Customer
        cust_email = "customer@skipd.in"
        res = await session.execute(select(User).where(User.email == cust_email))
        cust = res.scalars().first()
        if not cust:
            demo_cust = User(
                full_name="Sachin Rawat",
                email=cust_email,
                phone="+91 62643 84464",
                hashed_password=get_password_hash("CustomerPass123!"),
                role=UserRole.CUSTOMER,
                is_active=True
            )
            session.add(demo_cust)
            print("[SUCCESS] Default Demo Customer created (customer@skipd.in)")

        # Seed Default Categories if empty
        cat_count_res = await session.execute(select(func.count(Category.id)))
        if (cat_count_res.scalar() or 0) == 0:
            cats = [
                Category(name="Electronics", slug="electronics", description="Smartphones, Laptops, Audio & Accessories"),
                Category(name="Fashion & Apparel", slug="fashion", description="Men's and Women's Premium Wear"),
                Category(name="Home & Living", slug="home", description="Furniture, Decor & Kitchen Appliances"),
                Category(name="Footwear", slug="footwear", description="Sneakers, Sports & Casual Shoes"),
                Category(name="Watches", slug="watches", description="Luxury Chronograph & Smartwatches")
            ]
            session.add_all(cats)
            await session.flush()
            print("[SUCCESS] 5 Core Product Categories seeded!")

        # Seed Default Products if empty
        prod_count_res = await session.execute(select(func.count(Product.id)))
        if (prod_count_res.scalar() or 0) == 0:
            prods = [
                Product(id=1, title="Minimalist Graphic Tee", handle="minimalist-graphic-tee", description="100% Organic cotton breathable t-shirt for daily comfort.", price=999.00, compare_at_price=1499.00, category_id=2, is_active=True, stock_quantity=50, images=["https://images.unsplash.com/photo-1521572267360-ee0c2909d518"], tags=["t-shirt", "cotton", "apparel"]),
                Product(id=2, title="OnePlus Nord 6 5G", handle="oneplus-nord-6", description="Snapdragon 8 Gen 2, 120Hz AMOLED display, 100W SuperVOOC fast charging.", price=29999.00, compare_at_price=34999.00, category_id=1, is_active=True, stock_quantity=30, images=["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"], tags=["smartphone", "5g", "oneplus"]),
                Product(id=3, title="Active ANC Wireless Headphones", handle="active-anc-headphones", description="Active Noise Cancellation over-ear headphones with 40-hour battery life.", price=4999.00, compare_at_price=7999.00, category_id=1, is_active=True, stock_quantity=40, images=["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"], tags=["audio", "headphones", "bluetooth"]),
                Product(id=4, title="Nike Air Max Sneakers", handle="nike-air-max-sneakers", description="Lightweight cushioned running shoes with maximum air bounce.", price=6499.00, compare_at_price=8999.00, category_id=4, is_active=True, stock_quantity=25, images=["https://images.unsplash.com/photo-1542291026-7eec264c27ff"], tags=["shoes", "nike", "running"]),
                Product(id=5, title="Pro Chronograph Smartwatch", handle="pro-chronograph-smartwatch", description="Stainless steel Amoled smartwatch with heart rate & SpO2 tracking.", price=8999.00, compare_at_price=12999.00, category_id=5, is_active=True, stock_quantity=20, images=["https://images.unsplash.com/photo-1523275335684-37898b6baf30"], tags=["watch", "smartwatch", "fitness"])
            ]
            session.add_all(prods)
            print("[SUCCESS] 5 Core Products seeded!")

        await session.commit()
        print("\n" + "=" * 70)
        print("SUCCESS: ALL POSTGRESQL TABLES & MIGRATIONS SYNCHRONIZED 100%!")
        print("=" * 70)

if __name__ == "__main__":
    asyncio.run(initialize_and_migrate_all_tables())
