"use client";

export default function AdminUsersRolesPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">👤 Staff Users &amp; Admin Roles</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage administrative accounts, staff roles (Manager, Support, Fulfillment) &amp; access credentials</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer">
          + Add Staff Account
        </button>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-3 text-xs">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-900 text-sm">Sachin Rawat</p>
            <p className="text-gray-400 font-mono">admin@skipd.com</p>
          </div>
          <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-full uppercase text-[10px]">Super Admin</span>
        </div>
      </div>
    </div>
  );
}
