"use client";

import { useState } from "react";

export default function AdminBrandsPage() {
  const [brands] = useState([
    { id: 1, name: "OnePlus", logo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100", products: 45, status: "Active" },
    { id: 2, name: "Apple", logo: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=100", products: 89, status: "Active" },
    { id: 3, name: "Nike", logo: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=100", products: 120, status: "Active" },
    { id: 4, name: "Sony", logo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100", products: 34, status: "Active" }
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🏷️ Brands Manager</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage brand partners, manufacturer logos, and official brand pages</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer">
          + Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {brands.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
            <img src={b.logo} alt={b.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0" />
            <div>
              <h4 className="font-black text-gray-900 text-sm">{b.name}</h4>
              <p className="text-xs text-gray-400 font-medium">{b.products} Products</p>
              <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                {b.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
