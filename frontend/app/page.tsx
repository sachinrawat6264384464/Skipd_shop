import Link from "next/link";
import Image from "next/image";
import { CategoryNav } from "components/layout/category-nav";
import { HeroSlider } from "components/carousel/hero-slider";
import { DynamicHomeShowcase } from "components/home/dynamic-home-showcase";
import { FlashSaleBanner } from "components/home/flash-sale-banner";
import { fetchProducts } from "lib/api";
import Footer from "components/layout/footer";

export const revalidate = 60;

export const metadata = {
  title: "E-COM | Modern Direct-to-Consumer Storefront",
  description: "Explore premium electronics, fashion, footwear, and accessories with instant Razorpay checkout and live tracking.",
};

export default async function HomePage() {
  const allProducts = await fetchProducts();

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen" suppressHydrationWarning>
      
      {/* 🏷️ Top Horizontal Category Navigation Bar */}
      <CategoryNav />

      {/* 🟢 Hero Carousel Banner */}
      <section className="w-full">
        <HeroSlider />
      </section>

      {/* ⚡ Live Flash Sale Deal Banner */}
      <section className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6">
        <FlashSaleBanner />
      </section>

      {/* 🚚 Trust & Delivery Features Strip */}
      <section className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 py-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs text-center">
          {[
            { icon: "🚚", title: "Free Shipping", sub: "On orders above ₹499" },
            { icon: "⚡", title: "Instant Dispatch", sub: "Dispatched within 24 hours" },
            { icon: "🛡️", title: "Secure Payment", sub: "100% secure payment" },
            { icon: "🏆", title: "Best Quality", sub: "Premium products only" },
          ].map((item) => (
            <div key={item.title} className="flex items-center justify-center gap-3 p-2">
              <span className="text-2xl">{item.icon}</span>
              <div className="text-left">
                <h4 className="font-bold text-xs text-gray-900">{item.title}</h4>
                <p className="text-[11px] text-gray-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 📦 Dynamic Home Showcase: Pick up where you left off & Category Showcase Blocks */}
      <div className="py-4">
        <DynamicHomeShowcase initialProducts={allProducts} />
      </div>

      {/* 🦶 Footer */}
      <Footer />
    </div>
  );
}
