import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  getOrders,
  verifyPaystackPayment,
  reinitializePaystackPaymentForOrder,
  type Order,
} from "../../api/marketplace.api";
import { serverBaseUrl } from "../../api/axios";
import {
  Package,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  RefreshCcw,
  CreditCard,
  ExternalLink,
} from "lucide-react";

export default function Orders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [reinitializingPayment, setReinitializingPayment] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err: any) {
      addToast("error", "Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const refreshOrdersAndSelection = async (selectedId?: number) => {
    const data = await getOrders();
    setOrders(data);
    if (selectedId != null) {
      const updated = data.find((o) => o.id === selectedId) || null;
      setSelectedOrder(updated);
    }
  };

  const handleVerifyPaystack = async (order: Order) => {
    const reference = order.payment_ref;
    if (!reference) {
      addToast("error", "Missing reference", "No Paystack reference found for this order.");
      return;
    }

    setVerifyingPayment(true);
    try {
      await verifyPaystackPayment(reference);
      addToast("success", "Verification sent", "Payment verification completed. Refreshing order status...");
      await refreshOrdersAndSelection(order.id);
    } catch (err: unknown) {
      addToast(
        "error",
        "Verification failed",
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Unable to verify Paystack payment"
      );
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handlePayAgain = async (order: Order) => {
    setReinitializingPayment(true);
    try {
      const res = await reinitializePaystackPaymentForOrder(order.id);
      const authorizationUrl =
        res?.authorization_url ||
        res?.data?.authorization_url ||
        res?.data?.authorizationUrl ||
        res?.authorizationUrl ||
        res?.payment_url ||
        res?.data?.payment_url;

      if (!authorizationUrl) {
        throw new Error("Missing Paystack authorization URL");
      }

      window.location.href = authorizationUrl;
    } catch (err: unknown) {
      addToast(
        "error",
        "Pay again failed",
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Unable to re-initialize Paystack payment"
      );
    } finally {
      setReinitializingPayment(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-amber-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const idMatch = String(order.id).includes(q);
    const statusMatch = (order.status || "").toLowerCase().includes(q);
    const itemMatch = (order.items || []).some((i) =>
      (i.name || "").toLowerCase().includes(q)
    );
    return idMatch || statusMatch || itemMatch;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  return (
    <Layout role="farmer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your purchases</p>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="btn-outline inline-flex items-center gap-2 self-start lg:self-auto"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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
          <div className="card border border-green-100 bg-green-50/40">
            <p className="text-xs text-green-700">Completed</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{completedCount}</p>
          </div>
          <div className="card border border-red-100 bg-red-50/40">
            <p className="text-xs text-red-700">Cancelled</p>
            <p className="text-2xl font-bold text-red-900 mt-1">{cancelledCount}</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="card border border-gray-100 bg-gray-50/60">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID, status, or item name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "pending" | "completed" | "cancelled"
                )
              }
              className="input-field w-full md:w-56"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="card p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
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
                      <h3 className="font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        KES {Number(order.total).toLocaleString()}
                      </p>
                    </div>
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

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Order #{selectedOrder.id}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
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
                    <p className="text-sm text-gray-500">Status</p>
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
                </div>

                {/* Payment */}
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-semibold text-gray-800">Payment</p>
                    </div>
                    {selectedOrder.payment_ref ? (
                      <span className="text-[11px] text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                        Ref: {selectedOrder.payment_ref}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-500">
                        No reference
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-700">
                        If you paid via Paystack and the status is still pending, you can verify the payment.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tip: After verification, this order may change from pending to completed.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleVerifyPaystack(selectedOrder)}
                        disabled={verifyingPayment || reinitializingPayment || !selectedOrder.payment_ref}
                        className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 disabled:opacity-50"
                      >
                        {verifyingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Verify Paystack
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePayAgain(selectedOrder)}
                        disabled={verifyingPayment || reinitializingPayment}
                        className="btn-outline inline-flex items-center justify-center gap-2 px-4 py-2 disabled:opacity-50"
                      >
                        {reinitializingPayment ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4" />
                        )}
                        Pay again
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50/60 transition-colors"
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
                            <span className="text-sm text-gray-600">
                              Qty: {item.qty}
                            </span>
                            <span className="font-semibold">
                              KES {Number(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      KES {Number(selectedOrder.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
