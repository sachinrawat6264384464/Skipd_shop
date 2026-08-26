"use client";

import { useState } from "react";
import Link from "next/link";

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "grievance" | "epr">("terms");

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Title Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-3">
          <span className="bg-emerald-400/20 text-emerald-300 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
            Consumer Protection &amp; Legal Framework
          </span>
          <h1 className="text-3xl sm:text-4xl font-black">E-COM Consumer Policies</h1>
          <p className="text-xs text-gray-300 font-medium">Last Updated: August 18, 2026 &bull; Compliant with IT Act 2000 &amp; Consumer Protection Rules</p>
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
              Welcome to <strong>E-COM Commerce Pvt Ltd</strong> (&quot;E-COM&quot;, &quot;we&quot;, &quot;our&quot;). By accessing, browsing, or registering an account on www.e-com.in or using our APIs and mobile portals, you agree to bound by these terms.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">1.1 Customer Account &amp; Security</h3>
            <p>
              Users are responsible for maintaining the confidentiality of their login credentials, passwords, and OTP verification codes. Any transaction conducted through an authenticated account will be deemed performed by the account owner.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">1.2 Pricing &amp; Order Acceptance</h3>
            <p>
              All prices listed on E-COM Store are in Indian Rupees (INR) and inclusive of applicable GST taxes. We reserve the right to cancel orders arising from typographical or technical pricing glitches.
            </p>
          </div>
        )}

        {/* Tab 2: Security & Privacy */}
        {activeTab === "privacy" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">2. Security &amp; Data Privacy Policy</h2>
            <p>
              Your privacy is paramount to us. We enforce 256-bit SSL encryption and strict data isolation to ensure user information remains 100% confidential.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">2.1 PCI-DSS Level 1 Payment Processing</h3>
            <p>
              E-COM does not store or process payment card numbers or UPI PINs on its local servers. All financial transactions are handled securely via Razorpay&apos;s RBI-approved PCI-DSS Level 1 payment gateway.
            </p>

            <h3 className="font-extrabold text-sm text-gray-900 pt-2">2.2 Cookie Policy &amp; Data Usage</h3>
            <p>
              We use minimal browser localStorage and cookies solely to preserve user shopping carts, active sessions, and wishlist preferences. We never sell user data to third-party data brokers.
            </p>
          </div>
        )}

        {/* Tab 3: Grievance Redressal */}
        {activeTab === "grievance" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">3. Grievance Redressal Mechanism</h2>
            <p>
              In accordance with Information Technology Act 2000 and Consumer Protection (E-Commerce) Rules 2020, the contact details of the Grievance Officer are published below:
            </p>

            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-2">
              <p className="font-extrabold text-emerald-900 text-sm">Grievance Officer: Mr. Rajesh V. Nambiar</p>
              <p className="text-gray-700"><strong>Designation:</strong> Head of Consumer Escalations &amp; Legal Affairs</p>
              <p className="text-gray-700"><strong>Address:</strong> E-COM Commerce Pvt Ltd, Outer Ring Road, Embassy Tech Village, Bengaluru 560103, KA</p>
              <p className="text-gray-700"><strong>Email:</strong> grievance@e-com.in</p>
              <p className="text-gray-700"><strong>Toll-Free Phone:</strong> 1800-E-COM-COMMERCE (1800 754 733)</p>
            </div>

            <p className="text-gray-500 text-[11px]">
              Grievances are acknowledged within 24 hours and resolved within 15 working days.
            </p>
          </div>
        )}

        {/* Tab 4: EPR Compliance */}
        {activeTab === "epr" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900">4. Extended Producer Responsibility (EPR) Compliance</h2>
            <p>
              E-COM Commerce is committed to environmental sustainability under the E-Waste (Management) Rules, 2016 and Plastic Waste Management Rules, 2018.
            </p>

            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-1">
              <p className="font-bold text-emerald-900">EPR Authorization Registration No:</p>
              <p className="font-mono text-emerald-700 font-bold">CPCB/EPR-0928/2026/KA</p>
            </div>

            <p>
              Customers can deposit end-of-life electronic accessories and packaging materials at authorized collection centers or request eco-pickup during product return.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
