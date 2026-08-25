"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchSimilarProductsAPI, getProductImageByTitle } from "lib/api";
import { useCart } from "components/cart/cart-context";

interface RecGridProps {
  productId: number;
  title?: string;
}

export function RecommendedProductsGrid({ productId, title = "You Might Also Like" }: RecGridProps) {
  const { addCartItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    loadRecommendations();
  }, [productId]);

  async function loadRecommendations() {
    setLoading(true);
    try {
      const data = await fetchSimilarProductsAPI(productId, 6);
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (e) {
      console.error("Error loading similar products recommendations:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleQuickAdd = (prod: any) => {
    const imgUrl = prod.image || getProductImageByTitle(prod.title);
    const variant = {
      id: String(prod.id),
      title: "Default",
      availableForSale: true,
      selectedOptions: [{ name: "Title", value: "Default" }],
      price: { amount: String(prod.price), currencyCode: "INR" }
    };
    const product = {
      id: String(prod.id),
      handle: prod.handle || `product-${prod.id}`,
      title: prod.title,
      featuredImage: { url: imgUrl, altText: prod.title, width: 800, height: 800 },
      variants: [variant],
      images: [{ url: imgUrl, altText: prod.title, width: 800, height: 800 }],
      availableForSale: true,
      description: "",
      descriptionHtml: "",
      options: [],
      priceRange: {
        maxVariantPrice: { amount: String(prod.price), currencyCode: "INR" },
        minVariantPrice: { amount: String(prod.price), currencyCode: "INR" }
      },
      seo: { title: prod.title, description: "" },
      tags: [],
      updatedAt: ""
    };
    addCartItem(variant, product);
  };

  if (loading) {
    return (
      <div className="my-10 space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="my-12 space-y-6">
      
      {/* Header Title */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-slate-900">{title}</span>
          <span className="bg-indigo-100 text-indigo-800 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
            🤖 AI Matched
          </span>
        </div>
        <Link href="/search" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
          View All Catalog →
        </Link>
      </div>

      {/* Grid of Similar Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {products.map((prod) => {
          const imgUrl = prod.image || getProductImageByTitle(prod.title);
          const matchPercentage = prod.match_percentage || 88;

          return (
            <div
              key={prod.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col justify-between hover:shadow-xl transition group relative overflow-hidden"
            >
              {/* Match Percentage Badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-slate-900 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                  {matchPercentage}% Match
                </span>
              </div>

              {/* Image & Link */}
              <Link href={`/product/${prod.handle || prod.id}`} className="block space-y-2">
                <div className="w-full h-36 relative rounded-xl overflow-hidden bg-slate-50">
                  <Image
                    src={imgUrl}
                    alt={prod.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    {prod.category}
                  </p>
                  <h4 className="font-extrabold text-slate-900 text-xs line-clamp-2 leading-snug group-hover:text-emerald-600 transition">
                    {prod.title}
                  </h4>
                </div>
              </Link>

              {/* Price & Quick Add Button */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <div>
                  <p className="font-black text-slate-900 text-xs">
                    ₹{prod.price?.toLocaleString("en-IN")}
                  </p>
                  {prod.compare_at_price > prod.price && (
                    <p className="text-[10px] text-slate-400 line-through">
                      ₹{prod.compare_at_price?.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleQuickAdd(prod)}
                  className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                  title="Quick Add"
                >
                  + Add
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
