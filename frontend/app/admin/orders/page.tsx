"use client";

import { useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([
    { id: "SKIPD-984210", customer: "Rahul Sharma", phone: "+91 98765 43210", address: "Gwalior, MP (474001)", items: "OnePlus Nord 6 | 8GB+256GB (x1)", amount: 44499, status: "DELIVERED", awb: "SR-8849201", date: "May 25, 2026" },
    { id: "SKIPD-984209", customer: "Priya Patel", phone: "+91 98123 45678", address: "Ahmedabad, Gujarat (380001)", items: "Saree Premium Silk (x2)", amount: 598, status: "SHIPPED", awb: "SR-8849202", date: "May 25, 2026" },
    { id: "SKIPD-984208", customer: "Amit Verma", phone: "+91 97111 22334", address: "New Delhi (110001)", items: "20000mAh Power Bank (x1)", amount: 999, status: "PROCESSING", awb: "SR-8849203", date: "May 24, 2026" },
    { id: "SKIPD-984207", customer: "Sneha Gupta", phone: "+91 96555 44332", address: "Bengaluru, Karnataka (560001)", items: "Nike Running Shoe (x1)", amount: 700, status: "PAID", awb: "Pending", date: "May 24, 2026" },
    { id: "SKIPD-984206", customer: "Vikas Singh", phone: "+91 99887 76655", address: "Mumbai, Maharashtra (400001)", items: "Pro Headphones (x1)", amount: 950, status: "DELIVERED", awb: "SR-8849199", date: "May 23, 2026" }
  ]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    alert(`✓ Order ${id} status updated to ${newStatus}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] border border-gray-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white">🛍️ Orders &amp; Fulfillment Manager</h1>
          <p className="text-xs text-gray-400 mt-1">Track customer orders, manage payment statuses, update shipment AWBs &amp; handle order lifecycle</p>
        </div>
        <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-black px-4 py-2 rounded-xl">
          Total Orders: {orders.length}
        </span>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Order ID &amp; Date</th>
                <th className="px-6 py-4">Customer &amp; Address</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total Amount (₹)</th>
                <th className="px-6 py-4">AWB Tracking</th>
                <th className="px-6 py-4">Status &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-medium">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-900/40 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white font-mono">{ord.id}</p>
                    <p className="text-[10px] text-gray-500">{ord.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{ord.customer}</p>
                    <p className="text-[10px] text-gray-400">{ord.phone}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[160px]">{ord.address}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-bold">{ord.items}</td>
                  <td className="px-6 py-4 font-black text-emerald-400 text-sm">₹{ord.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 font-mono text-gray-400 text-[11px]">{ord.awb}</td>
                  <td className="px-6 py-4">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      className="bg-gray-900 border border-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="PAID">PAID</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
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
