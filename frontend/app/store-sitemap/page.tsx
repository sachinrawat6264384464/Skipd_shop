"use client";

import Link from "next/link";

export default function StoreSitemapPage() {
  const sitemapSections = [
    {
      title: "Store Categories & Catalog",
      links: [
        { label: "All Products Catalog", href: "/search" },
        { label: "Fashion & Apparel", href: "/search?collection=fashion" },
        { label: "Electronics & Audio", href: "/search?collection=electronics" },
        { label: "Watches & Accessories", href: "/search?collection=watches" },
        { label: "Mobiles & Smartwear", href: "/search?collection=mobiles" },
        { label: "Deals & Offers", href: "/deals" }
      ]
    },
    {
      title: "Customer Account & Orders",
      links: [
        { label: "Customer Dashboard", href: "/account" },
        { label: "My Orders & Order History", href: "/account" },
        { label: "My Saved Wishlist", href: "/account?tab=wishlist" },
        { label: "Wallet & Cashbacks", href: "/account/wallet" },
        { label: "24-Hour Return Requests", href: "/account/returns" },
        { label: "Live Order Tracking", href: "/track-order" }
      ]
    },
    {
      title: "Support & Help Center",
      links: [
        { label: "Contact Us & Inquiry Desk", href: "/contact" },
        { label: "Help Center & FAQs", href: "/help" },
        { label: "Payments & Refunds Policy", href: "/help?tab=payments" },
        { label: "Shipping & Express Delivery", href: "/help?tab=shipping" },
        { label: "Returns & Exchange Guide", href: "/help?tab=returns" },
        { label: "Gift Cards & Vouchers", href: "/gift-cards" }
      ]
    },
    {
      title: "About & Legal Policies",
      links: [
        { label: "About SKIPD Commerce", href: "/about" },
        { label: "Careers & Open Roles", href: "/about#careers" },
        { label: "SKIPD Stories & News", href: "/about#stories" },
        { label: "Corporate Information", href: "/about#corporate" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Security & Privacy Policy", href: "/terms?tab=privacy" },
        { label: "Grievance Redressal Officer", href: "/terms?tab=grievance" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-lg text-center space-y-3">
          <span className="bg-emerald-400/20 text-emerald-300 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30">
            Store Navigation Map
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">SKIPD Website Sitemap</h1>
          <p className="text-xs text-gray-300 font-medium">Quick links to all pages, product categories, policies, and customer support.</p>
        </div>

        {/* 4 Section Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sitemapSections.map((sec, idx) => (
            <div key={idx} className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
              <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                {sec.title}
              </h2>
              <ul className="space-y-2.5 text-xs font-bold text-gray-700">
                {sec.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      className="hover:text-emerald-700 hover:translate-x-1 transition duration-150 flex items-center justify-between group p-1.5 rounded-lg hover:bg-gray-50"
                    >
                      <span>{link.label}</span>
                      <span className="text-gray-400 group-hover:text-emerald-600 text-sm font-black">&rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
