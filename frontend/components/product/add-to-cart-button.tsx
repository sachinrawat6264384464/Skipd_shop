"use client";

import Link from "next/link";

export function AddToCartButton({ productHandle }: { productHandle: string }) {
  const handleAddToCart = () => {
    alert("Item successfully added to your shopping cart!");
  };

  return (
    <div className="space-y-3 pt-4">
      <Link
        href={`/checkout?product=${productHandle}`}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black text-center font-black text-sm py-4 rounded-2xl transition shadow-md shadow-emerald-500/20 block"
      >
        💳 Buy Now with Razorpay
      </Link>
      <button
        onClick={handleAddToCart}
        className="w-full bg-gray-900 hover:bg-black text-white text-center font-bold text-sm py-3.5 rounded-2xl transition shadow-xs block cursor-pointer"
      >
        🛒 Add to Shopping Cart
      </button>
    </div>
  );
}
