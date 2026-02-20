// AgroDashboard.tsx – Professional agrovet dashboard (no Add Product; use Product Catalog)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  MapPin,
  Store,
  ClipboardList,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  Settings,
  ShieldCheck,
} from "lucide-react";
import StatsCard from "../../components/StartsCard";
import { getAgroStats, getSellerOrders, fetchMyProducts, type AgroStats } from "../../api/agro.api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function formatKes(n: number) {
  return `KES ${Number(n).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

export default function AgroDashboard() {
  const [stats, setStats] = useState<AgroStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<{ id: number; status: string; created_at: string }[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [verificationRequestedCount, setVerificationRequestedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsData, ordersData, productsData] = await Promise.all([
          getAgroStats(),
          getSellerOrders().catch(() => []),
          fetchMyProducts().catch(() => []),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setRecentOrders(
            (ordersData as { id: number; status: string; created_at: string }[])
              .slice(0, 5)
              .map((o) => ({ id: o.id, status: o.status, created_at: o.created_at }))
          );
          const low = (productsData as { quantity?: number }[]).filter(
            (p) => p.quantity != null && p.quantity < 5 && p.quantity > 0
          ).length;
          const out = (productsData as { quantity?: number }[]).filter(
            (p) => p.quantity != null && p.quantity === 0
          ).length;
          setLowStockCount(low + out);

          const requested = (productsData as { vet_verification_requested?: boolean }[]).filter(
            (p) => Boolean(p.vet_verification_requested)
          ).length;
          const verified = (productsData as { vet_verified?: boolean }[]).filter(
            (p) => Boolean(p.vet_verified)
          ).length;
          setVerificationRequestedCount(requested);
          setVerifiedCount(verified);
        }
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const shopInfo = stats?.shopInfo;
  const revenueByMonth = stats?.revenueByMonth || [];
  const ordersByStatus = stats?.ordersByStatus || [];
  const chartData = revenueByMonth.map((r) => ({
    name: new Date(r.month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
    revenue: r.revenue,
  }));
  const pieData = ordersByStatus
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
      value: s.count,
      status: s.status,
    }));

  return (
    <Layout role="agrovet">
      <div className="space-y-6">
        {/* Shop identity & location */}
        <div className="card overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 shadow-inner">
                  <Store className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {shopInfo?.shopName || "Agrovet Dashboard"}
                  </h1>
                  <p className="text-green-100 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {shopInfo?.county && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {shopInfo.county}
                        {shopInfo.subCounty ? `, ${shopInfo.subCounty}` : ""}
                      </span>
                    )}
                    {(!shopInfo?.county || !shopInfo?.subCounty) && (
                      <span className="text-green-200">Set location in Profile</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/agrovet/products"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Manage Products
                </Link>
                <Link
                  to="/agrovet/orders"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
                >
                  <ClipboardList className="w-4 h-4" />
                  Orders & Receipts
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Low stock alert */}
        {!loading && lowStockCount > 0 && (
          <div className="card border-amber-200 bg-amber-50/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-800">
                  {lowStockCount} product{lowStockCount !== 1 ? "s" : ""} low or out of stock
                </p>
                <p className="text-sm text-amber-700">Update stock in Product Catalog to avoid missed orders.</p>
              </div>
              <Link to="/agrovet/products" className="btn-outline border-amber-300 text-amber-800 hover:bg-amber-100">
                Update stock
              </Link>
            </div>
          </div>
        )}

        {/* Trust / vet verification summary */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card border border-emerald-100 bg-emerald-50/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-700">Vet verified products</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">{verifiedCount}</p>
                </div>
                <Link to="/agrovet/products" className="btn-outline border-emerald-200 text-emerald-800 hover:bg-emerald-100">
                  View
                </Link>
              </div>
            </div>
            <div className="card border border-amber-100 bg-amber-50/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-700">Verification requests</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">{verificationRequestedCount}</p>
                </div>
                <Link to="/agrovet/products" className="btn-outline border-amber-200 text-amber-800 hover:bg-amber-100">
                  Manage
                </Link>
              </div>
            </div>
            <div className="card border border-gray-100 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Store settings</p>
                  <p className="text-sm text-gray-700 mt-1">Business profile, location & preferences</p>
                </div>
                <Link to="/agrovet/profile" className="btn-outline">
                  Settings
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Products"
                value={stats?.productCount ?? 0}
                icon={Package}
              />
              <StatsCard
                title="Total Revenue"
                value={stats ? formatKes(stats.totalRevenue) : "KES 0"}
                icon={DollarSign}
              />
              <StatsCard
                title="Customers"
                value={stats?.customerCount ?? 0}
                icon={Users}
              />
              <StatsCard
                title="Orders This Month"
                value={stats?.ordersThisMonth ?? 0}
                icon={TrendingUp}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Revenue (last 6 months)</h3>
                </div>
                <div className="h-64">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(v) => `KES ${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number | undefined) =>
                            value != null ? [formatKes(value), "Revenue"] : ["—", "Revenue"]
                          }
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#22c55e"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No revenue data yet
                    </div>
                  )}
                </div>
              </div>
              <div className="card shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by status</h3>
                <div className="h-64">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name} ${percent != null ? (percent * 100).toFixed(0) : 0}%`
                          }
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: unknown) => {
                            const v = typeof val === "number" ? val : 0;
                            return [v, "Orders"];
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No orders yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent orders & quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent orders</h3>
                  <Link
                    to="/agrovet/orders"
                    className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                {recentOrders.length === 0 ? (
                  <p className="text-gray-500 text-sm">No orders yet. Orders will appear here.</p>
                ) : (
                  <ul className="space-y-2">
                    {recentOrders.map((o) => (
                      <li
                        key={o.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-900">Order #{o.id}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(o.created_at).toLocaleDateString()} ·{" "}
                          <span className="capitalize">{o.status}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="card shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/agrovet/products"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">Add / Edit products</span>
                  </Link>
                  <Link
                    to="/agrovet/orders"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">Orders & receipts</span>
                  </Link>
                  <Link
                    to="/agrovet/profile"
                    className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all col-span-2"
                  >
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Store className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-900">Business profile & location</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
