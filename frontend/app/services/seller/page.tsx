"use client";

import { useState } from "react";
import Footer from "components/layout/footer";
import Link from "next/link";
import { submitCustomerQuery } from "lib/api";

export default function SellerPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstin: "",
    category: "apparel"
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitCustomerQuery({
        customer_name: formData.businessName || "Vendor Candidate",
        customer_email: formData.email || "seller@e-com.in",
        query_type: "Seller Application",
        subject: `New Seller Application: ${formData.businessName} (GSTIN: ${formData.gstin})`,
        message: `Business: ${formData.businessName}, Contact: ${formData.contactPerson || 'N/A'}, GSTIN: ${formData.gstin}, Mobile: ${formData.phone}`,
        priority: "High"
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ecom_new_query"));
      }
    } catch (err) {
      console.warn("Seller application DB submit error:", err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 w-full">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-8 md:p-12 shadow-lg flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="bg-white text-emerald-900 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              E-COM Marketplace Seller Portal
            </span>
            <h1 className="text-3xl md:text-5xl font-black">Sell to Millions of Customers Across India</h1>
            <p className="text-emerald-100 text-xs md:text-sm leading-relaxed">
              0% Commission for the first 30 days! Access 28,000+ pincodes with automated Shiprocket logistics pickup and 7-day payment settlements.
            </p>
          </div>

          <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-3">
            <h3 className="text-base font-black">Quick Vendor Registration</h3>
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold text-center">
                ✓ Application Submitted! Our Merchant Team will contact you within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Acme Apparels Pvt Ltd"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    required
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. 07AAAAA0000A1Z5"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none"
                    placeholder="+91 9876543210"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Start Selling &rarr;
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="text-2xl">⚡</div>
            <h4 className="font-bold text-sm text-gray-900">7-Day Payment Cycle</h4>
            <p className="text-xs text-gray-600">Automated payouts credited directly into your registered bank account.</p>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="text-2xl">🚚</div>
            <h4 className="font-bold text-sm text-gray-900">Doorstep Pickup</h4>
            <p className="text-xs text-gray-600">Shiprocket courier partners pick up orders straight from your doorstep.</p>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="text-2xl">📊</div>
            <h4 className="font-bold text-sm text-gray-900">Analytics Dashboard</h4>
            <p className="text-xs text-gray-600">Real-time inventory tracking, sales reports, and customer insights.</p>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="text-2xl">🔒</div>
            <h4 className="font-bold text-sm text-gray-900">Admin Login Portal</h4>
            <p className="text-xs text-gray-600">Access your store backend securely via <Link href="/admin/login" className="text-emerald-700 font-bold hover:underline">/admin/login</Link>.</p>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
