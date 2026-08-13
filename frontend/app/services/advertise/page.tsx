import Footer from "components/layout/footer";
import Link from "next/link";

export const metadata = {
  title: "SKIPD Ads & Brand Advertising Platform | SKIPD Commerce",
  description: "Boost your brand visibility with targeted sponsored product listings and high-conversion hero banner placements.",
};

export default function AdvertisePage() {
  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 w-full">
        
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-8 md:p-12 shadow-lg space-y-4 text-center">
          <span className="bg-white text-blue-900 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            SKIPD Advertising Solutions
          </span>
          <h1 className="text-3xl md:text-5xl font-black">Reach 5 Million+ High-Intent Shoppers</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-xs md:text-sm leading-relaxed">
            Promote your brand at the exact moment customers are browsing. Drive up to 3.5x higher conversions with native sponsored search product ads.
          </p>
        </div>

        {/* Ad Solutions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-3">
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
              Sponsored Search Ads
            </span>
            <h3 className="text-lg font-black text-gray-900">Top-of-Search Placements</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Display your products at the top of search result pages whenever customers search for relevant keywords.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-3">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
              Hero Banner Showcase
            </span>
            <h3 className="text-lg font-black text-gray-900">Homepage Banner Ads</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Feature your sale events and product launches directly on our high-traffic homepage promo banners.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-3">
            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
              Performance Analytics
            </span>
            <h3 className="text-lg font-black text-gray-900">Real-Time ROAS Tracking</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Track impressions, click-through rates (CTR), orders, and Return on Ad Spend (ROAS) live in your dashboard.
            </p>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
