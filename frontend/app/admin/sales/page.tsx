"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchAdminAllSales,
  createAdminSale,
  updateAdminSale,
  deleteAdminSale,
  bulkAddSaleProducts,
  fetchProducts
} from "lib/api";

export default function AdminSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  // New Sale Form State
  const [newSale, setNewSale] = useState({
    title: "Great Freedom Sale",
    slug: "great-freedom-sale",
    subtitle: "Reach Every Home, Join Every Celebration!",
    badge_text: "LIVE NOW",
    hero_bg_color: "#f97316",
    status: "ACTIVE"
  });

  // Bulk Product Add State
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [salesData, productsData] = await Promise.all([
      fetchAdminAllSales(),
      fetchProducts()
    ]);
    setSales(salesData);
    setAllProducts(productsData);
    setLoading(false);
  }

  const handleToggleStatus = async (saleId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";
    setSales(sales.map(s => s.id === saleId ? { ...s, status: nextStatus } : s));
    await updateAdminSale(saleId, { status: nextStatus });
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createAdminSale(newSale);
    setShowCreateModal(false);
    loadData();
    alert(`🎉 Sale Event "${newSale.title}" created successfully! Status set to ${newSale.status}.`);
  };

  const handleDeleteSale = async (saleId: number, title: string) => {
    if (confirm(`Are you sure you want to delete sale "${title}"?`)) {
      setSales(sales.filter(s => s.id !== saleId));
      await deleteAdminSale(saleId);
    }
  };

  const handleBulkAdd = async () => {
    if (!selectedSaleId || selectedProductIds.length === 0) return;
    const productsToPayload = selectedProductIds.map(pid => {
      const prod = allProducts.find(p => p.id === pid);
      return {
        product_id: pid,
        sale_price: Math.round((prod?.price || 1000) * 0.7),
        original_price: prod?.price || 1000,
        shipping_type: "Easy Ship",
        weight_range: "<500gm"
      };
    });

    await bulkAddSaleProducts(selectedSaleId, productsToPayload);
    setShowBulkModal(false);
    setSelectedProductIds([]);
    loadData();
    alert(`✓ ${selectedProductIds.length} products bulk-added to Sale Event!`);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between p-6">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] border border-gray-800 p-6 rounded-3xl">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-xs text-emerald-400 hover:underline">&larr; Back to Dashboard</Link>
              <span className="text-gray-600">/</span>
              <span className="text-xs text-gray-400">Sale Events Manager</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">🔥 Sale Events &amp; Offers Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">Control live sales (Freedom Sale, Summer Sale), bulk add products, &amp; toggle live status</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xs px-5 py-3 rounded-2xl transition shadow-lg shadow-orange-600/20 cursor-pointer"
            >
              + Create Sale Event
            </button>
          </div>
        </div>

        {/* Sales List Table */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-base font-bold text-white">All Sale Events ({sales.length})</h3>
            <span className="text-xs text-gray-400">Changes reflect dynamically on `/deals`</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 text-xs animate-pulse">Loading sales events from backend...</div>
          ) : sales.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">No sale events created yet. Click "+ Create Sale Event" to start!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Sale Event Title</th>
                    <th className="px-6 py-4">Slug / URL</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Products</th>
                    <th className="px-6 py-4">Live Status Toggle</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-medium">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-900/40 transition">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.hero_bg_color || "#f97316" }}></span>
                        <div>
                          <span>{s.title}</span>
                          <span className="block text-[10px] text-gray-500 font-normal">{s.badge_text}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono">/deals (or /sales/{s.slug})</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          s.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{s.products_count || 8} items</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(s.id, s.status)}
                          className={`px-4 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            s.status === "ACTIVE"
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40"
                              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40"
                          }`}
                        >
                          {s.status === "ACTIVE" ? "🔴 Set DRAFT (Hide)" : "🟢 Make LIVE"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSaleId(s.id);
                            setShowBulkModal(true);
                          }}
                          className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 font-bold px-3 py-1.5 rounded-xl transition text-[11px] cursor-pointer"
                        >
                          + Bulk Add Products
                        </button>
                        <button
                          onClick={() => handleDeleteSale(s.id, s.title)}
                          className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 font-bold px-3 py-1.5 rounded-xl transition text-[11px] cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ➕ Create Sale Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-lg w-full p-6 text-white space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black">🔥 Create New Sale Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white font-black">✕</button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Sale Title</label>
                <input
                  type="text"
                  required
                  value={newSale.title}
                  onChange={(e) => setNewSale({ ...newSale, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Slug (URL identifier)</label>
                <input
                  type="text"
                  required
                  value={newSale.slug}
                  onChange={(e) => setNewSale({ ...newSale, slug: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Subtitle Banner Text</label>
                <input
                  type="text"
                  value={newSale.subtitle}
                  onChange={(e) => setNewSale({ ...newSale, subtitle: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Badge Label</label>
                  <input
                    type="text"
                    value={newSale.badge_text}
                    onChange={(e) => setNewSale({ ...newSale, badge_text: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Initial Status</label>
                  <select
                    value={newSale.status}
                    onChange={(e) => setNewSale({ ...newSale, status: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Live Now)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3 rounded-2xl transition shadow-lg shadow-orange-600/20 text-sm cursor-pointer mt-4"
              >
                Create &amp; Publish Sale Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📦 Bulk Add Products Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-xl w-full p-6 text-white space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black">📦 Bulk Add Products to Sale</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-white font-black">✕</button>
            </div>

            <p className="text-xs text-gray-400">Select products to include in this sale event with automatic 30% discount applied:</p>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-800 rounded-2xl p-3 bg-gray-900/50">
              {allProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${
                      isSelected ? "bg-orange-600/20 border border-orange-500/40" : "hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]);
                          else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                        }}
                        className="w-4 h-4 accent-orange-500 rounded"
                      />
                      <span className="font-bold text-white">{p.title}</span>
                    </div>
                    <span className="font-black text-emerald-400">₹{p.price}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-800">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAdd}
                disabled={selectedProductIds.length === 0}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Add {selectedProductIds.length} Products to Sale
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
