import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  getSellerOrders,
  updateOrderStatus,
  type SellerOrder,
} from "../../api/agro.api";
import { serverBaseUrl } from "../../api/axios";
import {
  Package,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  User,
  Truck,
  RefreshCw,
  Printer,
  Search,
  Filter,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AgrovetOrders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | (typeof STATUS_OPTIONS)[number]["value"]>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getSellerOrders();
      setOrders(data);
    } catch {
      addToast("error", "Error", "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "processing":
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const mySubtotal = (order: SellerOrder) =>
    order.items.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      addToast("success", "Updated", "Order status updated. Customer notified by SMS if phone is on file.");
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch {
      addToast("error", "Error", "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const buildReceiptHtml = (order: SellerOrder) => {
    const rows = order.items
      .map(
        (item) =>
          `<tr><td>${item.name}</td><td>${item.qty}</td><td>KES ${Number(item.price).toLocaleString()}</td><td>KES ${(Number(item.price) * item.qty).toLocaleString()}</td></tr>`
      )
      .join("");
    const buyerRows = order.buyer
      ? `<div class="row"><span class="muted">Customer</span><span>${order.buyer.name}</span></div>
         ${order.buyer.phone ? `<div class="row"><span class="muted">Phone</span><span>${order.buyer.phone}</span></div>` : ""}`
      : "";
    return `
      <div class="header">
        <h1>SmartLivestock</h1>
        <p class="sub">Order Receipt</p>
      </div>
      <div class="row"><span class="muted">Order #</span><span class="fw">${order.id}</span></div>
      <div class="row"><span class="muted">Date</span><span>${new Date(order.created_at).toLocaleString()}</span></div>
      <div class="row"><span class="muted">Status</span><span class="fw capitalize">${order.status}</span></div>
      ${buyerRows}
      <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="row total"><span>Your share</span><span class="green">KES ${mySubtotal(order).toLocaleString("en-KE")}</span></div>
      <div class="foot">Thank you for your business. SmartLivestock Agrovet.</div>
    `;
  };

  const handlePrintReceipt = (order: SellerOrder) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Receipt #${order.id}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; max-width: 420px; margin: 0 auto; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 12px; margin-bottom: 16px; }
          .header h1 { margin: 0; font-size: 1.5rem; }
          .sub { margin: 4px 0 0; font-size: 0.875rem; color: #6b7280; }
          .row { display: flex; justify-content: space-between; margin: 8px 0; }
          .muted { color: #6b7280; }
          .fw { font-weight: 600; }
          .capitalize { text-transform: capitalize; }
          .total { font-size: 1.125rem; font-weight: bold; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
          .green { color: #16a34a; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.875rem; }
          th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid #e5e7eb; }
          .foot { margin-top: 24px; font-size: 0.8rem; color: #6b7280; text-align: center; }
        </style>
        </head>
        <body>${buildReceiptHtml(order)}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const idMatch = String(order.id).includes(q);
    const buyerMatch = (order.buyer?.name || "").toLowerCase().includes(q);
    const itemMatch = order.items.some((i) => (i.name || "").toLowerCase().includes(q));
    return idMatch || buyerMatch || itemMatch;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter((o) => o.status === "processing").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered" || o.status === "completed").length;

  return (
    <Layout role="agrovet">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders, Status & Receipts</h1>
            <p className="text-gray-600 mt-1">
              Manage customer orders, update delivery status, and print receipts
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card border border-gray-100 bg-white/80 backdrop-blur-sm">
            <p className="text-xs text-gray-500">Total orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
          </div>
          <div className="card border border-amber-100 bg-amber-50/40">
            <p className="text-xs text-amber-700">Pending</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</p>
          </div>
          <div className="card border border-blue-100 bg-blue-50/40">
            <p className="text-xs text-blue-700">Processing</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{processingCount}</p>
          </div>
          <div className="card border border-green-100 bg-green-50/40">
            <p className="text-xs text-green-700">Delivered</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{deliveredCount}</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="card border border-gray-100 bg-gray-50/60">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or product..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as any)
                }
                className="input-field pl-9 w-full md:w-56"
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {orders.length === 0 ? "No orders containing your products yet" : "No orders match your filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="card group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border border-transparent hover:border-green-100 bg-white/90 backdrop-blur-sm"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.items.length} of your product
                        {order.items.length !== 1 ? "s" : ""} · Your share: KES{" "}
                        {mySubtotal(order).toLocaleString("en-KE")}
                      </p>
                      {order.buyer && (
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {order.buyer.name}
                          {order.buyer.phone ? ` · ${order.buyer.phone}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="btn-outline flex items-center gap-2 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order detail modal: status update + print receipt */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between rounded-t-xl">
                <h2 className="text-xl font-bold">Order #{selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Status</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-sm text-gray-500">Update status:</span>
                      <select
                        className="input-field py-1.5 text-sm w-36"
                        value={selectedOrder.status}
                        onChange={(e) =>
                          handleUpdateStatus(selectedOrder.id, e.target.value)
                        }
                        disabled={updatingStatus}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {updatingStatus && (
                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Customer is notified by SMS when status changes (if phone on file).
                    </p>
                  </div>
                  {selectedOrder.buyer && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{selectedOrder.buyer.name}</p>
                      {selectedOrder.buyer.phone && (
                        <p className="text-sm text-gray-600">{selectedOrder.buyer.phone}</p>
                      )}
                      {selectedOrder.buyer.email && (
                        <p className="text-sm text-gray-600">{selectedOrder.buyer.email}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Your Products in This Order</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 border rounded-lg"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img
                              src={`${serverBaseUrl}${item.image_url}`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-full h-full text-gray-300 p-2" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.company && (
                            <p className="text-sm text-gray-500">{item.company}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">Qty: {item.qty}</span>
                            <span className="font-semibold">
                              KES {(Number(item.price) * item.qty).toLocaleString("en-KE")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Your share:</span>
                    <span className="text-green-600 ml-4">
                      KES {mySubtotal(selectedOrder).toLocaleString("en-KE")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(selectedOrder)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print receipt
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
