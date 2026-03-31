// ProductGrid.tsx – Premium Redesign (SmartLivestock Design System)
// All original API, pagination, search and badge logic unchanged.

import { useEffect, useState } from "react";
import { fetchProviderProductsPaginated } from "../../api/agro.api";
import { serverBaseUrl } from "../../api/axios";
import {
  Package, ChevronLeft, ChevronRight, Loader2,
  CheckCircle, Clock, AlertTriangle, Search, X,
} from "lucide-react";

const PAGE_SIZE = 12;

type Product = {
  id: number; name: string; price: number; image_url?: string;
  company?: string; quantity: number; description?: string;
  vet_verified?: boolean; vet_verification_requested?: boolean;
};

export default function ProductGrid({ providerId }: { providerId: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProviderProductsPaginated(providerId, page, search)
      .then(res => {
        setProducts(res.data ?? []);
        const t = res.total != null ? Number(res.total) : 0;
        setTotal(Number.isNaN(t) ? 0 : t);
      })
      .finally(() => setLoading(false));
  }, [providerId, page, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1, hasNext = page < totalPages;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end   = Math.min(page * PAGE_SIZE, total);

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  const StockBadge = ({ qty }: { qty: number }) => {
    if (qty === 0)   return <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-red-800">Out of stock</span>;
    if (qty < 5)     return <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Low stock</span>;
    return null;
  };

  const VerifyBadge = ({ p }: { p: Product }) => {
    if (p.vet_verified)               return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3"/>Vet verified</span>;
    if (p.vet_verification_requested) return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800"><Clock className="w-3 h-3"/>Pending</span>;
    return <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"><AlertTriangle className="w-3 h-3"/>Not verified</span>;
  };

  return (
    <div className="card overflow-hidden">
      {/* Header + search */}
      <div className="card-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 sora">Products</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? "Loading…" : `${total} product${total !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input placeholder="Search products…" value={search}
              onChange={e => handleSearch(e.target.value)}
              className="input-field pl-9 text-sm w-full" />
            {search && (
              <button onClick={() => handleSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">Loading products…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">
              {search ? "No products match your search." : "No products available."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {products.map(p => (
              <div key={p.id} className="px-5 py-4 hover:bg-gray-50/70 transition-colors duration-200 group">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {p.image_url
                      ? <img src={`${serverBaseUrl}${p.image_url}`} alt="" className="w-full h-full object-cover" />
                      : <Package className="w-5 h-5 text-green-400" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-green-700 transition">
                      {p.name}
                    </h4>
                    <p className="text-xs text-gray-400">{p.company || `PROD-${p.id}`}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <VerifyBadge p={p} />
                      <StockBadge qty={p.quantity} />
                    </div>
                  </div>

                  {/* Price + stock */}
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className="text-base font-black text-gray-900 sora">
                      KES {Number(p.price).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stock: <span className="font-bold text-gray-600">{p.quantity}</span>
                    </p>
                  </div>
                </div>

                {p.description && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2 ml-16">{p.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination footer */}
      <div className="card-footer">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-500">
            {loading ? "—" : total === 0 ? "No products" : `Showing ${start}–${end} of ${total}`}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => goToPage(page - 1)} disabled={!hasPrev || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              {page} / {totalPages}
            </span>
            <button type="button" onClick={() => goToPage(page + 1)} disabled={!hasNext || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}