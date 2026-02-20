// ProductCatalog.tsx - Add Product lives here for agrovet owners
import { useEffect, useMemo, useState } from "react";
import {
  fetchMyProducts,
  fetchProviderProducts,
  deleteProduct as deleteProductApi,
  requestVetVerification,
} from "../../api/agro.api";
import api, { serverBaseUrl } from "../../api/axios";
import ProductGrid from "./ProductGrid";
import AddProductCard from "./AddProduct";
import {
  Package,
  Edit2,
  Trash2,
  Loader2,
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Settings,
  Globe2,
  Eye,
  X,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

type Props = {
  providerId?: number;
  isOwner?: boolean;
  refreshKey?: number;
};

type EcommerceSettings = {
  websiteUrl?: string;
  whatsappNumber?: string;
  enableOnlineOrders?: boolean;
  showOnMarketplace?: boolean;
  customOrderNote?: string;
};

export default function ProductCatalog({ providerId, isOwner, refreshKey }: Props) {
  const { addToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [requestingVerifyId, setRequestingVerifyId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock" | "status">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"products" | "settings">("products");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<any | null>(null);
  const [profileMeta, setProfileMeta] = useState<Record<string, any>>({});
  const [ecomSettings, setEcomSettings] = useState<EcommerceSettings>({
    websiteUrl: "",
    whatsappNumber: "",
    enableOnlineOrders: true,
    showOnMarketplace: true,
    customOrderNote: "",
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      if (isOwner) {
        const data = await fetchMyProducts();
        setProducts(data);
      } else if (providerId) {
        const data = await fetchProviderProducts(providerId);
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  // Load ecommerce settings from backend profile_meta for agrovet owner
  useEffect(() => {
    if (!isOwner) return;
    try {
      (async () => {
        try {
          const res = await api.get("/profile/me");
          const meta = (res.data?.profile_meta as Record<string, any>) || {};
          setProfileMeta(meta);
          setEcomSettings((prev) => ({
            ...prev,
            websiteUrl: meta.website_url || "",
            whatsappNumber: meta.whatsapp_number || "",
            enableOnlineOrders:
              meta.enable_online_orders != null ? Boolean(meta.enable_online_orders) : true,
            showOnMarketplace:
              meta.show_on_marketplace != null ? Boolean(meta.show_on_marketplace) : true,
            customOrderNote: meta.custom_order_note || "",
          }));
        } catch (err) {
          console.error("Failed to load profile for ecommerce settings", err);
        }
      })();
    } catch {
      // ignore unexpected
    }
  }, [isOwner]);

  useEffect(() => {
    loadProducts();
  }, [providerId, isOwner, refreshKey]);

  const handleDelete = async (p: any) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    setDeletingId(p.id);
    try {
      await deleteProductApi(p.id);
      addToast("success", "Success", "Product deleted");
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error ?? "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: any) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveEcommerceSettings = () => {
    try {
      const nextMeta = {
        ...profileMeta,
        website_url: ecomSettings.websiteUrl,
        whatsapp_number: ecomSettings.whatsappNumber,
        enable_online_orders: ecomSettings.enableOnlineOrders,
        show_on_marketplace: ecomSettings.showOnMarketplace,
        custom_order_note: ecomSettings.customOrderNote,
      };
      api
        .put("/profile/me", { profile_meta: nextMeta })
        .then(() => {
          setProfileMeta(nextMeta);
          addToast("success", "Saved", "E-commerce settings updated.");
        })
        .catch(() => {
          addToast("error", "Error", "Failed to update e-commerce settings.");
        });
    } catch {
      addToast("error", "Error", "Unexpected error while saving settings.");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const company = (p.company || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        return name.includes(q) || company.includes(q) || category.includes(q);
      });
    }

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "") * dir;
      }
      if (sortBy === "price") {
        return (Number(a.price) - Number(b.price)) * dir;
      }
      if (sortBy === "stock") {
        return ((a.quantity ?? 0) - (b.quantity ?? 0)) * dir;
      }
      if (sortBy === "status") {
        const av =
          a.vet_verified ? 2 : a.vet_verification_requested ? 1 : 0;
        const bv =
          b.vet_verified ? 2 : b.vet_verification_requested ? 1 : 0;
        return (av - bv) * dir;
      }
      return 0;
    });

    return list;
  }, [products, search, sortBy, sortDir]);

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const handleRequestVerification = async (p: any) => {
    setRequestingVerifyId(p.id);
    try {
      await requestVetVerification(p.id);
      addToast("success", "Requested", "Vet verification requested for this product.");
      await loadProducts();
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error ?? "Failed to request verification");
    } finally {
      setRequestingVerifyId(null);
    }
  };

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading products...</span>
        </div>
      </div>
    );
  }

  const effectiveProviderId = providerId ?? products[0]?.provider_id;

  if (!products.length && !isOwner) {
    return (
      <div className="card p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <Package className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products available</h3>
          <p className="text-gray-500">This provider has no products listed</p>
        </div>
      </div>
    );
  }

  if (showGrid && effectiveProviderId != null) {
    return (
      <div className="card">
        <div className="mb-4">
          <button
            onClick={() => setShowGrid(false)}
            className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to list
          </button>
        </div>
        <ProductGrid providerId={effectiveProviderId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Agrovet Products</h3>
              <p className="text-sm text-gray-500 mt-1">
                {products.length} product{products.length !== 1 ? "s" : ""} in your catalog
              </p>
            </div>
            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add product
                </button>
                <button
                  type="button"
                  onClick={() => setShowGrid(true)}
                  className="btn-outline flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  List view
                </button>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    activeTab === "products"
                      ? "border-green-500 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className={`px-3 py-2 text-sm font-medium border-b-2 inline-flex items-center gap-1 ${
                    activeTab === "settings"
                      ? "border-green-500 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  E-commerce settings
                </button>
              </nav>
            </div>
          )}
        </div>

        {activeTab === "settings" && isOwner ? (
          <div className="card-body space-y-4">
            <p className="text-sm text-gray-500">
              Configure how your agrovet appears online. These settings are stored on this device
              for now and can be wired to backend profile settings later.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public website URL
                </label>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-gray-400" />
                  <input
                    className="input-field flex-1"
                    placeholder="https://your-agrovet-site.com"
                    value={ecomSettings.websiteUrl || ""}
                    onChange={(e) =>
                      setEcomSettings((prev) => ({ ...prev, websiteUrl: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp number for orders
                </label>
                <input
                  className="input-field"
                  placeholder="+2547..."
                  value={ecomSettings.whatsappNumber || ""}
                  onChange={(e) =>
                    setEcomSettings((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  id="enable-online-orders"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={!!ecomSettings.enableOnlineOrders}
                  onChange={(e) =>
                    setEcomSettings((prev) => ({
                      ...prev,
                      enableOnlineOrders: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="enable-online-orders"
                  className="text-sm font-medium text-gray-700"
                >
                  Enable online orders for this shop
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="show-on-marketplace"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={!!ecomSettings.showOnMarketplace}
                  onChange={(e) =>
                    setEcomSettings((prev) => ({
                      ...prev,
                      showOnMarketplace: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="show-on-marketplace"
                  className="text-sm font-medium text-gray-700"
                >
                  Show this agrovet in public marketplace
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom note for customers (shown on product pages / receipts)
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="e.g., Delivery available within 5km radius. Call for bulk discounts."
                value={ecomSettings.customOrderNote || ""}
                onChange={(e) =>
                  setEcomSettings((prev) => ({
                    ...prev,
                    customOrderNote: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveEcommerceSettings}
                className="btn-primary"
              >
                Save settings
              </button>
            </div>
          </div>
        ) : (
          <div className="card-body space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <input
                  className="input-field w-full"
                  placeholder="Search by name, company, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {filteredAndSorted.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  {isOwner
                    ? "No products yet. Use 'Add product' to create your first item."
                    : "No products available."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort("name")}
                      >
                        Product{" "}
                        {sortBy === "name" && (sortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th
                        className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort("price")}
                      >
                        Price (KES){" "}
                        {sortBy === "price" && (sortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort("stock")}
                      >
                        Stock{" "}
                        {sortBy === "stock" && (sortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort("status")}
                      >
                        Status{" "}
                        {sortBy === "status" && (sortDir === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      {isOwner && (
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredAndSorted.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm">
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">
                            SKU: {p.sku || `PROD-${p.id}`}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700">
                          {p.company || "—"}
                        </td>
                        <td className="px-3 py-2 text-sm text-right text-gray-900">
                          {Number(p.price).toLocaleString("en-KE")}
                        </td>
                        <td className="px-3 py-2 text-sm text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              (p.quantity ?? 0) === 0
                                ? "bg-red-100 text-red-800"
                                : (p.quantity ?? 0) < 5
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-green-50 text-green-800"
                            }`}
                          >
                            {p.quantity ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {p.vet_verified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              Vet verified
                            </span>
                          ) : p.vet_verification_requested ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              Verification requested
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Not verified
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-700">
                          {p.category || "—"}
                        </td>
                        {isOwner && (
                          <td className="px-3 py-2 text-sm text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setViewProduct(p)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!p.vet_verified && !p.vet_verification_requested && (
                                <button
                                  type="button"
                                  onClick={() => handleRequestVerification(p)}
                                  disabled={requestingVerifyId === p.id}
                                  className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Request vet verification"
                                >
                                  {requestingVerifyId === p.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <ShieldCheck className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(p)}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p)}
                                disabled={deletingId === p.id}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId === p.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="card-footer flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {filteredAndSorted.length} of {products.length} products
          </span>
          {isOwner && effectiveProviderId != null && (
            <button
              onClick={() => setShowGrid(true)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View All Products →
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit product modal */}
      {isOwner && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <AddProductCard
              product={editingProduct}
              onAdded={async () => {
                await loadProducts();
                handleCloseModal();
              }}
              onUpdated={async () => {
                await loadProducts();
                handleCloseModal();
              }}
            />
          </div>
        </div>
      )}

      {/* View product details modal */}
      {isOwner && viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {viewProduct.name}
                </h2>
                <p className="text-xs text-gray-500">
                  SKU: {viewProduct.sku || `PROD-${viewProduct.id}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-40 h-40 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  {viewProduct.image_url ? (
                    <img
                      src={`${serverBaseUrl}${viewProduct.image_url}`}
                      alt={viewProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-10 h-10 text-green-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium text-gray-900">
                      {viewProduct.company || "—"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Price (KES)</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {Number(viewProduct.price).toLocaleString("en-KE")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {viewProduct.quantity ?? 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {viewProduct.vet_verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Vet verified
                      </span>
                    ) : viewProduct.vet_verification_requested ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        Verification requested
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Not verified
                      </span>
                    )}
                    {viewProduct.category && (
                      <span className="inline-flex items-center text-[11px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {viewProduct.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {viewProduct.usage && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Usage / Usefulness</p>
                  <p className="text-sm text-gray-800 whitespace-pre-line">
                    {viewProduct.usage}
                  </p>
                </div>
              )}

              {viewProduct.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-800 whitespace-pre-line">
                    {viewProduct.description}
                  </p>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}