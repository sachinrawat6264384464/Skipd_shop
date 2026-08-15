"use client";

import { useState } from "react";

export default function AdminCustomersPage() {
  const [activeTab, setActiveTab] = useState("All Customers");
  const tabs = ["All Customers", "Customer Groups", "Customer Reviews", "Customer Activity"];

  const [customers] = useState([
    { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", phone: "+91 98765 43210", ordersCount: 5, spent: 54999, group: "VIP Gold", role: "CUSTOMER", joined: "Jan 12, 2026" },
    { id: 2, name: "Priya Patel", email: "priya@yahoo.com", phone: "+91 98123 45678", ordersCount: 12, spent: 12450, group: "VIP Platinum", role: "CUSTOMER", joined: "Feb 04, 2026" },
    { id: 3, name: "Amit Verma", email: "amit.v@outlook.com", phone: "+91 97111 22334", ordersCount: 3, spent: 3499, group: "Silver Regular", role: "CUSTOMER", joined: "Mar 18, 2026" },
    { id: 4, name: "Sneha Gupta", email: "sneha.g@gmail.com", phone: "+91 96555 44332", ordersCount: 8, spent: 18900, group: "VIP Gold", role: "CUSTOMER", joined: "Apr 02, 2026" },
    { id: 5, name: "Sachin Rawat", email: "admin@skipd.com", phone: "+91 99999 00000", ordersCount: 45, spent: 154000, group: "Super Admin", role: "SUPER ADMIN", joined: "Jan 01, 2026" }
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">👥 Customer Relationship Management (CRM)</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Track registered customers, customer segmentation groups, activity timelines &amp; review history</p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-xl">
          Total Registered Users: 8,542
        </span>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === tab ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Customer Profile</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Group Tier</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent (₹)</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                        c.role === "SUPER ADMIN" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {c.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">{c.email}</td>
                  <td className="px-6 py-4 text-gray-500">{c.phone}</td>
                  <td className="px-6 py-4 font-bold text-indigo-700">{c.group}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{c.ordersCount} orders</td>
                  <td className="px-6 py-4 font-black text-gray-900 text-sm">₹{c.spent.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-gray-400">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
