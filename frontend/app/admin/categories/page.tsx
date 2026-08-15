"use client";

import { useState } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Mobiles & Smartphones", slug: "mobiles", count: 245, icon: "📱" },
    { id: 2, name: "Laptops & Computers", slug: "laptops", count: 120, icon: "💻" },
    { id: 3, name: "Audio & Headphones", slug: "electronics", count: 189, icon: "🎧" },
    { id: 4, name: "Apparel & Fashion", slug: "fashion", count: 340, icon: "👕" },
    { id: 5, name: "Footwear & Sneakers", slug: "footwear", count: 156, icon: "👟" },
    { id: 6, name: "Watches & Accessories", slug: "watches", count: 98, icon: "⌚" }
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📁 Categories Manager</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Organize product categories, URL slugs, icons, and storefront display ordering</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer">
          + Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">URL Slug</th>
                <th className="px-6 py-4">Products Count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg">{cat.icon}</span>
                    <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-700 font-bold">/category/{cat.slug}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{cat.count} Items</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="text-blue-600 font-bold hover:underline">Edit</button>
                    <button className="text-red-600 font-bold hover:underline">Delete</button>
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
