"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General Settings");
  const tabs = ["General Settings", "Store Settings", "Payment Settings", "Shipping Settings", "Tax Settings", "Email Settings", "Notification Settings", "Security"];

  const [settings, setSettings] = useState({
    storeName: "SKIPD Commerce",
    currency: "INR (₹)",
    razorpayKey: "rzp_test_90481029841",
    shiprocketUser: "logistics@skipd.com",
    freeShippingThreshold: "999",
    autoInventoryDeduct: true
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("🎉 Settings saved successfully!");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full text-gray-900 font-sans">
      <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-1">
        <h1 className="text-2xl font-black text-gray-900">⚙️ Store System &amp; Global Settings</h1>
        <p className="text-xs text-gray-500 font-medium">Configure global storefront parameters, Razorpay API credentials, Shiprocket logistics &amp; security</p>
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

      <form onSubmit={handleSave} className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-5 text-xs">
        <div>
          <label className="text-gray-700 block mb-1 font-bold">Storefront Name</label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 block mb-1 font-bold">Currency Code</label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-gray-700 block mb-1 font-bold">Free Shipping Min Order (₹)</label>
            <input
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="font-black text-sm text-gray-900">💳 Payment Gateway &amp; Logistics Integrations</h3>
          
          <div>
            <label className="text-gray-700 block mb-1 font-bold">Razorpay Key ID</label>
            <input
              type="text"
              value={settings.razorpayKey}
              onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-mono"
            />
          </div>

          <div>
            <label className="text-gray-700 block mb-1 font-bold">Shiprocket API User Account</label>
            <input
              type="text"
              value={settings.shiprocketUser}
              onChange={(e) => setSettings({ ...settings, shiprocketUser: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl transition shadow-xs text-xs cursor-pointer mt-4"
        >
          Save System Settings
        </button>
      </form>
    </div>
  );
}
