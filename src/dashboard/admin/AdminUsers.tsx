import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import {
  getAdminCounties,
  getUsersAnalytics,
  getUsers,
  suspendUser,
  verifyProvider,
} from "../../api/admin.api";
import {
  Users,
  Search,
  ArrowLeft,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Activity,
  Eye,
  X,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  county: string | null;
  sub_county: string | null;
  suspended: boolean | null;
  created_at: string;
  provider_id?: number | null;
  verification_status?: "pending" | "verified" | "rejected" | null;
};

type County = { id: number; name: string };

type CountyUserStats = {
  county: string;
  farmers: number;
  vets: number;
  agrovets: number;
  total: number;
  highDiseaseActivity?: boolean;
};

type UsersPerCountyByRoleRow = {
  county: string | null;
  role: string;
  count: string;
};

type MonthlyRegistrationRow = {
  month: string;
  role: string;
  count: string;
};

type RoleDistributionRow = {
  role: string;
  count: string;
};

type AnalyticsResponse = {
  usersPerCountyByRole: UsersPerCountyByRoleRow[];
  monthlyRegistrations: MonthlyRegistrationRow[];
  roleDistribution: RoleDistributionRow[];
};

const ROLE_COLORS: Record<string, string> = {
  farmer: "#16a34a",
  vet: "#0ea5e9",
  agrovet: "#f97316",
};

const VERIFICATION_LABEL: Record<string, string> = {
  verified: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

const VERIFICATION_BADGE_CLASS: Record<string, string> = {
  verified: "badge-success",
  pending: "badge-warning",
  rejected: "badge-error",
};

const PAGE_LIMIT = 20;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

export default function AdminUsers() {
  const [counties, setCounties] = useState<County[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  // County drill‑down
  const [countyUsers, setCountyUsers] = useState<User[]>([]);
  const [countyTotal, setCountyTotal] = useState(0);
  const [countyPage, setCountyPage] = useState(1);
  const [countySearch, setCountySearch] = useState("");
  const [countyRole, setCountyRole] = useState<string>("all");
  const [countyVerification, setCountyVerification] = useState<string>("all");

  // Global table
  const [globalUsers, setGlobalUsers] = useState<User[]>([]);
  const [globalTotal, setGlobalTotal] = useState(0);
  const [globalPage, setGlobalPage] = useState(1);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalRole, setGlobalRole] = useState<string>("all");
  const [globalCounty, setGlobalCounty] = useState<string>("all");
  const [globalStatus, setGlobalStatus] = useState<string>("all");

  // Shared/loading
  const [acting, setActing] = useState<number | null>(null);
  const [loadingCountyTable, setLoadingCountyTable] = useState(false);
  const [loadingGlobalTable, setLoadingGlobalTable] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const { addToast } = useToast();

  // Initial fetch: counties + analytics
  useEffect(() => {
    getAdminCounties().then(setCounties).catch(() => setCounties([]));

    setLoadingAnalytics(true);
    getUsersAnalytics()
      .then(setAnalytics)
      .catch((e) =>
        addToast(
          "error",
          "Analytics error",
          e?.response?.data?.error || "Failed to load analytics"
        )
      )
      .finally(() => setLoadingAnalytics(false));
  }, [addToast]);

  // Generic fetch helper
  const fetchUsers = (
    scope: "global" | "county",
    {
      page,
      search,
      role,
      county,
      status,
    }: { page: number; search?: string; role?: string; county?: string | null; status?: string }
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_LIMIT),
    });

    if (role && role !== "all") params.set("role", role);
    if (county && county !== "all") params.set("county", county);
    if (status && status !== "all") params.set("status", status);
    if (search && search.trim()) params.set("search", search.trim());

    const setLoading = scope === "global" ? setLoadingGlobalTable : setLoadingCountyTable;
    const setUsers = scope === "global" ? setGlobalUsers : setCountyUsers;
    const setTotal = scope === "global" ? setGlobalTotal : setCountyTotal;

    setLoading(true);
    getUsers({
      page,
      limit: PAGE_LIMIT,
      role: role && role !== "all" ? role : undefined,
      county: county && county !== "all" ? county : undefined,
      status: status && status !== "all" ? status : undefined,
      search: search?.trim() || undefined,
    })
      .then((r) => {
        const rawUsers: User[] = r.users || [];
        let filtered = rawUsers;

        if (scope === "county" && countyVerification !== "all") {
          filtered = rawUsers.filter((u) => {
            const vs = u.verification_status || "pending";
            return vs === countyVerification;
          });
        }

        setUsers(filtered);
        setTotal(r.total ?? filtered.length);
      })
      .catch((e) =>
        addToast(
          "error",
          "Error",
          e?.response?.data?.error ||
            `Failed to load ${scope === "global" ? "users" : "county users"}`
        )
      )
      .finally(() => setLoading(false));
  };

  // Global table: fetch on filters/page
  useEffect(() => {
    fetchUsers("global", {
      page: globalPage,
      search: globalSearch,
      role: globalRole,
      county: globalCounty === "all" ? null : globalCounty,
      status: globalStatus,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalPage, globalRole, globalCounty, globalStatus]);

  // Global search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      if (globalPage === 1) {
        fetchUsers("global", {
          page: 1,
          search: globalSearch,
          role: globalRole,
          county: globalCounty === "all" ? null : globalCounty,
          status: globalStatus,
        });
      } else {
        setGlobalPage(1);
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSearch]);

  // County table: fetch on selection/filters/page
  useEffect(() => {
    if (!selectedCounty) return;
    fetchUsers("county", {
      page: countyPage,
      search: countySearch,
      role: countyRole,
      county: selectedCounty,
      status: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCounty, countyPage, countyRole, countyVerification]);

  // County search debounce
  useEffect(() => {
    if (!selectedCounty) return;
    const t = setTimeout(() => {
      if (countyPage === 1) {
        fetchUsers("county", {
          page: 1,
          search: countySearch,
          role: countyRole,
          county: selectedCounty,
          status: undefined,
        });
      } else {
        setCountyPage(1);
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countySearch]);

  const handleSuspend = (id: number, suspend: boolean) => {
    setActing(id);
    suspendUser(id, suspend)
      .then(() => {
        addToast(
          "success",
          suspend ? "Suspended" : "Unsuspended",
          "User status updated"
        );
        // refresh both tables
        fetchUsers("global", {
          page: globalPage,
          search: globalSearch,
          role: globalRole,
          county: globalCounty === "all" ? null : globalCounty,
          status: globalStatus,
        });
        if (selectedCounty) {
          fetchUsers("county", {
            page: countyPage,
            search: countySearch,
            role: countyRole,
            county: selectedCounty,
            status: undefined,
          });
        }
      })
      .catch((e) =>
        addToast(
          "error",
          "Error",
          e?.response?.data?.error || "Failed to update user status"
        )
      )
      .finally(() => setActing(null));
  };

  const handleApproveProvider = (u: User) => {
    if (!u.provider_id) {
      addToast(
        "error",
        "Not a provider",
        "Only vets and agrovets with provider profiles can be approved"
      );
      return;
    }
    setActing(u.id);
    verifyProvider(u.provider_id)
      .then(() => {
        addToast("success", "Approved", "Provider verification updated");
        fetchUsers("global", {
          page: globalPage,
          search: globalSearch,
          role: globalRole,
          county: globalCounty === "all" ? null : globalCounty,
          status: globalStatus,
        });
        if (selectedCounty) {
          fetchUsers("county", {
            page: countyPage,
            search: countySearch,
            role: countyRole,
            county: selectedCounty,
            status: undefined,
          });
        }
      })
      .catch((e) =>
        addToast(
          "error",
          "Approval failed",
          e?.response?.data?.error || "Failed to approve provider"
        )
      )
      .finally(() => setActing(null));
  };

  // Derived analytics
  const countyStats: CountyUserStats[] = useMemo(() => {
    if (!analytics) return [];
    const byCounty: Record<string, CountyUserStats> = {};

    analytics.usersPerCountyByRole.forEach((row) => {
      if (!row.county) return;
      const key = row.county;
      if (!byCounty[key]) {
        byCounty[key] = {
          county: key,
          farmers: 0,
          vets: 0,
          agrovets: 0,
          total: 0,
        };
      }
      const c = Number(row.count || 0);
      if (row.role === "farmer") byCounty[key].farmers += c;
      if (row.role === "vet") byCounty[key].vets += c;
      if (row.role === "agrovet") byCounty[key].agrovets += c;
      byCounty[key].total += c;
    });

    const totals = Object.values(byCounty).map((c) => c.total);
    if (totals.length) {
      const sorted = [...totals].sort((a, b) => a - b);
      const idx = Math.max(0, Math.floor(sorted.length * 0.75) - 1);
      const threshold = sorted[idx] || 0;
      Object.values(byCounty).forEach((c) => {
        c.highDiseaseActivity = c.total >= threshold && threshold > 0;
      });
    }

    return Object.values(byCounty).sort((a, b) => b.total - a.total);
  }, [analytics]);

  const barChartData = useMemo(
    () =>
      countyStats.map((c) => ({
        county: c.county,
        Farmers: c.farmers,
        Vets: c.vets,
        Agrovets: c.agrovets,
      })),
    [countyStats]
  );

  const lineChartData = useMemo(() => {
    if (!analytics) return [];
    const map: Record<string, { month: string; total: number }> = {};
    analytics.monthlyRegistrations.forEach((row) => {
      const key = row.month;
      if (!key) return;
      if (!map[key]) map[key] = { month: key, total: 0 };
      map[key].total += Number(row.count || 0);
    });
    return Object.values(map).sort((a, b) => (a.month > b.month ? 1 : -1));
  }, [analytics]);

  const pieChartData = useMemo(
    () =>
      (analytics?.roleDistribution || []).map((row) => ({
        name: row.role,
        value: Number(row.count || 0),
      })),
    [analytics]
  );

  const countyTotalPages = Math.ceil(countyTotal / PAGE_LIMIT);
  const globalTotalPages = Math.ceil(globalTotal / PAGE_LIMIT);

  const renderVerificationBadge = (u: User) => {
    const vs = u.verification_status || "pending";
    const label = VERIFICATION_LABEL[vs] || "Pending";
    const cls = VERIFICATION_BADGE_CLASS[vs] || "badge-warning";
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  const sectionCardClass =
    "card border border-gray-100 bg-white/80 dark:bg-slate-900/60 rounded-2xl shadow-sm";

  return (
    <Layout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <Users className="w-7 h-7 text-green-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Admin User Intelligence
              </h1>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mt-1 max-w-2xl">
              Monitor farmers, veterinarians, and agrovets across Kenyan counties. Drill into
              county ecosystems, approve providers, and act quickly on emerging risks.
            </p>
          </div>
        </div>

        {/* County cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              County overview
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {countyStats.length ? (
              countyStats.map((c) => {
                const isActive = selectedCounty === c.county;
                return (
                  <button
                    key={c.county}
                    onClick={() => {
                      setSelectedCounty(c.county);
                      setCountyPage(1);
                    }}
                    className={`group text-left rounded-2xl border bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${
                      isActive
                        ? "border-green-500 ring-1 ring-green-500/40"
                        : "border-gray-100 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          County
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {c.county || "Unknown"}
                        </p>
                      </div>
                      {c.highDiseaseActivity && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[11px] font-medium dark:bg-red-500/10">
                          <Activity className="w-3 h-3" />
                          High activity
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1.5">
                        <p className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                          <Users className="w-3 h-3" />
                          Farmers
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                          {c.farmers}
                        </p>
                      </div>
                      <div className="rounded-lg bg-sky-50 dark:bg-sky-500/10 px-2 py-1.5">
                        <p className="flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-300">
                          <ShieldCheck className="w-3 h-3" />
                          Vets
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-sky-900 dark:text-sky-100">
                          {c.vets}
                        </p>
                      </div>
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 px-2 py-1.5">
                        <p className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300">
                          <StorefrontIcon />
                          Agrovets
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-amber-900 dark:text-amber-100">
                          {c.agrovets}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                      <span>{c.total.toLocaleString()} users</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-green-600 group-hover:text-green-700 dark:text-green-400">
                        View drill-down
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full text-sm text-gray-500 dark:text-slate-400">
                {loadingAnalytics
                  ? "Loading county statistics..."
                  : "No county statistics available yet."}
              </div>
            )}
          </div>
        </div>

        {/* Middle: County drill-down + Global table */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* County drill-down */}
          <div className={sectionCardClass}>
            <div className="card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  County drill-down
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Click a county card to explore all users in that county.
                </p>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                {selectedCounty ? (
                  <>
                    Selected:{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedCounty}
                    </span>
                  </>
                ) : (
                  "No county selected"
                )}
              </div>
            </div>
            <div className="card-body space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search county users by name, email, phone..."
                    value={countySearch}
                    onChange={(e) => setCountySearch(e.target.value)}
                    className="input-field pl-9 text-sm"
                    disabled={!selectedCounty}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={countyRole}
                    onChange={(e) => {
                      setCountyRole(e.target.value);
                      setCountyPage(1);
                    }}
                    className="select-field w-32 text-xs"
                    disabled={!selectedCounty}
                  >
                    <option value="all">All roles</option>
                    <option value="farmer">Farmer</option>
                    <option value="vet">Vet</option>
                    <option value="agrovet">Agrovet</option>
                  </select>
                  <select
                    value={countyVerification}
                    onChange={(e) => {
                      setCountyVerification(e.target.value);
                      setCountyPage(1);
                    }}
                    className="select-field w-36 text-xs"
                    disabled={!selectedCounty}
                  >
                    <option value="all">All verification</option>
                    <option value="verified">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {!selectedCounty ? (
                  <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    Select a county card above to load detailed users.
                  </div>
                ) : loadingCountyTable ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : countyUsers.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    No users found for {selectedCounty}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700">
                        <tr className="text-xs uppercase text-gray-500 dark:text-slate-400">
                          <th className="px-4 py-2.5 text-left font-semibold">User</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Phone</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Location</th>
                          <th className="px-4 py-2.5 text-left font-semibold">
                            Verification
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {countyUsers.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors"
                          >
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-green-600 dark:bg-emerald-600 shrink-0"
                                  aria-hidden
                                >
                                  {getInitials(u.name)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {u.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
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
                            <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-slate-200">
                              {u.phone || "—"}
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-slate-200">
                              {[u.county, u.sub_county].filter(Boolean).join(", ") || "—"}
                            </td>
                            <td className="px-4 py-3 align-top">
                              {renderVerificationBadge(u)}
                            </td>
                            <td className="px-4 py-3 align-top text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setViewUser(u)}
                                  className="btn-ghost text-xs text-gray-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-emerald-400 inline-flex items-center gap-1"
                                  title="View details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                {u.role !== "farmer" && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveProvider(u)}
                                    disabled={acting === u.id}
                                    className="btn-outline text-xs py-1 px-2 border-emerald-300 text-emerald-700 hover:border-emerald-400 dark:border-emerald-500/60 dark:text-emerald-300"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleSuspend(u.id, !u.suspended)}
                                  disabled={acting === u.id}
                                  className={`btn-outline text-xs py-1 px-2 ${
                                    u.suspended
                                      ? "text-emerald-700 border-emerald-300 hover:border-emerald-400 dark:border-emerald-500/60 dark:text-emerald-300"
                                      : "text-amber-700 border-amber-300 hover:border-amber-400 dark:border-amber-500/60 dark:text-amber-300"
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

              {selectedCounty && countyTotalPages > 1 && (
                <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-slate-400">
                  <p>
                    Showing {(countyPage - 1) * PAGE_LIMIT + 1}–
                    {Math.min(countyPage * PAGE_LIMIT, countyTotal)} of {countyTotal}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setCountyPage((p) => Math.max(1, p - 1))}
                      disabled={countyPage <= 1}
                      className="btn-outline p-1.5"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setCountyPage((p) => Math.min(countyTotalPages, p + 1))}
                      disabled={countyPage >= countyTotalPages}
                      className="btn-outline p-1.5"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Global users table */}
          <div className={sectionCardClass}>
            <div className="card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  Global users
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  All non-admin users in the SmartLivestock system, across all counties.
                </p>
              </div>
            </div>
            <div className="card-body space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search all users by name, email, phone..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="input-field pl-9 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={globalRole}
                    onChange={(e) => {
                      setGlobalRole(e.target.value);
                      setGlobalPage(1);
                    }}
                    className="select-field w-28 text-xs"
                  >
                    <option value="all">All roles</option>
                    <option value="farmer">Farmer</option>
                    <option value="vet">Vet</option>
                    <option value="agrovet">Agrovet</option>
                  </select>
                  <select
                    value={globalCounty}
                    onChange={(e) => {
                      setGlobalCounty(e.target.value);
                      setGlobalPage(1);
                    }}
                    className="select-field w-32 text-xs"
                  >
                    <option value="all">All counties</option>
                    {counties.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={globalStatus}
                    onChange={(e) => {
                      setGlobalStatus(e.target.value);
                      setGlobalPage(1);
                    }}
                    className="select-field w-32 text-xs"
                  >
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                <p>
                  Bulk actions{" "}
                  <span className="text-gray-400 dark:text-slate-500">
                    (coming soon: approve / suspend)
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {loadingGlobalTable ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : globalUsers.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    No users match your filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700">
                        <tr className="text-xs uppercase text-gray-500 dark:text-slate-400">
                          <th className="px-4 py-2.5 text-left font-semibold">Name</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                          <th className="px-4 py-2.5 text-left font-semibold">County</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                          <th className="px-4 py-2.5 text-left font-semibold">
                            Registered
                          </th>
                          <th className="px-4 py-2.5 text-left font-semibold">
                            Last activity
                          </th>
                          <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {globalUsers.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors"
                          >
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-green-600 dark:bg-emerald-600 shrink-0"
                                  aria-hidden
                                >
                                  {getInitials(u.name)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {u.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-top">
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
                            <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-slate-200">
                              {u.county || "—"}
                            </td>
                            <td className="px-4 py-3 align-top">
                              {u.suspended ? (
                                <span className="badge badge-error">Suspended</span>
                              ) : (
                                <span className="badge badge-success">Active</span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-gray-700 dark:text-slate-200">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 align-top text-xs text-gray-400 dark:text-slate-500">
                              {/* last activity not yet tracked in backend */}
                              —
                            </td>
                            <td className="px-4 py-3 align-top text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setViewUser(u)}
                                  className="btn-ghost text-xs text-gray-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-emerald-400 inline-flex items-center gap-1"
                                  title="View details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                {u.role !== "farmer" && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveProvider(u)}
                                    disabled={acting === u.id}
                                    className="btn-outline text-xs py-1 px-2 border-emerald-300 text-emerald-700 hover:border-emerald-400 dark:border-emerald-500/60 dark:text-emerald-300"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleSuspend(u.id, !u.suspended)}
                                  disabled={acting === u.id}
                                  className={`btn-outline text-xs py-1 px-2 ${
                                    u.suspended
                                      ? "text-emerald-700 border-emerald-300 hover:border-emerald-400 dark:border-emerald-500/60 dark:text-emerald-300"
                                      : "text-amber-700 border-amber-300 hover:border-amber-400 dark:border-amber-500/60 dark:text-amber-300"
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

              {globalTotalPages > 1 && (
                <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-slate-400">
                  <p>
                    Showing {(globalPage - 1) * PAGE_LIMIT + 1}–
                    {Math.min(globalPage * PAGE_LIMIT, globalTotal)} of {globalTotal}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setGlobalPage((p) => Math.max(1, p - 1))}
                      disabled={globalPage <= 1}
                      className="btn-outline p-1.5"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setGlobalPage((p) => Math.min(globalTotalPages, p + 1))}
                      disabled={globalPage >= globalTotalPages}
                      className="btn-outline p-1.5"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className={sectionCardClass}>
          <div className="card-header flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                User analytics
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Understand how SmartLivestock users are distributed by county, role, and time.
              </p>
            </div>
          </div>
          <div className="card-body grid gap-6 lg:grid-cols-3">
            {/* Bar chart */}
            <div className="lg:col-span-2 h-72 rounded-xl bg-gradient-to-br from-white/60 via-white/40 to-green-50/60 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-emerald-950/40 border border-gray-100 dark:border-slate-700 p-3">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                Users per county (by role)
              </h3>
              {loadingAnalytics ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !barChartData.length ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-500 dark:text-slate-400">
                  No county analytics available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ left: -10, right: 10, top: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="county" fontSize={10} tickLine={false} />
                    <YAxis fontSize={10} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(15, 118, 110, 0.04)" }} />
                    <Legend />
                    <Bar
                      dataKey="Farmers"
                      stackId="users"
                      fill={ROLE_COLORS.farmer}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="Vets" stackId="users" fill={ROLE_COLORS.vet} />
                    <Bar dataKey="Agrovets" stackId="users" fill={ROLE_COLORS.agrovet} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Line + pie */}
            <div className="space-y-4">
              <div className="h-32 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-gray-100 dark:border-slate-700 p-2.5">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                  Monthly registrations
                </h3>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !lineChartData.length ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500 dark:text-slate-400">
                    No registration timeline available yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" fontSize={9} tickLine={false} />
                      <YAxis fontSize={9} tickLine={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="h-32 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-gray-100 dark:border-slate-700 p-2.5">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                  Role distribution
                </h3>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !pieChartData.length ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500 dark:text-slate-400">
                    No role distribution data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={40}
                        innerRadius={20}
                        paddingAngle={2}
                      >
                        {pieChartData.map((entry, index) => {
                          const color =
                            ROLE_COLORS[entry.name] ||
                            ["#16a34a", "#0ea5e9", "#f97316", "#4b5563"][index % 4];
                          return <Cell key={entry.name} fill={color} />;
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User details modal */}
      {viewUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setViewUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-details-title"
        >
          <div
            className="card border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
              <h2 id="user-details-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                User details
              </h2>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-slate-300"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="card-body space-y-4 pt-4">
              {/* Profile with initials */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold text-white bg-green-600 dark:bg-emerald-600 shrink-0"
                  aria-hidden
                >
                  {getInitials(viewUser.name)}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">{viewUser.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{viewUser.email}</p>
                  {viewUser.suspended ? (
                    <span className="badge badge-error mt-1">Suspended</span>
                  ) : (
                    <span className="badge badge-success mt-1">Active</span>
                  )}
                </div>
              </div>

              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Role</dt>
                  <dd>
                    <span
                      className={`badge ${
                        viewUser.role === "farmer"
                          ? "badge-success"
                          : viewUser.role === "vet"
                          ? "badge-info"
                          : "badge-warning"
                      }`}
                    >
                      {viewUser.role}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Phone</dt>
                  <dd className="text-gray-900 dark:text-white">{viewUser.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Location</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {[viewUser.county, viewUser.sub_county].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Verification</dt>
                  <dd>{renderVerificationBadge(viewUser)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Registered</dt>
                  <dd className="text-gray-900 dark:text-white">
                    {new Date(viewUser.created_at).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    handleSuspend(viewUser.id, !viewUser.suspended);
                    setViewUser({ ...viewUser, suspended: !viewUser.suspended });
                  }}
                  disabled={acting === viewUser.id}
                  className={`btn-outline text-sm py-2 px-3 ${
                    viewUser.suspended
                      ? "text-emerald-700 border-emerald-300 hover:border-emerald-400 dark:border-emerald-500/60 dark:text-emerald-300"
                      : "text-amber-700 border-amber-300 hover:border-amber-400 dark:border-amber-500/60 dark:text-amber-300"
                  }`}
                >
                  {viewUser.suspended ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-1.5" />
                      Activate
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 inline mr-1.5" />
                      Suspend
                    </>
                  )}
                </button>
                {viewUser.role !== "farmer" && (
                  <button
                    type="button"
                    onClick={() => handleApproveProvider(viewUser)}
                    disabled={acting === viewUser.id}
                    className="btn-outline text-sm py-2 px-3 border-emerald-300 text-emerald-700 hover:border-emerald-400 dark:border-emerald-500/60 dark:text-emerald-300"
                  >
                    <ShieldCheck className="w-4 h-4 inline mr-1.5" />
                    Approve provider
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewUser(null)}
                  className="btn-ghost text-sm py-2 px-3 ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Simple inline icon for agrovets
function StorefrontIcon() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9h18l-1 11H4L3 9Z" />
      <path d="M4 9 6 4h12l2 5" />
      <path d="M9 13h6" />
    </svg>
  );
}