"use client";

import { useState } from "react";

export default function AdminEngagementPage() {
  const [activeTab, setActiveTab] = useState("Wishlist");
  const tabs = ["Wishlist", "Gift Cards", "Loyalty / SuperCoins", "Reviews & Ratings"];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">❤️ Customer Engagement &amp; Loyalty</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage customer wishlists, digital gift cards, SKIPD SuperCoins rewards &amp; product reviews</p>
        </div>
      </div>

      {/* Sub-Tabs */}
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

      {/* Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-2">
          <h4 className="font-black text-base text-gray-900">❤️ Top Wishlisted Items</h4>
          <p className="text-xs text-gray-500">1,420 users saved OnePlus Nord 6 to wishlist this week.</p>
        </div>
        <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-2">
          <h4 className="font-black text-base text-gray-900">🎁 Digital Gift Cards</h4>
          <p className="text-xs text-gray-500">₹45,000 worth of instant email gift vouchers issued.</p>
        </div>
        <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-2">
          <h4 className="font-black text-base text-gray-900">🪙 SKIPD SuperCoins Program</h4>
          <p className="text-xs text-gray-500">Earn 5 SuperCoins for every ₹100 spent on storefront.</p>
        </div>
      </div>
    </div>
  );
}
