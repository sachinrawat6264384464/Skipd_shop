import { Metadata } from "next";
import Link from "next/link";
import Footer from "components/layout/footer";
import { ProductDetailView } from "components/product/product-detail-view";
import { CustomerReviewsSection } from "components/product/reviews-section";
import { ShoppableInstagramGrid } from "components/social/shoppable-grid";
import { fetchProductByHandle, fetchProducts } from "lib/api";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await fetchProductByHandle(params.handle);
  
  if (!product) {
    return {
      title: "Product Not Found | E-COM Commerce",
      description: "The requested product is not available in our store catalog."
    };
  }

  return {
    title: `${product.title} - Best Deals & Fast Delivery | E-COM`,
    description: product.description?.slice(0, 155) || `Buy ${product.title} at best price with 100% genuine quality guarantee and fast delivery.`,
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 155),
      images: product.images?.[0] ? [{ url: product.images[0] }] : []
    }
  };
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const handle = params.handle;

  // Server-Side Data Fetching for sub-second FCP & high Lighthouse Performance
  const product = await fetchProductByHandle(handle);

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
              The product handle &quot;<span className="font-bold text-gray-800">{handle}</span>&quot; could not be located in our catalog.
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

  const allProds = await fetchProducts().catch(() => []);
  const relatedProducts = allProds.filter(
    p => p.handle !== product.handle && String(p.id) !== String(product.id)
  );

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
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
