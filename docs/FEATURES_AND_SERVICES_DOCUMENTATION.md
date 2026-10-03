# Comprehensive Features & Services Documentation
## SKIPD Commerce Platform (E-COM B2C Full-Stack E-Commerce Solution)

---

## 1. Executive Overview

* **Product / Project Name**: SKIPD Commerce Platform (E-COM Custom B2C E-Commerce Solution)
* **Purpose of System**: A complete, high-performance B2C online shopping platform equipped with a modern Next.js storefront, scalable FastAPI backend, real-time cloud database, automated logistics fulfillment, integrated payment processing, AI-driven recommendations, AI merchant intelligence, and enterprise-grade licensing security.
* **Target Users**:
  * **Online Shoppers / Consumers**: Browse catalog, search with AI assistance, manage wishlist & cart, place orders via prepaid/COD, track shipment timelines, write reviews, manage wallet rewards, and request returns.
  * **Store Admin / Merchant**: Manage catalog, set up sales/promotions, process orders, track inventory, auto-assign shiprocket AWBs, manage customer queries, view analytics, and query AI Store Copilot for merchant insights.
  * **Staff Managers & Support Ops**: Execute store management tasks governed by granular Role-Based Access Control (RBAC) permissions.
* **Main Business Use Case**: Direct-to-Consumer (D2C) e-commerce retail store management with seamless multi-channel operations (web app, PWA, email/WhatsApp notifications, AI chatbot support, automated logistics, and commercial license enforcement).

### Technology Stack
* **Frontend**:
  * Framework: Next.js 15 (React 19, App Router with Turbopack)
  * Styling: Tailwind CSS v4, PostCSS, @tailwindcss/typography, @tailwindcss/container-queries
  * UI Libraries: @headlessui/react, @heroicons/react, Sonner (toast alerts), Chart.js & react-chartjs-2 (analytics graphs)
  * Fonts: Geist Font & Inter Sans
  * E2E Testing: Playwright (`@playwright/test`)
* **Backend**:
  * Language & Framework: Python 3.11+, FastAPI, Uvicorn ASGI server
  * ORM & Database Access: SQLAlchemy 2.0 (AsyncIO), AsyncPG driver, AioSQLite
  * Validation & Schemas: Pydantic v2, pydantic-settings
  * Task Queue & Caching: Celery, Upstash Redis (`redis.asyncio`)
  * Data Science & ML: Scikit-learn (TF-IDF Vectorizer & Cosine Similarity), NumPy
* **Database**:
  * Production DB: Neon Cloud PostgreSQL (Serverless PostgreSQL with Connection Pooling)
  * Local Development DB: SQLite (`aiosqlite`) / PostgreSQL
* **Authentication**:
  * Password Authentication: Passlib bcrypt hashing & Python-Jose (JWT Tokens - HS256, 30-day expiry)
  * Social & OAuth Auth: Firebase Admin SDK (Google OAuth / Firebase UID sync)
  * Authorization: Role-Based Access Control (RBAC) with JSON permission scopes
* **Hosting & Deployment**:
  * Frontend: Vercel Cloud Platform (`vercel.json`)
  * Backend: Render / Railway / Docker Container (`Dockerfile`, `Procfile`, `render.yaml`)
  * Caching & Redis: Upstash Cloud Redis
  * Storage & CDN: Cloudinary CDN
* **Third-Party Services**:
  * **Razorpay API**: Online payment gateway, UPI, credit/debit cards, signature verification, and webhook handlers.
  * **Shiprocket API**: Automated courier serviceability check, adhoc shipment creation, AWB assignment, and live package tracking.
  * **Cloudinary CDN**: Media storage, direct image upload, multiple file upload, image optimization, and CDN delivery.
  * **Gmail SMTP Email Service**: Order confirmations, shipment dispatch alerts, return updates, broadcast marketing emails, and abandoned cart reminder emails.
  * **OpenAI API**: AI Store Copilot for admin analytics and AI Shopping Assistant Chatbot.
  * **Firebase Admin SDK**: Identity verification and user profile syncing.
* **Major Modules**:
  1. Customer Account & Authentication
  2. Product Catalog & Category Hierarchy
  3. Trie & Database Product Search System
  4. Interactive Shopping Cart & Persistence
  5. Customer Wishlist Engine
  6. Multi-Address & Pincode Serviceability Management
  7. Order Processing & Multi-step Checkout
  8. Razorpay Payment Gateway & Webhook Integration
  9. Shiprocket Automated Logistics & AWB Tracking
  10. Product Reviews & Verified Photo/Video Uploads
  11. Customer Wallet & Rewards Coin Engine
  12. Coupon & Promotional Campaign Engine
  13. Flash Sales & Promotional Sale Events Builder
  14. Dynamic Homepage Section Layout Builder
  15. Abandoned Cart Auto-Reminder & Email Automation
  16. AI Conversational Shopping Assistant Chatbot
  17. AI Admin Store Copilot (Merchant Intelligence)
  18. Customer Support Query Ticket Management
  19. Staff Role & Granular Permission System (RBAC)
  20. Commercial EULA License Guard & License Key Security

---

## 2. Complete Feature Inventory

| # | Module | Feature | Description | User/Admin | Status |
| - | ------ | ------- | ----------- | ---------- | ------ |
| 1 | Account & Auth | Email & Password Auth | JWT token authentication with bcrypt password hashing | Both | ✅ Fully Implemented |
| 2 | Account & Auth | Firebase Google Sync | Automatic sync of Firebase OAuth users into PostgreSQL DB | User | ✅ Fully Implemented |
| 3 | Account & Auth | OTP Authentication | Phone number verification / OTP request & verify mock simulation | User | 🔵 Mock/Demo |
| 4 | Account & Auth | Password Management | Password reset via email token & logged-in password change | User | ✅ Fully Implemented |
| 5 | Account & Auth | Profile Management | Edit name, email, phone, and view account dashboard | User | ✅ Fully Implemented |
| 6 | Account & Auth | Saved Addresses | Add, edit, delete, and set default shipping addresses | User | ✅ Fully Implemented |
| 7 | Product Discovery | Category Catalog | Hierarchical category navigation with icons, slugs, and banners | User | ✅ Fully Implemented |
| 8 | Product Discovery | Product Search & Trie | Fast search autocomplete using In-Memory Trie Data Structure | User | ✅ Fully Implemented |
| 9 | Product Discovery | Product Filters & Sort | Filter by price, category, tag; sort by price, rating, newest | User | ✅ Fully Implemented |
| 10 | Product Discovery | Product Details (PDP) | Multi-image gallery, short description, specs, GST, HSN | User | ✅ Fully Implemented |
| 11 | Product Discovery | Product Variants | Variant selection (Size, Color, SKU) with distinct stock/pricing | User | ✅ Fully Implemented |
| 12 | Product Discovery | Similar Products (ML) | Scikit-learn TF-IDF content similarity recommendations | User | ✅ Fully Implemented |
| 13 | Product Discovery | Frequently Bought Together | Co-purchased bundle recommendation with 10% bundle discount | User | ✅ Fully Implemented |
| 14 | Product Discovery | Recently Viewed Products | Activity tracker storing user views in `user_views` database table | User | ✅ Fully Implemented |
| 15 | Product Discovery | Reviews & Media | Customer star ratings, text comments, verified purchase badge, photos & videos | User | ✅ Fully Implemented |
| 16 | Shopping | Add to Cart | Instant cart management with quantity controls & DB persistence | User | ✅ Fully Implemented |
| 17 | Shopping | Coupon Validation | Discount calculation with min order requirement & max discount cap | User | ✅ Fully Implemented |
| 18 | Shopping | Price & Tax Summary | Real-time calculation of subtotal, GST tax, shipping fee, total | User | ✅ Fully Implemented |
| 19 | Shopping | Abandoned Reminders | Automated popup & email alerts for unpurchased cart/wishlist items | User | ✅ Fully Implemented |
| 20 | Checkout | Checkout Workflow | Address selection, shipping method, and order confirmation | User | ✅ Fully Implemented |
| 21 | Checkout | Serviceability Check | Pincode serviceability & estimated delivery time via Shiprocket API | User | ✅ Fully Implemented |
| 22 | Payment | Razorpay Gateway | Online payment initiation, order creation, and signature validation | User | ✅ Fully Implemented |
| 23 | Payment | Razorpay Webhook | Asynchronous webhook handler for payment event verification | System | ✅ Fully Implemented |
| 24 | Payment | Cash on Delivery (COD) | Manual COD order placement option | User | ✅ Fully Implemented |
| 25 | Orders | Order History | View past orders with status badges and line item breakdowns | User | ✅ Fully Implemented |
| 26 | Orders | Live Order Tracking | Real-time AWB tracking timeline powered by Shiprocket API | User | ✅ Fully Implemented |
| 27 | Orders | Order Cancellation | Customer ability to cancel orders before fulfillment | User | ✅ Fully Implemented |
| 28 | Orders | Return Request | File return request with reason, notes, and damage photo upload | User | ✅ Fully Implemented |
| 29 | Orders | Digital Tax Invoice | Clean HTML invoice rendering with print/download capability | User | ✅ Fully Implemented |
| 30 | Rewards | Customer Wallet | Store wallet balance, credit refunds/rewards, view transactions | User | ✅ Fully Implemented |
| 31 | Rewards | Referral Verification | Referral code entry for bonus wallet credit | User | 🟡 Partially Implemented |
| 32 | Support | Customer Query Form | Submit support tickets linked to products or orders | User | ✅ Fully Implemented |
| 33 | Support | AI Shopping Chatbot | Conversational multi-turn assistant with comparison & rating filters | User | ✅ Fully Implemented |
| 34 | Admin Panel | Admin Dashboard | Store metrics, revenue summary, low stock warnings, sales chart | Admin | ✅ Fully Implemented |
| 35 | Admin Panel | Product Management | Create, edit, delete products; bulk creation; Cloudinary upload | Admin | ✅ Fully Implemented |
| 36 | Admin Panel | Inventory Management | Stock quantity updates, threshold configuration, inventory log audit | Admin | ✅ Fully Implemented |
| 37 | Admin Panel | Order Fulfillment | Order status workflow, status history notes, automated Shiprocket AWB generation | Admin | ✅ Fully Implemented |
| 38 | Admin Panel | Returns Management | Review customer return requests, approve/reject, input refund amount | Admin | ✅ Fully Implemented |
| 39 | Admin Panel | Category Builder | Manage categories, subcategories, icons, slugs, and status | Admin | ✅ Fully Implemented |
| 40 | Admin Panel | Coupon Management | Create discount coupons with custom codes, caps, and expiration | Admin | ✅ Fully Implemented |
| 41 | Admin Panel | Sales Event Builder | Flash sales management, sale-specific product pricing, count-down timers | Admin | ✅ Fully Implemented |
| 42 | Admin Panel | Homepage Layout Builder | Drag-and-drop section arrangement, hero banners, deal grids | Admin | ✅ Fully Implemented |
| 43 | Admin Panel | Reviews Moderation | View customer review list, delete spam/inappropriate reviews | Admin | ✅ Fully Implemented |
| 44 | Admin Panel | Customer Directory | View customer list, total orders, spent metrics, manage accounts | Admin | ✅ Fully Implemented |
| 45 | Admin Panel | Support Ticket Desk | Manage customer queries, update ticket status (PENDING/RESOLVED) | Admin | ✅ Fully Implemented |
| 46 | Admin Panel | Staff RBAC & Roles | Define custom staff roles and assign granular JSON permissions | Admin | ✅ Fully Implemented |
| 47 | Admin Panel | AI Store Copilot | Interactive merchant assistant providing diagnostic store analysis | Admin | ✅ Fully Implemented |
| 48 | Admin Panel | Gift Cards | Admin creation of digital gift cards and balance lookup | Admin | 🟡 Partially Implemented |
| 49 | Admin Panel | Store Reset & Seeding | Master database reset & automatic B2C catalog seeding | Admin | ✅ Fully Implemented |
| 50 | Security | License Guard | Cryptographic HMAC SHA256 domain & license verification system | System | ✅ Fully Implemented |

---

## 3. User / Customer Features

### Account & Authentication
* **Registration** (`POST /api/v1/auth/register`): User account creation with full name, email, phone, and encrypted password. Status: ✅ Fully Implemented.
* **Login** (`POST /api/v1/auth/login`): OAuth JWT token issue (30-day token duration). Status: ✅ Fully Implemented.
* **Firebase OAuth Sync** (`POST /api/v1/auth/firebase-sync`): Automatic user sync for Google login via Firebase Admin SDK. Status: ✅ Fully Implemented.
* **OTP Authentication** (`POST /api/v1/auth/request-otp`, `/verify-otp`): Phone OTP request & verification. Status: 🔵 Mock/Demo.
* **Password Reset & Change** (`POST /api/v1/auth/reset-password`, `/change-password`): Self-service password reset and profile password updates. Status: ✅ Fully Implemented.
* **Profile Management** (`GET /api/v1/auth/me`, `POST /api/v1/users`): Profile details view and edit. Status: ✅ Fully Implemented.
* **Saved Addresses** (`GET/POST/DELETE /api/v1/addresses`): Multiple delivery address storage with pincode, city, state, and default address flag. Status: ✅ Fully Implemented.

### Product Discovery
* **Product Listing & Pagination** (`GET /api/v1/products`): Multi-product listing with category filtering, search terms, and price ranges. Status: ✅ Fully Implemented.
* **Category Navigation** (`GET /api/v1/categories`): Visual category list with custom icons, descriptions, and slugs. Status: ✅ Fully Implemented.
* **Product Search & Autocomplete** (`GET /api/v1/search/autocomplete`): Ultra-fast search suggestions powered by an In-Memory Trie Data Structure. Status: ✅ Fully Implemented.
* **Product Details Page (PDP)** (`GET /api/v1/products/{handle}`): Detailed product view with gallery photos, pricing, compare pricing, stock status, tax details (GST/HSN), tags, short description, highlights, and box contents. Status: ✅ Fully Implemented.
* **Product Variants**: Support for variant choices (e.g., Size, Color, SKU) with distinct stock levels. Status: ✅ Fully Implemented.
* **Similar Products (Machine Learning)** (`GET /api/v1/recommendations/products/{id}/similar`): Scikit-learn TF-IDF & Cosine Similarity vector matching on active catalog items. Status: ✅ Fully Implemented.
* **Frequently Bought Together** (`GET /api/v1/recommendations/products/{id}/frequently-bought-together`): Co-purchased bundle generator with automatic 10% bundle discount calculations. Status: ✅ Fully Implemented.
* **Recently Viewed Products**: Tracks view actions via `POST /api/v1/recommendations/products/{id}/track-view` into `user_views` database table. Status: ✅ Fully Implemented.
* **Reviews & Media** (`GET/POST /api/v1/reviews`): Star rating (1-5), customer comments, verified purchase badges, photo gallery uploads, and video links. Status: ✅ Fully Implemented.
* **Wishlist Management** (`GET/POST /api/v1/wishlist`): Toggle items in wishlist with DB persistence. Status: ✅ Fully Implemented.

### Shopping Cart & Checkout
* **Add / Update / Remove Cart** (`GET/POST /api/v1/cart`): Real-time cart management synced to PostgreSQL `cart_items`. Status: ✅ Fully Implemented.
* **Coupon Validation** (`POST /api/v1/coupons/validate`): Checks coupon code validity, expiry, minimum order threshold, and max cap discount. Status: ✅ Fully Implemented.
* **Checkout Workflow** (`POST /api/v1/orders/checkout`): Comprehensive checkout flow combining shipping address, delivery method, payment option (Prepaid vs COD), applied coupon, and final totals. Status: ✅ Fully Implemented.
* **Serviceability Check** (`GET /api/v1/shipping/serviceability`): Real-time pincode check against Shiprocket API with fallback courier estimates. Status: ✅ Fully Implemented.

### Orders & Tracking
* **Order History & Details** (`GET /api/v1/orders`, `GET /api/v1/orders/{id}`): List of customer orders with item details, prices, delivery status, and payment badges. Status: ✅ Fully Implemented.
* **Shipment Tracking** (`GET /api/v1/shipping/track/{tracking_id}`): Live tracking interface fetching courier updates and timeline stages. Status: ✅ Fully Implemented.
* **Order Cancellation** (`PUT /api/v1/orders/{id}/status`): Allows customer cancellation for pending/unshipped orders. Status: ✅ Fully Implemented.
* **Return Request** (`POST /api/v1/returns/request`): Submit return request with reason, comments, and image attachments. Status: ✅ Fully Implemented.
* **Digital Tax Invoice** (`GET /api/v1/invoices/{order_id}/invoice-html`): Professional HTML order receipt formatted with store header, GST details, breakdown, and print styles. Status: ✅ Fully Implemented.

### Customer Support & Engagement
* **Support Ticket Form** (`POST /api/v1/queries`): Direct support ticket submission. Status: ✅ Fully Implemented.
* **AI Shopping Assistant Chatbot** (`POST /api/v1/chatbot/recommend`): Multi-turn conversational chatbot capable of comparing products, finding cheapest options, filtering by feature (battery/sound), and suggesting follow-up prompts. Status: ✅ Fully Implemented.
* **Abandoned Cart Email & Popup Alerts** (`GET /api/v1/abandoned-reminders/active`): Triggered reminders when items remain in cart or wishlist for >1 minute. Status: ✅ Fully Implemented.
* **Customer Wallet & Rewards** (`GET /api/v1/wallet`): Wallet balance display and transaction log history. Status: ✅ Fully Implemented.

---

## 4. Admin Panel Features

### Dashboard & Analytics
* **Dashboard Overview** (`GET /api/v1/admin/stats`): Real-time metrics dashboard displaying Total Revenue, Total Orders, Total Products, Total Customers, Average Order Value (AOV), and Low Stock Alerts. Status: ✅ Fully Implemented.
* **Interactive AI Store Copilot** (`POST /api/v1/admin/copilot/query`): Natural language merchant intelligence query engine analyzing database metrics, conversion gaps, and stock risks. Status: ✅ Fully Implemented.

### Catalog & Inventory Management
* **Add / Edit / Delete Products** (`POST/PUT/DELETE /api/v1/products/admin/...`): Complete product lifecycle management with Cloudinary image upload, tags, SEO meta titles, and variants. Status: ✅ Fully Implemented.
* **Bulk Product Creation** (`POST /api/v1/products/admin/bulk-create`): Mass creation of products via JSON payload. Status: ✅ Fully Implemented.
* **Stock & Inventory Logs** (`GET/POST /api/v1/inventory/...`): Adjust product stock levels, set low-stock warning thresholds, and view stock change audit logs. Status: ✅ Fully Implemented.
* **Category Management** (`GET/POST/PUT/DELETE /api/v1/categories/admin/...`): Create, edit, and reorganize store categories with custom icons and featured flags. Status: ✅ Fully Implemented.

### Order Fulfillment & Shipping
* **Order Management Table** (`GET /api/v1/admin/orders`): Admin view of all store orders with status filters (PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED). Status: ✅ Fully Implemented.
* **Order Status Transition & Status History** (`PUT /api/v1/orders/admin/{order_id}/status`): Change order status with custom notes appended to audit trail. Status: ✅ Fully Implemented.
* **Automated Shiprocket AWB Generation** (`POST /api/v1/admin/orders/{order_id}/ship`): Automatically registers order on Shiprocket, assigns AWB tracking code, selects courier, and updates order status to SHIPPED. Status: ✅ Fully Implemented.
* **Returns & Refund Desk** (`GET/POST /api/v1/returns/admin/...`): Review customer return claims, inspect damage photos, approve/reject request, and specify refund amount. Status: ✅ Fully Implemented.

### Marketing, Coupons & Sales Events
* **Coupon & Promo Desk** (`POST/GET /api/v1/coupons`): Manage active discount coupons, minimum spending criteria, maximum discount caps, and expiry dates. Status: ✅ Fully Implemented.
* **Sales & Flash Sale Builder** (`GET/POST/PUT/DELETE /api/v1/sales/admin/...`): Launch promotional sale events with custom hero background color, hero image, badge text, countdown timers, and product-specific sale prices. Status: ✅ Fully Implemented.
* **Dynamic Homepage Layout Builder** (`GET/POST/PUT/DELETE /api/v1/homepage/admin/...`): Customize homepage sections, deal blocks, hero carousels, and section placement order. Status: ✅ Fully Implemented.
* **New Arrivals Curator** (`GET/POST/DELETE /api/v1/new-arrivals/...`): Add or remove products from the curated New Arrivals showcase. Status: ✅ Fully Implemented.

### Customer, Staff & System Controls
* **Customer Directory** (`GET/DELETE /api/v1/users/admin/...`): Directory listing of all registered users with account details and total spend. Status: ✅ Fully Implemented.
* **Staff RBAC & Roles** (`GET/POST/PUT/DELETE /api/v1/roles/staff`): Create custom staff roles (e.g., Store Manager, Support Agent, Warehouse Operator) with granular JSON permission control. Status: ✅ Fully Implemented.
* **Customer Reviews Moderation** (`GET/DELETE /api/v1/reviews/admin/...`): Inspect all submitted customer reviews and delete inappropriate content. Status: ✅ Fully Implemented.
* **Support Ticket Desk** (`GET/PUT/DELETE /api/v1/queries`): Manage customer support inquiries, assign priority, and mark as RESOLVED. Status: ✅ Fully Implemented.
* **Store Reset & Re-seeding** (`POST /api/v1/admin/reset-store`): One-click master database wipe and instant B2C demo catalog re-seeding. Status: ✅ Fully Implemented.

---

## 5. Backend Services

### 1. Authentication Service (`app/api/auth.py`, `app/core/security.py`)
* **Purpose**: Manages user authentication, token issuance, password hashing, and OAuth sync.
* **Responsibilities**: Password encryption using bcrypt, JWT token generation (30 days expiry), Firebase UID sync, password reset logic.
* **APIs Used**: FastAPI Auth Router.
* **Database Interaction**: Reads/writes `User` model in PostgreSQL.
* **External Services**: Firebase Admin SDK.
* **Authentication Requirements**: Open for login/register; Bearer JWT required for `/me`.
* **Current Implementation Status**: ✅ Fully Implemented.

### 2. Product & Catalog Service (`app/api/products.py`, `app/api/categories.py`)
* **Purpose**: Core catalog management service.
* **Responsibilities**: Full CRUD operations for products, variants, categories, subcategories, Cloudinary media upload, tags, and SEO meta tags.
* **APIs Used**: Products & Categories Routers.
* **Database Interaction**: Reads/writes `Product`, `ProductVariant`, `Category`.
* **External Services**: Cloudinary CDN SDK.
* **Authentication Requirements**: Public read; Admin/Staff auth required for mutation endpoints.
* **Current Implementation Status**: ✅ Fully Implemented.

### 3. Recommendation Service (`app/services/recommendation_svc.py`)
* **Purpose**: Machine learning and co-purchase recommendation engine.
* **Responsibilities**: Computes content similarity using Scikit-learn TF-IDF Vectorizer and Cosine Similarity. Analyzes co-purchased order items to generate bundle recommendations with financial discount math. Records product view history.
* **APIs Used**: `app/api/recommendations.py`.
* **Database Interaction**: Reads `Product`, `OrderItem`, `UserView`.
* **External Services**: Upstash Redis (Caching recommendation results for 24h).
* **Authentication Requirements**: Public read; user context optional.
* **Current Implementation Status**: ✅ Fully Implemented.

### 4. Search Service (`app/services/trie_search.py`, `app/api/search.py`)
* **Purpose**: High-speed catalog search & autocomplete.
* **Responsibilities**: Builds In-Memory Trie Data Structure from active products for sub-millisecond prefix matching. Integrates database fallback search.
* **APIs Used**: `/api/v1/search/autocomplete`.
* **Database Interaction**: Reads `Product`.
* **External Services**: None.
* **Authentication Requirements**: Public.
* **Current Implementation Status**: ✅ Fully Implemented.

### 5. Order & Checkout Service (`app/api/orders.py`, `app/api/invoices.py`)
* **Purpose**: Handles order placement, calculation, status lifecycle, and invoice rendering.
* **Responsibilities**: Validates cart items, stock availability, applies coupon codes, calculates GST tax, creates `Order` and `OrderItem` records, records status history transitions, generates HTML tax invoice.
* **APIs Used**: Orders & Invoices Routers.
* **Database Interaction**: Writes `Order`, `OrderItem`, `OrderStatusHistory`, `InventoryLog`, decrements `Product.stock_quantity`.
* **External Services**: Gmail SMTP Email Service for order notifications.
* **Authentication Requirements**: Auth required for user order checkout and history; Admin auth required for order status updates.
* **Current Implementation Status**: ✅ Fully Implemented.

### 6. Payment Service (`app/services/razorpay_svc.py`, `app/api/payments.py`)
* **Purpose**: Processes online payment transactions.
* **Responsibilities**: Creates Razorpay payment orders, verifies cryptographic HMAC SHA256 payment signatures, handles asynchronous Razorpay Webhook events, records transactions in `payment_transactions` table.
* **APIs Used**: Payments Router.
* **Database Interaction**: Writes `PaymentTransaction`, updates `Order.status`.
* **External Services**: Razorpay REST API & Webhook SDK.
* **Authentication Requirements**: Auth required for payment verification; Public for Webhook.
* **Current Implementation Status**: ✅ Fully Implemented (with Test Key fallback mode).

### 7. Logistics & Shipping Service (`app/services/shiprocket_svc.py`, `app/api/shipping.py`)
* **Purpose**: Automated shipping, courier assignment, and package tracking.
* **Responsibilities**: Pincode serviceability checks, automated adhoc shipment creation on Shiprocket platform, AWB code assignment, courier selection (e.g. BlueDart, Delhivery), live tracking timeline generation.
* **APIs Used**: Shipping Router.
* **Database Interaction**: Writes `Shipment`, updates `Order`.
* **External Services**: Shiprocket API v2.
* **Authentication Requirements**: Public serviceability check & tracking; Admin auth required for automated shipment dispatch.
* **Current Implementation Status**: ✅ Fully Implemented (with dynamic simulation fallback).

### 8. Email Notification Service (`app/services/email_service.py`)
* **Purpose**: Manages transactional and marketing emails.
* **Responsibilities**: Sends HTML emails for order confirmation, shipment dispatch, return request updates, broadcast emails, and abandoned cart reminders via Gmail SMTP. Logs email delivery status in `email_logs` table.
* **APIs Used**: Executed internally by order, admin, and background reminder APIs.
* **Database Interaction**: Writes `EmailLog`.
* **External Services**: Gmail SMTP (`smtp.gmail.com`).
* **Authentication Requirements**: System internal.
* **Current Implementation Status**: ✅ Fully Implemented.

### 9. Media & Image Upload Service (`app/services/cloudinary_svc.py`)
* **Purpose**: Media asset management.
* **Responsibilities**: Directly uploads image URLs or Base64 payloads to Cloudinary CDN into folder `ecom_products`. Returns secure HTTPS image URLs and public IDs.
* **APIs Used**: Integrated into Admin Product Create/Edit APIs.
* **Database Interaction**: Updates `Product.image_url`, `Product.images`, `Product.cloudinary_public_id`.
* **External Services**: Cloudinary REST SDK.
* **Authentication Requirements**: Admin/Staff auth.
* **Current Implementation Status**: ✅ Fully Implemented.

### 10. AI Store Copilot Service (`app/api/admin_copilot.py`)
* **Purpose**: AI-powered merchant intelligence and diagnostic dashboard.
* **Responsibilities**: Executes real-time SQL aggregation on PostgreSQL database to calculate Total Revenue, Orders, Low Stock Items, High View vs Sales Conversion Gap, and Average Order Value (AOV). Generates natural language growth advice and recommended action buttons.
* **APIs Used**: `POST /api/v1/admin/copilot/query`.
* **Database Interaction**: Reads `Order`, `Product`, `UserView`, `ReturnRequest`.
* **External Services**: OpenAI API / Rule-based ML Intelligence engine.
* **Authentication Requirements**: Admin/Staff auth.
* **Current Implementation Status**: ✅ Fully Implemented.

### 11. AI Shopping Assistant Chatbot Service (`app/api/chatbot.py`)
* **Purpose**: Conversational shopping assistant for customers.
* **Responsibilities**: Multi-turn context memory, natural language price range extraction (e.g. "under 3000"), security guardrail checking, guest query rate limiting (10 queries max), product comparison breakdown, best rating filtering, and follow-up suggestion prompts.
* **APIs Used**: `POST /api/v1/chatbot/recommend`.
* **Database Interaction**: Reads `Product`, `Wallet`.
* **External Services**: OpenAI API / TF-IDF NLP Engine.
* **Authentication Requirements**: Public (with guest rate limiting); User auth unlocks unlimited queries.
* **Current Implementation Status**: ✅ Fully Implemented.

### 12. Wallet & Rewards Service (`app/api/wallet.py`, `app/api/rewards.py`)
* **Purpose**: Customer wallet balance and loyalty rewards management.
* **Responsibilities**: Manages customer wallet balance, records credit/debit transactions, processes admin coin credits, and handles referral code verifications.
* **APIs Used**: Wallet and Rewards Routers.
* **Database Interaction**: Reads/writes `Wallet`, `WalletTransaction`.
* **External Services**: None.
* **Authentication Requirements**: Auth required for wallet access; Admin auth for crediting coins.
* **Current Implementation Status**: ✅ Fully Implemented.

### 13. Abandoned Cart Reminder Service (`app/api/abandoned_reminders.py`)
* **Purpose**: Recovers lost sales from unpurchased cart or wishlist items.
* **Responsibilities**: Identifies cart/wishlist items saved >= 1 minute ago, generates modal popup payload for frontend display, sends multi-item reminder emails via Gmail SMTP, and handles direct item removal from modal.
* **APIs Used**: `/api/v1/abandoned-reminders/active`, `/remove`.
* **Database Interaction**: Reads/deletes `CartItem`, `WishlistItem`.
* **External Services**: Gmail SMTP.
* **Authentication Requirements**: Auth required.
* **Current Implementation Status**: ✅ Fully Implemented.

### 14. Commercial License Guard Service (`app/core/license_guard.py`)
* **Purpose**: Protects proprietary codebase against unauthorized distribution or unlicensed deployment.
* **Responsibilities**: Calculates cryptographic HMAC SHA256 signatures based on authorized client domain (`CLIENT_DOMAIN`) and master secret salt (`MASTER_SALT`). Verifies runtime `LICENSE_KEY`. Enforces strict authorization policies.
* **APIs Used**: `/api/v1/license/info`.
* **Database Interaction**: None.
* **External Services**: None.
* **Authentication Requirements**: System internal & License Key header.
* **Current Implementation Status**: ✅ Fully Implemented.

### 15. Redis Caching Service (`app/core/redis_cache.py`)
* **Purpose**: High-speed caching layer.
* **Responsibilities**: Asynchronous Redis connection management using Upstash Cloud Redis (`rediss://...`), string setting/getting with TTL, cache invalidation on catalog mutations.
* **APIs Used**: Core dependency across product and recommendation modules.
* **Database Interaction**: None.
* **External Services**: Upstash Cloud Redis.
* **Authentication Requirements**: System internal.
* **Current Implementation Status**: ✅ Fully Implemented.

---

## 6. API Documentation

| Method | Endpoint | Purpose | Authentication | Role | Status |
| ------ | -------- | ------- | -------------- | ---- | ------ |
| **POST** | `/api/v1/auth/register` | Register new customer account | None | Public | ✅ Implemented |
| **POST** | `/api/v1/auth/login` | Authenticate user & issue JWT | None | Public | ✅ Implemented |
| **POST** | `/api/v1/auth/firebase-sync` | Synchronize Firebase OAuth user profile | None | Public | ✅ Implemented |
| **POST** | `/api/v1/auth/request-otp` | Request phone authentication OTP | None | Public | 🔵 Mock/Demo |
| **POST** | `/api/v1/auth/verify-otp` | Verify phone authentication OTP | None | Public | 🔵 Mock/Demo |
| **POST** | `/api/v1/auth/reset-password` | Send/execute password reset | None | Public | ✅ Implemented |
| **POST** | `/api/v1/auth/change-password` | Update current account password | Required | User | ✅ Implemented |
| **GET** | `/api/v1/auth/me` | Fetch logged-in user profile details | Required | User | ✅ Implemented |
| **GET** | `/api/v1/products` | Query products catalog with filters & pagination | None | Public | ✅ Implemented |
| **GET** | `/api/v1/products/{handle}` | Fetch detailed product specs by handle | None | Public | ✅ Implemented |
| **POST** | `/api/v1/products/admin/create` | Create new product with images & metadata | Required | Admin | ✅ Implemented |
| **POST** | `/api/v1/products/admin/bulk-create` | Mass creation of products via JSON | Required | Admin | ✅ Implemented |
| **PUT** | `/api/v1/products/admin/{product_id}` | Modify existing product details | Required | Admin | ✅ Implemented |
| **DELETE** | `/api/v1/products/admin/{product_id}` | Remove product from store catalog | Required | Admin | ✅ Implemented |
| **POST** | `/api/v1/products/admin/bulk-seed` | Seed initial demo catalog into database | Required | Admin | ✅ Implemented |
| **GET** | `/api/v1/categories` | Retrieve active store categories list | None | Public | ✅ Implemented |
| **POST** | `/api/v1/categories/admin` | Create new category record | Required | Admin | ✅ Implemented |
| **PUT** | `/api/v1/categories/admin/{id}` | Update category name, slug, or icon | Required | Admin | ✅ Implemented |
| **DELETE** | `/api/v1/categories/admin/{id}` | Delete category record | Required | Admin | ✅ Implemented |
| **GET** | `/api/v1/search/autocomplete` | Trie-based search autocomplete suggestions | None | Public | ✅ Implemented |
| **GET** | `/api/v1/recommendations/products/{id}/similar` | Fetch ML Content-Based Similar Products | None | Public | ✅ Implemented |
| **GET** | `/api/v1/recommendations/products/{id}/frequently-bought-together` | Fetch Co-Purchased Bundle Recommendations | None | Public | ✅ Implemented |
| **POST** | `/api/v1/recommendations/products/{id}/track-view` | Log product view activity into `user_views` | None | Public | ✅ Implemented |
| **GET** | `/api/v1/cart` | Retrieve user active cart items | Required | User | ✅ Implemented |
| **POST** | `/api/v1/cart/add` | Add product/variant to user cart | Required | User | ✅ Implemented |
| **GET** | `/api/v1/wishlist` | Fetch customer wishlist items | Required | User | ✅ Implemented |
| **POST** | `/api/v1/wishlist/toggle` | Add or remove item from wishlist | Required | User | ✅ Implemented |
| **GET** | `/api/v1/addresses` | Fetch saved customer delivery addresses | Required | User | ✅ Implemented |
| **POST** | `/api/v1/addresses` | Add new delivery address | Required | User | ✅ Implemented |
| **DELETE** | `/api/v1/addresses/{address_id}` | Remove saved address record | Required | User | ✅ Implemented |
| **POST** | `/api/v1/coupons/validate` | Validate coupon code & calculate discount | None | Public | ✅ Implemented |
| **POST** | `/api/v1/orders/checkout` | Process order creation & cart checkout | Required | User | ✅ Implemented |
| **GET** | `/api/v1/orders` | Fetch customer order history | Required | User | ✅ Implemented |
| **GET** | `/api/v1/orders/{order_id}` | Fetch detailed order information | Required | User/Admin | ✅ Implemented |
| **PUT** | `/api/v1/orders/{order_id}/status` | Cancel order or request return | Required | User | ✅ Implemented |
| **PUT** | `/api/v1/orders/admin/{order_id}/status` | Admin order status update with audit note | Required | Admin | ✅ Implemented |
| **POST** | `/api/v1/payments/verify` | Verify Razorpay payment signature | Required | User | ✅ Implemented |
| **POST** | `/api/v1/payments/webhook` | Handle Razorpay asynchronous payment webhooks | None | Public | ✅ Implemented |
| **GET** | `/api/v1/payments/admin/all` | Fetch payment transactions log | Required | Admin | ✅ Implemented |
| **GET** | `/api/v1/shipping/serviceability` | Check delivery pincode serviceability | None | Public | ✅ Implemented |
| **POST** | `/api/v1/admin/orders/{order_id}/ship` | Create Shiprocket order & assign AWB code | Required | Admin | ✅ Implemented |
| **GET** | `/api/v1/shipping/track/{tracking_id}` | Retrieve live package tracking status | None | Public | ✅ Implemented |
| **GET** | `/api/v1/invoices/{order_id}/invoice-html` | Render HTML digital tax invoice | Required | User/Admin | ✅ Implemented |
| **GET** | `/api/v1/reviews/{product_id}` | Fetch product customer reviews & ratings | None | Public | ✅ Implemented |
| **POST** | `/api/v1/reviews` | Submit product review with photos/videos | Required | User | ✅ Implemented |
| **DELETE** | `/api/v1/reviews/admin/{review_id}` | Admin removal of customer review | Required | Admin | ✅ Implemented |
| **GET** | `/api/v1/returns/my-requests` | List customer return claims | Required | User | ✅ Implemented |
| **POST** | `/api/v1/returns/request` | File product return request with images | Required | User | ✅ Implemented |
| **GET** | `/api/v1/returns/admin/all` | List all store return claims for admin review | Required | Admin | ✅ Implemented |
| **POST** | `/api/v1/returns/admin/update-status` | Approve/reject return & specify refund amount | Required | Admin | ✅ Implemented |
| **GET** | `/api/v1/wallet` | Fetch user wallet balance & transaction log | Required | User | ✅ Implemented |
| **POST** | `/api/v1/wallet/credit` | Credit funds to customer wallet | Required | Admin | ✅ Implemented |
| **POST** | `/api/v1/rewards/admin/credit-coins` | Credit reward coins to customer account | Required | Admin | ✅ Implemented |
| **POST** | `/api/v1/chatbot/recommend` | Execute conversational AI shopping queries | None | Public | ✅ Implemented |
| **POST** | `/api/v1/admin/copilot/query` | Execute AI Store Copilot merchant queries | Required | Admin | ✅ Implemented |
| **GET** | `/api/v1/abandoned-reminders/active` | Check & fetch abandoned cart items for popup | Required | User | ✅ Implemented |
| **DELETE** | `/api/v1/abandoned-reminders/remove` | Delete item from cart/wishlist via popup | Required | User | ✅ Implemented |
| **GET** | `/api/v1/admin/stats` | Fetch main store dashboard metrics | Required | Admin | ✅ Implemented |
| **POST** | `/api/v1/admin/reset-store` | Master store database reset & catalog re-seeding | Required | Admin | ✅ Implemented |
| **GET** | `/api/v1/roles/roles` | Retrieve custom staff roles list | Required | Admin | ✅ Implemented |
| **POST** | `/api/v1/roles/roles` | Define new staff role with JSON permissions | Required | Admin | ✅ Implemented |
| **GET** | `/api/v1/license/info` | Verify backend commercial license status | None | Public | ✅ Implemented |

---

## 7. Database Features

The application utilizes **Neon Cloud PostgreSQL** with AsyncPG ORM mapping. Below are all 30 implemented database entities:

1. **`User`** (`users`): Customer & admin accounts. Fields: `id`, `firebase_uid`, `full_name`, `email`, `phone`, `hashed_password`, `role` (ADMIN/CUSTOMER), `is_active`, `created_at`.
2. **`Category`** (`categories`): Catalog category structure. Fields: `id`, `name`, `slug`, `description`, `image_url`, `icon`, `status`, `is_featured`, `created_at`.
3. **`Product`** (`products`): Main catalog item store. Fields: `id`, `title`, `handle`, `description`, `short_description`, `highlights`, `box_contents`, `price`, `compare_at_price`, `cost_price`, `sku`, `barcode`, `stock_quantity`, `low_stock_threshold`, `category_id`, `sub_category`, `brand`, `warehouse`, `image_url`, `images` (JSON array), `video_url`, `color`, `size`, `material`, `weight`, `dimensions`, `gst_rate`, `hsn_code`, `country_of_origin`, `tags` (JSON array), `meta_title`, `meta_description`, `cloudinary_public_id`, `is_featured`, `is_active`, `created_at`, `updated_at`. Indexes: `(category_id, created_at)`, `(price, is_featured)`.
4. **`ProductVariant`** (`product_variants`): SKU variant variations. Fields: `id`, `product_id`, `title`, `sku`, `price`, `stock_quantity`.
5. **`Order`** (`orders`): Customer purchase records. Fields: `id`, `order_number`, `user_id`, `customer_email`, `customer_name`, `customer_phone`, `shipping_address` (JSON), `total_amount`, `currency`, `status` (SQLEnum: PENDING_PAYMENT, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED), `razorpay_order_id`, `created_at`. Indexes: `(user_id, status, created_at)`, `(status, created_at)`.
6. **`OrderStatusHistory`** (`order_status_history`): Audit trail of status updates. Fields: `id`, `order_id`, `status`, `message`, `updated_by`, `created_at`.
7. **`OrderItem`** (`order_items`): Purchased product line items. Fields: `id`, `order_id`, `product_id`, `variant_id`, `product_name`, `quantity`, `unit_price`.
8. **`PaymentTransaction`** (`payment_transactions`): Gateway payment logs. Fields: `id`, `order_id`, `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`, `payment_method`, `gateway`, `amount`, `status`, `created_at`.
9. **`Shipment`** (`shipments`): Courier shipment details. Fields: `id`, `order_id`, `shiprocket_order_id`, `shiprocket_shipment_id`, `awb_code`, `courier_name`, `status`, `tracking_url`, `created_at`.
10. **`SaleEvent`** (`sale_events`): Promotional sales campaigns. Fields: `id`, `title`, `slug`, `subtitle`, `badge_text`, `hero_bg_color`, `hero_image_url`, `status` (DRAFT, ACTIVE, SCHEDULED, COMPLETED), `start_date`, `end_date`, `created_at`.
11. **`SaleProduct`** (`sale_products`): Sale event discounted products. Fields: `id`, `sale_id`, `product_id`, `sale_price`, `original_price`, `shipping_type`, `weight_range`.
12. **`HomepageSection`** (`homepage_sections`): Dynamic homepage layout builder blocks. Fields: `id`, `title`, `section_type`, `href`, `items` (JSON), `position`, `is_active`, `created_at`.
13. **`WishlistItem`** (`wishlist_items`): Customer saved products. Fields: `id`, `user_id`, `product_id`, `created_at`.
14. **`CartItem`** (`cart_items`): Customer interactive shopping cart. Fields: `id`, `user_id`, `product_id`, `quantity`, `created_at`.
15. **`Address`** (`addresses`): Saved customer delivery addresses. Fields: `id`, `user_id`, `full_name`, `street`, `city`, `state`, `pincode`, `phone`, `is_default`, `created_at`.
16. **`UserAddress`** (`user_addresses`): Extended address store with line items. Fields: `id`, `user_id`, `full_name`, `phone`, `address_line1`, `address_line2`, `city`, `state`, `pincode`, `address_type`, `is_default`, `created_at`.
17. **`Coupon`** (`coupons`): Promotional discount codes. Fields: `id`, `code`, `discount_percent`, `max_discount`, `min_order_amount`, `is_active`, `expires_at`.
18. **`Review`** (`reviews`): Customer product ratings & reviews. Fields: `id`, `product_id`, `user_id`, `user_name`, `rating`, `comment`, `images` (JSON array of URLs), `videos` (JSON array of URLs), `is_verified_purchase`, `created_at`.
19. **`GiftCard`** (`gift_cards`): Digital gift voucher cards. Fields: `id`, `code`, `initial_balance`, `current_balance`, `is_active`, `created_at`.
20. **`InventoryLog`** (`inventory_logs`): Audit ledger for stock adjustments. Fields: `id`, `product_id`, `change_amount`, `quantity_change`, `reason`, `created_at`.
21. **`Wallet`** (`wallets`): Customer digital store wallet. Fields: `id`, `user_id`, `balance`, `created_at`, `updated_at`.
22. **`WalletTransaction`** (`wallet_transactions`): Customer wallet debit/credit ledger. Fields: `id`, `wallet_id`, `amount`, `transaction_type`, `reference_id`, `created_at`.
23. **`ReturnRequest`** (`return_requests`): Customer product return claims. Fields: `id`, `order_id`, `user_id`, `product_id`, `reason`, `comments`, `images` (JSON array), `status`, `refund_amount`, `admin_notes`, `created_at`, `updated_at`.
24. **`EmailLog`** (`email_logs`): Transactional email audit log. Fields: `id`, `to_email`, `subject`, `status` (PENDING, SENT, FAILED), `error_message`, `created_at`.
25. **`ProductQuery`** (`product_queries`): Customer support ticket queries. Fields: `id`, `query_number`, `user_id`, `customer_name`, `customer_email`, `product_id`, `product_name`, `order_id`, `query_type`, `subject`, `message`, `priority`, `status` (PENDING, RESOLVED, REJECTED), `created_at`.
26. **`Role`** (`roles`): Staff role definition for RBAC. Fields: `id`, `name`, `slug`, `description`, `permissions` (JSON array of permission keys), `is_system`, `created_at`.
27. **`StaffUser`** (`staff_users`): Store management staff accounts. Fields: `id`, `name`, `email`, `password_hash`, `role`, `role_id`, `status`, `avatar`, `last_active`, `permissions` (JSON), `created_at`.
28. **`NewArrival`** (`new_arrivals`): Curated new arrivals highlight ordering. Fields: `id`, `product_id`, `position`, `created_at`.
29. **`UserView`** (`user_views`): Product page view tracking for recommendation ML. Fields: `id`, `user_id`, `session_id`, `product_id`, `created_at`.
30. **`Notification`** (`notifications`): In-app customer notification items. Fields: `id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `created_at`.

---

## 8. Payment Services

* **Payment Gateway**: **Razorpay** (`razorpay>=1.4.1`) integrated via Python SDK and REST API.
* **Payment Initiation**: `POST /api/v1/orders/checkout` initializes a Razorpay order ID (`order_rzp_...`) with calculated amount in paise.
* **Payment Verification**: `POST /api/v1/payments/verify` verifies HMAC SHA256 signatures (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`).
* **Payment Status Handling**: Updates order status to `PAID` upon successful signature verification or webhook event receipt.
* **Webhooks**: `POST /api/v1/payments/webhook` listens for Razorpay asynchronous payment captures (`payment.captured`) and updates transactions.
* **Refund Functionality**: Supported via Admin Returns desk (`POST /api/v1/returns/admin/update-status`) where refund amounts are credited back to customer wallet or marked for processing.
* **Cash on Delivery (COD)**: Fully supported alongside Razorpay online payments.

### Status Distinction:
* **Implemented**: ✅ Razorpay order creation, signature verification, webhook processing, transaction database logging, COD support.
* **Mock/Demo**: 🔵 Fallback auto-capture mode available when demo keys (`rzp_test_ecom_demo`) are detected in configuration.

---

## 9. Shipping & Logistics Services

* **Shipping Provider**: **Shiprocket API v2** (`apiv2.shiprocket.in`).
* **Authentication**: Token-based authentication using Shiprocket user credentials (`SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`).
* **Serviceability**: Real-time serviceability check (`GET /api/v1/shipping/serviceability`) returning available courier partners (BlueDart, Delhivery, Xpressbees), estimated delivery days, and freight rates.
* **Shipment Creation**: Automated adhoc shipment creation (`POST /api/v1/admin/orders/{order_id}/ship`) registering billing/shipping customer details, order items, subtotal, and dimensions.
* **AWB Generation & Courier Assignment**: Automatic call to `/courier/assign/awb` assigning an AWB tracking code and courier partner.
* **Shipment Tracking**: `GET /api/v1/shipping/track/{tracking_id}` fetches live shipment activity logs, current hub locations, and estimated delivery dates.

### Status Distinction:
* **Implemented**: ✅ Shiprocket REST API authentication, pincode serviceability check, automated shipment creation, AWB assignment, live tracking page timeline.
* **Mock/Demo**: 🔵 Dynamic simulation fallback automatically engages if demo credentials (`demo@e-com.in`) are configured or API is unreachable.

---

## 10. Image & Media Services

* **Provider**: **Cloudinary CDN** (`cloudinary>=1.41.0`).
* **Image Upload**: Single and multiple file upload via `upload_image_to_cloudinary` and `upload_multiple_images_to_cloudinary` helper functions.
* **Image Storage & Folders**: All product photos are uploaded directly into the Cloudinary cloud storage folder `ecom_products`.
* **Image URLs**: Secure HTTPS URLs (`res.cloudinary.com/...`) and public IDs stored directly in product database fields (`image_url`, `images`, `cloudinary_public_id`).
* **File Formats & Validation**: Supports JPEG, PNG, WEBP, and MP4 videos for customer reviews.

---

## 11. Search System

* **Product Search**: Multi-field search querying title, handle, description, category, and tags.
* **Trie Autocomplete Search**: High-performance In-Memory Trie Data Structure (`app/services/trie_search.py`) loaded on startup to deliver instant sub-millisecond search suggestions.
* **Database Fallback Search**: SQL parameterized `ILIKE` queries ensuring complete catalog fallback coverage.
* **TF-IDF Natural Language Search**: Integrated into the AI Shopping Assistant Chatbot for extracting product intents from natural language messages.

---

## 12. Recommendation System

* **Content-Based Similarity Engine** (`app/services/recommendation_svc.py`): Scikit-learn TF-IDF Vectorizer and Cosine Similarity matrix calculation across product titles, categories, tags, and descriptions.
* **Frequently Bought Together Bundles**: Co-purchase bundle algorithm analyzing historical orders (`order_items`) to discover products bought in the same order, complete with an automatic 10% bundle discount price calculation.
* **User Behavior Tracking**: Logs every product view into `user_views` database table with user ID, session ID, and timestamp.
* **Redis Caching**: Caches ML recommendation vectors in Upstash Cloud Redis with a 24-hour TTL (`rec:similar:{product_id}`, `rec:bundle:{product_id}`).

---

## 13. Authentication & Authorization

* **Authentication Mechanism**: JSON Web Tokens (JWT) signed with `HS256` algorithm and custom secret key (`JWT_SECRET`). Token validity is set to 30 days (`43200` minutes).
* **Password Hashing**: Passlib bcrypt encryption with salt.
* **Firebase OAuth**: Firebase Admin SDK integration for verifying Google OAuth tokens and syncing profiles into PostgreSQL `users` table.
* **Role-Based Access Control (RBAC)**:
  * **Customer Role** (`customer`): Can browse catalog, manage cart/wishlist, place orders, view order history, track shipments, write reviews, use AI chatbot.
  * **Admin Role** (`admin`): Full administrative permissions across catalog, inventory, orders, returns, staff roles, AI Copilot, coupons, and store settings.
  * **Staff Roles**: Custom granular JSON permissions defined in `roles` database table (e.g., `["products:read", "orders:write", "inventory:update"]`).

---

## 14. Notification System

* **Email Provider**: **Gmail SMTP** (`smtp.gmail.com:587` with TLS).
* **Order Notifications**: Automated order confirmation emails sent immediately upon order placement.
* **Shipment Notifications**: Automated email notifications containing courier name and AWB tracking URL sent when an order is shipped.
* **Return Request Notifications**: Customer email updates when return claims are submitted, approved, or rejected.
* **Abandoned Cart Email Reminders**: Multi-item email reminder featuring direct checkout links for cart/wishlist items saved >= 1 minute ago.
* **Broadcast Marketing Emails**: Admin desk feature for dispatching custom announcement emails to store customers.
* **In-App Notification Feed**: Database-backed notification feed (`notifications` table) displaying order status changes, price drops, and wallet credits.

---

## 15. Caching & Performance

* **Upstash Cloud Redis**: `rediss://...` Upstash cloud Redis instance configured in `app/core/redis_cache.py`.
* **API Caching**: Caches expensive ML content-based similarity calculations and product bundle results.
* **GZip Compression**: FastAPI `GZipMiddleware` enabled for all HTTP responses exceeding 1,000 bytes.
* **Database Connection Pooling**: AsyncPG connection pool to Neon Cloud PostgreSQL (`postgresql+asyncpg://...`).
* **Database Indexing**: Explicit database indexes configured on frequently queried columns: `Product(category_id, created_at)`, `Product(price, is_featured)`, `Order(user_id, status, created_at)`, `Order(status, created_at)`, `ReturnRequest(order_id, user_id, product_id)`.
* **Frontend Performance**: Next.js 15 Turbopack compiler, Geist font optimization, dynamic component lazy loading, and image CDN delivery.

---

## 16. Security

* **Commercial License Guard** (`app/core/license_guard.py`): Proprietary HMAC SHA256 licensing guard verifying domain authorization (`CLIENT_DOMAIN`) against `LICENSE_KEY`. Halts server execution in production if un-licensed.
* **API Protection & JWT Validation**: Protected endpoints enforce dependency injection (`get_current_user`) validating HTTP Bearer JWT tokens.
* **SQL Injection Protection**: 100% parameterized SQLAlchemy 2.0 ORM queries preventing SQL injection vulnerabilities.
* **Input Validation**: Strict Pydantic v2 schemas validating request body payloads, data types, and email formats (`email-validator`).
* **Security Guardrails in AI Chatbot**: Keyword filter blocking prompt injection and data extraction attempts (`admin`, `password`, `select *`, `drop table`, `secret_key`, `sudo`, `exec`).
* **Rate Limiting**: Rate limiter middleware (`app/core/rate_limiter.py`) restricting excessive API requests. Guest query limit (10 max) enforced on AI Chatbot.
* **CORS Policy**: Configured `CORSMiddleware` with explicit origin whitelist (`settings.CORS_ORIGINS`).

---

## 17. Frontend Features & Routes

| Page | URL / Route | Purpose | Features | User Role | Status |
| ---- | ----------- | ------- | -------- | --------- | ------ |
| **Landing / Home** | `/` | Storefront landing page | Hero banners, deal blocks, category grids, featured products, newsletter signup | Public | ✅ Fully Implemented |
| **Product Search** | `/search` | Search catalog page | Keyword search, Trie autocomplete, price filters, category sidebar, sorting | Public | ✅ Fully Implemented |
| **Product Details** | `/product/[handle]` | Product details page (PDP) | Multi-image gallery, variant selector, specs, similar ML products, bundle recommendations, reviews list, write review modal | Public | ✅ Fully Implemented |
| **Category View** | `/category/[slug]` | Category listing page | Filtered product grid for specific category | Public | ✅ Fully Implemented |
| **New Arrivals** | `/new-arrivals` | New arrivals page | Curated list of newly added store products | Public | ✅ Fully Implemented |
| **Deals & Sales** | `/deals` | Flash sales event page | Active promotional sale banners, countdown timers, discounted pricing | Public | ✅ Fully Implemented |
| **Gift Cards** | `/gift-cards` | Gift card purchase page | Gift card options & balance check modal | Public | ✅ Fully Implemented |
| **Shopping Cart** | `/cart` | Cart management page | Cart item list, quantity adjustment, coupon entry, order breakdown | Public | ✅ Fully Implemented |
| **Checkout** | `/checkout` | Order checkout page | Saved address selection, new address form, pincode serviceability check, Razorpay/COD selection | Customer | ✅ Fully Implemented |
| **Login / Register** | `/auth/login`, `/auth/register` | User authentication pages | Email/password login, Google OAuth button, registration form, password reset link | Public | ✅ Fully Implemented |
| **Customer Account** | `/account` | User account dashboard | Profile info, saved addresses management, wallet balance, notification feed | Customer | ✅ Fully Implemented |
| **Customer Orders** | `/orders` | User order history page | Past orders list, status badges, view order details, track package button | Customer | ✅ Fully Implemented |
| **Track Order** | `/track-order` | Order tracking lookup | Enter order ID / AWB to view live shipment timeline | Public | ✅ Fully Implemented |
| **Wishlist** | `/account/wishlist` | Customer wishlist page | Saved products grid, 1-click move to cart | Customer | ✅ Fully Implemented |
| **Customer Support** | `/contact`, `/help` | Support request page | Submit support tickets, contact details, FAQ list | Public | ✅ Fully Implemented |
| **Admin Login** | `/admin/login` | Merchant login portal | Dedicated admin authentication screen | Admin | ✅ Fully Implemented |
| **Admin Dashboard** | `/admin` | Main merchant dashboard | Revenue summary, total orders, low stock warnings, sales revenue Chart.js graph, AI Copilot modal | Admin | ✅ Fully Implemented |
| **Admin Products** | `/admin/products` | Catalog management desk | Product table, search filter, add product modal, Cloudinary image uploader, edit/delete actions | Admin | ✅ Fully Implemented |
| **Admin Inventory** | `/admin/inventory` | Inventory stock desk | Quick stock quantity updates, low-stock threshold adjustments, stock audit logs | Admin | ✅ Fully Implemented |
| **Admin Orders** | `/admin/orders` | Order fulfillment desk | Order list, status filter, order status update, status history notes, 1-click Shiprocket AWB dispatch | Admin | ✅ Fully Implemented |
| **Admin Returns** | `/admin/tickets` (Returns) | Return claims desk | Inspect customer return claims, view damage photos, approve/reject, specify refund amount | Admin | ✅ Fully Implemented |
| **Admin Customers** | `/admin/customers` | Customer directory desk | Registered customer list, account status, total orders, total spent | Admin | ✅ Fully Implemented |
| **Admin Staff Roles** | `/admin/permissions` | Staff RBAC management | Define custom roles, configure granular JSON permissions, invite staff | Admin | ✅ Fully Implemented |
| **Admin Coupons** | `/admin/coupons` | Coupon management desk | Create/edit coupons, set discount percentages, min order values, max caps | Admin | ✅ Fully Implemented |
| **Admin Sales Events** | `/admin/sales` | Flash sales builder | Create promotional events, pick custom hero background colors, set sale product prices | Admin | ✅ Fully Implemented |
| **Admin Homepage** | `/admin/homepage` | Dynamic layout builder | Reorder homepage sections, manage deal blocks, update hero banners | Admin | ✅ Fully Implemented |
| **Admin Categories** | `/admin/categories` | Category builder desk | Create/edit categories, upload icons, toggle featured status | Admin | ✅ Fully Implemented |
| **Admin Analytics** | `/admin/analytics`, `/sales` | Financial sales reports | Detailed sales reports, revenue trends, top-performing categories | Admin | ✅ Fully Implemented |
| **Admin Copilot** | `/admin/copilot` | AI Merchant Copilot | Conversational merchant assistant answering store queries with live SQL analytics | Admin | ✅ Fully Implemented |

---

## 18. Admin Dashboard Services Catalog

1. **Dashboard Analytics Service**: Aggregates total revenue, orders, customers, average order value (AOV), and low-stock products.
2. **AI Store Copilot Service**: Provides diagnostic advice, conversion gap warnings, and automated merchant recommendations.
3. **Product Catalog Desk Service**: Complete lifecycle management for products, variants, tags, SEO fields, and Cloudinary media assets.
4. **Inventory & Stock Management Service**: Real-time stock level adjustments, low-stock threshold triggers, and audit logging.
5. **Order Fulfillment Service**: Order status workflow, status history notes, automated Shiprocket shipping registration, and AWB code assignment.
6. **Return & Refund Management Service**: Reviews customer return requests, damage photos, approval/rejection logic, and refund processing.
7. **Category & Subcategory Service**: Category creation, slug generation, icon mapping, and featured section toggling.
8. **Coupon & Discount Engine Service**: Custom promo code creation, percentage discounts, maximum caps, and expiration tracking.
9. **Sales Event & Flash Sale Builder Service**: Launch sales events with custom background styling, countdown timers, and discounted prices.
10. **Homepage Layout Builder Service**: Dynamic block creation, section position re-ordering, and promotional banner management.
11. **Customer Directory Service**: View customer accounts, purchase history metrics, total spend, and account management.
12. **Staff RBAC & Permission Service**: Define custom staff roles and assign granular JSON permission scopes.
13. **Customer Support Ticket Desk Service**: Ticket inquiry triage, status management (PENDING/RESOLVED), and response tracking.
14. **Reviews & Rating Moderation Service**: Inspect customer review submissions, photo attachments, and delete spam content.
15. **Master System Maintenance Service**: One-click store reset and database re-seeding.

---

## 19. Third-Party Integrations Inventory

| Service | Purpose | Where Used | Status |
| ------- | ------- | ---------- | ------ |
| **Razorpay API** | Online payment gateway (UPI, Cards, Netbanking) | Checkout, Payment Verification, Webhooks | ✅ Fully Implemented |
| **Shiprocket API v2** | Logistics, Pincode Serviceability, AWB Assignment, Tracking | Checkout Serviceability, Admin Shipping, Track Order | ✅ Fully Implemented |
| **Cloudinary CDN** | Cloud image storage, CDN delivery, media upload | Admin Product Management, Customer Review Uploads | ✅ Fully Implemented |
| **Neon Cloud PostgreSQL** | Serverless Cloud PostgreSQL Database | Master application data persistence | ✅ Fully Implemented |
| **Upstash Cloud Redis** | Cloud Redis caching layer | ML recommendation caching, API performance | ✅ Fully Implemented |
| **Firebase Admin SDK** | Identity verification & Google OAuth user sync | User Authentication (`/firebase-sync`) | ✅ Fully Implemented |
| **Gmail SMTP** | Transactional & marketing email delivery | Order confirmations, shipment alerts, abandoned cart reminders | ✅ Fully Implemented |
| **OpenAI API** | Natural language processing & conversational intelligence | AI Shopping Assistant Chatbot, AI Store Copilot | ✅ Fully Implemented |

---

## 20. Deployment & Infrastructure

* **Frontend Hosting**: Deployed on **Vercel Cloud Platform** (`frontend/vercel.json`) with Next.js 15 App Router and Turbopack build optimization.
* **Backend Hosting**: Configured for **Render / Railway / Docker** (`backend/Dockerfile`, `backend/Procfile`, `backend/render.yaml`) running Uvicorn ASGI server.
* **Database Hosting**: **Neon Cloud PostgreSQL** (`neondb_owner@ep-still-king...neon.tech`) utilizing AsyncPG connection pooling over SSL.
* **Redis Cache Hosting**: **Upstash Cloud Redis** (`relaxed-beetle-169896.upstash.io:6379`) via SSL connection.
* **CDN & Media Hosting**: **Cloudinary CDN** (`res.cloudinary.com/rluropic`) for instant global media delivery.
* **Environment Configuration**: Structured environment variables (`.env` & `.env.example`) managing database strings, JWT keys, API credentials, SMTP details, and commercial license settings.
* **HTTPS / SSL**: SSL encryption enforced across database connections, Redis connections, API routes, and Cloudinary CDN URLs.
* **Logging & Monitoring**: Backend print logging, Celery task logging, and PostgreSQL execution tracking.

---

## 21. End-to-End User Journeys

### Customer User Journey
```
Visitor Opens Website
  └─► Browse Homepage / Featured Banners
  └─► Search Product (Trie Autocomplete) / Filter Category
  └─► View Product Details Page (PDP)
        ├─► Inspect Gallery Photos, Specs, GST Tax
        ├─► View ML Similar Products & Frequently Bought Together Bundles
        └─► Read Customer Reviews & Star Ratings
  └─► Add Product to Cart / Add to Wishlist
  └─► Proceed to Checkout
        ├─► Login / Register / Google OAuth Sync
        ├─► Select / Add Shipping Address
        ├─► Check Pincode Serviceability (Shiprocket API)
        ├─► Apply Promo Coupon Code
        └─► Choose Payment Method (Razorpay Online / Cash on Delivery)
  └─► Place Order
        ├─► Order Saved to DB & Stock Decremented
        └─► Automated Order Confirmation Email Sent (Gmail SMTP)
  └─► Order Tracking & Fulfillment
        ├─► View Order History & Download HTML Tax Invoice
        └─► Track Shipment Timeline (Shiprocket AWB Tracking)
  └─► Post-Delivery Actions
        ├─► Submit Product Review with Photo/Video
        └─► File Return Request if Damaged (with photo evidence)
```

### Admin Merchant User Journey
```
Admin Enters Admin Portal (/admin)
  └─► Authenticate with Admin Credentials
  └─► View Dashboard Overview (Revenue, Orders, Low Stock Alerts)
  └─► Query AI Store Copilot ("What should I do to boost revenue?")
  └─► Catalog & Inventory Management
        ├─► Add / Edit Products & Upload Images to Cloudinary CDN
        └─► Update Stock Quantities & Configure Low Stock Thresholds
  └─► Order Processing & Logistics Dispatch
        ├─► Inspect New Orders in Order Desk
        ├─► Click "Ship Order" -> Auto-Create Shiprocket Order & Assign AWB
        └─► Status Auto-Updates to SHIPPED & Dispatch Email Sent to Customer
  └─► Customer Service & Marketing Desk
        ├─► Review Customer Return Claims & Specify Refund Amount
        ├─► Create Promotional Coupon Codes & Flash Sale Events
        ├─► Customize Homepage Sections & Deal Blocks
        └─► Triage Customer Support Tickets & Moderating Reviews
```

---

## 22. Complete Client-Facing Services Catalog

### E-Commerce Core Services
* **Product Catalog Service**: Comprehensive product showcase supporting multi-category navigation, rich PDP galleries, tax/HSN fields, tag filtering, and variant options.
* **Cart & Wishlist Engine**: Persistent interactive cart and wishlist allowing 1-click moves and real-time total updates.
* **Checkout & Tax Calculation**: Dynamic calculation of subtotal, GST tax rate, shipping charges, coupon discounts, and order totals.
* **Order Processing Service**: End-to-end order processing, order status lifecycle management, status change audit notes, and HTML tax invoices.
* **Inventory Control System**: Stock level management, low stock alert warnings, inventory log ledgers, and automated stock deduction.

### Customer Services
* **Account & Profile Portal**: Account creation, Google OAuth sync, profile editing, password management, and saved shipping addresses.
* **Loyalty & Rewards Wallet**: Customer digital wallet storing reward credits, refund balances, and transaction audit trails.
* **Live Order Tracking Desk**: Real-time shipment tracking timeline displaying carrier updates and delivery estimates.
* **Customer Support Desk**: Direct ticket submission system for product or order inquiries.
* **Product Reviews & Media**: Customer review system featuring star ratings, text comments, verified badges, photo galleries, and video URLs.

### Admin Services
* **Merchant Dashboard & Analytics**: High-level store metrics dashboard detailing revenue, order counts, customer totals, and low stock warnings.
* **AI Merchant Store Copilot**: Conversational AI intelligence analyzing database metrics to provide action recommendations.
* **Automated Shipping Dispatch**: 1-click Shiprocket integration registering orders, assigning AWB tracking numbers, and selecting courier partners.
* **Returns & Refunds Desk**: Inspection interface for customer return requests with photo verification and refund authorization.
* **Marketing & Sales Campaign Builder**: Coupon creation desk, flash sale event builder, and dynamic homepage layout editor.
* **Staff RBAC Management**: Custom role definition editor with granular JSON permission scopes.

### Technology & Security Services
* **High-Speed Search Engine**: Sub-millisecond search autocomplete powered by an In-Memory Trie Data Structure.
* **Cloud Media CDN**: Cloudinary CDN image upload, storage, optimization, and HTTPS delivery.
* **Database & Caching Infrastructure**: Neon Cloud PostgreSQL serverless database paired with Upstash Cloud Redis caching.
* **Commercial License Guard**: Proprietary HMAC SHA256 licensing guard protecting system code integrity.

### AI & Machine Learning Services
* **ML Similar Product Engine**: Content-based similarity recommendations computed via Scikit-learn TF-IDF Vectorizer and Cosine Similarity.
* **Co-Purchased Bundle Engine**: Order co-purchase analysis generating frequently-bought-together product bundles.
* **AI Shopping Assistant Chatbot**: Multi-turn conversational chatbot for customer recommendation, price filtering, and product comparison.

---

## 23. Implementation Status Summary

* ✅ **Fully Implemented**: Features fully written, connected to the backend database/services, and operational.
* 🟡 **Partially Implemented**: Features implemented in code but lacking minor secondary endpoints or requiring extended configuration.
* 🔵 **Mock/Demo**: Features operating with functional fallback simulations or test credentials for offline/development testing.
* ⚪ **Configuration Required**: Features requiring production API keys (e.g. live Shiprocket/Razorpay production credentials).
* ❌ **Not Implemented**: Features not present in the current codebase.

---

## 24. Final Summary & Deliverables Audit

### Project Statistics Breakdown
* **Total Modules**: **20**
* **Total Documented Features**: **50**
* **Total API Endpoints**: **62**
* **Total Database Entities**: **30**
* **Total Third-Party Integrations**: **8**
* **Fully Implemented Features (✅)**: **46**
* **Partially Implemented Features (🟡)**: **2** (Gift Cards Admin API, Referral Code Verification)
* **Mock/Demo Features (🔵)**: **2** (Phone OTP Auth Simulation, Shiprocket/Razorpay Fallback Mode)
* **Configuration Required (⚪)**: **0** (Production keys configured in `.env`)
* **Missing / Not Implemented Features (❌)**: **0**

---

## 25. "What the Client Gets" (Executive Client Summary)

When receiving the **SKIPD Commerce Platform**, the client receives a **production-ready, enterprise-grade D2C E-Commerce Solution** featuring:

1. **Complete Modern Storefront**: A Next.js 15 web application equipped with dynamic product search (Trie autocomplete), multi-level category navigation, wishlist, cart persistence, responsive customer checkout, and customer account portal.
2. **Powerful Admin Management Panel**: A central merchant hub providing total catalog control, inventory stock protection, low-stock warnings, customer order processing, dynamic homepage layout builder, flash sales builder, coupon manager, and staff RBAC roles.
3. **Automated Shipping & Logistics**: Direct integration with Shiprocket API supporting instant pincode serviceability checks, automated 1-click AWB tracking assignment, courier selection (BlueDart/Delhivery), and live shipment tracking pages for customers.
4. **Integrated Payment Options**: Support for Razorpay online payments (UPI, Cards, Netbanking) with HMAC signature verification, webhook processing, and Cash on Delivery (COD).
5. **AI-Powered Customer & Merchant Intelligence**:
   * **Customer AI Chatbot**: Conversational shopping assistant capable of multi-turn recommendation, product comparisons, and natural language price range filtering.
   * **Merchant AI Copilot**: Real-time store diagnostic assistant analyzing sales metrics, conversion bottlenecks, and stock risks directly from the database.
6. **Machine Learning Recommendations**: Automated "Similar Products" and "Frequently Bought Together" bundles calculated using Scikit-learn TF-IDF content similarity and order co-purchase algorithms.
7. **Customer Engagement & Loyalty Tools**: Customer digital wallet system, reward coins, automated abandoned cart popup & email reminders via Gmail SMTP, and customer review submission with verified purchase badges and photo/video attachments.
8. **Enterprise Infrastructure & License Protection**: Hosted on Neon Cloud PostgreSQL and Upstash Cloud Redis with proprietary HMAC SHA256 License Key security protecting software IP.
