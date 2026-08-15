"use client";

export default function AdminBlogPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">📝 Blog &amp; Content Publishing</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Publish SEO articles, product buyer guides &amp; brand announcements</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer">
          + Write New Post
        </button>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs text-center text-gray-500 text-xs py-12 space-y-2">
        <p className="font-bold text-gray-900 text-sm">Blog Publisher Active</p>
        <p>No blog posts published yet. Click above to create your first article.</p>
      </div>
    </div>
  );
}
