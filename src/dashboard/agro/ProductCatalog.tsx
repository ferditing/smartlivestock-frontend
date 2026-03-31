// ProductCatalog.tsx – Premium Redesign (SmartLivestock Design System)
// All original API calls, filters, sort, ecommerce settings and modal logic unchanged.

import { useEffect, useMemo, useState } from "react";
import {
  fetchMyProducts, fetchProviderProducts, deleteProduct as deleteProductApi,
  requestVetVerification,
} from "../../api/agro.api";
import api, { serverBaseUrl } from "../../api/axios";
import ProductGrid from "./ProductGrid";
import AddProductCard from "./AddProduct";
import {
  Package, Edit2, Trash2, Loader2, ArrowLeft, Plus, CheckCircle, Clock,
  AlertTriangle, ShieldCheck, Settings, Globe2, Eye, X, Search,
  ChevronUp, ChevronDown,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

type Props = { providerId?: number; isOwner?: boolean; refreshKey?: number; };
type EcomSettings = {
  websiteUrl?: string; whatsappNumber?: string;
  enableOnlineOrders?: boolean; showOnMarketplace?: boolean; customOrderNote?: string;
};

export default function ProductCatalog({ providerId, isOwner, refreshKey }: Props) {
  const { addToast } = useToast();

  const [products,            setProducts]            = useState<any[]>([]);
  const [loading,             setLoading]             = useState(true);
  const [showGrid,            setShowGrid]            = useState(false);
  const [editingProduct,      setEditingProduct]      = useState<any | null>(null);
  const [deletingId,          setDeletingId]          = useState<number | null>(null);
  const [requestingVerifyId,  setRequestingVerifyId]  = useState<number | null>(null);
  const [search,              setSearch]              = useState("");
  const [sortBy,              setSortBy]              = useState<"name"|"price"|"stock"|"status">("name");
  const [sortDir,             setSortDir]             = useState<"asc"|"desc">("asc");
  const [activeTab,           setActiveTab]           = useState<"products"|"settings">("products");
  const [isModalOpen,         setIsModalOpen]         = useState(false);
  const [viewProduct,         setViewProduct]         = useState<any | null>(null);
  const [profileMeta,         setProfileMeta]         = useState<Record<string,any>>({});
  const [ecomSettings,        setEcomSettings]        = useState<EcomSettings>({
    websiteUrl:"", whatsappNumber:"", enableOnlineOrders:true, showOnMarketplace:true, customOrderNote:"",
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      if (isOwner)         setProducts(await fetchMyProducts());
      else if (providerId) setProducts(await fetchProviderProducts(providerId));
    } catch { console.error("Failed to fetch products"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isOwner) return;
    (async () => {
      try {
        const res = await api.get("/profile/me");
        const meta = (res.data?.profile_meta as Record<string,any>) || {};
        setProfileMeta(meta);
        setEcomSettings(prev => ({
          ...prev,
          websiteUrl:         meta.website_url        || "",
          whatsappNumber:     meta.whatsapp_number    || "",
          enableOnlineOrders: meta.enable_online_orders  != null ? Boolean(meta.enable_online_orders)  : true,
          showOnMarketplace:  meta.show_on_marketplace    != null ? Boolean(meta.show_on_marketplace)    : true,
          customOrderNote:    meta.custom_order_note  || "",
        }));
      } catch {}
    })();
  }, [isOwner]);

  useEffect(() => { loadProducts(); }, [providerId, isOwner, refreshKey]);

  const handleDelete = async (p: any) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    setDeletingId(p.id);
    try {
      await deleteProductApi(p.id);
      addToast("success", "Deleted", "Product deleted");
      setProducts(prev => prev.filter(x => x.id !== p.id));
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error ?? "Failed to delete product");
    } finally { setDeletingId(null); }
  };

  const handleRequestVerification = async (p: any) => {
    setRequestingVerifyId(p.id);
    try {
      await requestVetVerification(p.id);
      addToast("success", "Requested", "Vet verification requested.");
      await loadProducts();
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error ?? "Failed to request verification");
    } finally { setRequestingVerifyId(null); }
  };

  const handleSaveEcomSettings = () => {
    const nextMeta = {
      ...profileMeta,
      website_url:         ecomSettings.websiteUrl,
      whatsapp_number:     ecomSettings.whatsappNumber,
      enable_online_orders:ecomSettings.enableOnlineOrders,
      show_on_marketplace: ecomSettings.showOnMarketplace,
      custom_order_note:   ecomSettings.customOrderNote,
    };
    api.put("/profile/me", { profile_meta: nextMeta })
      .then(() => { setProfileMeta(nextMeta); addToast("success","Saved","E-commerce settings updated."); })
      .catch(() => addToast("error","Error","Failed to update settings."));
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        (p.name||"").toLowerCase().includes(q) ||
        (p.company||"").toLowerCase().includes(q) ||
        (p.category||"").toLowerCase().includes(q)
      );
    }
    list.sort((a,b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name")   return (a.name||"").localeCompare(b.name||"")*dir;
      if (sortBy === "price")  return (Number(a.price)-Number(b.price))*dir;
      if (sortBy === "stock")  return ((a.quantity??0)-(b.quantity??0))*dir;
      if (sortBy === "status") {
        const av = a.vet_verified?2:a.vet_verification_requested?1:0;
        const bv = b.vet_verified?2:b.vet_verification_requested?1:0;
        return (av-bv)*dir;
      }
      return 0;
    });
    return list;
  }, [products, search, sortBy, sortDir]);

  const toggleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortDir(prev => prev==="asc"?"desc":"asc");
    else { setSortBy(key); setSortDir("asc"); }
  };

  const SortIcon = ({ key: k }: { key: string }) =>
    sortBy === k
      ? sortDir === "asc"
        ? <ChevronUp className="w-3 h-3 inline" />
        : <ChevronDown className="w-3 h-3 inline" />
      : <span className="inline-block w-3 h-3 opacity-30"><ChevronUp className="w-3 h-3" /></span>;

  const VerifyBadge = ({ p }: { p: any }) => {
    if (p.vet_verified)               return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3"/>Vet verified</span>;
    if (p.vet_verification_requested) return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"><Clock className="w-3 h-3"/>Pending</span>;
    return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"><AlertTriangle className="w-3 h-3"/>Not verified</span>;
  };

  if (loading) return (
    <div className="card overflow-hidden">
      <div className="card-body py-14 flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Loading products…</p>
      </div>
    </div>
  );

  const effectiveProviderId = providerId ?? products[0]?.provider_id;

  if (!products.length && !isOwner) return (
    <div className="card overflow-hidden">
      <div className="card-body py-14 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Package className="w-6 h-6 text-gray-300" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-700">No products available</h3>
          <p className="text-sm text-gray-400 mt-1">This provider has no products listed yet</p>
        </div>
      </div>
    </div>
  );

  if (showGrid && effectiveProviderId != null) return (
    <div className="card overflow-hidden">
      <div className="card-body">
        <button onClick={() => setShowGrid(false)}
          className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>
        <ProductGrid providerId={effectiveProviderId} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="card overflow-hidden">
        {/* ── Card header ── */}
        <div className="card-header">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-gray-900 sora">Agrovet Products</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {products.length} product{products.length !== 1 ? "s" : ""} in your catalog
              </p>
            </div>
            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                  className="btn btn-primary btn-sm flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
                <button type="button" onClick={() => setShowGrid(true)}
                  className="btn btn-outline btn-sm flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> List View
                </button>
              </div>
            )}
          </div>
          {/* Tabs */}
          {isOwner && (
            <div className="tabs tabs-underline mt-4">
              <button type="button" onClick={() => setActiveTab("products")}
                className={`tab ${activeTab === "products" ? "active" : ""}`}>
                Products
              </button>
              <button type="button" onClick={() => setActiveTab("settings")}
                className={`tab flex items-center gap-1.5 ${activeTab === "settings" ? "active" : ""}`}>
                <Settings className="w-3.5 h-3.5" /> E-commerce Settings
              </button>
            </div>
          )}
        </div>

        {/* ── Settings tab ── */}
        {activeTab === "settings" && isOwner ? (
          <div className="card-body space-y-5">
            <p className="text-sm text-gray-500">Configure how your agrovet appears online.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="field-label flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-gray-400" /> Public Website URL
                </label>
                <input className="input-field" placeholder="https://your-site.com"
                  value={ecomSettings.websiteUrl || ""}
                  onChange={e => setEcomSettings(p => ({ ...p, websiteUrl:e.target.value }))} />
              </div>
              <div>
                <label className="field-label">WhatsApp Number for Orders</label>
                <input className="input-field" placeholder="+2547…"
                  value={ecomSettings.whatsappNumber || ""}
                  onChange={e => setEcomSettings(p => ({ ...p, whatsappNumber:e.target.value }))} />
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <input id="enable-orders" type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={!!ecomSettings.enableOnlineOrders}
                  onChange={e => setEcomSettings(p => ({ ...p, enableOnlineOrders:e.target.checked }))} />
                <label htmlFor="enable-orders" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Enable online orders for this shop
                </label>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <input id="show-marketplace" type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={!!ecomSettings.showOnMarketplace}
                  onChange={e => setEcomSettings(p => ({ ...p, showOnMarketplace:e.target.checked }))} />
                <label htmlFor="show-marketplace" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Show in public marketplace
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="field-label">Custom Note for Customers</label>
                <textarea className="input-field resize-none" rows={3}
                  placeholder="e.g. Delivery within 5km. Call for bulk discounts."
                  value={ecomSettings.customOrderNote || ""}
                  onChange={e => setEcomSettings(p => ({ ...p, customOrderNote:e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleSaveEcomSettings}
                className="btn btn-primary btn-md">Save Settings</button>
            </div>
          </div>
        ) : (
          <div className="card-body space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input className="input-field pl-10 w-full" placeholder="Search by name, company, or category…"
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {filteredAndSorted.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">
                  {isOwner ? "No products yet. Click 'Add Product' to create your first item." : "No products available."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-50">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        { key:"name",   label:"Product" },
                        { key:"",       label:"Company" },
                        { key:"price",  label:"Price (KES)" },
                        { key:"stock",  label:"Stock" },
                        { key:"status", label:"Status" },
                        { key:"",       label:"Category" },
                      ].map(th => (
                        <th key={th.label}
                          onClick={() => th.key && toggleSort(th.key as any)}
                          className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 select-none ${th.key ? "cursor-pointer hover:text-gray-600" : ""}`}>
                          {th.label} {th.key && <SortIcon key={th.key} />}
                        </th>
                      ))}
                      {isOwner && (
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filteredAndSorted.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {p.image_url
                                ? <img src={`${serverBaseUrl}${p.image_url}`} alt="" className="w-full h-full object-cover" />
                                : <Package className="w-4 h-4 text-green-400" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition">{p.name}</p>
                              <p className="text-[10px] text-gray-400">SKU: {p.sku || `PROD-${p.id}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.company || "—"}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {Number(p.price).toLocaleString("en-KE")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            (p.quantity??0) === 0 ? "bg-red-100 text-red-800"
                            : (p.quantity??0) < 5 ? "bg-amber-100 text-amber-800"
                            : "bg-green-50 text-green-800"}`}>
                            {p.quantity ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3"><VerifyBadge p={p} /></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{p.category || "—"}</td>
                        {isOwner && (
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-0.5">
                              <button type="button" onClick={() => setViewProduct(p)} title="View"
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition">
                                <Eye className="w-4 h-4" />
                              </button>
                              {!p.vet_verified && !p.vet_verification_requested && (
                                <button type="button" onClick={() => handleRequestVerification(p)}
                                  disabled={requestingVerifyId === p.id} title="Request vet verification"
                                  className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition disabled:opacity-50">
                                  {requestingVerifyId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                </button>
                              )}
                              <button type="button" onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} title="Edit"
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button type="button" onClick={() => handleDelete(p)} disabled={deletingId === p.id} title="Delete"
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition disabled:opacity-50">
                                {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

        <div className="card-footer flex items-center justify-between text-xs text-gray-400">
          <span>Showing <strong>{filteredAndSorted.length}</strong> of <strong>{products.length}</strong> products</span>
          {isOwner && effectiveProviderId != null && (
            <button onClick={() => setShowGrid(true)}
              className="text-green-600 hover:text-green-700 font-bold">
              View All Products →
            </button>
          )}
        </div>
      </div>

      {/* ══ ADD/EDIT MODAL ══ */}
      {isOwner && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between rounded-t-2xl z-10">
              <p className="text-sm font-bold text-gray-900 sora">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </p>
              <button type="button" onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <AddProductCard
                product={editingProduct}
                onAdded={async () => { await loadProducts(); setIsModalOpen(false); setEditingProduct(null); }}
                onUpdated={async () => { await loadProducts(); setIsModalOpen(false); setEditingProduct(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ══ VIEW PRODUCT MODAL ══ */}
      {isOwner && viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 sora">{viewProduct.name}</h2>
                <p className="text-xs text-gray-400">SKU: {viewProduct.sku || `PROD-${viewProduct.id}`}</p>
              </div>
              <button type="button" onClick={() => setViewProduct(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-40 h-40 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {viewProduct.image_url
                    ? <img src={`${serverBaseUrl}${viewProduct.image_url}`} alt={viewProduct.name} className="w-full h-full object-cover rounded-2xl" />
                    : <Package className="w-12 h-12 text-green-300" />}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Company</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{viewProduct.company || "—"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price (KES)</p>
                      <p className="text-sm font-black text-gray-900 sora mt-0.5">{Number(viewProduct.price).toLocaleString("en-KE")}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{viewProduct.quantity ?? 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{viewProduct.category || "—"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <VerifyBadge p={viewProduct} />
                  </div>
                </div>
              </div>
              {viewProduct.usage && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Usage / Usefulness</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{viewProduct.usage}</p>
                </div>
              )}
              {viewProduct.description && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{viewProduct.description}</p>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4 flex justify-end">
              <button type="button" onClick={() => setViewProduct(null)} className="btn btn-outline btn-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── VerifyBadge helper used inline ──────────────────────────── */
function VerifyBadge({ p }: { p: any }) {
  if (p.vet_verified)               return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3"/>Vet verified</span>;
  if (p.vet_verification_requested) return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"><Clock className="w-3 h-3"/>Pending</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"><AlertTriangle className="w-3 h-3"/>Not verified</span>;
}