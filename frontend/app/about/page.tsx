import Footer from "components/layout/footer";
import Link from "next/link";

export const metadata = {
  title: "About Us & Corporate Information | SKIPD Commerce",
  description: "Learn about SKIPD's mission, leadership team, corporate history, and career opportunities.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 w-full">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-3xl p-8 md:p-12 shadow-lg text-center space-y-4">
          <span className="bg-emerald-400 text-black font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
            About SKIPD Commerce
          </span>
          <h1 className="text-3xl md:text-5xl font-black">Building India's Fastest Direct-to-Consumer Platform</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-xs md:text-sm leading-relaxed">
            Founded in 2026, SKIPD connects millions of customers with premium direct-to-consumer apparel, tech essentials, and lifestyle brands through instant Razorpay checkout and Shiprocket express delivery.
          </p>
        </div>

        {/* Corporate Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xl flex items-center justify-center">
              🚀
            </div>
            <h3 className="text-lg font-black text-gray-900">Lightning Delivery</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Integrated with BlueDart and Shiprocket Air Cargo hubs to fulfill orders in under 24-48 hours across 28,000+ pincodes.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-black text-xl flex items-center justify-center">
              🛡️
            </div>
            <h3 className="text-lg font-black text-gray-900">Verified Quality</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every garment and electronic gadget undergoes 100% strict quality assurance checks before entering our logistics hubs.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 font-black text-xl flex items-center justify-center">
              🪙
            </div>
            <h3 className="text-lg font-black text-gray-900">Customer Rewards</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Earn 5% Supercoin rewards on every single purchase, redeemable instantly as cash discounts at checkout.
            </p>
          </div>
        </div>

        {/* Corporate Details */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs space-y-6">
          <h2 className="text-2xl font-black text-gray-900">Corporate &amp; Registered Entity Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700">
            <div>
              <p className="font-bold text-gray-900">Registered Office Address:</p>
              <p className="mt-1 leading-relaxed text-gray-600">
                SKIPD Commerce Private Limited,<br />
                Buildings Alyssa, Begonia &amp; Clove Embassy Tech Village,<br />
                Outer Ring Road, Devarabeesanahalli Village,<br />
                Bengaluru, 560103, Karnataka, India
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Corporate Registration &amp; Support:</p>
              <p className="mt-1 leading-relaxed text-gray-600">
                CIN: U51109KA2012PTC066107<br />
                Toll Free Telephone: <a href="tel:1800754733" className="text-emerald-700 font-bold">1800-SKIPD-COMMERCE</a><br />
                Corporate Email: support@skipd.in
              </p>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
