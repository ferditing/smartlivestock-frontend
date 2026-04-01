/**
 * SmartLivestock — StatsCard
 * Premium stat card with gradient icon, trend indicator, hover glow.
 * Same props interface as original — fully backward compatible.
 */

import { TrendingUp, TrendingDown } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  trendLabel?: string;
  icon?: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  accent?: "green" | "blue" | "amber" | "purple" | "teal" | "rose";
  subtitle?: string;
};

const ACCENT: Record<string, { bg: string; color: string; bar: string; shadow: string; badge: string }> = {
  green:  { bg: "bg-green-100",  color: "text-green-600",  bar: "from-green-500 to-emerald-400",  shadow: "rgba(22,163,74,.15)",   badge: "bg-green-100 text-green-700"  },
  blue:   { bg: "bg-blue-100",   color: "text-blue-600",   bar: "from-blue-500 to-cyan-400",      shadow: "rgba(59,130,246,.15)",  badge: "bg-blue-100 text-blue-700"    },
  amber:  { bg: "bg-amber-100",  color: "text-amber-600",  bar: "from-amber-500 to-yellow-400",   shadow: "rgba(217,119,6,.15)",   badge: "bg-amber-100 text-amber-700"  },
  purple: { bg: "bg-purple-100", color: "text-purple-600", bar: "from-purple-500 to-violet-400",  shadow: "rgba(147,51,234,.15)",  badge: "bg-purple-100 text-purple-700"},
  teal:   { bg: "bg-teal-100",   color: "text-teal-600",   bar: "from-teal-500 to-cyan-400",      shadow: "rgba(20,184,166,.15)",  badge: "bg-teal-100 text-teal-700"    },
  rose:   { bg: "bg-rose-100",   color: "text-rose-600",   bar: "from-rose-500 to-pink-400",      shadow: "rgba(225,29,72,.15)",   badge: "bg-rose-100 text-rose-700"    },
};

export default function StatsCard({
  title, value, trend, trendLabel, icon: Icon,
  iconBg, iconColor, accent = "green", subtitle,
}: StatCardProps) {
  const c = ACCENT[accent] || ACCENT.green;

  return (
    <div
      className="group relative bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1 cursor-default overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px ${c.shadow}, 0 4px 12px rgba(0,0,0,.06)`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,.06)"; }}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${c.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Background glow blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.bg} opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-xl`} />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 sora tabular-nums leading-none">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconBg || c.bg}`}>
            <Icon className={`w-6 h-6 ${iconColor || c.color}`} />
          </div>
        )}
      </div>

      {trend && (
        <div className="relative mt-4 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendLabel || (trend === "up" ? "+12%" : "−5%")}
          </span>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      )}

      {/* Bottom bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${c.bar} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
    </div>
  );
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{children}</div>;
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 space-y-2.5">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
          <div className="h-8 bg-gray-100 rounded-xl animate-pulse w-28" />
        </div>
        <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
      </div>
      <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-32" />
    </div>
  );
}