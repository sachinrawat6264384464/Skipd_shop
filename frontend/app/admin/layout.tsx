"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Navigation Links Definition
  const navGroups = [
    {
      group: "MAIN MANAGEMENT",
      links: [
        { title: "Dashboard", href: "/admin", icon: "📊" },
        { title: "Products Catalog", href: "/admin/products", icon: "📦" },
        { title: "Orders & Fulfillment", href: "/admin/orders", icon: "🛍️", badge: "28" },
        { title: "Customers & Accounts", href: "/admin/customers", icon: "👥" },
        { title: "Analytics & Revenue", href: "/admin/analytics", icon: "📈" },
      ]
    },
    {
      group: "MARKETING & PROMOTIONS",
      links: [
        { title: "Sale Events & Offers", href: "/admin/sales", icon: "🔥", badge: "Live" },
        { title: "Hero Banners & Slider", href: "/admin/homepage", icon: "🖼️" },
        { title: "Coupons & Discounts", href: "/admin/coupons", icon: "🎟️" },
      ]
    },
    {
      group: "SYSTEM & STORE",
      links: [
        { title: "Store Settings", href: "/admin/settings", icon: "⚙️" },
      ]
    }
  ];

  return (
    <div className="bg-[#0B0F19] min-h-screen flex text-gray-100 font-sans">
      
      {/* 🖤 1. Dark Left Sidebar (Fixed / Sticky) */}
      <aside className={`w-64 bg-[#0F172A] text-gray-300 flex flex-col justify-between p-4 shrink-0 border-r border-slate-800 fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="space-y-6 overflow-y-auto pr-1">
          
          {/* Brand Logo & Mobile Close */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                S
              </span>
              <div>
                <span className="font-black text-white text-lg tracking-tight block leading-none">SKIPD ADMIN</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Enterprise OS v3.0</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white text-xs bg-slate-800 p-1.5 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Super Admin User Profile Badge */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-inner">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-md">
              SA
            </div>
            <div className="text-xs leading-tight">
              <p className="font-bold text-white truncate max-w-[120px]">Super Admin</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-bold">Online</span>
              </div>
            </div>
          </div>

          {/* Navigation Links Grouped */}
          <nav className="space-y-5 text-xs font-medium">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-[9px] uppercase font-black text-slate-500 px-3 mb-2 tracking-widest">
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
                          ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20"
                          : "hover:bg-slate-800/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{link.icon}</span>
                        <span className="text-xs">{link.title}</span>
                      </div>
                      {link.badge && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          active ? "bg-white text-emerald-700" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
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

        {/* Bottom Storefront Direct Link */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <span>🛍️</span>
              <span>View Storefront</span>
            </div>
            <span className="text-emerald-400 font-black">↗</span>
          </Link>
        </div>
      </aside>

      {/* 🤍 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#0B0F19]">
        
        {/* Top Header Bar */}
        <header className="bg-[#111827] border-b border-gray-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xl">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white text-lg bg-gray-800 p-2 rounded-xl"
            >
              ☰
            </button>

            {/* Search Input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <input
                type="text"
                placeholder="Search products, orders, customers... (Ctrl + /)"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] text-emerald-400 font-bold">FastAPI + PostgreSQL Port 5433 Connected</span>
            </div>

            <button className="relative p-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 text-gray-300 transition cursor-pointer">
              🔔
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">3</span>
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                SA
              </div>
              <div className="hidden md:block text-left">
                <p className="font-bold text-white text-xs leading-none">Super Admin</p>
                <p className="text-[10px] text-emerald-400 font-medium leading-none mt-1">Full Access</p>
              </div>
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
