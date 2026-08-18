"use client";

import { useState } from "react";
import Footer from "components/layout/footer";
import { submitCustomerQuery } from "lib/api";

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    brandName: "",
    contactName: "",
    email: "",
    phone: "",
    budget: "₹25,000 - ₹50,000",
    notes: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitCustomerQuery({
        customer_name: formData.contactName || formData.brandName,
        customer_email: formData.email,
        query_type: "Advertising Inquiry",
        subject: `Brand Ad Campaign Inquiry: ${formData.brandName}`,
        message: `Brand: ${formData.brandName}, Budget: ${formData.budget}, Phone: ${formData.phone}, Details: ${formData.notes}`,
        priority: "High"
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("skipd_new_query"));
      }
    } catch (err) {
      console.warn("Advertising inquiry submit error:", err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 w-full">
        
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-8 md:p-12 shadow-lg space-y-4 text-center">
          <span className="bg-white text-blue-900 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            SKIPD Advertising Solutions
          </span>
          <h1 className="text-3xl md:text-5xl font-black">Reach 5 Million+ High-Intent Shoppers</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-xs md:text-sm leading-relaxed">
            Promote your brand at the exact moment customers are browsing. Drive up to 3.5x higher conversions with native sponsored search product ads.
          </p>
        </div>

        {/* Ad Solutions & Inquiry Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-3">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                  Sponsored Search Ads
                </span>
                <h3 className="text-lg font-black text-gray-900">Top-of-Search Placements</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Display your products at the top of search result pages whenever customers search for relevant keywords.
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-3">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                  Hero Banner Showcase
                </span>
                <h3 className="text-lg font-black text-gray-900">Homepage Banner Ads</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Feature your sale events and product launches directly on our high-traffic homepage promo banners.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-3">
              <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                Performance Analytics
              </span>
              <h3 className="text-lg font-black text-gray-900">Real-Time ROAS Tracking</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Track impressions, click-through rates (CTR), orders, and Return on Ad Spend (ROAS) live in your dashboard.
              </p>
            </div>
          </div>

          {/* Right Inquiry Form */}
          <div className="md:col-span-5 bg-white border border-gray-200 p-6 md:p-8 rounded-3xl shadow-lg space-y-4">
            <h3 className="text-xl font-black text-gray-900">Launch Your Ad Campaign</h3>
            <p className="text-xs text-gray-500 font-medium">Fill out the brand partner form below to get a custom media kit and ad rate proposal.</p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-xs font-bold text-center space-y-2">
                <div className="text-2xl">🎉</div>
                <p className="text-sm font-black">Ad Inquiry Received!</p>
                <p className="font-normal text-emerald-700">Our Ad Ops team will review your proposal and respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs font-medium">
                <div>
                  <label className="font-bold block mb-1">Brand / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Nike India / OnePlus"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
                    placeholder="marketing@brand.com"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Campaign Budget Range</label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                    <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                    <option value="₹1,00,000+ Enterprise">₹1,00,000+ Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Campaign Goals / Products to Promote</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                    placeholder="Tell us about the products or seasonal sale banner you'd like to feature..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-3 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Submitting Inquiry..." : "Submit Advertising Application &rarr;"}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
      <Footer />
    </div>
  );
}
