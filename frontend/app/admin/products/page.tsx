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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    title: "",
    handle: "",
    description: "",
    price: "",
    compare_at_price: "",
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
      category_slug: newProduct.category_slug,
      featured: newProduct.featured,
      images: [newProduct.image_url],
      tags: newProduct.tags.split(",").map(t => t.trim())
    };

    await createAdminProduct(payload);
    setShowCreateModal(false);
    setNewProduct({
      title: "",
      handle: "",
      description: "",
      price: "",
      compare_at_price: "",
      category_slug: "tech",
      featured: true,
      image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      tags: "bestseller, tech"
    });
    loadProducts();
    alert(`🎉 Product "${payload.title}" created successfully!`);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    await updateAdminProduct(editingProduct.id, {
      title: editingProduct.title,
      price: parseFloat(editingProduct.price),
      compare_at_price: editingProduct.compare_at_price ? parseFloat(editingProduct.compare_at_price) : null,
      description: editingProduct.description,
      featured: editingProduct.featured,
      images: [editingProduct.images?.[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"]
    });

    setEditingProduct(null);
    loadProducts();
    alert(`✓ Product updated successfully!`);
  };

  const handleDeleteProduct = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete product "${title}"?`)) {
      setProducts(products.filter(p => p.id !== id));
      await deleteAdminProduct(id);
    }
  };

  const handleBulkSeed = async () => {
    setLoading(true);
    const res = await seedCatalogProducts();
    await loadProducts();
    alert(`⚡ Catalog Seed Complete: ${res.message || "10+ rich items added!"}`);
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
              <span className="text-xs text-gray-400">Products Catalog</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">📦 Catalog &amp; Products Manager</h1>
            <p className="text-xs text-gray-400 mt-0.5">Add, edit, or delete storefront products dynamically with instant database sync</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleBulkSeed}
              className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 font-bold text-xs px-4 py-3 rounded-2xl transition cursor-pointer"
            >
              ⚡ Seed 10+ Catalog Items
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              + Add New Product
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Catalog Products ({products.length})</h3>
            <span className="text-xs text-gray-400">Real-time storefront API synchronization</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 text-xs animate-pulse">Loading product catalog from database...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs space-y-3">
              <p>No products in database yet.</p>
              <button
                onClick={handleBulkSeed}
                className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Click here to Seed 10+ Catalog Items
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Product Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price (₹)</th>
                    <th className="px-6 py-4">MRP (₹)</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-900/40 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200"}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-900 border border-gray-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-sm line-clamp-1">{p.title}</p>
                          <p className="text-[10px] text-gray-400 font-mono">/product/{p.handle}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {p.category?.name || p.category?.slug || "Tech"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-white text-sm">₹{p.price?.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-gray-400 line-through">
                        {p.compare_at_price ? `₹${p.compare_at_price.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.featured ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-gray-800 text-gray-400"
                        }`}>
                          {p.featured ? "★ Featured" : "Standard"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 font-bold px-3 py-1.5 rounded-xl transition text-[11px] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.title)}
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

      {/* ➕ Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black">📦 Add New Catalog Product</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white font-black">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OnePlus Nord 6 | 8GB+256GB"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="44499"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">MRP / Compare Price (₹)</label>
                  <input
                    type="number"
                    placeholder="52999"
                    value={newProduct.compare_at_price}
                    onChange={(e) => setNewProduct({ ...newProduct, compare_at_price: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Category</label>
                  <select
                    value={newProduct.category_slug}
                    onChange={(e) => setNewProduct({ ...newProduct, category_slug: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="tech">Tech &amp; Electronics</option>
                    <option value="apparel">Apparel &amp; Fashion</option>
                    <option value="lifestyle">Lifestyle &amp; Watches</option>
                    <option value="mobiles">Mobiles</option>
                    <option value="footwear">Footwear</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Featured on Homepage</label>
                  <select
                    value={newProduct.featured ? "true" : "false"}
                    onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.value === "true" })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="true">YES (Featured)</option>
                    <option value="false">NO (Standard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Main Image URL</label>
                <input
                  type="text"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 text-sm cursor-pointer mt-2"
              >
                Publish Product to Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✏️ Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black">✏️ Edit Product details</h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-white font-black">✕</button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">MRP (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.compare_at_price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Image URL</label>
                <input
                  type="text"
                  value={editingProduct.images?.[0] || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-2xl transition shadow-lg shadow-blue-600/20 text-sm cursor-pointer mt-2"
              >
                Save Product Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
