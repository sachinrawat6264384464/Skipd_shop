"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchAdminHomepageSections,
  createAdminHomepageSection,
  updateAdminHomepageSection,
  deleteAdminHomepageSection
} from "lib/api";

const DEFAULT_SLIDES = [
  {
    id: 1,
    tag: "🌿 SUMMER SALE",
    title: "Refresh Your Style This ",
    highlightText: "Summer",
    description: "Discover up to 60% OFF on top-rated electronics, fashion, and lifestyle essentials. Guaranteed fast delivery across India.",
    primaryButtonText: "SHOP NOW",
    primaryButtonHref: "/search",
    secondaryButtonText: "EXPLORE DEALS",
    secondaryButtonHref: "/deals",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    badgeText: "60% OFF",
    bgGradient: "from-emerald-50 via-teal-50 to-emerald-100 border-emerald-200/80",
    tagColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white"
  },
  {
    id: 2,
    tag: "🔥 GREAT FREEDOM SALE",
    title: "Reach Every Home, Join Every ",
    highlightText: "Celebration!",
    description: "Get up to 70% OFF across 100% of India's serviceable pin codes with Shiprocket express delivery and instant coupons.",
    primaryButtonText: "START SHOPPING",
    primaryButtonHref: "/deals",
    secondaryButtonText: "VIEW OFFERS",
    secondaryButtonHref: "/search",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600",
    badgeText: "70% OFF",
    bgGradient: "from-amber-50 via-orange-50 to-amber-100 border-amber-200/80",
    tagColor: "bg-orange-100 text-orange-800 border-orange-300",
    btnColor: "bg-orange-600 hover:bg-orange-700 text-white"
  },
  {
    id: 3,
    tag: "⚡ TECH FRONTIER 2026",
    title: "Next-Gen Audio & Personal ",
    highlightText: "AI Devices",
    description: "Upgrade your daily setup with 165FPS gaming phones, studio ANC headphones & smart wearables.",
    primaryButtonText: "EXPLORE TECH",
    primaryButtonHref: "/search/tech",
    secondaryButtonText: "SEE ALL SPECS",
    secondaryButtonHref: "/product/active-anc-headphones",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    badgeText: "50% OFF",
    bgGradient: "from-blue-50 via-indigo-50 to-blue-100 border-blue-200/80",
    tagColor: "bg-blue-100 text-blue-800 border-blue-300",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white"
  }
];

export default function AdminHomepageManagerPage() {
  const [activeTab, setActiveTab] = useState<"banners" | "sections">("banners");
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Hero Banners State
  const [heroSlides, setHeroSlides] = useState<any[]>(DEFAULT_SLIDES);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [slideForm, setSlideForm] = useState({
    tag: "🔥 LIMITED OFFER",
    title: "Exclusive Deal on ",
    highlightText: "Top Products",
    description: "Get maximum discount with express doorstep delivery across India.",
    primaryButtonText: "SHOP NOW",
    primaryButtonHref: "/search",
    secondaryButtonText: "EXPLORE DEALS",
    secondaryButtonHref: "/deals",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    badgeText: "40% OFF",
    colorTheme: "emerald" // emerald | orange | blue | purple
  });

  const [newSection, setNewSection] = useState({
    title: "Pick up where you left off",
    section_type: "DEAL_BLOCK",
    href: "/search",
    position: 1,
    is_active: true
  });

  useEffect(() => {
    loadSections();
    loadHeroSlides();
  }, []);

  function loadHeroSlides() {
    try {
      const stored = localStorage.getItem("ecom_hero_banners");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHeroSlides(parsed);
          return;
        }
      }
    } catch {}
    setHeroSlides(DEFAULT_SLIDES);
  }

  const saveHeroSlides = (slides: any[]) => {
    localStorage.setItem("ecom_hero_banners", JSON.stringify(slides));
    window.dispatchEvent(new Event("ecom_banners_updated"));
    setHeroSlides(slides);
  };

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

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAdminHomepageSection(newSection);
    setShowModal(false);
    loadSections();
    alert(`✓ Homepage Section "${newSection.title}" created successfully!`);
  };

  const handleDeleteSection = async (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete section "${title}"?`)) {
      setSections(sections.filter(s => s.id !== id));
      await deleteAdminHomepageSection(id);
    }
  };

  // Hero Slide Handlers
  const handleOpenAddSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      tag: "🔥 SPECIAL OFFER",
      title: "Exclusive Savings on ",
      highlightText: "Best Brands",
      description: "Get up to 60% OFF with fast doorstep delivery across 100% of India.",
      primaryButtonText: "SHOP NOW",
      primaryButtonHref: "/search",
      secondaryButtonText: "EXPLORE DEALS",
      secondaryButtonHref: "/deals",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      badgeText: "50% OFF",
      colorTheme: "emerald"
    });
    setShowSlideModal(true);
  };

  const handleOpenEditSlide = (slide: any) => {
    setEditingSlide(slide);
    setSlideForm({
      tag: slide.tag || "",
      title: slide.title || "",
      highlightText: slide.highlightText || "",
      description: slide.description || "",
      primaryButtonText: slide.primaryButtonText || "SHOP NOW",
      primaryButtonHref: slide.primaryButtonHref || "/search",
      secondaryButtonText: slide.secondaryButtonText || "",
      secondaryButtonHref: slide.secondaryButtonHref || "/deals",
      imageUrl: slide.imageUrl || "",
      badgeText: slide.badgeText || "",
      colorTheme: slide.bgGradient?.includes("orange") ? "orange" : slide.bgGradient?.includes("blue") ? "blue" : "emerald"
    });
    setShowSlideModal(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    let themeConfig = {
      bgGradient: "from-emerald-50 via-teal-50 to-emerald-100 border-emerald-200/80",
      tagColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
    };
    if (slideForm.colorTheme === "orange") {
      themeConfig = {
        bgGradient: "from-amber-50 via-orange-50 to-amber-100 border-amber-200/80",
        tagColor: "bg-orange-100 text-orange-800 border-orange-300",
        btnColor: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20"
      };
    } else if (slideForm.colorTheme === "blue") {
      themeConfig = {
        bgGradient: "from-blue-50 via-indigo-50 to-blue-100 border-blue-200/80",
        tagColor: "bg-blue-100 text-blue-800 border-blue-300",
        btnColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
      };
    }

    const newSlideObj = {
      id: editingSlide ? editingSlide.id : Date.now(),
      tag: slideForm.tag,
      title: slideForm.title,
      highlightText: slideForm.highlightText,
      description: slideForm.description,
      primaryButtonText: slideForm.primaryButtonText,
      primaryButtonHref: slideForm.primaryButtonHref,
      secondaryButtonText: slideForm.secondaryButtonText,
      secondaryButtonHref: slideForm.secondaryButtonHref,
      imageUrl: slideForm.imageUrl,
      badgeText: slideForm.badgeText,
      ...themeConfig
    };

    let updated: any[];
    if (editingSlide) {
      updated = heroSlides.map(s => s.id === editingSlide.id ? newSlideObj : s);
    } else {
      updated = [...heroSlides, newSlideObj];
    }
    saveHeroSlides(updated);
    setShowSlideModal(false);
    alert(`🎉 Hero Slide saved! Storefront carousel updated with 2-second auto-slide right-to-left.`);
  };

  const handleDeleteSlide = (id: number | string) => {
    if (confirm("Are you sure you want to delete this Hero Slide?")) {
      saveHeroSlides(heroSlides.filter(s => s.id !== id));
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
            <h1 className="text-2xl font-black text-white mt-1">🏠 Homepage Banners &amp; Slider Manager</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage 2-second auto-sliding hero banners (Right to Left), deal cards, and promo sections</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("banners")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === "banners" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              🖼️ Hero Banners ({heroSlides.length})
            </button>
            <button
              onClick={() => setActiveTab("sections")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
                activeTab === "sections" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              📂 Deal Sections ({sections.length})
            </button>
          </div>
        </div>

        {/* ===== TAB 1: HERO SLIDES CAROUSEL MANAGER ===== */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#111827] border border-gray-800 p-6 rounded-3xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🎠 Dynamic Hero Banner Slides</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    2s Auto-Slide (Right to Left) • Hover-Pause
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">Add as many slides as you want! Slides automatically cycle every 2 seconds and pause on cursor hover.</p>
              </div>

              <button
                onClick={handleOpenAddSlide}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 cursor-pointer whitespace-nowrap"
              >
                + Add Hero Slide
              </button>
            </div>

            {/* Slides Preview Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {heroSlides.map((slide, idx) => (
                <div key={slide.id || idx} className="bg-[#111827] border border-gray-800 rounded-3xl p-5 space-y-4 relative overflow-hidden group hover:border-emerald-500/40 transition">
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-800 text-emerald-400 font-mono text-[11px] px-2.5 py-1 rounded-xl font-bold">
                      Slide #{idx + 1}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{slide.tag}</span>
                  </div>

                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
                    <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {slide.badgeText && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                        {slide.badgeText}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-white text-sm line-clamp-1">
                      {slide.title} <span className="text-emerald-400">{slide.highlightText}</span>
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{slide.description}</p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-800">
                    <button
                      onClick={() => handleOpenEditSlide(slide)}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Edit Slide
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {heroSlides.length > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { if (confirm("Reset slides to 3 default slides?")) saveHeroSlides(DEFAULT_SLIDES); }}
                  className="text-xs text-gray-500 hover:text-gray-300 border border-gray-800 px-4 py-2 rounded-xl bg-gray-900 transition cursor-pointer"
                >
                  🔄 Reset to 3 Default Banners
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB 2: SECTIONS MANAGER ===== */}
        {activeTab === "sections" && (
          <div className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Homepage Sections ({sections.length})</h3>
              <button
                onClick={() => setShowModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl"
              >
                + Add Section
              </button>
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
                            onClick={() => handleDeleteSection(sec.id, sec.title)}
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
        )}

      </div>

      {/* ➕ Hero Slide Add/Edit Modal */}
      {showSlideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black">{editingSlide ? "✏️ Edit Hero Slide" : "🖼️ Add New Hero Slide"}</h3>
              <button onClick={() => setShowSlideModal(false)} className="text-gray-400 hover:text-white font-black cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Top Tag Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🌿 SUMMER SALE"
                    value={slideForm.tag}
                    onChange={(e) => setSlideForm({ ...slideForm, tag: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Badge (Right Corner)</label>
                  <input
                    type="text"
                    placeholder="e.g. 60% OFF"
                    value={slideForm.badgeText}
                    onChange={(e) => setSlideForm({ ...slideForm, badgeText: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Main Title (First Part)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Refresh Your Style This "
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Highlight Text (Green Accent)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer"
                  value={slideForm.highlightText}
                  onChange={(e) => setSlideForm({ ...slideForm, highlightText: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  required
                  value={slideForm.description}
                  onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Image URL</label>
                <input
                  type="text"
                  required
                  value={slideForm.imageUrl}
                  onChange={(e) => setSlideForm({ ...slideForm, imageUrl: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Primary Button Text</label>
                  <input
                    type="text"
                    required
                    value={slideForm.primaryButtonText}
                    onChange={(e) => setSlideForm({ ...slideForm, primaryButtonText: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Primary Button Link</label>
                  <input
                    type="text"
                    required
                    value={slideForm.primaryButtonHref}
                    onChange={(e) => setSlideForm({ ...slideForm, primaryButtonHref: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Color Theme</label>
                <select
                  value={slideForm.colorTheme}
                  onChange={(e) => setSlideForm({ ...slideForm, colorTheme: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="emerald">🟢 Emerald Green (Summer Theme)</option>
                  <option value="orange">🟠 Warm Orange (Freedom Sale Theme)</option>
                  <option value="blue">🔵 Cyber Blue (Tech Theme)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 text-sm cursor-pointer mt-2"
              >
                {editingSlide ? "Update Slide" : "Save & Publish Slide to Homepage"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Section Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-md w-full p-6 text-white space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black">🏠 Create Homepage Section</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white font-black cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4 text-xs">
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
