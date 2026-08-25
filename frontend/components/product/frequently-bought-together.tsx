"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchFrequentlyBoughtTogetherAPI, getProductImageByTitle } from "lib/api";
import { useCart } from "components/cart/cart-context";

interface BundleProps {
  productId: number;
}

export function FrequentlyBoughtTogether({ productId }: BundleProps) {
  const { addCartItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [bundleData, setBundleData] = useState<any>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  useEffect(() => {
    loadBundleData();
  }, [productId]);

  async function loadBundleData() {
    setLoading(true);
    try {
      const data = await fetchFrequentlyBoughtTogetherAPI(productId);
      if (data && data.main_product) {
        setBundleData(data);
        const allIds = [data.main_product.id, ...(data.bundle_items || []).map((b: any) => b.id)];
        setSelectedItemIds(allIds);
      }
    } catch (e) {
      console.error("Error loading bundle data:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
        <div className="h-24 bg-slate-200 rounded-2xl w-full" />
      </div>
    );
  }

  if (!bundleData || !bundleData.main_product || !bundleData.bundle_items || bundleData.bundle_items.length === 0) {
    return null;
  }

  const allItems = [bundleData.main_product, ...bundleData.bundle_items];

  const toggleItem = (id: number) => {
    // Keep main product selected
    if (id === bundleData.main_product.id) return;
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedItems = allItems.filter(item => selectedItemIds.includes(item.id));
  const rawSum = selectedItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const hasMultipleSelected = selectedItems.length > 1;
  const discountedPrice = hasMultipleSelected ? Math.round(rawSum * 0.9) : rawSum;
  const totalSavings = rawSum - discountedPrice;

  const handleAddBundleToCart = () => {
    selectedItems.forEach(item => {
      const imgUrl = item.image || getProductImageByTitle(item.title);
      const variant = {
        id: String(item.id),
        title: "Default",
        availableForSale: true,
        selectedOptions: [{ name: "Title", value: "Default" }],
        price: { amount: String(item.price), currencyCode: "INR" }
      };
      const product = {
        id: String(item.id),
        handle: item.handle,
        title: item.title,
        featuredImage: { url: imgUrl, altText: item.title, width: 800, height: 800 },
        variants: [variant],
        images: [{ url: imgUrl, altText: item.title, width: 800, height: 800 }],
        availableForSale: true,
        description: "",
        descriptionHtml: "",
        options: [],
        priceRange: {
          maxVariantPrice: { amount: String(item.price), currencyCode: "INR" },
          minVariantPrice: { amount: String(item.price), currencyCode: "INR" }
        },
        seo: { title: item.title, description: "" },
        tags: [],
        updatedAt: ""
      };
      addCartItem(variant, product);
    });
  };

  return (
    <div className="my-10 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-slate-800 rounded-3xl shadow-xl space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/30">
              ⚡ Bundle Special Offer
            </span>
            <span className="text-xs text-amber-400 font-bold">Save 10% Extra</span>
          </div>
          <h3 className="text-xl font-black text-white mt-1">Frequently Bought Together</h3>
        </div>
        <p className="text-xs text-slate-400 font-medium">Add all matching accessories in 1-Click</p>
      </div>

      {/* Products Row with + Icons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-wrap items-center justify-center gap-4 flex-1">
          {allItems.map((item, idx) => {
            const isSelected = selectedItemIds.includes(item.id);
            const isMain = item.id === bundleData.main_product.id;
            const imgUrl = item.image || getProductImageByTitle(item.title);

            return (
              <div key={item.id} className="flex items-center gap-3">
                {/* Product Card */}
                <div
                  onClick={() => toggleItem(item.id)}
                  className={`relative p-3 rounded-2xl border transition cursor-pointer w-36 sm:w-40 bg-slate-900/90 text-center space-y-2 ${
                    isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isMain}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                  {isMain && (
                    <span className="absolute top-2 right-2 text-[9px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                      This Item
                    </span>
                  )}

                  <div className="w-20 h-20 mx-auto relative rounded-xl overflow-hidden bg-slate-950 p-1">
                    <Image
                      src={imgUrl}
                      alt={item.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>

                  <p className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-snug">
                    {item.title}
                  </p>

                  <p className="text-xs font-black text-emerald-400">
                    ₹{item.price?.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* + Separator */}
                {idx < allItems.length - 1 && (
                  <span className="text-xl font-black text-slate-500 shrink-0">+</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bundle Summary & CTA */}
        <div className="w-full md:w-64 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3 text-center md:text-left shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Bundle Price ({selectedItems.length} items):</p>
            <div className="flex items-baseline justify-center md:justify-start gap-2 mt-1">
              <span className="text-2xl font-black text-white">
                ₹{discountedPrice.toLocaleString("en-IN")}
              </span>
              {hasMultipleSelected && (
                <span className="text-xs text-slate-500 line-through font-bold">
                  ₹{rawSum.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {hasMultipleSelected && (
              <p className="text-xs text-emerald-400 font-extrabold mt-0.5">
                 You Save ₹{totalSavings.toLocaleString("en-IN")} (10% Off)
              </p>
            )}
          </div>

          <button
            onClick={handleAddBundleToCart}
            disabled={selectedItems.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span>🛒 Add Bundle To Cart</span>
          </button>
        </div>

      </div>

    </div>
  );
}
