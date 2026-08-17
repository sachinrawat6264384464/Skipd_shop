"use client";

import { useState, useEffect } from "react";

interface SidebarModule {
  id: string;
  name: string;
  category: string;
  icon: string;
}

const SIDEBAR_MODULES: SidebarModule[] = [
  { id: "analytics", name: "Analytics & Insights", category: "Overview", icon: "📊" },
  { id: "orders", name: "Orders & Fulfillment", category: "Commerce & Catalog", icon: "📦" },
  { id: "products", name: "Products & Catalog", category: "Commerce & Catalog", icon: "🏷️" },
  { id: "inventory", name: "Inventory & Stock", category: "Commerce & Catalog", icon: "🏭" },
  { id: "customers", name: "Customers & Accounts", category: "Commerce & Catalog", icon: "👥" },
  { id: "payments", name: "Payments & Finance", category: "Commerce & Catalog", icon: "💳" },
  { id: "delivery", name: "Delivery & Express Logistics", category: "Commerce & Catalog", icon: "🚚" },
  { id: "sales", name: "Marketing & Sales", category: "Growth & Content", icon: "🎯" },
  { id: "engagement", name: "Customer Engagement", category: "Growth & Content", icon: "💬" },
  { id: "homepage", name: "Content & CMS", category: "Growth & Content", icon: "📝" },
  { id: "tickets", name: "Support & Tickets", category: "Growth & Content", icon: "🎧" },
  { id: "queries", name: "Product Queries & Returns", category: "Growth & Content", icon: "🔄" },
  { id: "settings", name: "Store System Settings", category: "Administration", icon: "⚙️" }
];

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  avatar: string;
  lastActive: string;
  permissions: string[];
}

const INITIAL_STAFF: StaffUser[] = [
  {
    id: 1,
    name: "Sachin Rawat",
    email: "admin@skipd.com",
    role: "Super Admin",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    lastActive: "Just now (Online)",
    permissions: SIDEBAR_MODULES.map(m => m.id)
  },
  {
    id: 2,
    name: "Vikram Malhotra",
    email: "vikram@skipd.com",
    role: "Store Manager",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    lastActive: "12 mins ago",
    permissions: ["orders", "products", "inventory", "customers", "delivery"]
  },
  {
    id: 3,
    name: "Ananya Roy",
    email: "ananya@skipd.com",
    role: "Logistics Manager",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    lastActive: "1 hour ago",
    permissions: ["orders", "inventory", "delivery", "queries"]
  },
  {
    id: 4,
    name: "Rohan Sharma",
    email: "rohan@skipd.com",
    role: "Support Executive",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    lastActive: "3 hours ago",
    permissions: ["customers", "tickets", "queries"]
  },
  {
    id: 5,
    name: "Pooja Gupta",
    email: "pooja@skipd.com",
    role: "Marketing Specialist",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
    lastActive: "Yesterday",
    permissions: ["analytics", "sales", "engagement", "homepage"]
  }
];

export default function AdminUsersRolesPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff");
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("Store Manager");
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  // Load persisted staff on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("skipd_staff_users");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStaffList(parsed);
          }
        }
      } catch (e) {}
    }
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveToLocalStorage = (updated: StaffUser[]) => {
    setStaffList(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("skipd_staff_users", JSON.stringify(updated));
      } catch (e) {}
    }
  };

  // Pre-select module permissions based on role presets
  const handleRolePresetChange = (role: string) => {
    setFormRole(role);
    if (role === "Super Admin") {
      setFormPermissions(SIDEBAR_MODULES.map(m => m.id));
    } else if (role === "Store Manager") {
      setFormPermissions(["analytics", "orders", "products", "inventory", "customers", "delivery"]);
    } else if (role === "Logistics Manager") {
      setFormPermissions(["orders", "inventory", "delivery", "queries"]);
    } else if (role === "Support Executive") {
      setFormPermissions(["customers", "tickets", "queries"]);
    } else if (role === "Marketing Specialist") {
      setFormPermissions(["analytics", "sales", "engagement", "homepage"]);
    } else {
      setFormPermissions(["orders", "products"]);
    }
  };

  const openCreateModal = () => {
    setEditingStaffId(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("• • • • • • • •");
    setFormRole("Store Manager");
    setFormPermissions(["analytics", "orders", "products", "inventory", "customers", "delivery"]);
    setIsModalOpen(true);
  };

  const openEditModal = (staff: StaffUser) => {
    setEditingStaffId(staff.id);
    setFormName(staff.name);
    setFormEmail(staff.email);
    setFormPassword("••••••••");
    setFormRole(staff.role);
    setFormPermissions(staff.permissions);
    setIsModalOpen(true);
  };

  const handleTogglePermission = (moduleId: string) => {
    if (formPermissions.includes(moduleId)) {
      setFormPermissions(formPermissions.filter(id => id !== moduleId));
    } else {
      setFormPermissions([...formPermissions, moduleId]);
    }
  };

  const handleSelectAllPermissions = () => {
    setFormPermissions(SIDEBAR_MODULES.map(m => m.id));
  };

  const handleDeselectAllPermissions = () => {
    setFormPermissions([]);
  };

  const handleSubmitStaffForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast("Please provide staff name & email address", "error");
      return;
    }

    if (editingStaffId !== null) {
      // Update existing staff
      const updated = staffList.map(s => s.id === editingStaffId ? {
        ...s,
        name: formName,
        email: formEmail,
        role: formRole,
        permissions: formPermissions
      } : s);
      saveToLocalStorage(updated);
      showToast(`🎉 Staff user ${formName} permissions updated successfully!`);
    } else {
      // Create new staff
      const newStaff: StaffUser = {
        id: Date.now(),
        name: formName,
        email: formEmail,
        role: formRole,
        status: "Active",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formName)}`,
        lastActive: "Just added",
        permissions: formPermissions
      };
      saveToLocalStorage([newStaff, ...staffList]);
      showToast(`🎉 Staff user ${formName} created with ${formPermissions.length} sidebar service permissions!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteStaff = (id: number, name: string) => {
    if (confirm(`Are you sure you want to remove staff account "${name}"?`)) {
      const updated = staffList.filter(s => s.id !== id);
      saveToLocalStorage(updated);
      showToast(`Staff account "${name}" deleted`, "error");
    }
  };

  const handleToggleStatus = (id: number) => {
    const updated = staffList.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === "Active" ? "Inactive" : "Active";
        return { ...s, status: nextStatus as any };
      }
      return s;
    });
    saveToLocalStorage(updated);
    showToast("Staff status updated!");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-xs font-black shadow-2xl border flex items-center gap-2 animate-bounce ${
          toastMessage.type === "success" 
            ? "bg-[#EAF8F2] text-[#059669] border-emerald-300" 
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span>👤 Staff Users &amp; Admin Roles</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage administrative accounts, role permissions &amp; sidebar service access control
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span>+</span>
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">TOTAL STAFF ACCOUNTS</span>
          <p className="text-2xl font-black text-gray-900">{staffList.length}</p>
          <p className="text-[11px] text-emerald-600 font-bold">Active admin users</p>
        </div>
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SUPER ADMINS</span>
          <p className="text-2xl font-black text-emerald-700">{staffList.filter(s => s.role === "Super Admin").length}</p>
          <p className="text-[11px] text-gray-500 font-medium">Master access keys</p>
        </div>
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">STORE MANAGERS</span>
          <p className="text-2xl font-black text-indigo-700">{staffList.filter(s => s.role === "Store Manager" || s.role === "Logistics Manager").length}</p>
          <p className="text-[11px] text-gray-500 font-medium">Catalog &amp; Order leads</p>
        </div>
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SIDEBAR MODULES</span>
          <p className="text-2xl font-black text-amber-600">{SIDEBAR_MODULES.length}</p>
          <p className="text-[11px] text-gray-500 font-medium">Granular service controls</p>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 bg-white border border-gray-200/80 p-1.5 rounded-2xl shadow-2xs w-fit">
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === "staff" ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          👥 Active Staff Accounts ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === "roles" ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          🛡️ Role &amp; Permission Matrix
        </button>
      </div>

      {/* TAB 1: STAFF ACCOUNTS LISTING */}
      {activeTab === "staff" && (
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-4">Staff User</th>
                  <th className="px-6 py-4">Primary Role</th>
                  <th className="px-6 py-4">Sidebar Service Access</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/80 transition">
                    
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-2xs"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{staff.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono">{staff.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        staff.role === "Super Admin"
                          ? "bg-purple-100 text-purple-900 border-purple-300"
                          : staff.role === "Store Manager"
                          ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                          : staff.role === "Logistics Manager"
                          ? "bg-blue-100 text-blue-900 border-blue-300"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      }`}>
                        {staff.role}
                      </span>
                    </td>

                    {/* Service Access Badges */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {staff.permissions.length === SIDEBAR_MODULES.length ? (
                          <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2.5 py-0.5 rounded-md border border-emerald-200">
                            ⚡ FULL UNRESTRICTED ACCESS (All 13 Modules)
                          </span>
                        ) : (
                          staff.permissions.map((permId) => {
                            const mod = SIDEBAR_MODULES.find(m => m.id === permId);
                            return (
                              <span key={permId} className="bg-gray-100 text-gray-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-gray-200">
                                {mod?.icon} {mod?.name}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(staff.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black border transition cursor-pointer ${
                          staff.status === "Active"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {staff.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer border border-gray-200"
                        >
                          ✏️ Edit Services
                        </button>
                        {staff.role !== "Super Admin" && (
                          <button
                            onClick={() => handleDeleteStaff(staff.id, staff.name)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer border border-red-200"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE & PERMISSION MATRIX */}
      {activeTab === "roles" && (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-base font-black text-gray-900">🛡️ System Roles &amp; Default Sidebar Permissions</h2>
            <p className="text-xs text-gray-500 font-medium">Standard role configurations and module access matrix across the admin dashboard</p>
          </div>

          <div className="space-y-4 text-xs">
            {["Super Admin", "Store Manager", "Logistics Manager", "Support Executive", "Marketing Specialist"].map((roleName) => (
              <div key={roleName} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900 text-sm">{roleName}</h3>
                  <span className="text-emerald-700 font-bold text-[11px]">
                    {staffList.filter(s => s.role === roleName).length} active members
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SIDEBAR_MODULES.map((mod) => {
                    const isAllowed = roleName === "Super Admin" || 
                      (roleName === "Store Manager" && ["analytics", "orders", "products", "inventory", "customers", "delivery"].includes(mod.id)) ||
                      (roleName === "Logistics Manager" && ["orders", "inventory", "delivery", "queries"].includes(mod.id)) ||
                      (roleName === "Support Executive" && ["customers", "tickets", "queries"].includes(mod.id)) ||
                      (roleName === "Marketing Specialist" && ["analytics", "sales", "engagement", "homepage"].includes(mod.id));
                    return (
                      <span
                        key={mod.id}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${
                          isAllowed ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-gray-200/60 text-gray-400 border-gray-300 opacity-50"
                        }`}
                      >
                        {isAllowed ? "✓" : "✕"} {mod.icon} {mod.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📝 EDIT / ADD STAFF MODAL WITH SIDEBAR SERVICES CHECKLIST */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-xs">
            
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  {editingStaffId !== null ? "✏️ Edit Staff Account &amp; Module Access" : "➕ Create New Staff Account"}
                </h2>
                <p className="text-xs text-gray-500 font-medium">Assign staff credentials and select accessible sidebar services</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitStaffForm} className="space-y-6">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Email Address (Login ID)</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. vikram@skipd.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Password</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-bold block mb-1">Primary Role Preset</label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRolePresetChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Super Admin">Super Admin (Full Access)</option>
                    <option value="Store Manager">Store Manager (Catalog &amp; Orders)</option>
                    <option value="Logistics Manager">Logistics Manager (Shipments &amp; Stock)</option>
                    <option value="Support Executive">Support Executive (Tickets &amp; Returns)</option>
                    <option value="Marketing Specialist">Marketing Specialist (Sales &amp; CMS)</option>
                    <option value="Custom Role">Custom Access Role</option>
                  </select>
                </div>
              </div>

              {/* SIDEBAR SERVICES PERMISSIONS CHECKLIST */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm">📋 Sidebar Services &amp; Module Permissions</h3>
                    <p className="text-[11px] text-gray-500">Check the admin sidebar modules this staff user is authorized to manage</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllPermissions}
                      className="text-[10px] font-bold text-gray-500 hover:underline cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                  {SIDEBAR_MODULES.map((mod) => {
                    const isChecked = formPermissions.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border transition cursor-pointer select-none ${
                          isChecked 
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-extrabold shadow-2xs" 
                            : "bg-gray-50 border-gray-200 text-gray-600 font-medium hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(mod.id)}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                        />
                        <span className="text-base">{mod.icon}</span>
                        <div className="leading-tight">
                          <span className="block text-[11px] truncate">{mod.name}</span>
                          <span className="text-[9px] text-gray-400 font-normal">{mod.category}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                >
                  {editingStaffId !== null ? "Save Permission Changes" : "Create Staff Account"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
