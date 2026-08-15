"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
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
    alert("🎉 Store Settings saved successfully!");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full text-white">
      <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl space-y-1">
        <h1 className="text-2xl font-black text-white">⚙️ Store Configuration &amp; Settings</h1>
        <p className="text-xs text-gray-400">Configure global storefront parameters, Razorpay API credentials &amp; Shiprocket logistics</p>
      </div>

      <form onSubmit={handleSave} className="bg-[#111827] border border-gray-800 p-6 rounded-3xl space-y-5 text-xs">
        <div>
          <label className="text-gray-400 block mb-1 font-semibold">Storefront Name</label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 block mb-1 font-semibold">Currency Code</label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-gray-400 block mb-1 font-semibold">Free Shipping Min Order (₹)</label>
            <input
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <h3 className="font-black text-sm text-white">💳 Payment Gateway &amp; Logistics Integrations</h3>
          
          <div>
            <label className="text-gray-400 block mb-1 font-semibold">Razorpay Key ID</label>
            <input
              type="text"
              value={settings.razorpayKey}
              onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1 font-semibold">Shiprocket API User Account</label>
            <input
              type="text"
              value={settings.shiprocketUser}
              onChange={(e) => setSettings({ ...settings, shiprocketUser: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 text-sm cursor-pointer mt-4"
        >
          Save Store Settings
        </button>
      </form>
    </div>
  );
}
