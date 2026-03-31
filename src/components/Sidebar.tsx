/**
 * SmartLivestock — Sidebar (Premium)
 * Green gradient · Role badge · Notification strip · Active glow
 * Mobile-ready · All original nav items preserved.
 */

import { Link, useLocation } from "react-router-dom";
import { logout } from "../auth/auth";
import { useToast }         from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import {
  LayoutDashboard, Users, UserPlus, Calendar, FileText, User,
  LogOut, PawPrint, Stethoscope, Package, Store, ClipboardList,
  Shield, BarChart3, Settings, ChevronRight, Bell, Wallet,
} from "lucide-react";

interface MenuItem { to: string; label: string; icon: React.ReactNode; show: boolean; badge?: string }

export default function Sidebar({ role, onNavClick }: { role: string; onNavClick?: () => void }) {
  const location       = useLocation();
  const { addToast }   = useToast();
  const { unreadCount } = useNotifications();

  const userName       = typeof window !== "undefined" ? localStorage.getItem("userName")     || "" : "";
  const assignedCounty = typeof window !== "undefined" ? localStorage.getItem("assignedCounty") || "" : "";

  const ROLE_LABEL: Record<string,string> = { farmer:"Farmer", vet:"Veterinarian", agrovet:"Agrovet Supplier", admin:"System Admin", subadmin:"County Officer" };
  const ROLE_COLOR: Record<string,string> = { farmer:"bg-green-400/20 text-green-200", vet:"bg-blue-400/20 text-blue-200", agrovet:"bg-amber-400/20 text-amber-200", admin:"bg-purple-400/20 text-purple-200", subadmin:"bg-teal-400/20 text-teal-200" };
  const ROLE_EMOJI: Record<string,string> = { farmer:"🌾", vet:"🩺", agrovet:"🏪", admin:"⚙️", subadmin:"🏛️" };

  const handleLogout = () => { logout(); addToast("success","Logged Out","You have been logged out successfully"); };

  const isActive = (path: string) =>
    location.pathname === path || (path !== `/${role}` && location.pathname.startsWith(path + "/"));

  const menuItems: MenuItem[] = [
    { to:`/${role}/profile`,         label:"Profile",            icon:<User className="w-5 h-5" />,            show: role !== "admin" },
    { to:"/farmer",                  label:"Dashboard",          icon:<LayoutDashboard className="w-5 h-5" />, show: role === "farmer" },
    { to:"/farmer/animals",          label:"My Animals",         icon:<PawPrint className="w-5 h-5" />,        show: role === "farmer" },
    { to:"/farmer/appointments/new", label:"Book Appointment",   icon:<Calendar className="w-5 h-5" />,        show: role === "farmer" },
    { to:"/farmer/marketplace",      label:"Marketplace",        icon:<Store className="w-5 h-5" />,           show: role === "farmer" },
    { to:"/farmer/orders",           label:"My Orders",          icon:<Package className="w-5 h-5" />,         show: role === "farmer" },
    { to:"/vet",                     label:"Dashboard",          icon:<LayoutDashboard className="w-5 h-5" />, show: role === "vet" },
    { to:"/vet/cases",               label:"Cases",              icon:<Stethoscope className="w-5 h-5" />,     show: role === "vet" },
    { to:"/vet/appointments",        label:"Appointments",       icon:<Calendar className="w-5 h-5" />,        show: role === "vet" },
    { to:"/agrovet",                 label:"Dashboard",          icon:<LayoutDashboard className="w-5 h-5" />, show: role === "agrovet" },
    { to:"/agrovet/products",        label:"Products",           icon:<Package className="w-5 h-5" />,         show: role === "agrovet" },
    { to:"/agrovet/orders",          label:"Orders & Receipts",  icon:<ClipboardList className="w-5 h-5" />,   show: role === "agrovet" },
    { to:"/agrovet/wallet",          label:"Wallet & Earnings",  icon:<Wallet className="w-5 h-5" />,          show: role === "agrovet" },
    { to:"/clinical-records",        label:"Clinical Records",   icon:<FileText className="w-5 h-5" />,        show: role === "farmer" || role === "vet" },
    { to:"/admin",                   label:"Dashboard",          icon:<LayoutDashboard className="w-5 h-5" />, show: role === "admin" },
    { to:"/admin/users",             label:"User Management",    icon:<Users className="w-5 h-5" />,           show: role === "admin" },
    { to:"/admin/providers",         label:"Provider Approvals", icon:<Shield className="w-5 h-5" />,          show: role === "admin" },
    { to:"/admin/analytics",         label:"Disease Analytics",  icon:<BarChart3 className="w-5 h-5" />,       show: role === "admin" },
    { to:"/admin/audit-logs",        label:"Audit Logs",         icon:<FileText className="w-5 h-5" />,        show: role === "admin" },
    { to:"/admin/settings",          label:"System Settings",    icon:<Settings className="w-5 h-5" />,        show: role === "admin" },
    { to:"/admin/staff",             label:"Staff Management",   icon:<UserPlus className="w-5 h-5" />,        show: role === "admin" },
    { to:"/subadmin",                label:"Dashboard",          icon:<LayoutDashboard className="w-5 h-5" />, show: role === "subadmin" },
    { to:"/subadmin/users",          label:"County Users",       icon:<Users className="w-5 h-5" />,           show: role === "subadmin" },
    { to:"/subadmin/analytics",      label:"County Analytics",   icon:<BarChart3 className="w-5 h-5" />,       show: role === "subadmin" },
    { to:"/subadmin/providers",      label:"Provider Approvals", icon:<Shield className="w-5 h-5" />,          show: role === "subadmin" },
  ];

  const visible = menuItems.filter(i => i.show);

  return (
    <aside className="flex flex-col w-64 h-screen sidebar-gradient text-white overflow-hidden flex-shrink-0">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white sora leading-none">SmartLivestock</h2>
            <p className="text-green-300/80 text-xs mt-0.5 truncate">Livestock Management</p>
          </div>
        </div>
      </div>

      {/* User chip */}
      {(userName || role) && (
        <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/15 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-black text-white">{(userName||role).charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate leading-none">{userName || ROLE_LABEL[role] || role}</p>
              {assignedCounty
                ? <p className="text-green-200/75 text-xs mt-0.5 truncate">{assignedCounty}</p>
                : <p className="text-green-300/60 text-xs mt-0.5">{ROLE_EMOJI[role]} {ROLE_LABEL[role] || role}</p>
              }
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${ROLE_COLOR[role] || "bg-white/15 text-white/80"}`}>
              {ROLE_LABEL[role] || role}
            </span>
          </div>
        </div>
      )}

      {/* Notification strip — appears when there are unread notifications */}
      {unreadCount > 0 && (
        <div className="px-4 pt-3 pb-1 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 cursor-default">
            <div className="relative flex-shrink-0">
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </div>
            <p className="text-xs text-white/80 font-semibold flex-1 leading-tight">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scroll-area">
        {visible.map(item => {
          const active = isActive(item.to);
          return (
            <Link key={item.to} to={item.to} onClick={onNavClick}
              className={`nav-link-sidebar ${active ? "active" : ""}`}>
              <span className={`flex-shrink-0 transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {active   && <ChevronRight className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />}
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-white/10 flex-shrink-0">
        <button onClick={() => { handleLogout(); onNavClick?.(); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:text-white hover:bg-red-600/80 transition-all duration-200 group">
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}