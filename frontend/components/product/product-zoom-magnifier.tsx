"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface ProductZoomMagnifierProps {
  imageSrc: string;
  altText: string;
}

export function ProductZoomMagnifier({ imageSrc, altText }: ProductZoomMagnifierProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 50, y: 50, pxX: 0, pxY: 0 });
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Mouse positions in pixels relative to container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Lens dimensions
    const lensWidth = 120;
    const lensHeight = 120;

    // Clamped Lens Position in pixels
    let lensX = mouseX - lensWidth / 2;
    let lensY = mouseY - lensHeight / 2;

    if (lensX < 0) lensX = 0;
    if (lensY < 0) lensY = 0;
    if (lensX > rect.width - lensWidth) lensX = rect.width - lensWidth;
    if (lensY > rect.height - lensHeight) lensY = rect.height - lensHeight;

    // Calculate percentage for backgroundPosition
    const percentX = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (mouseY / rect.height) * 100));

    setLensPosition({
      x: percentX,
      y: percentY,
      pxX: lensX,
      pxY: lensY,
    });
  };

  const handleContainerClick = () => {
    // On mobile & touch screens (< lg), tap opens full screen lightbox
    if (window.innerWidth < 1024) {
      setIsFullscreenOpen(true);
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      
      {/* 🖼️ Main Image Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={handleContainerClick}
        className="relative w-full aspect-square bg-slate-100 rounded-3xl border border-gray-200 overflow-hidden shadow-2xs lg:cursor-crosshair cursor-pointer group"
      >
        {/* Soft Ambient Blurred Background for non-square photos so box is 100% filled & rich */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-125 pointer-events-none transition-all duration-300"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />

        {/* Main Product Image — Perfectly Fitted to Fill Container Box */}
        <img
          src={imageSrc}
          alt={altText}
          className={`relative z-10 w-full h-full ${
            fitMode === "cover" ? "object-cover object-center" : "object-contain p-3"
          } pointer-events-none select-none transition-all duration-200`}
        />

        {/* 🖼️ Floating Fit Mode Toggle (Fill Box / Fit Whole) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFitMode(prev => prev === "cover" ? "contain" : "cover");
          }}
          className="absolute bottom-3 right-3 z-20 bg-white/90 hover:bg-white text-gray-900 font-extrabold text-[10px] px-3 py-1 rounded-full border border-gray-200 shadow-md backdrop-blur-md transition flex items-center gap-1 cursor-pointer"
        >
          <span>{fitMode === "cover" ? "🖼️ Fill Box" : "📐 Fit Whole"}</span>
        </button>

        {/* 🟦 Semi-Transparent Blue Lens Box (Visible ONLY on Desktop >= lg) */}
        {isHovering && (
          <div
            className="hidden lg:block absolute border-2 border-sky-400 bg-sky-400/25 shadow-md pointer-events-none transition-transform duration-75 ease-out rounded-lg z-30"
            style={{
              width: "120px",
              height: "120px",
              left: `${lensPosition.pxX}px`,
              top: `${lensPosition.pxY}px`,
              backgroundImage: "radial-gradient(circle, rgba(56, 189, 248, 0.4) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
            }}
          />
        )}
      </div>

      {/* 💡 Desktop Helper Caption */}
      <p className="hidden lg:flex text-[11px] font-bold text-gray-500 mt-2 items-center gap-1">
        <span>🔍</span> Roll over image to zoom in (Full HD Resolution)
      </p>

      {/* 📱 Mobile Helper Caption */}
      <p className="flex lg:hidden text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full mt-2.5 items-center gap-1.5 shadow-2xs">
        <span>🔍</span> Tap image for HD Fullscreen View
      </p>

      {/* 🔬 DESKTOP Zoom Preview Popup Window (Appears Floating Right on lg: screens) */}
      {isHovering && (
        <div
          className="hidden lg:block absolute left-[105%] top-0 w-[480px] h-[480px] bg-white border border-gray-300 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundPosition: `${lensPosition.x}% ${lensPosition.y}%`,
            backgroundSize: "280%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-md text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Full HD Magnifier (2.8x Zoom)
          </div>
        </div>
      )}

      {/* 📱 MOBILE HD FULLSCREEN LIGHTBOX MODAL */}
      {isFullscreenOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 font-sans animate-in fade-in duration-200">
          
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between text-white pt-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              HD Image Preview
            </span>
            <button
              onClick={() => setIsFullscreenOpen(false)}
              className="bg-white/20 hover:bg-white/30 text-white font-black text-xs px-4 py-2 rounded-full backdrop-blur-md border border-white/20 transition cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* Centered High-Res Image */}
          <div className="relative w-full max-w-lg aspect-square my-auto flex items-center justify-center">
            <img
              src={imageSrc}
              alt={altText}
              className="max-w-full max-h-[75vh] object-cover rounded-2xl shadow-2xl"
            />
          </div>

          {/* Footer Info */}
          <div className="pb-4 text-center">
            <p className="text-xs text-gray-300 font-bold">{altText}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Pinch screen to zoom in</p>
          </div>

        </div>,
        document.body
      )}

    </div>
  );
}
