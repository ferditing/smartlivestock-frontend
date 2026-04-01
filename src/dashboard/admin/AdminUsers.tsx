import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import StatsCard from "../../components/StartsCard";
import { Link } from "react-router-dom";
import { getAdminCounties, getUsersAnalytics, getUsers, suspendUser, verifyProvider } from "../../api/admin.api";
import {
  Users, Search, ArrowLeft, Ban, CheckCircle, ChevronLeft, ChevronRight,
  MapPin, ShieldCheck, Activity, Eye, X, SlidersHorizontal,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

/* ─── Types ─── */
type User = {
  id: number; name: string; email: string; phone: string | null;
  role: string; county: string | null; sub_county: string | null;
  suspended: boolean | null; created_at: string;
  provider_id?: number | null;
  verification_status?: "pending" | "verified" | "rejected" | null;
};
type County = { id: number; name: string };
type CountyUserStats = { county: string; farmers: number; vets: number; agrovets: number; total: number; highDiseaseActivity?: boolean };
type UsersPerCountyByRoleRow = { county: string | null; role: string; count: string };
type MonthlyRegistrationRow  = { month: string; role: string; count: string };
type RoleDistributionRow     = { role: string; count: string };
type AnalyticsResponse = {
  usersPerCountyByRole: UsersPerCountyByRoleRow[];
  monthlyRegistrations: MonthlyRegistrationRow[];
  roleDistribution:     RoleDistributionRow[];
};

/* ─── Constants ─── */
const ROLE_COLORS: Record<string, string>   = { farmer: "#16a34a", vet: "#0ea5e9", agrovet: "#f97316" };
const ROLE_GRADIENT: Record<string, string> = { farmer: "from-green-500 to-emerald-600", vet: "from-blue-500 to-sky-600", agrovet: "from-amber-500 to-orange-500" };
const ROLE_BADGE: Record<string, string>    = { farmer: "badge-success", vet: "badge-info", agrovet: "badge-warning" };
const VER_LABEL: Record<string, string>     = { verified: "Approved", pending: "Pending", rejected: "Rejected" };
const VER_BADGE: Record<string, string>     = { verified: "badge-success", pending: "badge-warning", rejected: "badge-error" };
const PAGE_LIMIT = 20;

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}

/* ─── Component ─── */
export default function AdminUsers() {

  /* State */
  const [counties,   setCounties]   = useState<County[]>([]);
  const [analytics,  setAnalytics]  = useState<AnalyticsResponse | null>(null);
  const [viewUser,   setViewUser]   = useState<User | null>(null);
  const [acting,     setActing]     = useState<number | null>(null);

  const [selectedCounty,     setSelectedCounty]     = useState<string | null>(null);
  const [countyUsers,        setCountyUsers]        = useState<User[]>([]);
  const [countyTotal,        setCountyTotal]        = useState(0);
  const [countyPage,         setCountyPage]         = useState(1);
  const [countySearch,       setCountySearch]       = useState("");
  const [countyRole,         setCountyRole]         = useState("all");
  const [countyVerification, setCountyVerification] = useState("all");
  const [countyFiltersOpen,  setCountyFiltersOpen]  = useState(false);

  const [globalUsers,       setGlobalUsers]       = useState<User[]>([]);
  const [globalTotal,       setGlobalTotal]       = useState(0);
  const [globalPage,        setGlobalPage]        = useState(1);
  const [globalSearch,      setGlobalSearch]      = useState("");
  const [globalRole,        setGlobalRole]        = useState("all");
  const [globalCounty,      setGlobalCounty]      = useState("all");
  const [globalStatus,      setGlobalStatus]      = useState("all");
  const [globalFiltersOpen, setGlobalFiltersOpen] = useState(false);

  const [loadingCountyTable,  setLoadingCountyTable]  = useState(false);
  const [loadingGlobalTable,  setLoadingGlobalTable]  = useState(false);
  const [loadingAnalytics,    setLoadingAnalytics]    = useState(false);

  const { addToast } = useToast();

  /* Init */
  useEffect(() => {
    getAdminCounties().then(setCounties).catch(() => setCounties([]));
    setLoadingAnalytics(true);
    getUsersAnalytics()
      .then(setAnalytics)
      .catch(e => addToast("error", "Analytics error", e?.response?.data?.error || "Failed to load analytics"))
      .finally(() => setLoadingAnalytics(false));
  }, [addToast]);

  /* Fetch */
  const fetchUsers = (
    scope: "global" | "county",
    { page, search, role, county, status }: { page: number; search?: string; role?: string; county?: string | null; status?: string }
  ) => {
    const setLoading = scope === "global" ? setLoadingGlobalTable : setLoadingCountyTable;
    const setUsers   = scope === "global" ? setGlobalUsers : setCountyUsers;
    const setTotal   = scope === "global" ? setGlobalTotal : setCountyTotal;
    setLoading(true);
    getUsers({
      page, limit: PAGE_LIMIT,
      role:   role   && role   !== "all" ? role   : undefined,
      county: county && county !== "all" ? county : undefined,
      status: status && status !== "all" ? status : undefined,
      search: search?.trim() || undefined,
    })
      .then(r => {
        let list: User[] = r.users || [];
        if (scope === "county" && countyVerification !== "all") {
          list = list.filter(u => (u.verification_status || "pending") === countyVerification);
        }
        setUsers(list);
        setTotal(r.total ?? list.length);
      })
      .catch(e => addToast("error", "Error", e?.response?.data?.error || `Failed to load ${scope === "global" ? "users" : "county users"}`))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers("global", { page: globalPage, search: globalSearch, role: globalRole, county: globalCounty === "all" ? null : globalCounty, status: globalStatus }); }, [globalPage, globalRole, globalCounty, globalStatus]);
  useEffect(() => {
    const t = setTimeout(() => {
      globalPage === 1
        ? fetchUsers("global", { page: 1, search: globalSearch, role: globalRole, county: globalCounty === "all" ? null : globalCounty, status: globalStatus })
        : setGlobalPage(1);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSearch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!selectedCounty) return; fetchUsers("county", { page: countyPage, search: countySearch, role: countyRole, county: selectedCounty, status: undefined }); }, [selectedCounty, countyPage, countyRole, countyVerification]);
  useEffect(() => {
    if (!selectedCounty) return;
    const t = setTimeout(() => {
      countyPage === 1
        ? fetchUsers("county", { page: 1, search: countySearch, role: countyRole, county: selectedCounty, status: undefined })
        : setCountyPage(1);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countySearch]);

  /* Actions */
  const refreshBoth = () => {
    fetchUsers("global", { page: globalPage, search: globalSearch, role: globalRole, county: globalCounty === "all" ? null : globalCounty, status: globalStatus });
    if (selectedCounty) fetchUsers("county", { page: countyPage, search: countySearch, role: countyRole, county: selectedCounty, status: undefined });
  };

  const handleSuspend = (id: number, suspend: boolean) => {
    setActing(id);
    suspendUser(id, suspend)
      .then(() => { addToast("success", suspend ? "Suspended" : "Unsuspended", "User status updated"); refreshBoth(); })
      .catch(e => addToast("error", "Error", e?.response?.data?.error || "Failed to update user status"))
      .finally(() => setActing(null));
  };

  const handleApproveProvider = (u: User) => {
    if (!u.provider_id) { addToast("error", "Not a provider", "Only vets and agrovets with provider profiles can be approved"); return; }
    setActing(u.id);
    verifyProvider(u.provider_id)
      .then(() => { addToast("success", "Approved", "Provider verification updated"); refreshBoth(); })
      .catch(e => addToast("error", "Approval failed", e?.response?.data?.error || "Failed to approve provider"))
      .finally(() => setActing(null));
  };

  /* Derived analytics */
  const countyStats: CountyUserStats[] = useMemo(() => {
    if (!analytics) return [];
    const byCounty: Record<string, CountyUserStats> = {};
    analytics.usersPerCountyByRole.forEach(row => {
      if (!row.county) return;
      if (!byCounty[row.county]) byCounty[row.county] = { county: row.county, farmers: 0, vets: 0, agrovets: 0, total: 0 };
      const n = Number(row.count || 0);
      if (row.role === "farmer")  byCounty[row.county].farmers  += n;
      if (row.role === "vet")     byCounty[row.county].vets     += n;
      if (row.role === "agrovet") byCounty[row.county].agrovets += n;
      byCounty[row.county].total += n;
    });
    const totals = Object.values(byCounty).map(c => c.total);
    if (totals.length) {
      const sorted = [...totals].sort((a, b) => a - b);
      const threshold = sorted[Math.max(0, Math.floor(sorted.length * 0.75) - 1)] || 0;
      Object.values(byCounty).forEach(c => { c.highDiseaseActivity = c.total >= threshold && threshold > 0; });
    }
    return Object.values(byCounty).sort((a, b) => b.total - a.total);
  }, [analytics]);

  const barChartData  = useMemo(() => countyStats.map(c => ({ county: c.county, Farmers: c.farmers, Vets: c.vets, Agrovets: c.agrovets })), [countyStats]);
  const lineChartData = useMemo(() => {
    if (!analytics) return [];
    const map: Record<string, { month: string; total: number }> = {};
    analytics.monthlyRegistrations.forEach(row => {
      if (!row.month) return;
      if (!map[row.month]) map[row.month] = { month: row.month, total: 0 };
      map[row.month].total += Number(row.count || 0);
    });
    return Object.values(map).sort((a, b) => a.month > b.month ? 1 : -1);
  }, [analytics]);
  const pieChartData = useMemo(() => (analytics?.roleDistribution || []).map(r => ({ name: r.role, value: Number(r.count || 0) })), [analytics]);

  const totalUsers    = useMemo(() => analytics?.roleDistribution?.reduce((s, r) => s + Number(r.count || 0), 0) ?? globalTotal, [analytics, globalTotal]);
  const totalFarmers  = useMemo(() => Number(analytics?.roleDistribution?.find(r => r.role === "farmer")?.count  || 0), [analytics]);
  const totalVets     = useMemo(() => Number(analytics?.roleDistribution?.find(r => r.role === "vet")?.count     || 0), [analytics]);
  const totalAgrovets = useMemo(() => Number(analytics?.roleDistribution?.find(r => r.role === "agrovet")?.count || 0), [analytics]);

  const countyTotalPages = Math.ceil(countyTotal / PAGE_LIMIT);
  const globalTotalPages = Math.ceil(globalTotal  / PAGE_LIMIT);

  /* ── Sub-components ── */
  const VerBadge = ({ u }: { u: User }) => {
    const vs = u.verification_status || "pending";
    return <span className={`badge ${VER_BADGE[vs] || "badge-warning"}`}>{VER_LABEL[vs] || "Pending"}</span>;
  };

  const Avatar = ({ u, lg }: { u: User; lg?: boolean }) => (
    <div className={`${lg ? "w-14 h-14 text-lg" : "w-9 h-9 text-xs"} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 bg-gradient-to-br ${ROLE_GRADIENT[u.role] || "from-gray-500 to-gray-600"}`}>
      {getInitials(u.name)}
    </div>
  );

  /* Mobile user card — shown instead of table rows on small screens */
  const MobileUserCard = ({ u }: { u: User }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3 hover:border-green-200 hover:shadow-sm transition-all duration-200">
      {/* Top row: avatar + name + eye icon */}
      <div className="flex items-center gap-3">
        <Avatar u={u} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 truncate">{u.name}</p>
          <p className="text-xs text-gray-400 truncate">{u.email}</p>
        </div>
        <button
          type="button"
          onClick={() => setViewUser(u)}
          className="flex-shrink-0 w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Badge row */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`badge ${ROLE_BADGE[u.role] || "badge-gray"} capitalize`}>{u.role}</span>
        <VerBadge u={u} />
        {u.suspended
          ? <span className="badge badge-error badge-dot">Suspended</span>
          : <span className="badge badge-success badge-dot">Active</span>}
        {u.county && (
          <span className="inline-flex items-center gap-1 badge badge-gray">
            <MapPin className="w-2.5 h-2.5" />{u.county}
          </span>
        )}
      </div>

      {/* Action row */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50">
        {u.role !== "farmer" && (
          <button
            type="button"
            disabled={acting === u.id}
            onClick={() => handleApproveProvider(u)}
            className="btn btn-outline btn-sm text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 justify-center"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Approve
          </button>
        )}
        <button
          type="button"
          disabled={acting === u.id}
          onClick={() => handleSuspend(u.id, !u.suspended)}
          className={`btn btn-outline btn-sm justify-center ${u.role === "farmer" ? "col-span-2" : ""} ${u.suspended ? "text-emerald-700 border-emerald-200 hover:border-emerald-400" : "text-amber-700 border-amber-200 hover:border-amber-400"}`}
        >
          {u.suspended ? "Unsuspend" : "Suspend"}
        </button>
      </div>
    </div>
  );

  /* Desktop table action buttons */
  const TableActions = ({ u }: { u: User }) => (
    <div className="flex justify-end items-center gap-1.5">
      <button type="button" onClick={() => setViewUser(u)} className="btn btn-outline btn-xs">
        <Eye className="w-3 h-3" /> View
      </button>
      {u.role !== "farmer" && (
        <button type="button" disabled={acting === u.id} onClick={() => handleApproveProvider(u)} className="btn btn-outline btn-xs text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50">
          <CheckCircle className="w-3 h-3" /> Approve
        </button>
      )}
      <button type="button" disabled={acting === u.id} onClick={() => handleSuspend(u.id, !u.suspended)}
        className={`btn btn-outline btn-xs ${u.suspended ? "text-emerald-700 border-emerald-200" : "text-amber-700 border-amber-200"}`}>
        {u.suspended ? "Unsuspend" : "Suspend"}
      </button>
    </div>
  );

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <Layout role="admin">
      {/* Prevent ALL horizontal overflow at the root level */}
      <div className="w-full max-w-full overflow-x-hidden space-y-5 pb-6">

        {/* ── Hero Banner ── */}
        <div className="rounded-2xl overflow-hidden animate-fadeIn" style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)" }}>
          <div className="relative px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="absolute top-0 right-0 text-[80px] sm:text-[120px] leading-none opacity-[0.07] select-none pointer-events-none pr-3 sm:pr-4 pt-1 sm:pt-2">👥</div>
            <div className="relative z-10">
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-green-200 hover:text-white transition-colors mb-3 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white sora mb-1">User Intelligence</h1>
              <p className="text-green-200 text-sm mb-4">Monitor farmers, vets, and agrovets across Kenyan counties</p>
              {/* Horizontally scrollable pill strip — never wraps, never causes page zoom */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                {[
                  { label: "Farmers",  val: totalFarmers,  c: "bg-green-500/20 border-green-400/30" },
                  { label: "Vets",     val: totalVets,     c: "bg-blue-500/20  border-blue-400/30"  },
                  { label: "Agrovets", val: totalAgrovets, c: "bg-amber-500/20 border-amber-400/30" },
                  { label: "Total",    val: totalUsers,    c: "bg-white/10     border-white/20"     },
                ].map(s => (
                  <div key={s.label} className={`flex-shrink-0 flex items-center gap-2 border ${s.c} rounded-xl px-3 py-2 backdrop-blur-sm`}>
                    <span className="text-white font-bold sora tabular-nums text-base sm:text-lg leading-none">{s.val.toLocaleString()}</span>
                    <span className="text-white/70 text-xs font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Cards: 2-col on mobile → 4-col on lg ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard title="Total Users" value={totalUsers}    icon={Users} />
          <StatsCard title="Farmers"     value={totalFarmers}  icon={Users} />
          <StatsCard title="Vets"        value={totalVets}     icon={Users} />
          <StatsCard title="Agrovets"    value={totalAgrovets} icon={Users} />
        </div>

        {/* ── County Overview ── */}
        <div className="card animate-fadeInUp">
          <div className="card-header flex items-center gap-3">
            <div className="card-icon-wrap card-icon-green"><MapPin className="w-4 h-4 text-white" /></div>
            <div>
              <h2 className="font-bold text-gray-900 sora text-sm">County Overview</h2>
              <p className="text-xs text-gray-500">Tap a county to drill down into its users</p>
            </div>
          </div>
          <div className="card-body pt-3">
            {countyStats.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                {loadingAnalytics ? "Loading county statistics…" : "No county statistics available yet."}
              </p>
            ) : (
              /*
                Mobile  (default): 1 col  — one full-width card per county, easy to tap
                Tablet  (sm):      2 cols
                Desktop (lg):      3 cols
                Wide    (xl):      4 cols
              */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {countyStats.map((c, i) => {
                  const isActive = selectedCounty === c.county;
                  return (
                    <button
                      key={c.county}
                      onClick={() => { setSelectedCounty(c.county); setCountyPage(1); }}
                      className={`
                        group w-full text-left rounded-2xl border p-4 transition-all duration-200
                        hover:shadow-md hover:-translate-y-0.5 animate-fadeInUp
                        ${isActive
                          ? "border-green-500 ring-2 ring-green-500/20 bg-green-50/50 shadow-sm"
                          : "border-gray-100 bg-white hover:border-green-200"}
                      `}
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      {/* Card header row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">County</p>
                          <p className="font-bold text-gray-900 sora text-sm leading-tight truncate">{c.county || "Unknown"}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {isActive && (
                            <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 text-[9px] font-bold">
                              ✓ Active
                            </span>
                          )}
                          {c.highDiseaseActivity && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap">
                              <Activity className="w-2.5 h-2.5" /> High
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 3 stat chips in a row — always fit without overflow */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="rounded-xl bg-emerald-50 px-2 py-2 text-center">
                          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide leading-none mb-1">Farmers</p>
                          <p className="text-sm font-bold text-emerald-900 tabular-nums">{c.farmers}</p>
                        </div>
                        <div className="rounded-xl bg-sky-50 px-2 py-2 text-center">
                          <p className="text-[9px] text-sky-600 font-bold uppercase tracking-wide leading-none mb-1">Vets</p>
                          <p className="text-sm font-bold text-sky-900 tabular-nums">{c.vets}</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 px-2 py-2 text-center">
                          <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wide leading-none mb-1">Shops</p>
                          <p className="text-sm font-bold text-amber-900 tabular-nums">{c.agrovets}</p>
                        </div>
                      </div>

                      {/* Card footer */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{c.total.toLocaleString()} total users</span>
                        <span className={`text-sm font-bold transition-transform group-hover:translate-x-0.5 ${isActive ? "text-green-600" : "text-gray-300 group-hover:text-green-500"}`}>→</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── County Drill-down ── */}
        <div className="card animate-fadeInUp" style={{ animationDelay: "80ms" }}>
          <div className="card-header flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="card-icon-wrap card-icon-teal flex-shrink-0"><MapPin className="w-4 h-4 text-white" /></div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 sora text-sm">County Drill-down</h2>
                <p className="text-xs text-gray-500 truncate">
                  {selectedCounty
                    ? <><span className="font-semibold text-gray-700">{selectedCounty}</span> — {countyTotal.toLocaleString()} user{countyTotal !== 1 ? "s" : ""}</>
                    : "Tap a county card above to explore"}
                </p>
              </div>
            </div>
            {/* Filter toggle button — mobile only */}
            <button
              type="button"
              disabled={!selectedCounty}
              onClick={() => setCountyFiltersOpen(v => !v)}
              className={`sm:hidden flex-shrink-0 p-2 rounded-xl border transition-all ${countyFiltersOpen ? "bg-green-50 border-green-300 text-green-700" : "border-gray-200 text-gray-400 hover:border-gray-300 disabled:opacity-40"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="card-body space-y-3">
            {/* Search — always full width */}
            <div className="input-icon-wrap">
              <Search className="input-icon w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, phone…"
                value={countySearch}
                onChange={e => setCountySearch(e.target.value)}
                className="input-field"
                disabled={!selectedCounty}
              />
            </div>

            {/* Filters: collapsible on mobile, always shown on sm+ */}
            <div className={`${countyFiltersOpen ? "grid" : "hidden"} sm:grid grid-cols-2 gap-2`}>
              <select
                value={countyRole}
                onChange={e => { setCountyRole(e.target.value); setCountyPage(1); }}
                className="select-field text-sm"
                disabled={!selectedCounty}
              >
                <option value="all">All roles</option>
                <option value="farmer">Farmer</option>
                <option value="vet">Vet</option>
                <option value="agrovet">Agrovet</option>
              </select>
              <select
                value={countyVerification}
                onChange={e => { setCountyVerification(e.target.value); setCountyPage(1); }}
                className="select-field text-sm"
                disabled={!selectedCounty}
              >
                <option value="all">All verification</option>
                <option value="verified">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Content */}
            {!selectedCounty ? (
              <div className="empty-state py-10">
                <div className="empty-state-icon"><MapPin className="w-8 h-8" /></div>
                <p className="empty-state-title">No county selected</p>
                <p className="empty-state-sub">Tap a county card above to load its users.</p>
              </div>
            ) : loadingCountyTable ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : countyUsers.length === 0 ? (
              <div className="empty-state py-8"><p className="empty-state-sub">No users found for {selectedCounty}.</p></div>
            ) : (
              <>
                {/* Mobile: stacked user cards */}
                <div className="sm:hidden space-y-2.5">
                  {countyUsers.map(u => <MobileUserCard key={u.id} u={u} />)}
                </div>
                {/* Desktop: table in contained scroll box */}
                <div className="hidden sm:block rounded-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto scroll-area max-h-[400px]">
                    <table className="table w-full">
                      <thead>
                        <tr><th>User</th><th>Role</th><th>Verification</th><th className="text-right">Actions</th></tr>
                      </thead>
                      <tbody>
                        {countyUsers.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar u={u} />
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
                                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td><span className={`badge ${ROLE_BADGE[u.role] || "badge-gray"} capitalize`}>{u.role}</span></td>
                            <td><VerBadge u={u} /></td>
                            <td className="text-right"><TableActions u={u} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Pagination */}
            {selectedCounty && countyTotalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <p className="tabular-nums">{(countyPage - 1) * PAGE_LIMIT + 1}–{Math.min(countyPage * PAGE_LIMIT, countyTotal)} of {countyTotal}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => setCountyPage(p => Math.max(1, p - 1))} disabled={countyPage <= 1} className="btn btn-outline btn-icon-sm"><ChevronLeft className="w-3 h-3" /></button>
                  <button onClick={() => setCountyPage(p => Math.min(countyTotalPages, p + 1))} disabled={countyPage >= countyTotalPages} className="btn btn-outline btn-icon-sm"><ChevronRight className="w-3 h-3" /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Global Users ── */}
        <div className="card animate-fadeInUp" style={{ animationDelay: "120ms" }}>
          <div className="card-header flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="card-icon-wrap card-icon-blue"><Users className="w-4 h-4 text-white" /></div>
              <div>
                <h2 className="font-bold text-gray-900 sora text-sm">Global Users</h2>
                <p className="text-xs text-gray-500">All users across all counties</p>
              </div>
            </div>
            {/* Filter toggle — mobile only */}
            <button
              type="button"
              onClick={() => setGlobalFiltersOpen(v => !v)}
              className={`sm:hidden flex-shrink-0 p-2 rounded-xl border transition-all ${globalFiltersOpen ? "bg-blue-50 border-blue-300 text-blue-700" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="card-body space-y-3">
            {/* Search */}
            <div className="input-icon-wrap">
              <Search className="input-icon w-4 h-4" />
              <input
                type="text"
                placeholder="Search all users…"
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Filters: collapsible on mobile, grid on sm+ */}
            <div className={`${globalFiltersOpen ? "grid" : "hidden"} sm:grid grid-cols-1 sm:grid-cols-3 gap-2`}>
              <select value={globalRole}   onChange={e => { setGlobalRole(e.target.value);   setGlobalPage(1); }} className="select-field text-sm">
                <option value="all">All roles</option>
                <option value="farmer">Farmer</option>
                <option value="vet">Vet</option>
                <option value="agrovet">Agrovet</option>
              </select>
              <select value={globalCounty} onChange={e => { setGlobalCounty(e.target.value); setGlobalPage(1); }} className="select-field text-sm">
                <option value="all">All counties</option>
                {counties.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <select value={globalStatus} onChange={e => { setGlobalStatus(e.target.value); setGlobalPage(1); }} className="select-field text-sm">
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Content */}
            {loadingGlobalTable ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : globalUsers.length === 0 ? (
              <div className="empty-state py-8"><p className="empty-state-sub">No users match your filters.</p></div>
            ) : (
              <>
                {/* Mobile: stacked user cards */}
                <div className="sm:hidden space-y-2.5">
                  {globalUsers.map(u => <MobileUserCard key={u.id} u={u} />)}
                </div>
                {/* Desktop: table */}
                <div className="hidden sm:block rounded-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto scroll-area max-h-[400px]">
                    <table className="table w-full">
                      <thead>
                        <tr><th>User</th><th>Role</th><th>County</th><th>Status</th><th>Joined</th><th className="text-right">Actions</th></tr>
                      </thead>
                      <tbody>
                        {globalUsers.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Avatar u={u} />
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
                                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td><span className={`badge ${ROLE_BADGE[u.role] || "badge-gray"} capitalize`}>{u.role}</span></td>
                            <td className="text-xs text-gray-600 whitespace-nowrap">{u.county || "—"}</td>
                            <td>{u.suspended ? <span className="badge badge-error badge-dot">Suspended</span> : <span className="badge badge-success badge-dot">Active</span>}</td>
                            <td className="text-xs text-gray-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                            <td className="text-right"><TableActions u={u} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Pagination */}
            {globalTotalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <p className="tabular-nums">{(globalPage - 1) * PAGE_LIMIT + 1}–{Math.min(globalPage * PAGE_LIMIT, globalTotal)} of {globalTotal}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => setGlobalPage(p => Math.max(1, p - 1))} disabled={globalPage <= 1} className="btn btn-outline btn-icon-sm"><ChevronLeft className="w-3 h-3" /></button>
                  <button onClick={() => setGlobalPage(p => Math.min(globalTotalPages, p + 1))} disabled={globalPage >= globalTotalPages} className="btn btn-outline btn-icon-sm"><ChevronRight className="w-3 h-3" /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Analytics ── */}
        <div className="card animate-fadeInUp" style={{ animationDelay: "160ms" }}>
          <div className="card-header flex items-center gap-3">
            <div className="card-icon-wrap card-icon-purple"><Activity className="w-4 h-4 text-white" /></div>
            <div>
              <h2 className="font-bold text-gray-900 sora text-sm">User Analytics</h2>
              <p className="text-xs text-gray-500">Distribution by county, role, and registration timeline</p>
            </div>
          </div>
          <div className="card-body space-y-4">

            {/* Bar chart — full width on all screens */}
            <div className="h-60 sm:h-72 rounded-xl bg-gray-50/60 border border-gray-100 p-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Users per county (by role)</h3>
              {loadingAnalytics ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !barChartData.length ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">No county analytics available yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ left: -12, right: 4, top: 4, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="county" fontSize={8} tickLine={false} tick={{ fill: "#9ca3af" }} angle={-30} textAnchor="end" interval={0} height={36} />
                    <YAxis fontSize={8} tickLine={false} tick={{ fill: "#9ca3af" }} />
                    <Tooltip cursor={{ fill: "rgba(22,163,74,0.04)" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey="Farmers"  stackId="users" fill={ROLE_COLORS.farmer}  radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Vets"     stackId="users" fill={ROLE_COLORS.vet}     />
                    <Bar dataKey="Agrovets" stackId="users" fill={ROLE_COLORS.agrovet} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Line + Pie: stacked on mobile → side-by-side on lg */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-44 rounded-xl bg-gray-50/60 border border-gray-100 p-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Monthly registrations</h3>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !lineChartData.length ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">No timeline data yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" fontSize={8} tickLine={false} tick={{ fill: "#9ca3af" }} />
                      <YAxis fontSize={8} tickLine={false} tick={{ fill: "#9ca3af" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="h-44 rounded-xl bg-gray-50/60 border border-gray-100 p-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Role distribution</h3>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !pieChartData.length ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">No data yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                      <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="46%" outerRadius={52} innerRadius={26} paddingAngle={2}>
                        {pieChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={ROLE_COLORS[entry.name] || ["#16a34a", "#0ea5e9", "#f97316", "#4b5563"][index % 4]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>{/* end root */}

      {/* ── User Detail Modal ── */}
      {viewUser && (
        <div className="modal-backdrop" onClick={() => setViewUser(null)}>
          {/* mx-3 ensures modal never clips off screen edges on phones */}
          <div className="modal mx-3 sm:mx-auto" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-bold text-gray-900 sora">User Details</h2>
              <button type="button" onClick={() => setViewUser(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              {/* Avatar + name */}
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-100">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br ${ROLE_GRADIENT[viewUser.role] || "from-gray-500 to-gray-600"}`}>
                  {getInitials(viewUser.name)}
                </div>
                <div className="text-center w-full">
                  <p className="font-bold text-gray-900 sora text-lg leading-tight">{viewUser.name}</p>
                  <p className="text-sm text-gray-500 break-all">{viewUser.email}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    <span className={`badge ${ROLE_BADGE[viewUser.role] || "badge-gray"} capitalize`}>{viewUser.role}</span>
                    {viewUser.suspended
                      ? <span className="badge badge-error badge-dot">Suspended</span>
                      : <span className="badge badge-success badge-dot">Active</span>}
                  </div>
                </div>
              </div>
              {/* Detail fields */}
              <dl className="divide-y divide-gray-50">
                {[
                  { label: "Phone",      val: viewUser.phone || "—" },
                  { label: "Location",   val: [viewUser.county, viewUser.sub_county].filter(Boolean).join(", ") || "—" },
                  { label: "Registered", val: new Date(viewUser.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between py-2.5">
                    <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">{f.label}</dt>
                    <dd className="font-medium text-gray-900 text-sm text-right">{f.val}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verification</dt>
                  <dd><VerBadge u={viewUser} /></dd>
                </div>
              </dl>
            </div>
            <div className="modal-footer flex-wrap gap-2">
              <button
                type="button"
                disabled={acting === viewUser.id}
                onClick={() => { handleSuspend(viewUser.id, !viewUser.suspended); setViewUser({ ...viewUser, suspended: !viewUser.suspended }); }}
                className={`btn btn-sm flex-1 sm:flex-none ${viewUser.suspended ? "btn-outline text-emerald-700 border-emerald-200" : "btn-outline text-amber-700 border-amber-200"}`}
              >
                {viewUser.suspended ? <><CheckCircle className="w-4 h-4" /> Activate</> : <><Ban className="w-4 h-4" /> Suspend</>}
              </button>
              {viewUser.role !== "farmer" && (
                <button
                  type="button"
                  disabled={acting === viewUser.id}
                  onClick={() => handleApproveProvider(viewUser)}
                  className="btn btn-outline btn-sm flex-1 sm:flex-none text-emerald-700 border-emerald-200"
                >
                  <ShieldCheck className="w-4 h-4" /> Approve Provider
                </button>
              )}
              <button type="button" onClick={() => setViewUser(null)} className="btn btn-ghost btn-sm w-full sm:w-auto sm:ml-auto">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}