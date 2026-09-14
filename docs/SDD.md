# 📐 Software Design Document (SDD)
## Skipd Shop — Commercial E-Commerce Engine

| Metadata | Details |
| :--- | :--- |
| **Project Name** | Skipd Shop / E-COM Commerce Engine |
| **Developer** | Sachin Rawat |
| **Organization** | Botmartz AI Solution Pvt Ltd |
| **License Type** | Commercial Single-Tenant EULA |
| **Document Version** | 1.0.0 |
| **Status** | Approved / Production Ready |

---

## 🎯 1. System Goals & Design Principles

### **1.1 Primary Objectives**
The **Skipd Shop SDD** outlines the software engineering principles, system interface specifications, data flow architectures, and non-functional requirements governing the platform.

Key design goals include:
1. **High Concurrency & Low Latency**: Sub-50ms API response time powered by FastAPI ASGI and Upstash Redis response caching.
2. **Commercial IP Protection**: Embedded HMAC SHA-256 License Key validation protecting intellectual property rights for **Botmartz AI Solution Pvt Ltd** and **Developer Sachin Rawat**.
3. **Modular Domain Architecture**: Isolated domain modules (`auth`, `products`, `cart`, `orders`, `payments`, `wallet`, `license`) ensuring maintainability and clean separation of concerns.

---

## 🔄 2. Core Data Flow & Process Architecture

### **2.1 Customer Checkout & Payment Process Flow**

```mermaid
sequenceDiagram
    autonumber
    participant Client as Frontend (Next.js)
    participant API as FastAPI Engine
    participant DB as Neon PostgreSQL
    participant Gateway as Payment Gateway (Razorpay/Stripe)
    participant Ship as Shiprocket Logistics

    Client->>API: POST /api/v1/orders (Items, Address ID)
    API->>DB: Validate Variant Stock & Price
    API->>DB: Create Order Record (Status: PENDING)
    API->>Gateway: Initialize Payment Order Signature
    Gateway-->>API: Return Payment Order ID & Secrets
    API-->>Client: Return Order ID & Gateway Credentials
    
    Client->>Gateway: Customer Performs Payment (UPI/Card)
    Gateway-->>Client: Payment Success Signature Callback
    
    Client->>API: POST /api/v1/payments/verify (Signature, Order ID)
    API->>Gateway: Verify Webhook / Cryptographic Signature
    
    alt Signature Valid
        API->>DB: Update Order Status -> CONFIRMED
        API->>DB: Deduct Stock Quantity in product_variants
        API->>Ship: Dispatch Shipment Booking Request
        API-->>Client: Return Receipt & Order Confirmation
    else Signature Invalid
        API->>DB: Update Order Status -> FAILED
        API-->>Client: Throw Payment Verification Error (400)
    end
```

---

### **2.2 Commercial License Enforcement Process Flow**

```mermaid
flowchart TD
    A[🚀 Server Startup Event] --> B[Read CLIENT_DOMAIN & LICENSE_KEY from .env]
    B --> C{Check ENVIRONMENT Mode}
    
    C -- Development --> D[Check ALLOW_UNLICENSED_DEV_MODE]
    D -- True --> E[Log Warning & Continue in Dev Fallback]
    D -- False --> F[Execute Strict License Verification]
    
    C -- Production --> F
    
    F --> G[Calculate HMAC-SHA256 Signature for CLIENT_DOMAIN]
    G --> H{Does Provided LICENSE_KEY Match Expected Signature?}
    
    H -- Yes --> I[✅ License Validated: Authorize Backend Engine Boot]
    H -- No --> J[❌ Critical License Error: Halt Process & Throw 403]
```

---

## ⚡ 3. System Interfaces & Data Exchange Formats

### **3.1 Frontend - Backend Interface (REST over HTTPS)**
* **Protocol**: HTTP/2 over TLS 1.3
* **Data Format**: JSON (`application/json`)
* **Authentication**: Bearer Token in Request Header (`Authorization: Bearer <JWT_TOKEN>`)
* **Licensing Verification**: `X-License-Key: <LICENSE_KEY>` header support.

### **3.2 Database Interface (SQLAlchemy 2.0 Async Engine)**
* **Driver**: `asyncpg` (Async PostgreSQL Driver)
* **Connection Pool**: 20 persistent connections with 10 overflow slots.
* **Migration Manager**: Alembic versioning scripts.

---

## 🛡️ 4. Non-Functional Requirements (NFRs) & SLAs

| Requirement Category | Metric / SLA Specification | Implementation Strategy |
| :--- | :--- | :--- |
| **Performance** | Page Load < 1.5s, API Response < 50ms | Next.js PPR + Upstash Redis API Cache |
| **Availability** | 99.9% Uptime SLA | Serverless Vercel + Neon Multi-AZ Cloud PostgreSQL |
| **Security** | Zero Unauthenticated Mutating Routes | JWT + Bcrypt + FastAPI Security Guards |
| **Scalability** | Up to 10,000 Concurrent Active Users | ASGI Uvicorn workers + Connection Pooling |
| **IP Protection** | 100% License Key Verification | HMAC SHA-256 Key Guard + Commercial EULA |

---

## 🚀 5. DevOps & Environment Strategy

### **5.1 Environment Configuration Matrix**

```env
# System & Licensing Controls
ENVIRONMENT=production
CLIENT_DOMAIN=ecom.botmartz.com
LICENSE_KEY=SKIPD-LIC-C076881537F3BC11BB2540ED
ALLOW_UNLICENSED_DEV_MODE=false

# Database & Cache Credentials
DATABASE_URL=postgresql+asyncpg://neondb_owner:***@ep-still-king.aws.neon.tech/neondb
REDIS_URL=rediss://default:***@relaxed-beetle.upstash.io:6379

# Third-Party API Keys
STRIPE_SECRET_KEY=sk_test_***
RAZORPAY_KEY_ID=rzp_test_***
SHIPROCKET_EMAIL=demo@e-com.in
```

---
*Created by Sachin Rawat — Botmartz AI Solution Pvt Ltd*
