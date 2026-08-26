"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "components/layout/footer";

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "grievance" | "epr">("terms");

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      
      <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 w-full">
        
        {/* Title Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-3 border border-emerald-900/40">
          <span className="bg-emerald-400/20 text-emerald-300 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
            Botmartz Technologies &bull; Consumer Protection &amp; Legal Framework
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">Botmartz Consumer Policies</h1>
          <p className="text-xs text-gray-300 font-medium">Last Updated: August 26, 2026 &bull; Compliant with Information Technology Act 2000 &amp; Consumer Protection Rules 2020</p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs text-xs font-black">
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === "terms" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            📄 Terms of Use
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === "privacy" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            🔒 Security &amp; Privacy
          </button>
          <button
            onClick={() => setActiveTab("grievance")}
            className={`px-5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === "grievance" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ⚖️ Grievance Redressal
          </button>
          <button
            onClick={() => setActiveTab("epr")}
            className={`px-5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === "epr" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            🌱 EPR Compliance
          </button>
        </div>

        {/* Tab 1: Terms of Use */}
        {activeTab === "terms" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">1. Terms of Use &amp; Service Agreement</h2>
            <p>
              Welcome to <strong>Botmartz Technologies Pvt Ltd</strong> (&quot;Botmartz&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). By accessing, browsing, registering an account on <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">botmartz.com</a>, or placing orders on our e-commerce storefront, mobile web apps, and APIs, you explicitly agree to be bound by these legally binding Terms of Use.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">1.1 User Eligibility &amp; Account Registration</h3>
            <p>
              To use Botmartz services, you must be at least 18 years of age or accessing under the supervision of a legal guardian. Users are responsible for maintaining the strict confidentiality of their account credentials, passwords, and OTP verification codes. Any purchase or action initiated through an authenticated session will be legally attributed to the registered account owner.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">1.2 Product Descriptions &amp; Pricing</h3>
            <p>
              All prices listed across Botmartz catalog are in Indian Rupees (INR) and inclusive of applicable Goods and Services Tax (GST). While we strive for 100% accuracy in stock status, specifications, and pricing, typographical errors or technical glitches may occasionally occur. Botmartz reserves the right to cancel or refund orders arising from technical errors or erroneous pricing.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">1.3 Order Confirmation &amp; Payment Methods</h3>
            <p>
              Order placement constitutes an offer to purchase. Acceptance occurs when Botmartz dispatches the item and issues a tracking AWB number. We accept payments via Razorpay (UPI, Credit/Debit Cards, NetBanking), Wallet, Gift Cards, and Cash on Delivery (COD) for eligible pincodes.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">1.4 Intellectual Property Rights</h3>
            <p>
              All trademarks, logos, brand assets, software code, UI designs, and product metadata on this platform are the exclusive property of Botmartz Technologies Pvt Ltd. Unauthorized copying, scraping, or commercial exploitation is strictly prohibited.
            </p>
          </div>
        )}

        {/* Tab 2: Security & Privacy */}
        {activeTab === "privacy" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">2. Security &amp; Data Privacy Policy</h2>
            <p>
              Botmartz Technologies prioritizes user privacy. We enforce 256-bit SSL encryption across all end-to-end communication channels to keep your personal data 100% secure.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">2.1 PCI-DSS Level 1 Payment Security</h3>
            <p>
              Botmartz does not store sensitive payment card details, CVVs, or UPI PINs on its application servers. All transaction processing is managed via Razorpay&apos;s RBI-regulated PCI-DSS Level 1 compliant gateway infrastructure.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">2.2 Personal Data Collection &amp; Use</h3>
            <p>
              We collect user information (Name, Delivery Address, Mobile Number, Email) strictly to fulfill orders, issue invoices, calculate logistics shipping routes, and send automated order status updates. We guarantee <strong>zero third-party data selling</strong> to advertising brokers.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">2.3 Cookies &amp; Local Storage</h3>
            <p>
              Our web application utilizes minimal browser localStorage and HTTP session cookies exclusively to maintain user login state, shopping cart items, and wishlist preferences.
            </p>
          </div>
        )}

        {/* Tab 3: Grievance Redressal */}
        {activeTab === "grievance" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">3. Grievance Redressal Mechanism</h2>
            <p>
              In compliance with the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020, the contact details of our designated Nodal Officer and Grievance Officer are published below:
            </p>

            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-3">
              <p className="font-extrabold text-emerald-900 text-sm">Designated Grievance Officer: Mr. Rajesh V. Nambiar</p>
              <p className="text-gray-700"><strong>Designation:</strong> Head of Legal Affairs &amp; Consumer Escalations</p>
              <p className="text-gray-700"><strong>Company:</strong> Botmartz Technologies Pvt Ltd</p>
              <p className="text-gray-700"><strong>Address:</strong> Outer Ring Road, Embassy Tech Village, Bengaluru, Karnataka 560103, India</p>
              <p className="text-gray-700"><strong>Direct Email:</strong> <a href="mailto:grievance@botmartz.com" className="text-emerald-700 font-bold hover:underline">grievance@botmartz.com</a> / <a href="mailto:support@botmartz.com" className="text-emerald-700 font-bold hover:underline">support@botmartz.com</a></p>
              <p className="text-gray-700"><strong>Toll-Free Escalation Desk:</strong> <a href="tel:18002686278" className="text-emerald-700 font-bold hover:underline">1800-BOTMARTZ (1800 268 6278)</a></p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-1">
              <p className="font-bold text-gray-900 text-xs">Resolution Timelines (SLA):</p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                <li><strong>Acknowledgement:</strong> Within 24 hours of grievance ticket creation</li>
                <li><strong>Resolution:</strong> Within 15 working days from date of receipt</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: EPR Compliance */}
        {activeTab === "epr" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">4. Extended Producer Responsibility (EPR) Compliance</h2>
            <p>
              Botmartz Technologies is committed to environmental sustainability under the E-Waste (Management) Rules, 2016 and Plastic Waste Management Rules, 2018.
            </p>

            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-1">
              <p className="font-bold text-emerald-900">CPCB EPR Authorization Registration No:</p>
              <p className="font-mono text-emerald-700 font-bold text-sm">CPCB/EPR-BOTMARTZ/2026/KA</p>
            </div>

            <p>
              Customers can deposit end-of-life electronic accessories, batteries, and packaging materials at any authorized Botmartz collection point or request a free eco-pickup during product return.
            </p>
          </div>
        )}

      </div>

      {/* Global Footer Rendered At Bottom */}
      <Footer />
    </div>
  );
}
