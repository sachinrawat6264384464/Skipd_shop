"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getApiBaseUrl } from "lib/api";

interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "seed-sale-1",
    title: "⚡ Great Freedom Sale is Live!",
    message: "Up to 50% OFF on flagship smartphones, headphones & designer wear.",
    type: "sale",
    link: "/deals",
    is_read: false,
    created_at: "Just now"
  },
  {
    id: "seed-product-1",
    title: "🚀 New Arrivals Drop Added",
    message: "Fresh seasonal drops and trending gadgets are live in store catalog.",
    type: "product",
    link: "/new-arrivals",
    is_read: false,
    created_at: "1 hour ago"
  },
  {
    id: "seed-shipping-1",
    title: "🚚 Free Express Shipping",
    message: "Free 2-day doorstep shipping unlocked on orders above ₹499.",
    type: "announcement",
    link: "/search",
    is_read: true,
    created_at: "Yesterday"
  }
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(2);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAndSyncNotifications = async () => {
    let broadcastList: NotificationItem[] = [];
    try {
      const stored = localStorage.getItem("ecom_live_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) broadcastList = parsed;
      }
    } catch (e) {}

    let apiNotifs: NotificationItem[] = [];
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("user_token") || localStorage.getItem("ecom_token") || localStorage.getItem("token"))
      : null;

    if (token) {
      try {
        const apiBase = getApiBaseUrl().replace(/\/+$/, "");
        const res = await fetch(`${apiBase}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          apiNotifs = data.notifications || [];
        }
      } catch (e) {}
    }

    const map = new Map<string | number, NotificationItem>();
    [...broadcastList, ...apiNotifs, ...SEED_NOTIFICATIONS].forEach((n) => {
      const key = String(n.id || n.title);
      if (!map.has(key)) map.set(key, n);
    });

    const combined = Array.from(map.values());
    setNotifications(combined);
    setUnreadCount(combined.filter((n) => !n.is_read).length);
  };

  useEffect(() => {
    fetchAndSyncNotifications();

    const handleBroadcast = () => fetchAndSyncNotifications();
    window.addEventListener("ecom_notification_broadcast", handleBroadcast);
    window.addEventListener("storage", handleBroadcast);

    const interval = setInterval(fetchAndSyncNotifications, 15000);
    return () => {
      window.removeEventListener("ecom_notification_broadcast", handleBroadcast);
      window.removeEventListener("storage", handleBroadcast);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const broadcastList = notifications.map((n) => ({ ...n, is_read: true }));
      localStorage.setItem("ecom_live_notifications", JSON.stringify(broadcastList));
    } catch (e) {}
  };

  const handleMarkSingleRead = (id: number | string) => {
    setNotifications((prev) =>
      prev.map((n) => (String(n.id) === String(id) ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full text-gray-700 hover:bg-gray-100 hover:text-emerald-600 transition cursor-pointer"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-2xl border border-gray-200/90 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h4 className="font-extrabold text-sm">Live Store Alerts</h4>
              {unreadCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-xs">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-medium">
                <span className="text-2xl block mb-1">🔕</span>
                No new notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) handleMarkSingleRead(n.id);
                  }}
                  className={`p-3.5 transition flex items-start gap-3 cursor-pointer ${
                    n.is_read ? "bg-white hover:bg-gray-50 opacity-80" : "bg-emerald-50/60 hover:bg-emerald-50 border-l-4 border-emerald-500 font-semibold"
                  }`}
                >
                  <div className="w-8.5 h-8.5 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center text-base shrink-0 font-bold shadow-2xs">
                    {n.type === "sale" ? "⚡" : n.type === "product" ? "🚀" : n.type === "order" ? "📦" : "📢"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-black text-gray-900 leading-tight truncate">{n.title}</h5>
                      <span className="text-[9px] text-gray-400 shrink-0 font-medium">{n.created_at}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{n.message}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-block text-[10px] text-emerald-700 font-bold mt-1.5 hover:underline"
                      >
                        View Details &rsaquo;
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
