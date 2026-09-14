# 📋 Skipd Shop — Master Feature Catalog & Capabilities List

| Metadata | Details |
| :--- | :--- |
| **Product Name** | Skipd Shop / E-COM Commercial Engine |
| **Developer** | Sachin Rawat |
| **Organization** | Botmartz AI Solution Pvt Ltd |
| **License Type** | Commercial Single-Tenant EULA |
| **Document Version** | 1.0.0 |

---

## 🛍️ 1. Storefront & Customer Experience (Frontend)
- **High-Performance Next.js 15 App Router**: Server-Side Rendering (SSR) & Partial Prerendering (PPR).
- **Amazon-Style Product Detail Views**: Interactive image gallery, exchange options, bank offer cards.
- **Dynamic Multi-Filter Catalog (`/search`)**: Filter by category, price range slider, swatches, ratings, grid/list view switcher.
- **Centered Viewport Auth Modal**: React `createPortal` overlay supporting 6-digit OTP & password fallback.
- **Top Navbar & Location Picker**: Profile dropdown, wishlist badge, cart sidebar, and Indian pincode serviceability picker.
- **Responsive Aesthetics**: Modern dark/light UI, glassmorphism elements, sticky checkout bar.

---

## ⚡ 2. Backend Engine & Domain Architecture (FastAPI)
- **FastAPI ASGI Engine**: Asynchronous, high-concurrency non-blocking API handling.
- **SQLAlchemy 2.0 Async Session**: PostgreSQL connection pooling with `asyncpg`.
- **Modular Domain Structure**: 15 decoupled domain routers (`auth`, `users`, `products`, `categories`, `cart`, `wishlist`, `orders`, `payments`, `inventory`, `coupons`, `reviews`, `addresses`, `notifications`, `gift-cards`, `wallet`).
- **Pydantic v2 Request Validation**: Strict data parsing and response sanitization.

---

## 🔐 3. Authentication & Security
- **OTP & Password Auth**: 6-digit OTP generation with 60-second expiration timers.
- **Firebase Auth Sync**: Google Social Login & Firebase ID token validation.
- **JWT Access Tokens**: Encrypted JWT token issuance (`python-jose`, `HS256`).
- **Bcrypt Password Hashing**: Secure salted password storage.
- **Commercial EULA License Guard**: Runtime HMAC SHA-256 License Key & domain authorization checker.

---

## 🛒 4. E-Commerce Core Operations
- **Persisted Cart & Wishlist**: Cross-session database synchronization per authenticated user.
- **Order Management Lifecycle**: Order placement, receipts, status tracking (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`).
- **User Address Book**: Multiple saved shipping addresses with default address selection.
- **Coupons & Promo System**: Discount promo validation, percentage/flat rate cap calculation.
- **Customer Product Reviews**: 1-5 star ratings, customer review comments, verified buyer badge.

---

## 💳 5. Payment Gateways & Logistics
- **Stripe Integration**: Native Stripe Checkout & Payment Intents.
- **Razorpay Integration**: Native Razorpay order creation & webhook signature verification.
- **Shiprocket Logistics**: Automated AWB tracking, courier partner allocation, live tracking timelines.
- **User Wallet & Rewards**: Wallet ledger balance, transactions, cashback rewards.

---

## 🤖 6. AI & Smart Growth Subsystems
- **AI Recommendation Engine**: "Frequently Bought Together" & "You May Also Like" bundles.
- **AI Shopping Assistant Chatbot**: Natural language shopping guide helping users select items.
- **AI Vector Search (pgvector)**: Natural language semantic search.
- **Abandoned Cart Automation**: Automatic email alerts for abandoned carts.
- **Admin Copilot AI**: Natural language AI query interface for sales insights.

---

## 🏭 7. Admin & Multi-Vendor Capabilities
- **Admin Analytics Dashboard**: Revenue graphs, sales stats, low stock alerts, inventory control.
- **Multi-Vendor Seller Portal**: Vendor product listing, sales tracking, automated payouts.
- **HTML Email Dispatch**: Automated order invoices, shipment tracking, OTP emails.
- **Redis Response Caching**: Sub-50ms API speed optimization using Upstash Redis.

---
*Created by Sachin Rawat — Botmartz AI Solution Pvt Ltd*
