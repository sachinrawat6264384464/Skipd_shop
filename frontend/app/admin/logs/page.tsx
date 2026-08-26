"use client";

import { useState } from "react";

export default function AdminSystemLogsPage() {
  const [activeTab, setActiveTab] = useState("API Logs");
  const tabs = ["API Logs", "Error Logs", "Audit Logs", "Background Jobs", "System Health"];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🔐 System Audit, Health &amp; Logs</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time audit log of admin actions, API requests, PostgreSQL queries, background jobs &amp; system health status</p>
        </div>
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

      {/* Log Output Console */}
      <div className="bg-[#0F172A] text-gray-300 border border-slate-800 rounded-2xl p-5 shadow-2xs font-mono text-xs space-y-2 overflow-x-auto">
        <p className="text-emerald-400">[2026-08-15 10:45:12] INFO: API GET /api/v1/admin/stats 200 OK (12ms)</p>
        <p className="text-emerald-400">[2026-08-15 10:35:12] INFO: Product ID #1 stock updated to 100 by admin: sachin@e-com.com</p>
        <p className="text-blue-400">[2026-08-15 10:30:45] INFO: Razorpay webhook payment_captured order #E-COM-984210</p>
        <p className="text-slate-400">[2026-08-15 10:25:01] INFO: PostgreSQL connection pool active on 127.0.0.1:5433 (ecom_commerce_db)</p>
        <p className="text-purple-400">[2026-08-15 10:20:00] INFO: Background Worker Job #7408 completed successfully</p>
      </div>
    </div>
  );
}
