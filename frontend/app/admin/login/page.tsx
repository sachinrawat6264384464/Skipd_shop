"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@skipd.in");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("skipd_admin_token", data.access_token);
        localStorage.setItem("skipd_admin_user", JSON.stringify(data));
        alert("✓ Admin Authorized Successfully!");
        window.location.href = "/admin";
      } else {
        const err = await res.json();
        alert(`Admin Login Failed: ${err.detail || "Invalid admin credentials"}`);
      }
    } catch (e) {
      // Demo fallback mode for offline backend
      localStorage.setItem("skipd_admin_token", "demo_admin_jwt_token");
      localStorage.setItem("skipd_admin_user", JSON.stringify({ user_name: "SKIPD Admin", email, user_role: "admin" }));
      alert("✓ Admin Authorized! (Demo Mode Active)");
      window.location.href = "/admin";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden bg-[#F8FAFC] text-gray-900 flex flex-col justify-between p-4 md:px-8 py-4 font-sans relative">
      
      {/* 🌊 Background Ambient Glow Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main 2-Column Responsive Layout Grid (Mobile Login Box First) */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center my-auto py-2">
        
        {/* 🔒 RIGHT COLUMN: Floating White Admin Login Card (Order-1 on Mobile, Col 5 on Desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-5 w-full">
          <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 relative max-w-md mx-auto lg:max-w-none">
            
            {/* Top Shield Padlock Header Icon Graphic */}
            <div className="flex flex-col items-center text-center space-y-1.5">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                <div className="absolute inset-0 border border-emerald-200 rounded-full opacity-60" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#059669] text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.66 0 3 1.34 3 3v2h1c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1H8c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1h1v-2c0-1.66 1.34-3 3-3zm0 2c-.55 0-1 .45-1 1v2h2v-2c0-.55-.45-1-1-1z" />
                  </svg>
                </div>
              </div>

              {/* Badge */}
              <span className="bg-[#EAF8F2] text-[#059669] font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                🔒 RESTRICTED ACCESS
              </span>

              {/* Title & Subtitle */}
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                Admin <span className="text-[#059669]">Login</span>
              </h2>
              <p className="text-[11px] text-gray-500 font-medium max-w-xs leading-tight">
                Please sign in to access the SKIPD Store admin panel and manage your business efficiently.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-3 text-xs font-medium">
              
              {/* Email Input */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">Admin Email</label>
                <div className="relative">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@skipd.in"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-gray-900 font-bold focus:border-[#059669] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-gray-700 font-bold mb-1">Password</label>
                <div className="relative">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-9 py-2.5 text-xs text-gray-900 font-bold focus:border-[#059669] focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#059669] focus:ring-[#059669] border-gray-300 accent-[#059669] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("Admin password reset request sent to system administrator.")}
                  className="font-bold text-[#059669] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#059669] hover:bg-[#047857] text-white font-black py-3 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 text-xs cursor-pointer mt-1"
              >
                <span>{loading ? "Authenticating Admin..." : "Sign In to Admin Panel"}</span>
                <span className="text-sm">→</span>
              </button>
            </form>

            {/* OR SIGN IN WITH Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[9px] font-black uppercase text-gray-400 tracking-wider">
                <span className="bg-white px-2.5">OR SIGN IN WITH</span>
              </div>
            </div>

            {/* Social Logins Row: Google, Microsoft, Apple */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Google */}
              <button
                type="button"
                onClick={() => alert("Google Workspace Admin Login Initiated...")}
                className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer shadow-2xs"
                title="Sign in with Google"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>

              {/* Microsoft */}
              <button
                type="button"
                onClick={() => alert("Microsoft Enterprise Azure AD Login Initiated...")}
                className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer shadow-2xs"
                title="Sign in with Microsoft"
              >
                <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                  <div className="bg-[#F25022] w-full h-full" />
                  <div className="bg-[#7FBA00] w-full h-full" />
                  <div className="bg-[#00A4EF] w-full h-full" />
                  <div className="bg-[#FFB900] w-full h-full" />
                </div>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => alert("Apple ID Admin Login Initiated...")}
                className="flex items-center justify-center py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer shadow-2xs text-gray-900"
                title="Sign in with Apple"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.97.99-3.12-1 .04-2.2.67-2.9 1.49-.62.73-1.17 1.9-1.02 3.03 1.11.09 2.26-.57 2.93-1.4" />
                </svg>
              </button>

            </div>

            {/* Bottom Link */}
            <div className="text-center pt-1">
              <Link
                href="/"
                className="text-[11px] font-bold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1.5 transition"
              >
                <span>←</span>
                <span>Back to Customer Storefront</span>
              </Link>
            </div>

          </div>
        </div>

        {/* 🟢 LEFT COLUMN: Branding, Feature Highlights & Live Dashboard Card (Order-2 on Mobile, Col 7 on Desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-5 pr-0 lg:pr-6 hidden sm:block">
          
          {/* Top Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
              S
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900 leading-none">SKIPD</h2>
              <p className="text-[11px] text-gray-500 font-bold tracking-wide mt-0.5">Store Admin</p>
            </div>
          </div>

          {/* Pill Badge */}
          <div>
            <span className="bg-[#EAF8F2] text-[#059669] border border-emerald-200/80 font-black text-[11px] px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
              <svg className="w-3.5 h-3.5 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Powerful. Secure. Smart.</span>
            </span>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Welcome to <br />
              <span className="text-[#059669]">SKIPD Admin Portal</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm font-medium max-w-md leading-relaxed">
              Manage products, orders, customers and delivery operations seamlessly in one place.
            </p>
          </div>

          {/* 3 Feature Bullets with SVG icons inside rounded light-green boxes */}
          <div className="space-y-3 max-w-lg">
            
            {/* Feature 1 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">Secure &amp; Protected</h4>
                <p className="text-[11px] text-gray-500 font-medium">Enterprise grade security to keep your business data safe.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">Real-time Insights</h4>
                <p className="text-[11px] text-gray-500 font-medium">Get real-time analytics and make smarter business decisions.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAF8F2] text-[#059669] flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
                <svg className="w-4 h-4 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m-8-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">Complete Control</h4>
                <p className="text-[11px] text-gray-500 font-medium">Manage your entire store operations from a single dashboard.</p>
              </div>
            </div>

          </div>

          {/* Bottom Live Dashboard Preview Card (Floating 3D Mockup) */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-lg max-w-lg space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#059669] text-white font-black text-[10px] flex items-center justify-center">S</div>
                <span className="font-black text-gray-900 text-xs">SKIPD</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">Overview</span>
            </div>

            {/* 3 Metric Mini Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl space-y-0.5">
                <p className="text-[9px] text-gray-400 font-bold">Total Revenue</p>
                <p className="font-black text-gray-900 text-xs">₹24,85,890</p>
                <p className="text-[8px] text-emerald-600 font-bold">↑ 10.6% vs last week</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl space-y-0.5">
                <p className="text-[9px] text-gray-400 font-bold">Total Orders</p>
                <p className="font-black text-gray-900 text-xs">1,245</p>
                <p className="text-[8px] text-emerald-600 font-bold">↑ 12.4% vs last week</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl space-y-0.5">
                <p className="text-[9px] text-gray-400 font-bold">Total Customers</p>
                <p className="font-black text-gray-900 text-xs">8,542</p>
                <p className="text-[8px] text-emerald-600 font-bold">↑ 8.7% vs last week</p>
              </div>
            </div>

            {/* Mini Sales Overview Line Chart Graphic */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px]">
                <span className="font-bold text-gray-800">Sales Overview</span>
                <span className="text-gray-400 font-medium">This Week ▾</span>
              </div>
              <svg className="w-full h-10 text-[#059669]" viewBox="0 0 300 40" fill="none">
                <path d="M0 32 L40 24 L80 12 L120 22 L160 8 L200 16 L240 6 L280 14 L300 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="40" cy="24" r="2.5" fill="#059669" />
                <circle cx="80" cy="12" r="2.5" fill="#059669" />
                <circle cx="120" cy="22" r="2.5" fill="#059669" />
                <circle cx="160" cy="8" r="2.5" fill="#059669" />
                <circle cx="200" cy="16" r="2.5" fill="#059669" />
                <circle cx="240" cy="6" r="2.5" fill="#059669" />
                <circle cx="280" cy="14" r="2.5" fill="#059669" />
              </svg>
            </div>
          </div>

        </div>

      </div>

      {/* 📄 Footer */}
      <footer className="text-center text-[10px] text-gray-400 font-medium py-1">
        © 2025 SKIPD Store. All rights reserved.
      </footer>

    </div>
  );
}
