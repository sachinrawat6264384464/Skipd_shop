"use client";

import Link from "next/link";
import Footer from "components/layout/footer";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-10 w-full">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center space-y-4 border border-emerald-900/40">
          <span className="bg-emerald-400/20 text-emerald-300 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
            Botmartz Express Logistics Policy
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">Shipping &amp; Delivery Information</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Fast, insured, and transparent courier shipping powered by Shiprocket, BlueDart, Delhivery, and DTDC across 28,000+ Indian pincodes.
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-6 text-xs text-gray-700 leading-relaxed font-medium">
          
          <h2 className="text-2xl font-black text-gray-900">1. Dispatch &amp; Delivery Timelines</h2>
          <p>
            All orders placed before <strong>2:00 PM IST</strong> are packed and dispatched on the very same business day from our automated fulfillment centers in Bengaluru, Mumbai, and Delhi.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-bold text-center pt-2">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <span className="text-xl">⚡</span>
              <p className="text-emerald-900 font-black mt-1">Metro Cities</p>
              <p className="text-[11px] text-emerald-700 font-medium">1 - 2 Business Days</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
              <span className="text-xl">🚚</span>
              <p className="text-blue-900 font-black mt-1">Tier 2 &amp; Tier 3 Cities</p>
              <p className="text-[11px] text-blue-700 font-medium">2 - 4 Business Days</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl">
              <span className="text-xl">📦</span>
              <p className="text-purple-900 font-black mt-1">Rest of India</p>
              <p className="text-[11px] text-purple-700 font-medium">3 - 5 Business Days</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 pt-4">2. Shipping Charges</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Free Delivery:</strong> Applicable on all orders above ₹499 across India.</li>
            <li><strong>Standard Shipping:</strong> A flat ₹49 fee applies to orders below ₹499.</li>
            <li><strong>Cash on Delivery (COD):</strong> Additional ₹40 COD processing charge for cash orders.</li>
          </ul>

          <h2 className="text-2xl font-black text-gray-900 pt-4">3. Live AWB Order Tracking</h2>
          <p>
            As soon as your package is scanned by our logistics partner, an automated SMS and Email with your live tracking URL and AWB code (e.g., <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">SKP98765IN</code>) will be dispatched. You can track your parcel live anytime at <Link href="/track-order" className="text-emerald-700 font-bold hover:underline">botmartz.com/track-order</Link>.
          </p>

          <h2 className="text-2xl font-black text-gray-900 pt-4">4. Damaged or Tampered Shipments</h2>
          <p>
            Please do not accept any parcel if the outer tamper-proof courier seal is broken or torn. If you receive a damaged product, notify us within 24 hours at <a href="mailto:support@botmartz.com" className="text-emerald-700 font-bold hover:underline">support@botmartz.com</a> or call <a href="tel:18002686278" className="text-emerald-700 font-bold hover:underline">1800-BOTMARTZ</a> for immediate free replacement.
          </p>

        </div>

      </div>
      <Footer />
    </div>
  );
}
