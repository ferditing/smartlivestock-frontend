import { useEffect, useState } from "react";
import { fetchProviderProductsPaginated } from "../../api/agro.api";
import { serverBaseUrl } from "../../api/axios";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

const PAGE_SIZE = 12;

type Product = {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  company?: string;
  quantity: number;
  description?: string;
  vet_verified?: boolean;
  vet_verification_requested?: boolean;
};

export default function ProductGrid({
  providerId,
}: {
  providerId: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProviderProductsPaginated(providerId, page, search)
      .then((res) => {
        setProducts(res.data ?? []);
        const t = res.total != null ? Number(res.total) : 0;
        setTotal(Number.isNaN(t) ? 0 : t);
      })
      .finally(() => setLoading(false));
  }, [providerId, page, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Products</h3>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? "Loading..." : `${total} product${total !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input-field w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-500">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">
              {search ? "No products match your search." : "No products available."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-4 hover:bg-gray-50/70 transition-colors duration-200"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.image_url ? (
                        <img
                          src={`${serverBaseUrl}${p.image_url}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{p.name}</h4>
                      <p className="text-sm text-gray-500">
                        {p.company || `PROD-${p.id}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
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
                        {p.quantity === 0 ? (
                          <span className="inline-flex items-center text-[11px] font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Out of stock
                          </span>
                        ) : p.quantity < 5 ? (
                          <span className="inline-flex items-center text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Low stock
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        KES {Number(p.price).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">per unit</div>
                    </div>
                    <div className="text-sm text-gray-500 w-16 text-right">
                      Stock: {p.quantity}
                    </div>
                  </div>
                </div>
                {p.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{p.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            {loading
              ? "—"
              : total === 0
                ? "No products"
                : `Showing ${start}–${end} of ${total}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={!hasPrev || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-600 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={!hasNext || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
