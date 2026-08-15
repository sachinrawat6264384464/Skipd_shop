"use client";

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111827] border border-gray-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black text-white">📈 Sales &amp; Revenue Analytics</h1>
          <p className="text-xs text-gray-400 mt-1">Deep analytics on conversion rates, revenue trends, top performing categories &amp; customer acquisition</p>
        </div>
        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black px-4 py-2 rounded-xl">
          Weekly Growth: +18.6% 🚀
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold text-gray-400">Total Gross Sales</h3>
          <p className="text-3xl font-black text-white">₹27,45,890</p>
          <p className="text-xs text-emerald-400 font-bold">↑ +18.6% from last 30 days</p>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold text-gray-400">Average Order Value (AOV)</h3>
          <p className="text-3xl font-black text-white">₹2,205</p>
          <p className="text-xs text-emerald-400 font-bold">↑ +5.2% from last month</p>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold text-gray-400">Store Checkout Conversion</h3>
          <p className="text-3xl font-black text-white">3.84%</p>
          <p className="text-xs text-blue-400 font-bold">Industry Top 10% benchmark</p>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="bg-[#111827] border border-gray-800 p-6 rounded-3xl space-y-4">
        <h3 className="text-base font-black text-white">🏆 Top Revenue Generating Categories</h3>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-bold text-white mb-1">
              <span>1. Tech Essentials &amp; Mobiles</span>
              <span className="text-emerald-400">₹14,50,000 (52%)</span>
            </div>
            <div className="h-2.5 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "52%" }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-white mb-1">
              <span>2. Apparel &amp; Fashion</span>
              <span className="text-blue-400">₹7,20,000 (26%)</span>
            </div>
            <div className="h-2.5 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "26%" }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-white mb-1">
              <span>3. Lifestyle Accessories &amp; Watches</span>
              <span className="text-amber-400 font-bold">₹5,75,890 (22%)</span>
            </div>
            <div className="h-2.5 bg-gray-900 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: "22%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
