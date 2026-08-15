"use client";

import { useState } from "react";

export default function AdminInventoryPage() {
  const [items] = useState([
    { id: 1, title: "iPhone 15 Pro Max", sku: "IPH-15PM-256", stock: 8, status: "LOW_STOCK", warehouse: "Delhi FC" },
    { id: 2, title: "Sony WH-1000XM5", sku: "SNY-XM5-BLK", stock: 12, status: "LOW_STOCK", warehouse: "Bengaluru FC" },
    { id: 3, title: "OnePlus Nord 6", sku: "1P-N6-256", stock: 50, status: "IN_STOCK", warehouse: "Mumbai FC" },
    { id: 4, title: "Saree Premium Silk", sku: "SAR-SILK-01", stock: 0, status: "OUT_OF_STOCK", warehouse: "Ahmedabad FC" }
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🏬 Inventory &amp; Warehouse Fulfillment</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time stock reservation, warehouse allocations, SKU tracking &amp; low stock alerts</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Warehouse Location</th>
                <th className="px-6 py-4">Stock Quantity</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{item.sku}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{item.warehouse}</td>
                  <td className="px-6 py-4 font-black text-sm text-gray-900">{item.stock} units</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                      item.status === "IN_STOCK" ? "bg-emerald-100 text-emerald-800" :
                      item.status === "LOW_STOCK" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800 animate-pulse"
                    }`}>
                      {item.status}
                    </span>
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
