"use client";

import { useState } from "react";

export default function AdminPaymentsPage() {
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
          <h1 className="text-2xl font-black text-gray-900">💳 Payments &amp; Financial Settlements</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time Razorpay transaction log, payout settlements, refunds &amp; payment gateway reconciliation</p>
        </div>

        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer">
            ⚡ Download Payout Settlement PDF
          </button>
        </div>
      </div>

      {/* Payment Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Total Paid Volume</p>
          <h3 className="text-xl font-black text-gray-900 mt-1">₹27,45,890</h3>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">100% Razorpay Verified</p>
        </div>

        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">UPI / GPay Share</p>
          <h3 className="text-xl font-black text-emerald-600 mt-1">68.4%</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-1">Instant Settlement T+1</p>
        </div>

        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Credit / Debit Cards</p>
          <h3 className="text-xl font-black text-blue-600 mt-1">24.1%</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-1">VISA &amp; Mastercard 3D-Secure</p>
        </div>

        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs">
          <p className="text-xs text-gray-500 font-medium">Total Refunded</p>
          <h3 className="text-xl font-black text-purple-600 mt-1">₹14,998</h3>
          <p className="text-[10px] text-gray-400 font-medium mt-1">2 Refund Requests Processed</p>
        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-black text-base text-gray-900">Razorpay Transaction Log</h3>
          <span className="text-xs text-gray-500">Live Gateway Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3">Txn ID</th>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Payment Method</th>
                <th className="px-5 py-3">Razorpay ID</th>
                <th className="px-5 py-3">Amount (₹)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Date &amp; Time</th>
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
