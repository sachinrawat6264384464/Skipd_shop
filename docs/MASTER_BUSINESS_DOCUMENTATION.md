# 📘 BOTCOM COMMERCIAL ENGINE
## MASTER BUSINESS DOCUMENTATION & SYSTEM SPECIFICATION

| Metadata Document Control | Details |
| :--- | :--- |
| **Project / Product Name** | Botcom (Commercial Engine) |
| **Document Type** | Master Business Requirement Document (BRD) & System Specification |
| **Lead Architect / Developer** | Sachin Rawat |
| **Organization** | Botmartz AI Solution Pvt Ltd |
| **License Type** | Commercial Single-Tenant EULA |
| **Document Version** | 1.0.0 (Master Release) |
| **Target Audience** | Stakeholders, Investors, Product Managers, Lead Developers, & Operational Teams |

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Strategic Vision](#1-executive-summary--strategic-vision)
2. [Market Analysis & Competitive Positioning](#2-market-analysis--competitive-positioning)
3. [Business & Functional Requirements](#3-business--functional-requirements)
4. [AI & Smart Growth Subsystems](#4-ai--smart-growth-subsystems)
5. [Technical Architecture & System Design](#5-technical-architecture--system-design)
6. [Third-Party Integrations & Logistics Blueprint](#6-third-party-integrations--logistics-blueprint)
7. [Admin Portal & Operations Management](#7-admin-portal--operations-management)
8. [Monetization, Financial & Promo Architecture](#8-monetization-financial--promo-architecture)
9. [Security, Governance & Compliance Standards](#9-security-governance--compliance-standards)
10. [DevOps, Infrastructure & Hosting Strategy](#10-devops-infrastructure--hosting-strategy)
11. [Project Roadmap, Milestones & Success KPIs](#11-project-roadmap-milestones--success-kpis)

---

## 1. EXECUTIVE SUMMARY & STRATEGIC VISION

### 1.1 Purpose & Mission
Botcom (Commercial Engine) is a state-of-the-art, high-performance Direct-to-Consumer (D2C) and Multi-Vendor E-Commerce platform built by **Botmartz AI Solution Pvt Ltd**. The system is engineered to solve modern retail friction points—specifically high bounce rates, slow catalog filtering, fragmented logistics tracking, and inefficient manual customer service.

### 1.2 Core Value Proposition
- **Ultra-Fast User Experience:** Next.js 15 App Router with Partial Prerendering (PPR) ensuring sub-second page loads.
- **AI-Driven Customer Engagement:** Native AI Shopping Assistant Chatbot and Vector-based Semantic Search (`pgvector`).
- **End-to-End Enterprise Automation:** Native Razorpay/Stripe payments, automated Shiprocket shipping fulfillment, and transactional HTML email dispatches.
- **Robust Commercial License Security:** Integrated HMAC SHA-256 EULA license validation to protect intellectual property.

---

## 2. MARKET ANALYSIS & COMPETITIVE POSITIONING

### 2.1 Target Market & Demographics
- **Primary Segment:** Indian D2C Brands, Electronics, Fashion & Apparel, and Specialty Retail Merchants.
- **End-User Persona:** Tech-savvy mobile and desktop shoppers seeking friction-free OTP login, instant localized pincode delivery estimates, transparent checkout, and quick payment options.

### 2.2 Key Differentiators
| Feature | Traditional Platforms (Shopify/WooCommerce) | Botcom Commercial Engine |
| :--- | :--- | :--- |
| **Catalog Speed** | Slow plugin-heavy client rendering | Next.js 15 PPR & Redis Sub-50ms caching |
| **Search Experience** | Rigid exact-match database queries | AI-powered Semantic Vector Search (`pgvector`) |
| **Authentication** | Password friction / manual signups | Centered Modal with 6-digit OTP & Google Social Sync |
| **Logistics Integration** | Third-party paid extensions | Built-in Shiprocket AWB tracking & live timelines |
| **AI Capabilities** | External costly SAAS plugins | Native AI Chatbot & Admin Sales Copilot |

---

## 3. BUSINESS & FUNCTIONAL REQUIREMENTS

### 3.1 Customer Storefront (Front-End Features)
1. **Interactive Product Detail View (PDP):**
   - Multi-image zoom gallery.
   - Dynamic variant selector (Color swatches, Size pickers).
   - Applicable Bank Offer cards and instant Exchange radio buttons.
   - "Frequently Bought Together" automated bundle widgets.
2. **Dynamic Search & Filtering Catalog (`/search`):**
   - Real-time client-side and server-side filtering by category hierarchy, price range sliders, ratings (1-5 stars), and color palettes.
   - Flexible pagination (8, 12, 24, 48 items per page) and Grid/List view switcher.
3. **Seamless Centered Auth Modal:**
   - React `createPortal` centered overlay supporting mobile OTP verification (60-second expiration timer) with fallback to email/password login.
4. **Header Navigation & Pincode Serviceability Picker:**
   - Indian 6-digit pincode validator displaying real-time delivery estimates (`Deliver to Sachin 474001`).
   - Sticky top navbar with wishlist counter badge, sliding cart panel, and user profile drawer.

### 3.2 Core E-Commerce Operations
1. **Cart & Wishlist Persistence:** Synchronized cross-device cart and wishlist stored per authenticated user profile.
2. **Order Lifecycle Pipeline:** Multi-stage order states (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
3. **Address Book Management:** Multiple shipping/billing addresses with single-click default selection.
4. **Reviews & Rating System:** Customer rating submissions (1 to 5 stars), text comments, and verified buyer badges.

---

## 4. AI & SMART GROWTH SUBSYSTEMS

### 4.1 Native AI Shopping Assistant Chatbot
- Interactive conversational AI widget integrated into the storefront.
- Assists shoppers with product selection, budget filtering, and order status queries.

### 4.2 AI Vector Search (`pgvector`)
- Enables natural language semantic search (e.g., *"Show me casual summer outfits under ₹2000"*).
- Converts catalog metadata into high-dimensional embeddings for contextual matching.

### 4.3 Automated Abandoned Cart Recovery
- Identifies uncompleted checkout sessions and triggers automated recovery emails with personalized discount incentives.

### 4.4 Admin Copilot AI
- Natural language query interface for store managers (e.g., *"What were our top 3 best-selling products this week in Mumbai?"*).

---

## 5. TECHNICAL ARCHITECTURE & SYSTEM DESIGN

### 5.1 Technology Stack Matrix
```
+-----------------------------------------------------------------------+
|                        NEXT.JS 15 STOREFRONT                          |
|         (App Router, React 19, Turbopack, TailwindCSS, Lucide)        |
+-----------------------------------------------------------------------+
                                   | (REST API / JSON)
                                   v
+-----------------------------------------------------------------------+
|                        FASTAPI BACKEND ENGINE                         |
|             (Python 3.11+, ASGI Uvicorn, Pydantic v2 Schema)           |
+-----------------------------------------------------------------------+
    |                    |                    |                   |
    v                    v                    v                   v
+------------+    +--------------+    +---------------+   +---------------+
| PostgreSQL |    | Redis Cache  |    | Razorpay /    |   | Shiprocket    |
| (SQLAlchemy|    | (Upstash /   |    | Stripe Payment|   | Logistics API |
| 2.0 Async) |    | In-Memory)   |    | Webhooks      |   | Tracking      |
+------------+    +--------------+    +---------------+   +---------------+
```

### 5.2 FastAPI Decoupled Domain Architecture (15 Modules)
1. **`auth`**: OTP issuance, JWT token signing, verification.
2. **`users`**: Profile management, credential updates.
3. **`products`**: Catalog lookup, handle slugs, tags, variant schemas.
4. **`categories`**: Hierarchy trees and category mapping.
5. **`cart`**: DB-backed cart synchronization.
6. **`wishlist`**: Saved items repository.
7. **`orders`**: Order creation, status updates, invoice receipts.
8. **`payments`**: Razorpay/Stripe order generation & webhook HMAC verification.
9. **`inventory`**: Stock tracking, batch updates, reservation locks.
10. **`coupons`**: Promo code logic, discount cap calculation.
11. **`reviews`**: Moderated customer reviews.
12. **`addresses`**: User shipping address book.
13. **`notifications`**: SMS dispatches & HTML transactional emails.
14. **`gift-cards`**: Gift balance issuance & redemption logic.
15. **`admin`**: System analytics, sales reports, and merchant settings.

---

## 6. THIRD-PARTY INTEGRATIONS & LOGISTICS BLUEPRINT

### 6.1 Payment Gateway Flow (Razorpay & Stripe)
- **Order Initialization:** Frontend calls `/api/v1/payments/create-order` -> Backend creates Razorpay order ID.
- **Client Processing:** Razorpay checkout modal opens on frontend.
- **Server Verification:** Signature verification via webhook `/api/v1/payments/webhook` using secret keys before marking order as `CONFIRMED`.

### 6.2 Logistics Integration (Shiprocket API)
- Automatic order pushing to Shiprocket upon payment confirmation.
- Courier partner allocation based on cost & serviceability.
- Automated generation of Air Waybill (AWB) numbers and live tracking link generation.

### 6.3 Transactional Communication Flow
- **OTP Verification Email/SMS:** Instant delivery of 6-digit code with 60-second expiration.
- **Order Invoice Email:** Dynamic HTML email containing items table, total paid, tax breakup, and PDF download link.
- **Dispatch Update Email:** Tracking number, courier partner details, and expected delivery date.

---

## 7. ADMIN PORTAL & OPERATIONS MANAGEMENT

### 7.1 Analytics Dashboard
- Total Revenue, Total Orders, Average Order Value (AOV), Conversion Rate graphs.
- Real-time active cart counters and stock health status.

### 7.2 Inventory Control & Alerts
- Variant-level stock management with minimum threshold warnings.
- Low-stock email notifications sent directly to store admins.

### 7.3 Multi-Vendor Payout System
- Vendor product isolation and catalog submission approval workflows.
- Automated commission calculation per sale and vendor payout reports.

---

## 8. MONETIZATION, FINANCIAL & PROMO ARCHITECTURE

### 8.1 Monetization Streams
1. **Direct Product Sales:** Standard D2C retail revenue.
2. **Multi-Vendor Platform Fees:** Commission percentage charged per vendor transaction.
3. **Commercial EULA Licensing:** B2B single-tenant license sales to external enterprise merchants.

### 8.2 Promotional Engine
- **Fixed & Percentage Coupons:** Cap limit control, minimum cart value criteria, usage limit per user.
- **In-House Wallet System:** Cashback reward credits, instant refund balances, wallet checkout options.

---

## 9. SECURITY, GOVERNANCE & COMPLIANCE STANDARDS

1. **Authentication Security:** JWT Tokens with short lifetimes, salted Bcrypt password hashing (`rounds=12`), and OTP rate limiting.
2. **PCI-DSS Compliance:** Zero local credit/debit card storage. All card transactions offloaded directly to PCI-DSS Level 1 compliant gateways (Razorpay/Stripe).
3. **Commercial License Protection:** Runtime HMAC SHA-256 License Key validator ensuring code cannot be executed unauthorized.
4. **Data Privacy:** Encrypted PII (Personally Identifiable Information) storage in database with SSL/TLS 1.3 in transit.

---

## 10. DEVOPS, INFRASTRUCTURE & HOSTING STRATEGY

| Layer | Environment | Technology / Service |
| :--- | :--- | :--- |
| **Frontend Hosting** | Production | Vercel Edge Network (Global CDN, Next.js PPR Support) |
| **Backend API Hosting** | Production | Railway / AWS ECS (Dockerized ASGI FastAPI cluster) |
| **Database** | Production | AWS RDS PostgreSQL / Supabase Async Pool |
| **Cache Layer** | Production | Redis Cloud / Upstash Redis |
| **Storage (Images)** | Production | AWS S3 / Cloudflare R2 |
| **CI/CD Pipeline** | Automated | GitHub Actions (Auto-testing via `test_e2e.py` & Vercel deployment) |

---

## 11. PROJECT ROADMAP, MILESTONES & SUCCESS KPIS

### 11.1 Execution Roadmap
- **Phase 1 (Month 1):** Requirements finalization, database schema design, FastAPI 15-domain scaffolding.
- **Phase 2 (Month 2):** Next.js 15 Storefront development, Product PDP, Auth Portal, Cart/Wishlist.
- **Phase 3 (Month 3):** Razorpay, Shiprocket, HTML Email, and AI Chatbot integrations.
- **Phase 4 (Month 4):** E2E testing (`python test_e2e.py`), security audit, Vercel/Railway production launch.

### 11.2 Key Success Metrics (KPIs)
- **API Performance:** 95% of API requests completed in `< 50ms`.
- **Page Speed:** Google Lighthouse performance score `> 90/100`.
- **Order Conversion Rate:** target `> 3.5%` checkout completion rate.
- **System Uptime:** `99.9%` SLA on backend API services.

---
*Authored by Sachin Rawat — Botmartz AI Solution Pvt Ltd*
