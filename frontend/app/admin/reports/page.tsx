"use client";

export default function AdminReportsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📊 Business Intelligence &amp; Financial Reports</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Export custom CSV/Excel reports for GST taxation, profit margins &amp; quarterly audits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-4">
          <h3 className="font-black text-base text-gray-900">🧾 GST &amp; Tax Audit Report</h3>
          <p className="text-xs text-gray-500">Monthly breakdown of IGST, CGST, and SGST collected on all orders.</p>
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer">
            Export GST CSV Report
          </button>
        </div>

        <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-4">
          <h3 className="font-black text-base text-gray-900">📦 Inventory Valuation Report</h3>
          <p className="text-xs text-gray-500">Total cost vs retail value of all stock items currently held in warehouse.</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer">
            Export Valuation Report
          </button>
        </div>

        <div className="bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs space-y-4">
          <h3 className="font-black text-base text-gray-900">👥 Customer LTV &amp; Retention</h3>
          <p className="text-xs text-gray-500">Repeat purchase rates, average lifetime value &amp; churn metrics.</p>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer">
            Export LTV Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
