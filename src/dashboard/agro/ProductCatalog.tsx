// ProductCatalog.tsx - Updated
import { useEffect, useState } from "react";
import {
  fetchMyProducts,
  fetchProviderProducts,
} from "../../api/agro.api";
import { Package, Edit2, Trash2, Loader2, AlertCircle } from "lucide-react";

type Props = {
  providerId?: number;
  isOwner?: boolean;
  refreshKey?: number;
};

export default function ProductCatalog({ providerId, isOwner, refreshKey }: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadProducts();
  }, [providerId, isOwner, refreshKey]);

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

  if (!products.length) {
    return (
      <div className="card p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <Package className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products available</h3>
          <p className="text-gray-500">
            {isOwner ? "Add your first product to get started" : "This provider has no products listed"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Product Catalog</h3>
            <p className="text-sm text-gray-500 mt-1">{products.length} products available</p>
          </div>
          {isOwner && (
            <button className="btn-outline flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Manage
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {products.map((p) => (
          <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{p.name}</h4>
                  <p className="text-sm text-gray-500">SKU: {p.sku || `PROD-${p.id}`}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">KES {Number(p.price).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">per unit</div>
                </div>
                
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {p.description && (
              <p className="mt-2 text-sm text-gray-600">{p.description}</p>
            )}
            
            <div className="mt-3 flex items-center gap-2">
              {p.in_stock !== undefined && (
                <span className={`badge ${p.in_stock ? 'badge-success' : 'badge-error'}`}>
                  {p.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              )}
              {p.category && (
                <span className="badge badge-info">{p.category}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="card-footer">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {products.length} products</span>
          {isOwner && (
            <button className="text-green-600 hover:text-green-700 font-medium">
              View All Products →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}