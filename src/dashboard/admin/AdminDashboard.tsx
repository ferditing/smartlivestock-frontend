import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import {
  Users, PawPrint, Stethoscope, ShoppingBag, Calendar,
  Activity, AlertTriangle, Shield, FileText, Clock, ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api/admin.api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

type Stats = {
  users: { total: number; farmers: number; vets: number; agrovets: number };
  providers: { total: number; pending: number };
  appointments: number;
  symptomReports: number;
  animals: number;
  licensesExpiringSoon?: number;
  usersByCounty: { county: string; count: string }[];
};

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#7c3aed"];

function Counter({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 800, 1);
      setVal(Math.round(p * to));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to]);
  return <>{val.toLocaleString()}</>;
}

const StatTile = ({ title, value, icon: Icon, gradient, delay = 0 }: {
  title: string; value: number; icon: any; gradient: string; delay?: number;
}) => (
  <div className="stat-card glow-card animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
    <div className={`stat-icon ${gradient}`}><Icon className="w-5 h-5 text-white" /></div>
    <div>
      <p className="stat-label">{title}</p>
      <p className="stat-value"><Counter to={value} /></p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(e => setError(e?.response?.data?.error || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout role="admin">
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-t-green-600 rounded-full animate-spin" style={{ border: "3px solid #dcfce7", borderTopColor: "#16a34a" }} />
          <p className="text-sm text-gray-500">Loading admin dashboard…</p>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout role="admin">
      <div className="info-box info-box-red p-8 text-center">{error}</div>
    </Layout>
  );

  const roleData = stats ? [
    { name: "Farmers", value: stats.users.farmers, color: COLORS[0] },
    { name: "Vets", value: stats.users.vets, color: COLORS[1] },
    { name: "Agrovets", value: stats.users.agrovets, color: COLORS[2] },
  ].filter(d => d.value > 0) : [];

  return (
    <Layout role="admin">
      <div className="space-y-6">

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 via-green-900 to-emerald-800 p-6 md:p-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
            <span className="absolute top-3 right-16 text-8xl">🏛️</span>
            <span className="absolute bottom-0 right-64 text-5xl">🌍</span>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="hero-content-up">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-white rounded-full text-xs font-semibold backdrop-blur-sm mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> National Admin
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white sora">Admin Dashboard</h1>
              <p className="text-green-100 mt-1 text-sm">System governance and national livestock monitoring</p>
            </div>
            <div className="hero-content-up-d1">
              <Link to="/admin/providers" className="btn btn-sm inline-flex items-center gap-2" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}>
                <Shield className="w-4 h-4" />
                Pending Approvals
                {(stats?.providers?.pending ?? 0) > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{stats!.providers.pending}</span>
                )}
              </Link>
            </div>
          </div>
          <div className="hero-content-up-d2 mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Users", value: stats?.users?.total ?? 0 },
              { label: "Providers", value: stats?.providers?.total ?? 0 },
              { label: "Animals", value: stats?.animals ?? 0 },
              { label: "Symptom Reports", value: stats?.symptomReports ?? 0 },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <p className="text-white/70 text-xs mb-0.5">{s.label}</p>
                <p className="text-white text-2xl font-bold tabular-nums sora"><Counter to={s.value} /></p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Alert */}
        {(stats?.providers?.pending ?? 0) > 0 && (
          <Link to="/admin/providers" className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors group animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-900">{stats!.providers.pending} providers awaiting verification</p>
              <p className="text-xs text-amber-700">Click to review pending approvals</p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <StatTile title="Total Users" value={stats?.users?.total ?? 0} icon={Users} gradient="bg-gradient-to-br from-blue-500 to-blue-700" delay={0} />
          <StatTile title="Farmers" value={stats?.users?.farmers ?? 0} icon={PawPrint} gradient="bg-gradient-to-br from-green-500 to-green-700" delay={60} />
          <StatTile title="Vets" value={stats?.users?.vets ?? 0} icon={Stethoscope} gradient="bg-gradient-to-br from-blue-400 to-indigo-600" delay={120} />
          <StatTile title="Agrovets" value={stats?.users?.agrovets ?? 0} icon={ShoppingBag} gradient="bg-gradient-to-br from-amber-400 to-amber-600" delay={180} />
          <StatTile title="Providers" value={stats?.providers?.total ?? 0} icon={Shield} gradient="bg-gradient-to-br from-purple-500 to-purple-700" delay={240} />
          <StatTile title="Pending" value={stats?.providers?.pending ?? 0} icon={AlertTriangle} gradient="bg-gradient-to-br from-red-400 to-red-600" delay={300} />
          <StatTile title="Appointments" value={stats?.appointments ?? 0} icon={Calendar} gradient="bg-gradient-to-br from-teal-400 to-teal-600" delay={360} />
          <StatTile title="Reports" value={stats?.symptomReports ?? 0} icon={Activity} gradient="bg-gradient-to-br from-indigo-400 to-indigo-600" delay={420} />
          <StatTile title="Animals" value={stats?.animals ?? 0} icon={PawPrint} gradient="bg-gradient-to-br from-emerald-400 to-emerald-700" delay={480} />
          {typeof stats?.licensesExpiringSoon === "number" && (
            <Link to="/admin/providers" className="contents">
              <div className="stat-card glow-card border-l-4 border-l-amber-400 animate-fadeInUp" style={{ animationDelay: "540ms" }}>
                <div className="stat-icon bg-gradient-to-br from-amber-400 to-orange-500"><Clock className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="stat-label">Expiring Licenses</p>
                  <p className="stat-value"><Counter to={stats.licensesExpiringSoon} /></p>
                  <p className="text-xs text-amber-600 font-medium">Within 30 days</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-fadeInUp">
            <div className="card-header flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-gray-900 sora">Users by Role</h2>
            </div>
            <div className="card-body h-64">
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                      {roleData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.12)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>}
            </div>
          </div>

          <div className="card animate-fadeInUp-delay-1">
            <div className="card-header flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-gray-900 sora">Users by County (Top 10)</h2>
            </div>
            <div className="card-body h-64">
              {stats?.usersByCounty?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.usersByCounty.slice(0, 10).map(c => ({ name: c.county || "Unknown", count: Number(c.count) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.12)" }} />
                    <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>}
            </div>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { to: "/admin/users", icon: Users, label: "User Management", sub: "View, suspend, manage roles", gradient: "from-green-500 to-green-700" },
            { to: "/admin/providers", icon: Shield, label: "Provider Approvals", sub: "Verify vets & agrovets", gradient: "from-blue-500 to-blue-700" },
            { to: "/admin/analytics", icon: Activity, label: "Disease Analytics", sub: "Surveillance by county", gradient: "from-purple-500 to-purple-700" },
            { to: "/admin/audit-logs", icon: FileText, label: "Audit Logs", sub: "Admin action history", gradient: "from-amber-500 to-amber-700" },
            { to: "/admin/staff", icon: Users, label: "Staff Management", sub: "Create sub-admins", gradient: "from-teal-500 to-teal-700" },
          ].map(({ to, icon: Icon, label, sub, gradient }) => (
            <Link key={to} to={to} className="group card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm sora truncate">{label}</h3>
                <p className="text-xs text-gray-500 truncate">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}