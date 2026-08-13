import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"

class OrderStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PAID = "PAID"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    RETURN_REQUESTED = "RETURN_REQUESTED"
    RETURNED = "RETURNED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    handle = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    featured = Column(Boolean, default=False)
    images = Column(JSON, default=list) # List of image URLs
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    title = Column(String(100), nullable=False) # e.g. "Size M / Black"
    sku = Column(String(100), unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=50)

    product = relationship("Product", back_populates="variants")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_email = Column(String(150), nullable=False)
    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    shipping_address = Column(JSON, nullable=False)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING_PAYMENT)
    razorpay_order_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("PaymentTransaction", back_populates="order", uselist=False)
    shipment = relationship("Shipment", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    razorpay_order_id = Column(String(100), nullable=False)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payment")

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    shiprocket_order_id = Column(String(100), nullable=True)
    shiprocket_shipment_id = Column(String(100), nullable=True)
    awb_code = Column(String(100), unique=True, index=True, nullable=False)
    courier_name = Column(String(100), default="BlueDart / Shiprocket")
    status = Column(String(100), default="IN_TRANSIT")
    tracking_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="shipment")


# ─────────────────────────────────────────────
# 🔥 SALE EVENTS
# ─────────────────────────────────────────────
class SaleStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"

class SaleEvent(Base):
    __tablename__ = "sale_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)          # e.g. "Great Freedom Sale"
    slug = Column(String(100), unique=True, index=True, nullable=False)  # e.g. "freedom-sale"
    subtitle = Column(String(500), nullable=True)
    badge_text = Column(String(100), nullable=True)      # e.g. "Live Now"
    hero_bg_color = Column(String(50), default="#f97316")  # orange
    hero_image_url = Column(String(500), nullable=True)
    status = Column(SQLEnum(SaleStatus), default=SaleStatus.DRAFT)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("SaleProduct", back_populates="sale", cascade="all, delete-orphan")

class SaleProduct(Base):
    __tablename__ = "sale_products"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sale_events.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    sale_price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=False)
    shipping_type = Column(String(50), default="Easy Ship")  # Easy Ship / FC
    weight_range = Column(String(50), default="<500gm")

    sale = relationship("SaleEvent", back_populates="products")
    product = relationship("Product")


# ─────────────────────────────────────────────
# 🏠 HOMEPAGE SECTIONS
# ─────────────────────────────────────────────
class HomepageSection(Base):
    __tablename__ = "homepage_sections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    section_type = Column(String(50), default="DEAL_BLOCK")  # DEAL_BLOCK | WIDE_BANNER | SCROLL_CAROUSEL
    href = Column(String(255), default="/search")
    items = Column(JSON, default=list)   # List of {img, label, price, mrp}
    position = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─────────────────────────────────────────────
# 🌟 MODULAR EXTENDED E-COMMERCE MODELS
# ─────────────────────────────────────────────
class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    full_name = Column(String(150), nullable=False)
    street = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=False)
    phone = Column(String(20), nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_percent = Column(Float, nullable=False)
    max_discount = Column(Float, nullable=True)
    min_order_amount = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_name = Column(String(150), default="Customer")
    rating = Column(Integer, nullable=False) # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class GiftCard(Base):
    __tablename__ = "gift_cards"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    initial_balance = Column(Float, nullable=False)
    current_balance = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_change = Column(Integer, nullable=False)
    reason = Column(String(150), default="STOCK_UPDATE")
    created_at = Column(DateTime, default=datetime.utcnow)

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(50), nullable=False)
    reference_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="transactions")

class ReturnStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"

class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(SQLEnum(ReturnStatus), default=ReturnStatus.PENDING)
    refund_amount = Column(Float, nullable=False)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order")
    user = relationship("User")
