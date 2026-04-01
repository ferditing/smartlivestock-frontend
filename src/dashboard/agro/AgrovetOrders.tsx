// AgrovetOrders.tsx – Premium Redesign (SmartLivestock Design System)
// All original API calls, status update, receipt print and filter logic unchanged.

import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  getSellerOrders, updateOrderStatus, type SellerOrder,
} from "../../api/agro.api";
import { serverBaseUrl } from "../../api/axios";
import {
  Package, Loader2, CheckCircle, Clock, XCircle, X, Eye, User,
  Truck, RefreshCw, Printer, Search, Filter,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value:"pending",    label:"Pending" },
  { value:"processing", label:"Processing" },
  { value:"shipped",    label:"Shipped" },
  { value:"delivered",  label:"Delivered" },
  { value:"cancelled",  label:"Cancelled" },
];

const STATUS_CFG: Record<string, { badge:string; border:string; icon:React.ReactNode }> = {
  delivered:  { badge:"bg-green-100 text-green-800",  border:"border-l-green-500",  icon:<CheckCircle className="w-4 h-4 text-green-600"/> },
  completed:  { badge:"bg-green-100 text-green-800",  border:"border-l-green-500",  icon:<CheckCircle className="w-4 h-4 text-green-600"/> },
  pending:    { badge:"bg-amber-100 text-amber-800",  border:"border-l-amber-400",  icon:<Clock className="w-4 h-4 text-amber-600"/> },
  processing: { badge:"bg-blue-100 text-blue-800",    border:"border-l-blue-500",   icon:<RefreshCw className="w-4 h-4 text-blue-600"/> },
  shipped:    { badge:"bg-purple-100 text-purple-800",border:"border-l-purple-500", icon:<Truck className="w-4 h-4 text-purple-600"/> },
  cancelled:  { badge:"bg-red-100 text-red-800",      border:"border-l-red-400",    icon:<XCircle className="w-4 h-4 text-red-600"/> },
};
const getCfg = (s:string) => STATUS_CFG[s] || { badge:"bg-gray-100 text-gray-700", border:"border-l-gray-300", icon:<Clock className="w-4 h-4 text-gray-400"/> };

/* ── Receipt builder (UNCHANGED) ──────────────────────────────── */
function buildReceiptHtml(order: SellerOrder, mySubtotal: number) {
  const rows = order.items.map(i =>
    `<tr><td>${i.name}</td><td>${i.qty}</td><td>KES ${Number(i.price).toLocaleString()}</td><td>KES ${(Number(i.price)*i.qty).toLocaleString()}</td></tr>`
  ).join("");
  const buyerRows = order.buyer
    ? `<div class="row"><span class="muted">Customer</span><span>${order.buyer.name}</span></div>
       ${order.buyer.phone ? `<div class="row"><span class="muted">Phone</span><span>${order.buyer.phone}</span></div>` : ""}`
    : "";
  return `
    <div class="header"><h1>SmartLivestock</h1><p class="sub">Order Receipt</p></div>
    <div class="row"><span class="muted">Order #</span><span class="fw">${order.id}</span></div>
    <div class="row"><span class="muted">Date</span><span>${new Date(order.created_at).toLocaleString()}</span></div>
    <div class="row"><span class="muted">Status</span><span class="fw capitalize">${order.status}</span></div>
    ${buyerRows}
    <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="row total"><span>Your share</span><span class="green">KES ${mySubtotal.toLocaleString("en-KE")}</span></div>
    <div class="foot">Thank you for your business. SmartLivestock Agrovet.</div>`;
}

export default function AgrovetOrders() {
  const { addToast } = useToast();
  const [orders,         setOrders]         = useState<SellerOrder[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedOrder,  setSelectedOrder]  = useState<SellerOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [query,          setQuery]          = useState("");
  const [statusFilter,   setStatusFilter]   = useState<"all"|string>("all");

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try { const data = await getSellerOrders(); setOrders(data); }
    catch { addToast("error", "Error", "Failed to load orders"); setOrders([]); }
    finally { setLoading(false); }
  };

  const mySubtotal = (order: SellerOrder) =>
    order.items.reduce((s, i) => s + Number(i.price) * i.qty, 0);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      addToast("success", "Updated", "Order status updated. Customer notified by SMS if phone is on file.");
      await loadOrders();
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status:newStatus } : null);
    } catch { addToast("error", "Error", "Failed to update order status"); }
    finally { setUpdatingStatus(false); }
  };

  const handlePrintReceipt = (order: SellerOrder) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt #${order.id}</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;max-width:420px;margin:0 auto;color:#111}
      .header{text-align:center;border-bottom:2px solid #22c55e;padding-bottom:12px;margin-bottom:16px}
      .header h1{margin:0;font-size:1.5rem}.sub{margin:4px 0 0;font-size:.875rem;color:#6b7280}
      .row{display:flex;justify-content:space-between;margin:8px 0}.muted{color:#6b7280}.fw{font-weight:600}
      .capitalize{text-transform:capitalize}.total{font-size:1.125rem;font-weight:bold;margin-top:16px;padding-top:12px;border-top:1px solid #e5e7eb}
      .green{color:#16a34a}table{width:100%;border-collapse:collapse;margin:16px 0;font-size:.875rem}
      th,td{text-align:left;padding:8px 4px;border-bottom:1px solid #e5e7eb}
      .foot{margin-top:24px;font-size:.8rem;color:#6b7280;text-align:center}</style>
      </head><body>${buildReceiptHtml(order, mySubtotal(order))}</body></html>`);
    win.document.close(); win.focus(); win.print(); win.close();
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return String(order.id).includes(q)
      || (order.buyer?.name || "").toLowerCase().includes(q)
      || order.items.some(i => (i.name||"").toLowerCase().includes(q));
  });

  const pendingCount   = orders.filter(o => o.status === "pending").length;
  const processingCount= orders.filter(o => o.status === "processing").length;
  const deliveredCount = orders.filter(o => o.status === "delivered" || o.status === "completed").length;

  return (
    <Layout role="agrovet">
      <div className="space-y-6 animate-fadeInUp">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Orders, Status & Receipts</h1>
            <p className="page-sub">Manage customer orders, update delivery status, and print receipts</p>
          </div>
          <button type="button" onClick={loadOrders} disabled={loading}
            className="btn btn-outline btn-md flex items-center gap-2 self-start">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {/* ── Stat strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"Total",      val:orders.length,  color:"text-gray-900",  iconBg:"bg-gray-100",    icon:<Package className="w-5 h-5 text-gray-600"/> },
            { label:"Pending",    val:pendingCount,   color:"text-amber-700", iconBg:"bg-amber-100",   icon:<Clock className="w-5 h-5 text-amber-600"/> },
            { label:"Processing", val:processingCount,color:"text-blue-700",  iconBg:"bg-blue-100",    icon:<RefreshCw className="w-5 h-5 text-blue-600"/> },
            { label:"Delivered",  val:deliveredCount, color:"text-green-700", iconBg:"bg-green-100",   icon:<CheckCircle className="w-5 h-5 text-green-600"/> },
          ].map(s => (
            <div key={s.label} className="card overflow-hidden">
              <div className="card-body py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                  <p className={`text-2xl font-black sora tabular-nums mt-0.5 ${s.color}`}>{s.val}</p>
                </div>
                <div className={`w-11 h-11 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + filter ── */}
        <div className="card overflow-hidden">
          <div className="card-body space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by order ID, customer, or product…"
                  value={query} onChange={e => setQuery(e.target.value)}
                  className="input-field pl-10 w-full" />
                {query && (
                  <button onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="relative flex-shrink-0">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="input-field pl-9 w-full sm:w-48">
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
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
              <p className="text-sm font-semibold text-gray-500">
                {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
              </p>
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
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-11 h-11 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-100">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 sora text-sm">Order #{order.id}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.created_at).toLocaleString("en-GB", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.items.length} product{order.items.length !== 1?"s":""} · Your share:{" "}
                            <strong>KES {mySubtotal(order).toLocaleString("en-KE")}</strong>
                          </p>
                          {order.buyer && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {order.buyer.name}{order.buyer.phone ? ` · ${order.buyer.phone}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${cfg.badge}`}>
                          {cfg.icon} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <button onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                          className="btn btn-outline btn-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ ORDER DETAIL MODAL ══ */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-black text-gray-900 sora">Order #{selectedOrder.id}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(selectedOrder.created_at).toLocaleString("en-GB", { dateStyle:"medium", timeStyle:"short" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                {/* Status update */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 ${getCfg(selectedOrder.status).badge}`}>
                      {getCfg(selectedOrder.status).icon}
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                    <select className="input-field py-1.5 text-sm w-40"
                      value={selectedOrder.status}
                      onChange={e => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      disabled={updatingStatus}
                      onClick={e => e.stopPropagation()}>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {updatingStatus && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
                  </div>
                  <p className="text-[10px] text-gray-400">Customer is notified by SMS when status changes.</p>
                </div>

                {/* Buyer info */}
                {selectedOrder.buyer && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                    <p className="font-bold text-gray-900">{selectedOrder.buyer.name}</p>
                    {selectedOrder.buyer.phone && <p className="text-sm text-gray-600">{selectedOrder.buyer.phone}</p>}
                    {selectedOrder.buyer.email && <p className="text-sm text-gray-600">{selectedOrder.buyer.email}</p>}
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3">Your Products in This Order</p>
                  <div className="space-y-3">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                          {item.image_url
                            ? <img src={`${serverBaseUrl}${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
                            : <Package className="w-full h-full text-gray-200 p-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                          {item.company && <p className="text-xs text-gray-400">{item.company}</p>}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">Qty: {item.qty}</span>
                            <span className="text-sm font-black text-gray-900">KES {(Number(item.price)*item.qty).toLocaleString("en-KE")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total + Print */}
                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <div>
                    <p className="text-xs text-gray-500">Your share</p>
                    <p className="text-xl font-black text-green-700 sora">
                      KES {mySubtotal(selectedOrder).toLocaleString("en-KE")}
                    </p>
                  </div>
                  <button type="button" onClick={() => handlePrintReceipt(selectedOrder)}
                    className="btn btn-primary btn-sm flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5" /> Print Receipt
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