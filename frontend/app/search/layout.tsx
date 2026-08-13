import Footer from "components/layout/footer";
import { CatalogSidebarFilters } from "components/layout/search/sidebar-filters";
import { Suspense } from "react";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 py-8 w-full">
        
        {/* Main 2-Column Grid: Left Sidebar (3 Cols) + Right Catalog (9 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* 📍 Left Sidebar: Rich E-Commerce Filter Panel (3 Cols Sticky) */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 h-full space-y-6 self-start">
            <Suspense fallback={<div className="p-4 bg-white rounded-3xl animate-pulse">Loading Filters...</div>}>
              <CatalogSidebarFilters />
            </Suspense>
          </div>

          {/* 🛍️ Right Catalog: Header Controls, 4-Col Product Cards & Pagination (9 Cols) */}
          <div className="lg:col-span-9 space-y-6">
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}
