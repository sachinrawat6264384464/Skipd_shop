"use client";

import { use, useEffect, useState } from "react";
import Footer from "components/layout/footer";
import { ProductDetailView } from "components/product/product-detail-view";
import { CustomerReviewsSection } from "components/product/reviews-section";
import { ShoppableInstagramGrid } from "components/social/shoppable-grid";
import { fetchProductByHandle, fetchProducts, Product } from "lib/api";
import Link from "next/link";

export default function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = use(props.params);
  const handle = params.handle;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const prod = await fetchProductByHandle(handle);
        if (prod) {
          setProduct(prod);
          const [catProds, allProds] = await Promise.all([
            fetchProducts({ category: prod.category?.slug || "tech" }).catch(() => []),
            fetchProducts().catch(() => [])
          ]);
          const map = new Map();
          catProds.forEach(p => map.set(p.id, p));
          allProds.forEach(p => map.set(p.id, p));
          setRelatedProducts(Array.from(map.values()).filter(p => p.handle !== prod.handle));
        }
      } catch (e) {
        console.error("Failed to load product detail:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [handle]);

  if (loading) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-extrabold text-gray-700">Loading Product Specifications...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-4xl mx-auto border border-amber-200">
            🔍
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Product Not Found</h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto font-medium">
              The product handle "<span className="font-bold text-gray-800">{handle}</span>" could not be located in our catalog.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-md"
          >
            ← Back to Storefront
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between" suppressHydrationWarning>
      <div className="space-y-8 pb-12">
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
        <div className="max-w-7xl mx-auto px-4">
          <CustomerReviewsSection />
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <ShoppableInstagramGrid />
        </div>
      </div>
      <Footer />
    </div>
  );
}
