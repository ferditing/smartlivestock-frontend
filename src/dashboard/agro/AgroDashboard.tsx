// AgroDashboard.tsx – Premium Redesign (SmartLivestock Design System)
// All original API calls, stats, charts and logic unchanged.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Package, TrendingUp, Users, DollarSign, Loader2, MapPin, Store,
  ClipboardList, ArrowRight, AlertTriangle, BarChart3, Settings, ShieldCheck,
} from "lucide-react";
import StatsCard from "../../components/StartsCard";
import { getAgroStats, getSellerOrders, fetchMyProducts, type AgroStats } from "../../api/agro.api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

function formatKes(n: number) {
  return `KES ${Number(n).toLocaleString("en-KE", { maximumFractionDigits:0 })}`;
}

const STATUS_COLORS: Record<string, string> = {
  pending:"#f59e0b", processing:"#3b82f6", shipped:"#8b5cf6",
  delivered:"#22c55e", cancelled:"#ef4444",
};

export default function AgroDashboard() {
  const [stats,                     setStats]                     = useState<AgroStats | null>(null);
  const [recentOrders,              setRecentOrders]              = useState<{id:number;status:string;created_at:string}[]>([]);
  const [lowStockCount,             setLowStockCount]             = useState(0);
  const [verificationRequestedCount,setVerificationRequestedCount]= useState(0);
  const [verifiedCount,             setVerifiedCount]             = useState(0);
  const [loading,                   setLoading]                   = useState(true);

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
            (ordersData as any[]).slice(0, 5).map(o => ({ id:o.id, status:o.status, created_at:o.created_at }))
          );
          const low = (productsData as any[]).filter(p => p.quantity != null && p.quantity < 5 && p.quantity > 0).length;
          const out = (productsData as any[]).filter(p => p.quantity != null && p.quantity === 0).length;
          setLowStockCount(low + out);
          setVerificationRequestedCount((productsData as any[]).filter(p => Boolean(p.vet_verification_requested)).length);
          setVerifiedCount((productsData as any[]).filter(p => Boolean(p.vet_verified)).length);
        }
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const shopInfo      = stats?.shopInfo;
  const revenueByMonth = stats?.revenueByMonth || [];
  const ordersByStatus = stats?.ordersByStatus || [];
  const chartData = revenueByMonth.map(r => ({
    name: new Date(r.month + "-01").toLocaleDateString("en-GB", { month:"short", year:"2-digit" }),
    revenue: r.revenue,
  }));
  const pieData = ordersByStatus.filter(s => s.count > 0).map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count, status: s.status,
  }));

  return (
    <Layout role="agrovet">
      <div className="space-y-6 animate-fadeInUp">

        {/* ── Hero banner ── */}
        <div className="card overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-800 p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-black uppercase tracking-widest">Agrovet Dashboard</p>
                  <h1 className="text-2xl md:text-3xl font-black sora tracking-tight">
                    {shopInfo?.shopName || "Your Agrovet"}
                  </h1>
                  {shopInfo?.county && (
                    <p className="text-green-100 flex items-center gap-1.5 mt-1 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {shopInfo.county}{shopInfo.subCounty ? `, ${shopInfo.subCounty}` : ""}
                    </p>
                  )}
                  {(!shopInfo?.county || !shopInfo?.subCounty) && (
                    <p className="text-green-300 text-xs mt-1">Set location in Profile</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/agrovet/products"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl font-semibold text-sm transition-colors">
                  <Package className="w-4 h-4" /> Manage Products
                </Link>
                <Link to="/agrovet/orders"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl font-semibold text-sm transition-colors">
                  <ClipboardList className="w-4 h-4" /> Orders & Receipts
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Low stock alert ── */}
        {!loading && lowStockCount > 0 && (
          <div className="card overflow-hidden border border-amber-200 bg-amber-50/80">
            <div className="card-body py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800">
                    {lowStockCount} product{lowStockCount !== 1 ? "s" : ""} low or out of stock
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">Update stock in Product Catalog to avoid missed orders.</p>
                </div>
                <Link to="/agrovet/products"
                  className="btn btn-outline btn-sm border-amber-300 text-amber-800 hover:bg-amber-100 flex-shrink-0">
                  Update stock
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Trust / verification strip ── */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card overflow-hidden border border-emerald-100 bg-emerald-50/40">
              <div className="card-body py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Vet Verified</p>
                  <p className="text-2xl font-black sora text-emerald-900 tabular-nums">{verifiedCount}</p>
                </div>
                <Link to="/agrovet/products" className="btn btn-outline btn-xs border-emerald-200 text-emerald-700 flex-shrink-0">View</Link>
              </div>
            </div>
            <div className="card overflow-hidden border border-amber-100 bg-amber-50/40">
              <div className="card-body py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Verify</p>
                  <p className="text-2xl font-black sora text-amber-900 tabular-nums">{verificationRequestedCount}</p>
                </div>
                <Link to="/agrovet/products" className="btn btn-outline btn-xs border-amber-200 text-amber-700 flex-shrink-0">Manage</Link>
              </div>
            </div>
            <div className="card overflow-hidden border border-gray-100 bg-white/80">
              <div className="card-body py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Settings</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-snug">Business profile & preferences</p>
                </div>
                <Link to="/agrovet/profile" className="btn btn-outline btn-xs flex-shrink-0">Settings</Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats cards ── */}
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Products" value={stats?.productCount ?? 0}     icon={Package}   />
              <StatsCard title="Total Revenue"  value={stats ? formatKes(stats.totalRevenue) : "KES 0"} icon={DollarSign} />
              <StatsCard title="Customers"      value={stats?.customerCount ?? 0}    icon={Users}     />
              <StatsCard title="Orders (Month)" value={stats?.ordersThisMonth ?? 0}  icon={TrendingUp} />
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card overflow-hidden">
                <div className="card-header">
                  <div className="card-icon-header">
                    <div className="card-icon-wrap card-icon-green">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 sora text-sm">Revenue (last 6 months)</h3>
                  </div>
                </div>
                <div className="card-body pt-0 h-64">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" />
                        <XAxis dataKey="name" tick={{ fontSize:11 }} />
                        <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize:11 }} />
                        <Tooltip formatter={(v: number) => [formatKes(v),"Revenue"]} labelFormatter={l=>`Month: ${l}`} />
                        <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No revenue data yet</div>
                  )}
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="card-header">
                  <h3 className="font-bold text-gray-900 sora text-sm">Orders by Status</h3>
                </div>
                <div className="card-body pt-0 h-64">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                          paddingAngle={2} dataKey="value" nameKey="name"
                          label={({ name, percent }) => `${name} ${((percent||0)*100).toFixed(0)}%`}>
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val:any) => [typeof val==="number"?val:0,"Orders"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No orders yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Recent orders + quick actions ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card overflow-hidden">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 sora text-sm">Recent Orders</h3>
                    <Link to="/agrovet/orders"
                      className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
                <div className="card-body pt-0">
                  {recentOrders.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center gap-2">
                      <Package className="w-8 h-8 text-gray-200" />
                      <p className="text-xs text-gray-400">No orders yet. Orders will appear here.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {recentOrders.map(o => (
                        <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ClipboardList className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">Order #{o.id}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}</p>
                            <span className="text-[10px] font-black capitalize text-gray-500">{o.status}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="card-header">
                  <h3 className="font-bold text-gray-900 sora text-sm">Quick Actions</h3>
                </div>
                <div className="card-body pt-0 grid grid-cols-2 gap-3">
                  <Link to="/agrovet/products"
                    className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all group">
                    <div className="w-9 h-9 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center transition">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-800">Products</span>
                    <span className="text-[10px] text-gray-400">Add or edit catalog</span>
                  </Link>
                  <Link to="/agrovet/orders"
                    className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                    <div className="w-9 h-9 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-800">Orders</span>
                    <span className="text-[10px] text-gray-400">Manage & receipts</span>
                  </Link>
                  <Link to="/agrovet/profile"
                    className="col-span-2 flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50/70 transition-all group">
                    <div className="w-9 h-9 bg-gray-100 group-hover:bg-gray-200 rounded-xl flex items-center justify-center transition flex-shrink-0">
                      <Store className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800">Business Profile & Location</span>
                      <p className="text-[10px] text-gray-400">Update shop info & county</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
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