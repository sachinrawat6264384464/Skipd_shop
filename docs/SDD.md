# 📐 Master Software Design Document (SDD)
## Skipd Shop / E-COM Commercial B2C E-Commerce Platform

| Document Control Metadata | Details |
| :--- | :--- |
| **Product / System Name** | Skipd Shop (E-COM Commercial Engine) |
| **Document Type** | Software Design Document (SDD) |
| **Lead Architect & Developer** | Sachin Rawat |
| **Parent Organization** | Botmartz AI Solution Pvt Ltd |
| **License Framework** | Commercial Single-Tenant Proprietary EULA |
| **Document Version** | 2.0.0 (Master Architecture Release) |
| **System Status** | Production-Ready / Enterprise Grade |
| **Target Audience** | Software Architects, Full-Stack Engineers, DevOps Engineers, QA Automation Teams |

---

## 📑 Table of Contents
1. [System Overview & Architectural Philosophy](#1-system-overview--architectural-philosophy)
2. [High-Level System Architecture & Layering](#2-high-level-system-architecture--layering)
3. [Domain Subsystems & Component Design](#3-domain-subsystems--component-design)
   - 3.1 [Authentication, Identity & RBAC Subsystem](#31-authentication-identity--rbac-subsystem)
   - 3.2 [Product Catalog & Inventory Management](#32-product-catalog--inventory-management)
   - 3.3 [Search, Auto-complete & AI Recommendation Engine](#33-search-auto-complete--ai-recommendation-engine)
   - 3.4 [Shopping Cart, Wishlist & Pincode Serviceability](#34-shopping-cart-wishlist--pincode-serviceability)
   - 3.5 [Order Processing Pipeline & Finite State Machine](#35-order-processing-pipeline--finite-state-machine)
   - 3.6 [Payment Gateway & Cryptographic Webhooks](#36-payment-gateway--cryptographic-webhooks)
   - 3.7 [Logistics & Automated Fulfillment (Shiprocket)](#37-logistics--automated-fulfillment-shiprocket)
   - 3.8 [Wallet Ledger, Coupons & Loyalty Engine](#38-wallet-ledger-coupons--loyalty-engine)
   - 3.9 [Returns, Refunds & Customer Support CRM](#39-returns-refunds--customer-support-crm)
   - 3.10 [Transactional Communications & Abandoned Cart Recovery](#310-transactional-communications--abandoned-cart-recovery)
   - 3.11 [AI Shopping Assistant & Admin Copilot](#311-ai-shopping-assistant--admin-copilot)
   - 3.12 [Commercial EULA Licensing & IP Anti-Piracy Engine](#312-commercial-eula-licensing--ip-anti-piracy-engine)
4. [Data Design & Relational Schema Specifications](#4-data-design--relational-schema-specifications)
   - 4.1 [Complete Entity-Relationship Diagram (ERD)](#41-complete-entity-relationship-diagram-erd)
   - 4.2 [Database Table Specifications & Constraints](#42-database-table-specifications--constraints)
   - 4.3 [Caching Data Model & Key Strategies](#43-caching-data-model--key-strategies)
5. [Core Dynamic Process & Sequence Flows](#5-core-dynamic-process--sequence-flows)
   - 5.1 [End-to-End Checkout, Payment & Inventory Deduction](#51-end-to-end-checkout-payment--inventory-deduction)
   - 5.2 [Automated Logistics Booking & AWB Assignment](#52-automated-logistics-booking--awb-assignment)
   - 5.3 [AI Chatbot Contextual Recommendation Resolution](#53-ai-chatbot-contextual-recommendation-resolution)
   - 5.4 [Commercial License Boot Guard & Runtime Enforcement](#54-commercial-license-boot-guard--runtime-enforcement)
6. [API Interface Specifications & Contract Standards](#6-api-interface-specifications--contract-standards)
7. [Security, Governance & Data Integrity Architecture](#7-security-governance--data-integrity-architecture)
8. [Non-Functional Requirements (NFRs) & Performance Budgets](#8-non-functional-requirements-nfrs--performance-budgets)
9. [DevOps, Deployment Topology & Infrastructure](#9-devops-deployment-topology--infrastructure)

---

## 1. System Overview & Architectural Philosophy

### 1.1 Purpose & Mission
**Skipd Shop** is an ultra-fast, commercial Direct-to-Consumer (D2C) e-commerce system built for modern retail brands. It addresses classical e-commerce bottlenecks (slow catalog pagination, inventory overselling, complex returns, disconnected logistics, and rigid search) by unifying:
- A reactive Next.js 15 App Router storefront running on Turbopack and React 19.
- A high-concurrency, asynchronous Python FastAPI ASGI backend.
- A serverless relational cloud database (Neon PostgreSQL with connection pooling).
- Sub-50ms distributed key-value caching (Upstash Redis).
- End-to-end native integrations for Razorpay, Shiprocket, Cloudinary, and AI services.

### 1.2 Core Architectural Principles
1. **Domain-Driven Modular Architecture**: Logic is strictly partitioned by business bounded-contexts (`auth`, `catalog`, `cart`, `orders`, `payments`, `shipping`, `wallet`, `crm`, `ai`, `licensing`).
2. **Asynchronous Non-Blocking I/O**: End-to-end `async`/`await` across all HTTP endpoints, database queries via `asyncpg` / `SQLAlchemy 2.0`, and Redis caching operations.
3. **Idempotency & Data Consistency**: Financial payment webhooks and stock deductions execute within transactional boundaries, eliminating duplicate charges and inventory race conditions.
4. **Sub-second Response Times**: Hybrid static/dynamic page delivery (PPR/SSR) backed by Redis response-caching guarantees `<50ms` API latencies and `<1.5s` LCP page rendering.
5. **Zero-Trust Commercial IP Guard**: Embedded cryptographic HMAC-SHA256 signature verification guarantees single-tenant client domain locking.

---

## 2. High-Level System Architecture & Layering

```mermaid
graph TB
    subgraph Client Tier ["Client Storefront & Admin Layer"]
        Browser["🌐 Consumer Browser / Mobile Web (Next.js 15 PWA)"]
        AdminUI["🛠️ Store Admin & Staff Dashboard (/admin)"]
    end

    subgraph CDN & Edge Layer ["Edge Network & Caching"]
        Cloudflare["⚡ Vercel Edge Network / Cloudflare CDN"]
        MediaCDN["🖼️ Cloudinary Media CDN (Optimized Assets)"]
    end

    subgraph Backend Gateway ["FastAPI ASGI Application Engine (Port 8000)"]
        LicenseGuard["🛡️ HMAC-SHA256 Commercial License Guard"]
        CorsGzip["⚙️ CORS & GZip Compression Middleware"]
        RateLimiter["⏱️ Redis Token-Bucket Rate Limiter"]
        APIRouter["🔀 Master API Router (/api/v1)"]
    end

    subgraph Domain Services ["Decoupled Business Services"]
        AuthSvc["🔐 Identity & RBAC Service"]
        CatalogSvc["🛍️ Product & Variant Catalog"]
        OrderSvc["📦 Order Pipeline & FSM"]
        PaySvc["💳 Payment Verification & Invoices"]
        LogisticsSvc["🚚 Shiprocket Logistics Service"]
        AISvc["🤖 AI Chatbot & Copilot Engine"]
        CommSvc["✉️ SMTP / WhatsApp Notifications"]
    end

    subgraph Data & Persistence Tier ["Storage & Cache Infrastructure"]
        Postgres[(🐘 Neon Serverless Cloud PostgreSQL)]
        Redis[(⚡ Upstash Redis Cache & Sessions)]
    end

    subgraph External Services ["Third-Party Enterprise APIs"]
        RazorpayAPI["💳 Razorpay Payment Gateway"]
        ShiprocketAPI["📦 Shiprocket Logistics Platform"]
        FirebaseSDK["🔥 Firebase Authentication SDK"]
        OpenAIAPI["🧠 OpenAI LLM API"]
    end

    Browser --> Cloudflare
    AdminUI --> Cloudflare
    Cloudflare --> APIRouter
    APIRouter --> LicenseGuard --> CorsGzip --> RateLimiter
    
    RateLimiter --> AuthSvc
    RateLimiter --> CatalogSvc
    RateLimiter --> OrderSvc
    RateLimiter --> PaySvc
    RateLimiter --> LogisticsSvc
    RateLimiter --> AISvc
    RateLimiter --> CommSvc

    CatalogSvc --> MediaCDN
    AuthSvc --> FirebaseSDK
    PaySvc --> RazorpayAPI
    LogisticsSvc --> ShiprocketAPI
    AISvc --> OpenAIAPI

    AuthSvc & CatalogSvc & OrderSvc & PaySvc & LogisticsSvc & AISvc --> Postgres
    CatalogSvc & RateLimiter & AuthSvc --> Redis
```

### Architectural Tiers:
1. **Presentation Tier (Next.js 15 Storefront)**: Server Components (RSC) for dynamic SEO metadata and fast first-contentful paint; Client Components for dynamic cart interactions, address selection, and real-time checkout modals.
2. **Gateway & Security Tier (FastAPI Engine)**: Enforces domain-locked license checks on server boot, validates JWT/Bearer auth tokens, sanitizes requests through Pydantic v2 schemas, and applies GZip compression.
3. **Domain Service Tier**: Independent modular Python packages in `app/api/` and `app/services/` encapsulating distinct business rules.
4. **Data & Cache Tier**: Async connection-pooled PostgreSQL with Neon serverless scaling, complemented by Upstash Cloud Redis for caching search suggestions, session states, and rate-limiting counters.

---

## 3. Domain Subsystems & Component Design

### 3.1 Authentication, Identity & RBAC Subsystem
- **Dual Authentication Vectors**:
  1. *Standard Email & Password*: Passwords hashed with `passlib[bcrypt]` (salt cost = 12).
  2. *Social / Mobile OTP*: Firebase Authentication token verification (`firebase_uid` synced to the relational user record).
- **Session Tokens**: Cryptographically signed JSON Web Tokens (JWT) using `HS256` with 30-day lifetime (`ACCESS_TOKEN_EXPIRE_MINUTES=43200`).
- **Role-Based Access Control (RBAC)**:
  - `UserRole.CUSTOMER`: Can manage personal profile, addresses, orders, wallet, reviews, and wishlist.
  - `UserRole.ADMIN`: Unrestricted access to products, sales, orders, finance, inventory logs, and system metrics.
  - `StaffUser`: Granular JSON permission scopes (e.g., `["products:read", "orders:write", "support:read"]`) linked via `roles` table.

### 3.2 Product Catalog & Inventory Management
- **Catalog Structure**: Multi-level categorization (`Category` -> `Product` -> `ProductVariant`).
- **Variant Model**: SKU-level tracking supporting combinations of color, size, and material, each with distinct pricing and `stock_quantity`.
- **Inventory Ledger**: Dedicated `inventory_logs` table tracking every delta (`quantity_change`, `reason` such as `STOCK_UPDATE`, `ORDER_PLACED`, or `ORDER_CANCELLED`).
- **Media Asset Pipeline**: Integrated Cloudinary CDN client providing automatic image compression, WebP transformation, and thumbnail generation.

### 3.3 Search, Auto-complete & AI Recommendation Engine
- **In-Memory Trie Search (`trie_search.py`)**:
  - In-memory prefix tree indexing all product titles, categories, and tags.
  - Provides sub-10ms auto-complete query suggestions for the search bar.
- **Content-Based ML Recommendation (`recommendation_svc.py`)**:
  - Scikit-learn `TfidfVectorizer` and `cosine_similarity`.
  - Analyzes titles, descriptions, categories, and tags to calculate product similarity vectors.
  - Returns "Frequently Bought Together" and "Customers Also Viewed" clusters.

### 3.4 Shopping Cart, Wishlist & Pincode Serviceability
- **Persistence Strategy**:
  - Authenticated: Server-synced database records (`cart_items`, `wishlist_items`).
  - Guest: LocalStorage client state synced to server immediately upon authentication.
- **Pincode Delivery Estimator**:
  - 6-digit Indian PIN Code validation.
  - Dynamic transit-day calculations based on destination zone (Metro: 2-3 days, Non-Metro: 4-6 days, Remote: 7+ days).

### 3.5 Order Processing Pipeline & Finite State Machine
The order lifecycle strictly transitions through validated states:

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT: User creates order
    PENDING_PAYMENT --> PAID: Razorpay/Stripe success webhook
    PENDING_PAYMENT --> CANCELLED: Payment timeout / User cancellation
    
    PAID --> PROCESSING: Admin / System acknowledges
    PROCESSING --> SHIPPED: Shiprocket AWB generated
    SHIPPED --> DELIVERED: Courier delivery confirmation
    
    DELIVERED --> RETURN_REQUESTED: User submits return request
    RETURN_REQUESTED --> APPROVED: Admin approves return
    RETURN_REQUESTED --> REJECTED: Admin rejects return
    APPROVED --> RETURNED: Warehouse receives goods & refunds
    
    DELIVERED --> [*]
    CANCELLED --> [*]
    RETURNED --> [*]
```

- **Order Audit Trail (`order_status_history`)**: Every transition logs `status`, `message`, `updated_by` (System / Admin / Customer), and `created_at`.
- **Stock Reservation**: Stock quantity is deducted immediately upon payment confirmation (`PAID`), or restored if an order is `CANCELLED`.

### 3.6 Payment Gateway & Cryptographic Webhooks
- **Supported Payment Gateways**: Razorpay (UPI, Credit/Debit Cards, Netbanking, Wallets), Stripe (International Cards), and Cash on Delivery (COD).
- **Cryptographic Signature Verification**:
  $$\text{Expected Signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$
- **Idempotent Webhook Handler**: Validates transaction status against `payment_transactions` table to prevent double-crediting.
- **PDF Invoice Generation (`invoices.py`)**: Automatic generation of compliant GST tax invoices with HSN codes, tax breakdowns, and customer billing details.

### 3.7 Logistics & Automated Fulfillment (Shiprocket)
- **Logistics Integration (`shiprocket_svc.py`)**:
  1. *Authentication*: Automated JWT token exchange with Shiprocket API with refresh cycle.
  2. *Order Ingestion*: Automatically pushes order details, weight, package dimensions, and pickup address to Shiprocket.
  3. *AWB Generation*: Selects optimal courier (Delhivery, BlueDart, Ekart, DTDC) and assigns AWB tracking number.
  4. *Live Tracking Webhook*: Updates order timeline in real-time for customer tracking pages (`/track-order`).

### 3.8 Wallet Ledger, Coupons & Loyalty Engine
- **Customer Digital Wallet (`wallets`, `wallet_transactions`)**:
  - Supports atomic balance debits and credits.
  - Generates audit records for cashback, order payments, refund credits, and promotional rewards.
- **Coupon Engine (`coupon_service.py`)**:
  - Validates percentage discount, max discount caps, minimum order amounts, usage limits, and expiration dates.
  - Enforces single-use or multi-use promo code constraints.

### 3.9 Returns, Refunds & Customer Support CRM
- **Return Lifecycle (`return_requests`)**: Supports image uploads, customer return reasons, admin acceptance/rejection, and automated wallet refund credits.
- **Support Inquiries (`product_queries`)**: Priority-based inquiry ticketing system (`General Inquiry`, `Order Issue`, `Defective Item`) with status tracking.

### 3.10 Transactional Communications & Abandoned Cart Recovery
- **Multi-channel Notifications**:
  - *SMTP / SendGrid Email*: High-converting HTML transactional email templates for Order Confirmation, Shipping Dispatches, Invoices, and Welcome letters.
  - *WhatsApp Business Notifications*: Automated message alerts for order placement and tracking updates.
- **Abandoned Cart Automation (`abandoned_reminders.py`)**:
  - Detects active cart items where the user has been inactive for $>2$ hours.
  - Automatically schedules recovery emails with personalized discount coupon incentives.

### 3.11 AI Shopping Assistant & Admin Copilot
- **Consumer Chatbot (`chatbot.py`)**:
  - Intent recognition parsing conversational queries (e.g., *"Show me black running shoes under ₹2500"*).
  - Regex price-range extraction and TF-IDF catalog ranking.
  - Guardrail filters preventing prompt injection, credential extraction, or toxic inputs.
- **Admin Sales Copilot (`admin_copilot.py`)**:
  - Converts natural language questions into database analytics aggregations (e.g., *"Which category had the highest revenue this month?"*).

### 3.12 Commercial EULA Licensing & IP Anti-Piracy Engine
- **Engine Security (`license_guard.py`)**:
  - On application startup, the engine computes:
    $$\text{Expected License} = \text{HMAC-SHA256}(\text{CLIENT\_DOMAIN}, \text{MASTER\_SALT})[0:24]$$
  - If `ENVIRONMENT == "production"` and `LICENSE_KEY` does not match, the application immediately aborts boot (`sys.exit(1)` or returns 403 Forbidden).
  - Protects intellectual property and ownership rights of **Botmartz AI Solution Pvt Ltd** and **Lead Architect Sachin Rawat**.

---

## 4. Data Design & Relational Schema Specifications

### 4.1 Complete Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ ADDRESSES : owns
    USERS ||--o{ USER_ADDRESSES : maintains
    USERS ||--o{ CART_ITEMS : holds
    USERS ||--o{ WISHLIST_ITEMS : saves
    USERS ||--o{ REVIEWS : writes
    USERS ||--o| WALLETS : owns
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ RETURN_REQUESTS : submits
    USERS ||--o{ PRODUCT_QUERIES : initiates

    CATEGORIES ||--o{ PRODUCTS : categorizes
    PRODUCTS ||--o{ PRODUCT_VARIANTS : has
    PRODUCTS ||--o{ ORDER_ITEMS : ordered_in
    PRODUCTS ||--o{ CART_ITEMS : selected_in
    PRODUCTS ||--o{ WISHLIST_ITEMS : saved_in
    PRODUCTS ||--o{ REVIEWS : reviewed_by
    PRODUCTS ||--o{ INVENTORY_LOGS : tracked_in
    PRODUCTS ||--o| NEW_ARRIVALS : featured_in
    PRODUCTS ||--o{ SALE_PRODUCTS : included_in

    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o| PAYMENT_TRANSACTIONS : settled_by
    ORDERS ||--o| SHIPMENTS : fulfilled_by
    ORDERS ||--o{ ORDER_STATUS_HISTORY : tracks
    ORDERS ||--o{ RETURN_REQUESTS : returns

    WALLETS ||--o{ WALLET_TRANSACTIONS : logs
    SALE_EVENTS ||--o{ SALE_PRODUCTS : contains
    ROLES ||--o{ STAFF_USERS : assigns
```

### 4.2 Database Table Specifications & Constraints

#### 1. Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | Unique user identifier |
| `firebase_uid` | `VARCHAR(128)` | Unique, Indexed, Nullable | Firebase OAuth / Mobile UID sync |
| `full_name` | `VARCHAR(150)` | Not Null | User's full name |
| `email` | `VARCHAR(150)` | Unique, Indexed, Not Null | Primary contact email |
| `phone` | `VARCHAR(20)` | Nullable | Primary contact phone |
| `hashed_password` | `VARCHAR(255)` | Not Null | Bcrypt hashed credential |
| `role` | `ENUM('admin', 'customer')`| Default: `'customer'` | User authorization role |
| `is_active` | `BOOLEAN` | Default: `TRUE` | Soft-delete / account lock flag |
| `created_at` | `DATETIME` | Default: `utcnow()` | Timestamp of creation |

#### 2. Table: `products`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | Unique product identifier |
| `title` | `VARCHAR(255)` | Indexed, Not Null | Product catalog display title |
| `handle` | `VARCHAR(255)` | Unique, Indexed, Not Null | SEO slug for URL routing |
| `description` | `TEXT` | Nullable | Full markdown/HTML description |
| `price` | `FLOAT` | Not Null | Current selling price (INR) |
| `compare_at_price` | `FLOAT` | Nullable | Original strike-through MRP |
| `cost_price` | `FLOAT` | Nullable | Merchant internal cost price |
| `sku` | `VARCHAR(100)` | Unique, Nullable | Master SKU code |
| `stock_quantity` | `INTEGER` | Default: `0` | Available warehouse stock |
| `low_stock_threshold`| `INTEGER` | Default: `10` | Low inventory alert trigger |
| `category_id` | `INTEGER` | FK (`categories.id`), Nullable | Parent category relation |
| `images` | `JSON` | Nullable | Array of Cloudinary image URLs |
| `is_featured` | `BOOLEAN` | Default: `FALSE` | Featured on homepage hero/grid |
| `is_active` | `BOOLEAN` | Default: `TRUE` | Display visibility flag |
| `created_at` | `DATETIME` | Default: `utcnow()` | Catalog ingestion timestamp |
| `updated_at` | `DATETIME` | On Update: `utcnow()` | Last modification timestamp |

#### 3. Table: `product_variants`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | Unique variant identifier |
| `product_id` | `INTEGER` | FK (`products.id`), Not Null | Parent product relationship |
| `title` | `VARCHAR(100)` | Not Null | Variant title (e.g., "Size L / Blue") |
| `sku` | `VARCHAR(100)` | Unique, Nullable | Variant-specific barcode/SKU |
| `price` | `FLOAT` | Not Null | Specific variant selling price |
| `stock_quantity` | `INTEGER` | Default: `0` | Specific variant stock count |

#### 4. Table: `orders`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | Internal sequential Order ID |
| `order_number` | `VARCHAR(50)` | Unique, Indexed, Not Null | Human-readable Order Code (e.g. `ORD-87123`) |
| `user_id` | `INTEGER` | FK (`users.id`), Nullable | Customer account reference |
| `customer_email`| `VARCHAR(150)`| Not Null | Customer billing/shipping email |
| `customer_name` | `VARCHAR(150)`| Not Null | Customer full name |
| `customer_phone`| `VARCHAR(20)` | Not Null | Customer delivery phone number |
| `shipping_address`| `JSON` | Not Null | Complete delivery address object |
| `total_amount` | `FLOAT` | Not Null | Final settled monetary amount |
| `currency` | `VARCHAR(10)` | Default: `'INR'` | ISO Currency code |
| `status` | `ENUM` | Default: `'PENDING_PAYMENT'`| Current state in order FSM |
| `razorpay_order_id`| `VARCHAR(100)`| Nullable, Indexed | Gateway order reference |
| `created_at` | `DATETIME` | Default: `utcnow()` | Checkout creation time |

#### 5. Table: `payment_transactions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | Transaction primary key |
| `order_id` | `INTEGER` | FK (`orders.id`), Not Null | Associated order reference |
| `razorpay_payment_id`| `VARCHAR(100)`| Unique, Nullable | Gateway payment identifier |
| `razorpay_order_id` | `VARCHAR(100)`| Nullable | Gateway order identifier |
| `razorpay_signature`| `VARCHAR(255)`| Nullable | Cryptographic verification signature |
| `payment_method` | `VARCHAR(50)` | Default: `'Razorpay UPI'` | Channel (UPI, Card, COD) |
| `gateway` | `VARCHAR(50)` | Default: `'Razorpay'` | Gateway engine |
| `amount` | `FLOAT` | Not Null | Paid monetary amount |
| `status` | `VARCHAR(50)` | Not Null | Status: `SUCCESS`, `FAILED`, `PENDING` |
| `created_at` | `DATETIME` | Default: `utcnow()` | Transaction timestamp |

#### 6. Table: `shipments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | Unique shipment ID |
| `order_id` | `INTEGER` | FK (`orders.id`), Not Null | Associated order record |
| `shiprocket_order_id`| `VARCHAR(100)`| Nullable | Shiprocket internal order ID |
| `shiprocket_shipment_id`| `VARCHAR(100)`| Nullable | Logistics shipment identifier |
| `awb_code` | `VARCHAR(100)` | Nullable, Indexed | Air Waybill courier tracking code |
| `courier_name` | `VARCHAR(100)` | Nullable | Assigned courier company |
| `status` | `VARCHAR(50)` | Default: `'MANIFEST_GENERATED'` | Live delivery status |
| `tracking_url` | `VARCHAR(255)` | Nullable | Public package tracking URL |
| `created_at` | `DATETIME` | Default: `utcnow()` | Manifest creation timestamp |

#### 7. Table: `wallets` & `wallet_transactions`
- `wallets`: Stores 1-to-1 customer balance (`balance: FLOAT`, `updated_at`).
- `wallet_transactions`: Implements double-entry ledger (`wallet_id`, `amount`, `transaction_type`: `CREDIT` / `DEBIT`, `reference_id`).

#### 8. Complementary Tables:
- `categories`, `order_items`, `order_status_history`, `sale_events`, `sale_products`, `homepage_sections`, `wishlist_items`, `cart_items`, `coupons`, `reviews`, `gift_cards`, `inventory_logs`, `return_requests`, `email_logs`, `product_queries`, `roles`, `staff_users`, `new_arrivals`, `user_views`, `notifications`, `user_addresses`.

### 4.3 Caching Data Model & Key Strategies
Upstash Redis is deployed to cache high-traffic, compute-intensive read operations:

| Cache Key Pattern | TTL | Invalidation Trigger | Purpose |
| :--- | :--- | :--- | :--- |
| `cache:products:all` | 300 sec (5 min) | Any Product Create / Update / Delete | Fast home & search product queries |
| `cache:product:{handle}` | 600 sec (10 min) | Product update on that specific handle | Sub-15ms PDP loads |
| `cache:categories` | 3600 sec (1 hr) | Category Create / Update | Navigation header category tree |
| `ratelimit:{ip}` | 60 sec | Auto-expires | Token bucket API rate limiting |
| `search:trie:index` | Memory / Persistent | Catalog inventory reload | Sub-millisecond search suggestions |

---

## 5. Core Dynamic Process & Sequence Flows

### 5.1 End-to-End Checkout, Payment & Inventory Deduction

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 👤 Shopper
    participant Store as 💻 Next.js Storefront
    participant API as 🚀 FastAPI API Router
    participant DB as 🐘 Neon PostgreSQL
    participant Razorpay as 💳 Razorpay Gateway
    participant Mailer as ✉️ SMTP Service

    Customer->>Store: Click "Proceed to Checkout"
    Store->>API: POST /api/v1/orders (Items, Address, Coupon)
    API->>DB: Verify Variant Stock Availability & Lock
    API->>DB: INSERT into orders (Status: PENDING_PAYMENT)
    API->>Razorpay: Create Gateway Order (Amount, Currency)
    Razorpay-->>API: Return razorpay_order_id
    API-->>Store: Return Order ID & Gateway Credentials
    
    Store->>Razorpay: Open Razorpay Checkout Modal (UPI / Card)
    Customer->>Razorpay: Complete Authentication / OTP
    Razorpay-->>Store: Return payment_id, order_id, signature
    
    Store->>API: POST /api/v1/payments/verify (Signature Payload)
    API->>API: Compute HMAC-SHA256 signature verification
    
    alt Signature Valid
        API->>DB: UPDATE orders SET status = 'PAID'
        API->>DB: INSERT into payment_transactions (Status: 'SUCCESS')
        API->>DB: DEDUCT stock_quantity in product_variants
        API->>DB: INSERT into inventory_logs (Reason: 'ORDER_PLACED')
        API->>Mailer: Dispatch Asynchronous Order Confirmation Email
        API-->>Store: 200 OK (Payment Verified, Receipt Info)
        Store-->>Customer: Display Success Confirmation Page
    else Signature Invalid
        API->>DB: UPDATE orders SET status = 'CANCELLED'
        API-->>Store: 400 Bad Request (Invalid Payment Signature)
        Store-->>Customer: Alert Payment Failed, Option to Retry
    end
```

---

### 5.2 Automated Logistics Booking & AWB Assignment

```mermaid
sequenceDiagram
    autonumber
    participant OrderPipeline as 📦 Order Management
    participant ShipService as 🚚 Logistics Service
    participant Shiprocket as 🌐 Shiprocket API
    participant DB as 🐘 Neon PostgreSQL
    participant Client as 📱 Tracking UI

    OrderPipeline->>ShipService: Trigger auto_book_shipment(order_id)
    ShipService->>DB: Fetch Order Items, Customer Address, Weight
    ShipService->>Shiprocket: POST /v1/external/orders/create/adhoc
    Shiprocket-->>ShipService: Return shiprocket_order_id & shipment_id
    
    ShipService->>Shiprocket: POST /v1/external/courier/assign/awb
    Shiprocket-->>ShipService: Return awb_code, courier_name, tracking_url
    
    ShipService->>DB: INSERT into shipments (awb_code, courier, tracking_url)
    ShipService->>DB: UPDATE orders SET status = 'SHIPPED'
    ShipService->>DB: INSERT into order_status_history ('SHIPPED', 'AWB Assigned')
    
    Client->>ShipService: GET /api/v1/orders/{order_number}/track
    ShipService-->>Client: Live Tracking Milestones & Courier Timeline
```

---

### 5.3 AI Chatbot Contextual Recommendation Resolution

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Shopper
    participant Widget as 💬 Chatbot UI
    participant ChatAPI as 🤖 /api/v1/chatbot/recommend
    participant Guard as 🛡️ Security Keyword Filter
    participant NLU as 🔍 Regex & Range Extractor
    participant ML as 🧠 TF-IDF Vector Space Engine
    participant DB as 🐘 Neon PostgreSQL

    User->>Widget: "Looking for casual sneakers under 3000 rs"
    Widget->>ChatAPI: POST message, conversation_history, guest_session_id
    ChatAPI->>Guard: Check against Injection / Exploit Keywords
    Guard-->>ChatAPI: Guardrail Passed
    ChatAPI->>NLU: Extract Price Range -> min: 0, max: 3000
    NLU-->>ChatAPI: Extracted Filters & Clean Keywords ("casual sneakers")
    ChatAPI->>DB: Fetch active catalog items matching price <= 3000
    ChatAPI->>ML: Vectorize Product Text & Match Query Cosine Similarity
    ML-->>ChatAPI: Top 3 Highest Scoring Ranked Products
    ChatAPI-->>Widget: Natural Language Response + Interactive Product Cards
    Widget-->>User: Renders bot recommendation with direct "Buy Now" links
```

---

### 5.4 Commercial License Boot Guard & Runtime Enforcement

```mermaid
sequenceDiagram
    autonumber
    participant Uvicorn as 🚀 Server Startup
    participant Guard as 🛡️ License Guard (license_guard.py)
    participant Env as 📄 Environment Variables (.env)
    participant Kernel as ⚙️ OS Process / API Mount

    Uvicorn->>Guard: Execute verify_license_status() on lifespan
    Guard->>Env: Read CLIENT_DOMAIN & LICENSE_KEY & ENVIRONMENT
    Guard->>Guard: Compute HMAC-SHA256(CLIENT_DOMAIN, MASTER_SALT)
    
    alt Production Environment
        alt License Key Matches HMAC Hash
            Guard-->>Uvicorn: Status: VALID (Authorized to Botmartz / Sachin)
            Uvicorn->>Kernel: Boot ASGI server & mount all API endpoints
        else Key Mismatch or Missing
            Guard->>Kernel: Print Critical License Violation & HALT (sys.exit)
        end
    else Development Environment
        alt ALLOW_UNLICENSED_DEV_MODE == true
            Guard-->>Uvicorn: Log Dev Mode Warning & proceed with fallback
            Uvicorn->>Kernel: Mount API endpoints for local testing
        end
    end
```

---

## 6. API Interface Specifications & Contract Standards

### 6.1 Standard REST Conventions & Envelopes
- **Base URI**: `https://{domain}/api/v1`
- **Standard Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```
- **Standard Error Response**:
```json
{
  "success": false,
  "detail": "Descriptive human-readable error reason",
  "error_code": "RESOURCE_NOT_FOUND"
}
```

### 6.2 Master API Endpoint Catalog

| Module | Method | Endpoint Path | Authentication | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Customer account registration |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Credentials authentication & JWT issue |
| **Auth** | `POST` | `/api/v1/auth/firebase-sync` | Public | Google / Mobile Firebase token sync |
| **Products**| `GET` | `/api/v1/products` | Public | Filtered catalog pagination & search |
| **Products**| `GET` | `/api/v1/products/{handle}` | Public | Full product detail view by handle |
| **Products**| `POST` | `/api/v1/products` | Admin | Ingest new product into catalog |
| **Search** | `GET` | `/api/v1/search/autocomplete` | Public | In-memory Trie search suggestions |
| **Cart** | `GET` | `/api/v1/cart` | Customer | Fetch authenticated user cart items |
| **Cart** | `POST` | `/api/v1/cart/add` | Customer | Add / increment product in cart |
| **Orders** | `POST` | `/api/v1/orders` | Customer | Instantiate new checkout order |
| **Orders** | `GET` | `/api/v1/orders/my-orders` | Customer | List historical orders for customer |
| **Orders** | `GET` | `/api/v1/orders/{number}/track`| Public | Fetch live shipping timeline & AWB |
| **Payments**| `POST` | `/api/v1/payments/verify` | Customer | Verify Razorpay HMAC signature |
| **Payments**| `POST` | `/api/v1/payments/webhook` | Gateway | Idempotent webhook event receiver |
| **Invoices**| `GET` | `/api/v1/invoices/{order_id}` | Customer / Admin | Generate GST Tax Invoice PDF |
| **Wallet** | `GET` | `/api/v1/wallet` | Customer | Query balance & transaction ledger |
| **Chatbot** | `POST` | `/api/v1/chatbot/recommend` | Public | Contextual AI shopping assistance |
| **Admin** | `GET` | `/api/v1/admin/analytics` | Admin | Gross revenue, order counts, metrics |
| **Admin** | `POST` | `/api/v1/admin-copilot/query` | Admin | Natural language business intelligence |
| **License** | `GET` | `/api/v1/license/info` | Public | Verify server license authorization |

---

## 7. Security, Governance & Data Integrity Architecture

1. **Cryptographic Protection**:
   - `passlib[bcrypt]` salt rounds: 12 for password hashing.
   - HMAC-SHA256 for payment webhook validation and licensing authorization.
   - JWT tokens signed using HS256 with rotation capabilities.
2. **Database Integrity & SQL Injection Defense**:
   - Complete usage of SQLAlchemy 2.0 Async parameterized queries. No raw unsanitized SQL string concatenation.
   - Foreign key constraints with explicit `ON DELETE CASCADE` or `RESTRICT` rules to prevent orphaned records.
3. **Application Layer Hardening**:
   - Pydantic v2 strict schema models rejecting extraneous or malformed payloads.
   - GZip middleware compression with 1000-byte threshold for bandwidth optimization.
   - Granular CORS controls authorizing verified storefront domains while preventing malicious cross-site scripting.
4. **Rate Limiting & DoS Mitigation**:
   - Upstash Redis token-bucket rate limiter defending against credential brute-forcing, OTP abuse, and scraping.

---

## 8. Non-Functional Requirements (NFRs) & Performance Budgets

| Metric / Dimension | Specification Budget | Measurement & Verification Tool |
| :--- | :--- | :--- |
| **API Latency (Cached)** | $\le 50 \text{ ms}$ | Upstash Redis + FastAPI ASGI benchmark |
| **API Latency (Database)** | $\le 120 \text{ ms}$ | Neon Serverless Pooled connection query latency |
| **Largest Contentful Paint (LCP)** | $\le 1.5 \text{ seconds}$ | Google PageSpeed / Lighthouse Audit |
| **First Contentful Paint (FCP)** | $\le 0.8 \text{ seconds}$ | Next.js 15 Partial Prerendering (PPR) |
| **System Uptime Availability** | $99.9\% \text{ SLA}$ | Automated Healthcheck monitoring at `/health` |
| **Concurrent Users Capacity** | $10,000+ \text{ Active Sessions}$ | Uvicorn ASGI async concurrency workers |
| **License Verification Coverage** | $100\% \text{ Strict Validation}$ | Automated server lifespan boot check |

---

## 9. DevOps, Deployment Topology & Infrastructure

### 9.1 Multi-Cloud Infrastructure Blueprint

```
+--------------------------------------------------------------------------+
|                        Cloudflare DNS & Edge Network                     |
+------------------------------------+-------------------------------------+
                                     |
           +-------------------------+-------------------------+
           |                                                   |
           v                                                   v
+-----------------------+                           +----------------------+
|  Vercel Cloud Edge    |                           |  Render / VPS Cloud  |
|  Next.js 15 App Router|                           |  FastAPI ASGI Server |
|  Storefront & Admin   |                           |  Python 3.11 Engine  |
|  (Port 3000 / HTTPS)  |                           |  (Port 8000 / HTTPS) |
+-----------------------+                           +----------+-----------+
                                                               |
                     +--------------------+--------------------+
                     |                    |                    |
                     v                    v                    v
          +--------------------+  +---------------+  +---------------------+
          | Neon Cloud Postgres|  | Upstash Redis |  | Third-Party Cloud:  |
          | Serverless DB      |  | Distributed   |  | - Razorpay          |
          | Connection Pooling |  | Memory Cache  |  | - Shiprocket        |
          | (AWS us-east-2)    |  | & Rate Limiter|  | - Cloudinary CDN    |
          +--------------------+  +---------------+  +---------------------+
```

### 9.2 Environment Configuration Matrix (`.env`)

```env
# Server & Environment Mode
ENVIRONMENT=production
PORT=8000
API_V1_STR=/api/v1
PROJECT_NAME="E-COM Custom Commerce API"

# Commercial EULA License Keys
CLIENT_DOMAIN=ecom.botmartz.com
LICENSE_KEY=SKIPD-LIC-C076881537F3BC11BB2540ED
ALLOW_UNLICENSED_DEV_MODE=false

# Cloud Database & Redis Cache
DATABASE_URL=postgresql+asyncpg://neondb_owner:***@ep-still-king-axcdr7h1-pooler.c-4.us-east-2.aws.neon.tech/neondb
REDIS_URL=rediss://default:***@relaxed-beetle-169896.upstash.io:6379

# Security & Tokens
JWT_SECRET=super_secret_jwt_key_ecom_2026_dev
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_***
RAZORPAY_KEY_SECRET=***
RAZORPAY_WEBHOOK_SECRET=***

# Logistics & Courier (Shiprocket)
SHIPROCKET_EMAIL=demo@e-com.in
SHIPROCKET_PASSWORD=***

# Media Storage (Cloudinary CDN)
CLOUDINARY_CLOUD_NAME=rluropic
CLOUDINARY_API_KEY=556369161351125
CLOUDINARY_API_SECRET=***
```

---
*Authored by Sachin Rawat — Botmartz AI Solution Pvt Ltd*  
*Proprietary & Commercial Software Design Document (SDD) — Version 2.0.0*
