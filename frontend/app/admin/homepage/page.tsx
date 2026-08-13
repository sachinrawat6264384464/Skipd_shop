"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchAdminHomepageSections,
  createAdminHomepageSection,
  updateAdminHomepageSection,
  deleteAdminHomepageSection
} from "lib/api";

export default function AdminHomepageManagerPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newSection, setNewSection] = useState({
    title: "Pick up where you left off",
    section_type: "DEAL_BLOCK",
    href: "/search",
    position: 1,
    is_active: true
  });

  useEffect(() => {
    loadSections();
  }, []);

  async function loadSections() {
    setLoading(true);
    const data = await fetchAdminHomepageSections();
    setSections(data);
    setLoading(false);
  }

  const handleToggle = async (id: number, currentActive: boolean) => {
    setSections(sections.map(s => s.id === id ? { ...s, is_active: !currentActive } : s));
    await updateAdminHomepageSection(id, { is_active: !currentActive });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAdminHomepageSection(newSection);
    setShowModal(false);
    loadSections();
    alert(`✓ Homepage Section "${newSection.title}" created successfully!`);
  };

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete section "${title}"?`)) {
      setSections(sections.filter(s => s.id !== id));
      await deleteAdminHomepageSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between p-6">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] border border-gray-800 p-6 rounded-3xl">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-xs text-emerald-400 hover:underline">&larr; Back to Dashboard</Link>
              <span className="text-gray-600">/</span>
              <span className="text-xs text-gray-400">Homepage Manager</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">🏠 Homepage Layout &amp; Deal Blocks Manager</h1>
            <p className="text-xs text-gray-400 mt-0.5">Add, reorder, or toggle homepage deal cards, carousels, and promo banners live</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            + Add New Homepage Section
          </button>
        </div>

        {/* List Table */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Homepage Sections ({sections.length})</h3>
            <span className="text-xs text-gray-400">Live ordering &amp; toggle visibility</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500 text-xs animate-pulse">Loading homepage layout from backend...</div>
          ) : sections.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs space-y-2">
              <p>No custom sections configured yet.</p>
              <p className="text-[11px] text-gray-600">The storefront displays default Amazon-style deal blocks &amp; wide banners.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Section Title</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Target URL</th>
                    <th className="px-6 py-4">Live Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 font-medium">
                  {sections.map((sec) => (
                    <tr key={sec.id} className="hover:bg-gray-900/40 transition">
                      <td className="px-6 py-4 font-mono text-gray-400">#{sec.position}</td>
                      <td className="px-6 py-4 font-bold text-white">{sec.title}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {sec.section_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono">{sec.href}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(sec.id, sec.is_active)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            sec.is_active
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}
                        >
                          {sec.is_active ? "🟢 Active (Visible)" : "🔴 Hidden"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(sec.id, sec.title)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-md w-full p-6 text-white space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black">🏠 Create Homepage Section</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white font-black">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Section Title</label>
                <input
                  type="text"
                  required
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Section Type</label>
                <select
                  value={newSection.section_type}
                  onChange={(e) => setNewSection({ ...newSection, section_type: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="DEAL_BLOCK">DEAL_BLOCK (4-Column Card Grid)</option>
                  <option value="WIDE_BANNER">WIDE_BANNER (Horizontal Scroll Strip)</option>
                  <option value="SCROLL_CAROUSEL">SCROLL_CAROUSEL (Product Items Carousel)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Target Link URL</label>
                <input
                  type="text"
                  value={newSection.href}
                  onChange={(e) => setNewSection({ ...newSection, href: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 text-sm cursor-pointer mt-4"
              >
                Save Section to Homepage
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
