"use client";

import { useState, useRef } from "react";

interface ProductZoomMagnifierProps {
  imageSrc: string;
  altText: string;
}

export function ProductZoomMagnifier({ imageSrc, altText }: ProductZoomMagnifierProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 50, y: 50, pxX: 0, pxY: 0 });
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

  return (
    <div className="relative flex flex-col items-center">
      {/* 🖼️ Main Image Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-square bg-white rounded-3xl border border-gray-200 overflow-hidden p-4 shadow-xs cursor-crosshair group"
      >
        <img
          src={imageSrc}
          alt={altText}
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* 🟦 Semi-Transparent Blue Lens Box (Amazon-Style Grid Box) */}
        {isHovering && (
          <div
            className="absolute border-2 border-sky-400 bg-sky-400/25 shadow-md pointer-events-none transition-transform duration-75 ease-out rounded-lg"
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

      <p className="text-[11px] font-bold text-gray-500 mt-2 flex items-center gap-1">
        <span>🔍</span> पूरा व्यू देखने के लिए माउस ऊपर लाएं (Hover for Full HD Zoom)
      </p>

      {/* 🔬 Zoom Preview Popup Window (Appears Floating Right) */}
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
    </div>
  );
}
