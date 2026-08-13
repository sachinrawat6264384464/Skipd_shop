"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [user, setUser] = useState<{ user_name: string; email: string; phone?: string; gender?: string }>({
    user_name: "Sachin Rawat",
    email: "sachin.rawat@example.com",
    phone: "+91 6264384464",
    gender: "Male"
  });

  const [firstName, setFirstName] = useState("Sachin");
  const [lastName, setLastName] = useState("Rawat");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("skipd_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        const nameParts = (parsed.user_name || "Sachin Rawat").split(" ");
        setFirstName(nameParts[0] || "Sachin");
        setLastName(nameParts.slice(1).join(" ") || "Rawat");
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("skipd_token");
    localStorage.removeItem("skipd_user");
    window.location.href = "/auth/login";
  };

  const orders = [
    {
      id: "SKIPD-984201",
      date: "12 Aug 2026",
      items: "Minimalist Oversized Graphic Tee (Size M)",
      total: 1299.0,
      status: "SHIPPED",
      awb: "SR-AWB-984201"
    },
    {
      id: "SKIPD-842915",
      date: "05 Aug 2026",
      items: "Active ANC Wireless Headphones",
      total: 4999.0,
      status: "DELIVERED",
      awb: "SR-AWB-842915"
    }
  ];

  const addresses = [
    {
      id: 1,
      name: "Sachin Rawat",
      phone: "+91 6264384464",
      type: "HOME",
      address: "Outer Ring Road, Devarabeesanahalli Village, Bengaluru, Karnataka 560103"
    }
  ];

  const coupons = [
    { code: "SKIPD250", discount: "₹250 OFF", minOrder: "Min order ₹1,499", expiry: "Valid till 31 Aug 2026" },
    { code: "FREEDOM50", discount: "50% OFF", minOrder: "Min order ₹999", expiry: "Valid till 25 Aug 2026" }
  ];

  const wishlist = [
    { id: 1, title: "Minimalist Oversized Graphic Tee", price: 1299, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500", handle: "minimalist-graphic-tee" },
    { id: 2, title: "Matte Black Chrono Leather Watch", price: 3499, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", handle: "matte-black-chrono-watch" }
  ];

  const notifications = [
    { id: 1, title: "Shipment Dispatched", text: "Your order SKIPD-984201 is on its way via BlueDart Courier.", time: "2 hours ago" },
    { id: 2, title: "Supercoins Credited", text: "250 Supercoins added to your wallet.", time: "1 day ago" }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* 📌 Left Sidebar (Flipkart Profile Style - Light Mode) */}
        <div className="space-y-4 lg:col-span-1">
          
          {/* Hello User Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-xs">
              {user.user_name[0] || "S"}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Hello,</p>
              <p className="font-black text-base text-gray-900">{user.user_name}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 divide-y divide-gray-100 space-y-3 text-xs shadow-xs">
            
            {/* MY ORDERS */}
            <div className="pt-1">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center justify-between font-extrabold py-2.5 px-3.5 rounded-xl transition cursor-pointer ${
                  activeTab === "orders" ? "bg-gray-900 text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">📦</span>
                  <span>MY ORDERS</span>
                </div>
                <span>&rsaquo;</span>
              </button>
            </div>

            {/* ACCOUNT SETTINGS */}
            <div className="pt-3 space-y-1">
              <p className="font-bold text-gray-400 px-3.5 uppercase text-[10px] tracking-wider mb-1">
                Account Settings
              </p>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left py-2 px-3.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === "profile" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left py-2 px-3.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === "addresses" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Manage Addresses
              </button>
            </div>

            {/* PAYMENTS & WALLET */}
            <div className="pt-3 space-y-1">
              <p className="font-bold text-gray-400 px-3.5 uppercase text-[10px] tracking-wider mb-1">
                Payments &amp; Wallet
              </p>
              <button
                onClick={() => setActiveTab("gift-cards")}
                className={`w-full flex justify-between items-center py-2 px-3.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === "gift-cards" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span>Gift Cards</span>
                <span className="text-emerald-700 font-extrabold">₹0</span>
              </button>
              <button
                onClick={() => setActiveTab("wallet")}
                className={`w-full text-left py-2 px-3.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === "wallet" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Saved Cards &amp; Wallet
              </button>
            </div>

            {/* MY STUFF */}
            <div className="pt-3 space-y-1">
              <p className="font-bold text-gray-400 px-3.5 uppercase text-[10px] tracking-wider mb-1">
                My Stuff
              </p>
              <button
                onClick={() => setActiveTab("coupons")}
                className={`w-full text-left py-2 px-3.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === "coupons" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Coupons (2 Active)
              </button>
              <button
                onClick={() => setActiveTab("supercoin")}
                className={`w-full text-left py-2 px-3.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === "supercoin" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Supercoins &amp; Plus Zone
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full text-left py-2 px-3.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === "wishlist" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                My Wishlist ({wishlist.length})
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left py-2 px-3.5 rounded-xl font-bold transition cursor-pointer ${
                  activeTab === "notifications" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                All Notifications
              </button>
            </div>

            {/* LOGOUT */}
            <div className="pt-3">
              <button
                onClick={handleLogout}
                className="w-full text-left py-2.5 px-3.5 rounded-xl font-black text-red-600 hover:bg-red-50 transition flex items-center gap-2 cursor-pointer"
              >
                <span>🚪</span>
                <span>Logout Account</span>
              </button>
            </div>

          </div>
        </div>

        {/* 📄 Right Main Content Panel (Light Mode) */}
        <div className="lg:col-span-3 space-y-6">

          {/* TAB 1: PROFILE INFORMATION */}
          {activeTab === "profile" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 space-y-8 shadow-xs">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-black text-gray-900">Personal Information</h3>
                  <button
                    onClick={() => setIsEditingName(!isEditingName)}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {isEditingName ? "Save" : "Edit"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl text-xs">
                  <div>
                    <label className="text-gray-600 block mb-1 font-semibold">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      disabled={!isEditingName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 disabled:opacity-70"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 block mb-1 font-semibold">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      disabled={!isEditingName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-gray-600 text-xs block mb-2 font-semibold">Your Gender</label>
                  <div className="flex gap-6 text-xs text-gray-800 font-medium">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" defaultChecked className="accent-emerald-600" />
                      <span>Male</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" className="accent-emerald-600" />
                      <span>Female</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-lg font-black text-gray-900">Email Address</h3>
                  <button
                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {isEditingEmail ? "Save" : "Edit"}
                  </button>
                </div>
                <div className="max-w-md text-xs">
                  <input
                    type="email"
                    value={user.email}
                    disabled={!isEditingEmail}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 disabled:opacity-70"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-lg font-black text-gray-900">Mobile Number</h3>
                  <button
                    onClick={() => setIsEditingPhone(!isEditingPhone)}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    {isEditingPhone ? "Save" : "Edit"}
                  </button>
                </div>
                <div className="max-w-md text-xs">
                  <input
                    type="text"
                    value={user.phone || "+91 6264384464"}
                    disabled={!isEditingPhone}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 disabled:opacity-70"
                  />
                </div>
              </div>

              {/* FAQs */}
              <div className="pt-8 border-t border-gray-100 text-xs text-gray-600 space-y-3">
                <h4 className="font-black text-sm text-gray-900">FAQs</h4>
                <div>
                  <p className="font-bold text-gray-800">What happens when I update my email address (or mobile number)?</p>
                  <p className="mt-1 leading-relaxed">
                    Your login email id (or mobile number) changes automatically. You'll receive all your order update notifications on the new email address.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900">My Order History</h3>
                <span className="text-xs text-emerald-700 font-extrabold">{orders.length} Active Orders</span>
              </div>
              <div className="divide-y divide-gray-100">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-gray-900">{ord.id}</span>
                        <span className="px-2.5 py-0.5 text-[10px] font-black rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium mt-1">{ord.items}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Order Date: {ord.date}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-black text-base text-gray-900">₹{ord.total.toLocaleString("en-IN")}</span>
                      <Link
                        href={`/track-order?awb=${ord.awb}`}
                        className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
                      >
                        Track Courier
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900">Manage Delivery Addresses</h3>
                <button
                  onClick={() => alert("Add address modal opened")}
                  className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                >
                  + Add New Address
                </button>
              </div>

              {addresses.map((addr) => (
                <div key={addr.id} className="bg-gray-50 border border-gray-200 p-5 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-200 text-gray-900 font-black text-[10px] px-2 py-0.5 rounded">{addr.type}</span>
                    <span className="text-emerald-700 font-bold hover:underline cursor-pointer">Edit</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{addr.name} <span className="text-gray-500 font-normal">{addr.phone}</span></p>
                  <p className="text-gray-600">{addr.address}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === "coupons" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-black text-gray-900">My Active Coupons &amp; Offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((c, i) => (
                  <div key={i} className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-black text-emerald-800 text-sm bg-white px-2.5 py-1 rounded-lg border border-emerald-300">{c.code}</span>
                      <span className="text-emerald-700 font-black">{c.discount}</span>
                    </div>
                    <p className="text-gray-700 font-bold">{c.minOrder}</p>
                    <p className="text-gray-500 text-[11px]">{c.expiry}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SUPERCOINS */}
          {activeTab === "supercoin" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl flex justify-between items-center shadow-md">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Supercoin Balance</p>
                  <p className="text-3xl font-black mt-1">🪙 250 Coins</p>
                  <p className="text-xs text-emerald-100 mt-1">1 Supercoin = ₹1 Instant Checkout Discount</p>
                </div>
                <button className="bg-white text-black font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-100 transition shadow-xs">
                  Redeem Coins
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: SAVED CARDS & WALLET */}
          {activeTab === "wallet" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-black text-gray-900">Saved Cards &amp; Razorpay Wallet</h3>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-gray-900">HDFC Bank Debit Card (•••• 4821)</p>
                  <p className="text-gray-500">Expires 09/28</p>
                </div>
                <span className="text-emerald-700 font-bold">Primary</span>
              </div>
            </div>
          )}

          {/* TAB 7: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-black text-gray-900">My Wishlist Items ({wishlist.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex gap-4 items-center">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                    <div className="flex-1">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{item.title}</h4>
                      <p className="font-black text-sm text-gray-900 mt-0.5">₹{item.price.toLocaleString("en-IN")}</p>
                      <Link href={`/product/${item.handle}`} className="text-[11px] text-emerald-700 font-bold hover:underline">
                        View Product &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: GIFT CARDS */}
          {activeTab === "gift-cards" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-black text-gray-900">Gift Cards &amp; Vouchers</h3>
              <div className="p-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl space-y-2">
                <p className="text-xs uppercase font-bold text-gray-400">SKIPD Gift Voucher Balance</p>
                <p className="text-3xl font-black">₹0.00</p>
              </div>
            </div>
          )}

          {/* TAB 9: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-black text-gray-900">All Account Notifications</h3>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">{n.title}</span>
                      <span className="text-gray-400 text-[10px]">{n.time}</span>
                    </div>
                    <p className="text-gray-600">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-gray-600">Loading Account Profile...</div>}>
      <AccountContent />
    </Suspense>
  );
}
