"use client";

export default function AdminPermissionsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🔐 Granular RBAC Permissions</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Define role-based access controls for inventory management, refund processing &amp; catalog editing</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs text-xs space-y-4">
        <h3 className="font-black text-sm text-gray-900">Role Matrix</h3>
        <div className="space-y-2 text-gray-700 font-medium">
          <p>✔ <strong>Super Admin</strong>: Unrestricted full system access to database schemas &amp; API keys</p>
          <p>✔ <strong>Inventory Manager</strong>: Can edit product prices, stock quantities &amp; warehouse locations</p>
          <p>✔ <strong>Support Agent</strong>: Access limited to order tracking, customer tickets &amp; return requests</p>
        </div>
      </div>
    </div>
  );
}
