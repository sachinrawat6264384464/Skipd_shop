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
            Botmartz Technologies &bull; Consumer Protection &amp; Statutory Legal Framework
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">Botmartz Consumer Policies &amp; Legal Terms</h1>
          <p className="text-xs text-gray-300 font-medium max-w-2xl mx-auto">
            Last Updated: August 27, 2026 &bull; Formulated under Information Technology Act 2000, Consumer Protection (E-Commerce) Rules 2020 &amp; E-Waste Rules 2022
          </p>
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

        {/* TAB 1: TERMS OF USE */}
        {activeTab === "terms" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase border border-emerald-200">Legal Agreement</span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">1. Terms of Use &amp; General Service Agreement</h2>
              <p className="text-gray-500 mt-1">Please read these terms carefully before navigating or initiating purchases on Botmartz Commerce.</p>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">1.1 Binding Contractual Relationship</h3>
                <p className="mt-1">
                  Welcome to <strong>Botmartz Technologies Pvt Ltd</strong> (&quot;Botmartz&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). By accessing, browsing, creating an account on <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">botmartz.com</a>, using our mobile web applications, software APIs, or purchasing products from our catalog, you explicitly agree to be legally bound by these Terms of Use, our Privacy Policy, Return Policy, and all applicable laws of India.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">1.2 User Account Eligibility &amp; Security Obligations</h3>
                <p className="mt-1">
                  Services are available only to persons who can form legally binding contracts under the Indian Contract Act, 1872 (at least 18 years of age). Minors may access the platform strictly under parental or legal guardian supervision. You are solely responsible for keeping your login credentials, OTP codes, and password confidential. Any transaction or action conducted under your authenticated account session will be legally attributed to you.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">1.3 Product Descriptions, Stock Availability &amp; Pricing</h3>
                <p className="mt-1">
                  All prices listed across Botmartz catalog are stated in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST). While we enforce automated inventory synchronization across fulfillment hubs to maintain 100% stock accuracy, technical glitches or pricing errors may occasionally occur. Botmartz reserves the right to decline, modify, or cancel orders arising from erroneous price listings or system glitches, with immediate full refund to the customer.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">1.4 Order Acceptance, Confirmation &amp; Airway Bill (AWB)</h3>
                <p className="mt-1">
                  Receipt of an order confirmation email or SMS does not signify final order acceptance. Order fulfillment occurs when Botmartz dispatches the item from the fulfillment hub and issues a valid courier Tracking AWB Number (e.g. BlueDart / Shiprocket Air Express). Botmartz reserves the right to limit order quantities per account or cancel suspicious bulk reseller transactions.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">1.5 Payment Gateways &amp; Cash on Delivery (COD)</h3>
                <p className="mt-1">
                  We support payments via Razorpay (UPI, Credit/Debit Cards, NetBanking), Botmartz Wallet, Gift Cards, and Cash on Delivery (COD). For COD orders, customers must pay the exact invoice amount in cash or UPI QR scan upon courier doorstep arrival. Refusing delivery of COD parcels without valid cause may lead to temporary COD privilege suspension.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">1.6 Intellectual Property Rights &amp; Trademark Protection</h3>
                <p className="mt-1">
                  All platform software code, database schemas, UI designs, brand logos, product metadata, and graphic assets are the exclusive intellectual property of Botmartz Technologies Pvt Ltd. Scraping, reverse-engineering, automated data mining, or commercial copying of any site content is strictly prohibited under Indian Copyright Law.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">1.7 User Code of Conduct &amp; Prohibited Actions</h3>
                <p className="mt-1">
                  Users agree not to upload malicious code, engage in fraudulent chargebacks, submit fake product reviews, attempt unauthorized server intrusion, or bypass platform security features. Violations will result in immediate permanent account termination and referral to cybercrime authorities.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">1.8 Limitation of Liability &amp; Indemnification</h3>
                <p className="mt-1">
                  To the maximum extent permitted by law, Botmartz Technologies Pvt Ltd shall not be liable for indirect, incidental, punitive, or consequential damages resulting from platform usage, delivery delays by third-party logistics partners, or temporary server maintenance downtime. Total corporate liability shall not exceed the invoice price paid for the specific order.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">1.9 Governing Law &amp; Judicial Jurisdiction</h3>
                <p className="mt-1">
                  These Terms are governed by and construed in accordance with the laws of India. Any disputes or claims arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the Courts in Bengaluru, Karnataka.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY & PRIVACY */}
        {activeTab === "privacy" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <div>
              <span className="bg-blue-50 text-blue-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase border border-blue-200">Data Governance</span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">2. Security &amp; Data Privacy Framework</h2>
              <p className="text-gray-500 mt-1">Botmartz enforces end-to-end 256-bit encryption and strict ISO/IEC 27001 data protection protocols.</p>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">2.1 PCI-DSS Level 1 Encrypted Payment Security</h3>
                <p className="mt-1">
                  Botmartz Technologies does not store raw credit/debit card numbers, CVV codes, bank passwords, or UPI PINs on its servers. All financial transactions are tokenized and processed through RBI-regulated, PCI-DSS Level 1 compliant gateway infrastructure managed by Razorpay Software Pvt Ltd.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">2.2 Personal Data Collected &amp; Purpose of Processing</h3>
                <p className="mt-1">
                  We collect user data (Full Name, Phone Number, Delivery Address, Pincode, Email Address) strictly for the following purposes:
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-gray-600">
                  <li>Processing, packing, and dispatching physical orders via courier partners.</li>
                  <li>Generating GST tax invoices and legally required shipping waybills (AWB).</li>
                  <li>Sending real-time order status, tracking updates, and OTP authentication alerts.</li>
                  <li>Processing refunds, wallet credits, and return requests.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">2.3 Zero Third-Party Data Selling Guarantee</h3>
                <p className="mt-1">
                  We guarantee <strong>100% confidentiality</strong>. Botmartz never sells, rents, leases, or trades user contact details or purchasing history to third-party telemarketers, data brokers, or external advertising networks.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">2.4 Browser Cookies &amp; Local Storage Usage</h3>
                <p className="mt-1">
                  Our web application utilizes minimal browser localStorage and secure HTTP session cookies exclusively to remember your login session, shopping cart items, and wishlist selections. No cross-site tracking cookies are deployed.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">2.5 Data Retention &amp; Right to Erasure (Account Deletion)</h3>
                <p className="mt-1">
                  Customer account data is retained for as long as the account remains active or as required by tax and accounting laws. Users can request account closure and permanent personal data erasure by emailing <a href="mailto:privacy@botmartz.com" className="text-emerald-700 font-bold hover:underline">privacy@botmartz.com</a>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GRIEVANCE REDRESSAL */}
        {activeTab === "grievance" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <div>
              <span className="bg-amber-50 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase border border-amber-200">Statutory Redressal</span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">3. Consumer Grievance Redressal &amp; Escalation Matrix</h2>
              <p className="text-gray-500 mt-1">Formulated under Consumer Protection (E-Commerce) Rules 2020 &amp; Information Technology Act 2000.</p>
            </div>

            <hr className="border-gray-100" />

            <div className="bg-emerald-50/70 border border-emerald-200 p-6 rounded-2xl space-y-3">
              <p className="font-black text-emerald-900 text-sm">Designated Grievance Officer: Mr. Rajesh V. Nambiar</p>
              <p className="text-gray-700"><strong>Designation:</strong> Head of Legal Affairs &amp; Consumer Escalations Desk</p>
              <p className="text-gray-700"><strong>Company:</strong> Botmartz Technologies Pvt Ltd</p>
              <p className="text-gray-700"><strong>Registered Office:</strong> Plot 42, Tech Park Enclave, IT Zone, Outer Ring Road, Bengaluru, Karnataka 560103, India</p>
              <p className="text-gray-700"><strong>Direct Grievance Email:</strong> <a href="mailto:grievance@botmartz.com" className="text-emerald-700 font-bold hover:underline font-mono">grievance@botmartz.com</a></p>
              <p className="text-gray-700"><strong>Customer Support Email:</strong> <a href="mailto:support@botmartz.com" className="text-emerald-700 font-bold hover:underline font-mono">support@botmartz.com</a></p>
              <p className="text-gray-700"><strong>Toll-Free Escalation Desk:</strong> <a href="tel:18002686278" className="text-emerald-700 font-bold hover:underline">1800-BOTMARTZ (1800 268 6278)</a></p>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-extrabold text-sm text-gray-900">3.1 Three-Tier Grievance Escalation Hierarchy</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-1.5">
                  <span className="bg-gray-200 text-gray-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">Level 1</span>
                  <p className="font-bold text-gray-900">Customer Support Ticket</p>
                  <p className="text-gray-500 text-[11px]">Submit ticket at <Link href="/help" className="text-emerald-700 hover:underline font-bold">botmartz.com/help</Link> or email <span className="font-mono">support@botmartz.com</span>.</p>
                  <p className="text-emerald-700 font-bold text-[11px]">SLA: 24 Hours Response</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-1.5">
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">Level 2</span>
                  <p className="font-bold text-gray-900">Grievance Officer Review</p>
                  <p className="text-gray-500 text-[11px]">If un-resolved in Level 1, escalate directly to <span className="font-mono">grievance@botmartz.com</span>.</p>
                  <p className="text-emerald-700 font-bold text-[11px]">SLA: 48 Hours Escalation</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-1.5">
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">Level 3</span>
                  <p className="font-bold text-gray-900">Nodal Officer &amp; Legal Desk</p>
                  <p className="text-gray-500 text-[11px]">Final internal appellate authority headed by Nodal Officer &amp; Corporate Legal Council.</p>
                  <p className="text-emerald-700 font-bold text-[11px]">SLA: 15 Business Days Final Resolution</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EPR COMPLIANCE */}
        {activeTab === "epr" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <div>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase border border-emerald-200">Environmental Policy</span>
              <h2 className="text-2xl font-black text-gray-900 mt-2">4. Extended Producer Responsibility (EPR) Compliance</h2>
              <p className="text-gray-500 mt-1">Committed to e-waste management and plastic neutrality under CPCB guidelines.</p>
            </div>

            <hr className="border-gray-100" />

            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-1">
              <p className="font-bold text-emerald-900 text-xs">CPCB EPR Official Authorization Registration No:</p>
              <p className="font-mono text-emerald-700 font-black text-base">CPCB/EPR-BOTMARTZ/2026/KA</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">4.1 E-Waste Management &amp; Recycling Takeback Program</h3>
                <p className="mt-1">
                  In compliance with E-Waste (Management) Rules, 2022, Botmartz Technologies provides a free doorstep take-back and safe disposal mechanism for end-of-life electronics, charger cables, power banks, and batteries. Customers can schedule an eco-pickup by contacting <a href="mailto:recycle@botmartz.com" className="text-emerald-700 font-bold hover:underline">recycle@botmartz.com</a>.
                </p>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900">4.2 Eco-Friendly Packaging &amp; Plastic Neutrality Target</h3>
                <p className="mt-1">
                  Over 95% of Botmartz order shipping boxes and protective cushioning utilize 100% recyclable paper cardboard and biodegradable water-activated tape, drastically reducing single-use plastic waste across Indian logistics networks.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Global Footer Rendered At Bottom */}
      <Footer />
    </div>
  );
}
