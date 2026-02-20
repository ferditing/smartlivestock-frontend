import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import {
  getSubadminUsers,
  getSubadminSubcountyBreakdown,
  suspendSubadminUser,
} from "../../api/subadmin.api";
import {
  Users,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  MapPin,
  PawPrint,
  Stethoscope,
  ShoppingBag,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Calendar,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  county: string | null;
  sub_county: string | null;
  ward: string | null;
  locality: string | null;
  suspended: boolean | null;
  created_at: string;
  provider_id?: number | null;
  verification_status?: string | null;
};

type SubCountyBreakdown = {
  sub_county: string;
  total: number;
  farmers: number;
  vets: number;
  agrovets: number;
  wards: {
    ward: string;
    total: number;
    farmers: number;
    vets: number;
    agrovets: number;
  }[];
};

const COLORS = ["#16a34a", "#2563eb", "#d97706"];
const PAGE_LIMIT = 20;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

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
      .then((r) => setBreakdown(r.breakdown || []))
      .catch(() => addToast("error", "Error", "Failed to load sub-county breakdown"))
      .finally(() => setBreakdownLoading(false));
  }, [addToast]);

  useEffect(() => {
    setLoading(true);
    const params: any = {
      page: String(page),
      limit: String(PAGE_LIMIT),
    };
    if (role !== "all") params.role = role;
    if (status !== "all") params.status = status;
    if (search.trim()) params.search = search.trim();
    if (selectedSubCounty) params.sub_county = selectedSubCounty;

    getSubadminUsers(params)
      .then((r) => {
        setUsers(r.users || []);
        setTotal(r.total ?? 0);
      })
      .catch(() => {
        setUsers([]);
        setTotal(0);
        addToast("error", "Error", "Failed to load users");
      })
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
          .then((r) => {
            setUsers(r.users || []);
            setTotal(r.total ?? 0);
          })
          .finally(() => setLoading(false));
      } else setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search, selectedSubCounty]);

  const handleSuspend = (id: number, suspend: boolean) => {
    setActing(id);
    suspendSubadminUser(id, suspend)
      .then(() => {
        addToast("success", suspend ? "Suspended" : "Unsuspended", "User status updated");
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, suspended: suspend } : u)));
        if (selectedUser?.id === id) {
          setSelectedUser({ ...selectedUser, suspended: suspend });
        }
      })
      .catch((e) => addToast("error", "Error", (e as any)?.response?.data?.error || "Failed to update"))
      .finally(() => setActing(null));
  };

  const farmers = useMemo(() => users.filter((u) => u.role === "farmer"), [users]);
  const vets = useMemo(() => users.filter((u) => u.role === "vet"), [users]);
  const agrovets = useMemo(() => users.filter((u) => u.role === "agrovet"), [users]);

  const roleDistributionData = useMemo(
    () => [
      { name: "Farmers", value: farmers.length, color: COLORS[0] },
      { name: "Vets", value: vets.length, color: COLORS[1] },
      { name: "Agrovets", value: agrovets.length, color: COLORS[2] },
    ],
    [farmers.length, vets.length, agrovets.length]
  );

  const subCountyBarData = useMemo(
    () =>
      breakdown.map((sc) => ({
        name: sc.sub_county || "Unknown",
        Farmers: sc.farmers,
        Vets: sc.vets,
        Agrovets: sc.agrovets,
        Total: sc.total,
      })),
    [breakdown]
  );

  const monthlyRegistrations = useMemo(() => {
    const months: Record<string, { farmers: number; vets: number; agrovets: number }> = {};
    users.forEach((u) => {
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

  const statusHistogramData = useMemo(() => {
    const active = users.filter((u) => !u.suspended).length;
    const suspended = users.filter((u) => u.suspended).length;
    return [
      { status: "Active", count: active },
      { status: "Suspended", count: suspended },
    ];
  }, [users]);

  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const displayUsers = role === "all" ? users : role === "farmer" ? farmers : role === "vet" ? vets : agrovets;

  return (
    <Layout role="subadmin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to="/subadmin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-green-600" />
              County users
            </h1>
            <p className="text-gray-600 dark:text-slate-300 mt-1">
              Manage farmers, vets, and agrovets in your county
            </p>
            {selectedSubCounty && (
              <button
                onClick={() => {
                  setSelectedSubCounty(null);
                  setPage(1);
                }}
                className="mt-2 text-sm text-green-600 hover:text-green-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear sub-county filter
              </button>
            )}
          </div>
        </div>

        {/* Sub-county breakdown cards */}
        {!breakdownLoading && breakdown.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {breakdown.map((sc) => (
              <div
                key={sc.sub_county}
                onClick={() => {
                  setSelectedSubCounty(selectedSubCounty === sc.sub_county ? null : sc.sub_county);
                  setPage(1);
                }}
                className={`card cursor-pointer transition-all hover:shadow-lg ${
                  selectedSubCounty === sc.sub_county
                    ? "ring-2 ring-green-500 bg-green-50/50 dark:bg-emerald-950/20"
                    : "hover:border-green-200 dark:hover:border-emerald-500/40"
                }`}
              >
                <div className="card-header flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600 dark:text-emerald-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{sc.sub_county}</h3>
                  </div>
                  <span className="badge badge-success">{sc.total} users</span>
                </div>
                <div className="card-body space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <PawPrint className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600 dark:text-slate-300">Farmers</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{sc.farmers}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600 dark:text-slate-300">Vets</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{sc.vets}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      <span className="text-gray-600 dark:text-slate-300">Agrovets</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{sc.agrovets}</span>
                  </div>
                  {sc.wards.length > 0 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Wards:</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {sc.wards.map((w) => (
                          <div key={w.ward} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-slate-300">{w.ward}</span>
                            <span className="text-gray-500 dark:text-slate-400">{w.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        {users.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Distribution Pie Chart */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Role Distribution</h3>
              </div>
              <div className="card-body h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {roleDistributionData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sub-county Bar Chart */}
            {breakdown.length > 0 && (
              <div className="card">
                <div className="card-header flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Users by Sub-county</h3>
                </div>
                <div className="card-body h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subCountyBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Farmers" fill={COLORS[0]} />
                      <Bar dataKey="Vets" fill={COLORS[1]} />
                      <Bar dataKey="Agrovets" fill={COLORS[2]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Monthly Registrations Line Chart */}
            {monthlyRegistrations.length > 0 && (
              <div className="card">
                <div className="card-header flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Registrations</h3>
                </div>
                <div className="card-body h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRegistrations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="farmers" stroke={COLORS[0]} name="Farmers" />
                      <Line type="monotone" dataKey="vets" stroke={COLORS[1]} name="Vets" />
                      <Line type="monotone" dataKey="agrovets" stroke={COLORS[2]} name="Agrovets" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Status Histogram */}
            <div className="card">
              <div className="card-header flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Account Status</h3>
              </div>
              <div className="card-body h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusHistogramData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="status" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Role Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 w-full"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="select-field w-32"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
            {[
              { id: "all", label: "All Users", count: users.length },
              { id: "farmer", label: "Farmers", count: farmers.length },
              { id: "vet", label: "Vets", count: vets.length },
              { id: "agrovet", label: "Agrovets", count: agrovets.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRole(tab.id);
                  setPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  role === tab.id
                    ? "border-green-600 text-green-600 dark:text-emerald-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="py-10 text-center text-gray-500 dark:text-slate-400">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60">
                  <tr className="text-xs uppercase text-gray-500 dark:text-slate-400">
                    <th className="px-4 py-2.5 text-left font-semibold">User</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Location</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {displayUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-600 dark:bg-emerald-600 flex items-center justify-center text-sm font-semibold text-white">
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`badge ${
                            u.role === "farmer"
                              ? "badge-success"
                              : u.role === "vet"
                              ? "badge-info"
                              : "badge-warning"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 dark:text-slate-200">
                        {[u.sub_county, u.ward].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {u.suspended ? (
                          <span className="badge badge-error">Suspended</span>
                        ) : (
                          <span className="badge badge-success">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="btn-ghost p-1.5 text-gray-600 hover:text-green-600 dark:text-slate-400 dark:hover:text-emerald-400"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSuspend(u.id, !u.suspended)}
                            disabled={acting === u.id}
                            className={`btn-outline text-xs py-1 px-2 ${
                              u.suspended
                                ? "text-emerald-700 border-emerald-300 dark:border-emerald-500/60 dark:text-emerald-300"
                                : "text-amber-700 border-amber-300 dark:border-amber-500/60 dark:text-amber-300"
                            }`}
                          >
                            {u.suspended ? "Unsuspend" : "Suspend"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
            <p>
              Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-outline p-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn-outline p-1.5"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="card border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h2>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-600 dark:bg-emerald-600 flex items-center justify-center text-xl font-semibold text-white">
                    {getInitials(selectedUser.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                    <span
                      className={`badge mt-1 ${
                        selectedUser.role === "farmer"
                          ? "badge-success"
                          : selectedUser.role === "vet"
                          ? "badge-info"
                          : "badge-warning"
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <dl className="grid gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-slate-400">Email</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</dd>
                    </div>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-slate-400">Phone</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{selectedUser.phone}</dd>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-slate-400">Location</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {[
                          selectedUser.county,
                          selectedUser.sub_county,
                          selectedUser.ward,
                          selectedUser.locality,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-slate-400">Joined</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedUser.created_at).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-slate-400">Status</dt>
                      <dd>
                        {selectedUser.suspended ? (
                          <span className="badge badge-error">Suspended</span>
                        ) : (
                          <span className="badge badge-success">Active</span>
                        )}
                      </dd>
                    </div>
                  </div>
                  {selectedUser.provider_id && (
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-slate-400">Verification Status</dt>
                        <dd>
                          <span
                            className={`badge ${
                              selectedUser.verification_status === "verified"
                                ? "badge-success"
                                : selectedUser.verification_status === "rejected"
                                ? "badge-error"
                                : "badge-warning"
                            }`}
                          >
                            {selectedUser.verification_status || "Pending"}
                          </span>
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>

                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSuspend(selectedUser.id, !selectedUser.suspended)}
                    disabled={acting === selectedUser.id}
                    className={`btn-outline flex-1 ${
                      selectedUser.suspended
                        ? "text-emerald-700 border-emerald-300 dark:border-emerald-500/60 dark:text-emerald-300"
                        : "text-amber-700 border-amber-300 dark:border-amber-500/60 dark:text-amber-300"
                    }`}
                  >
                    {selectedUser.suspended ? "Unsuspend User" : "Suspend User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="btn-ghost"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
