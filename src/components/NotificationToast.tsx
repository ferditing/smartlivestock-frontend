/**
 * SmartLivestock — NotificationToast (Premium)
 * Animated slide-in toasts · Progress drain bar · Role-aware icons
 * Stacked layout · Action CTA · Auto-dismiss with visual countdown
 * All original functionality preserved.
 */

import React, { useEffect, useState, useCallback } from "react";
import { Bell, X, Clock, FileText, CreditCard, Package, ArrowRight, ShoppingBag } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import type { Notification } from "../context/NotificationContext";

/* ── Type → visual config ──────────────────────────────────────── */
interface ToastMeta {
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  bg: string; border: string; iconBg: string; iconColor: string; bar: string; label: string;
}
const TYPE_MAP: Record<string, ToastMeta> = {
  "appointment:booked":      { Icon: Clock,       bg:"bg-blue-50",    border:"border-l-blue-500",    iconBg:"bg-blue-100",    iconColor:"text-blue-600",    bar:"bg-blue-500",    label:"Appointment"  },
  "appointment:reminder":    { Icon: Clock,       bg:"bg-amber-50",   border:"border-l-amber-400",   iconBg:"bg-amber-100",   iconColor:"text-amber-600",   bar:"bg-amber-400",   label:"Reminder"     },
  "appointment:cancelled":   { Icon: X,           bg:"bg-red-50",     border:"border-l-red-500",     iconBg:"bg-red-100",     iconColor:"text-red-600",     bar:"bg-red-500",     label:"Cancelled"    },
  "appointment:new_request": { Icon: Clock,       bg:"bg-blue-50",    border:"border-l-blue-500",    iconBg:"bg-blue-100",    iconColor:"text-blue-600",    bar:"bg-blue-500",    label:"New Request"  },
  "order:status":            { Icon: ShoppingBag, bg:"bg-green-50",   border:"border-l-green-500",   iconBg:"bg-green-100",   iconColor:"text-green-600",   bar:"bg-green-500",   label:"Order"        },
  "clinical:report":         { Icon: FileText,    bg:"bg-purple-50",  border:"border-l-purple-500",  iconBg:"bg-purple-100",  iconColor:"text-purple-600",  bar:"bg-purple-500",  label:"Clinical"     },
  "payment:received":        { Icon: CreditCard,  bg:"bg-emerald-50", border:"border-l-emerald-500", iconBg:"bg-emerald-100", iconColor:"text-emerald-600", bar:"bg-emerald-500", label:"Payment"      },
  "product:stock_low":       { Icon: Package,     bg:"bg-red-50",     border:"border-l-red-500",     iconBg:"bg-red-100",     iconColor:"text-red-600",     bar:"bg-red-500",     label:"Low Stock"    },
  default:                   { Icon: Bell,        bg:"bg-gray-50",    border:"border-l-gray-400",    iconBg:"bg-gray-100",    iconColor:"text-gray-500",    bar:"bg-gray-400",    label:"Notification" },
};
const getMeta = (type: string): ToastMeta => TYPE_MAP[type] ?? TYPE_MAP.default;

interface NotificationToastProps { maxNotifications?: number; autoCloseDuration?: number; }

/* ══════════════════════════════════════════════════════════════ */
export function NotificationToast({ maxNotifications = 3, autoCloseDuration = 5500 }: NotificationToastProps) {
  const { notifications, markAsRead } = useNotifications();
  const [visible, setVisible] = useState<Notification[]>([]);

  useEffect(() => {
    setVisible(notifications.filter(n => !n.read).slice(0, maxNotifications));
  }, [notifications, maxNotifications]);

  const dismiss  = useCallback((n: Notification) => { setVisible(p => p.filter(x => x.id !== n.id)); markAsRead(n.id); }, [markAsRead]);
  const navigate = useCallback((n: Notification) => { markAsRead(n.id); if (n.action_url) window.location.href = n.action_url; }, [markAsRead]);

  if (!visible.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none" style={{ maxWidth: 380 }} aria-live="polite">
      {visible.map((n, i) => (
        <ToastItem key={n.id} notification={n} autoCloseDuration={autoCloseDuration} delay={i * 100}
          onDismiss={() => dismiss(n)} onAction={() => navigate(n)} />
      ))}
    </div>
  );
}

/* ── Single toast ─────────────────────────────────────────────── */
function ToastItem({ notification: n, autoCloseDuration, delay, onDismiss, onAction }:
  { notification: Notification; autoCloseDuration: number; delay: number; onDismiss(): void; onAction(): void }) {

  const meta = getMeta(n.type);
  const { Icon } = meta;
  const [phase, setPhase] = useState<"enter"|"idle"|"exit">("enter");
  const [pct,   setPct]   = useState(100);

  useEffect(() => { const t = setTimeout(() => setPhase("idle"), 40); return () => clearTimeout(t); }, []);

  useEffect(() => {
    let raf: number;
    const start = () => {
      const origin = Date.now();
      const tick = () => {
        const remaining = 1 - (Date.now() - origin) / autoCloseDuration;
        if (remaining <= 0) { triggerExit(); return; }
        setPct(remaining * 100);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const t = setTimeout(start, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [autoCloseDuration, delay]);

  const triggerExit = useCallback(() => { setPhase("exit"); setTimeout(onDismiss, 300); }, [onDismiss]);

  const style: React.CSSProperties = {
    transform: phase === "idle" ? "translateX(0) scale(1)" : "translateX(110%) scale(0.94)",
    opacity:   phase === "idle" ? 1 : 0,
    transition: "transform 300ms cubic-bezier(0.22,1,0.36,1), opacity 260ms ease",
  };

  return (
    <div className="pointer-events-auto" style={style}>
      <div className={`relative overflow-hidden rounded-2xl border-l-4 border border-gray-100/80 ${meta.bg} ${meta.border}`}
        style={{ boxShadow:"0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)", minWidth:320 }} role="alert">

        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          {/* Icon bubble */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}>
            <Icon className={`${meta.iconColor}`} style={{ width:18, height:18 }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <span className={`text-[9px] font-black uppercase tracking-widest ${meta.iconColor}`}>{meta.label}</span>
            <p className="text-sm font-bold text-gray-900 leading-snug mt-0.5">{n.title}</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
            {n.action_url && (
              <button onClick={onAction}
                className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${meta.iconColor} hover:underline`}>
                View details <ArrowRight style={{ width:12, height:12 }} />
              </button>
            )}
          </div>

          {/* Close */}
          <button onClick={triggerExit} aria-label="Dismiss"
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors mt-0.5">
            <X style={{ width:14, height:14 }} />
          </button>
        </div>

        {/* Drain bar */}
        <div className="h-1 w-full bg-black/5">
          <div className={`h-full ${meta.bar} opacity-60 transition-none`} style={{ width:`${pct}%` }} />
        </div>
      </div>
    </div>
  );
}