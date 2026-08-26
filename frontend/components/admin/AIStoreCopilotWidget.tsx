"use client";

import React, { useState } from "react";
import { getApiBaseUrl } from "lib/api";
import { useRouter } from "next/navigation";

interface InsightCard {
  title: string;
  detail: string;
  type: string;
}

interface ActionBtn {
  label: string;
  query?: string;
  action?: string;
}

export function AIStoreCopilotWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [copilotData, setCopilotData] = useState<{
    copilot_response: string;
    insights: InsightCard[];
    recommended_actions: ActionBtn[];
    metrics_summary?: any;
  }>({
    copilot_response: "Hello Boss! 👋 I am your AI Store Copilot. Ask me how your store is performing or what strategic actions you should take next to boost revenue!",
    insights: [
      { title: "📊 Revenue Diagnostic", detail: "Real-time revenue & orders tracking connected.", type: "info" },
      { title: "💡 Action Recommendation", detail: "Click 'What should I do?' for AI growth advice.", type: "success" }
    ],
    recommended_actions: [
      { label: "📊 How is my store doing?", query: "How is my store doing?" },
      { label: "💡 What should I do?", query: "What should I do?" },
      { label: "⚠️ Check Low Stock", query: "Show low stock items" }
    ]
  });

  const handleQuery = async (queryText?: string) => {
    const text = (queryText || queryInput).trim();
    if (!text || loading) return;

    if (!queryText) setQueryInput("");
    setLoading(true);

    try {
      const apiBase = getApiBaseUrl().replace(/\/+$/, "");
      const res = await fetch(`${apiBase}/admin/copilot/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text })
      });

      if (res.ok) {
        const data = await res.json();
        setCopilotData(data);
      }
    } catch (e) {
      console.error("Error querying AI Store Copilot:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (act: ActionBtn) => {
    if (act.query) {
      handleQuery(act.query);
    } else if (act.action === "create_coupon") {
      setIsOpen(false);
      router.push("/admin/coupons");
    } else if (act.action === "view_inventory" || act.action === "edit_products") {
      setIsOpen(false);
      router.push("/admin/products");
    } else if (act.action === "view_products") {
      setIsOpen(false);
      router.push("/admin/products");
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-emerald-400/40 group cursor-pointer"
        title="Open AI Store Copilot"
      >
        <span className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
          <span className="text-xl">📊</span>
          <span className="hidden md:inline">AI Store Copilot</span>
        </span>
      </button>

      {/* Main Glassmorphic Copilot Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] z-50 bg-slate-950/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 font-sans text-white">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                📊
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">AI Store Copilot</h3>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Merchant Intelligence
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-lg p-1 transition"
            >
              ✕
            </button>
          </div>

          {/* Body Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            
            {/* Copilot Response Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[11px] uppercase tracking-wider">
                <span>🤖 Copilot Diagnostic</span>
              </div>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                {copilotData.copilot_response}
              </p>
            </div>

            {/* Insights Cards */}
            {copilotData.insights && copilotData.insights.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Key Diagnostic Insights
                </span>
                <div className="space-y-2">
                  {copilotData.insights.map((ins, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs ${
                        ins.type === "critical" ? "bg-red-950/40 border-red-800/60 text-red-200" :
                        ins.type === "warning" ? "bg-amber-950/40 border-amber-800/60 text-amber-200" :
                        ins.type === "success" ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-200" :
                        "bg-slate-900/80 border-slate-800 text-slate-300"
                      }`}
                    >
                      <h5 className="font-extrabold">{ins.title}</h5>
                      <p className="text-[11px] opacity-90 mt-0.5">{ins.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {copilotData.recommended_actions && copilotData.recommended_actions.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Recommended Actions
                </span>
                <div className="flex flex-wrap gap-2">
                  {copilotData.recommended_actions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleActionClick(act)}
                      className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold px-3 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs p-2">
                <span className="animate-spin text-base">⚙️</span>
                Analyzing store metrics &amp; generating AI growth diagnostic...
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              placeholder="Ask e.g. 'What should I do?' or 'How is my store doing?'..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleQuery()}
              disabled={loading || !queryInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 transition"
            >
              Ask
            </button>
          </div>

        </div>
      )}
    </>
  );
}
