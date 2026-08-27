import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class OrderStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PAID = "PAID"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    RETURN_REQUESTED = "RETURN_REQUESTED"
    RETURNED = "RETURNED"

class QueryStatus(str, enum.Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class SaleStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"

class ReturnStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"

class EmailNotificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, index=True, nullable=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    icon = Column(Text, nullable=True)
    status = Column(String(50), default="Active")
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    __table_args__ = (
        Index("idx_products_category_created", "category_id", "created_at"),
        Index("idx_products_price_featured", "price", "is_featured"),
    )

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    handle = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    short_description = Column(Text, nullable=True)
    highlights = Column(Text, nullable=True)
    box_contents = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)
    cost_price = Column(Float, nullable=True)
    sku = Column(String(100), unique=True, nullable=True)
    barcode = Column(String(100), nullable=True)
    stock_quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    sub_category = Column(String(100), nullable=True)
    brand = Column(String(100), nullable=True)
    warehouse = Column(String(100), nullable=True)
    image_url = Column(Text, nullable=True)
    images = Column(JSON, nullable=True)
    video_url = Column(Text, nullable=True)
    color = Column(String(50), nullable=True)
    size = Column(String(50), nullable=True)
    material = Column(String(100), nullable=True)
    weight = Column(Float, nullable=True)
    dimensions = Column(String(100), nullable=True)
    gst_rate = Column(Float, nullable=True)
    hsn_code = Column(String(50), nullable=True)
    country_of_origin = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    cloudinary_public_id = Column(String(255), nullable=True)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    @property
    def featured(self):
        return self.is_featured

    @featured.setter
    def featured(self, value):
        self.is_featured = value
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product_rel")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    title = Column(String(100), nullable=False)
    sku = Column(String(100), unique=True, nullable=True)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)

    product = relationship("Product", back_populates="variants")

class Order(Base):
    __tablename__ = "orders"

    __table_args__ = (
        Index("idx_orders_user_status_created", "user_id", "status", "created_at"),
        Index("idx_orders_status_created", "status", "created_at"),
    )

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
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan", order_by="OrderStatusHistory.created_at.asc()")

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)
    updated_by = Column(String(100), default="System")
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="status_history")

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
    product = relationship("Product", back_populates="order_items")

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    razorpay_payment_id = Column(String(100), unique=True, nullable=True)
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    payment_method = Column(String(50), default="Razorpay UPI")
    gateway = Column(String(50), default="Razorpay")
    amount = Column(Float, nullable=False)
    status = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payment")

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    shiprocket_order_id = Column(String(100), nullable=True)
    shiprocket_shipment_id = Column(String(100), nullable=True)
    awb_code = Column(String(100), nullable=True)
    courier_name = Column(String(100), nullable=True)
    status = Column(String(50), default="MANIFEST_GENERATED")
    tracking_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="shipment")

class SaleEvent(Base):
    __tablename__ = "sale_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    subtitle = Column(String(500), nullable=True)
    badge_text = Column(String(100), nullable=True)
    hero_bg_color = Column(String(50), default="#f97316")
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
    shipping_type = Column(String(50), default="Easy Ship")
    weight_range = Column(String(50), default="<500gm")

    sale = relationship("SaleEvent", back_populates="products")
    product = relationship("Product")

class HomepageSection(Base):
    __tablename__ = "homepage_sections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    section_type = Column(String(50), default="DEAL_BLOCK")
    href = Column(String(255), default="/search")
    items = Column(JSON, default=list)
    position = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

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
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    images = Column(JSON, default=list)  # List of customer review photo URLs
    videos = Column(JSON, default=list)  # List of customer review video URLs
    is_verified_purchase = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reviews")
    product_rel = relationship("Product", back_populates="reviews")

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
    change_amount = Column(Integer, default=0)
    quantity_change = Column(Integer, default=0)
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

class ReturnRequest(Base):
    __tablename__ = "return_requests"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True, index=True)
    reason = Column(Text, nullable=False)
    comments = Column(Text, nullable=True)
    images = Column(JSON, default=list)
    status = Column(String(50), default="Pending")
    refund_amount = Column(Float, nullable=True, default=0.0)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order")
    user = relationship("User")
    product = relationship("Product")

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    to_email = Column(String(255), nullable=False, index=True)
    subject = Column(String(255), nullable=False)
    status = Column(SQLEnum(EmailNotificationStatus), default=EmailNotificationStatus.PENDING)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ProductQuery(Base):
    __tablename__ = "product_queries"

    id = Column(Integer, primary_key=True, index=True)
    query_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(150), nullable=False)
    customer_email = Column(String(150), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(255), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    query_type = Column(String(50), default="General Inquiry")
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), default="High")
    status = Column(SQLEnum(QueryStatus), default=QueryStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")
    user = relationship("User")
    order = relationship("Order")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, default=list)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    staff_users = relationship("StaffUser", back_populates="role_rel")

class StaffUser(Base):
    __tablename__ = "staff_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(100), default="Store Manager")
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    status = Column(String(50), default="Active")
    avatar = Column(Text, nullable=True)
    last_active = Column(String(100), default="Just now")
    permissions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    role_rel = relationship("Role", back_populates="staff_users")

class NewArrival(Base):
    __tablename__ = "new_arrivals"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True, nullable=False, index=True)
    position = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")

class UserView(Base):
    __tablename__ = "user_views"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    product = relationship("Product")
    user = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # order, price_drop, wallet, info
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User")





