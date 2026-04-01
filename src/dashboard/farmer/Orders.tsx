// Orders.tsx – Premium Redesign (SmartLivestock Design System)
// All original API calls, state and logic unchanged.

import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  getOrders, verifyPaystackPayment, reinitializePaystackPaymentForOrder, type Order,
} from "../../api/marketplace.api";
import { serverBaseUrl } from "../../api/axios";
import {
  Package, Loader2, CheckCircle, Clock, XCircle, X,
  Eye, Search, RefreshCcw, CreditCard, ExternalLink,
  ShoppingBag,
} from "lucide-react";

/* ── Status config ───────────────────────────────────────────── */
const STATUS_CFG: Record<string, { badge:string; border:string; icon:React.ReactNode }> = {
  completed: { badge:"bg-green-100 text-green-800", border:"border-l-green-500",  icon:<CheckCircle className="w-4 h-4 text-green-600" /> },
  pending:   { badge:"bg-amber-100 text-amber-800", border:"border-l-amber-400",  icon:<Clock className="w-4 h-4 text-amber-600" /> },
  cancelled: { badge:"bg-red-100 text-red-800",     border:"border-l-red-400",    icon:<XCircle className="w-4 h-4 text-red-600" /> },
};
const getCfg = (s: string) => STATUS_CFG[s] || { badge:"bg-gray-100 text-gray-700", border:"border-l-gray-300", icon:<Clock className="w-4 h-4 text-gray-400"/> };

export default function Orders() {
  const { addToast } = useToast();
  const [orders,                setOrders]                = useState<Order[]>([]);
  const [loading,               setLoading]               = useState(true);
  const [selectedOrder,         setSelectedOrder]         = useState<Order | null>(null);
  const [query,                 setQuery]                 = useState("");
  const [statusFilter,          setStatusFilter]          = useState<"all"|"pending"|"completed"|"cancelled">("all");
  const [verifyingPayment,      setVerifyingPayment]      = useState(false);
  const [reinitializingPayment, setReinitializingPayment] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try { const data = await getOrders(); setOrders(data); }
    catch { addToast("error", "Error", "Failed to load orders"); }
    finally { setLoading(false); }
  };

  const refreshOrdersAndSelection = async (selectedId?: number) => {
    const data = await getOrders(); setOrders(data);
    if (selectedId != null) setSelectedOrder(data.find(o => o.id === selectedId) || null);
  };

  const handleVerifyPaystack = async (order: Order) => {
    if (!order.payment_ref) { addToast("error", "Missing ref", "No Paystack reference found."); return; }
    setVerifyingPayment(true);
    try {
      await verifyPaystackPayment(order.payment_ref);
      addToast("success", "Verified", "Payment verified. Refreshing status…");
      await refreshOrdersAndSelection(order.id);
    } catch (err: any) {
      addToast("error", "Failed", err?.response?.data?.error || "Unable to verify payment");
    } finally { setVerifyingPayment(false); }
  };

  const handlePayAgain = async (order: Order) => {
    setReinitializingPayment(true);
    try {
      const res = await reinitializePaystackPaymentForOrder(order.id);
      const url = res?.authorization_url || res?.data?.authorization_url || res?.data?.authorizationUrl
        || res?.authorizationUrl || res?.payment_url || res?.data?.payment_url;
      if (!url) throw new Error("Missing authorization URL");
      window.location.href = url;
    } catch (err: any) {
      addToast("error", "Failed", err?.response?.data?.error || "Unable to re-initialize payment");
    } finally { setReinitializingPayment(false); }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return String(order.id).includes(q)
      || (order.status || "").toLowerCase().includes(q)
      || (order.items || []).some(i => (i.name || "").toLowerCase().includes(q));
  });

  const pendingCount   = orders.filter(o => o.status === "pending").length;
  const completedCount = orders.filter(o => o.status === "completed").length;
  const cancelledCount = orders.filter(o => o.status === "cancelled").length;

  return (
    <Layout role="farmer">
      <div className="space-y-6 animate-fadeInUp">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">My Orders</h1>
            <p className="page-sub">Track and manage your purchases</p>
          </div>
          <button onClick={loadOrders} disabled={loading}
            className="btn btn-outline btn-md flex items-center gap-2 self-start">
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* ── Stat strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"Total Orders",   val:orders.length,   color:"text-gray-900",   iconBg:"bg-gray-100",   icon:<ShoppingBag className="w-5 h-5 text-gray-600"/> },
            { label:"Pending",        val:pendingCount,    color:"text-amber-700",  iconBg:"bg-amber-100",  icon:<Clock className="w-5 h-5 text-amber-600"/> },
            { label:"Completed",      val:completedCount,  color:"text-green-700",  iconBg:"bg-green-100",  icon:<CheckCircle className="w-5 h-5 text-green-600"/> },
            { label:"Cancelled",      val:cancelledCount,  color:"text-red-700",    iconBg:"bg-red-100",    icon:<XCircle className="w-5 h-5 text-red-600"/> },
          ].map(s => (
            <div key={s.label} className="card overflow-hidden">
              <div className="card-body py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                  <p className={`text-2xl font-black sora tabular-nums mt-0.5 ${s.color}`}>{s.val}</p>
                </div>
                <div className={`w-11 h-11 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + filter chips ── */}
        <div className="card overflow-hidden">
          <div className="card-body space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" className="input-field pl-10"
                placeholder="Search by order ID, status, or item name…"
                value={query} onChange={e => setQuery(e.target.value)} />
              {query && (
                <button onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="filter-bar">
              {(["all","pending","completed","cancelled"] as const).map(s => (
                <button key={s} type="button" onClick={() => setStatusFilter(s)}
                  className={`filter-chip ${
                    statusFilter === s
                      ? s === "all" ? "active"
                      : s === "completed" ? "active"
                      : s === "pending" ? "active-amber"
                      : "active-red"
                      : ""
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== "all" && (
                    <span className="ml-1 bg-white/60 text-current text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {s === "pending" ? pendingCount : s === "completed" ? completedCount : cancelledCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Orders list ── */}
        {loading ? (
          <div className="card overflow-hidden">
            <div className="card-body py-14 flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">Loading orders…</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card overflow-hidden">
            <div className="card-body py-14 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-700">
                  {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {orders.length === 0 ? "Visit the marketplace to place your first order" : "Try clearing your filters"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOrders.map(order => {
              const cfg = getCfg(order.status);
              return (
                <div key={order.id}
                  className={`card overflow-hidden border-l-4 ${cfg.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group`}
                  onClick={() => setSelectedOrder(order)}>
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-11 h-11 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-100">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 sora text-sm">Order #{order.id}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleString("en-GB", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-base font-black sora text-gray-900">
                          KES {Number(order.total).toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${cfg.badge}`}>
                          {cfg.icon}{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {/* Item thumbnails */}
                    {order.items.slice(0, 3).length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5">
                        {order.items.slice(0, 3).map(item => (
                          <div key={item.id} className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                            {item.image_url
                              ? <img src={`${serverBaseUrl}${item.image_url}`} alt="" className="w-full h-full object-cover" />
                              : <Package className="w-full h-full text-gray-300 p-1.5" />}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs font-semibold text-gray-400">+{order.items.length - 3}</span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                          className="ml-auto flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 group-hover:gap-1.5 transition-all">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ ORDER DETAIL MODAL ══ */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Sticky header */}
              <div className="sticky top-0 bg-white border-b rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-black text-gray-900 sora">Order #{selectedOrder.id}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(selectedOrder.created_at).toLocaleString("en-GB", { dateStyle:"medium", timeStyle:"short" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getCfg(selectedOrder.status).badge}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                  <button onClick={() => setSelectedOrder(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Payment section */}
                <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white/60">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <p className="text-sm font-bold text-gray-800">Payment</p>
                    {selectedOrder.payment_ref && (
                      <span className="ml-auto text-[10px] text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full font-mono">
                        Ref: {selectedOrder.payment_ref}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      If you paid via Paystack and status is still pending, verify the payment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button onClick={() => handleVerifyPaystack(selectedOrder)}
                        disabled={verifyingPayment || reinitializingPayment || !selectedOrder.payment_ref}
                        className="btn btn-primary btn-sm flex items-center gap-1.5 flex-1">
                        {verifyingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Verify Paystack
                      </button>
                      <button onClick={() => handlePayAgain(selectedOrder)}
                        disabled={verifyingPayment || reinitializingPayment}
                        className="btn btn-outline btn-sm flex items-center gap-1.5 flex-1">
                        {reinitializingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                        Pay Again
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map(item => (
                      <div key={item.id}
                        className="flex gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-green-100 transition">
                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                          {item.image_url
                            ? <img src={`${serverBaseUrl}${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
                            : <Package className="w-full h-full text-gray-300 p-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                          {item.company && <p className="text-xs text-gray-500">{item.company}</p>}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                              Qty: {item.qty}
                            </span>
                            <span className="text-sm font-black text-gray-900">
                              KES {Number(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-xl font-black text-green-700 sora">
                    KES {Number(selectedOrder.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}