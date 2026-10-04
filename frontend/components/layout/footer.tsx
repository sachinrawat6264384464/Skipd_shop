"use client";

import Link from "next/link";
import { BrowseCategoriesGrid } from "./browse-categories-grid";

export default function Footer() {
  return (
    <footer className="bg-[#070C18] text-slate-300 font-sans relative overflow-hidden border-t border-slate-800/80">
      
      {/* 🖼️ Browse Categories Grid Section (Placed right above footer content) */}
      <BrowseCategoriesGrid />
      

      {/* 📧 Newsletter VIP Subscription Section */}
      <div className="relative bg-gradient-to-r from-slate-900 via-[#0D1527] to-slate-900 border-b border-slate-800/90 py-12 px-4 sm:px-8 overflow-hidden">
        {/* Background Decorative Glow Effects */}
        <div className="absolute -top-24 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center lg:text-left">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center justify-center lg:justify-start gap-2.5 font-sans">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Botmartz VIP</span> Inner Circle
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              Subscribe for insider deals, new arrival alerts &amp; <span className="text-cyan-400 font-extrabold">₹500 instant discount</span> on your next purchase.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex items-center w-full max-w-md gap-2.5">
            <div className="relative w-full">
              <input
                type="email"
                placeholder="Enter your email address..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-4 pr-10 py-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/25 transition shadow-inner font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs px-7 py-3.5 rounded-2xl transition cursor-pointer shrink-0 shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
            >
              <span>Subscribe</span>
              <span>&rarr;</span>
            </button>
          </form>
        </div>
      </div>

      {/* 🏢 Main Footer Columns */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Column 1 (Far Left): Brand Logo & Mail Info */}
        <div className="space-y-5 lg:col-span-2 pr-0 lg:pr-8">
          <Link href="/" className="inline-block bg-white/95 p-3 rounded-2xl border border-white/20 shadow-md">
            <img
              src="/2.png"
              alt="BOTCOM Logo"
              className="h-12 sm:h-14 w-auto object-contain hover:scale-105 transition duration-200"
            />
          </Link>
          <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-md">
            Botmartz Technologies Private Limited — Fast, Premium AI-Powered E-Commerce Shopping Experience across India.
          </p>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2.5 text-xs backdrop-blur-md shadow-lg relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <p className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-xs shadow-cyan-400/50" />
              Corporate Headquarters:
            </p>
            <p className="text-slate-300 font-medium text-xs leading-relaxed">
              50, Manglamurti Shri Krishna Ji Nagar, Khajrana, Indore - 452016, M.P.
            </p>
            <div className="pt-2 text-xs border-t border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="text-slate-400">Email: <a href="mailto:team@botmartz.com" className="text-cyan-400 font-bold hover:underline font-mono">team@botmartz.com</a></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Web: <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-bold hover:underline font-mono">www.botmartz.com</a></span>
            </div>
          </div>
        </div>

        {/* Column 2: ABOUT */}
        <div className="space-y-4">
          <h4 className="text-white font-extrabold uppercase text-xs tracking-widest flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            ABOUT
          </h4>
          <ul className="space-y-3 text-slate-300 font-medium text-xs">
            <li>
              <Link href="/contact" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Contact Us
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> About Botmartz
              </Link>
            </li>
            <li>
              <Link href="/careers" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Careers
              </Link>
            </li>
            <li>
              <Link href="/about#stories" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Botmartz Stories
              </Link>
            </li>
            <li>
              <Link href="/about#press" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Press Releases
              </Link>
            </li>
            <li>
              <Link href="/about#corporate" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Corporate Info
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: HELP */}
        <div className="space-y-4">
          <h4 className="text-white font-extrabold uppercase text-xs tracking-widest flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            HELP
          </h4>
          <ul className="space-y-3 text-slate-300 font-medium text-xs">
            <li>
              <Link href="/help?tab=payments" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Payments
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Shipping &amp; Delivery
              </Link>
            </li>
            <li>
              <Link href="/account/returns" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Cancellation &amp; Returns
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> FAQ &amp; Help Center
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: POLICY */}
        <div className="space-y-4">
          <h4 className="text-white font-extrabold uppercase text-xs tracking-widest flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            POLICY
          </h4>
          <ul className="space-y-3 text-slate-300 font-medium text-xs">
            <li>
              <Link href="/terms" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Terms Of Use
              </Link>
            </li>
            <li>
              <Link href="/terms?tab=privacy" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Security &amp; Privacy
              </Link>
            </li>
            <li>
              <Link href="/store-sitemap" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Sitemap
              </Link>
            </li>
            <li>
              <Link href="/terms?tab=grievance" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> Grievance Redressal
              </Link>
            </li>
            <li>
              <Link href="/terms?tab=epr" className="hover:text-cyan-400 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">&rsaquo;</span> EPR Compliance
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* 💼 Bottom Services & Payment Method Bar */}
      <div className="py-6 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          
          {/* Services Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 font-bold text-slate-300">
            <Link href="/services/advertise" className="hover:text-cyan-400 transition">
              Advertise
            </Link>
            <Link href="/gift-cards" className="hover:text-cyan-400 transition">
              Gift Cards
            </Link>
            <Link href="/help" className="hover:text-cyan-400 transition">
              Help Center
            </Link>
            <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">
              Botmartz Corporate
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-slate-400 font-medium text-xs">
              &copy; 2026 Botmartz AI Solution Pvt. Ltd. All rights reserved.
            </p>
          </div>

          {/* Payment Method Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="bg-slate-900 border border-slate-800 text-[10px] font-black px-3 py-1 rounded-xl text-slate-200 shadow-xs hover:border-slate-700 transition">VISA</span>
            <span className="bg-slate-900 border border-slate-800 text-[10px] font-black px-3 py-1 rounded-xl text-slate-200 shadow-xs hover:border-slate-700 transition">MasterCard</span>
            <span className="bg-blue-950/80 border border-blue-800/80 text-[10px] font-black px-3 py-1 rounded-xl text-cyan-300 shadow-xs hover:border-blue-700 transition">Razorpay</span>
            <span className="bg-blue-950/80 border border-blue-800/80 text-[10px] font-black px-3 py-1 rounded-xl text-cyan-300 shadow-xs hover:border-blue-700 transition">UPI</span>
            <span className="bg-slate-900 border border-slate-800 text-[10px] font-black px-3 py-1 rounded-xl text-slate-200 shadow-xs hover:border-slate-700 transition">Shiprocket</span>
          </div>

        </div>
      </div>

    </footer>
  );
}

