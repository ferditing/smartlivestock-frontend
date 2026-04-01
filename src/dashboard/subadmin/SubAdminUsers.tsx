import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { getSubadminUsers, getSubadminSubcountyBreakdown, suspendSubadminUser } from "../../api/subadmin.api";
import {
  Users, Search, ArrowLeft, ChevronLeft, ChevronRight, Eye, X, MapPin,
  PawPrint, Stethoscope, ShoppingBag, Activity, Calendar, Mail, Phone, Shield
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

type User = {
  id: number; name: string; email: string; phone: string | null;
  role: string; county: string | null; sub_county: string | null;
  ward: string | null; locality: string | null; suspended: boolean | null;
  created_at: string; provider_id?: number | null; verification_status?: string | null;
};
type SubCountyBreakdown = {
  sub_county: string; total: number; farmers: number; vets: number; agrovets: number;
  wards: { ward: string; total: number; farmers: number; vets: number; agrovets: number }[];
};

const COLORS = ["#16a34a", "#2563eb", "#d97706"];
const PAGE_LIMIT = 20;

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}

const ROLE_BADGE: Record<string, string> = {
  farmer: "badge-success", vet: "badge-info", agrovet: "badge-warning"
};

const ROLE_GRADIENT: Record<string, string> = {
  farmer: "from-green-500 to-emerald-600",
  vet: "from-blue-500 to-blue-700",
  agrovet: "from-amber-500 to-orange-600"
};

export default function SubAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedSubCounty, setSelectedSubCounty] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<SubCountyBreakdown[]>([]);
  const [acting, setActing] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    setBreakdownLoading(true);
    getSubadminSubcountyBreakdown()
      .then(r => setBreakdown(r.breakdown || []))
      .catch(() => addToast("error", "Error", "Failed to load breakdown"))
      .finally(() => setBreakdownLoading(false));
  }, [addToast]);

  useEffect(() => {
    setLoading(true);
    const params: any = { page: String(page), limit: String(PAGE_LIMIT) };
    if (role !== "all") params.role = role;
    if (status !== "all") params.status = status;
    if (search.trim()) params.search = search.trim();
    if (selectedSubCounty) params.sub_county = selectedSubCounty;
    getSubadminUsers(params)
      .then(r => { setUsers(r.users || []); setTotal(r.total ?? 0); })
      .catch(() => { setUsers([]); setTotal(0); addToast("error", "Error", "Failed to load users"); })
      .finally(() => setLoading(false));
  }, [page, role, status, selectedSubCounty, addToast]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) {
        setLoading(true);
        const params: any = { page: "1", limit: String(PAGE_LIMIT) };
        if (role !== "all") params.role = role;
        if (status !== "all") params.status = status;
        if (search.trim()) params.search = search.trim();
        if (selectedSubCounty) params.sub_county = selectedSubCounty;
        getSubadminUsers(params)
          .then(r => { setUsers(r.users || []); setTotal(r.total ?? 0); })
          .finally(() => setLoading(false));
      } else {
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, selectedSubCounty]);

  const handleSuspend = (id: number, suspend: boolean) => {
    setActing(id);
    suspendSubadminUser(id, suspend)
      .then(() => {
        addToast("success", suspend ? "Suspended" : "Unsuspended", "User status updated");
        setUsers(prev => prev.map(u => u.id === id ? { ...u, suspended: suspend } : u));
        if (selectedUser?.id === id) setSelectedUser({ ...selectedUser, suspended: suspend });
      })
      .catch(e => addToast("error", "Error", (e as any)?.response?.data?.error || "Failed"))
      .finally(() => setActing(null));
  };

  const farmers = useMemo(() => users.filter(u => u.role === "farmer"), [users]);
  const vets = useMemo(() => users.filter(u => u.role === "vet"), [users]);
  const agrovets = useMemo(() => users.filter(u => u.role === "agrovet"), [users]);

  const roleDistributionData = useMemo(() => [
    { name: "Farmers", value: farmers.length, color: COLORS[0] },
    { name: "Vets", value: vets.length, color: COLORS[1] },
    { name: "Agrovets", value: agrovets.length, color: COLORS[2] },
  ], [farmers.length, vets.length, agrovets.length]);

  const subCountyBarData = useMemo(() =>
    breakdown.map(sc => ({
      name: sc.sub_county || "Unknown",
      Farmers: sc.farmers, Vets: sc.vets, Agrovets: sc.agrovets
    })), [breakdown]);

  const monthlyRegistrations = useMemo(() => {
    const months: Record<string, { farmers: number; vets: number; agrovets: number }> = {};
    users.forEach(u => {
      const month = new Date(u.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
      if (!months[month]) months[month] = { farmers: 0, vets: 0, agrovets: 0 };
      if (u.role === "farmer") months[month].farmers++;
      else if (u.role === "vet") months[month].vets++;
      else if (u.role === "agrovet") months[month].agrovets++;
    });
    return Object.entries(months)
      .map(([month, counts]) => ({ month, ...counts }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [users]);

  const statusHistogramData = useMemo(() => [
    { status: "Active", count: users.filter(u => !u.suspended).length },
    { status: "Suspended", count: users.filter(u => u.suspended).length },
  ], [users]);

  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const displayUsers = role === "all" ? users : role === "farmer" ? farmers : role === "vet" ? vets : agrovets;

  const roleTabs = [
    { id: "all", label: "All Users", count: users.length },
    { id: "farmer", label: "Farmers", count: farmers.length },
    { id: "vet", label: "Vets", count: vets.length },
    { id: "agrovet", label: "Agrovets", count: agrovets.length },
  ];

  return (
    <Layout role="subadmin">
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#134e4a 0%,#0d9488 55%,#14b8a6 100%)" }}>
          <div className="relative px-6 py-8">
            <div className="absolute top-0 right-0 text-9xl opacity-10 select-none pointer-events-none pr-6 pt-2">👥</div>
            <div className="relative">
              <Link to="/subadmin" className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white transition mb-3 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white sora">County Users</h1>
                  <p className="text-teal-100 mt-1 text-sm">Manage farmers, vets, and agrovets in your county</p>
                  {selectedSubCounty && (
                    <button
                      onClick={() => { setSelectedSubCounty(null); setPage(1); }}
                      className="mt-2 flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition"
                    >
                      <X className="w-3 h-3" /> Clear filter: {selectedSubCounty}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm font-semibold bg-white/10 rounded-xl px-4 py-2">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl font-bold sora tabular-nums text-white">{total}</span>
                  <span>total users</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-county Breakdown Cards */}
        {!breakdownLoading && breakdown.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {breakdown.map(sc => (
              <div
                key={sc.sub_county}
                onClick={() => { setSelectedSubCounty(selectedSubCounty === sc.sub_county ? null : sc.sub_county); setPage(1); }}
                className={`card cursor-pointer transition-all hover:-translate-y-0.5 ${selectedSubCounty === sc.sub_county ? "ring-2 ring-teal-500 bg-teal-50/30" : "hover:shadow-md"}`}
              >
                <div className="card-header flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <h3 className="font-bold text-gray-900 sora text-sm">{sc.sub_county}</h3>
                  </div>
                  <span className="badge badge-success">{sc.total} users</span>
                </div>
                <div className="card-body pt-2 space-y-1.5">
                  {[
                    { Icon: PawPrint, ic: "text-green-600", label: "Farmers", val: sc.farmers },
                    { Icon: Stethoscope, ic: "text-blue-600", label: "Vets", val: sc.vets },
                    { Icon: ShoppingBag, ic: "text-amber-600", label: "Agrovets", val: sc.agrovets }
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <r.Icon className={`w-3.5 h-3.5 ${r.ic}`} />
                        <span className="text-gray-600">{r.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900 tabular-nums">{r.val}</span>
                    </div>
                  ))}
                  {sc.wards.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Wards</p>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {sc.wards.map(w => (
                          <span key={w.ward} className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-md">
                            {w.ward} ({w.total})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Distribution Pie */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-bold text-gray-900 sora text-sm">Role Distribution</h3>
            </div>
            <div className="card-body">
              {roleDistributionData.every(d => d.value === 0) ? (
                <div className="empty-state"><p className="empty-state-sub">No data</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={roleDistributionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {roleDistributionData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Sub-county Bar */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-bold text-gray-900 sora text-sm">Users by Sub-County</h3>
            </div>
            <div className="card-body">
              {subCountyBarData.length === 0 ? (
                <div className="empty-state"><p className="empty-state-sub">No data</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={subCountyBarData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="Farmers" fill={COLORS[0]} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Vets" fill={COLORS[1]} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Agrovets" fill={COLORS[2]} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Registrations Line */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-bold text-gray-900 sora text-sm">Monthly Registrations</h3>
            </div>
            <div className="card-body">
              {monthlyRegistrations.length === 0 ? (
                <div className="empty-state"><p className="empty-state-sub">No data</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyRegistrations} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="farmers" stroke={COLORS[0]} dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="vets" stroke={COLORS[1]} dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="agrovets" stroke={COLORS[2]} dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Account Status Bar */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-bold text-gray-900 sora text-sm">Account Status</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusHistogramData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    <Cell fill="#16a34a" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <h2 className="font-bold text-gray-900 sora">Users</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="input-icon-wrap relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input pl-9 pr-8 text-sm w-full sm:w-56"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Status filter */}
              <select
                value={status}
                onChange={e => { setStatus(e.target.value); setPage(1); }}
                className="input text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Role Filter Chips */}
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {roleTabs.map(t => (
              <button
                key={t.id}
                onClick={() => { setRole(t.id); setPage(1); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${role === t.id ? "bg-teal-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${role === t.id ? "bg-white/20 text-white" : "bg-white/60 text-gray-500"}`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="card-body pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="empty-state py-12">
                <Users className="empty-state-icon" />
                <p className="empty-state-title">No users found</p>
                <p className="empty-state-sub">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="table-wrapper overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 px-3 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:table-cell">Role</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden md:table-cell">Location</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden lg:table-cell">Joined</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="text-right py-2.5 px-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayUsers.map((u, i) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors animate-fadeInUp" style={{ animationDelay: `${i * 30}ms` }}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${ROLE_GRADIENT[u.role] || "from-gray-400 to-gray-600"} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                              {getInitials(u.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{u.name}</p>
                              <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <span className={`badge ${ROLE_BADGE[u.role] || "badge-info"} capitalize`}>{u.role}</span>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 text-teal-500 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">{[u.sub_county, u.ward].filter(Boolean).join(", ") || u.county || "—"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden lg:table-cell">
                          <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3 px-3">
                          {u.suspended
                            ? <span className="badge badge-error">Suspended</span>
                            : <span className="badge badge-success">Active</span>
                          }
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSuspend(u.id, !u.suspended)}
                              disabled={acting === u.id}
                              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all disabled:opacity-50 ${u.suspended ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                            >
                              {acting === u.id ? "..." : u.suspended ? "Unsuspend" : "Suspend"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Page {page} of {totalPages} · {total} users</p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="font-bold text-gray-900 sora">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${ROLE_GRADIENT[selectedUser.role] || "from-gray-400 to-gray-600"} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 sora">{selectedUser.name}</p>
                  <span className={`badge ${ROLE_BADGE[selectedUser.role] || "badge-info"} capitalize mt-0.5`}>{selectedUser.role}</span>
                </div>
              </div>

              {/* Info fields */}
              <div className="space-y-2.5">
                {[
                  { Icon: Mail, label: "Email", val: selectedUser.email },
                  { Icon: Phone, label: "Phone", val: selectedUser.phone || "—" },
                  { Icon: MapPin, label: "Location", val: [selectedUser.sub_county, selectedUser.ward, selectedUser.locality].filter(Boolean).join(", ") || selectedUser.county || "—" },
                  { Icon: Calendar, label: "Joined", val: new Date(selectedUser.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
                  { Icon: Activity, label: "Status", val: selectedUser.suspended ? "Suspended" : "Active" },
                  ...(selectedUser.provider_id ? [{ Icon: Shield, label: "Provider ID", val: String(selectedUser.provider_id) }] : []),
                ].map(f => (
                  <div key={f.label} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <f.Icon className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{f.label}</p>
                      <p className="text-sm text-gray-900 font-medium">{f.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer flex gap-2">
              <button onClick={() => setSelectedUser(null)} className="btn btn-ghost flex-1">Close</button>
              <button
                onClick={() => { handleSuspend(selectedUser.id, !selectedUser.suspended); }}
                disabled={acting === selectedUser.id}
                className={`btn flex-1 ${selectedUser.suspended ? "btn-success" : "btn-danger"}`}
              >
                {acting === selectedUser.id ? "Processing..." : selectedUser.suspended ? "Unsuspend" : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}