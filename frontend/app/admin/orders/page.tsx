"use client";

import { useState } from "react";

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<string>("All Orders");
  const [orders, setOrders] = useState([
    { id: "#SKIPD-25879", customer: "Amit Sharma", email: "amit@gmail.com", phone: "+91 98765 43210", address: "Gwalior, MP (474001)", items: "OnePlus Nord 6 | 8GB+256GB (x1)", amount: 44499, payment: "UPI", status: "Delivered", awb: "SR-8849201", date: "May 25, 2025" },
    { id: "#SKIPD-25878", customer: "Priya Verma", email: "priya@yahoo.com", phone: "+91 98123 45678", address: "Ahmedabad, Gujarat (380001)", items: "Saree Premium Silk (x2)", amount: 1799, payment: "VISA", status: "Processing", awb: "SR-8849202", date: "May 25, 2025" },
    { id: "#SKIPD-25877", customer: "Rahul Singh", email: "rahul@outlook.com", phone: "+91 97111 22334", address: "New Delhi (110001)", items: "20000mAh Power Bank (x1)", amount: 4499, payment: "Mastercard", status: "Shipped", awb: "SR-8849203", date: "May 24, 2025" },
    { id: "#SKIPD-25876", customer: "Sneha Patel", email: "sneha@gmail.com", phone: "+91 96555 44332", address: "Bengaluru, Karnataka (560001)", items: "Nike Running Shoe (x1)", amount: 3199, payment: "UPI", status: "Delivered", awb: "SR-8849204", date: "May 24, 2025" },
    { id: "#SKIPD-25875", customer: "Vikram Joshi", email: "vikram@gmail.com", phone: "+91 99887 76655", address: "Mumbai, Maharashtra (400001)", items: "Pro Headphones (x1)", amount: 7499, payment: "VISA", status: "Cancelled", awb: "Cancelled", date: "May 23, 2025" },
    { id: "#SKIPD-25874", customer: "Karan Mehta", email: "karan@gmail.com", phone: "+91 91122 33445", address: "Pune, MH (411001)", items: "Cold Pressed Oil 1L (x3)", amount: 747, payment: "UPI", status: "Pending", awb: "Pending", date: "May 23, 2025" },
    { id: "#SKIPD-25873", customer: "Ananya Roy", email: "ananya@gmail.com", phone: "+91 92233 44556", address: "Kolkata, WB (700001)", items: "Velvet Cushion Cover (x4)", amount: 3200, payment: "UPI", status: "Returns", awb: "RET-90481", date: "May 22, 2025" },
    { id: "#SKIPD-25872", customer: "Rohan Kapoor", email: "rohan@gmail.com", phone: "+91 93344 55667", address: "Jaipur, RJ (302001)", items: "FPV Toy Drone (x1)", amount: 999, payment: "VISA", status: "Refunds", awb: "REF-55910", date: "May 21, 2025" }
  ]);

  const tabs = ["All Orders", "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returns", "Refunds"];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "All Orders") return true;
    return o.status.toLowerCase() === activeTab.toLowerCase();
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🛒 Orders &amp; Fulfillment Lifecycle</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Filter by fulfillment stages: Pending, Processing, Shipped, Delivered, Cancelled, Returns &amp; Refunds</p>
        </div>
        <span className="bg-indigo-100 text-indigo-800 font-black text-xs px-4 py-2 rounded-xl border border-indigo-200">
          Showing: {filteredOrders.length} Orders
        </span>
      </div>

      {/* Sub-Tabs Navigation (Exact Spec) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
        {tabs.map((tab) => {
          const active = activeTab === tab;
          const count = tab === "All Orders" ? orders.length : orders.filter(o => o.status.toLowerCase() === tab.toLowerCase()).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                active ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? "bg-white text-emerald-800 font-black" : "bg-gray-100 text-gray-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Order ID &amp; Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">AWB Code</th>
                <th className="px-6 py-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 font-mono text-xs">{ord.id}</p>
                    <p className="text-[10px] text-gray-400">{ord.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{ord.customer}</p>
                    <p className="text-[10px] text-gray-400">{ord.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">{ord.items}</td>
                  <td className="px-6 py-4 font-black text-gray-900 text-sm">₹{ord.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-800 font-black px-2 py-0.5 rounded text-[10px]">
                      {ord.payment}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-500 text-[11px]">{ord.awb}</td>
                  <td className="px-6 py-4">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returns">Returns</option>
                      <option value="Refunds">Refunds</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
