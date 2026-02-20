import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import StatsCard from "../../components/StartsCard";
import {
  Users,
  PawPrint,
  ShoppingBag,
  Calendar,
  Activity,
  AlertTriangle,
  Shield,
  ShieldCheck,
  MapPin,
  FileText,
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

export default function SubAdminDashboard() {
  const [stats, setStats] = useState<SubAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/subadmin/stats")
      .then((r) => setStats(r.data))
      .catch((e) => setError(e?.response?.data?.error || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout role="subadmin">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="subadmin">
        <div className="card p-8 text-center text-red-600">{error}</div>
      </Layout>
    );
  }

  const county = stats?.county || "Your county";

  return (
    <Layout role="subadmin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {county}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              County Dashboard
            </h1>
            <p className="text-gray-600 dark:text-slate-300 mt-1">
              Manage livestock activity, users, and providers for {county}
            </p>
          </div>
          <Link
            to="/subadmin/users"
            className="btn-primary flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            View users
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Farmers" value={stats?.users?.farmers ?? 0} icon={PawPrint} />
          <StatsCard title="Agrovets" value={stats?.users?.agrovets ?? 0} icon={ShoppingBag} />
          <StatsCard title="Verified Vets" value={stats?.verifiedVets ?? 0} icon={ShieldCheck} />
          <StatsCard title="Verified Agrovets" value={stats?.verifiedAgrovets ?? 0} icon={ShieldCheck} />
          <StatsCard title="Total Users" value={stats?.users?.total ?? 0} icon={Users} />
          <StatsCard title="Providers" value={stats?.providers?.total ?? 0} icon={Shield} />
          <StatsCard title="Pending Verification" value={stats?.providers?.pending ?? 0} icon={AlertTriangle} />
          <StatsCard title="Appointments" value={stats?.appointments ?? 0} icon={Calendar} />
          <StatsCard title="Symptom Reports" value={stats?.symptomReports ?? 0} icon={Activity} />
          <StatsCard title="Animals" value={stats?.animals ?? 0} icon={PawPrint} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/subadmin/users"
            className="card p-6 hover:shadow-lg hover:border-green-200 dark:hover:border-emerald-500/40 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-green-50 dark:bg-emerald-500/20 rounded-xl">
              <Users className="w-8 h-8 text-green-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">User Management</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                View, suspend, and manage farmers, vets, and agrovets
              </p>
            </div>
          </Link>
          <Link
            to="/subadmin/analytics"
            className="card p-6 hover:shadow-lg hover:border-green-200 dark:hover:border-emerald-500/40 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-sky-50 dark:bg-sky-500/20 rounded-xl">
              <FileText className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">County Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Symptom reports and diagnosis distribution for your county
              </p>
            </div>
          </Link>
          <Link
            to="/subadmin/providers"
            className="card p-6 hover:shadow-lg hover:border-green-200 dark:hover:border-emerald-500/40 transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-amber-50 dark:bg-amber-500/20 rounded-xl">
              <Shield className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Provider Approvals</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Verify vets and agrovets in your county
              </p>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
