"use client";

import React from "react";
import Link from "next/link";

interface TiltedCard {
  id: number;
  title: string;
  image: string;
  rotation: string;
  badgeBg: string;
  textColor: string;
  href: string;
}

const TILTED_CARDS: TiltedCard[] = [
  {
    id: 1,
    title: "Royal Bridal Kundan Sets",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
    rotation: "-rotate-6 hover:rotate-0",
    badgeBg: "bg-[#4A121A]",
    textColor: "text-white",
    href: "/search?category=jewelry"
  },
  {
    id: 2,
    title: "18K Solitaire Diamond Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
    rotation: "rotate-3 hover:rotate-0",
    badgeBg: "bg-[#FFFDF9]",
    textColor: "text-[#3B2F2F]",
    href: "/search?category=jewelry"
  },
  {
    id: 3,
    title: "Sterling Silver Zircon Studs",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
    rotation: "-rotate-3 hover:rotate-0",
    badgeBg: "bg-[#4A121A]",
    textColor: "text-white",
    href: "/search?category=jewelry"
  },
  {
    id: 4,
    title: "24K Micron Gold Bangles",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800",
    rotation: "rotate-4 hover:rotate-0",
    badgeBg: "bg-[#FFFDF9]",
    textColor: "text-[#3B2F2F]",
    href: "/search?category=jewelry"
  },
  {
    id: 5,
    title: "Royal Sapphire Pendants",
    image: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800",
    rotation: "-rotate-4 hover:rotate-0",
    badgeBg: "bg-[#4A121A]",
    textColor: "text-white",
    href: "/search?category=jewelry"
  },
  {
    id: 6,
    title: "Freshwater Cultured Pearls",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
    rotation: "rotate-6 hover:rotate-0",
    badgeBg: "bg-[#FFFDF9]",
    textColor: "text-[#3B2F2F]",
    href: "/search?category=jewelry"
  }
];

export function TiltedCardGallery() {
  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-1">
          <span className="text-xs font-black text-[#B8860B] uppercase tracking-widest">
            ✨ Curated Jewelry Stories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2C221E] tracking-tight">
            Handcrafted Masterpieces for Every Occasion
          </h2>
        </div>

        {/* Tilted Cards Stack Layout */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 pt-4 pb-8">
          {TILTED_CARDS.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className={`group relative w-36 sm:w-44 md:w-52 h-64 sm:h-72 md:h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform ${card.rotation} hover:scale-105 hover:z-30 cursor-pointer border-2 border-white/60 shrink-0 block`}
            >
              {/* Card Image */}
              <div className="w-full h-3/4 overflow-hidden relative">
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Scalloped Wavy Bottom Badge Label */}
              <div
                className={`absolute bottom-0 inset-x-0 h-24 p-3 flex flex-col justify-end text-center ${card.badgeBg} ${card.textColor} shadow-lg`}
                style={{
                  clipPath: "polygon(0% 20%, 15% 0%, 30% 20%, 45% 0%, 60% 20%, 75% 0%, 90% 20%, 100% 0%, 100% 100%, 0% 100%)"
                }}
              >
                <p className="font-extrabold text-xs sm:text-sm leading-tight line-clamp-2 drop-shadow-xs">
                  {card.title}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
