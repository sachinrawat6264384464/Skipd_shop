"use client";

import { useState } from "react";

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("Sales Analytics");
  const tabs = ["Sales Analytics", "Revenue", "Customer Analytics", "Product Performance", "Traffic & Conversion"];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📊 Business Intelligence &amp; Analytics</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Deep analytics on conversion rates, revenue trends, top performing categories &amp; customer acquisition</p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-xl">
          Weekly Growth: +18.6% 🚀
        </span>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === tab ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-gray-500">Total Gross Sales</h3>
          <p className="text-3xl font-black text-gray-900">₹27,45,890</p>
          <p className="text-xs text-emerald-600 font-bold">↑ +18.6% from last 30 days</p>
        </div>

        <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-gray-500">Average Order Value (AOV)</h3>
          <p className="text-3xl font-black text-gray-900">₹2,205</p>
          <p className="text-xs text-emerald-600 font-bold">↑ +5.2% from last month</p>
        </div>

        <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-gray-500">Store Checkout Conversion</h3>
          <p className="text-3xl font-black text-gray-900">3.84%</p>
          <p className="text-xs text-blue-600 font-bold">Industry Top 10% benchmark</p>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-4">
        <h3 className="text-base font-black text-gray-900">🏆 Top Revenue Generating Categories</h3>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-bold text-gray-900 mb-1">
              <span>1. Tech Essentials &amp; Mobiles</span>
              <span className="text-emerald-600">₹14,50,000 (52%)</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "52%" }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-gray-900 mb-1">
              <span>2. Apparel &amp; Fashion</span>
              <span className="text-blue-600">₹7,20,000 (26%)</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "26%" }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-gray-900 mb-1">
              <span>3. Lifestyle Accessories &amp; Watches</span>
              <span className="text-amber-600 font-bold">₹5,75,890 (22%)</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: "22%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
