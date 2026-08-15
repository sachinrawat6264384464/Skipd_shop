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
  const [activeTab, setActiveTab] = useState<"sales" | "featured">("sales");

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

  // ✅ Featured Offers State (admin-controlled, saved to localStorage)
  const [featuredOffers, setFeaturedOffers] = useState<any[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerProductSearch, setOfferProductSearch] = useState("");
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [offerForm, setOfferForm] = useState({
    productId: 0,
    offerPrice: "",
    originalPrice: "",
    weight: "<500gm",
    easyShip: true
  });

  useEffect(() => {
    loadData();
    // Load existing featured offers from localStorage
    try {
      const stored = localStorage.getItem("skipd_featured_offers");
      if (stored) setFeaturedOffers(JSON.parse(stored));
    } catch {}
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

  const saveFeaturedOffersToStorage = (offers: any[]) => {
    localStorage.setItem("skipd_featured_offers", JSON.stringify(offers));
    setFeaturedOffers(offers);
  };

  const handleToggleStatus = async (saleId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";
    setSales(sales.map(s => s.id === saleId ? { ...s, status: nextStatus } : s));
    await updateAdminSale(saleId, { status: nextStatus });
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAdminSale(newSale);
    setShowCreateModal(false);
    loadData();
    alert(`🎉 Sale Event "${newSale.title}" created successfully!`);
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

  // Featured Offers Handlers
  const openAddOfferModal = () => {
    setEditingOffer(null);
    setOfferForm({ productId: 0, offerPrice: "", originalPrice: "", weight: "<500gm", easyShip: true });
    setOfferProductSearch("");
    setShowOfferModal(true);
  };

  const openEditOfferModal = (offer: any) => {
    setEditingOffer(offer);
    setOfferForm({
      productId: offer.id,
      offerPrice: String(offer.now),
      originalPrice: String(offer.earlier),
      weight: offer.weight,
      easyShip: offer.easyShip
    });
    setShowOfferModal(true);
  };

  const handleSaveOffer = () => {
    const selectedProduct = allProducts.find(p => p.id === offerForm.productId) ||
      (editingOffer ? { id: editingOffer.id, title: editingOffer.title, handle: editingOffer.handle, images: [editingOffer.image] } : null);
    if (!selectedProduct) { alert("Please select a product."); return; }
    const now = parseFloat(offerForm.offerPrice);
    const earlier = parseFloat(offerForm.originalPrice);
    if (!now || !earlier) { alert("Please enter valid prices."); return; }
    const offerEntry = {
      id: selectedProduct.id,
      title: selectedProduct.title,
      handle: selectedProduct.handle || selectedProduct.title?.toLowerCase().replace(/\s+/g, "-"),
      price: now,
      image: selectedProduct.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500",
      easyShip: offerForm.easyShip,
      weight: offerForm.weight,
      earlier: earlier,
      now: now,
      save: Math.round(earlier - now)
    };

    let updated: any[];
    if (editingOffer) {
      updated = featuredOffers.map(o => o.id === editingOffer.id ? offerEntry : o);
    } else {
      if (featuredOffers.find(o => o.id === selectedProduct.id)) {
        alert("This product is already in Featured Offers!"); return;
      }
      updated = [...featuredOffers, offerEntry];
    }
    saveFeaturedOffersToStorage(updated);
    setShowOfferModal(false);
    alert(`✅ "${selectedProduct.title}" added to Featured Freedom Sale Offers on /deals page!`);
  };

  const handleRemoveOffer = (offerId: number) => {
    if (confirm("Remove this product from Featured Offers?")) {
      saveFeaturedOffersToStorage(featuredOffers.filter(o => o.id !== offerId));
    }
  };

  const filteredProducts = allProducts.filter(p =>
    p.title?.toLowerCase().includes(offerProductSearch.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-xs text-emerald-700 hover:underline">&larr; Back to Dashboard</Link>
              <span className="text-gray-400">/</span>
              <span className="text-xs text-gray-500 font-bold">Marketing &amp; Sales</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mt-1">🎯 Marketing &amp; Promotional Campaigns</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Control live flash sales, featured freedom offers, promo codes, push notifications &amp; email marketing</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer"
            >
              + Create Flash Sale
            </button>
          </div>
        </div>

        {/* Marketing Sub-Tabs Navigation (Exact Spec) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border border-gray-200/80 p-2 rounded-2xl shadow-2xs">
          {["Flash Sales", "Featured Freedom Offers", "Coupons", "Discounts", "Banners", "Campaigns", "Notifications", "Email Campaigns"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                if (tab === "Featured Freedom Offers") setActiveTab("featured");
                else setActiveTab("sales");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                (activeTab === "featured" && tab === "Featured Freedom Offers") || (activeTab === "sales" && tab === "Flash Sales")
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ===== TAB: SALE EVENTS ===== */}
        {activeTab === "sales" && (
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
                            onClick={() => { setSelectedSaleId(s.id); setShowBulkModal(true); }}
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
        )}

        {/* ===== TAB: FEATURED OFFERS ===== */}
        {activeTab === "featured" && (
          <div className="space-y-4">
            {/* Header Info Card */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-orange-900/30 border border-emerald-700/40 rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-white">⭐ Featured Freedom Sale Offers</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Select products from your catalog, set offer prices — they'll appear live on the <span className="text-emerald-400 font-bold">/deals</span> page immediately.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] text-emerald-400 font-bold">{featuredOffers.length} products currently featured on /deals</span>
                  </div>
                </div>
                <button
                  onClick={openAddOfferModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 cursor-pointer whitespace-nowrap"
                >
                  + Add Featured Offer
                </button>
              </div>
            </div>

            {/* Featured Offers Grid */}
            {featuredOffers.length === 0 ? (
              <div className="bg-[#111827] border border-gray-800 rounded-3xl p-16 text-center space-y-3">
                <p className="text-4xl">⭐</p>
                <p className="text-gray-400 text-sm font-bold">No Featured Offers yet</p>
                <p className="text-gray-600 text-xs">Click "+ Add Featured Offer" to select a product from your catalog and set a special offer price.</p>
                <button
                  onClick={openAddOfferModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl transition cursor-pointer mt-4"
                >
                  + Add Your First Featured Offer
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredOffers.map((offer) => (
                  <div key={offer.id} className="bg-[#111827] border border-gray-800 rounded-3xl overflow-hidden group hover:border-emerald-700/50 transition">
                    {/* Product Image */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-2 right-2 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        ₹{offer.price}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        Save ₹{offer.save}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-3">
                      <h4 className="font-black text-white text-sm truncate">{offer.title}</h4>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-bold">MRP ₹{offer.earlier}</span>
                        <span className="bg-emerald-900/60 text-emerald-400 border border-emerald-700/40 px-2 py-0.5 rounded font-black">Offer ₹{offer.now}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="bg-orange-900/40 text-orange-400 border border-orange-700/30 px-2 py-0.5 rounded font-bold">
                          {offer.easyShip ? "🚚 Easy Ship" : "🏬 FC"}
                        </span>
                        <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-semibold">{offer.weight}</span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => openEditOfferModal(offer)}
                          className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 font-bold py-1.5 rounded-xl text-[11px] transition cursor-pointer"
                        >
                          Edit Price
                        </button>
                        <button
                          onClick={() => handleRemoveOffer(offer.id)}
                          className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 font-bold py-1.5 rounded-xl text-[11px] transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clear All button */}
            {featuredOffers.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => { if (confirm("Remove ALL featured offers from /deals?")) saveFeaturedOffersToStorage([]); }}
                  className="text-xs text-red-400 hover:text-red-300 font-bold border border-red-500/30 px-4 py-2 rounded-xl bg-red-900/10 hover:bg-red-900/20 transition cursor-pointer"
                >
                  🗑 Clear All Featured Offers
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ➕ Create Sale Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-lg w-full p-6 text-white space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black">🔥 Create New Sale Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white font-black cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Sale Title</label>
                <input type="text" required value={newSale.title} onChange={(e) => setNewSale({ ...newSale, title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Slug (URL identifier)</label>
                <input type="text" required value={newSale.slug} onChange={(e) => setNewSale({ ...newSale, slug: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Subtitle Banner Text</label>
                <input type="text" value={newSale.subtitle} onChange={(e) => setNewSale({ ...newSale, subtitle: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Badge Label</label>
                  <input type="text" value={newSale.badge_text} onChange={(e) => setNewSale({ ...newSale, badge_text: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Initial Status</label>
                  <select value={newSale.status} onChange={(e) => setNewSale({ ...newSale, status: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-orange-500 focus:outline-none">
                    <option value="ACTIVE">ACTIVE (Live Now)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3 rounded-2xl transition shadow-lg shadow-orange-600/20 text-sm cursor-pointer mt-4">
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
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-white font-black cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-gray-400">Select products to include in this sale event with automatic 30% discount applied:</p>
            <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-800 rounded-2xl p-3 bg-gray-900/50">
              {allProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                return (
                  <label key={p.id} className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${isSelected ? "bg-orange-600/20 border border-orange-500/40" : "hover:bg-gray-800"}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={isSelected} onChange={(e) => { if (e.target.checked) setSelectedProductIds([...selectedProductIds, p.id]); else setSelectedProductIds(selectedProductIds.filter(id => id !== p.id)); }} className="w-4 h-4 accent-orange-500 rounded" />
                      <span className="font-bold text-white">{p.title}</span>
                    </div>
                    <span className="font-black text-emerald-400">₹{p.price}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-800">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 bg-gray-800 text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-700 cursor-pointer">Cancel</button>
              <button onClick={handleBulkAdd} disabled={selectedProductIds.length === 0} className="px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer">
                Add {selectedProductIds.length} Products to Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ Add/Edit Featured Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl max-w-lg w-full p-6 text-white space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-lg font-black">{editingOffer ? "✏️ Edit Featured Offer Price" : "⭐ Add New Featured Offer"}</h3>
              <button onClick={() => setShowOfferModal(false)} className="text-gray-400 hover:text-white font-black cursor-pointer">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Product Selector */}
              {!editingOffer && (
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Search & Select Product</label>
                  <input
                    type="text"
                    placeholder="Type to search products..."
                    value={offerProductSearch}
                    onChange={(e) => setOfferProductSearch(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none mb-2"
                  />
                  <div className="max-h-44 overflow-y-auto space-y-1.5 border border-gray-800 rounded-xl p-2 bg-gray-900/50">
                    {filteredProducts.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No products found. Add products in Products Manager first.</p>
                    ) : filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setOfferForm({ ...offerForm, productId: p.id, originalPrice: String(p.price || "") });
                          setOfferProductSearch(p.title);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition cursor-pointer ${
                          offerForm.productId === p.id ? "bg-emerald-600/20 border border-emerald-500/40 text-emerald-300" : "hover:bg-gray-800 text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-left">
                          <img src={p.images?.[0] || ""} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-800" />
                          <span className="font-bold truncate max-w-[180px]">{p.title}</span>
                        </div>
                        <span className="font-black text-emerald-400 shrink-0">₹{p.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {editingOffer && (
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-3 flex items-center gap-3">
                  <img src={editingOffer.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-black text-white text-sm">{editingOffer.title}</p>
                    <p className="text-emerald-400 text-[10px] font-bold">Editing offer price</p>
                  </div>
                </div>
              )}

              {/* Price Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Original MRP (₹) — "Earlier"</label>
                  <input
                    type="number"
                    placeholder="e.g. 1299"
                    value={offerForm.originalPrice}
                    onChange={(e) => setOfferForm({ ...offerForm, originalPrice: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Offer Sale Price (₹) — "Now"</label>
                  <input
                    type="number"
                    placeholder="e.g. 799"
                    value={offerForm.offerPrice}
                    onChange={(e) => setOfferForm({ ...offerForm, offerPrice: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Savings Preview */}
              {offerForm.offerPrice && offerForm.originalPrice && (
                <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl px-4 py-3 text-[11px] flex items-center justify-between">
                  <span className="text-gray-400">Customer Savings Preview:</span>
                  <span className="text-emerald-400 font-black text-sm">Save ₹{Math.round(parseFloat(offerForm.originalPrice) - parseFloat(offerForm.offerPrice))} / unit</span>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Fulfillment Type</label>
                  <select
                    value={offerForm.easyShip ? "easy" : "fc"}
                    onChange={(e) => setOfferForm({ ...offerForm, easyShip: e.target.value === "easy" })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="easy">🚚 Easy Ship</option>
                    <option value="fc">🏬 FC (Fulfilled by Center)</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Weight Range</label>
                  <select
                    value={offerForm.weight}
                    onChange={(e) => setOfferForm({ ...offerForm, weight: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="<500gm">&lt;500gm</option>
                    <option value="500gm-1kg">500gm–1kg</option>
                    <option value="1kg-2kg">1kg–2kg</option>
                    <option value="2kg-5kg">2kg–5kg</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveOffer}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl transition shadow-lg shadow-emerald-600/20 text-sm cursor-pointer"
              >
                {editingOffer ? "Update Offer on /deals" : "Add to Featured Offers on /deals"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
