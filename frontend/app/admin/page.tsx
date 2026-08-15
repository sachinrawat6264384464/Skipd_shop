"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAdminStats, fetchProducts } from "lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchAdminStats();
      setStats(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const metrics = stats?.metrics || {
    total_revenue: 2745890,
    revenue_growth: "18.6% vs last week",
    total_orders: 1245,
    orders_growth: "12.4% vs last week",
    total_customers: 8542,
    customers_growth: "8.7% vs last week",
    products_sold: 3456,
    products_growth: "15.3% vs last week",
    store_visits: 52845,
    visits_growth: "21.5% vs last week"
  };

  const topProducts = [
    { rank: 1, title: "OnePlus Nord 4 5G", sold: "256 sold", price: 29999, img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200" },
    { rank: 2, title: "boAt Rockerz 450 Pro", sold: "210 sold", price: 1799, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" },
    { rank: 3, title: "Noise ColorFit Pro 5", sold: "185 sold", price: 4499, img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200" },
    { rank: 4, title: "Nike Air Force 1 '07", sold: "165 sold", price: 7499, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200" },
    { rank: 5, title: "MacBook Air M2", sold: "148 sold", price: 84990, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200" }
  ];

  const recentOrders = [
    { id: "#SKIPD-25879", customer: "Amit Sharma", date: "May 25, 2025", amount: "₹2,999.00", payment: "UPI", status: "Delivered" },
    { id: "#SKIPD-25878", customer: "Priya Verma", date: "May 25, 2025", amount: "₹1,799.00", payment: "VISA", status: "Processing" },
    { id: "#SKIPD-25877", customer: "Rahul Singh", date: "May 24, 2025", amount: "₹4,499.00", payment: "Mastercard", status: "Shipped" },
    { id: "#SKIPD-25876", customer: "Sneha Patel", date: "May 24, 2025", amount: "₹3,199.00", payment: "UPI", status: "Delivered" },
    { id: "#SKIPD-25875", customer: "Vikram Joshi", date: "May 23, 2025", amount: "₹7,499.00", payment: "VISA", status: "Cancelled" }
  ];

  const lowStock = [
    { title: "iPhone 15 Pro Max", sub: "16GB + 256GB", stock: 8, img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200" },
    { title: "Sony WH-1000XM5", sub: "Wireless Headphones", stock: 12, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" },
    { title: "Samsung 65\" QLED TV", sub: "65 inch, 4K", stock: 5, img: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=200" },
    { title: "Apple Watch Series 9", sub: "GPS, 45mm", stock: 9, img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200" }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      
      {/* 📍 Header Title & Date Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Here's what's happening with your store today.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-bold text-gray-700 shadow-2xs cursor-pointer">
          <span>📅 May 19, 2025 - May 25, 2025</span>
          <span className="text-[10px] text-gray-400">▼</span>
        </div>
      </div>

      {/* 📊 5 Stat Metric Cards (Exact Match with Reference Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Stat 1: Total Revenue */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-lg shadow-2xs">
              $
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">₹{metrics.total_revenue?.toLocaleString("en-IN")}</h3>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ {metrics.revenue_growth}</span>
          </div>
        </div>

        {/* Stat 2: Total Orders */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-lg shadow-2xs">
              🛍️
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{metrics.total_orders?.toLocaleString("en-IN")}</h3>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ {metrics.orders_growth}</span>
          </div>
        </div>

        {/* Stat 3: Total Customers */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-lg shadow-2xs">
              👥
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Customers</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{metrics.total_customers?.toLocaleString("en-IN")}</h3>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ {metrics.customers_growth}</span>
          </div>
        </div>

        {/* Stat 4: Products Sold */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-lg shadow-2xs">
              📦
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Products Sold</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{metrics.products_sold?.toLocaleString("en-IN")}</h3>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ {metrics.products_growth}</span>
          </div>
        </div>

        {/* Stat 5: Store Visits */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-lg shadow-2xs">
              👀
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Store Visits</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{metrics.store_visits?.toLocaleString("en-IN")}</h3>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>↑ {metrics.visits_growth}</span>
          </div>
        </div>

      </div>

      {/* 📈 Middle Section: Sales Overview + Order Status Donut + Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Overview Line Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-black text-base text-gray-900">Sales Overview</h3>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700">
              <span>This Week</span>
              <span className="text-[10px] text-gray-400">▼</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span>Revenue (₹)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span>Orders</span>
            </div>
          </div>

          {/* Interactive SVG Chart representation matching Screenshot 1 */}
          <div className="relative w-full h-56 pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="500" y2="0" stroke="#f1f5f9" strokeWidth="1" />
              <text x="0" y="10" fill="#94a3b8" fontSize="10">₹4L</text>
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <text x="0" y="60" fill="#94a3b8" fontSize="10">₹3L</text>
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <text x="0" y="110" fill="#94a3b8" fontSize="10">₹2L</text>
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <text x="0" y="160" fill="#94a3b8" fontSize="10">₹0</text>

              {/* Revenue Green Line */}
              <path
                d="M 20 120 L 90 80 L 160 100 L 230 60 L 300 85 L 370 50 L 440 80 L 490 60"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Orders Purple Line */}
              <path
                d="M 20 140 L 90 110 L 160 125 L 230 90 L 300 115 L 370 75 L 440 110 L 490 100"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* May 22 Vertical Tooltip Indicator */}
              <line x1="230" y1="20" x2="230" y2="160" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="230" cy="60" r="5" fill="#10b981" />
              <circle cx="230" cy="90" r="5" fill="#8b5cf6" />
            </svg>

            {/* Floating Tooltip matching Screenshot 1 */}
            <div className="absolute top-12 left-[40%] bg-white border border-gray-200 rounded-2xl p-3 shadow-xl text-[11px] space-y-1 font-bold z-10 pointer-events-none">
              <p className="text-gray-400 font-medium">May 22, 2025</p>
              <p className="text-emerald-600">● Revenue: ₹2,45,000</p>
              <p className="text-purple-600">● Orders: 210</p>
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-gray-400 font-bold pt-2 border-t border-gray-100">
            <span>May 19</span>
            <span>May 20</span>
            <span>May 21</span>
            <span>May 22</span>
            <span>May 23</span>
            <span>May 24</span>
            <span>May 25</span>
          </div>
        </div>

        {/* Order Status Donut Chart (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">Order Status</h3>
          
          {/* Donut Graphic */}
          <div className="relative flex items-center justify-center h-48">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="14" fill="none" />
              {/* Delivered 55% */}
              <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="14" fill="none" strokeDasharray="131 238" strokeDashoffset="0" />
              {/* Processing 23% */}
              <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="14" fill="none" strokeDasharray="55 238" strokeDashoffset="-131" />
              {/* Shipped 14% */}
              <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="14" fill="none" strokeDasharray="33 238" strokeDashoffset="-186" />
              {/* Cancelled 8% */}
              <circle cx="50" cy="50" r="38" stroke="#8b5cf6" strokeWidth="14" fill="none" strokeDasharray="19 238" strokeDashoffset="-219" />
            </svg>
            <div className="absolute text-center leading-tight">
              <p className="text-xl font-black text-gray-900">1,245</p>
              <p className="text-[10px] text-gray-400 font-semibold">Total Orders</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-semibold pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-gray-700">Delivered</span>
              </div>
              <span className="font-bold text-gray-900">685 (55%)</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-gray-700">Processing</span>
              </div>
              <span className="font-bold text-gray-900">288 (23%)</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-gray-700">Shipped</span>
              </div>
              <span className="font-bold text-gray-900">172 (14%)</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-gray-700">Cancelled</span>
              </div>
              <span className="font-bold text-gray-900">100 (8%)</span>
            </div>
          </div>
        </div>

        {/* Top Selling Products List (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-black text-base text-gray-900">Top Selling Products</h3>
            <Link href="/admin/products" className="text-xs font-bold text-gray-500 hover:text-gray-900">View All</Link>
          </div>

          <div className="space-y-3">
            {topProducts.map((p) => (
              <div key={p.rank} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">
                    {p.rank}
                  </span>
                  <img src={p.img} alt={p.title} className="w-10 h-10 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs truncate max-w-[140px]">{p.title}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">{p.sold}</p>
                  </div>
                </div>
                <span className="font-black text-gray-900 text-xs">₹{p.price.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 🛍️ Bottom Section: Recent Orders + Low Stock Alert + Store Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Recent Orders Table (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-black text-base text-gray-900">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs font-bold text-gray-500 hover:text-gray-900">View All Orders</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Order ID</th>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5">Payment</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3 font-bold text-gray-900 font-mono text-[11px]">{ord.id}</td>
                    <td className="px-3 py-3 font-bold text-gray-800">{ord.customer}</td>
                    <td className="px-3 py-3 text-gray-500 text-[11px]">{ord.date}</td>
                    <td className="px-3 py-3 font-black text-gray-900">{ord.amount}</td>
                    <td className="px-3 py-3 font-black text-[10px]">
                      {ord.payment === "UPI" ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">UPI</span>
                      ) : ord.payment === "VISA" ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black">VISA</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-black">MC</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                        ord.status === "Processing" ? "bg-blue-100 text-blue-800" :
                        ord.status === "Shipped" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button className="text-gray-400 hover:text-gray-900 font-bold text-sm">👁</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-black text-base text-gray-900">Low Stock Alert</h3>
            <Link href="/admin/products" className="text-xs font-bold text-gray-500 hover:text-gray-900">View All</Link>
          </div>

          <div className="space-y-3">
            {lowStock.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <img src={item.img} alt={item.title} className="w-10 h-10 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs truncate max-w-[120px]">{item.title}</h4>
                    <p className="text-[10px] text-gray-400">{item.sub}</p>
                  </div>
                </div>
                <span className="font-black text-red-600 text-xs bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                  Stock: {item.stock}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Store Overview (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-3 text-xs">
          <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-2">Store Overview</h3>
          
          <div className="flex justify-between items-center py-1.5">
            <span className="text-gray-600 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">📁</span> Total Categories
            </span>
            <span className="font-black text-gray-900 text-sm">24</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span className="text-gray-600 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">🏷️</span> Total Brands
            </span>
            <span className="font-black text-gray-900 text-sm">56</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span className="text-gray-600 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">📦</span> Total Products
            </span>
            <span className="font-black text-gray-900 text-sm">1,256</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span className="text-gray-600 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">👥</span> Total Customers
            </span>
            <span className="font-black text-gray-900 text-sm">8,542</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span className="text-gray-600 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">✉️</span> Newsletter Subscribers
            </span>
            <span className="font-black text-gray-900 text-sm">4,320</span>
          </div>
        </div>

      </div>

    </div>
  );
}
