"use client";

import Link from "next/link";
import { BrowseCategoriesGrid } from "./browse-categories-grid";

export default function Footer() {
  return (
    <footer className="bg-transparent text-zinc-300 font-sans relative overflow-hidden">
      
      {/* 🖼️ Browse Categories Grid Section (Stays on original page background) */}
      <BrowseCategoriesGrid />

      {/* 🏢 Main Footer Body Container (Solid Sleek Black) */}
      <div className="bg-black border-t border-zinc-900 relative">
        
        {/* Main Footer Columns */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 relative z-10">
          
          {/* Column 1 (Far Left): Brand Logo & Mail Info */}
          <div className="space-y-5 lg:col-span-2 pr-0 lg:pr-8">
            <Link href="/" className="inline-block bg-white p-2.5 rounded-xl shadow-xs">
              <img
                src="/2.png"
                alt="BOTCOM Logo"
                className="h-10 sm:h-12 w-auto object-contain hover:scale-105 transition duration-200"
              />
            </Link>
            <p className="text-zinc-400 text-xs font-medium leading-relaxed max-w-md">
              Botmartz Technologies Private Limited — Fast, Premium AI-Powered E-Commerce Shopping Experience across India.
            </p>

            <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-2 text-xs">
              <p className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Corporate Headquarters:
              </p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                50, Manglamurti Shri Krishna Ji Nagar, Khajrana, Indore - 452016, M.P.
              </p>
              <div className="pt-2 text-xs border-t border-zinc-900 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="text-zinc-400">Email: <a href="mailto:team@botmartz.com" className="text-zinc-200 font-bold hover:underline font-mono">team@botmartz.com</a></span>
                <span className="text-zinc-700">•</span>
                <span className="text-zinc-400">Web: <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="text-zinc-200 font-bold hover:underline font-mono">www.botmartz.com</a></span>
              </div>
            </div>
          </div>

          {/* Column 2: ABOUT */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-widest flex items-center gap-2 pb-2 border-b border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              ABOUT
            </h4>
            <ul className="space-y-3 text-zinc-400 font-medium text-xs">
              <li>
                <Link href="/contact" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> About Botmartz
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Careers
                </Link>
              </li>
              <li>
                <Link href="/about#stories" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Botmartz Stories
                </Link>
              </li>
              <li>
                <Link href="/about#press" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Press Releases
                </Link>
              </li>
              <li>
                <Link href="/about#corporate" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Corporate Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HELP */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-widest flex items-center gap-2 pb-2 border-b border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              HELP
            </h4>
            <ul className="space-y-3 text-zinc-400 font-medium text-xs">
              <li>
                <Link href="/help?tab=payments" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Payments
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/account/returns" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Cancellation &amp; Returns
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> FAQ &amp; Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: POLICY */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-widest flex items-center gap-2 pb-2 border-b border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              POLICY
            </h4>
            <ul className="space-y-3 text-zinc-400 font-medium text-xs">
              <li>
                <Link href="/terms" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Terms Of Use
                </Link>
              </li>
              <li>
                <Link href="/terms?tab=privacy" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Security &amp; Privacy
                </Link>
              </li>
              <li>
                <Link href="/store-sitemap" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Sitemap
                </Link>
              </li>
              <li>
                <Link href="/terms?tab=grievance" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> Grievance Redressal
                </Link>
              </li>
              <li>
                <Link href="/terms?tab=epr" className="hover:text-white hover:translate-x-1 transition duration-200 inline-flex items-center gap-1.5">
                  <span className="text-zinc-600">&rsaquo;</span> EPR Compliance
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 💼 Bottom Services & Payment Method Bar */}
        <div className="py-6 bg-black border-t border-zinc-900 relative z-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            
            {/* Services Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 font-semibold text-zinc-400">
              <Link href="/services/advertise" className="hover:text-white transition">
                Advertise
              </Link>
              <Link href="/gift-cards" className="hover:text-white transition">
                Gift Cards
              </Link>
              <Link href="/help" className="hover:text-white transition">
                Help Center
              </Link>
              <a href="https://botmartz.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                Botmartz Corporate
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-zinc-500 font-medium text-xs">
                &copy; 2026 Botmartz AI Solution Pvt. Ltd. All rights reserved.
              </p>
            </div>

            {/* Payment Method Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold px-3 py-1 rounded-lg text-zinc-300">VISA</span>
              <span className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold px-3 py-1 rounded-lg text-zinc-300">MasterCard</span>
              <span className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold px-3 py-1 rounded-lg text-zinc-300">Razorpay</span>
              <span className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold px-3 py-1 rounded-lg text-zinc-300">UPI</span>
              <span className="bg-zinc-900 border border-zinc-800 text-[10px] font-bold px-3 py-1 rounded-lg text-zinc-300">Shiprocket</span>
            </div>

          </div>
        </div>

      </div>

    </footer>
  );
}

export { Footer };
