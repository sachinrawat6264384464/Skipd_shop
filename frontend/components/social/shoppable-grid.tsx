"use client";

import Link from "next/link";

export function ShoppableInstagramGrid() {
  const posts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500",
      handle: "@streetwear_vibes",
      productTitle: "Minimalist Oversized Graphic Tee",
      price: "₹1,299",
      productHandle: "minimalist-graphic-tee"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      handle: "@audiophile_daily",
      productTitle: "Active ANC Wireless Headphones",
      price: "₹4,999",
      productHandle: "active-anc-headphones"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
      handle: "@lux_watches_in",
      productTitle: "Matte Black Chrono Leather Watch",
      price: "₹3,499",
      productHandle: "matte-black-chrono-watch"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500",
      handle: "@minimal_outfits",
      productTitle: "Minimalist Oversized Graphic Tee",
      price: "₹1,299",
      productHandle: "minimalist-graphic-tee"
    }
  ];

  return (
    <div className="my-10">
      <div className="text-center mb-8">
        <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-pink-700 bg-pink-50 border border-pink-200 rounded-full">
          #SKIPDStyle on Instagram
        </span>
        <h3 className="text-2xl md:text-4xl font-black text-gray-900 mt-3">Shop The Look</h3>
        <p className="text-gray-500 text-xs md:text-sm mt-1">
          Tag @ECOM_official on Instagram to get featured on our store!
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/product/${post.productHandle}`}
            className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xs block cursor-pointer"
          >
            <img
              src={post.image}
              alt={post.productTitle}
              className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Always visible bottom badge + rich hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-pink-300 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full self-start">
                {post.handle}
              </span>
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-white line-clamp-1">{post.productTitle}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-emerald-400 font-black">{post.price}</p>
                  <span className="bg-emerald-500 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-lg shadow-xs group-hover:bg-emerald-400 transition">
                    🛒 Shop Look &rsaquo;
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
