# SKIPD Commerce — Modern Direct-to-Consumer (D2C) E-Commerce Platform

![SKIPD Commerce](https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200)

SKIPD Commerce is a high-performance, full-stack B2C e-commerce platform built with **Next.js 15 (App Router, Turbopack, PPR)** on the frontend and **FastAPI (Async SQLAlchemy 2.0, PostgreSQL/SQLite, Redis)** on the backend. It features native Razorpay payment integration, Shiprocket logistics tracking, full OTP/Password authentication, interactive product detail views, dynamic multi-filter category search, and a modular domain architecture.

---

## ✨ Features & Subsystems

### 🛍️ Storefront & User Experience
- **Amazon-style Product Detail Views**: Interactive image gallery, exchange radio options, applicable bank offer cards, dynamic category sub-navigation, and "Frequently Purchased Together" bundles.
- **Dynamic Catalog & Search (`/search`)**: 100% dynamic pagination, page size selector (8, 12, 24, 48), price range sliders, color palette swatches, review filters, customer ratings, grid/list view switcher, and sticky left filter sidebar.
- **Centered Viewport Auth Modal**: React `createPortal` overlay centered floating login/register popup supporting 6-digit OTP verification with 1-minute expiration timers and password login fallback.
- **Navbar & Delivery Location Picker**: Top navbar with logged-in user profile dropdown, wishlist badge, cart sidebar, and Indian pincode serviceability location picker (`Deliver to Sachin 474001`).

### ⚡ FastAPI Modular Backend Architecture (15 Domain Apps)
1. **🔐 Authentication (`/api/v1/auth`)**: OTP generation, verification, JWT token issuance.
2. **👤 Users (`/api/v1/users`)**: Profile management & credentials update.
3. **🛍️ Products (`/api/v1/products`)**: Catalog lookup, handles, variants, and tag search.
4. **☷ Categories (`/api/v1/categories`)**: Product category hierarchies and slugs.
5. **🛒 Cart (`/api/v1/cart`)**: User cart items synchronization.
6. **🖤 Wishlist (`/api/v1/wishlist`)**: Saved favorite products.
7. **📦 Orders (`/api/v1/orders`)**: Order placement, receipts, and order history.
8. **💳 Payments (`/api/v1/payments`)**: Razorpay order creation & webhook signature verification.
9. **🏭 Inventory (`/api/v1/inventory`)**: Variant stock management and stock movement logs.
10. **🏷️ Coupons (`/api/v1/coupons`)**: Discount promo validation and cap calculation.
11. **🌟 Reviews (`/api/v1/reviews`)**: Product customer ratings (1-5 stars) and comments.
12. **📍 Addresses (`/api/v1/addresses`)**: Saved address book and default address selection.
13. **🔔 Notifications (`/api/v1/notifications`)**: SMS & system notification dispatch.
14. **🎁 Gift Cards (`/api/v1/gift-cards`)**: Gift card balance check & redemption.
15. **🛡️ Admin Portal (`/api/v1/admin`)**: Analytics dashboard, sales stats, and inventory control.

### 📧 Automated HTML Email Flow
- **OTP Auth Email**: 6-digit verification code with 60-second expiration.
- **Order Confirmation Email**: Invoice summary, total paid, and tracking link.
- **Shipment Tracking Email**: AWB number, courier partner details, and live delivery timeline.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router, Turbopack, PPR) |
| **Styling & UI** | Vanilla CSS, TailwindCSS, Lucide React Icons |
| **Backend Engine** | Python FastAPI (ASGI, Starlette, Uvicorn) |
| **Database** | PostgreSQL / SQLite (SQLAlchemy 2.0 Async Session) |
| **Caching & Queues** | Redis (with in-memory fallback) & Celery |
| **Payments** | Razorpay Node/Python SDK |
| **Logistics** | Shiprocket API Integration |

---

## 🚀 Quickstart Guide

### 1. Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
pnpm install
```

---

### 2. Run Local Development Servers

**Terminal 1: FastAPI Backend Server (Port 8080)**
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8080 --reload
```
- 🌐 **API Base**: `http://127.0.0.1:8080/api/v1`
- 📖 **Swagger Docs**: `http://127.0.0.1:8080/docs`

**Terminal 2: Next.js Frontend Storefront (Port 3003)**
```bash
cd frontend
pnpm dev --port 3003
```
- 🛍️ **Storefront App**: `http://localhost:3003`

---

## 🧪 Testing & Verification

Run the full end-to-end diagnostic test suite for database tables, Redis, API routes, and auth flow:

```bash
cd backend
python test_e2e.py
```

### 👤 Demo Customer Credentials
- **Email / Phone**: `customer@skipd.in` / `9876543210`
- **Password**: `pass1234`
- **OTP**: Use screen auto-fill code or enter `123456`.

---

## 📜 License
Developed for SKIPD Commerce — All Rights Reserved.
