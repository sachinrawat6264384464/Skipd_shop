"use client";

export default function AdminCustomPagesPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📄 Custom CMS Pages</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage About Us, Terms of Service, Privacy Policy &amp; custom storefront pages</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer">
          + Create New Page
        </button>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs p-6 space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">About Us &amp; Brand Story</h4>
            <p className="text-xs text-emerald-700 font-mono">/about</p>
          </div>
          <button className="text-blue-600 font-bold text-xs hover:underline">Edit Content</button>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Terms &amp; Conditions</h4>
            <p className="text-xs text-emerald-700 font-mono">/terms</p>
          </div>
          <button className="text-blue-600 font-bold text-xs hover:underline">Edit Content</button>
        </div>

        <div className="flex justify-between items-center py-2">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Privacy Policy &amp; Data Security</h4>
            <p className="text-xs text-emerald-700 font-mono">/privacy</p>
          </div>
          <button className="text-blue-600 font-bold text-xs hover:underline">Edit Content</button>
        </div>
      </div>
    </div>
  );
}
