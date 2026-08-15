"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Sidebar Groups matching Screenshot 2 & 3
  const navGroups = [
    {
      group: "MAIN",
      links: [
        { title: "Dashboard", href: "/admin", icon: "🏠" },
        { title: "Orders", href: "/admin/orders", icon: "🛍️", badge: "24", badgeColor: "bg-emerald-500 text-white" },
        { title: "Products", href: "/admin/products", icon: "📦" },
        { title: "Customers", href: "/admin/customers", icon: "👥" },
        { title: "Inventory", href: "/admin/products", icon: "🏬" },
        { title: "Payments", href: "/admin/payments", icon: "💳" }, // 💳 Newly requested Payments Page
        { title: "SEO & Analytics", href: "/admin/analytics", icon: "📈" },
      ]
    },
    {
      group: "MARKETING",
      links: [
        { title: "Sale Events & Offers", href: "/admin/sales", icon: "🔥", badge: "Live", badgeColor: "bg-orange-500 text-white" },
        { title: "Hero Banners & Slider", href: "/admin/homepage", icon: "🖼️" },
        { title: "Coupons & Discounts", href: "/admin/coupons", icon: "🎟️" },
      ]
    },
    {
      group: "SETTINGS",
      links: [
        { title: "Store Settings", href: "/admin/settings", icon: "⚙️" },
      ]
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex text-gray-900 font-sans">
      
      {/* 🖤 1. Dark Left Sidebar (Exact Match with Reference Screenshot 2 & 3) */}
      <aside className={`w-64 bg-[#0F172A] text-gray-300 flex flex-col justify-between p-4 shrink-0 border-r border-slate-800 fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="space-y-6 overflow-y-auto pr-1">
          
          {/* Brand Logo & Collapse Icon */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                🛍️
              </div>
              <div>
                <span className="font-black text-white text-xl tracking-tight block leading-none">SKIPD</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Enterprise OS v3.0</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-400 hover:text-white text-xs bg-slate-800 p-1.5 rounded-lg cursor-pointer"
            >
              ‹
            </button>
          </div>

          {/* User Profile Badge (Sachin Rawat - Super Admin) */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-inner">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Sachin Rawat"
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0F172A] absolute bottom-0 right-0"></span>
            </div>
            <div className="text-xs leading-tight">
              <p className="font-bold text-white truncate max-w-[120px]">Sachin Rawat</p>
              <p className="text-[10px] text-emerald-400 font-medium">Super Admin</p>
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
                          ? "bg-emerald-600/90 text-white font-bold shadow-lg shadow-emerald-600/20"
                          : "hover:bg-slate-800/80 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{link.icon}</span>
                        <span className="text-xs">{link.title}</span>
                      </div>
                      {link.badge && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${link.badgeColor || "bg-emerald-500 text-white"}`}>
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
        <div className="pt-3 border-t border-slate-800">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700/50"
          >
            <div className="flex items-center gap-2">
              <span>📷</span>
              <span>View Store</span>
            </div>
            <span className="text-emerald-400 font-black">↗</span>
          </Link>
        </div>
      </aside>

      {/* 🤍 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F8FAFC]">
        
        {/* Top Light Header Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 text-lg bg-gray-100 p-2 rounded-xl"
            >
              ☰
            </button>

            {/* Search Input */}
            <div className="relative w-full max-w-md hidden sm:block">
              <input
                type="text"
                placeholder="Search anything... Ctrl + /"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative p-2 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 text-gray-700 transition cursor-pointer">
              🔔
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">5</span>
            </button>

            <button className="relative p-2 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 text-gray-700 transition cursor-pointer">
              ✉️
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">3</span>
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                alt="Sachin Rawat"
                className="w-8 h-8 rounded-full object-cover border border-emerald-500"
              />
              <div className="hidden md:block text-left">
                <p className="font-bold text-gray-900 text-xs leading-none">Sachin Rawat</p>
                <p className="text-[10px] text-gray-400 font-medium leading-none mt-1">Super Admin ▾</p>
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
