"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory
} from "lib/api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    name: "",
    slug: "",
    icon: "📁",
    status: "Active"
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await fetchAdminCategories();
      if (data && Array.isArray(data)) {
        setCategories(data);
      }
    } catch (e) {
      console.error("Failed to load admin categories:", e);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) return;

    const res = await createAdminCategory({
      name: formState.name,
      slug: formState.slug || formState.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      icon: formState.icon || "📁",
      status: formState.status
    });

    if (res) {
      showToast(`✓ Category "${formState.name}" created & saved to PostgreSQL DB!`);
      await loadCategories();
    }
    setShowAddModal(false);
    setFormState({ name: "", slug: "", icon: "📁", status: "Active" });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const res = await updateAdminCategory(editingCategory.id, {
      name: formState.name,
      slug: formState.slug,
      icon: formState.icon,
      status: formState.status
    });

    if (res) {
      showToast(`✓ Category "${formState.name}" updated in DB!`);
      await loadCategories();
    }
    setShowEditModal(false);
    setEditingCategory(null);
  };

  const handleDelete = async () => {
    if (!deletingCategoryId) return;
    const res = await deleteAdminCategory(deletingCategoryId);
    if (res) {
      showToast(`🗑️ Category #${deletingCategoryId} permanently deleted from DB`);
      await loadCategories();
    }
    setDeletingCategoryId(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#EAF8F2] text-[#059669] border border-emerald-300 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl animate-bounce">
          {notification}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-emerald-700 font-bold hover:underline">&larr; Back to Admin</Link>
            <span className="text-gray-400">/</span>
            <span className="text-xs text-gray-500 font-bold">Categories Taxonomy</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">📁 Categories Taxonomy Manager</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage store categories, URL slugs, icons, and storefront display ordering • Live PostgreSQL Sync
          </p>
        </div>
        <button
          onClick={() => {
            setFormState({ name: "", slug: "", icon: "📁", status: "Active" });
            setShowAddModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <span>+ Add Category</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-bold">Loading Categories from PostgreSQL Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4">Associated Products</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg">{cat.icon || "📁"}</span>
                      <span className="font-bold text-gray-900 text-sm">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-emerald-700 font-bold">/category/{cat.slug}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{cat.count || 0} Items</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase border border-emerald-200">
                        ✓ {cat.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setFormState({ name: cat.name, slug: cat.slug, icon: cat.icon || "📁", status: cat.status || "Active" });
                          setShowEditModal(true);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeletingCategoryId(cat.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-black text-gray-900">+ Add New Category</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarees, Electronics, Footwear"
                  value={formState.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    setFormState({ ...formState, name, slug });
                  }}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formState.slug}
                  onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs font-mono text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Icon / Emoji</label>
                <input
                  type="text"
                  value={formState.icon}
                  onChange={(e) => setFormState({ ...formState, icon: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 font-bold py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-2.5 rounded-xl shadow-md">Create in DB</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-black text-gray-900">✏️ Edit Category #{editingCategory.id}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={formState.slug}
                  onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs font-mono text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Icon / Emoji</label>
                <input
                  type="text"
                  value={formState.icon}
                  onChange={(e) => setFormState({ ...formState, icon: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs text-gray-900 font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-100 font-bold py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white font-black py-2.5 rounded-xl shadow-md">✓ Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingCategoryId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 text-2xl flex items-center justify-center mx-auto">🗑️</div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Delete Category?</h3>
              <p className="text-xs text-gray-500 mt-1">Permanently remove category #{deletingCategoryId} from PostgreSQL Database?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeletingCategoryId(null)} className="flex-1 bg-gray-100 font-bold py-2.5 rounded-xl text-xs">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-black py-2.5 rounded-xl text-xs shadow-md">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
