"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchAdminStats } from "lib/api";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await fetchAdminStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  const metrics = stats?.metrics || {
    total_revenue: 2745890,
    revenue_growth: "+18.6% vs last week",
    total_orders: 1245,
    orders_growth: "+12.4% vs last week",
    total_customers: 8542,
    customers_growth: "+8.7% vs last week",
    products_sold: 3456,
    products_growth: "+15.3% vs last week",
    store_visits: 52845,
    visits_growth: "+21.5% vs last week"
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex text-gray-900 font-sans">
      
      {/* 🖤 1. Dark Left Sidebar (Matching Reference Screenshot) */}
      <aside className="w-64 bg-[#0F172A] text-gray-300 flex flex-col justify-between p-4 shrink-0 hidden lg:flex border-r border-slate-800">
        <div className="space-y-6">
          
          {/* Brand Logo & Collapse */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                S
              </span>
              <span className="font-black text-white text-xl tracking-tight">SKIPD</span>
            </div>
            <button className="text-gray-400 hover:text-white text-xs bg-slate-800 p-1.5 rounded-lg">
              &lt;
            </button>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-3 p-2.5 bg-slate-800/60 rounded-2xl border border-slate-700/50">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              SR
            </div>
            <div className="text-xs leading-tight">
              <p className="font-bold text-white">Sachin Rawat</p>
              <p className="text-[10px] text-emerald-400 font-medium">Super Admin</p>
            </div>
          </div>

          {/* Sidebar Nav Section Groupings */}
          <nav className="space-y-6 text-xs font-medium">
            
            {/* MAIN */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-3 mb-2 tracking-wider">MAIN</p>
              <button
                onClick={() => setActiveTab("Dashboard")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  activeTab === "Dashboard"
                    ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20"
                    : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>📊</span>
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("Analytics")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <span>📈</span>
                  <span>Analytics</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("Orders")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <span>🛍️</span>
                  <span>Orders</span>
                </div>
                <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">28</span>
              </button>

              <button
                onClick={() => setActiveTab("Customers")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <span>👥</span>
                  <span>Customers</span>
                </div>
              </button>

              <Link
                href="/admin/products"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold hover:bg-blue-600/30 transition"
              >
                <div className="flex items-center gap-3">
                  <span>📦</span>
                  <span>Products Manager</span>
                </div>
              </Link>

              <button
                onClick={() => setActiveTab("Categories")}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <span>📁</span>
                  <span>Categories</span>
                </div>
              </button>
            </div>

            {/* MARKETING */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-3 mb-2 tracking-wider">MARKETING</p>
              <Link href="/admin/sales" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 font-bold transition">
                <span>🔥</span> <span>Sale Events Manager</span>
              </Link>
              <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
                <span>🎟️</span> <span>Coupons</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
                <span>🖼️</span> <span>Banners</span>
              </button>
            </div>

            {/* CONTENT */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-3 mb-2 tracking-wider">CONTENT</p>
              <Link href="/admin/homepage" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-bold transition">
                <span>🏠</span> <span>Homepage Manager</span>
              </Link>
              <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
                <span>📄</span> <span>Pages</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
                <span>📝</span> <span>Blog Posts</span>
              </button>
            </div>

            {/* SETTINGS */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-500 px-3 mb-2 tracking-wider">SETTINGS</p>
              <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
                <span>⚙️</span> <span>Settings</span>
              </button>
            </div>

          </nav>
        </div>

        {/* View Store Button */}
        <div className="pt-4 border-t border-slate-800">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            <span>View Store</span>
            <span>↗</span>
          </Link>
        </div>
      </aside>

      {/* 🤍 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden text-gray-600 text-lg">☰</button>
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search anything... Ctrl + /"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button className="relative p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              🔔
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">5</span>
            </button>
            <button className="relative p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              ✉️
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                SR
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-bold text-gray-900 leading-none text-xs">Sachin Rawat</p>
                <p className="text-[10px] text-gray-400 font-medium leading-none mt-1">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Header Title & Date Range */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-500 font-medium">Here's what's happening with your store today.</p>
            </div>

            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 shadow-2xs">
              <span>📅 May 19, 2026 - May 25, 2026</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </div>
          </div>

          {/* 📊 5 Stat Metric Cards (Matching Screenshot 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Stat 1: Total Revenue */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-lg">
                  $
                </div>
              </div>
              <div>
                <span className="text-gray-500 font-semibold text-xs block">Total Revenue</span>
                <span className="text-2xl font-black text-gray-900 block mt-0.5">₹{metrics.total_revenue.toLocaleString("en-IN")}</span>
                <span className="text-[11px] font-bold text-emerald-600 block mt-1">↑ {metrics.revenue_growth}</span>
              </div>
            </div>

            {/* Stat 2: Total Orders */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-lg">
                  🛒
                </div>
              </div>
              <div>
                <span className="text-gray-500 font-semibold text-xs block">Total Orders</span>
                <span className="text-2xl font-black text-gray-900 block mt-0.5">{metrics.total_orders.toLocaleString("en-IN")}</span>
                <span className="text-[11px] font-bold text-emerald-600 block mt-1">↑ {metrics.orders_growth}</span>
              </div>
            </div>

            {/* Stat 3: Total Customers */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-lg">
                  👥
                </div>
              </div>
              <div>
                <span className="text-gray-500 font-semibold text-xs block">Total Customers</span>
                <span className="text-2xl font-black text-gray-900 block mt-0.5">{metrics.total_customers.toLocaleString("en-IN")}</span>
                <span className="text-[11px] font-bold text-emerald-600 block mt-1">↑ {metrics.customers_growth}</span>
              </div>
            </div>

            {/* Stat 4: Products Sold */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-lg">
                  📦
                </div>
              </div>
              <div>
                <span className="text-gray-500 font-semibold text-xs block">Products Sold</span>
                <span className="text-2xl font-black text-gray-900 block mt-0.5">{metrics.products_sold.toLocaleString("en-IN")}</span>
                <span className="text-[11px] font-bold text-emerald-600 block mt-1">↑ {metrics.products_growth}</span>
              </div>
            </div>

            {/* Stat 5: Store Visits */}
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-lg">
                  👁️
                </div>
              </div>
              <div>
                <span className="text-gray-500 font-semibold text-xs block">Store Visits</span>
                <span className="text-2xl font-black text-gray-900 block mt-0.5">{metrics.store_visits.toLocaleString("en-IN")}</span>
                <span className="text-[11px] font-bold text-emerald-600 block mt-1">↑ {metrics.visits_growth}</span>
              </div>
            </div>

          </div>

          {/* 📈 Charts Row: Sales Overview & Order Status & Top Selling */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Overview Area Chart Box */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4 lg:col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-base text-gray-900">Sales Overview</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Revenue (₹)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Orders</span>
                  </div>
                </div>

                <span className="bg-gray-100 text-gray-700 font-bold text-xs px-3 py-1 rounded-xl">This Week ▼</span>
              </div>

              {/* Chart Visual Graphic Placeholder */}
              <div className="h-56 bg-slate-50 rounded-2xl border border-dashed border-gray-200 p-4 flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full flex items-end justify-between gap-4 px-4 pt-6">
                  {["May 19", "May 20", "May 21", "May 22", "May 23", "May 24", "May 25"].map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      {idx === 3 && (
                        <div className="absolute top-4 bg-gray-900 text-white text-[10px] p-2 rounded-xl shadow-lg border border-gray-700 z-10 font-medium">
                          <p className="font-bold">May 22, 2026</p>
                          <p className="text-emerald-400 font-bold">Revenue: ₹2,45,000</p>
                          <p className="text-purple-300">Orders: 210</p>
                        </div>
                      )}
                      <div className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-xl transition-all duration-300 group-hover:brightness-110" style={{ height: `${(idx + 3) * 18}px` }}></div>
                      <span className="text-[10px] font-bold text-gray-500">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Status Donut Chart & Breakdown */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="font-black text-base text-gray-900">Order Status</h3>
              
              <div className="flex items-center justify-center py-2 relative">
                <div className="w-36 h-36 rounded-full border-[14px] border-emerald-500 border-t-purple-500 border-r-amber-500 border-l-blue-500 flex items-center justify-center text-center">
                  <div>
                    <span className="text-xl font-black text-gray-900 block leading-none">1,245</span>
                    <span className="text-[10px] text-gray-400 font-bold block mt-1">Total Orders</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-gray-700 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Delivered</span>
                  <span className="font-bold text-gray-900">685 (55%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Processing</span>
                  <span className="font-bold text-gray-900">288 (23%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Shipped</span>
                  <span className="font-bold text-gray-900">172 (14%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Cancelled</span>
                  <span className="font-bold text-gray-900">100 (8%)</span>
                </div>
              </div>
            </div>

          </div>

          {/* 📑 Tables Row: Recent Orders & Low Stock & Store Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Orders Table Box */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4 lg:col-span-2 overflow-x-auto">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-base text-gray-900">Recent Orders</h3>
                <button className="text-xs font-bold text-emerald-700 hover:underline">View All Orders</button>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 font-bold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {stats?.recent_orders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 font-bold text-gray-900">{ord.id}</td>
                      <td className="py-3.5 text-gray-700">{ord.customer}</td>
                      <td className="py-3.5 text-gray-500 text-[11px]">{ord.date}</td>
                      <td className="py-3.5 font-black text-gray-900">₹{ord.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3.5">
                        <span className="bg-gray-100 text-gray-800 font-bold text-[10px] px-2 py-0.5 rounded-md">
                          {ord.payment}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                          ord.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          ord.status === "Processing" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                          ord.status === "Shipped" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button className="text-gray-400 hover:text-gray-900 font-bold text-sm">👁️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Low Stock Alerts & Store Overview Stack */}
            <div className="space-y-6">
              
              {/* Low Stock Alerts */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-base text-gray-900">Low Stock Alert</h3>
                  <button className="text-xs font-bold text-emerald-700 hover:underline">View All</button>
                </div>

                <div className="space-y-3 text-xs">
                  {stats?.low_stock_alerts.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-200">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.title}</p>
                          <p className="text-[10px] text-gray-400">{item.variant}</p>
                        </div>
                      </div>
                      <span className="bg-red-50 text-red-600 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-red-200">
                        Stock: {item.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Store Overview */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-3 text-xs">
                <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-2">Store Overview</h3>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Total Categories</span>
                  <span className="font-black text-gray-900 text-sm">24</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Total Brands</span>
                  <span className="font-black text-gray-900 text-sm">56</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Total Products</span>
                  <span className="font-black text-gray-900 text-sm">1,256</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Total Customers</span>
                  <span className="font-black text-gray-900 text-sm">8,542</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">Newsletter Subscribers</span>
                  <span className="font-black text-gray-900 text-sm">4,320</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
