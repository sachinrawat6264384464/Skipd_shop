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

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);

  // Ticking Timers state for live countdowns
  const [timers, setTimers] = useState<{ [key: string]: { label: string | null; isExpired: boolean } }>({});

  // Helper to format live 24h timer (18h : 58m : 20s)
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
    if (activeSubTab.startsWith("Return Eligible")) {
      if (o.returnStatus !== "ELIGIBLE" || timers[o.id]?.isExpired) return false;
    } else if (activeSubTab.startsWith("Return Requested")) {
      if (o.returnStatus !== "REQUESTED") return false;
    } else if (activeSubTab.startsWith("Return Completed")) {
      if (o.returnStatus !== "COMPLETED") return false;
    }

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
          <div className="w-8 h-8 rounded-xl bg-[#059669] text-white font-black text-base flex items-center justify-center">S</div>
          <span className="font-black text-gray-900 text-xl tracking-tight">SKIPD</span>
        </Link>

        <div className="relative w-full max-w-md hidden md:block">
          <input
            type="text"
            placeholder="Search for products, brands and more..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
          />
          <svg className="w-4 h-4 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-4 md:gap-6 text-xs font-bold text-gray-700 overflow-x-auto w-full sm:w-auto justify-end">
          <Link href="/categories" className="hover:text-emerald-600 shrink-0">Categories ▾</Link>
          <Link href="/deals" className="hover:text-emerald-600 flex items-center gap-1 shrink-0">Deals <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">New</span></Link>
          <Link href="/bestsellers" className="hover:text-emerald-600 shrink-0">Best Sellers</Link>
          <Link href="/gift-cards" className="hover:text-emerald-600 shrink-0">Gift Cards</Link>

          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 shrink-0">
            <svg className="w-5 h-5 text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <div className="relative cursor-pointer">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1.5 -right-2 bg-[#059669] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#059669] text-white font-black text-xs flex items-center justify-center">S</div>
            <span className="font-bold text-xs">Sachin Rawat ▾</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout: Left Sidebar + Center Orders Panel + Right Return Policy Info Card */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 🖤 1. Left Account Sidebar */}
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
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="font-black text-gray-900 tracking-wide">MY ORDERS</span>
                </div>
                <span>&rsaquo;</span>
              </Link>
            </div>

            {/* ACCOUNT SETTINGS */}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-1">Account Settings</p>
              <Link href="/account?tab=profile" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile Information</span>
              </Link>
              <Link href="/account?tab=addresses" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Manage Addresses</span>
              </Link>
            </div>

            {/* PAYMENTS & WALLET */}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-1">Payments &amp; Wallet</p>
              <div className="flex justify-between items-center py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <span className="flex items-center gap-3">
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Gift Cards</span>
                </span>
                <span className="text-[#059669] font-black">₹0</span>
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Saved Cards &amp; Wallet</span>
              </div>
            </div>

            {/* MY STUFF */}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-1">My Stuff</p>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 11h.01M7 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01" />
                </svg>
                <span>My Coupons (2 Active)</span>
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Supercoins &amp; Plus Zone</span>
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>My Wishlist (2)</span>
              </div>
              <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer">
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>All Notifications</span>
              </div>

              {/* Active Green Highlighted Link */}
              <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-[#EAF8F2] text-[#059669] border border-emerald-200/80 font-black cursor-pointer">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Return Products Policy</span>
              </div>
            </div>

            {/* Logout */}
            <div className="pt-2 border-t border-gray-100">
              <button onClick={() => window.location.href = "/"} className="flex items-center gap-3 py-2 px-3 text-red-600 hover:bg-red-50 rounded-xl w-full text-left font-black cursor-pointer">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout Account</span>
              </button>
            </div>

          </div>
        </div>

        {/* 🟢 2. Center & Right Content */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Top Banner Box */}
          <div className="bg-white border border-gray-200/80 p-5 md:p-6 rounded-2xl shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium">
                <Link href="/account" className="hover:underline text-gray-600 font-bold">My Account</Link>
                <span>&rsaquo;</span>
                <span className="font-bold text-gray-900">Return Products Policy</span>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/60">
                  <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
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
              <p className="text-xs font-black text-[#059669] flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Strict 24h Policy Guarantee</span>
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
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold w-full sm:w-auto">
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
                        className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap text-xs ${
                          isSelected ? "bg-[#EAF8F2] text-[#059669] border border-emerald-200/80 font-black" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-36">
                    <input
                      type="text"
                      placeholder="Search in your orders.."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none w-full pr-7"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-700 text-xs">✕</button>
                    )}
                  </div>

                  <button
                    onClick={() => { setSearchQuery(""); setActiveSubTab("All Orders"); }}
                    className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {/* Cards List matching exact screenshot design */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white border border-gray-200/80 p-8 rounded-2xl text-center space-y-2 text-gray-500 text-xs">
                    <svg className="w-10 h-10 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
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

                        {/* Center Window Timer Box + Right Compact Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                          
                          {/* 24h Window Timer Box */}
                          <div className="text-center sm:text-right w-full sm:w-auto">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">24H RETURN WINDOW</p>
                            {isEligible ? (
                              <div className="bg-[#EAF8F2] border border-emerald-200/80 px-3 py-1.5 rounded-xl mt-0.5 space-y-0.5">
                                <p className="text-xs font-black text-[#059669] font-mono flex items-center justify-center sm:justify-end gap-1.5">
                                  <span>⏳</span>
                                  <span>{timerData.label || "Calculating..."}</span>
                                </p>
                                <p className="text-[9px] text-gray-500 font-medium">remaining</p>
                              </div>
                            ) : (
                              <div className="bg-[#FEF2F2] border border-red-200 px-3 py-1.5 rounded-xl mt-0.5 space-y-0.5">
                                <p className="text-xs font-bold text-red-600 flex items-center justify-center sm:justify-end gap-1">
                                  <span>🚫</span> Return Window Expired
                                </p>
                                <p className="text-[9px] text-gray-400 font-medium">{item.expiredText || "Expired on May 18, 2025 • 10:30 AM"}</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons (Compact, Sleek, Perfect Size) */}
                          <div className="space-y-1.5 text-center w-full sm:w-auto shrink-0">
                            {isCompleted ? (
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-xl block border border-emerald-200">
                                ✓ Return Completed
                              </span>
                            ) : isRequested ? (
                              <span className="bg-blue-100 text-blue-800 text-xs font-black px-4 py-2 rounded-xl block border border-blue-200">
                                ✓ Request Pending
                              </span>
                            ) : isEligible ? (
                              <button
                                onClick={() => setSelectedProduct(item)}
                                className="bg-[#059669] hover:bg-[#047857] text-white font-black text-xs px-4 py-2 rounded-xl transition shadow-2xs cursor-pointer w-full text-center leading-snug"
                              >
                                Return Product Now
                              </button>
                            ) : (
                              <button
                                disabled
                                className="bg-gray-100 text-gray-400 font-bold text-xs px-4 py-2 rounded-xl cursor-not-allowed w-full text-center leading-snug"
                              >
                                Return Period Expired
                              </button>
                            )}

                            <button
                              onClick={() => alert(`Order Details for ${item.id}:\nItem: ${item.productName}\nAmount: ₹${item.price}\nStatus: ${item.status}`)}
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

            {/* Right 4 Cols: Return Policy Information Card (Matching Clean SVG Icons) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-5">
                <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">Return Policy</h3>

                <div className="space-y-4 text-xs">
                  
                  {/* Point 1: 24h Window */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">24-Hour Return Window</h4>
                      <p className="text-gray-500 mt-0.5 leading-relaxed">You can raise return request within 24 hours of order delivery.</p>
                    </div>
                  </div>

                  {/* Point 2: Product Condition */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Product Condition</h4>
                      <p className="text-gray-500 mt-0.5 leading-relaxed">Items must be unused, unwashed, undamaged and in original packaging.</p>
                    </div>
                  </div>

                  {/* Point 3: Photo Required */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Photo Required</h4>
                      <p className="text-gray-500 mt-0.5 leading-relaxed">Clear photos of product and packaging are mandatory.</p>
                    </div>
                  </div>

                  {/* Point 4: Refund Process */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Refund Process</h4>
                      <p className="text-gray-500 mt-0.5 leading-relaxed">Once return is approved, refund will be processed within 3-5 business days.</p>
                    </div>
                  </div>

                </div>

                <button
                  onClick={() => alert("SKIPD 24-Hour Return Policy:\n\n1. Return window opens immediately upon delivery.\n2. Raise request with photos within 24 hours.\n3. Inspection completed within 12h.\n4. Pickup & refund processed in 3-5 days.")}
                  className="w-full border border-[#059669] text-[#059669] hover:bg-[#EAF8F2] font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Read Full Return Policy &rsaquo;
                </button>
              </div>
            </div>

          </div>

          {/* 📍 Bottom How Returns Work Timeline (Exact SVG Outline Icons + Connecting Arrows matching User Screenshot 1) */}
          <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-6">
            <h3 className="font-black text-base text-gray-900">How Returns Work?</h3>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center text-xs">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center space-y-2 flex-1">
                <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900">1. Raise Request</h4>
                  <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">Submit return request within 24 hours</p>
                </div>
              </div>

              {/* Connecting Arrow 1 */}
              <svg className="w-5 h-5 text-gray-300 hidden md:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>

              {/* Step 2 */}
              <div className="flex flex-col items-center space-y-2 flex-1">
                <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h0.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900">2. Upload Photos</h4>
                  <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">Upload clear photos of product &amp; packaging</p>
                </div>
              </div>

              {/* Connecting Arrow 2 */}
              <svg className="w-5 h-5 text-gray-300 hidden md:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>

              {/* Step 3 */}
              <div className="flex flex-col items-center space-y-2 flex-1">
                <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900">3. Review</h4>
                  <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">We will review your request</p>
                </div>
              </div>

              {/* Connecting Arrow 3 */}
              <svg className="w-5 h-5 text-gray-300 hidden md:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>

              {/* Step 4 */}
              <div className="flex flex-col items-center space-y-2 flex-1">
                <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900">4. Pickup</h4>
                  <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">We will pick up the product</p>
                </div>
              </div>

              {/* Connecting Arrow 4 */}
              <svg className="w-5 h-5 text-gray-300 hidden md:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>

              {/* Step 5 */}
              <div className="flex flex-col items-center space-y-2 flex-1">
                <div className="w-14 h-14 rounded-full bg-[#EAF8F2] text-[#059669] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900">5. Refund</h4>
                  <p className="text-[10px] text-gray-400 font-medium max-w-[130px] mt-0.5 leading-tight">Refund will be processed within 3-5 days</p>
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
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-900 text-lg font-bold cursor-pointer">✕</button>
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
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black py-2.5 rounded-xl shadow-md cursor-pointer"
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
