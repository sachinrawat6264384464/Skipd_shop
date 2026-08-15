"use client";

import { useState } from "react";

export default function AdminCustomersPage() {
  const [customers] = useState([
    { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", phone: "+91 98765 43210", ordersCount: 5, spent: 54999, role: "CUSTOMER", joined: "Jan 12, 2026" },
    { id: 2, name: "Priya Patel", email: "priya@yahoo.com", phone: "+91 98123 45678", ordersCount: 12, spent: 12450, role: "CUSTOMER", joined: "Feb 04, 2026" },
    { id: 3, name: "Amit Verma", email: "amit.v@outlook.com", phone: "+91 97111 22334", ordersCount: 3, spent: 3499, role: "CUSTOMER", joined: "Mar 18, 2026" },
    { id: 4, name: "Sneha Gupta", email: "sneha.g@gmail.com", phone: "+91 96555 44332", ordersCount: 8, spent: 18900, role: "CUSTOMER", joined: "Apr 02, 2026" },
    { id: 5, name: "Sachin Rawat", email: "admin@skipd.com", phone: "+91 99999 00000", ordersCount: 45, spent: 154000, role: "SUPER ADMIN", joined: "Jan 01, 2026" }
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] border border-gray-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white">👥 Customers &amp; User Accounts</h1>
          <p className="text-xs text-gray-400 mt-1">View customer profiles, total lifetime spending, order counts &amp; user role permissions</p>
        </div>
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black px-4 py-2 rounded-xl">
          Total Registered Users: 8,542
        </span>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Customer Name &amp; Role</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4">Lifetime Spent (₹)</th>
                <th className="px-6 py-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-medium">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-900/40 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                        c.role === "SUPER ADMIN" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-gray-800 text-gray-400"
                      }`}>
                        {c.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-mono">{c.email}</td>
                  <td className="px-6 py-4 text-gray-400">{c.phone}</td>
                  <td className="px-6 py-4 font-bold text-white">{c.ordersCount} orders</td>
                  <td className="px-6 py-4 font-black text-emerald-400">₹{c.spent.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-gray-500">{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
