"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchAdminRoles, RoleData } from "lib/api";

interface RoleOption {
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
}

const DEFAULT_SYSTEM_ROLES: RoleOption[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    badge: "MASTER KEY",
    icon: "👑",
    color: "text-purple-400",
    bgColor: "bg-purple-950/80",
    borderColor: "border-purple-500/40",
    description: "Full unrestricted access across all 16 admin modules & system configurations",
    primaryRoute: "/admin",
    permissionsCount: 16
  },
  {
    id: "store_manager",
    name: "Store Manager",
    badge: "CATALOG & ORDERS",
    icon: "🏪",
    color: "text-emerald-400",
    bgColor: "bg-emerald-950/80",
    borderColor: "border-emerald-500/40",
    description: "Manage products, catalog, order processing, inventory & customer accounts",
    primaryRoute: "/admin/products",
    permissionsCount: 8
  },
  {
    id: "logistics_manager",
    name: "Logistics Lead",
    badge: "FULFILLMENT",
    icon: "📦",
    color: "text-blue-400",
    bgColor: "bg-blue-950/80",
    borderColor: "border-blue-500/40",
    description: "Handle shipments, order dispatch, courier tracking & customer return queries",
    primaryRoute: "/admin/orders",
    permissionsCount: 5
  },
  {
    id: "inventory_manager",
    name: "Stock Master",
    badge: "WAREHOUSE",
    icon: "🏭",
    color: "text-amber-400",
    bgColor: "bg-amber-950/80",
    borderColor: "border-amber-500/40",
    description: "Monitor stock quantities, reorder thresholds & low-inventory alerts",
    primaryRoute: "/admin/inventory",
    permissionsCount: 4
  },
  {
    id: "support_executive",
    name: "Support Executive",
    badge: "CUSTOMER HELP",
    icon: "🎧",
    color: "text-pink-400",
    bgColor: "bg-pink-950/80",
    borderColor: "border-pink-500/40",
    description: "Manage customer tickets, live product queries & satisfaction reviews",
    primaryRoute: "/admin/tickets",
    permissionsCount: 4
  },
  {
    id: "marketing_specialist",
    name: "Marketing Lead",
    badge: "GROWTH & CMS",
    icon: "🎯",
    color: "text-indigo-400",
    bgColor: "bg-indigo-950/80",
    borderColor: "border-indigo-500/40",
    description: "Oversee sales promotions, coupons, engagement & homepage banner CMS",
    primaryRoute: "/admin/sales",
    permissionsCount: 5
  },
  {
    id: "finance_lead",
    name: "Finance Lead",
    badge: "PAYMENTS",
    icon: "💳",
    color: "text-teal-400",
    bgColor: "bg-teal-950/80",
    borderColor: "border-teal-500/40",
    description: "Review payment transactions, revenue payouts, refund logs & financial metrics",
    primaryRoute: "/admin/payments",
    permissionsCount: 4
  },
  {
    id: "staff_admin",
    name: "Users & Security Admin",
    badge: "SECURITY & ROLES",
    icon: "🛡️",
    color: "text-red-400",
    bgColor: "bg-red-950/80",
    borderColor: "border-red-500/40",
    description: "Manage staff accounts, assign granular role permissions & audit security logs",
    primaryRoute: "/admin/users",
    permissionsCount: 4
  }
];

export default function FloatingAdminRoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<string>("Super Admin");
  const [dbRoles, setDbRoles] = useState<RoleData[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Draggable widget positioning state
  const [position, setPosition] = useState({ x: 24, y: 24 }); // distance from bottom right
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 24,
    posY: 24
  });

  // Load current active role from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("skipd_admin_role");
      if (storedRole) {
        setActiveRole(storedRole);
      }
    }
  }, []);

  // Fetch db custom roles if available
  useEffect(() => {
    fetchAdminRoles().then((roles) => {
      if (Array.isArray(roles) && roles.length > 0) {
        setDbRoles(roles);
      }
    }).catch(() => {});
  }, []);

  // Draggable logic handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only trigger drag if left button clicked
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

      // Keep within bounds
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
    setActiveRole(role.name);
    if (typeof window !== "undefined") {
      localStorage.setItem("skipd_admin_role", role.name);
      
      // Update stored user role title
      const existingUser = localStorage.getItem("skipd_admin_user");
      if (existingUser) {
        try {
          const parsed = JSON.parse(existingUser);
          parsed.role = role.name;
          localStorage.setItem("skipd_admin_user", JSON.stringify(parsed));
        } catch (e) {}
      }
    }

    setToastMessage(`⚡ Switched active role to "${role.name}"! Opening panel...`);
    setIsOpen(false);

    setTimeout(() => {
      setToastMessage(null);
      router.push(role.primaryRoute);
    }, 600);
  };

  const matchedRole = DEFAULT_SYSTEM_ROLES.find(r => r.name.toLowerCase() === activeRole.toLowerCase());
  const currentRoleObj: RoleOption = matchedRole || DEFAULT_SYSTEM_ROLES[0] || {
    id: "super_admin",
    name: "Super Admin",
    badge: "MASTER KEY",
    icon: "👑",
    color: "text-purple-400",
    bgColor: "bg-purple-950/80",
    borderColor: "border-purple-500/40",
    description: "Full unrestricted access across all 16 admin modules",
    primaryRoute: "/admin",
    permissionsCount: 16
  };

  // Hide on login page
  if (pathname === "/admin/login") return null;

  return (
    <>
      {/* Toast Notification when role is switched */}
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
          onClick={(e) => {
            // Prevent click if user was dragging
            if (!isDragging) {
              setIsOpen(!isOpen);
            }
          }}
          className={`flex items-center gap-3 bg-[#0F172A]/90 hover:bg-[#0F172A] border ${currentRoleObj.borderColor} text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing transition-all hover:scale-105 ${
            isDragging ? "opacity-75 scale-95" : ""
          }`}
          title="Drag anywhere or click to switch Admin Roles"
        >
          {/* Pulsing indicator & icon */}
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
              <span>{activeRole}</span>
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
                    No Password Re-login Needed
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Click any primary admin role below to instantly switch session permissions &amp; jump into that module's workspace panel.
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
                  <h3 className="text-base font-black text-white">{activeRole}</h3>
                  <p className="text-xs text-slate-400">{currentRoleObj.description}</p>
                </div>
              </div>
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg shrink-0">
                ACTIVE NOW ✓
              </span>
            </div>

            {/* Available Roles Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">SELECT PRESET ADMIN ROLE TO SWITCH:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEFAULT_SYSTEM_ROLES.map((role) => {
                  const isCurrent = activeRole.toLowerCase() === role.name.toLowerCase();
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
                        <span>{role.permissionsCount} Authorized Modules</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom DB Roles section if present */}
            {dbRoles.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">DATABASE CUSTOM ROLES ({dbRoles.length}):</h3>
                <div className="flex flex-wrap gap-2">
                  {dbRoles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSwitch({
                        id: r.slug,
                        name: r.name,
                        badge: "CUSTOM ROLE",
                        icon: "🛡️",
                        color: "text-purple-400",
                        bgColor: "bg-purple-950/80",
                        borderColor: "border-purple-500/40",
                        description: r.description,
                        primaryRoute: "/admin",
                        permissionsCount: r.permissions?.length || 0
                      })}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer transition"
                    >
                      <span>🛡️ {r.name}</span>
                      <span className="text-[10px] text-emerald-400">({r.permissions?.length || 0} perms)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

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
