"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchProducts, Product } from "lib/api";

export function ShoppableInstagramGrid() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const items = await fetchProducts();
      setProducts(items.slice(0, 4));
    }
    loadProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="my-10">
      <div className="text-center mb-8">
        <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#B8860B] bg-[#F4EFE6] border border-[#E8E1D1] rounded-full">
          #BotComStyle on Instagram
        </span>
        <h3 className="text-2xl md:text-4xl font-black text-[#2C221E] mt-3">Shop The Look</h3>
        <p className="text-stone-500 text-xs md:text-sm mt-1">
          Tag @BotCom_official on Instagram to get featured on our store!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p, idx) => (
          <Link
            key={p.id}
            href={`/product/${p.handle}`}
            className="group relative overflow-hidden rounded-3xl border border-[#E8E1D1] bg-[#FFFDF9] shadow-xs block cursor-pointer"
          >
            <img
              src={p.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"}
              alt={p.title}
              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Always visible bottom badge + rich hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-amber-200 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full self-start">
                @trend_spotlight_{idx + 1}
              </span>
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-white line-clamp-1">{p.title}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-amber-300 font-black">₹{p.price.toLocaleString("en-IN")}</p>
                  <span className="bg-blue-600 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-xs group-hover:bg-blue-500 transition">
                    Shop Look &rsaquo;
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
