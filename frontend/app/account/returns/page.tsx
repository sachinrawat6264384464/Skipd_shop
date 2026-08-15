"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserReturnsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("All Orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Return Form State
  const [reason, setReason] = useState("Damaged Item Received");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [photoUploaded, setPhotoUploaded] = useState(false);

  // Orders State (Stored in localStorage or initial demo state)
  const [orders, setOrders] = useState<any[]>([]);

  // Ticking Timers state for live countdowns
  const [timers, setTimers] = useState<{ [key: string]: { label: string | null; isExpired: boolean } }>({});

  // Helper to format live 24h timer (18h : 59m : 56s)
  const calculateTimer = (orderTimestamp: number) => {
    const windowEnd = orderTimestamp + 24 * 3600 * 1000;
    const diff = windowEnd - Date.now();
    if (diff <= 0) return { label: null, isExpired: true };

    const hours = Math.floor(diff / (3600 * 1000));
    const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      label: `${hours}h : ${pad(minutes)}m : ${pad(seconds)}s`,
      isExpired: false
    };
  };

  useEffect(() => {
    setMounted(true);

    // Load persisted orders or initialize demo orders
    const savedOrders = localStorage.getItem("skipd_user_return_orders");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
        return;
      } catch (e) {}
    }

    const now = Date.now();
    const initialOrders = [
      {
        id: "#SKIPD-28579",
        productName: "OnePlus Nord 4 5G",
        specs: "Obsidian Midnight, 8GB RAM, 256GB Storage",
        price: 24499,
        deliveredDate: "Delivered on May 17, 2025",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
        orderTimestamp: now - 3600 * 1000 * 5, // 5 hours ago (19h left)
        status: "DELIVERED",
        returnStatus: "ELIGIBLE", // ELIGIBLE, REQUESTED, COMPLETED, EXPIRED
        expiredText: null
      },
      {
        id: "#SKIPD-28578",
        productName: "Saree Premium Silk",
        specs: "Pure Mulberry Kanjivaram Silk, Gold Zari",
        price: 598,
        deliveredDate: "Delivered on May 17, 2025",
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
        orderTimestamp: now - 3600 * 1000 * 20, // 20 hours ago (4h left)
        status: "DELIVERED",
        returnStatus: "ELIGIBLE",
        expiredText: null
      },
      {
        id: "#SKIPD-28577",
        productName: "20000mAh Power Bank",
        specs: "22.5W Fast Charging, Dual USB Output",
        price: 999,
        deliveredDate: "Delivered on May 17, 2025",
        image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=300",
        orderTimestamp: now - 3600 * 1000 * 30, // 30 hours ago (Expired)
        status: "DELIVERED",
        returnStatus: "EXPIRED",
        expiredText: "Expired on May 18, 2025 • 10:30 AM"
      }
    ];
    setOrders(initialOrders);
    localStorage.setItem("skipd_user_return_orders", JSON.stringify(initialOrders));
  }, []);

  // ⏰ Live ticking interval every second
  useEffect(() => {
    if (!mounted || orders.length === 0) return;

    const updateTimers = () => {
      const newTimers: { [key: string]: { label: string | null; isExpired: boolean } } = {};
      orders.forEach(o => {
        newTimers[o.id] = calculateTimer(o.orderTimestamp);
      });
      setTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [mounted, orders]);

  // Save changes to localStorage
  const saveOrders = (updated: any[]) => {
    setOrders(updated);
    localStorage.setItem("skipd_user_return_orders", JSON.stringify(updated));
  };

  // Submit return form
  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const queryId = `Q-${Math.floor(10000 + Math.random() * 90000)}`;
    const updated = orders.map(o => o.id === selectedProduct.id ? { ...o, returnStatus: "REQUESTED", queryId } : o);
    saveOrders(updated);

    alert(`✓ Return query #${queryId} submitted successfully! Our support team will review within 12 hours.`);
    setSelectedProduct(null);
    setPhotoUploaded(false);
    setDescription("");
  };

  // Dynamic counts for sub-tabs
  const eligibleCount = orders.filter(o => o.returnStatus === "ELIGIBLE" && !timers[o.id]?.isExpired).length;
  const requestedCount = orders.filter(o => o.returnStatus === "REQUESTED").length;
  const completedCount = orders.filter(o => o.returnStatus === "COMPLETED").length;

  // Filtered orders list based on active sub-tab and search query
  const filteredOrders = orders.filter(o => {
    // 1. Sub-tab filter
    if (activeSubTab === "Return Eligible (3)" || activeSubTab === "Return Eligible") {
      if (o.returnStatus !== "ELIGIBLE" || timers[o.id]?.isExpired) return false;
    } else if (activeSubTab === "Return Requested (1)" || activeSubTab === "Return Requested") {
      if (o.returnStatus !== "REQUESTED") return false;
    } else if (activeSubTab === "Return Completed (2)" || activeSubTab === "Return Completed") {
      if (o.returnStatus !== "COMPLETED") return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.productName.toLowerCase().includes(q);
      const matchSpecs = o.specs ? o.specs.toLowerCase().includes(q) : false;
      return matchId || matchName || matchSpecs;
    }

    return true;
  });

  if (!mounted) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-10 px-4 flex items-center justify-center font-sans text-gray-400">
        Loading 24h return products policy...
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-6 px-4 md:px-8 font-sans text-gray-900">
      
      {/* 🏷️ Top Navbar */}
      <header className="bg-white border border-gray-200/80 px-4 md:px-6 py-3.5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl shadow-2xs">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-base flex items-center justify-center">S</div>
          <span className="font-black text-gray-900 text-xl tracking-tight">SKIPD</span>
        </Link>

        <div className="relative w-full max-w-md hidden md:block">
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
          />
          <span className="absolute right-3 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-4 md:gap-6 text-xs font-bold text-gray-700 overflow-x-auto w-full sm:w-auto justify-end">
          <Link href="/categories" className="hover:text-emerald-600 shrink-0">Categories ▾</Link>
          <Link href="/deals" className="hover:text-emerald-600 flex items-center gap-1 shrink-0">Deals <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">New</span></Link>
          <Link href="/bestsellers" className="hover:text-emerald-600 shrink-0">Best Sellers</Link>
          <Link href="/gift-cards" className="hover:text-emerald-600 shrink-0">Gift Cards</Link>

          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 shrink-0">
            <span className="text-base cursor-pointer">🤍</span>
            <span className="text-base cursor-pointer relative">🛒<span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">2</span></span>
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">S</div>
            <span className="font-bold text-xs">Sachin Rawat ▾</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout: Left Sidebar + Center Orders Panel + Right Return Policy Info Card */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 🖤 1. Left Account Sidebar (Exact Match with Reference Screenshot) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* User Badge */}
          <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#059669] text-white font-black text-lg flex items-center justify-center shadow-xs">
              S
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hello,</p>
              <p className="font-extrabold text-gray-900 text-sm leading-tight">Sachin Rawat</p>
              <p className="text-[11px] text-gray-400 truncate max-w-[140px]">sachin.rawat@email.com</p>
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-3 shadow-2xs space-y-4 text-xs font-bold text-gray-700">
            
            {/* MY ORDERS */}
            <div>
              <Link href="/account?tab=orders" className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-base">📦</span>
                  <span className="font-black text-gray-900 tracking-wide">MY ORDERS</span>
                </div>
                <span>&rsaquo;</span>
              </Link>
            </div>

            {/* ACCOUNT SETTINGS */}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-1">Account Settings</p>
              <Link href="/account?tab=profile" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50">
                <span>👤</span> Profile Information
              </Link>
              <Link href="/account?tab=addresses" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50">
                <span>📍</span> Manage Addresses
              </Link>
            </div>

            {/* PAYMENTS & WALLET */}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-1">Payments &amp; Wallet</p>
              <div className="flex justify-between items-center py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <span className="flex items-center gap-3"><span>💳</span> Gift Cards</span>
                <span className="text-emerald-600 font-black">₹0</span>
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <span>🏦</span> Saved Cards &amp; Wallet
              </div>
            </div>

            {/* MY STUFF */}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-1">My Stuff</p>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <span>🎟️</span> My Coupons (2 Active)
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <span>⚡</span> Supercoins &amp; Plus Zone
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <span>🤍</span> My Wishlist (2)
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <span>🔔</span> All Notifications
              </div>

              {/* Active Green Highlighted Link (Exact Screenshot Replica) */}
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-[#EAF8F2] text-[#059669] border border-emerald-200/80 font-black cursor-pointer">
                <span>♻️</span> Return Products Policy
              </div>
            </div>

            {/* Logout */}
            <div className="pt-2 border-t border-gray-100">
              <button onClick={() => window.location.href = "/"} className="flex items-center gap-3 py-2 px-3 text-red-600 hover:bg-red-50 rounded-xl w-full text-left font-black cursor-pointer">
                <span>🚪</span> Logout Account
              </button>
            </div>

          </div>
        </div>

        {/* 🟢 2. Center & Right Content (Exact Match with Reference Screenshot) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top Banner Box */}
          <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium">
                <Link href="/account" className="hover:underline text-gray-600 font-bold">My Account</Link>
                <span>&rsaquo;</span>
                <span className="font-bold text-gray-900">Return Products Policy</span>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center text-2xl shrink-0 border border-emerald-200/60">
                  📦
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900">24-Hour Express Product Return Window</h1>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Strict 24-hour return policy starts automatically upon payment completion. Submit return queries with product photos within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#EAF8F2] border border-emerald-200/80 p-3.5 rounded-2xl text-center shrink-0 w-full md:w-auto space-y-0.5">
              <p className="text-xs font-black text-[#059669] flex items-center justify-center gap-1">
                <span>🛡️</span> Strict 24h Policy Guarantee
              </p>
              <p className="text-[10px] font-bold text-gray-500">100% Refund • No Questions Asked</p>
            </div>
          </div>

          {/* Main 2 Column Row: Purchases List (8 Cols) + Return Policy Card (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Cols: Purchases & Eligibility */}
            <div className="lg:col-span-8 space-y-4">
              <h3 className="font-black text-base text-gray-900">Your Recent Purchases &amp; Eligibility</h3>

              {/* Sub-Filter Tabs Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold w-full sm:w-auto">
                  {[
                    { label: "All Orders", count: orders.length },
                    { label: `Return Eligible (${eligibleCount})`, tabKey: "Return Eligible" },
                    { label: `Return Requested (${requestedCount})`, tabKey: "Return Requested" },
                    { label: `Return Completed (${completedCount})`, tabKey: "Return Completed" }
                  ].map((item) => {
                    const isSelected = activeSubTab === item.label || activeSubTab === item.tabKey;
                    return (
                      <button
                        key={item.label}
                        onClick={() => setActiveSubTab(item.tabKey || item.label)}
                        className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                          isSelected ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/80 font-black" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search in your orders.."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none w-full sm:w-36"
                  />
                  <button
                    onClick={() => { setSearchQuery(""); setActiveSubTab("All Orders"); }}
                    className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    🌪️ Filters
                  </button>
                </div>
              </div>

              {/* Cards List matching exact screenshot design */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white border border-gray-200/80 p-8 rounded-2xl text-center space-y-2 text-gray-500 text-xs">
                    <p className="text-2xl">📦</p>
                    <p className="font-bold text-gray-800">No matching orders found</p>
                    <p>Try changing your filter tabs or search query.</p>
                  </div>
                ) : (
                  filteredOrders.map((item) => {
                    const timerData = timers[item.id] || calculateTimer(item.orderTimestamp);
                    const isExpired = timerData.isExpired || item.returnStatus === "EXPIRED";
                    const isEligible = item.returnStatus === "ELIGIBLE" && !isExpired;
                    const isRequested = item.returnStatus === "REQUESTED";
                    const isCompleted = item.returnStatus === "COMPLETED";

                    return (
                      <div key={item.id} className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        
                        {/* Product Image & Info */}
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.productName}
                            onError={(e: any) => {
                              e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";
                            }}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold font-mono text-gray-500">Order ID: {item.id}</span>
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.2 rounded uppercase">
                                {item.status}
                              </span>
                            </div>
                            <h4 className="font-black text-gray-900 text-sm leading-tight">{item.productName}</h4>
                            <p className="font-black text-gray-900 text-sm">₹{item.price.toLocaleString("en-IN")}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{item.deliveredDate}</p>
                          </div>
                        </div>

                        {/* Center Window Timer Box + Right Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                          
                          {/* 24h Window Timer Box */}
                          <div className="text-center sm:text-right w-full sm:w-auto">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">24H RETURN WINDOW</p>
                            {isEligible ? (
                              <div className="bg-[#EAF8F2] border border-emerald-200/80 px-3 py-1.5 rounded-xl mt-0.5 space-y-0.5">
                                <p className="text-xs font-black text-[#059669] font-mono flex items-center justify-center sm:justify-end gap-1">
                                  ⏳ {timerData.label || "Calculating..."}
                                </p>
                                <p className="text-[9px] text-gray-500 font-medium">remaining</p>
                              </div>
                            ) : (
                              <div className="bg-[#FEF2F2] border border-red-200 px-3 py-1.5 rounded-xl mt-0.5 space-y-0.5">
                                <p className="text-xs font-bold text-red-600 flex items-center justify-center sm:justify-end gap-1">
                                  🚫 Return Window Expired
                                </p>
                                <p className="text-[9px] text-gray-400 font-medium">{item.expiredText || "Expired on May 18, 2025 • 10:30 AM"}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-1.5 text-center w-full sm:w-auto">
                            {isCompleted ? (
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2.5 rounded-xl block">
                                ✓ Return Completed
                              </span>
                            ) : isRequested ? (
                              <span className="bg-blue-100 text-blue-800 text-xs font-black px-4 py-2.5 rounded-xl block">
                                ✓ Request Pending
                              </span>
                            ) : isEligible ? (
                              <button
                                onClick={() => setSelectedProduct(item)}
                                className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer w-full"
                              >
                                Return Product Now
                              </button>
                            ) : (
                              <button
                                disabled
                                className="bg-gray-100 text-gray-400 font-bold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed w-full"
                              >
                                Return Period Expired
                              </button>
                            )}

                            <button
                              onClick={() => alert(`Order details for ${item.id}:\nItem: ${item.productName}\nAmount: ₹${item.price}\nStatus: ${item.status}`)}
                              className="text-[11px] font-bold text-gray-500 hover:text-gray-900 block w-full text-center cursor-pointer"
                            >
                              View Order Details &rsaquo;
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right 4 Cols: Return Policy Information Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-5">
                <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">Return Policy</h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold shrink-0">🕒</span>
                    <div>
                      <h4 className="font-bold text-gray-900">24-Hour Return Window</h4>
                      <p className="text-gray-500 mt-0.5">You can raise return request within 24 hours of order delivery.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold shrink-0">📦</span>
                    <div>
                      <h4 className="font-bold text-gray-900">Product Condition</h4>
                      <p className="text-gray-500 mt-0.5">Items must be unused, unwashed, undamaged and in original packaging.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold shrink-0">📷</span>
                    <div>
                      <h4 className="font-bold text-gray-900">Photo Required</h4>
                      <p className="text-gray-500 mt-0.5">Clear photos of product and packaging are mandatory.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-bold shrink-0">💳</span>
                    <div>
                      <h4 className="font-bold text-gray-900">Refund Process</h4>
                      <p className="text-gray-500 mt-0.5">Once return is approved, refund will be processed within 3-5 business days.</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert("SKIPD 24-Hour Return Policy:\n\n1. Return window opens immediately upon delivery/payment.\n2. Customer has 24 hours to initiate return query with photo proof.\n3. Inspection team reviews within 12 hours.\n4. Instant pickup & refund initiated within 3-5 days.")}
                  className="w-full border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Read Full Return Policy &rsaquo;
                </button>
              </div>
            </div>

          </div>

          {/* Bottom How Returns Work Timeline Bar (5 Steps matching Screenshot) */}
          <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-4">
            <h3 className="font-black text-base text-gray-900">How Returns Work?</h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-xs">
              
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center text-xl font-bold border border-emerald-200/60">
                  📦
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">1. Raise Request</h4>
                  <p className="text-[10px] text-gray-400 max-w-[120px]">Submit return request within 24 hours</p>
                </div>
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center text-xl font-bold border border-emerald-200/60">
                  📷
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">2. Upload Photos</h4>
                  <p className="text-[10px] text-gray-400 max-w-[120px]">Upload clear photos of product &amp; packaging</p>
                </div>
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center text-xl font-bold border border-emerald-200/60">
                  🔍
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">3. Review</h4>
                  <p className="text-[10px] text-gray-400 max-w-[120px]">We will review your request</p>
                </div>
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center text-xl font-bold border border-emerald-200/60">
                  🚚
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">4. Pickup</h4>
                  <p className="text-[10px] text-gray-400 max-w-[120px]">We will pick up the product</p>
                </div>
              </div>

              <div className="space-y-2 flex flex-col items-center col-span-2 md:col-span-1">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center text-xl font-bold border border-emerald-200/60">
                  💳
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">5. Refund</h4>
                  <p className="text-[10px] text-gray-400 max-w-[120px]">Refund will be processed within 3-5 days</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Return Request Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">↺ Product Return Request</h3>
                <p className="text-xs text-gray-500">Order #{selectedProduct.id} • {selectedProduct.productName}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-900 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Select Return Reason *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Damaged Item Received">Damaged or Defective Item Received</option>
                  <option value="Wrong Size or Color">Wrong Size, Color or Variant Delivered</option>
                  <option value="Quality Not as Expected">Product Quality Not as Expected</option>
                  <option value="Missing Accessories">Missing Accessories or Items</option>
                  <option value="Other Issue">Other Product Query Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Upload Product Photos / Evidence *</label>
                <div
                  onClick={() => setPhotoUploaded(true)}
                  className="border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50 rounded-2xl p-4 text-center cursor-pointer transition"
                >
                  {photoUploaded ? (
                    <div className="text-[#059669] font-bold">✓ 2 Photos Uploaded Successfully (image_01.jpg, image_02.jpg)</div>
                  ) : (
                    <div className="text-gray-500 font-bold">📷 Click to upload defect photo / unboxing video</div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Explain Issue / Additional Comments *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what went wrong with the item..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Contact Phone Number for Pickup</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black py-3 rounded-xl shadow-md cursor-pointer"
                >
                  Submit Return Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
