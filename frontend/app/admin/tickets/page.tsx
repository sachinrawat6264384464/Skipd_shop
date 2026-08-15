"use client";

export default function AdminTicketsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🎫 Customer Support Tickets</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Help desk ticketing system for customer inquiries, return requests &amp; refund assistance</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-3 text-xs">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <span className="font-bold font-mono text-emerald-700">#TCK-8812</span>
            <p className="font-bold text-gray-900 text-sm">Where is my order Shiprocket tracking AWB?</p>
            <p className="text-gray-400">By Rahul Sharma • 2 hours ago</p>
          </div>
          <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-[10px]">OPEN</span>
        </div>
      </div>
    </div>
  );
}
