import Link from "next/link";
import Image from "next/image";
import { CategoryNav } from "components/layout/category-nav";
import { HeroSlider } from "components/carousel/hero-slider";
import { fetchProducts } from "lib/api";
import Footer from "components/layout/footer";
import { BuyNowButton } from "components/auth/buy-now-button";

export const metadata = {
  title: "SKIPD | Modern Direct-to-Consumer Storefront",
  description: "Explore premium electronics, fashion, footwear, and accessories with instant Razorpay checkout and Shiprocket live tracking.",
};

// 🏠 Category Deal Blocks (Amazon-style 4-column grid with dynamic % OFF calculations)
const CATEGORY_DEALS = [
  {
    title: "Pick up where you left off",
    href: "/orders",
    items: [
      { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", label: "boAt Rockerz 550", price: "₹1,799", mrp: "₹4,990" },
      { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", label: "Sony WH-1000XM5", price: "₹24,990", mrp: "₹34,990" },
      { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", label: "JBL Tune 770NC", price: "₹6,499", mrp: "₹9,999" },
      { img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", label: "Noise Buds VS104", price: "₹1,499", mrp: "₹2,999" },
    ]
  },
  {
    title: "Keep shopping for it",
    href: "/search/tech",
    items: [
      { img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300", label: "OnePlus Nord 6 | 8GB+...", price: "₹44,499", mrp: "₹52,999" },
      { img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300", label: "iQOO Z11x 5G | Prismat...", price: "₹24,999", mrp: "₹29,999" },
      { img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300", label: "Samsung Galaxy M17 5...", price: "₹18,999", mrp: "₹22,999" },
      { img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300", label: "Samsung Galaxy M36 5...", price: "₹19,999", mrp: "₹24,999" },
    ]
  },
  {
    title: "Up to 50% off | Select collection",
    href: "/search?sort=price-asc",
    items: [
      { img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300", label: "House of Himalayas Barnyard Millet Biscuits...", price: "₹297", mrp: "₹350" },
      { img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300", label: "Organic Oats Premium Pack 1kg", price: "₹199", mrp: "₹350" },
      { img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300", label: "Jhangora Biscuits 50% Unpolished...", price: "₹149", mrp: "₹250" },
      { img: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300", label: "Ragi Cookies Natural 200g", price: "₹129", mrp: "₹200" },
    ]
  },
  {
    title: "Personal safety supplies",
    href: "/search",
    items: [
      { img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300", label: "N95 Respirator Mask 10 Pcs Pack", price: "₹399", mrp: "₹699" },
      { img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300", label: "Dettol Hand Sanitizer 500ml", price: "₹199", mrp: "₹299" },
      { img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300", label: "Safety Gloves Nitrile 100 Pcs", price: "₹349", mrp: "₹599" },
      { img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300", label: "First Aid Kit Complete Box", price: "₹449", mrp: "₹799" },
    ]
  }
];

// 🔖 Category Promo Grid (Amazon-style 4-col with direct catalog links)
const PROMO_BOXES = [
  {
    title: "Under ₹499 | Pocket-friendly fashion",
    href: "/search?max=499",
    items: [
      { img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300", label: "Clothes", href: "/category/fashion" },
      { img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300", label: "Backpacks", href: "/category/fashion" },
      { img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300", label: "Shoes", href: "/category/footwear" },
      { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300", label: "Watches", href: "/category/watches" },
    ]
  },
  {
    title: "Kitchen Products",
    href: "/category/lifestyle",
    items: [
      { img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300", label: "Microwave Ovens", href: "/product/microwave-oven-28l" },
      { img: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=300", label: "Air Fryers", href: "/product/air-fryer-5l" },
      { img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300", label: "Pressure Cookers", href: "/product/pressure-cooker-5l" },
      { img: "https://images.unsplash.com/photo-1547592180-85f173990554?w=300", label: "Cookware Sets", href: "/product/granite-cookware-set" },
    ]
  },
  {
    title: "Up to 50% off | Furniture",
    href: "/category/home",
    items: [
      { img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300", label: "Sofas & Sectionals", href: "/product/modern-3seater-sofa" },
      { img: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=300", label: "Study Chairs", href: "/product/study-chair-ergonomic" },
      { img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300", label: "Wardrobes", href: "/product/3-door-wardrobe" },
      { img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=300", label: "Beds & Mattresses", href: "/product/queen-wood-bed" },
    ]
  },
  {
    title: "Bestsellers in Sports, Fitness & Outdoors",
    href: "/category/sports",
    items: [
      { img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300", label: "Dumbbells & Weights", href: "/product/hex-dumbbells-10kg" },
      { img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300", label: "Pull-up Bars", href: "/product/pull-up-bar" },
      { img: "https://images.unsplash.com/photo-1593476550610-87baa860004a?w=300", label: "Yoga Mats", href: "/product/extra-thick-yoga-mat" },
      { img: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=300", label: "Protein Shakers", href: "/product/whey-protein-1kg" },
    ]
  }
];

export default async function HomePage() {
  const allProducts = await fetchProducts();
  const bestSellers = allProducts.length > 0 ? allProducts.slice(0, 4) : [];
  
  let techProducts = allProducts.filter(p => 
    p.category?.slug === "mobiles" || p.category?.slug === "electronics" || p.tags?.some(t => ["mobiles", "tech", "laptop", "audio"].includes(t))
  );
  if (techProducts.length < 4) techProducts = allProducts;

  let apparelProducts = allProducts.filter(p => 
    p.category?.slug === "apparel" || p.category?.slug === "fashion" || p.category?.slug === "footwear" || p.tags?.some(t => ["apparel", "fashion", "footwear"].includes(t))
  );
  if (apparelProducts.length < 4) apparelProducts = allProducts;

  let storageProducts = allProducts.filter(p => 
    p.category?.slug === "home" || p.tags?.some(t => ["home", "furniture", "storage"].includes(t))
  );
  if (storageProducts.length < 4) storageProducts = allProducts;

  let artisanProducts = allProducts.filter(p => 
    p.category?.slug === "artisan" || p.tags?.some(t => ["artisan", "organic"].includes(t))
  );
  if (artisanProducts.length < 4) artisanProducts = allProducts;

  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen" suppressHydrationWarning>
      
      {/* 🏷️ Top Horizontal Category Navigation Bar */}
      <CategoryNav />

      {/* 🟢 Hero Carousel Banner (2-Second Auto-Slide Right-to-Left, Hover-Pause, Admin Configurable) */}
      <section className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <HeroSlider />
      </section>

      {/* 🚚 Trust & Delivery Features Strip */}
      <section className="max-w-7xl mx-auto px-4 py-2">
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

      {/* 📦 Amazon-style 4-Column Category Deal Cards */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_DEALS.map((block) => (
            <div key={block.title} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-black text-gray-900 leading-snug">{block.title}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {block.items.map((item, i) => {
                  const numPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, ""));
                  const numMrp = item.mrp ? parseFloat(String(item.mrp).replace(/[^0-9.]/g, "")) : 0;
                  const offPercent = numMrp > numPrice && numPrice > 0 ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

                  return (
                    <Link
                      key={i}
                      href={(item as any).href || block.href || "/search"}
                      className="group space-y-1 block cursor-pointer"
                    >
                      <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover:border-emerald-400 transition">
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        {offPercent > 0 && (
                          <div className="absolute top-1 left-1 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-2xs">
                            {offPercent}% OFF
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-700 font-bold group-hover:text-emerald-700 transition line-clamp-2 leading-tight">{item.label}</p>
                      <div className="flex flex-wrap items-baseline gap-1">
                        <span className="text-xs font-black text-gray-900">{item.price}</span>
                        {item.mrp && <span className="text-[9px] text-gray-400 line-through">MRP: {item.mrp}</span>}
                        {offPercent > 0 && (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                            {offPercent}% off
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link href={block.href} className="text-xs font-bold text-amber-700 hover:underline block pt-1">
                See more
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 🌄 Wide Banner Strip — Handmade by Artisans */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="flex justify-between items-center px-5 pt-4 pb-3">
            <h3 className="text-sm font-black text-gray-900">Minimum 40% off | Handmade products by artisans</h3>
            <Link href="/category/artisan" className="text-xs font-bold text-amber-700 hover:underline">See all offers</Link>
          </div>
          <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
            {artisanProducts.slice(0, 6).map((product, i) => {
              const offPercent = product.compare_at_price ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 40;
              return (
                <Link key={product.handle || i} href={`/product/${product.handle}`} className="shrink-0 w-40 h-28 relative rounded-xl overflow-hidden hover:opacity-90 transition border border-gray-100 bg-gray-50 group">
                  <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute bottom-1 right-1 bg-emerald-700 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-2xs">
                    {offPercent}% OFF
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🏷️ Amazon-style 4-column Category Promo Grid */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROMO_BOXES.map((box) => (
            <div key={box.title} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-gray-900 leading-snug">{box.title}</h3>
              <div className="grid grid-cols-2 gap-2">
                {box.items.map((item, i) => (
                  <Link key={i} href={(item as any).href || box.href} className="group space-y-1 block cursor-pointer">
                    <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover:border-emerald-300 transition">
                      <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <p className="text-[10px] text-gray-700 font-bold group-hover:text-emerald-700 transition line-clamp-1">{item.label}</p>
                  </Link>
                ))}
              </div>
              <Link href={box.href} className="text-xs font-bold text-amber-700 hover:underline block pt-1">
                See all offers
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 🏠 Home & Kitchen Storage Wide Scroll Banner */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="flex justify-between items-center px-5 pt-4 pb-3">
            <h3 className="text-sm font-black text-gray-900">Up to 50% off | Home &amp; Kitchen Storage</h3>
            <Link href="/category/home" className="text-xs font-bold text-amber-700 hover:underline">See more</Link>
          </div>
          <div className="flex gap-3 px-5 pb-4 overflow-x-auto scrollbar-hide">
            {storageProducts.slice(0, 6).map((product, i) => {
              const offPercent = product.compare_at_price ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0;
              return (
                <Link key={product.handle || i} href={`/product/${product.handle}`} className="shrink-0 group text-center space-y-1.5">
                  <div className="w-36 h-28 relative rounded-xl overflow-hidden border border-gray-100 group-hover:border-emerald-300 transition bg-gray-50">
                    <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {offPercent > 0 && (
                      <div className="absolute bottom-1 right-1 bg-emerald-700 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-2xs">
                        {offPercent}% OFF
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-700 font-bold w-36 truncate group-hover:text-emerald-700 transition">{product.title}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 🛒 "Best Selling Products" — Dynamic from Backend */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-6">
          
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-gray-900">Best Selling Products</h2>
            <Link href="/search" className="text-xs font-bold text-emerald-700 hover:underline">
              View All &gt;
            </Link>
          </div>

          {bestSellers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <p>Loading best sellers from our catalog...</p>
              <Link href="/search" className="inline-block mt-3 bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition">
                Browse All &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestSellers.map((product, idx) => (
                <div
                  key={`${product.handle || product.id}-${idx}`}
                  className="group bg-gray-50/80 border border-gray-200/80 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative p-4 space-y-3"
                >
                  <button
                    className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs text-gray-400 hover:text-red-500 flex items-center justify-center text-xs shadow-2xs transition"
                    title="Add to Wishlist"
                  >
                    🖤
                  </button>

                  {product.compare_at_price && (
                    <span className="absolute top-6 left-6 z-10 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                      -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                    </span>
                  )}

                  <Link href={`/product/${product.handle}`} className="block relative aspect-square bg-white rounded-2xl overflow-hidden p-4 border border-gray-200/60">
                    <Image
                      src={product.images[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"}
                      alt={product.title}
                      fill
                      className="object-contain group-hover:scale-105 transition duration-300 p-2"
                    />
                  </Link>

                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                      <Link href={`/product/${product.handle}`}>{product.title}</Link>
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
                      {product.compare_at_price && (
                        <span className="text-xs text-gray-400 line-through">₹{product.compare_at_price.toLocaleString("en-IN")}</span>
                      )}
                    </div>
                  </div>

                  {/* 🛒 Add to Cart & ⚡ Buy Now Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
                    <BuyNowButton
                      mode="cart"
                      className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold text-xs py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                    >
                      🛒 Add to Cart
                    </BuyNowButton>
                    <BuyNowButton
                      productHandle={product.handle}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      ⚡ Buy Now
                    </BuyNowButton>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 📱 Tech Essentials Horizontal Scroll Carousel */}
      {techProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">📱 Tech Essentials — New Arrivals</h3>
              <Link href="/search/tech" className="text-xs font-bold text-emerald-700 hover:underline">View All &gt;</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
              {techProducts.map((product, idx) => (
                <Link key={`${product.handle || product.id}-${idx}`} href={`/product/${product.handle}`} className="group shrink-0 w-40 space-y-2 hover:opacity-90 transition">
                  <div className="relative w-40 h-40 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-emerald-200 transition">
                    <Image src={product.images[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"} alt={product.title} fill className="object-contain p-3" />
                  </div>
                  <p className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-snug">{product.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
                    {product.compare_at_price && <span className="text-[10px] text-gray-400 line-through">₹{product.compare_at_price.toLocaleString("en-IN")}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 👗 Fashion & Apparel Horizontal Scroll */}
      {apparelProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">👗 Fashion &amp; Apparel Picks</h3>
              <Link href="/search/apparel" className="text-xs font-bold text-emerald-700 hover:underline">View All &gt;</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
              {apparelProducts.map((product, idx) => (
                <Link key={`${product.handle || product.id}-${idx}`} href={`/product/${product.handle}`} className="group shrink-0 w-40 space-y-2 hover:opacity-90 transition">
                  <div className="relative w-40 h-40 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-emerald-200 transition">
                    <Image src={product.images[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800"} alt={product.title} fill className="object-contain p-3" />
                  </div>
                  <p className="text-[11px] font-semibold text-gray-900 line-clamp-2 leading-snug">{product.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-black text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
                    {product.compare_at_price && <span className="text-[10px] text-gray-400 line-through">₹{product.compare_at_price.toLocaleString("en-IN")}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🦶 Footer */}
      <Footer />
    </div>
  );
}
