/**
 * SmartLivestock — Navbar (Premium)
 * Glassmorphism top bar · Role-tinted bell · Full notification panel
 * with unread dots, relative timestamps, progress drain, All/Unread tabs,
 * mark-all, delete, navigate on click.
 * All original functionality preserved.
 */

import {
  LogOut, PawPrint, Bell, X, Trash2, Check, CheckCheck,
  Clock, ShoppingBag, FileText, CreditCard, Package, ChevronRight,
} from "lucide-react";
import { useToast }         from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import type { Notification } from "../context/NotificationContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ── Notification type → visual config ──────────────────────── */
interface TMeta { Icon: React.ComponentType<{ className?: string }>; bg: string; color: string; bar: string; label: string }
const TYPE_MAP: Record<string, TMeta> = {
  "appointment:booked":      { Icon: Clock,       bg:"bg-blue-100",    color:"text-blue-600",    bar:"bg-blue-500",    label:"Appointment"   },
  "appointment:reminder":    { Icon: Clock,       bg:"bg-amber-100",   color:"text-amber-600",   bar:"bg-amber-500",   label:"Reminder"      },
  "appointment:cancelled":   { Icon: X,           bg:"bg-red-100",     color:"text-red-600",     bar:"bg-red-500",     label:"Cancelled"     },
  "appointment:new_request": { Icon: Clock,       bg:"bg-blue-100",    color:"text-blue-600",    bar:"bg-blue-500",    label:"New Request"   },
  "order:status":            { Icon: ShoppingBag, bg:"bg-green-100",   color:"text-green-600",   bar:"bg-green-500",   label:"Order"         },
  "clinical:report":         { Icon: FileText,    bg:"bg-purple-100",  color:"text-purple-600",  bar:"bg-purple-500",  label:"Clinical"      },
  "payment:received":        { Icon: CreditCard,  bg:"bg-emerald-100", color:"text-emerald-600", bar:"bg-emerald-500", label:"Payment"       },
  "product:stock_low":       { Icon: Package,     bg:"bg-red-100",     color:"text-red-600",     bar:"bg-red-500",     label:"Low Stock"     },
  default:                   { Icon: Bell,        bg:"bg-gray-100",    color:"text-gray-500",    bar:"bg-gray-400",    label:"Notification"  },
};
const getMeta = (type: string): TMeta => TYPE_MAP[type] || TYPE_MAP.default;

function relTime(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ROLE_LABEL:    Record<string,string> = { farmer:"Farmer", vet:"Veterinarian", agrovet:"Agrovet Supplier", admin:"System Admin", subadmin:"County Officer" };
const ROLE_GRADIENT: Record<string,string> = { farmer:"from-green-500 to-green-700", vet:"from-blue-500 to-blue-700", agrovet:"from-amber-500 to-amber-700", admin:"from-purple-500 to-purple-700", subadmin:"from-teal-500 to-teal-700" };

/* ═══════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════ */
export default function Navbar() {
  const navigate     = useNavigate();
  const { addToast } = useToast();
  const [open, setOpen]       = useState(false);
  const [tab, setTab]         = useState<"all"|"unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll, isLoading } = useNotifications();

  const userName = localStorage.getItem("userName") || "";
  const role     = localStorage.getItem("role")     || "";
  const initials = userName.split(" ").map((w:string) => w[0]).slice(0,2).join("").toUpperCase() || "?";
  const grad     = ROLE_GRADIENT[role] || "from-green-500 to-green-700";

  /* Close panel on outside click */
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open]);

  const logout = () => {
    localStorage.clear();
    addToast("success", "Logged out", "See you next time!");
    setTimeout(() => { window.location.href = "/login"; }, 900);
  };

  const displayed = tab === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <header
      className="sticky top-0 z-40 topbar-blur border-b border-gray-100 px-4 md:px-8 h-16 flex items-center justify-between flex-shrink-0"
      style={{ boxShadow:"0 1px 0 rgba(0,0,0,.05)" }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 bg-gradient-to-br ${grad} rounded-xl flex items-center justify-center shadow-md`}>
          <PawPrint className="w-5 h-5 text-white" />
        </div>
        <div className="hidden sm:block leading-none">
          <h1 className="font-bold text-gray-900 sora text-base leading-none">SmartLivestock</h1>
          {role && <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABEL[role] || role}</p>}
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-2">

        {/* Notification bell + panel */}
        <div ref={panelRef} className="relative">
          <button
            onClick={() => setOpen(v => !v)}
            aria-label="Notifications"
            className={`relative p-2.5 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${
              open
                ? "bg-green-50 text-green-700"
                : `hover:bg-gray-100 text-gray-600 ${unreadCount > 0 ? "notification-bell has-unread" : ""}`
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-[380px] max-h-[540px] bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden animate-scaleIn"
              style={{ boxShadow:"0 16px 48px rgba(0,0,0,.13), 0 4px 12px rgba(0,0,0,.07)" }}
            >
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 bg-gradient-to-br ${grad} rounded-xl flex items-center justify-center`}>
                      <Bell className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 sora text-sm leading-none">Notifications</h3>
                      {unreadCount > 0 && <p className="text-[11px] text-gray-400 mt-0.5">{unreadCount} unread</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead}
                        className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition">
                        <CheckCheck className="w-3.5 h-3.5" /> All read
                      </button>
                    )}
                    <button onClick={() => setOpen(false)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* All / Unread pill tabs */}
                <div className="flex bg-gray-100 p-0.5 rounded-xl gap-0.5">
                  {(["all","unread"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`flex-1 text-xs font-semibold py-1.5 rounded-[10px] transition-all duration-200 capitalize ${
                        tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}>
                      {t}
                      {t === "unread" && unreadCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto scroll-area">
                {isLoading ? (
                  <div className="p-5 space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="w-9 h-9 bg-gray-100 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-100 rounded w-3/4" />
                          <div className="h-2.5 bg-gray-100 rounded w-full" />
                          <div className="h-2 bg-gray-100 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">{tab === "unread" ? "All caught up!" : "No notifications yet"}</p>
                    <p className="text-xs text-gray-400 mt-1">{tab === "unread" ? "No unread notifications." : "We'll notify you when something happens."}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {displayed.map(n => (
                      <NotifRow key={n.id} notification={n}
                        onMarkRead={() => markAsRead(n.id)}
                        onDelete={() => deleteNotification(n.id)}
                        onNavigate={() => { markAsRead(n.id); setOpen(false); if (n.action_url) navigate(n.action_url); }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/60">
                  <button onClick={() => { clearAll(); setOpen(false); }}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 transition flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Clear all
                  </button>
                  <button onClick={() => { navigate(`/${role}/notifications`); setOpen(false); }}
                    className="text-xs font-semibold text-green-600 hover:text-green-700 transition flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User chip */}
        {userName && (
          <div onClick={() => navigate(`/${role}/profile`)}
            className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-gray-100 bg-white cursor-pointer hover:bg-gray-50 transition"
            style={{ boxShadow:"0 1px 3px rgba(0,0,0,.05)" }}>
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm flex-shrink-0`}>
              <span className="text-[11px] font-bold text-white">{initials}</span>
            </div>
            <div className="leading-none">
              <p className="text-xs font-bold text-gray-800 leading-none">{userName.split(" ")[0]}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{ROLE_LABEL[role] || role}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button type="button" onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

/* ── Single notification row ──────────────────────────────────── */
function NotifRow({ notification: n, onMarkRead, onDelete, onNavigate }:
  { notification: Notification; onMarkRead:()=>void; onDelete:()=>void; onNavigate:()=>void }) {
  const m = getMeta(n.type);
  return (
    <div className={`group relative flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/25" : ""}`}>
      {!n.read && <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
      <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center flex-shrink-0 cursor-pointer`} onClick={onNavigate}>
        <m.Icon className={`w-4 h-4 ${m.color}`} />
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onNavigate}>
        <div className="flex items-center mb-0.5">
          <span className={`text-[9px] font-black uppercase tracking-widest ${m.color}`}>{m.label}</span>
          <span className="text-[10px] text-gray-400 ml-auto">{relTime(n.created_at)}</span>
        </div>
        <p className="text-xs font-bold text-gray-900 leading-snug">{n.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
        {!n.read && (
          <button onClick={e => { e.stopPropagation(); onMarkRead(); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition" title="Mark read">
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}