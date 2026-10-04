"use client";

import Link from "next/link";
import { BrowseCategoriesGrid } from "./browse-categories-grid";

export default function Footer() {
  return (
    <footer className="bg-transparent text-sky-100 font-sans relative overflow-hidden">
      
      {/* 🖼️ Browse Categories Grid Section (Placed right above footer content) */}
      <BrowseCategoriesGrid />

      {/* ☁️ WAVY CLOUD TOP HEADER WITH CONTINUOUS CLOCKWISE ANIMATED BADGES */}
      <div className="relative w-full overflow-hidden pt-12">
        
        {/* Continuous Clockwise Rotating Star Badge (Top Right) */}
        <div className="absolute top-16 right-6 sm:right-16 z-20 pointer-events-none">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-500/20 border-2 border-cyan-400/60 backdrop-blur-md flex items-center justify-center text-cyan-300 text-2xl shadow-lg shadow-cyan-500/20 animate-[spin_8s_linear_infinite]">
            ⚙️
          </div>
        </div>

        {/* Floating Delivery Van Badge (Top Left) */}
        <div className="absolute top-20 left-6 sm:left-16 z-20 pointer-events-none animate-bounce duration-1000">
          <div className="bg-[#132B4F] border-2 border-cyan-400/50 text-white font-extrabold text-xs px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5">
            <span className="text-base">🚀</span>
            <span>Express Delivery</span>
          </div>
        </div>

        {/* ☁️ Multi-Hump Cloud Wave SVG in Deep Blue (#0A192F) */}
        <div className="w-full overflow-hidden leading-none z-10 relative">
          <svg
            className="relative block w-full h-24 sm:h-36 md:h-44 lg:h-52"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#0A192F"
              d="M0,192L48,186.7C96,181,192,171,288,181.3C384,192,480,224,576,218.7C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        {/* ☁️ Cloud Hero Title Overlay Inside Deep Blue Header */}
        <div className="bg-[#0A192F] text-center pt-0 pb-10 px-4 relative z-10">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-cyan-400/40 px-4 py-1.5 rounded-full text-cyan-300 font-black text-xs uppercase tracking-wider shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>BE THE FIRST TO EXPLORE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              JOIN THE <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-300 bg-clip-text text-transparent">BOTCOM VIP</span> CLUB
            </h2>
            <div className="pt-2">
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center justify-center max-w-md mx-auto gap-2">
                <input
                  type="email"
                  placeholder="Enter email for ₹500 voucher..."
                  className="bg-[#132B4F] border border-[#1E3A6E] rounded-2xl px-4 py-3 text-xs text-white placeholder-sky-200/50 focus:outline-none focus:border-cyan-400 w-full"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs px-6 py-3 rounded-2xl transition cursor-pointer shrink-0 shadow-lg shadow-blue-500/30 uppercase tracking-wider"
                >
                  Join VIP &rarr;
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* 🏢 Main Footer Body Container (Deep Blue Theme) */}
      <div className="bg-[#0A192F] border-t border-[#132B4F]/80">
        
        {/* Main Footer Columns */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1 (Far Left): Brand Logo & Mail Info */}
          <div className="space-y-5 lg:col-span-2 pr-0 lg:pr-8">
            <Link href="/" className="inline-block bg-white/95 p-3 rounded-2xl border border-white/20 shadow-md">
              <img
                src="/2.png"
                alt="BOTCOM Logo"
                className="h-12 sm:h-14 w-auto object-contain hover:scale-105 transition duration-200"
              />
            </Link>
            <p className="text-sky-200/80 text-xs font-medium leading-relaxed max-w-md">
              Botmartz Technologies Private Limited — Fast, Premium AI-Powered E-Commerce Shopping Experience across India.
            </p>

            <div className="bg-[#132B4F]/90 border border-[#1E3A6E] rounded-2xl p-5 space-y-2.5 text-xs backdrop-blur-md shadow-lg relative overflow-hidden group">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
              <p className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-xs shadow-cyan-400/50" />
                Corporate Headquarters:
              </p>
              <p className="text-sky-100 font-medium text-xs leading-relaxed">
                50, Manglamurti Shri Krishna Ji Nagar, Khajrana, Indore - 452016, M.P.
              </p>
              <div className="pt-2 text-xs border-t border-[#1E3A6E] flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="text-sky-200/80">Email: <a href="mailto:team@botmartz.com" className="text-cyan-300 font-bold hover:underline font-mono">team@botmartz.com</a></span>
                <span className="text-sky-400">•</span>
                <span className="text-sky-200/80">Web: <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="text-cyan-300 font-bold hover:underline font-mono">www.botmartz.com</a></span>
              </div>
            </div>
          </div>

          {/* Column 2: ABOUT */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-widest flex items-center gap-2 pb-2 border-b border-[#1E3A6E]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              ABOUT
            </h4>
            <ul className="space-y-3 text-sky-200/90 font-medium text-xs">
              <li>
                <Link href="/contact" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> About Botmartz
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Careers
                </Link>
              </li>
              <li>
                <Link href="/about#stories" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Botmartz Stories
                </Link>
              </li>
              <li>
                <Link href="/about#press" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Press Releases
                </Link>
              </li>
              <li>
                <Link href="/about#corporate" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Corporate Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HELP */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-widest flex items-center gap-2 pb-2 border-b border-[#1E3A6E]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              HELP
            </h4>
            <ul className="space-y-3 text-sky-200/90 font-medium text-xs">
              <li>
                <Link href="/help?tab=payments" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Payments
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/account/returns" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Cancellation &amp; Returns
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> FAQ &amp; Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: POLICY */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-widest flex items-center gap-2 pb-2 border-b border-[#1E3A6E]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              POLICY
            </h4>
            <ul className="space-y-3 text-sky-200/90 font-medium text-xs">
              <li>
                <Link href="/terms" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Terms Of Use
                </Link>
              </li>
              <li>
                <Link href="/terms?tab=privacy" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Security &amp; Privacy
                </Link>
              </li>
              <li>
                <Link href="/store-sitemap" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Sitemap
                </Link>
              </li>
              <li>
                <Link href="/terms?tab=grievance" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> Grievance Redressal
                </Link>
              </li>
              <li>
                <Link href="/terms?tab=epr" className="hover:text-cyan-300 hover:translate-x-1.5 transition duration-200 inline-flex items-center gap-2 group">
                  <span className="text-sky-400 group-hover:text-cyan-300 transition-colors">&rsaquo;</span> EPR Compliance
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 💼 Bottom Services & Payment Method Bar */}
        <div className="py-6 bg-[#071324] border-t border-[#132B4F]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            
            {/* Services Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 font-bold text-sky-200">
              <Link href="/services/advertise" className="hover:text-cyan-300 transition">
                Advertise
              </Link>
              <Link href="/gift-cards" className="hover:text-cyan-300 transition">
                Gift Cards
              </Link>
              <Link href="/help" className="hover:text-cyan-300 transition">
                Help Center
              </Link>
              <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition">
                Botmartz Corporate
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-sky-300/70 font-medium text-xs">
                &copy; 2026 Botmartz AI Solution Pvt. Ltd. All rights reserved.
              </p>
            </div>

            {/* Payment Method Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="bg-[#132B4F] border border-[#1E3A6E] text-[10px] font-black px-3 py-1 rounded-xl text-sky-100 shadow-xs">VISA</span>
              <span className="bg-[#132B4F] border border-[#1E3A6E] text-[10px] font-black px-3 py-1 rounded-xl text-sky-100 shadow-xs">MasterCard</span>
              <span className="bg-blue-900/80 border border-blue-600/80 text-[10px] font-black px-3 py-1 rounded-xl text-cyan-300 shadow-xs">Razorpay</span>
              <span className="bg-blue-900/80 border border-blue-600/80 text-[10px] font-black px-3 py-1 rounded-xl text-cyan-300 shadow-xs">UPI</span>
              <span className="bg-[#132B4F] border border-[#1E3A6E] text-[10px] font-black px-3 py-1 rounded-xl text-sky-100 shadow-xs">Shiprocket</span>
            </div>

          </div>
        </div>

      </div>

    </footer>
  );
}

export { Footer };
