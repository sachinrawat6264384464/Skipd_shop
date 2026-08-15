"use client";

import { useState } from "react";

export default function AdminDeliveryPage() {
  const [activeTab, setActiveTab] = useState("Shipments");
  const tabs = ["Shipments", "Tracking", "Delivery Partners", "Shipping Zones", "Shipping Rates"];

  const shipments = [
    { awb: "SR-8849201", partner: "Delhivery Surface", destination: "Gwalior 474001", estDelivery: "May 27, 2026", status: "IN_TRANSIT" },
    { awb: "SR-8849202", partner: "Bluedart Air", destination: "Ahmedabad 380001", estDelivery: "May 26, 2026", status: "OUT_FOR_DELIVERY" },
    { awb: "SR-8849203", partner: "Xpressbees", destination: "New Delhi 110001", estDelivery: "May 28, 2026", status: "PICKED_UP" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🚚 Delivery &amp; Express Logistics</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage Shiprocket integrations, AWB courier tracking, shipping zones &amp; delivery rates</p>
        </div>
      </div>

      {/* Sub-Tabs */}
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

      {/* Tab Content: Shipments & Tracking */}
      {activeTab === "Shipments" || activeTab === "Tracking" ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">AWB Tracking Code</th>
                <th className="px-6 py-4">Courier Partner</th>
                <th className="px-6 py-4">Destination Pin Code</th>
                <th className="px-6 py-4">Est. Delivery Date</th>
                <th className="px-6 py-4">Shipment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {shipments.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold font-mono text-emerald-700">{s.awb}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{s.partner}</td>
                  <td className="px-6 py-4 font-mono text-gray-600">{s.destination}</td>
                  <td className="px-6 py-4 text-gray-500">{s.estDelivery}</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === "Delivery Partners" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-2">
            <h4 className="font-black text-gray-900">Delhivery Surface &amp; Express</h4>
            <p className="text-xs text-gray-500">19,000+ Pin codes served across India. Air &amp; Surface modes.</p>
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Connected</span>
          </div>
          <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-2">
            <h4 className="font-black text-gray-900">Bluedart Priority Express</h4>
            <p className="text-xs text-gray-500">Next-day air delivery for metro cities.</p>
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Connected</span>
          </div>
          <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-2">
            <h4 className="font-black text-gray-900">Xpressbees Fulfillment</h4>
            <p className="text-xs text-gray-500">First-mile &amp; last-mile logistics partner.</p>
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Connected</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs text-xs space-y-3">
          <h3 className="font-black text-base text-gray-900">Shipping Zones &amp; Flat Rate Rules</h3>
          <p className="text-gray-600">Standard Shipping: ₹49 flat rate for orders below ₹999. FREE delivery on orders above ₹999.</p>
        </div>
      )}
    </div>
  );
}
