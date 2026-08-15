"use client";

export default function AdminMediaPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🌄 Media &amp; Asset Library</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Upload product photos, banner artwork, SVG logos &amp; CDN asset management</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer">
          + Upload Media File
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {["1511707171634-5f897ff02aa9", "1505740420928-5e560c06d30e", "1508685096489-7aacd43bd3b1", "1595950653106-6c9ebd614d3a", "1523275335684-37898b6baf30", "1527977966376-1c8408f9f108"].map((img, i) => (
          <div key={i} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 p-2 relative group">
            <img src={`https://images.unsplash.com/photo-${img}?w=300`} alt="Media asset" className="w-full h-full object-cover rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
