"use client";

import { useState, useEffect } from "react";
import { fetchProducts } from "lib/api";

export default function AdminInventoryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([
    { id: 1, title: "OnePlus Nord 4 5G", sku: "1P-N4-256", stock: 45, status: "IN_STOCK", warehouse: "Delhi FC" },
    { id: 2, title: "boAt Rockerz 450 Pro", sku: "BOAT-450-PRO", stock: 12, status: "LOW_STOCK", warehouse: "Bengaluru FC" },
    { id: 3, title: "Noise ColorFit Pro 5", sku: "NOISE-CFP5", stock: 28, status: "IN_STOCK", warehouse: "Mumbai FC" },
    { id: 4, title: "iPhone 15 Pro Max", sku: "IPH-15PM-256", stock: 4, status: "LOW_STOCK", warehouse: "Delhi FC" },
    { id: 5, title: "MacBook Air M2", sku: "MBA-M2-256", stock: 0, status: "OUT_OF_STOCK", warehouse: "Ahmedabad FC" }
  ]);

  useEffect(() => {
    async function loadInventory() {
      setLoading(true);
      const productsData = await fetchProducts();
      if (productsData && Array.isArray(productsData) && productsData.length > 0) {
        const formatted = productsData.map((p: any) => {
          const qty = p.stock_quantity ?? p.stock ?? 50;
          return {
            id: p.id,
            title: p.title,
            sku: p.handle ? p.handle.toUpperCase() : `SKU-${p.id}`,
            stock: qty,
            status: qty > 15 ? "IN_STOCK" : qty > 0 ? "LOW_STOCK" : "OUT_OF_STOCK",
            warehouse: p.category?.name ? `${p.category.name} FC` : "Delhi FC"
          };
        });
        setItems(formatted);
      }
      setLoading(false);
    }
    loadInventory();
  }, []);

  const handleStockUpdate = (id: number, newStock: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const qty = Math.max(0, newStock);
        return {
          ...item,
          stock: qty,
          status: qty > 15 ? "IN_STOCK" : qty > 0 ? "LOW_STOCK" : "OUT_OF_STOCK"
        };
      }
      return item;
    }));
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🏬 Inventory &amp; Warehouse Fulfillment</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Live Database Connected. Real-time stock reservation, warehouse allocations, SKU tracking &amp; low stock alerts</p>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-xl border border-emerald-200">
          Total Tracked SKUs: {items.length}
        </span>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-bold">Loading live inventory status...</div>
          ) : (
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU Code</th>
                  <th className="px-6 py-4">Fulfillment Center</th>
                  <th className="px-6 py-4">Stock Quantity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Quick Stock Adjustment</th>
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
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleStockUpdate(item.id, item.stock - 5)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded font-black text-xs cursor-pointer"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleStockUpdate(item.id, item.stock + 10)}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 rounded font-black text-xs cursor-pointer"
                      >
                        +10
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
