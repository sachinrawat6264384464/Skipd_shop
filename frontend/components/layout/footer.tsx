"use client";

import Link from "next/link";
import { BrowseCategoriesGrid } from "./browse-categories-grid";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200/80 text-gray-700 text-xs font-sans relative overflow-hidden">
      
      {/* 🖼️ Browse Categories Grid Section (Placed right above footer content) */}
      <BrowseCategoriesGrid />
      


      {/* 📧 Newsletter VIP Subscription Section */}
      <div className="border-b border-gray-200/80 py-10 px-4 sm:px-6 bg-gradient-to-r from-blue-50/80 via-sky-50/50 to-blue-50/80">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center justify-center lg:justify-start gap-2">
              <span className="text-blue-600">✨</span> Join the Botmartz Commerce VIP Club
            </h3>
            <p className="text-xs text-gray-600 font-medium">
              Get exclusive deals, early flash sale access, and <span className="text-blue-700 font-extrabold">₹500 instant discount</span> on your first order.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex items-center w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs transition"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-xl transition cursor-pointer shrink-0 shadow-md shadow-blue-600/20"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* 🏢 Main Footer Columns */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 border-b border-gray-200/80">
        
        {/* Column 1 (Far Left): Brand Logo & Mail Info */}
        <div className="space-y-4 lg:col-span-2 pr-0 lg:pr-6">
          <Link href="/" className="inline-block">
            <img
              src="/2.png"
              alt="BOTCOM Logo"
              className="h-16 sm:h-20 md:h-24 w-auto object-contain hover:scale-105 transition duration-200"
            />
          </Link>
          <p className="text-gray-600 text-xs font-semibold leading-relaxed">
            Botmartz Technologies Private Limited — Fast, Premium AI-Powered E-Commerce Shopping Experience across India.
          </p>
          <div className="pt-2 text-[11px] text-gray-600 space-y-1 border-t border-gray-100">
            <p className="font-extrabold text-gray-900 uppercase tracking-wider text-xs flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Corporate Headquarters:
            </p>
            <p>50, Manglamurti Shri Krishna Ji Nagar, Khajrana, Indore - 452016, M.P.</p>
            <p>
              Email: <a href="mailto:team@botmartz.com" className="text-blue-700 font-bold hover:underline font-mono">team@botmartz.com</a>
              {" • "}
              Web: <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold hover:underline font-mono">www.botmartz.com</a>
            </p>
          </div>
        </div>

        {/* Column 2: ABOUT */}
        <div className="space-y-3">
          <h4 className="text-gray-900 font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            ABOUT
          </h4>
          <ul className="space-y-2 text-gray-600 font-medium text-xs">
            <li><Link href="/contact" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Contact Us</Link></li>
            <li><Link href="/about" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">About Botmartz</Link></li>
            <li><Link href="/careers" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Careers</Link></li>
            <li><Link href="/about#stories" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Botmartz Stories</Link></li>
            <li><Link href="/about#press" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Press Releases</Link></li>
            <li><Link href="/about#corporate" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Corporate Info</Link></li>
          </ul>
        </div>

        {/* Column 3: HELP */}
        <div className="space-y-3">
          <h4 className="text-gray-900 font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            HELP
          </h4>
          <ul className="space-y-2 text-gray-600 font-medium text-xs">
            <li><Link href="/help?tab=payments" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Payments</Link></li>
            <li><Link href="/shipping" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Shipping &amp; Delivery</Link></li>
            <li><Link href="/account/returns" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Cancellation &amp; Returns</Link></li>
            <li><Link href="/help" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">FAQ &amp; Help Center</Link></li>
          </ul>
        </div>

        {/* Column 4: POLICY */}
        <div className="space-y-3">
          <h4 className="text-gray-900 font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            POLICY
          </h4>
          <ul className="space-y-2 text-gray-600 font-medium text-xs">
            <li><Link href="/terms" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Terms Of Use</Link></li>
            <li><Link href="/terms?tab=privacy" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Security &amp; Privacy</Link></li>
            <li><Link href="/store-sitemap" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Sitemap</Link></li>
            <li><Link href="/terms?tab=grievance" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">Grievance Redressal</Link></li>
            <li><Link href="/terms?tab=epr" className="hover:text-blue-700 hover:translate-x-1 transition duration-150 inline-block">EPR Compliance</Link></li>
          </ul>
        </div>

      </div>

      {/* 💼 Bottom B2C Services & Payment Bar */}
      <div className="py-6 bg-gray-50/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          
          {/* Services Links */}
          <div className="flex flex-wrap items-center gap-6 font-extrabold text-gray-800">
            <Link href="/services/advertise" className="hover:text-blue-700 transition">
              Advertise
            </Link>
            <Link href="/gift-cards" className="hover:text-blue-700 transition">
              Gift Cards
            </Link>
            <Link href="/help" className="hover:text-blue-700 transition">
              Help Center
            </Link>
            <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition">
              Botmartz Corporate
            </a>
          </div>

          {/* Copyright */}
          <div>
            <p className="text-gray-500 font-semibold text-[11px]">
              &copy; 2026 Botmartz AI Solution Pvt. Ltd. All rights reserved.
            </p>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2">
            <span className="bg-white border border-gray-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-gray-900">VISA</span>
            <span className="bg-white border border-gray-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-gray-900">MasterCard</span>
            <span className="bg-blue-50 border border-blue-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-blue-800">Razorpay</span>
            <span className="bg-blue-50 border border-blue-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-blue-800">UPI</span>
            <span className="bg-white border border-gray-200 shadow-2xs text-[10px] font-black px-2.5 py-1 rounded-lg text-gray-900">Shiprocket</span>
          </div>

        </div>
      </div>

    </footer>
  );
}
