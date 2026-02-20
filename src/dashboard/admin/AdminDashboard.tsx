import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import StatsCard from "../../components/StartsCard";
import {
  Users,
  PawPrint,
  Stethoscope,
  ShoppingBag,
  Calendar,
  Activity,
  AlertTriangle,
  Shield,
  FileText,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api/admin.api";
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e?.response?.data?.error || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="admin">
        <div className="card p-8 text-center text-red-600">{error}</div>
      </Layout>
    );
  }

  const roleData = stats
    ? [
        { name: "Farmers", value: stats.users.farmers, color: COLORS[0] },
        { name: "Vets", value: stats.users.vets, color: COLORS[1] },
        { name: "Agrovets", value: stats.users.agrovets, color: COLORS[2] },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System governance and national livestock monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/providers"
              className="btn-primary flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Pending Approvals
              {stats?.providers?.pending ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.providers.pending}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Users"
            value={stats?.users?.total ?? 0}
            icon={Users}
          />
          <StatsCard
            title="Farmers"
            value={stats?.users?.farmers ?? 0}
            icon={PawPrint}
          />
          <StatsCard
            title="Vets"
            value={stats?.users?.vets ?? 0}
            icon={Stethoscope}
          />
          <StatsCard
            title="Agrovets"
            value={stats?.users?.agrovets ?? 0}
            icon={ShoppingBag}
          />
          <StatsCard
            title="Total Providers"
            value={stats?.providers?.total ?? 0}
            icon={Shield}
          />
          <StatsCard
            title="Pending Verification"
            value={stats?.providers?.pending ?? 0}
            icon={AlertTriangle}
          />
          <StatsCard
            title="Appointments"
            value={stats?.appointments ?? 0}
            icon={Calendar}
          />
          <StatsCard
            title="Symptom Reports"
            value={stats?.symptomReports ?? 0}
            icon={Activity}
          />
          <StatsCard
            title="Animals"
            value={stats?.animals ?? 0}
            icon={PawPrint}
          />
          {typeof stats?.licensesExpiringSoon === "number" && (
            <Link to="/admin/providers" className="contents">
              <div className="card p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Licenses Expiring Soon</p>
                    <h2 className="text-3xl font-bold text-gray-900">{stats.licensesExpiringSoon}</h2>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-amber-600">Within 30 days</p>
              </div>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Users by Role</h2>
            </div>
            <div className="card-body h-64">
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {roleData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No data</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Users by County (Top 10)</h2>
            </div>
            <div className="card-body h-64">
              {stats?.usersByCounty?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.usersByCounty.slice(0, 10).map((c) => ({ name: c.county || "Unknown", count: Number(c.count) }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No data</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="card p-6 hover:shadow-lg hover:border-green-200 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-green-50 rounded-xl">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-500">View, suspend, manage roles</p>
            </div>
          </Link>
          <Link
            to="/admin/providers"
            className="card p-6 hover:shadow-lg hover:border-green-200 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-blue-50 rounded-xl">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Provider Approvals</h3>
              <p className="text-sm text-gray-500">Verify vets & agrovets</p>
            </div>
          </Link>
          <Link
            to="/admin/analytics"
            className="card p-6 hover:shadow-lg hover:border-green-200 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-purple-50 rounded-xl">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Disease Analytics</h3>
              <p className="text-sm text-gray-500">Surveillance by county</p>
            </div>
          </Link>
          <Link
            to="/admin/audit-logs"
            className="card p-6 hover:shadow-lg hover:border-green-200 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-amber-50 rounded-xl">
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Audit Logs</h3>
              <p className="text-sm text-gray-500">Admin action history</p>
            </div>
          </Link>
          <Link
            to="/admin/staff"
            className="card p-6 hover:shadow-lg hover:border-green-200 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-teal-50 rounded-xl">
              <Users className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Staff Management</h3>
              <p className="text-sm text-gray-500">Create sub-admins, secretaries, chairmen</p>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
