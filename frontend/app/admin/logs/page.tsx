"use client";

export default function AdminSystemLogsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📜 System Audit Logs &amp; API Traces</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time audit log of admin actions, API requests, database queries &amp; security events</p>
        </div>
      </div>

      <div className="bg-[#0F172A] text-gray-300 border border-slate-800 rounded-2xl p-5 shadow-2xs font-mono text-xs space-y-2 overflow-x-auto">
        <p className="text-emerald-400">[2026-08-15 10:35:12] INFO: Product ID #1 stock updated to 100 by admin: sachin@skipd.com</p>
        <p className="text-blue-400">[2026-08-15 10:30:45] INFO: Razorpay webhook payment_captured order #SKIPD-984210</p>
        <p className="text-slate-400">[2026-08-15 10:25:01] INFO: PostgreSQL connection pool active on 127.0.0.1:5433</p>
      </div>
    </div>
  );
}
