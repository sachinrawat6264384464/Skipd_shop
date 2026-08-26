"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchAdminRoles, RoleData } from "lib/api";

export interface RoleOption {
  id: string;
  name: string;
  badge: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  primaryRoute: string;
  permissionsCount: number;
  permissions: string[];
}

const ALL_MODULES = [
  "dashboard", "analytics", "orders", "products", "inventory", 
  "customers", "payments", "delivery", "sales", "engagement", 
  "homepage", "tickets", "queries", "users", "settings", "logs"
];

const SUPER_ADMIN_ROLE: RoleOption = {
  id: "super_admin",
  name: "Super Admin",
  badge: "MASTER KEY",
  icon: "👑",
  color: "text-purple-400",
  bgColor: "bg-purple-950/80",
  borderColor: "border-purple-500/40",
  description: "Full unrestricted access across all 16 admin modules & system configurations",
  primaryRoute: "/admin",
  permissionsCount: 16,
  permissions: ALL_MODULES
};

export default function FloatingAdminRoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoleName, setActiveRoleName] = useState<string>("Super Admin");
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([SUPER_ADMIN_ROLE]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Draggable widget positioning state
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 24,
    posY: 24
  });

  const getPrimaryRouteForPermissions = (perms: string[]): string => {
    if (!perms || perms.length === 0 || perms.includes("dashboard")) return "/admin";
    if (perms.includes("products")) return "/admin/products";
    if (perms.includes("orders")) return "/admin/orders";
    if (perms.includes("inventory")) return "/admin/inventory";
    if (perms.includes("customers")) return "/admin/customers";
    if (perms.includes("payments")) return "/admin/payments";
    if (perms.includes("tickets")) return "/admin/tickets";
    if (perms.includes("sales")) return "/admin/sales";
    if (perms.includes("users")) return "/admin/users";
    return `/admin/${perms[0]}`;
  };

  // Load current active role from localStorage & listen for changes
  const loadActiveRole = () => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("skipd_admin_role");
      if (storedRole) {
        setActiveRoleName(storedRole);
      } else {
        setActiveRoleName("Super Admin");
      }
    }
  };

  // Load dynamic roles created in DB or saved in LocalStorage
  const loadRoles = async () => {
    let dynamicRoles: RoleOption[] = [SUPER_ADMIN_ROLE];

    try {
      const dbRoles = await fetchAdminRoles();
      if (Array.isArray(dbRoles) && dbRoles.length > 0) {
        dbRoles.forEach((r) => {
          if (r.name.toLowerCase() === "super admin") return; // Super Admin handled separately
          dynamicRoles.push({
            id: r.slug || r.name.toLowerCase().replace(/\s+/g, "_"),
            name: r.name,
            badge: r.is_system ? "SYSTEM ROLE" : "ADMIN CREATED",
            icon: r.name.toLowerCase().includes("store") ? "🏪" : r.name.toLowerCase().includes("logistics") ? "📦" : r.name.toLowerCase().includes("stock") ? "🏭" : r.name.toLowerCase().includes("support") ? "🎧" : r.name.toLowerCase().includes("marketing") ? "🎯" : "🛡️",
            color: "text-emerald-400",
            bgColor: "bg-emerald-950/80",
            borderColor: "border-emerald-500/40",
            description: r.description || `Configured role with ${r.permissions?.length || 0} active sidebar modules`,
            primaryRoute: getPrimaryRouteForPermissions(r.permissions || []),
            permissionsCount: r.permissions?.length || 0,
            permissions: r.permissions || []
          });
        });
      }
    } catch (e) {}

    // Check custom roles created locally
    if (typeof window !== "undefined") {
      const localCustom = localStorage.getItem("skipd_custom_roles");
      if (localCustom) {
        try {
          const parsed: RoleData[] = JSON.parse(localCustom);
          parsed.forEach((r) => {
            if (!dynamicRoles.some(existing => existing.name.toLowerCase() === r.name.toLowerCase())) {
              dynamicRoles.push({
                id: r.slug || r.name.toLowerCase().replace(/\s+/g, "_"),
                name: r.name,
                badge: "CUSTOM ROLE",
                icon: "🛡️",
                color: "text-purple-400",
                bgColor: "bg-purple-950/80",
                borderColor: "border-purple-500/40",
                description: r.description || `Custom role with ${r.permissions?.length || 0} modules`,
                primaryRoute: getPrimaryRouteForPermissions(r.permissions || []),
                permissionsCount: r.permissions?.length || 0,
                permissions: r.permissions || []
              });
            }
          });
        } catch (e) {}
      }
    }

    setAvailableRoles(dynamicRoles);
  };

  useEffect(() => {
    loadActiveRole();
    loadRoles();

    const handleRoleUpdate = () => {
      loadActiveRole();
      loadRoles();
    };

    window.addEventListener("skipd_roles_updated", handleRoleUpdate);
    window.addEventListener("skipd_role_changed", loadActiveRole);

    return () => {
      window.removeEventListener("skipd_roles_updated", handleRoleUpdate);
      window.removeEventListener("skipd_role_changed", loadActiveRole);
    };
  }, []);

  // Draggable logic handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches || !e.touches[0]) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = dragStartRef.current.startX - e.clientX;
      const deltaY = dragStartRef.current.startY - e.clientY;

      const newX = Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.posX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches || !e.touches[0]) return;
      const touch = e.touches[0];
      const deltaX = dragStartRef.current.startX - touch.clientX;
      const deltaY = dragStartRef.current.startY - touch.clientY;

      const newX = Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.posX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.posY + deltaY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  const handleRoleSwitch = (role: RoleOption) => {
    setActiveRoleName(role.name);
    if (typeof window !== "undefined") {
      localStorage.setItem("skipd_admin_role", role.name);
      localStorage.setItem("skipd_admin_permissions", JSON.stringify(role.permissions));
      
      const existingUser = localStorage.getItem("skipd_admin_user");
      if (existingUser) {
        try {
          const parsed = JSON.parse(existingUser);
          parsed.role = role.name;
          localStorage.setItem("skipd_admin_user", JSON.stringify(parsed));
        } catch (e) {}
      }

      // Dispatch global role change event for real-time sidebar update
      window.dispatchEvent(new Event("skipd_role_changed"));
    }

    setToastMessage(`⚡ Active role switched to "${role.name}" (${role.permissionsCount} modules authorized)!`);
    setIsOpen(false);

    setTimeout(() => {
      setToastMessage(null);
      router.push(role.primaryRoute);
    }, 600);
  };

  const currentRoleObj: RoleOption = availableRoles.find(r => r.name.toLowerCase() === activeRoleName.toLowerCase()) || SUPER_ADMIN_ROLE;

  if (pathname === "/admin/login") return null;

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-emerald-400 border border-emerald-500/50 px-6 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-3 animate-bounce backdrop-blur-md">
          <span className="text-lg">🛡️</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Movable Draggable Badge Button */}
      <div
        ref={dragRef}
        style={{
          position: "fixed",
          bottom: `${position.y}px`,
          right: `${position.x}px`,
          zIndex: 49
        }}
        className="group select-none touch-none"
      >
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={() => {
            if (!isDragging) {
              setIsOpen(!isOpen);
            }
          }}
          className={`flex items-center gap-3 bg-[#0F172A]/90 hover:bg-[#0F172A] border ${currentRoleObj.borderColor} text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing transition-all hover:scale-105 ${
            isDragging ? "opacity-75 scale-95" : ""
          }`}
          title="Drag anywhere or click to switch Admin Roles"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shadow-inner">
              {currentRoleObj.icon}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0F172A] absolute -top-1 -right-1 animate-pulse"></span>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">ROLE SWITCHER</span>
              <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">DRAGGABLE ✋</span>
            </div>
            <p className="text-xs font-extrabold text-white truncate max-w-[130px] flex items-center gap-1">
              <span>{activeRoleName}</span>
              <span className="text-slate-400 text-[10px]">▾</span>
            </p>
          </div>
        </div>
      </div>

      {/* High-Tech Draggable Role Switching Hub Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0B1329] border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl text-white">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  <h2 className="text-xl font-black tracking-tight text-white">Admin Role Quick Switcher &amp; Panel Access</h2>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Active Roles ({availableRoles.length})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Click any active admin role below to instantly switch session permissions &amp; filter the sidebar navigation panel.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center cursor-pointer transition border border-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Current Active Role Highlight */}
            <div className="bg-slate-900/90 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentRoleObj.icon}</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">CURRENT ACTIVE ROLE SESSION</span>
                  <h3 className="text-base font-black text-white">{activeRoleName}</h3>
                  <p className="text-xs text-slate-400">{currentRoleObj.description}</p>
                </div>
              </div>
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg shrink-0">
                ACTIVE NOW ✓
              </span>
            </div>

            {/* Available Active Roles Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">AVAILABLE ADMIN ROLES IN SYSTEM:</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableRoles.map((role) => {
                  const isCurrent = activeRoleName.toLowerCase() === role.name.toLowerCase();
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSwitch(role)}
                      className={`text-left p-4 rounded-2xl border transition duration-150 cursor-pointer flex flex-col justify-between space-y-2 group ${
                        isCurrent
                          ? "bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500"
                          : "bg-slate-900/60 hover:bg-slate-800/90 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{role.icon}</span>
                          <div>
                            <p className="font-extrabold text-sm text-white flex items-center gap-1.5">
                              <span>{role.name}</span>
                              {isCurrent && <span className="text-emerald-400 text-xs">● Active</span>}
                            </p>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${role.bgColor} ${role.color} ${role.borderColor}`}>
                              {role.badge}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 group-hover:text-emerald-400 transition font-bold">
                          Open Panel &rarr;
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug">
                        {role.description}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500 border-t border-slate-800/60">
                        <span>Route: {role.primaryRoute}</span>
                        <span className="text-emerald-400 font-bold">{role.permissionsCount} Services Allowed</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Informational banner if only Super Admin exists */}
              {availableRoles.length <= 1 && (
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center space-y-2">
                  <p className="text-xs text-amber-400 font-bold">
                    💡 No custom admin roles created yet!
                  </p>
                  <p className="text-[11px] text-slate-400">
                    To activate additional roles, go to <span className="text-white font-bold">Users &amp; Roles</span> panel and click <span className="text-emerald-400 font-bold">"+ Create Custom Role"</span>. Created roles will automatically appear here!
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400 text-[11px]">
                Tip: You can drag the floating role button anywhere on your screen.
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2 rounded-xl transition cursor-pointer border border-slate-700"
              >
                Close Switcher
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

