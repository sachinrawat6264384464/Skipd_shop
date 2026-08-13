import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 text-xs">
      
      {/* 🏢 Main Footer Columns (Matching Reference Screenshot 5 in Light Mode) */}
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-2 md:grid-cols-6 gap-8 border-b border-gray-200">
        
        {/* Column 1: ABOUT */}
        <div className="space-y-2">
          <h4 className="text-gray-900 font-extrabold uppercase text-[10px] tracking-wider mb-2">ABOUT</h4>
          <ul className="space-y-1.5 text-gray-600 font-medium">
            <li><Link href="/about" className="hover:text-black transition">Contact Us</Link></li>
            <li><Link href="/about" className="hover:text-black transition">About Us</Link></li>
            <li><Link href="/about" className="hover:text-black transition">Careers</Link></li>
            <li><Link href="/about" className="hover:text-black transition">SKIPD Stories</Link></li>
            <li><Link href="/about" className="hover:text-black transition">Press Releases</Link></li>
            <li><Link href="/about" className="hover:text-black transition">Corporate Info</Link></li>
          </ul>
        </div>

        {/* Column 2: GROUP BRANDS */}
        <div className="space-y-2">
          <h4 className="text-gray-900 font-extrabold uppercase text-[10px] tracking-wider mb-2">GROUP BRANDS</h4>
          <ul className="space-y-1.5 text-gray-600 font-medium">
            <li><Link href="/search?category=apparel" className="hover:text-black transition">SKIPD Apparel</Link></li>
            <li><Link href="/search?category=tech" className="hover:text-black transition">SKIPD Audio</Link></li>
            <li><Link href="/search?category=tech" className="hover:text-black transition">SKIPD Tech</Link></li>
            <li><Link href="/track-order" className="hover:text-black transition">Express Courier</Link></li>
          </ul>
        </div>

        {/* Column 3: HELP */}
        <div className="space-y-2">
          <h4 className="text-gray-900 font-extrabold uppercase text-[10px] tracking-wider mb-2">HELP</h4>
          <ul className="space-y-1.5 text-gray-600 font-medium">
            <li><Link href="/help" className="hover:text-black transition">Payments</Link></li>
            <li><Link href="/help" className="hover:text-black transition">Shipping</Link></li>
            <li><Link href="/help" className="hover:text-black transition">Cancellation &amp; Returns</Link></li>
            <li><Link href="/help" className="hover:text-black transition">FAQ &amp; Help Center</Link></li>
          </ul>
        </div>

        {/* Column 4: CONSUMER POLICY */}
        <div className="space-y-2">
          <h4 className="text-gray-900 font-extrabold uppercase text-[10px] tracking-wider mb-2">CONSUMER POLICY</h4>
          <ul className="space-y-1.5 text-gray-600 font-medium">
            <li><Link href="/terms" className="hover:text-black transition">Terms Of Use</Link></li>
            <li><Link href="/terms" className="hover:text-black transition">Security &amp; Privacy</Link></li>
            <li><Link href="/sitemap.xml" className="hover:text-black transition">Sitemap</Link></li>
            <li><Link href="/terms" className="hover:text-black transition">Grievance Redressal</Link></li>
            <li><Link href="/terms" className="hover:text-black transition">EPR Compliance</Link></li>
          </ul>
        </div>

        {/* Column 5: Mail Us */}
        <div className="space-y-2 col-span-2 md:col-span-1 border-l border-gray-200 pl-0 md:pl-4">
          <h4 className="text-gray-900 font-extrabold uppercase text-[10px] tracking-wider mb-2">Mail Us:</h4>
          <p className="text-gray-600 leading-relaxed font-medium">
            SKIPD Commerce Pvt Ltd,<br />
            Buildings Alyssa, Begonia &amp;<br />
            Clove Embassy Tech Village,<br />
            Outer Ring Road, Bengaluru, 560103,<br />
            Karnataka, India
          </p>
        </div>

        {/* Column 6: Registered Office */}
        <div className="space-y-2 col-span-2 md:col-span-1 border-l border-gray-200 pl-0 md:pl-4">
          <h4 className="text-gray-900 font-extrabold uppercase text-[10px] tracking-wider mb-2">Registered Office Address:</h4>
          <p className="text-gray-600 leading-relaxed font-medium">
            SKIPD Commerce Pvt Ltd,<br />
            Outer Ring Road, Bengaluru, 560103,<br />
            Karnataka, India<br />
            CIN: U51109KA2012PTC066107<br />
            Telephone: <a href="tel:1800754733" className="text-emerald-700 font-bold">1800-SKIPD-COMMERCE</a>
          </p>
        </div>

      </div>

      {/* 💼 Bottom B2C Services & Payment Bar (Light Mode) */}
      <div className="py-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 text-xs font-medium">
          
          {/* Services Links */}
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/services/seller" className="flex items-center gap-1.5 hover:text-black transition">
              <span className="text-amber-500">💼</span>
              <span className="font-bold">Become a Seller</span>
            </Link>
            <Link href="/services/advertise" className="flex items-center gap-1.5 hover:text-black transition">
              <span className="text-amber-500">⭐</span>
              <span className="font-bold">Advertise</span>
            </Link>
            <Link href="/account?tab=gift-cards" className="flex items-center gap-1.5 hover:text-black transition">
              <span className="text-amber-500">🎁</span>
              <span className="font-bold">Gift Cards</span>
            </Link>
            <Link href="/help" className="flex items-center gap-1.5 hover:text-black transition">
              <span className="text-amber-500">❓</span>
              <span className="font-bold">Help Center</span>
            </Link>
          </div>

          {/* Copyright */}
          <div>
            <p>&copy; 2007-2026 SKIPD Commerce. All rights reserved.</p>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2">
            <span className="bg-white border border-gray-300 text-[10px] font-bold px-2 py-1 rounded text-blue-700">VISA</span>
            <span className="bg-white border border-gray-300 text-[10px] font-bold px-2 py-1 rounded text-red-600">MasterCard</span>
            <span className="bg-white border border-gray-300 text-[10px] font-bold px-2 py-1 rounded text-emerald-700">Razorpay</span>
            <span className="bg-white border border-gray-300 text-[10px] font-bold px-2 py-1 rounded text-emerald-700">UPI</span>
            <span className="bg-white border border-gray-300 text-[10px] font-bold px-2 py-1 rounded text-purple-700">Shiprocket</span>
          </div>

        </div>
      </div>

    </footer>
  );
}
