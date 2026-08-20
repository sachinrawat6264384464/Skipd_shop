"use client";

import { useState, useEffect } from "react";
import {
  fetchAdminRoles,
  fetchAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
  createAdminRole,
  RoleData,
  StaffUserData
} from "lib/api";

interface SidebarModule {
  id: string;
  name: string;
  category: string;
  icon: string;
}

const SIDEBAR_MODULES: SidebarModule[] = [
  { id: "dashboard", name: "Dashboard Overview", category: "Overview", icon: "🏠" },
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
  { id: "users", name: "Staff Users & Roles", category: "Administration", icon: "🛡️" },
  { id: "settings", name: "Store System Settings", category: "Administration", icon: "⚙️" },
  { id: "logs", name: "Security & Audit Logs", category: "Administration", icon: "🔐" }
];

export default function AdminUsersRolesPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff");
  const [staffList, setStaffList] = useState<StaffUserData[]>([]);
  const [rolesList, setRolesList] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Staff Modal Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("Store Manager");
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  // New Role Modal Form State
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [rolePerms, setRolePerms] = useState<string[]>([]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Data from PostgreSQL Database
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedRoles, fetchedStaff] = await Promise.all([
        fetchAdminRoles(),
        fetchAdminStaff()
      ]);
      if (Array.isArray(fetchedRoles)) setRolesList(fetchedRoles);
      if (Array.isArray(fetchedStaff)) setStaffList(fetchedStaff);
    } catch (e) {
      console.warn("Failed to load staff and roles from PostgreSQL DB:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle preset role change in create/edit modal
  const handleRolePresetChange = (roleName: string) => {
    setFormRole(roleName);
    const matchedRole = rolesList.find(r => r.name === roleName);
    if (matchedRole && matchedRole.permissions && matchedRole.permissions.length > 0) {
      setFormPermissions(matchedRole.permissions);
    } else if (roleName === "Super Admin") {
      setFormPermissions(SIDEBAR_MODULES.map(m => m.id));
    } else if (roleName === "Store Manager") {
      setFormPermissions(["dashboard", "analytics", "orders", "products", "inventory", "customers", "payments", "delivery"]);
    } else if (roleName === "Logistics Manager") {
      setFormPermissions(["dashboard", "orders", "inventory", "delivery", "queries"]);
    } else if (roleName === "Support Executive") {
      setFormPermissions(["dashboard", "customers", "tickets", "queries"]);
    } else if (roleName === "Marketing Specialist") {
      setFormPermissions(["dashboard", "analytics", "sales", "engagement", "homepage"]);
    } else {
      setFormPermissions(["dashboard", "orders", "products"]);
    }
  };

  const openCreateModal = () => {
    setEditingStaffId(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("• • • • • • • •");
    setFormRole(rolesList[1]?.name || "Store Manager");
    
    const defaultPerms = rolesList[1]?.permissions || ["dashboard", "orders", "products", "inventory", "customers", "delivery"];
    setFormPermissions(defaultPerms);
    setIsModalOpen(true);
  };

  const openEditModal = (staff: StaffUserData) => {
    setEditingStaffId(staff.id);
    setFormName(staff.name);
    setFormEmail(staff.email);
    setFormPassword("••••••••");
    setFormRole(staff.role);
    setFormPermissions(staff.permissions || []);
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

  const handleSubmitStaffForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast("Please provide staff name & email address", "error");
      return;
    }

    if (editingStaffId !== null) {
      // Update existing staff user in PostgreSQL DB
      const res = await updateAdminStaff(editingStaffId, {
        name: formName,
        email: formEmail,
        role: formRole,
        permissions: formPermissions
      });
      if (res) {
        setStaffList(staffList.map(s => s.id === editingStaffId ? res : s));
        showToast(`🎉 Staff user ${formName} updated in PostgreSQL database!`);
      } else {
        showToast("Failed to update staff user in database", "error");
      }
    } else {
      // Create new staff user in PostgreSQL DB
      const res = await createAdminStaff({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        status: "Active",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formName)}`,
        permissions: formPermissions
      });
      if (res) {
        setStaffList([res, ...staffList]);
        showToast(`🎉 Staff user ${formName} saved to PostgreSQL database!`);
      } else {
        showToast("Failed to create staff user in database", "error");
      }
    }

    setIsModalOpen(false);
  };

  const handleDeleteStaff = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to permanently delete staff account "${name}" from PostgreSQL database?`)) {
      const ok = await deleteAdminStaff(id);
      if (ok) {
        setStaffList(staffList.filter(s => s.id !== id));
        showToast(`Staff account "${name}" deleted from database`, "error");
      } else {
        showToast(`Cannot delete staff account "${name}"`, "error");
      }
    }
  };

  const handleToggleStatus = async (staff: StaffUserData) => {
    const nextStatus = staff.status === "Active" ? "Inactive" : "Active";
    const res = await updateAdminStaff(staff.id, { status: nextStatus });
    if (res) {
      setStaffList(staffList.map(s => s.id === staff.id ? { ...s, status: nextStatus as any } : s));
      showToast(`Staff user status changed to ${nextStatus}!`);
    }
  };

  // Submit New Custom Role Form
  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast("Please enter a role name", "error");
      return;
    }

    const created = await createAdminRole({
      name: roleName,
      description: roleDesc || `Custom access role for ${roleName}`,
      permissions: rolePerms.length > 0 ? rolePerms : ["dashboard", "orders"]
    });

    if (created) {
      setRolesList([...rolesList, created]);
      showToast(`🛡️ Custom role "${roleName}" saved to database!`);
      setIsRoleModalOpen(false);
      setRoleName("");
      setRoleDesc("");
      setRolePerms([]);
    } else {
      showToast("Role with this name already exists", "error");
    }
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
            Manage administrative accounts, role permissions &amp; complete sidebar service access control (PostgreSQL DB)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-3 rounded-xl transition cursor-pointer border border-gray-300 flex items-center gap-1.5"
          >
            <span>🛡️</span>
            <span>+ Create Custom Role</span>
          </button>
          <button
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-2 shrink-0"
          >
            <span>+</span>
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">TOTAL STAFF ACCOUNTS</span>
          <p className="text-2xl font-black text-gray-900">{staffList.length}</p>
          <p className="text-[11px] text-emerald-600 font-bold">100% Live DB Accounts</p>
        </div>
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SYSTEM ROLES</span>
          <p className="text-2xl font-black text-emerald-700">{rolesList.length}</p>
          <p className="text-[11px] text-gray-500 font-medium">Configured in DB</p>
        </div>
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SUPER ADMINS</span>
          <p className="text-2xl font-black text-purple-700">{staffList.filter(s => s.role === "Super Admin").length}</p>
          <p className="text-[11px] text-gray-500 font-medium">Master access keys</p>
        </div>
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ALL SIDEBAR SERVICES</span>
          <p className="text-2xl font-black text-amber-600">{SIDEBAR_MODULES.length}</p>
          <p className="text-[11px] text-gray-500 font-medium">Complete module matrix</p>
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
          🛡️ Role &amp; Permission Matrix ({rolesList.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 p-12 rounded-2xl text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-gray-500">Loading staff accounts &amp; roles from PostgreSQL DB...</p>
        </div>
      ) : (
        <>
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
                    {staffList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-medium">
                          No staff accounts found in database. Click "+ Add Staff Account" to create one.
                        </td>
                      </tr>
                    ) : (
                      staffList.map((staff) => (
                        <tr key={staff.id} className="hover:bg-gray-50/80 transition">
                          
                          {/* User Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`}
                                alt={staff.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-2xs bg-emerald-50"
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
                              {(staff.permissions || []).length === SIDEBAR_MODULES.length ? (
                                <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2.5 py-0.5 rounded-md border border-emerald-200">
                                  ⚡ FULL UNRESTRICTED ACCESS (All {SIDEBAR_MODULES.length} Sidebar Modules)
                                </span>
                              ) : (
                                (staff.permissions || []).map((permId) => {
                                  const mod = SIDEBAR_MODULES.find(m => m.id === permId);
                                  return (
                                    <span key={permId} className="bg-gray-100 text-gray-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-gray-200">
                                      {mod?.icon} {mod?.name || permId}
                                    </span>
                                  );
                                })
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(staff)}
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ROLE & PERMISSION MATRIX */}
          {activeTab === "roles" && (
            <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-base font-black text-gray-900">🛡️ System &amp; Custom Roles Matrix</h2>
                  <p className="text-xs text-gray-500 font-medium">PostgreSQL Database Role definitions &amp; assigned sidebar service modules</p>
                </div>
                <button
                  onClick={() => setIsRoleModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  + Add Custom Role
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {rolesList.map((role) => (
                  <div key={role.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <div>
                        <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                          <span>{role.name}</span>
                          {role.is_system && (
                            <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                              SYSTEM ROLE
                            </span>
                          )}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{role.description}</p>
                      </div>
                      <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        {staffList.filter(s => s.role === role.name).length} staff members assigned
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {SIDEBAR_MODULES.map((mod) => {
                        const isAllowed = (role.permissions || []).includes(mod.id);
                        return (
                          <span
                            key={mod.id}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border transition ${
                              isAllowed ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs" : "bg-gray-200/50 text-gray-400 border-gray-200 opacity-40"
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
        </>
      )}

      {/* 📝 EDIT / ADD STAFF MODAL WITH ALL 16 SIDEBAR SERVICES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-xs">
            
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  {editingStaffId !== null ? "✏️ Edit Staff Account & Module Access" : "➕ Create New Staff Account"}
                </h2>
                <p className="text-xs text-gray-500 font-medium">Assign staff credentials and select accessible sidebar services (Saved in PostgreSQL DB)</p>
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
                  <label className="text-gray-700 font-bold block mb-1">Primary Role Preset (Loaded from DB)</label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRolePresetChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {rolesList.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.permissions?.length || 0} Modules)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SIDEBAR SERVICES PERMISSIONS CHECKLIST (ALL 16 MODULES) */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                      <span>📋 Sidebar Services &amp; Module Permissions</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {formPermissions.length} of {SIDEBAR_MODULES.length} Selected
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-500">Check all admin sidebar modules this staff user is authorized to view &amp; manage</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Select All ({SIDEBAR_MODULES.length})
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
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
                        <div className="leading-tight min-w-0">
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

      {/* 🛡️ CREATE CUSTOM ROLE MODAL */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-xs">
            
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-lg font-black text-gray-900">🛡️ Create Custom Role Preset</h2>
                <p className="text-xs text-gray-500 font-medium">Define a new system role and default sidebar service permissions in PostgreSQL DB</p>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="space-y-5">
              <div>
                <label className="text-gray-700 font-bold block mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Catalog Specialist"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Briefly describe the responsibilities of this role..."
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-2">Default Accessible Sidebar Services</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SIDEBAR_MODULES.map((mod) => {
                    const isChecked = rolePerms.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none text-[11px] ${
                          isChecked ? "bg-emerald-50 border-emerald-300 font-bold text-emerald-900" : "bg-gray-50 border-gray-200 text-gray-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) setRolePerms(rolePerms.filter(id => id !== mod.id));
                            else setRolePerms([...rolePerms, mod.id]);
                          }}
                          className="accent-emerald-600 rounded"
                        />
                        <span>{mod.icon} {mod.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Save Role to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
