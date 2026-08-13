import Footer from "components/layout/footer";
import { ProductDetailView } from "components/product/product-detail-view";
import { CustomerReviewsSection } from "components/product/reviews-section";
import { ShoppableInstagramGrid } from "components/social/shoppable-grid";
import { fetchProductByHandle, fetchProducts } from "lib/api";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const product = await fetchProductByHandle(params.handle);

  if (!product) return { title: "Product Not Found | SKIPD" };

  return {
    title: `${product.title} | SKIPD Commerce`,
    description: product.description,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const product = await fetchProductByHandle(params.handle);
  if (!product) return notFound();

  let catProducts = await fetchProducts({ category: product.category?.slug || "tech" });
  let allProducts = await fetchProducts();

  const map = new Map();
  catProducts.forEach(p => map.set(p.id, p));
  allProducts.forEach(p => map.set(p.id, p));

  const relatedProducts = Array.from(map.values()).filter(p => p.handle !== product.handle);

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between" suppressHydrationWarning>
      <div className="space-y-8 pb-12">
        {/* Amazon-style Product Hero, Buy Box & Carousels */}
        <ProductDetailView product={product} relatedProducts={relatedProducts} />

        {/* Customer Reviews Section */}
        <div className="max-w-7xl mx-auto px-4">
          <CustomerReviewsSection />
        </div>

        {/* Shoppable Instagram Grid */}
        <div className="max-w-7xl mx-auto px-4">
          <ShoppableInstagramGrid />
        </div>
      </div>

      <Footer />
    </div>
  );
}
