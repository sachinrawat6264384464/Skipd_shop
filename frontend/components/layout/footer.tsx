"use client";

import Link from "next/link";
import { BrowseCategoriesGrid } from "./browse-categories-grid";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200/80 text-gray-700 text-xs font-sans relative overflow-hidden">
      
      {/* 🖼️ Browse Categories Grid Section (Placed right above footer content) */}
      <BrowseCategoriesGrid />
      
      {/* 🚀 Top Trust Perks Ribbon (Royal White Style) */}
      <div className="border-b border-gray-100 py-8 px-4 sm:px-6 bg-slate-50/50">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-md transition duration-300 group">
            <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl group-hover:scale-110 transition duration-300">
              ⚡
            </span>
            <div>
              <p className="font-extrabold text-gray-900 text-sm">Express 2-Day Delivery</p>
              <p className="text-[11px] text-gray-500 font-medium">Lightning-fast shipping across India</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-md transition duration-300 group">
            <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl group-hover:scale-110 transition duration-300">
              🛡️
            </span>
            <div>
              <p className="font-extrabold text-gray-900 text-sm">100% Genuine Guarantee</p>
              <p className="text-[11px] text-gray-500 font-medium">Direct official brand warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-md transition duration-300 group">
            <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl group-hover:scale-110 transition duration-300">
              🔄
            </span>
            <div>
              <p className="font-extrabold text-gray-900 text-sm">7-Day Easy Returns</p>
              <p className="text-[11px] text-gray-500 font-medium">Hassle-free replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:border-emerald-400 hover:shadow-md transition duration-300 group">
            <span className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl group-hover:scale-110 transition duration-300">
              🔒
            </span>
            <div>
              <p className="font-extrabold text-gray-900 text-sm">256-Bit SSL Encrypted</p>
              <p className="text-[11px] text-gray-500 font-medium">Safe UPI &amp; Card Transactions</p>
            </div>
          </div>

        </div>
      </div>

      {/* 📧 Newsletter VIP Subscription Section */}
      <div className="border-b border-gray-200/80 py-10 px-4 sm:px-6 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-emerald-50/80">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center justify-center lg:justify-start gap-2">
              <span className="text-emerald-600">✨</span> Join the E-COM VIP Club
            </h3>
            <p className="text-xs text-gray-600 font-medium">
              Get exclusive deals, early flash sale access, and <span className="text-emerald-700 font-extrabold">₹500 instant discount</span> on your first order.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex items-center w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-xl transition cursor-pointer shrink-0 shadow-md shadow-emerald-600/20"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* 🏢 Main Footer Columns (Royal White Palette) */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-6 gap-8 border-b border-gray-200/80">
        
        {/* Column 1: ABOUT */}
        <div className="space-y-3">
          <h4 className="text-gray-900 font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            ABOUT
          </h4>
          <ul className="space-y-2 text-gray-600 font-medium text-xs">
            <li><Link href="/contact" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Contact Us</Link></li>
            <li><Link href="/about" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">About Us</Link></li>
            <li><Link href="/about#careers" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Careers</Link></li>
            <li><Link href="/about#stories" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">E-COM Stories</Link></li>
            <li><Link href="/about#press" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Press Releases</Link></li>
            <li><Link href="/about#corporate" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Corporate Info</Link></li>
          </ul>
        </div>

        {/* Column 2: GROUP BRANDS */}
        <div className="space-y-3">
          <h4 className="text-gray-900 font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            GROUP BRANDS
          </h4>
          <ul className="space-y-2 text-gray-600 font-medium text-xs">
            <li><Link href="/search?collection=fashion" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">E-COM Apparel</Link></li>
            <li><Link href="/search?collection=electronics" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">E-COM Audio</Link></li>
            <li><Link href="/search?collection=electronics" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">E-COM Tech</Link></li>
            <li><Link href="/track-order" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Express Courier</Link></li>
          </ul>
        </div>

        {/* Column 3: HELP */}
        <div className="space-y-3">
          <h4 className="text-gray-900 font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            HELP
          </h4>
          <ul className="space-y-2 text-gray-600 font-medium text-xs">
            <li><Link href="/help?tab=payments" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Payments</Link></li>
            <li><Link href="/help?tab=shipping" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Shipping</Link></li>
            <li><Link href="/help?tab=returns" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Cancellation &amp; Returns</Link></li>
            <li><Link href="/help" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">FAQ &amp; Help Center</Link></li>
          </ul>
        </div>

        {/* Column 4: CONSUMER POLICY */}
        <div className="space-y-3">
          <h4 className="text-gray-900 font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            POLICY
          </h4>
          <ul className="space-y-2 text-gray-600 font-medium text-xs">
            <li><Link href="/terms" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Terms Of Use</Link></li>
            <li><Link href="/terms?tab=privacy" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Security &amp; Privacy</Link></li>
            <li><Link href="/store-sitemap" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Sitemap</Link></li>
            <li><Link href="/terms?tab=grievance" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">Grievance Redressal</Link></li>
            <li><Link href="/terms?tab=epr" className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 inline-block">EPR Compliance</Link></li>
          </ul>
        </div>

        {/* Column 5: Mail Us */}
        <div className="space-y-3 col-span-2 md:col-span-1 border-l border-gray-200/80 pl-0 md:pl-4">
          <h4 className="text-gray-900 font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            MAIL US:
          </h4>
          <p className="text-gray-600 leading-relaxed font-medium text-[11px]">
            E-COM Commerce Pvt Ltd,<br />
            Buildings Alyssa, Begonia &amp;<br />
            Clove Embassy Tech Village,<br />
            Outer Ring Road, Bengaluru, 560103,<br />
            Karnataka, India
          </p>
        </div>

        {/* Column 6: Registered Office */}
        <div className="space-y-3 col-span-2 md:col-span-1 border-l border-gray-200/80 pl-0 md:pl-4">
          <h4 className="text-gray-900 font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            REGISTERED OFFICE:
          </h4>
          <p className="text-gray-600 leading-relaxed font-medium text-[11px]">
            E-COM Commerce Pvt Ltd,<br />
            Outer Ring Road, Bengaluru, 560103,<br />
            Karnataka, India<br />
            CIN: U51109KA2012PTC066107<br />
            Toll-Free: <a href="tel:1800754733" className="text-emerald-700 font-black hover:underline">1800-E-COM-COMMERCE</a>
          </p>
        </div>

      </div>

      {/* 💼 Bottom B2C Services & Payment Bar */}
      <div className="py-6 bg-gray-50/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          
          {/* Services Links */}
          <div className="flex flex-wrap items-center gap-6 font-extrabold text-gray-800">
            <Link href="/services/advertise" className="hover:text-emerald-700 transition">
              Advertise
            </Link>
            <Link href="/gift-cards" className="hover:text-emerald-700 transition">
              Gift Cards
            </Link>
            <Link href="/help" className="hover:text-emerald-700 transition">
              Help Center
            </Link>
          </div>

          {/* Copyright */}
          <div>
            <p className="text-gray-500 font-semibold text-[11px]">
              &copy; 2007-2026 E-COM Commerce Pvt Ltd. All rights reserved.
            </p>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2">
            <span className="bg-white border border-gray-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-gray-900">VISA</span>
            <span className="bg-white border border-gray-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-gray-900">MasterCard</span>
            <span className="bg-emerald-50 border border-emerald-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-emerald-800">Razorpay</span>
            <span className="bg-emerald-50 border border-emerald-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-emerald-800">UPI</span>
            <span className="bg-white border border-gray-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-gray-900">Shiprocket</span>
          </div>

        </div>
      </div>

    </footer>
  );
}
