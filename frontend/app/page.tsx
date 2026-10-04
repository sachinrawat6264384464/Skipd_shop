import Link from "next/link";
import Image from "next/image";
import { CategoryNav } from "components/layout/category-nav";
import { HeroSlider } from "components/carousel/hero-slider";
import { DynamicHomeShowcase } from "components/home/dynamic-home-showcase";
import { TiltedCardGallery } from "components/home/tilted-card-gallery";
import { FlashSaleBanner } from "components/home/flash-sale-banner";
import { fetchProducts } from "lib/api";
import Footer from "components/layout/footer";

export const revalidate = 60;

export const metadata = {
  title: "BotCom | Modern Direct-to-Consumer Storefront",
  description: "Explore premium electronics, fashion, footwear, and accessories with instant Razorpay checkout and live tracking.",
};

export default async function HomePage() {
  const allProducts = await fetchProducts();

  return (
    <div className="bg-[#FAF7F2] text-gray-900 min-h-screen" suppressHydrationWarning>
      
      {/* 🟢 Hero Carousel Banner */}
      <section className="w-full">
        <HeroSlider />
      </section>

      {/* 🏷️ Horizontal Category Navigation Bar */}
      <CategoryNav />

      {/* 📦 Dynamic Home Showcase: Pick up where you left off & Category Showcase Blocks */}
      <div className="py-4">
        <DynamicHomeShowcase initialProducts={allProducts} />
      </div>

      {/* 🃏 Tilted Card Story Gallery Deck */}
      <TiltedCardGallery />

      {/* ⚡ Live Flash Sale Deal Banner (Right above Footer) */}
      <section className="w-full max-w-full px-4 sm:px-6 lg:px-10">
        <FlashSaleBanner />
      </section>

      {/* 🦶 Footer */}
      <Footer />
    </div>
  );
}
