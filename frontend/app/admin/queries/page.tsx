"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminProductQueriesPage() {
  const [queries, setQueries] = useState([
    {
      id: "#Q-12548",
      customer: "Amit Sharma",
      email: "amit.sharma@email.com",
      product: "OnePlus Nord 4 5G",
      price: "₹29,999",
      img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100",
      queryText: "Is this product water resistant?",
      type: "Product Info",
      status: "Pending",
      priority: "Medium",
      priorityColor: "text-amber-500",
      date: "May 24, 2025 10:30 AM"
    },
    {
      id: "#Q-12547",
      customer: "Priya Verma",
      email: "priya.verma@email.com",
      product: "boAt Rockerz 450 Pro",
      price: "₹1,799",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100",
      queryText: "Does it support fast charging?",
      type: "Product Info",
      status: "Resolved",
      priority: "Low",
      priorityColor: "text-emerald-500",
      date: "May 24, 2025 09:15 AM"
    },
    {
      id: "#Q-12546",
      customer: "Rahul Singh",
      email: "rahul.singh@email.com",
      product: "Noise ColorFit Pro 5",
      price: "₹4,499",
      img: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=100",
      queryText: "Is the strap replaceable?",
      type: "Product Info",
      status: "Pending",
      priority: "Medium",
      priorityColor: "text-amber-500",
      date: "May 23, 2025 07:45 PM"
    },
    {
      id: "#Q-12545",
      customer: "Sneha Patel",
      email: "sneha.patel@email.com",
      product: "Nike Air Force 1 '07",
      price: "₹7,499",
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100",
      queryText: "What is the return policy?",
      type: "Other",
      status: "Resolved",
      priority: "Low",
      priorityColor: "text-emerald-500",
      date: "May 23, 2025 05:20 PM"
    },
    {
      id: "#Q-12544",
      customer: "Vikram Joshi",
      email: "vikram.joshi@email.com",
      product: "MacBook Air M2",
      price: "₹84,990",
      img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100",
      queryText: "Is there any student discount?",
      type: "Other",
      status: "Rejected",
      priority: "High",
      priorityColor: "text-red-500",
      date: "May 23, 2025 03:10 PM"
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedType, setSelectedType] = useState("All Types");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStatusChange = (id: string, newStatus: string) => {
    setQueries(queries.map(q => q.id === id ? { ...q, status: newStatus } : q));
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      
      {/* 📍 Top Title Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Product Queries</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage all customer queries and 24-hour return requests related to products</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5">
            📥 Export
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5">
            🌪️ Filters
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1">
            + New Query
          </button>
        </div>
      </div>

      {/* 📊 4 Top Metric Cards (Exact Screenshot Match) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Queries */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl shrink-0">
            ❓
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Queries</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">1,248</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">100% of all queries</p>
          </div>
        </div>

        {/* Card 2: Resolved */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shrink-0">
            ✓
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Resolved</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">832</h3>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">66.7% of total</p>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xl shrink-0">
            ⏳
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">278</h3>
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">22.3% of total</p>
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-xl shrink-0">
            ✕
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Rejected</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">138</h3>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">11.0% of total</p>
          </div>
        </div>

      </div>

      {/* 🔍 Filter Bar Section (Exact Screenshot Match) */}
      <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by query, customer or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto text-xs font-bold text-gray-700">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Resolved</option>
            <option>Rejected</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option>All Types</option>
            <option>Product Info</option>
            <option>Order Related</option>
            <option>Return &amp; Refund</option>
            <option>Other</option>
          </select>

          <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
            <option>All Products</option>
            <option>OnePlus Nord 4 5G</option>
            <option>boAt Rockerz 450 Pro</option>
            <option>MacBook Air M2</option>
          </select>

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700">
            📅 May 19, 2025 - May 25, 2025
          </div>

          <button
            onClick={() => { setSelectedStatus("All Status"); setSelectedType("All Types"); setSearchQuery(""); }}
            className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold px-3 py-2 rounded-xl transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* 📋 Queries Table (Exact Screenshot Match) */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3">Query ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Query</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {queries.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3.5"><input type="checkbox" className="rounded" /></td>
                  <td className="px-4 py-3.5 font-bold font-mono text-gray-900">{q.id}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-gray-900">{q.customer}</p>
                    <p className="text-[10px] text-gray-400">{q.email}</p>
                  </td>
                  <td className="px-4 py-3.5 flex items-center gap-2">
                    <img src={q.img} alt={q.product} className="w-8 h-8 rounded-lg object-cover border border-gray-100 bg-gray-50 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{q.product}</p>
                      <p className="text-[10px] text-gray-400">{q.price}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-gray-900 text-xs max-w-[200px] truncate">{q.queryText}</p>
                    <button className="text-indigo-600 font-bold text-[10px] hover:underline">View Details</button>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                      {q.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      q.status === "Resolved" ? "bg-emerald-100 text-emerald-800" :
                      q.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[11px] flex items-center gap-1 mt-3">
                    <span className={`text-xs ${q.priorityColor}`}>●</span> {q.priority}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-[11px]">{q.date}</td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    <button title="View Query" className="p-1 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-lg">👁</button>
                    <button onClick={() => handleStatusChange(q.id, "Resolved")} title="Approve / Resolve" className="p-1 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg">✓</button>
                    <button onClick={() => handleStatusChange(q.id, "Rejected")} title="Reject Query" className="p-1 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-3">
          <span>Showing 1 to 5 of 1,248 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 bg-gray-100 rounded-lg text-gray-600 font-bold">&lt;</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold">1</button>
            <button className="px-3 py-1 bg-gray-100 rounded-lg text-gray-600 font-bold">2</button>
            <button className="px-3 py-1 bg-gray-100 rounded-lg text-gray-600 font-bold">3</button>
            <span>...</span>
            <button className="px-3 py-1 bg-gray-100 rounded-lg text-gray-600 font-bold">125</button>
            <button className="px-3 py-1 bg-gray-100 rounded-lg text-gray-600 font-bold">&gt;</button>
          </div>
        </div>
      </div>

      {/* 📈 Bottom Section: Query Types Donut + Top Products + Recent Activity (Exact Screenshot Match) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Donut Chart (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="font-black text-base text-gray-900 border-b border-gray-100 pb-3">Query Types</h3>
          
          <div className="flex items-center justify-between gap-4">
            <svg className="w-32 h-32 transform -rotate-90 shrink-0" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="14" fill="none" />
              {/* Product Info 67.6% */}
              <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="14" fill="none" strokeDasharray="161 238" strokeDashoffset="0" />
              {/* Order Related 15.9% */}
              <circle cx="50" cy="50" r="38" stroke="#f97316" strokeWidth="14" fill="none" strokeDasharray="38 238" strokeDashoffset="-161" />
              {/* Return & Refund 9.0% */}
              <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="14" fill="none" strokeDasharray="21 238" strokeDashoffset="-199" />
              {/* Other 7.7% */}
              <circle cx="50" cy="50" r="38" stroke="#94a3b8" strokeWidth="14" fill="none" strokeDasharray="18 238" strokeDashoffset="-220" />
            </svg>

            <div className="space-y-2 text-[11px] font-bold text-gray-700 w-full">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Product Info</span>
                <span>842 (67.6%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Order Related</span>
                <span>198 (15.9%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Return &amp; Refund</span>
                <span>112 (9.0%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Other</span>
                <span>96 (7.7%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products by Queries (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-black text-base text-gray-900">Top Products (by Queries)</h3>
            <span className="text-xs text-gray-400 font-bold">View All</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100" alt="OnePlus" className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                <h4 className="font-bold text-gray-900 text-xs">OnePlus Nord 4 5G</h4>
              </div>
              <span className="font-bold text-gray-500 text-xs">256 Queries</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=100" alt="Noise" className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                <h4 className="font-bold text-gray-900 text-xs">Noise ColorFit Pro 5</h4>
              </div>
              <span className="font-bold text-gray-500 text-xs">185 Queries</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100" alt="MacBook" className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                <h4 className="font-bold text-gray-900 text-xs">MacBook Air M2</h4>
              </div>
              <span className="font-bold text-gray-500 text-xs">148 Queries</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="font-black text-base text-gray-900">Recent Activity</h3>
            <span className="text-xs text-gray-400 font-bold">View All</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
              <div>
                <p className="font-bold text-gray-900">Query #Q-12547 resolved by admin</p>
                <p className="text-[10px] text-gray-400">May 24, 2025 09:20 AM</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">⏳</span>
              <div>
                <p className="font-bold text-gray-900">Query #Q-12546 status changed to pending</p>
                <p className="text-[10px] text-gray-400">May 23, 2025 07:50 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✕</span>
              <div>
                <p className="font-bold text-gray-900">Query #Q-12544 rejected by admin</p>
                <p className="text-[10px] text-gray-400">May 23, 2025 03:15 PM</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
