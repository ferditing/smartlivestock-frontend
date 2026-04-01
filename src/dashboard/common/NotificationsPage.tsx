import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useNotifications, type Notification } from "../../context/NotificationContext";
import {
  Bell,
  Trash2,
  Check,
  Clock as ClockIcon,
  ShoppingBag,
  FileText,
  CreditCard,
  Package,
} from "lucide-react";

interface NotificationsPageProps {
  role: string;
}

interface TMeta {
  Icon: React.ComponentType<{ className?: string }>;
  bg: string;
  color: string;
  label: string;
}

const TYPE_MAP: Record<string, TMeta> = {
  "appointment:booked":      { Icon: ClockIcon,   bg: "bg-blue-100",    color: "text-blue-600",    label: "Appointment" },
  "appointment:reminder":    { Icon: ClockIcon,   bg: "bg-amber-100",   color: "text-amber-600",   label: "Reminder"    },
  "appointment:cancelled":   { Icon: ClockIcon,   bg: "bg-red-100",     color: "text-red-600",     label: "Cancelled"   },
  "appointment:new_request": { Icon: ClockIcon,   bg: "bg-blue-100",    color: "text-blue-600",    label: "New Request" },
  "order:status":            { Icon: ShoppingBag, bg: "bg-green-100",   color: "text-green-600",   label: "Order"       },
  "clinical:report":         { Icon: FileText,    bg: "bg-purple-100",  color: "text-purple-600",  label: "Clinical"    },
  "payment:received":        { Icon: CreditCard,  bg: "bg-emerald-100", color: "text-emerald-600", label: "Payment"     },
  "product:stock_low":       { Icon: Package,     bg: "bg-red-100",     color: "text-red-600",     label: "Low Stock"   },
  "system:welcome":          { Icon: Bell,        bg: "bg-green-100",   color: "text-green-600",   label: "Welcome"     },
  default:                   { Icon: Bell,        bg: "bg-gray-100",    color: "text-gray-500",    label: "Notification"},
};

const ROLE_LABEL: Record<string, string> = {
  farmer: "Farmer",
  vet: "Veterinarian",
  agrovet: "Agrovet Supplier",
  admin: "System Admin",
  subadmin: "County Officer",
};

const getMeta = (type: string): TMeta => TYPE_MAP[type] || TYPE_MAP.default;

function relTime(iso: string) {
  const d = iso ? new Date(iso) : new Date();
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const h = Math.floor(diffMins / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export default function NotificationsPage({ role }: NotificationsPageProps) {
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

  const [tab, setTab] = useState<"all" | "unread">("all");

  const displayed = useMemo(
    () => (tab === "unread" ? notifications.filter((n) => !n.read) : notifications),
    [notifications, tab]
  );

  const pageTitle = "Notifications";
  const pageSub =
    unreadCount > 0
      ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
      : "You are all caught up.";

  return (
    <Layout role={role}>
      <div className="space-y-6 animate-fadeInUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">{pageTitle}</h1>
            <p className="page-sub">{pageSub}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="btn-ghost-green btn-sm flex items-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="btn-outline-red btn-sm flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Main card */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 sora text-sm leading-none">
                    {ROLE_LABEL[role] || "User"} notifications
                  </h2>
                  {notifications.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {notifications.length} total · {unreadCount} unread
                    </p>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 p-0.5 rounded-xl gap-0.5">
                {(["all", "unread"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`flex-1 px-3 py-1.5 rounded-[10px] text-xs font-semibold capitalize transition-all ${
                      tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t}
                    {t === "unread" && unreadCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div className="empty-state py-16">
                <div className="empty-state-icon">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="empty-state-title">
                  {tab === "unread" ? "All caught up!" : "No notifications yet"}
                </p>
                <p className="empty-state-sub">
                  {tab === "unread"
                    ? "You have no unread notifications."
                    : "When something important happens, it will appear here in real time."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {displayed.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onMarkRead={() => markAsRead(n.id)}
                    onDelete={() => deleteNotification(n.id)}
                    onNavigate={() => {
                      if (!n.read) markAsRead(n.id);
                      if (n.action_url) navigate(n.action_url);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}) {
  const meta = getMeta(notification.type);
  const { Icon } = meta;

  return (
    <div
      className={`group relative flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors ${
        notification.read ? "bg-white hover:bg-gray-50" : "bg-blue-50/40 hover:bg-blue-50"
      }`}
      onClick={onNavigate}
    >
      {!notification.read && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
      )}
      <div
        className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-4 h-4 ${meta.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-black uppercase tracking-widest ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-[10px] text-gray-400 ml-auto">
            {relTime(notification.created_at)}
          </span>
        </div>
        <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-2">
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">
        {!notification.read && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead();
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

