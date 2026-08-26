"use client";

import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("General Settings");
  const tabs = [
    "General Settings",
    "Store Settings",
    "Payment Settings",
    "Shipping Settings",
    "Tax Settings",
    "Email Settings",
    "Notification Settings"
  ];

  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Complete Storefront Settings State
  const [settings, setSettings] = useState({
    // General Settings
    storeName: "E-COM Commerce",
    storeTagline: "India's #1 Express E-Commerce Storefront",
    currency: "INR (₹)",
    supportEmail: "support@e-com.in",
    supportPhone: "+91 98765 43210",
    storeAddress: "A-42, Tech Park, Gwalior, MP - 474001",

    // Store Settings
    maintenanceMode: false,
    guestCheckout: true,
    autoInventoryDeduct: true,
    lowStockThreshold: "5",
    defaultWarehouse: "Gwalior Central Sort Hub",

    // Payment Settings
    razorpayKey: "rzp_test_90481029841",
    razorpaySecret: "••••••••••••••••••••••••",
    upiGatewayId: "e-com@upi",
    codEnabled: true,
    maxCodLimit: "5000",

    // Shipping Settings
    shiprocketUser: "logistics@e-com.com",
    shiprocketApiKey: "••••••••••••••••••••••••",
    defaultCourier: "BlueDart Express Air",
    freeShippingThreshold: "499",
    standardShippingFee: "49",
    expressAirShippingFee: "99",

    // Tax Settings
    defaultGstRate: "18%",
    taxInclusivePrice: true,
    defaultHsnCode: "610910",
    stateGstBreakup: "SGST (9%) + CGST (9%)",

    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "notifications@e-com.in",
    adminNotifyEmail: "sachinrawat6264384464@gmail.com",
    welcomeEmailActive: true,
    orderInvoiceEmailActive: true,

    // Notification Settings
    newOrderSmsAlert: true,
    lowStockAdminPush: true,
    customerTrackingSms: true,
    whatsappAlertsActive: true
  });

  // Load persisted settings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ecom_store_settings");
        if (saved) {
          setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
      } catch (e) {}
    }
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ecom_store_settings", JSON.stringify(settings));
      } catch (e) {}
    }
    showToast(`🎉 ${activeTab} saved & synced live across storefront!`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full text-gray-900 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl border flex items-center gap-2 animate-bounce ${
          toastMessage.type === "success" 
            ? "bg-[#EAF8F2] text-[#059669] border-emerald-300" 
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-1">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <span>⚙️ Store System &amp; Global Settings</span>
        </h1>
        <p className="text-xs text-gray-500 font-medium">
          Configure global storefront parameters, Razorpay API credentials, Shiprocket logistics, Taxes &amp; Notification gateways
        </p>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === tab 
                ? "bg-emerald-600 text-white shadow-xs" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dynamic Form for Active Tab */}
      <form onSubmit={handleSave} className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-6 text-xs">
        
        {/* 1. GENERAL SETTINGS TAB */}
        {activeTab === "General Settings" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-gray-900 border-b pb-2">🏢 General Storefront Info</h2>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Storefront Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Store Tagline</label>
              <input
                type="text"
                value={settings.storeTagline}
                onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 block mb-1 font-bold">Currency Code</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>
              <div>
                <label className="text-gray-700 block mb-1 font-bold">Customer Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Registered Office Address</label>
              <input
                type="text"
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 2. STORE SETTINGS TAB */}
        {activeTab === "Store Settings" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-gray-900 border-b pb-2">🛍️ Inventory &amp; Catalog Policies</h2>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-xs">Store Maintenance Mode</p>
                <p className="text-[11px] text-gray-500">Temporarily disable storefront for visitors during site updates.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-xs">Guest Checkout</p>
                <p className="text-[11px] text-gray-500">Allow customers to place orders without registering an account.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.guestCheckout}
                onChange={(e) => setSettings({ ...settings, guestCheckout: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-xs">Automatic Inventory Deduction</p>
                <p className="text-[11px] text-gray-500">Automatically reduce product stock when an order is paid.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoInventoryDeduct}
                onChange={(e) => setSettings({ ...settings, autoInventoryDeduct: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 block mb-1 font-bold">Low Stock Alert Threshold (Units)</label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-700 block mb-1 font-bold">Primary Warehouse Location</label>
                <input
                  type="text"
                  value={settings.defaultWarehouse}
                  onChange={(e) => setSettings({ ...settings, defaultWarehouse: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. PAYMENT SETTINGS TAB */}
        {activeTab === "Payment Settings" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-gray-900 border-b pb-2">💳 Razorpay &amp; Payment Gateway Config</h2>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Razorpay Key ID</label>
              <input
                type="text"
                value={settings.razorpayKey}
                onChange={(e) => setSettings({ ...settings, razorpayKey: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Razorpay Key Secret</label>
              <input
                type="password"
                value={settings.razorpaySecret}
                onChange={(e) => setSettings({ ...settings, razorpaySecret: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Store UPI Gateway VPA ID</label>
              <input
                type="text"
                value={settings.upiGatewayId}
                onChange={(e) => setSettings({ ...settings, upiGatewayId: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-xs">Enable Cash on Delivery (COD)</p>
                <p className="text-[11px] text-gray-500">Allow customers to pay cash upon doorstep package delivery.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.codEnabled}
                onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Maximum COD Order Value Limit (₹)</label>
              <input
                type="number"
                value={settings.maxCodLimit}
                onChange={(e) => setSettings({ ...settings, maxCodLimit: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 4. SHIPPING SETTINGS TAB */}
        {activeTab === "Shipping Settings" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-gray-900 border-b pb-2">🚚 Shiprocket Logistics Integration</h2>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Shiprocket User Email</label>
              <input
                type="email"
                value={settings.shiprocketUser}
                onChange={(e) => setSettings({ ...settings, shiprocketUser: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 block mb-1 font-bold">Free Shipping Min Order Value (₹)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-700 block mb-1 font-bold">Standard Shipping Rate (₹)</label>
                <input
                  type="number"
                  value={settings.standardShippingFee}
                  onChange={(e) => setSettings({ ...settings, standardShippingFee: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Express Air Cargo Fee (₹)</label>
              <input
                type="number"
                value={settings.expressAirShippingFee}
                onChange={(e) => setSettings({ ...settings, expressAirShippingFee: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 5. TAX SETTINGS TAB */}
        {activeTab === "Tax Settings" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-gray-900 border-b pb-2">📑 GST &amp; HSN Tax Configurations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 block mb-1 font-bold">Default GST Slabs</label>
                <select
                  value={settings.defaultGstRate}
                  onChange={(e) => setSettings({ ...settings, defaultGstRate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="18%">18% Standard GST</option>
                  <option value="12%">12% Reduced GST</option>
                  <option value="5%">5% Apparel/Footwear GST</option>
                  <option value="0%">0% Exempted GST</option>
                </select>
              </div>
              <div>
                <label className="text-gray-700 block mb-1 font-bold">Default HSN Code</label>
                <input
                  type="text"
                  value={settings.defaultHsnCode}
                  onChange={(e) => setSettings({ ...settings, defaultHsnCode: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-xs">Tax Included in Product Catalog Price</p>
                <p className="text-[11px] text-gray-500">Displayed product prices already include GST taxes.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.taxInclusivePrice}
                onChange={(e) => setSettings({ ...settings, taxInclusivePrice: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 6. EMAIL SETTINGS TAB */}
        {activeTab === "Email Settings" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-gray-900 border-b pb-2">✉️ SMTP Server &amp; Email Dispatch</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 block mb-1 font-bold">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-gray-700 block mb-1 font-bold">SMTP Port</label>
                <input
                  type="text"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-700 block mb-1 font-bold">Admin Notification Recipient Email</label>
              <input
                type="email"
                value={settings.adminNotifyEmail}
                onChange={(e) => setSettings({ ...settings, adminNotifyEmail: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-xs">Send Welcome Email to New Customers</p>
                <p className="text-[11px] text-gray-500">Automatically send account creation welcome email.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.welcomeEmailActive}
                onChange={(e) => setSettings({ ...settings, welcomeEmailActive: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 7. NOTIFICATION SETTINGS TAB */}
        {activeTab === "Notification Settings" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-black text-gray-900 border-b pb-2">🔔 SMS, WhatsApp &amp; Push Alerts</h2>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-xs">New Order Instant SMS Alert</p>
                <p className="text-[11px] text-gray-500">Send instant order confirmation SMS to customer mobile.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.newOrderSmsAlert}
                onChange={(e) => setSettings({ ...settings, newOrderSmsAlert: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-xs">WhatsApp Shipment Tracking Notifications</p>
                <p className="text-[11px] text-gray-500">Send live delivery updates and AWB tracking link via WhatsApp.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappAlertsActive}
                onChange={(e) => setSettings({ ...settings, whatsappAlertsActive: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-gray-900 text-xs">Low Stock Admin Push Notifications</p>
                <p className="text-[11px] text-gray-500">Notify admin team when inventory drops below threshold.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.lowStockAdminPush}
                onChange={(e) => setSettings({ ...settings, lowStockAdminPush: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl transition shadow-md text-xs cursor-pointer mt-4"
        >
          Save System Settings
        </button>
      </form>
    </div>
  );
}
