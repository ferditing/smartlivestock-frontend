import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import {
  Users, PawPrint, ShoppingBag, Calendar, Activity,
  AlertTriangle, Shield, ShieldCheck, MapPin, FileText, ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

type SubAdminStats = {
  county: string;
  users: { total: number; farmers: number; vets: number; agrovets: number };
  verifiedVets: number;
  verifiedAgrovets: number;
  providers: { total: number; pending: number };
  appointments: number;
  symptomReports: number;
  animals: number;
};

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

export default function SubAdminDashboard() {
  const [stats, setStats] = useState<SubAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get("/subadmin/stats")
      .then(r => setStats(r.data))
      .catch(e => setError(e?.response?.data?.error || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout role="subadmin">
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full animate-spin" style={{ border: "3px solid #dcfce7", borderTopColor: "#16a34a" }} />
          <p className="text-sm text-gray-500">Loading county dashboard…</p>
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout role="subadmin">
      <div className="info-box info-box-red p-8 text-center">{error}</div>
    </Layout>
  );

  const county = stats?.county || "Your County";

  return (
    <Layout role="subadmin">
      <div className="space-y-6">

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-teal-700 via-emerald-600 to-green-600 p-6 md:p-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
            <span className="absolute top-3 right-12 text-8xl">🏛️</span>
            <span className="absolute bottom-0 right-52 text-5xl">📍</span>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="hero-content-up">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-sm mb-2">
                <MapPin className="w-3.5 h-3.5" /> {county} County
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white sora">County Dashboard</h1>
              <p className="text-teal-100 mt-1 text-sm">Manage livestock activity, users, and providers for {county}</p>
            </div>
            <div className="hero-content-up-d1">
              <Link to="/subadmin/users" className="btn btn-sm inline-flex items-center gap-2" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}>
                <Users className="w-4 h-4" /> View Users
              </Link>
            </div>
          </div>
          <div className="hero-content-up-d2 mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Users", value: stats?.users?.total ?? 0 },
              { label: "Farmers", value: stats?.users?.farmers ?? 0 },
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

        {/* Pending alert */}
        {(stats?.providers?.pending ?? 0) > 0 && (
          <Link to="/subadmin/providers" className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors group animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-900">{stats!.providers.pending} providers awaiting your approval</p>
              <p className="text-xs text-amber-700">Click to review and verify providers in {county}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <StatTile title="Farmers" value={stats?.users?.farmers ?? 0} icon={PawPrint} gradient="bg-gradient-to-br from-green-500 to-green-700" delay={0} />
          <StatTile title="Agrovets" value={stats?.users?.agrovets ?? 0} icon={ShoppingBag} gradient="bg-gradient-to-br from-amber-400 to-amber-600" delay={60} />
          <StatTile title="Verified Vets" value={stats?.verifiedVets ?? 0} icon={ShieldCheck} gradient="bg-gradient-to-br from-blue-500 to-blue-700" delay={120} />
          <StatTile title="Verified Agrovets" value={stats?.verifiedAgrovets ?? 0} icon={ShieldCheck} gradient="bg-gradient-to-br from-teal-400 to-teal-600" delay={180} />
          <StatTile title="Total Users" value={stats?.users?.total ?? 0} icon={Users} gradient="bg-gradient-to-br from-purple-500 to-purple-700" delay={240} />
          <StatTile title="Providers" value={stats?.providers?.total ?? 0} icon={Shield} gradient="bg-gradient-to-br from-indigo-400 to-indigo-600" delay={300} />
          <StatTile title="Pending" value={stats?.providers?.pending ?? 0} icon={AlertTriangle} gradient="bg-gradient-to-br from-red-400 to-red-600" delay={360} />
          <StatTile title="Appointments" value={stats?.appointments ?? 0} icon={Calendar} gradient="bg-gradient-to-br from-emerald-400 to-emerald-700" delay={420} />
          <StatTile title="Symptom Reports" value={stats?.symptomReports ?? 0} icon={Activity} gradient="bg-gradient-to-br from-cyan-400 to-cyan-600" delay={480} />
          <StatTile title="Animals" value={stats?.animals ?? 0} icon={PawPrint} gradient="bg-gradient-to-br from-green-600 to-emerald-800" delay={540} />
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              to: "/subadmin/users",
              icon: Users,
              label: "User Management",
              sub: "View, suspend, and manage farmers, vets, and agrovets",
              gradient: "from-green-500 to-emerald-700",
            },
            {
              to: "/subadmin/analytics",
              icon: FileText,
              label: "County Analytics",
              sub: "Symptom reports and diagnosis distribution for your county",
              gradient: "from-sky-500 to-sky-700",
            },
            {
              to: "/subadmin/providers",
              icon: Shield,
              label: "Provider Approvals",
              sub: "Verify vets and agrovets in your county",
              gradient: "from-amber-500 to-amber-700",
            },
          ].map(({ to, icon: Icon, label, sub, gradient }) => (
            <Link key={to} to={to} className="group card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-6 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 sora">{label}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}