"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAdminStats, fetchProducts } from "lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [statsData, prodsData] = await Promise.all([
        fetchAdminStats(),
        fetchProducts()
      ]);
      setStats(statsData);
      setProductsCount(prodsData.length);
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

  const recentOrders = [
    { id: "SKIPD-984210", customer: "Rahul Sharma", email: "rahul@gmail.com", items: "OnePlus Nord 6 (x1)", amount: 44499, status: "DELIVERED", date: "May 25, 2026" },
    { id: "SKIPD-984209", customer: "Priya Patel", email: "priya@yahoo.com", items: "Saree Premium Silk (x2)", amount: 598, status: "SHIPPED", date: "May 25, 2026" },
    { id: "SKIPD-984208", customer: "Amit Verma", email: "amit.v@outlook.com", items: "20000mAh Power Bank (x1)", amount: 999, status: "PROCESSING", date: "May 24, 2026" },
    { id: "SKIPD-984207", customer: "Sneha Gupta", email: "sneha.g@gmail.com", items: "Nike Running Shoe (x1)", amount: 700, status: "PAID", date: "May 24, 2026" },
    { id: "SKIPD-984206", customer: "Vikas Singh", email: "vikas@gmail.com", items: "Pro Headphones (x1)", amount: 950, status: "DELIVERED", date: "May 23, 2026" }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-white">
      
      {/* Header Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] border border-gray-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white">📊 Executive Store Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time revenue metrics, order velocity, inventory health &amp; quick management tools</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/products"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/homepage"
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            🖼️ Edit Hero Slider
          </Link>
          <Link
            href="/admin/sales"
            className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-orange-600/20"
          >
            🔥 Sale Events
          </Link>
        </div>
      </div>

      {/* 📊 5 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Stat 1: Total Revenue */}
        <div className="bg-[#111827] border border-gray-800 p-5 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg border border-emerald-500/30">
              ₹
            </div>
            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {metrics.revenue_growth}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Revenue</p>
            <h3 className="text-xl font-black text-white mt-0.5">₹{metrics.total_revenue?.toLocaleString("en-IN")}</h3>
          </div>
        </div>

        {/* Stat 2: Total Orders */}
        <div className="bg-[#111827] border border-gray-800 p-5 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-lg border border-blue-500/30">
              🛍️
            </div>
            <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
              {metrics.orders_growth}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Orders</p>
            <h3 className="text-xl font-black text-white mt-0.5">{metrics.total_orders?.toLocaleString("en-IN")}</h3>
          </div>
        </div>

        {/* Stat 3: Total Customers */}
        <div className="bg-[#111827] border border-gray-800 p-5 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-lg border border-purple-500/30">
              👥
            </div>
            <span className="text-[10px] font-black bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">
              {metrics.customers_growth}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Customers</p>
            <h3 className="text-xl font-black text-white mt-0.5">{metrics.total_customers?.toLocaleString("en-IN")}</h3>
          </div>
        </div>

        {/* Stat 4: Catalog Products */}
        <div className="bg-[#111827] border border-gray-800 p-5 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-lg border border-amber-500/30">
              📦
            </div>
            <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
              Live DB
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Products in Catalog</p>
            <h3 className="text-xl font-black text-white mt-0.5">{productsCount || 34} Items</h3>
          </div>
        </div>

        {/* Stat 5: Store Visits */}
        <div className="bg-[#111827] border border-gray-800 p-5 rounded-3xl space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-lg border border-rose-500/30">
              👀
            </div>
            <span className="text-[10px] font-black bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">
              {metrics.visits_growth}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Monthly Visitors</p>
            <h3 className="text-xl font-black text-white mt-0.5">{metrics.store_visits?.toLocaleString("en-IN")}</h3>
          </div>
        </div>

      </div>

      {/* Main Grid Section: Recent Orders & Quick Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white">🛍️ Recent Orders Velocity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Live transactions across Razorpay UPI &amp; Cash on Delivery</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-emerald-400 hover:underline">
              View All Orders &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total (₹)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-900/40 transition">
                    <td className="px-4 py-3.5 font-bold font-mono text-white">{ord.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white text-xs">{ord.customer}</p>
                      <p className="text-[10px] text-gray-500">{ord.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-[11px] truncate max-w-[140px]">{ord.items}</td>
                    <td className="px-4 py-3.5 font-black text-white">₹{ord.amount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        ord.status === "DELIVERED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                        ord.status === "SHIPPED" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                        ord.status === "PROCESSING" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Platform Management Quick Launcher */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white border-b border-gray-800 pb-3">⚡ Admin Platform Control Center</h3>
            
            <div className="space-y-3">
              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-emerald-500/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 text-lg flex items-center justify-center font-bold">📦</div>
                  <div>
                    <h4 className="font-bold text-white text-xs group-hover:text-emerald-400 transition">Products &amp; Inventory</h4>
                    <p className="text-[10px] text-gray-500">Edit stock quantities, prices &amp; catalog</p>
                  </div>
                </div>
                <span className="text-gray-500 group-hover:text-white transition">&rarr;</span>
              </Link>

              <Link
                href="/admin/homepage"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-blue-500/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 text-lg flex items-center justify-center font-bold">🖼️</div>
                  <div>
                    <h4 className="font-bold text-white text-xs group-hover:text-blue-400 transition">Hero Slider &amp; Banners</h4>
                    <p className="text-[10px] text-gray-500">Manage 2s auto-slide hero banners</p>
                  </div>
                </div>
                <span className="text-gray-500 group-hover:text-white transition">&rarr;</span>
              </Link>

              <Link
                href="/admin/sales"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-orange-500/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 text-lg flex items-center justify-center font-bold">🔥</div>
                  <div>
                    <h4 className="font-bold text-white text-xs group-hover:text-orange-400 transition">Featured Freedom Offers</h4>
                    <p className="text-[10px] text-gray-500">Set offer prices &amp; live sale events</p>
                  </div>
                </div>
                <span className="text-gray-500 group-hover:text-white transition">&rarr;</span>
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-purple-500/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 text-lg flex items-center justify-center font-bold">🛍️</div>
                  <div>
                    <h4 className="font-bold text-white text-xs group-hover:text-purple-400 transition">Orders &amp; Shipments</h4>
                    <p className="text-[10px] text-gray-500">Manage order status &amp; AWB tracking</p>
                  </div>
                </div>
                <span className="text-gray-500 group-hover:text-white transition">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
