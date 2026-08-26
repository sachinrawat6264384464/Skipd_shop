'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getApiBaseUrl } from 'lib/api';

interface ProductCard {
  id: number;
  title: string;
  handle: string;
  price: number;
  formatted_price: string;
  image_url: string;
  rating: number;
  category_name: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  products?: ProductCard[];
  suggestedActions?: string[];
  isGuardrail?: boolean;
  isGuestLimit?: boolean;
  timestamp: string;
}




export default function FloatingChatbot() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide Customer AI Recommender Chatbot on Admin dashboard pages (/admin and /admin/*)
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `guest_session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Namaste! 👋 I am your E-COM AI Recommender. Ask me for product recommendations by price, categories, or deals!\n\n🔒 Guest users can send **3 free messages**. Login for unlimited access!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    // Check user auth token (NO localStorage used for guest count tracking)
    const token = localStorage.getItem('user_token') || localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || loading) return;

    if (!isLoggedIn && guestCount >= 3) {
      setShowLoginModal(true);
      return;
    }

    const userMsgObj: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsgObj];
    setMessages(newMessages);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    // Build conversation history payload
    const historyPayload = newMessages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const apiBase = getApiBaseUrl().replace(/\/+$/, '');
      const endpoint = apiBase.endsWith('/chatbot') ? apiBase : `${apiBase}/chatbot/recommend`;

      let data: any = null;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(isLoggedIn ? { 'Authorization': `Bearer ${localStorage.getItem('user_token') || ''}` } : {})
          },
          body: JSON.stringify({
            user_message: queryText,
            session_id: sessionId,
            conversation_history: historyPayload,
            is_guest: !isLoggedIn
          })
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          data = await res.json();
        }
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        // Backend unavailable — show clean retry message, no wrong hardcoded products
        data = {
          response_text: `Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄`,
          products: [],
          suggested_actions: ["Products under ₹500", "Latest Mobiles", "Best Deals"],
          is_guest: !isLoggedIn
        };
      }

      if (!data) {
        throw new Error("No data returned");
      }

      if (data.is_guest_limit) {
        setShowLoginModal(true);
      }

      if (data.guest_query_count !== undefined) {
        setGuestCount(data.guest_query_count);
      }

      const aiMsgObj: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.response_text || 'Here are recommended products for you:',
        products: data.products || [],
        suggestedActions: data.suggested_actions || [],
        isGuardrail: data.is_guardrail || false,
        isGuestLimit: data.is_guest_limit || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: '⚠️ Something went wrong. Please try again!',
          products: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (handle: string) => {
    setIsOpen(false);
    router.push(`/product/${handle}`);
  };

  return (
    <>
      {/* Floating Action Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-emerald-400/40 cursor-pointer"
        aria-label="Open AI Recommender Chatbot"
      >
        <span className="relative flex items-center justify-center">
          <span className="text-2xl">🤖</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </span>
      </button>

      {/* Main Glassmorphic Chatbot Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] z-50 bg-slate-950/95 backdrop-blur-xl border border-emerald-900/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 border-b border-emerald-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-xl shadow-xs">
                🤖
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-wide">E-COM AI Assistant</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Recommender
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xl p-1 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-br-none shadow-md'
                      : msg.isGuardrail
                      ? 'bg-amber-900/40 border border-amber-500/40 text-amber-200 rounded-bl-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Render Rectangular Product Cards Grid (Max 6) */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {msg.products.slice(0, 6).map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleProductClick(prod.handle)}
                          className="flex items-center gap-3 p-2.5 bg-slate-900/90 hover:bg-emerald-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all duration-200 group"
                        >
                          <img
                            src={prod.image_url}
                            alt={prod.title}
                            className="w-14 h-14 object-cover rounded-lg border border-slate-700 group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                              {prod.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">{prod.category_name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-bold text-emerald-400">{prod.formatted_price}</span>
                              <span className="text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.5 rounded">
                                ⭐ {prod.rating}
                              </span>
                            </div>
                          </div>
                          <span className="text-slate-500 group-hover:text-emerald-400 text-sm font-bold pr-1">→</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Suggested Action Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(action.replace(/^[^a-zA-Z0-9\s]+/, '').trim() || action)}
                          className="text-[11px] bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 rounded-full px-2.5 py-1 font-semibold transition cursor-pointer"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="block text-[10px] text-slate-400 mt-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <span className="animate-spin text-emerald-400 text-base">⚙️</span>
                Finding top product recommendations...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Recommendation Prompt Chips */}
          <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSendMessage('Products under ₹500')}
              className="text-xs bg-slate-900 hover:bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hover:border-emerald-500/60 rounded-full px-3 py-1 whitespace-nowrap transition-all cursor-pointer"
            >
              🏷️ Products under ₹500
            </button>
            <button
              onClick={() => handleSendMessage('Trending Graphic Tees')}
              className="text-xs bg-slate-900 hover:bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hover:border-emerald-500/60 rounded-full px-3 py-1 whitespace-nowrap transition-all cursor-pointer"
            >
              👕 Graphic Tees
            </button>
            <button
              onClick={() => handleSendMessage('100 to 300 price products')}
              className="text-xs bg-slate-900 hover:bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hover:border-emerald-500/60 rounded-full px-3 py-1 whitespace-nowrap transition-all cursor-pointer"
            >
              💰 ₹100-₹300 Range
            </button>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask e.g. 'Products under ₹500'..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Guest Query Limit Login Required Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-600/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <h3 className="text-xl font-bold text-white mb-2">3 Free Messages Used! 🔒</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              You have used your <strong>3 free guest messages</strong>. Login to unlock <strong>unlimited AI recommendations</strong>, wishlist, order tracking and wallet perks!
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setIsOpen(false);
                  router.push('/login');
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Log In Now
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
