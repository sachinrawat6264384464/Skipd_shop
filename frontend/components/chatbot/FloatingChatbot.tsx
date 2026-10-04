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

  // Dragging state & refs for AI Bot Floating Button
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : (typeof window !== 'undefined' ? window.innerWidth - 140 : 0);
    const currentY = rect ? rect.top : (typeof window !== 'undefined' ? window.innerHeight - 140 : 0);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: currentX,
      posY: currentY
    };
    hasMovedRef.current = false;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.mouseX;
      const deltaY = moveEvent.clientY - dragStartRef.current.mouseY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMovedRef.current = true;
        setIsDragging(true);
      }

      let newX = dragStartRef.current.posX + deltaX;
      let newY = dragStartRef.current.posY + deltaY;

      const botSize = 96;
      const maxX = typeof window !== 'undefined' ? window.innerWidth - botSize - 32 : 1000;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - botSize - 32 : 1000;

      newX = Math.max(32, Math.min(maxX, newX));
      newY = Math.max(32, Math.min(maxY, newY));

      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    const currentX = rect ? rect.left : (typeof window !== 'undefined' ? window.innerWidth - 140 : 0);
    const currentY = rect ? rect.top : (typeof window !== 'undefined' ? window.innerHeight - 140 : 0);

    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      posX: currentX,
      posY: currentY
    };
    hasMovedRef.current = false;

    const onTouchMove = (moveEvent: TouchEvent) => {
      const t = moveEvent.touches[0];
      if (!t) return;

      const deltaX = t.clientX - dragStartRef.current.mouseX;
      const deltaY = t.clientY - dragStartRef.current.mouseY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        hasMovedRef.current = true;
        setIsDragging(true);
      }

      let newX = dragStartRef.current.posX + deltaX;
      let newY = dragStartRef.current.posY + deltaY;

      const botSize = 96;
      const maxX = typeof window !== 'undefined' ? window.innerWidth - botSize - 32 : 1000;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - botSize - 32 : 1000;

      newX = Math.max(32, Math.min(maxX, newX));
      newY = Math.max(32, Math.min(maxY, newY));

      setPosition({ x: newX, y: newY });
    };

    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const getDrawerStyle = (): React.CSSProperties => {
    if (!position || typeof window === 'undefined') {
      return {};
    }
    let top = position.y - 590;
    if (top < 15) {
      top = Math.min(window.innerHeight - 600, position.y + 100);
    }
    let left = position.x - 310;
    if (left < 10) left = 10;
    if (left + 420 > window.innerWidth) left = window.innerWidth - 430;

    return {
      position: 'fixed',
      top: `${Math.max(10, top)}px`,
      left: `${Math.max(10, left)}px`,
      bottom: 'auto',
      right: 'auto'
    };
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Namaste! 👋 I am your BotCom AI Recommender. Ask me for product recommendations by price, categories, or deals!\n\n🔒 Guest users can send **3 free messages**. Login for unlimited access!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
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
      }

      // If backend was offline, slow or failed, execute Smart Client-Side AI Catalog Recommender
      if (!data || !data.response_text || data.response_text.includes("trouble connecting")) {
        try {
          const { fetchProducts } = await import('lib/api');
          const allProds = await fetchProducts().catch(() => []);
          const lower = queryText.toLowerCase().trim();

          let matched = [...allProds];
          let responseText = "";
          let suggestedActions: string[] = [];

          if (lower.includes("best deal") || lower.includes("deal") || lower.includes("offer") || lower.includes("discount")) {
            matched = allProds.filter(p => p.compare_at_price && p.compare_at_price > p.price);
            if (matched.length === 0) matched = allProds.filter(p => p.featured);
            responseText = `🔥 Here are our top **Best Deals** with up to 50% discount live right now! 👇`;
            suggestedActions = ["Products under ₹500", "Latest Mobiles", "Graphic Tees"];
          } else if (lower.includes("under ₹500") || lower.includes("under 500") || lower.includes("below 500") || lower.includes("500")) {
            matched = allProds.filter(p => Number(p.price) <= 500);
            if (matched.length > 0) {
              responseText = `🏷️ Found **${matched.length} items** under ₹500! 👇`;
            } else {
              matched = [...allProds].sort((a, b) => a.price - b.price).slice(0, 4);
              responseText = `🏷️ Here are the most affordable budget picks starting at **₹${matched[0]?.price.toLocaleString("en-IN")}**! 👇`;
            }
            suggestedActions = ["Graphic Tees", "Best Deals", "Latest Mobiles"];
          } else if (lower.includes("mobile") || lower.includes("phone") || lower.includes("oneplus") || lower.includes("nord")) {
            matched = allProds.filter(p => p.category?.slug === "mobiles" || p.tags?.includes("mobiles") || p.title.toLowerCase().includes("nord") || p.title.toLowerCase().includes("mobile"));
            if (matched.length === 0) matched = allProds.filter(p => p.tags?.includes("tech"));
            responseText = `📱 Here are top **Flagship Mobiles & Smartphones**! 👇`;
            suggestedActions = ["Best Deals", "Products under ₹500", "Graphic Tees"];
          } else if (lower.includes("graphic tee") || lower.includes("tee") || lower.includes("shirt") || lower.includes("fashion")) {
            matched = allProds.filter(p => p.tags?.includes("apparel") || p.title.toLowerCase().includes("tee") || p.category?.slug === "fashion");
            responseText = `👕 Here are our trending **240 GSM Heavyweight Oversized Graphic Tees**! 👇`;
            suggestedActions = ["Best Deals", "Latest Mobiles", "Products under ₹500"];
          } else if (lower.includes("100") || lower.includes("300") || lower.includes("range")) {
            matched = [...allProds].sort((a, b) => a.price - b.price).slice(0, 4);
            responseText = `💰 Here are our top budget picks starting from **₹${matched[0]?.price.toLocaleString("en-IN")}**! 👇`;
            suggestedActions = ["Best Deals", "Graphic Tees", "Latest Mobiles"];
          } else {
            const words = lower.split(/\s+/).filter(w => w.length > 2);
            matched = allProds.filter(p => {
              const pStr = `${p.title} ${p.description || ""} ${p.tags?.join(" ") || ""} ${p.category?.name || ""}`.toLowerCase();
              return words.some(w => pStr.includes(w));
            });
            if (matched.length === 0) matched = allProds.slice(0, 4);
            responseText = `✨ Found **${matched.length} top product recommendation(s)** for you! 👇`;
            suggestedActions = ["Best Deals", "Products under ₹500", "Latest Mobiles"];
          }

          const productsPayload = matched.slice(0, 6).map((p) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            price: p.price,
            formatted_price: `₹${p.price.toLocaleString("en-IN")}`,
            image_url: p.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
            rating: 4.8,
            category_name: typeof p.category === "object" ? p.category?.name : (p.category || "BotCom Collection")
          }));

          data = {
            response_text: responseText,
            products: productsPayload,
            suggested_actions: suggestedActions,
            is_guest: !isLoggedIn
          };
        } catch (e) {
          data = {
            response_text: `✨ Here are our top trending products from the store catalog! 👇`,
            products: [],
            suggested_actions: ["Best Deals", "Latest Mobiles", "Graphic Tees"],
            is_guest: !isLoggedIn
          };
        }
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

      // Strict budget filtering check: Extract max price if specified in query (e.g., "under ₹500")
      let maxBudget: number | null = null;
      const lowerQuery = queryText.toLowerCase();

      const underMatch = lowerQuery.match(/under\s*₹?\s*(\d+)/) || lowerQuery.match(/below\s*₹?\s*(\d+)/) || lowerQuery.match(/less\s*than\s*₹?\s*(\d+)/);
      if (underMatch && underMatch[1]) {
        maxBudget = parseInt(underMatch[1], 10);
      } else {
        const rangeMatch = lowerQuery.match(/(\d+)\s*to\s*(\d+)/);
        if (rangeMatch && rangeMatch[2]) {
          maxBudget = parseInt(rangeMatch[2], 10);
        }
      }

      if (maxBudget !== null && data.products && data.products.length > 0) {
        data.products = data.products.filter((p: any) => Number(p.price) <= maxBudget!);
      }

      // If no products match budget from backend response, query live catalog for items under maxBudget
      if (maxBudget !== null && (!data.products || data.products.length === 0)) {
        try {
          const { fetchProducts } = await import('lib/api');
          const catalogProds = await fetchProducts().catch(() => []);
          const filteredCatalog = catalogProds.filter((p) => Number(p.price) <= maxBudget!);
          if (filteredCatalog.length > 0) {
            data.products = filteredCatalog.slice(0, 6).map((p) => ({
              id: p.id,
              title: p.title,
              handle: p.handle,
              price: p.price,
              formatted_price: `₹${p.price.toLocaleString("en-IN")}`,
              image_url: p.images?.[0] || "",
              rating: 4.5,
              category_name: typeof p.category === "object" ? p.category?.name : (p.category || "Store")
            }));
            data.response_text = `I found **${data.products.length} options** under ₹${maxBudget}! 👇`;
          } else {
            data.response_text = `Currently, all items in our live catalog are priced above ₹${maxBudget}. Feel free to browse our store catalog! 🏷️`;
          }
        } catch (e) {}
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
      {/* Floating Action Launcher Button (Draggable) */}
      <div
        ref={buttonRef}
        onClick={handleButtonClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={
          position
            ? { left: `${position.x}px`, top: `${position.y}px`, bottom: 'auto', right: 'auto' }
            : {}
        }
        className={`fixed ${!position ? 'bottom-10 right-10 sm:bottom-14 sm:right-14' : ''} z-50 w-20 h-20 sm:w-24 sm:h-24 bg-transparent select-none touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } active:scale-95 transition-transform duration-200 flex items-center justify-center`}
        aria-label="Open AI Recommender Chatbot"
        title="Click to chat • Drag to move anywhere"
      >
        <span className="relative w-full h-full flex items-center justify-center">
          <video
            src="/bot-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain pointer-events-none rounded-full"
          />
        </span>
      </div>

      {/* Main Glassmorphic Chatbot Window Drawer */}
      {isOpen && (
        <div
          style={getDrawerStyle()}
          className={`fixed ${!position ? 'bottom-34 right-10 sm:bottom-38 sm:right-14' : ''} w-[410px] max-w-[calc(100vw-2rem)] h-[580px] z-50 bg-gradient-to-b from-slate-950 via-blue-950/95 to-slate-950 backdrop-blur-2xl border-2 border-white/90 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300`}
        >
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 border-b border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 shrink-0 relative flex items-center justify-center">
                <img
                  src="/bot-header-avatar.png"
                  alt="BotCom AI Assistant"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(56,189,248,0.6)]"
                />
              </div>
              <div>
                <h3 className="text-white font-black text-sm tracking-wide">BotCom AI Assistant</h3>
                <p className="text-xs text-sky-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
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
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm scrollbar-thin scrollbar-thumb-blue-900/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white font-medium rounded-br-none shadow-md shadow-blue-900/40'
                      : msg.isGuardrail
                      ? 'bg-amber-950/60 border border-amber-500/40 text-amber-200 rounded-bl-none'
                      : 'bg-slate-900/90 border border-blue-500/30 text-slate-100 rounded-bl-none shadow-sm'
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
                          className="flex items-center gap-3 p-2.5 bg-slate-900/90 hover:bg-blue-950/80 border border-blue-900/60 hover:border-sky-400/70 rounded-xl cursor-pointer transition-all duration-200 group"
                        >
                          <img
                            src={prod.image_url}
                            alt={prod.title}
                            className="w-14 h-14 object-cover rounded-lg border border-slate-700 group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate group-hover:text-sky-300 transition-colors">
                              {prod.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">{prod.category_name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-bold text-sky-400">{prod.formatted_price}</span>
                            </div>
                          </div>
                          <span className="text-slate-500 group-hover:text-sky-400 text-sm font-bold pr-1">→</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Suggested Action Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-blue-900/40">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(action.replace(/^[^a-zA-Z0-9\s]+/, '').trim() || action)}
                          className="text-[11px] bg-blue-950/80 hover:bg-blue-900 text-sky-200 border border-sky-500/40 rounded-full px-2.5 py-1 font-semibold transition cursor-pointer"
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
              <div className="flex items-center gap-2 text-slate-300 text-xs p-2">
                <span className="animate-spin text-sky-400 text-base">⚙️</span>
                Finding top product recommendations...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset Recommendation Prompt Chips */}
          <div className="px-3 py-2 bg-slate-950/90 border-t border-blue-900/60 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSendMessage('Products under ₹500')}
              className="text-xs bg-slate-900 hover:bg-blue-950/90 text-sky-300 border border-blue-500/40 hover:border-sky-400/70 rounded-full px-3 py-1 whitespace-nowrap transition-all cursor-pointer"
            >
              🏷️ Products under ₹500
            </button>
            <button
              onClick={() => handleSendMessage('Trending Graphic Tees')}
              className="text-xs bg-slate-900 hover:bg-blue-950/90 text-sky-300 border border-blue-500/40 hover:border-sky-400/70 rounded-full px-3 py-1 whitespace-nowrap transition-all cursor-pointer"
            >
              👕 Graphic Tees
            </button>
            <button
              onClick={() => handleSendMessage('100 to 300 price products')}
              className="text-xs bg-slate-900 hover:bg-blue-950/90 text-sky-300 border border-blue-500/40 hover:border-sky-400/70 rounded-full px-3 py-1 whitespace-nowrap transition-all cursor-pointer"
            >
              💰 ₹100-₹300 Range
            </button>
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-blue-900/60 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask e.g. 'Products under ₹500'..."
              className="flex-1 bg-slate-900 border border-blue-500/40 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 shadow-inner"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 via-sky-600 to-blue-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-blue-500/30"
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
