/**
 * SmartLivestock — FarmerDashboard
 * Premium redesign: gradient stat cards, polished qa-tile quick actions,
 * styled activity feed, alert banner, and proper card icon headers.
 * All functionality unchanged.
 */

import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import NearbyServicesMap from "./NearbyServicesMap";
import ReportSymptom from "./ReportSymptom";
import StatsCard from "../../components/StartsCard";
import { fetchMyAnimals } from "../../api/animals.api";
import {
  PawPrint, Activity, Calendar, TrendingUp,
  Bell, AlertTriangle, MapPin, ShoppingCart,
  Plus, ArrowRight, CloudRain,
  ClipboardList, Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── Recent activity config ── */
type ActivityType = "appointment" | "health" | "animal" | "order";
interface RecentActivity {
  id: number; type: ActivityType; title: string; subtitle: string; onClick: () => void;
}

const ACTIVITY_ICON_MAP: Record<ActivityType, { bg: string; icon: React.ElementType; color: string }> = {
  appointment: { bg: "bg-blue-100",   icon: Calendar,     color: "text-blue-600"  },
  health:      { bg: "bg-red-100",    icon: Activity,     color: "text-red-600"   },
  animal:      { bg: "bg-green-100",  icon: PawPrint,     color: "text-green-600" },
  order:       { bg: "bg-amber-100",  icon: ShoppingCart, color: "text-amber-600" },
};

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<any[]>([]);
  const userName = typeof window !== "undefined" ? localStorage.getItem("userName") || "" : "";

  useEffect(() => {
    fetchMyAnimals().then(d => setAnimals(d || [])).catch(() => {});
  }, []);

  /* ── Stats config ── */
  const stats = [
    { title: "Total Animals",        value: animals.length, trend: "up"   as const, trendValue: "+3",  trendLabel: "added this month", icon: PawPrint,      accent: "green"  as const },
    { title: "Pending Appointments", value: 3,              trend: "down" as const, trendValue: "-1",  trendLabel: "from last week",   icon: Calendar,      accent: "blue"   as const },
    { title: "Active Alerts",        value: 2,              trend: "up"   as const, trendValue: "0",   trendLabel: "no change",        icon: AlertTriangle, accent: "amber"  as const },
    { title: "Monthly Reports",      value: 12,             trend: "up"   as const, trendValue: "+4",  trendLabel: "vs last month",    icon: TrendingUp,    accent: "purple" as const },
  ];

  /* ── Quick actions config ── */
  const quickActions = [
    { label: "Add Animal",    icon: Plus,           color: "qa-tile-green",  onClick: () => navigate("/farmer/animals"),                                              },
    { label: "Book Appt",     icon: Calendar,       color: "qa-tile-blue",   onClick: () => navigate("/farmer/appointments/new"),                                    },
    { label: "Health Report", icon: Activity,       color: "qa-tile-purple", onClick: () => document.getElementById("symptom-section")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Marketplace",   icon: ShoppingCart,   color: "qa-tile-amber",  onClick: () => navigate("/farmer/marketplace"),                                         },
    { label: "Emergency",     icon: Zap,            color: "qa-tile-red",    onClick: () => navigate("/farmer/appointments/new"),                                    },
  ];

  /* ── Recent activities ── */
  const recentActivities: RecentActivity[] = [
    { id: 1, type: "appointment", title: "Vet checkup scheduled",   subtitle: "2 hours ago",  onClick: () => navigate("/farmer/appointments/new") },
    { id: 2, type: "health",      title: "Report animal symptoms",  subtitle: "Quick action", onClick: () => document.getElementById("symptom-section")?.scrollIntoView({ behavior: "smooth" }) },
    { id: 3, type: "animal",      title: "Add your animals",        subtitle: "Get started",  onClick: () => navigate("/farmer/animals") },
  ];

  return (
    <Layout role="farmer">
      <div className="space-y-6 animate-fadeInUp">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">
              {userName ? `Good day, ${userName.split(" ")[0]} 👋` : "Farmer Dashboard"}
            </h1>
            <p className="page-sub">Here's your livestock overview for today</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="btn btn-outline btn-sm flex items-center gap-2"
              onClick={() => navigate("/farmer/profile")}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Notifications</span>
              {/* notification dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            </button>
            <button
              className="btn btn-primary btn-sm flex items-center gap-2"
              onClick={() => document.getElementById("symptom-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Activity className="w-3.5 h-3.5" />
              Quick Report
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <StatsCard
              key={s.title}
              title={s.title}
              value={s.value}
              trend={s.trend}
              trendValue={s.trendValue}
              trendLabel={s.trendLabel}
              icon={s.icon}
              accent={s.accent}
            />
          ))}
        </div>

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left col: Map + ReportSymptom ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Nearby services map */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-blue">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 sora">Nearby Services</h2>
                    <p className="text-xs text-gray-500">Find vets and agrovets in your area</p>
                  </div>
                </div>
              </div>
              <div className="p-0">
                <NearbyServicesMap />
              </div>
            </div>

            {/* Symptom report section */}
            <div id="symptom-section">
              <ReportSymptom />
            </div>
          </div>

          {/* ── Right col: actions + activities + alert ── */}
          <div className="space-y-5">

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-green">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 sora">Quick Actions</h2>
                    <p className="text-xs text-gray-500">Frequently used tools</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={action.onClick}
                        className={`qa-tile ${action.color}`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="leading-tight px-1">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="card-icon-header">
                    <div className="card-icon-wrap card-icon-purple">
                      <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 sora">Recent Activities</h2>
                      <p className="text-xs text-gray-500">Your latest actions</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body space-y-1.5">
                {recentActivities.map(activity => {
                  const meta = ACTIVITY_ICON_MAP[activity.type];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={activity.id}
                      onClick={activity.onClick}
                      className="activity-item group"
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === "Enter" && activity.onClick()}
                    >
                      <div className={`activity-icon ${meta.bg}`}>
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.subtitle}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                    </div>
                  );
                })}

                <div className="pt-3 border-t border-gray-50 mt-3">
                  <button
                    type="button"
                    onClick={() => navigate("/farmer/animals")}
                    className="btn-link w-full justify-center text-xs"
                  >
                    View All Activities <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick stats strip */}
            <div className="card">
              <div className="card-body">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "Animals", value: animals.length || 0, icon: "🐄" },
                    { label: "Vets Near", value: "12+",             icon: "🩺" },
                    { label: "Orders",   value: "5",                icon: "📦" },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="text-xl">{s.icon}</div>
                      <p className="text-lg font-bold text-gray-900 sora tabular-nums mt-1">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Seasonal Alert */}
            <div className="alert-card alert-card-blue">
              <div className="alert-card-icon bg-blue-100">
                <CloudRain className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-800 sora">Seasonal Alert</h3>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Rainy season approaching. Consider preventive treatments for common infections and parasites.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/farmer/appointments/new")}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 transition"
                >
                  Book preventive checkup <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Marketplace promo strip */}
            <div
              className="rounded-2xl overflow-hidden cursor-pointer group"
              style={{ background: "linear-gradient(135deg, #14532d 0%, #15803d 50%, #16a34a 100%)" }}
              onClick={() => navigate("/farmer/marketplace")}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && navigate("/farmer/marketplace")}
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-green-200 uppercase tracking-wider">Agrovet Marketplace</p>
                  <p className="text-white font-bold text-sm mt-0.5">Shop feeds, vaccines & more</p>
                </div>
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center group-hover:bg-white/25 transition">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}