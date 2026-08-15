"use client";

import { useState } from "react";

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState("Transactions");
  const tabs = ["Transactions", "Payment Methods", "Refunds", "Failed Payments", "Coupons Usage", "Revenue Reports"];

  const [payments] = useState([
    { id: "PAY-99201", orderId: "#SKIPD-25879", customer: "Amit Sharma", amount: 2999, method: "Razorpay UPI", status: "SUCCESS", rzpPaymentId: "pay_N842910481", date: "May 25, 2025 14:32" },
    { id: "PAY-99202", orderId: "#SKIPD-25878", customer: "Priya Verma", amount: 1799, method: "VISA Credit Card", status: "SUCCESS", rzpPaymentId: "pay_N842910482", date: "May 25, 2025 12:15" },
    { id: "PAY-99203", orderId: "#SKIPD-25877", customer: "Rahul Singh", amount: 4499, method: "Mastercard Debit", status: "SUCCESS", rzpPaymentId: "pay_N842910483", date: "May 24, 2025 18:40" },
    { id: "PAY-99204", orderId: "#SKIPD-25876", customer: "Sneha Patel", amount: 3199, method: "Razorpay UPI", status: "SUCCESS", rzpPaymentId: "pay_N842910484", date: "May 24, 2025 11:05" },
    { id: "PAY-99205", orderId: "#SKIPD-25875", customer: "Vikram Joshi", amount: 7499, method: "Razorpay NetBanking", status: "REFUNDED", rzpPaymentId: "pay_N842910485", date: "May 23, 2025 09:20" }
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">💰 Payments, Finance &amp; Gateways</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Track Razorpay transactions, payment gateway methods, refunds, failed payments &amp; coupon revenue impact</p>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer">
          ⚡ Export Settlement Statement
        </button>
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

      {/* Transaction Log Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Txn ID</th>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Payment Method</th>
                <th className="px-5 py-3.5">Razorpay ID</th>
                <th className="px-5 py-3.5">Amount (₹)</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 font-bold font-mono text-gray-900">{p.id}</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-700 font-mono">{p.orderId}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{p.customer}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-700">{p.method}</td>
                  <td className="px-5 py-3.5 font-mono text-gray-400 text-[11px]">{p.rzpPaymentId}</td>
                  <td className="px-5 py-3.5 font-black text-gray-900 text-sm">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                      p.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-gray-400 text-[11px]">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
