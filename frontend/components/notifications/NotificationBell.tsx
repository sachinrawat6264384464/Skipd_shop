"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getApiBaseUrl } from "lib/api";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for live notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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

  const fetchNotifications = async () => {
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("user_token") || localStorage.getItem("ecom_token") || localStorage.getItem("token"))
      : null;
    if (!token) return;

    try {
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      const res = await fetch(`${apiBase}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  };

  const handleMarkAllRead = async () => {
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("user_token") || localStorage.getItem("ecom_token") || localStorage.getItem("token"))
      : null;
    if (!token) return;

    try {
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      await fetch(`${apiBase}/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleMarkSingleRead = async (id: number) => {
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("user_token") || localStorage.getItem("ecom_token") || localStorage.getItem("token"))
      : null;
    if (!token) return;

    try {
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      await fetch(`${apiBase}/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-emerald-600 transition cursor-pointer"
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
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-200">
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h4 className="font-extrabold text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-emerald-500 text-gray-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-emerald-400 hover:underline font-bold"
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
                    n.is_read ? "bg-white hover:bg-gray-50 opacity-80" : "bg-emerald-50/50 hover:bg-emerald-50 border-l-4 border-emerald-500 font-semibold"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm shrink-0 font-bold">
                    {n.type === "order" ? "📦" : n.type === "price_drop" ? "🏷️" : n.type === "wallet" ? "💳" : "📢"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="font-extrabold text-gray-900 leading-tight">{n.title}</h5>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{n.message}</p>
                    {n.link && (
                      <Link href={n.link} className="inline-block text-[10px] text-emerald-700 font-bold mt-1 hover:underline">
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
