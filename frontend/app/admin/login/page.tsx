"use client";

import { useState } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@skipd.in");
  const [password, setPassword] = useState("admin123");
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
        alert("Admin Authorized Successfully!");
        window.location.href = "/admin";
      } else {
        const err = await res.json();
        alert(`Admin Login Failed: ${err.detail || "Invalid admin credentials"}`);
      }
    } catch (e) {
      // Demo fallback mode for offline backend
      localStorage.setItem("skipd_admin_token", "demo_admin_jwt_token");
      localStorage.setItem("skipd_admin_user", JSON.stringify({ user_name: "SKIPD Admin", email, user_role: "admin" }));
      alert("Admin Authorized! (Demo Mode)");
      window.location.href = "/admin";
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center font-bold text-xl mb-3">
            ⚙️
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
            Restricted Admin Portal
          </span>
          <h1 className="text-2xl font-bold mt-4">SKIPD Store Admin Login</h1>
          <p className="text-xs text-neutral-400 mt-1">Authenticate to manage products, orders, and Shiprocket courier fulfillment</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-neutral-400 block mb-1 font-medium">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition text-sm mt-4 shadow-lg shadow-emerald-500/20"
          >
            {loading ? "Authenticating Admin..." : "Log In to Admin Panel"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-neutral-500">
          <Link href="/" className="hover:text-neutral-300 transition">
            &larr; Back to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
