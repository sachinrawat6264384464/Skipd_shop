"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  seedCatalogProducts
} from "lib/api";

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState("Products");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const tabs = ["Products", "Add Product", "Categories", "Sub Categories", "Brands", "Product Attributes", "Product Variants", "Reviews"];

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    title: "",
    handle: "",
    description: "",
    price: "",
    compare_at_price: "",
    stock_quantity: "50",
    category_slug: "tech",
    featured: true,
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    tags: "bestseller, tech"
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setLoading(false);
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) return;

    const payload = {
      title: newProduct.title,
      handle: newProduct.handle || newProduct.title.toLowerCase().replace(/\s+/g, "-"),
      description: newProduct.description || "Premium quality product",
      price: parseFloat(newProduct.price),
      compare_at_price: newProduct.compare_at_price ? parseFloat(newProduct.compare_at_price) : undefined,
      stock_quantity: parseInt(newProduct.stock_quantity) || 0,
      category_slug: newProduct.category_slug,
      featured: newProduct.featured,
      images: [newProduct.image_url],
      tags: newProduct.tags.split(",").map(t => t.trim())
    };

    const res = await createAdminProduct(payload);
    if (res) {
      alert("✅ Product Created Successfully!");
      setShowCreateModal(false);
      loadProducts();
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const payload = {
      title: editingProduct.title,
      price: parseFloat(editingProduct.price),
      compare_at_price: editingProduct.compare_at_price ? parseFloat(editingProduct.compare_at_price) : undefined,
      stock_quantity: parseInt(editingProduct.stock_quantity) || 0,
      description: editingProduct.description,
      featured: editingProduct.featured
    };

    const res = await updateAdminProduct(editingProduct.id, payload);
    if (res) {
      alert("✅ Product Updated Successfully!");
      setEditingProduct(null);
      loadProducts();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const res = await deleteAdminProduct(id);
      if (res) {
        alert("🗑️ Product Deleted");
        loadProducts();
      }
    }
  };

  const handleBulkSeed = async () => {
    setLoading(true);
    await seedCatalogProducts();
    await loadProducts();
    alert("⚡ 10+ Catalog Items Seeded into Database!");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-emerald-700 hover:underline">&larr; Back to Dashboard</Link>
            <span className="text-gray-400">/</span>
            <span className="text-xs text-gray-500 font-bold">Catalog</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">📦 Catalog &amp; Products Manager</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage products, stock quantities, attributes, variants, brands &amp; categories</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleBulkSeed}
            className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer hover:bg-blue-100"
          >
            ⚡ Seed 10+ Catalog Items
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
          >
            + Add New Product
          </button>
        </div>
      </div>

      {/* Catalog Sub-Tabs Navigation (Exact Spec) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "Add Product") setShowCreateModal(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === tab ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Table View */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-bold">Loading live catalog from database...</div>
      ) : (
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Selling Price</th>
                  <th className="px-6 py-4">Stock Quantity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {products.map((p) => {
                  const isOutOfStock = (p.stock_quantity ?? 100) <= 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200"}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{p.title}</p>
                          <p className="text-[10px] text-gray-400 font-mono">/product/{p.handle}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700 capitalize">{p.category_slug || p.category?.name || "General"}</td>
                      <td className="px-6 py-4 font-black text-gray-900 text-sm">
                        ₹{p.price?.toLocaleString("en-IN")}
                        {p.compare_at_price && (
                          <span className="text-gray-400 font-medium line-through ml-2 text-xs">
                            ₹{p.compare_at_price?.toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black text-xs ${isOutOfStock ? "text-red-600 font-bold" : "text-gray-900"}`}>
                          {p.stock_quantity ?? 100} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isOutOfStock ? (
                          <span className="bg-red-100 text-red-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase border border-red-200 animate-pulse">
                            🚫 OUT OF STOCK
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded uppercase border border-emerald-200">
                            ✓ IN STOCK
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingProduct({ ...p })}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-red-600 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">+ Create New Storefront Product</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-900 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM5 Headphones"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="29999"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                    placeholder="50"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl shadow-xs"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">✏️ Edit Product #{editingProduct.id}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-900 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Stock Quantity (0 = Out of Stock)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock_quantity ?? 100}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
