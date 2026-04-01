/**
 * SmartLivestock — Layout
 * Professional dashboard layout: fixed sidebar + top header with user info, notifications & logout.
 */

import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, X, Bell, PawPrint, LogOut, Trash2, Check, ChevronRight } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { logout } from "../auth/auth";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function Layout({ role, children }: { role: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "" : "";
  const ROLE_LABEL: Record<string, string> = {
    farmer: "Farmer", vet: "Veterinarian", agrovet: "Agrovet Supplier",
    admin: "System Admin", subadmin: "County Officer",
  };

  const handleLogout = () => {
    logout();
    addToast("success", "Logged Out", "You have been logged out successfully");
    setTimeout(() => { window.location.href = "/login"; }, 800);
  };

  // Close notifications dropdown on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // Close on Escape
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [notifOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Desktop sidebar (fixed) ── */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 z-30">
        <Sidebar role={role} />
      </div>

      {/* ── Mobile sidebar drawer ── */}
      <>
        {/* Backdrop */}
        <div
          className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer */}
        <div className={`lg:hidden fixed top-0 left-0 h-screen w-64 z-50 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar role={role} onNavClick={() => setMobileOpen(false)} />
        </div>
      </>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-20 topbar-blur border-b border-gray-100 px-4 md:px-6 h-16 flex items-center justify-between flex-shrink-0" style={{ boxShadow: "0 1px 0 rgba(0,0,0,.06)" }}>
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm sora">SmartLivestock</span>
            </div>

            {/* Desktop breadcrumb / greeting */}
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-gray-900">
                {userName ? `Welcome back, ${userName.split(" ")[0]}` : "Welcome back"}
              </p>
              <p className="text-xs text-gray-400">{ROLE_LABEL[role] || role} dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell + dropdown */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition text-gray-500 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${
                  notifOpen ? "bg-green-50 text-green-700" : "hover:bg-gray-100"
                } ${unreadCount > 0 ? "notification-bell has-unread" : ""}`}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] w-[340px] max-h-[520px] bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden animate-scaleIn"
                  style={{ boxShadow: "0 16px 48px rgba(0,0,0,.13), 0 4px 12px rgba(0,0,0,.07)" }}
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 sora text-sm leading-none">Notifications</h3>
                        {notifications.length > 0 && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {notifications.length} total · {unreadCount} unread
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 text-[11px] font-semibold text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition"
                        >
                          <Check className="w-3 h-3" /> All read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto scroll-area">
                    {isLoading ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
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
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                          <Bell className="w-5 h-5 text-gray-300" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          When something important happens, it will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.slice(0, 8).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              if (!n.read) markAsRead(n.id);
                              if (n.action_url) navigate(n.action_url);
                              setNotifOpen(false);
                            }}
                            className={`group w-full text-left flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${
                              !n.read ? "bg-blue-50/30" : "bg-white"
                            }`}
                          >
                            {!n.read && (
                              <span className="mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
                                {n.title}
                              </p>
                              {n.message && (
                                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                  {n.message}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition ml-1 flex-shrink-0"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/60 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          clearAll();
                          setNotifOpen(false);
                        }}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear all
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/${role}/notifications`);
                          setNotifOpen(false);
                        }}
                        className="text-[11px] font-semibold text-green-600 hover:text-green-700 transition flex items-center gap-1"
                      >
                        View all <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User avatar + role (desktop) */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-xs font-bold text-white">
                  {(userName || role).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block leading-none">
                <p className="text-sm font-semibold text-gray-800 leading-none">{userName || ROLE_LABEL[role]}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ROLE_LABEL[role] || role}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 ml-1"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}