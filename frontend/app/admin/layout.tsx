"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Header Interactive States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [unreadNotifs, setUnreadNotifs] = useState(5);
  const [unreadMsgs, setUnreadMsgs] = useState(3);
  
  const [globalQuery, setGlobalQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const token = localStorage.getItem("skipd_admin_token");
    const storedUser = localStorage.getItem("skipd_admin_user");

    if (!token) {
      setIsAdminAuthenticated(false);
      router.push("/admin/login");
    } else {
      setIsAdminAuthenticated(true);
      if (storedUser) {
        try {
          setAdminUser(JSON.parse(storedUser));
        } catch (e) {}
      }
    }
  }, [pathname, router]);

  // Keyboard shortcut Ctrl + / or Cmd + / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem("skipd_admin_token");
    localStorage.removeItem("skipd_admin_user");
    router.push("/admin/login");
  };

  const isActive = (path: string) => pathname === path;

  // Search Mock database results
  const searchResults = [
    { type: "Order", title: "#SKIPD-25879 • Amit Sharma", href: "/admin/orders", desc: "₹29,999 - Delivered" },
    { type: "Product", title: "OnePlus Nord 4 5G", href: "/admin/products", desc: "₹29,999 - Mobiles" },
    { type: "Product", title: "boAt Rockerz 450 Pro", href: "/admin/products", desc: "₹1,799 - Electronics" },
    { type: "Customer", title: "Priya Verma", href: "/admin/customers", desc: "priya.v@yahoo.com" },
    { type: "Order", title: "#SKIPD-25878 • Priya Verma", href: "/admin/orders", desc: "₹3,598 - Processing" },
    { type: "Product", title: "Nike Air Force 1 '07", href: "/admin/products", desc: "₹7,499 - Footwear" }
  ].filter(item => 
    !globalQuery.trim() || 
    item.title.toLowerCase().includes(globalQuery.toLowerCase()) || 
    item.desc.toLowerCase().includes(globalQuery.toLowerCase())
  );

  // Professional Admin Vector Icon helper
  const renderNavIcon = (path: string) => {
    switch (path) {
      case "/admin":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
      case "/admin/analytics":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      case "/admin/orders":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
      case "/admin/products":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
      case "/admin/inventory":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
      case "/admin/customers":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      case "/admin/payments":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      case "/admin/delivery":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case "/admin/sales":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
      case "/admin/engagement":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
      case "/admin/homepage":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case "/admin/tickets":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
      case "/admin/queries":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
      case "/admin/users":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
      case "/admin/settings":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>;
      case "/admin/logs":
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
      default:
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  const navGroups = [
    {
      group: "OVERVIEW",
      links: [
        { title: "Dashboard", href: "/admin" },
        { title: "Analytics", href: "/admin/analytics" },
      ]
    },
    {
      group: "COMMERCE & CATALOG",
      links: [
        { title: "Orders", href: "/admin/orders", badge: "28", badgeColor: "bg-indigo-600 text-white" },
        { title: "Products & Catalog", href: "/admin/products" },
        { title: "Inventory & Stock", href: "/admin/inventory" },
        { title: "Customers", href: "/admin/customers" },
        { title: "Payments & Finance", href: "/admin/payments" },
        { title: "Delivery & Logistics", href: "/admin/delivery" },
      ]
    },
    {
      group: "GROWTH & CONTENT",
      links: [
        { title: "Marketing & Sales", href: "/admin/sales", badge: "Live", badgeColor: "bg-orange-500 text-white" },
        { title: "Customer Engagement", href: "/admin/engagement" },
        { title: "Content & CMS", href: "/admin/homepage" },
        { title: "Support & Tickets", href: "/admin/tickets" },
        { title: "Product Queries & Returns", href: "/admin/queries", badge: "New", badgeColor: "bg-emerald-500 text-white" },
      ]
    },
    {
      group: "ADMINISTRATION",
      links: [
        { title: "Users & Roles", href: "/admin/users" },
        { title: "Store Settings", href: "/admin/settings" },
        { title: "System & Logs", href: "/admin/logs" },
      ]
    }
  ];

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isAdminAuthenticated === null) {
    return (
      <div className="bg-[#0B1329] min-h-screen flex flex-col items-center justify-center text-white text-xs font-bold font-mono space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center animate-pulse">
          S
        </div>
        <p className="animate-pulse">Authenticating Admin Credentials...</p>
      </div>
    );
  }

  if (isAdminAuthenticated === false) {
    return null;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex text-gray-900 font-sans relative">
      
      {/* 🖤 Dark Left Sidebar */}
      <aside className={`w-64 bg-[#0B1329] text-gray-300 flex flex-col justify-between p-4 shrink-0 border-r border-slate-800/80 fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="space-y-5 overflow-y-auto pr-1">
          
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                S
              </div>
              <div>
                <span className="font-black text-white text-xl tracking-tight block leading-none">SKIPD ADMIN</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Enterprise OS v3.0</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white text-xs bg-slate-800 p-1.5 rounded-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 bg-[#131E3A] rounded-2xl border border-slate-700/60 shadow-inner">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Sachin Rawat"
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B1329] absolute bottom-0 right-0"></span>
            </div>
            <div className="text-xs leading-tight">
              <p className="font-bold text-white truncate max-w-[120px]">Sachin Rawat</p>
              <p className="text-[10px] text-emerald-400 font-medium">Super Admin</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4 text-xs font-medium">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-[9px] uppercase font-black text-slate-500 px-3 mb-1.5 tracking-widest">
                  {group.group}
                </p>
                {group.links.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition duration-150 ${
                        active
                          ? "bg-emerald-600/90 text-white font-bold shadow-lg shadow-emerald-600/20"
                          : "hover:bg-slate-800/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={active ? "text-white" : "text-slate-400"}>{renderNavIcon(link.href)}</span>
                        <span className="text-xs">{link.title}</span>
                      </div>
                      {link.badge && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${link.badgeColor || "bg-indigo-600 text-white"}`}>
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

        </div>

        {/* Footer Storefront Direct Link */}
        <div className="pt-3 border-t border-slate-800/80 mt-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-300 text-xs font-bold transition group border border-slate-800"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>View Storefront</span>
            </div>
            <span className="text-emerald-400 font-black">↗</span>
          </Link>
        </div>
      </aside>

      {/* 🤍 Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FAFC]">
        
        {/* 🔍 Top Header Bar with Live Interactive Dropdowns */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
          
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 text-lg bg-gray-100 p-2 rounded-xl"
            >
              ☰
            </button>

            {/* Global Search Input Bar (Working Ctrl + /) */}
            <div className="relative w-full max-w-md hidden sm:block">
              <input
                ref={searchInputRef}
                type="text"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="Search orders, products, customers, transactions... (Ctrl + /)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none transition shadow-2xs"
              />

              {/* Live Search Results Card */}
              {globalQuery.trim() !== "" && (
                <div className="absolute top-11 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
                  <p className="text-[10px] uppercase font-black text-gray-400 px-3 py-1">Live Search Results ({searchResults.length})</p>
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 font-medium">No matching items found for "{globalQuery}"</div>
                  ) : (
                    searchResults.map((res, idx) => (
                      <Link
                        key={idx}
                        href={res.href}
                        onClick={() => setGlobalQuery("")}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 transition cursor-pointer text-xs group"
                      >
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-emerald-700">{res.title}</p>
                          <p className="text-[10px] text-gray-400 font-medium">{res.desc}</p>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase">{res.type}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Top Right Controls (Notifications + Messages + Admin Profile Dropdown) */}
          <div className="flex items-center gap-3 text-xs relative">
            
            {/* 🔔 Notifications Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                  setShowProfileMenu(false);
                }}
                className="relative p-2.5 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                title="Notifications"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Notifications Floating Card */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h4 className="font-black text-gray-900 text-xs">Notifications ({unreadNotifs})</h4>
                    <button
                      onClick={() => setUnreadNotifs(0)}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <Link
                      href="/admin/orders"
                      onClick={() => {
                        setShowNotifications(false);
                        setUnreadNotifs(prev => Math.max(0, prev - 1));
                      }}
                      className="block p-2 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl border border-emerald-100 transition cursor-pointer"
                    >
                      <p className="font-bold text-emerald-900 text-[11px]">🛒 New Order Received</p>
                      <p className="text-[10px] text-emerald-700">Order #SKIPD-25879 for ₹29,999 placed by Amit Sharma</p>
                    </Link>

                    <Link
                      href="/admin/inventory"
                      onClick={() => {
                        setShowNotifications(false);
                        setUnreadNotifs(prev => Math.max(0, prev - 1));
                      }}
                      className="block p-2 bg-amber-50 hover:bg-amber-100/80 rounded-xl border border-amber-100 transition cursor-pointer"
                    >
                      <p className="font-bold text-amber-900 text-[11px]">⚠️ Low Stock Alert</p>
                      <p className="text-[10px] text-amber-700">iPhone 15 Pro Max has only 8 units left in inventory</p>
                    </Link>

                    <Link
                      href="/admin/queries"
                      onClick={() => {
                        setShowNotifications(false);
                        setUnreadNotifs(prev => Math.max(0, prev - 1));
                      }}
                      className="block p-2 bg-blue-50 hover:bg-blue-100/80 rounded-xl border border-blue-100 transition cursor-pointer"
                    >
                      <p className="font-bold text-blue-900 text-[11px]">↺ Return Requested</p>
                      <p className="text-[10px] text-blue-700">Order RET-90481 item return initiated by Ananya Roy</p>
                    </Link>

                    <Link
                      href="/admin/sales"
                      onClick={() => {
                        setShowNotifications(false);
                        setUnreadNotifs(prev => Math.max(0, prev - 1));
                      }}
                      className="block p-2 bg-purple-50 hover:bg-purple-100/80 rounded-xl border border-purple-100 transition cursor-pointer"
                    >
                      <p className="font-bold text-purple-900 text-[11px]">⚡ Flash Sale Active</p>
                      <p className="text-[10px] text-purple-700">Weekend Sale is live with 42 items</p>
                    </Link>
                  </div>

                  <Link
                    href="/admin/logs"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-[11px] font-bold text-gray-500 hover:text-gray-900 pt-2 border-t border-gray-100"
                  >
                    View All Audit Logs &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* ✉️ Messages Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
                className="relative p-2.5 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                title="Messages"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {unreadMsgs > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {unreadMsgs}
                  </span>
                )}
              </button>

              {/* Customer Messages Floating Card */}
              {showMessages && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h4 className="font-black text-gray-900 text-xs">Customer Messages ({unreadMsgs})</h4>
                    <button
                      onClick={() => setUnreadMsgs(0)}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <Link
                      href="/admin/tickets"
                      onClick={() => {
                        setShowMessages(false);
                        setUnreadMsgs(prev => Math.max(0, prev - 1));
                      }}
                      className="block p-2 hover:bg-emerald-50 rounded-xl transition border border-gray-100 cursor-pointer"
                    >
                      <p className="font-bold text-gray-900 text-[11px]">💬 Amit Sharma</p>
                      <p className="text-[10px] text-gray-500 truncate">"When will my order SR-8849201 be delivered?"</p>
                    </Link>

                    <Link
                      href="/admin/tickets"
                      onClick={() => {
                        setShowMessages(false);
                        setUnreadMsgs(prev => Math.max(0, prev - 1));
                      }}
                      className="block p-2 hover:bg-emerald-50 rounded-xl transition border border-gray-100 cursor-pointer"
                    >
                      <p className="font-bold text-gray-900 text-[11px]">💬 Priya Verma</p>
                      <p className="text-[10px] text-gray-500 truncate">"Can I change my delivery address for #SKIPD-25878?"</p>
                    </Link>

                    <Link
                      href="/admin/tickets"
                      onClick={() => {
                        setShowMessages(false);
                        setUnreadMsgs(prev => Math.max(0, prev - 1));
                      }}
                      className="block p-2 hover:bg-emerald-50 rounded-xl transition border border-gray-100 cursor-pointer"
                    >
                      <p className="font-bold text-gray-900 text-[11px]">💬 Rahul Singh</p>
                      <p className="text-[10px] text-gray-500 truncate">"Invoice download assistance for Noise Watch"</p>
                    </Link>
                  </div>

                  <Link
                    href="/admin/tickets"
                    onClick={() => setShowMessages(false)}
                    className="block text-center text-[11px] font-bold text-gray-500 hover:text-gray-900 pt-2 border-t border-gray-100"
                  >
                    Manage Customer Support Tickets &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* 👤 Super Admin Profile Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                  setShowMessages(false);
                }}
                className="flex items-center gap-2.5 pl-3 border-l border-gray-200 cursor-pointer hover:opacity-90 transition"
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Sachin Rawat"
                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                />
                <div className="hidden md:block text-left">
                  <p className="font-bold text-gray-900 text-xs leading-none">Sachin Rawat</p>
                  <p className="text-[10px] text-gray-400 font-medium leading-none mt-1">Super Admin ▾</p>
                </div>
              </button>

              {/* Profile Dropdown Floating Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-60 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="font-black text-gray-900">Sachin Rawat</p>
                    <p className="text-[10px] text-emerald-600 font-bold">admin@skipd.in (Super Admin)</p>
                  </div>

                  <Link
                    href="/"
                    target="_blank"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 transition"
                  >
                    <span>↗ View Live Storefront</span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                  >
                    <span>⚙️ Store System Settings</span>
                  </Link>

                  <Link
                    href="/admin/logs"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                  >
                    <span>🔐 Audit &amp; Security Logs</span>
                  </Link>

                  <div className="pt-1 border-t border-gray-100 mt-1">
                    <button
                      onClick={handleAdminLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition flex items-center justify-between cursor-pointer"
                    >
                      <span>🚪 Sign Out Admin</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}
