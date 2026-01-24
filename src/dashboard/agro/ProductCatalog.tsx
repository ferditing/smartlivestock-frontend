import { useEffect, useState } from "react";
import {
  fetchMyProducts,
  fetchProviderProducts,
} from "../../api/agro.api";

type Props = {
  providerId?: number;
  isOwner?: boolean;
  refreshKey?: number;
};

export default function ProductCatalog({ providerId, isOwner, refreshKey }: Props) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (isOwner) {
      fetchMyProducts().then(setProducts);
    } else if (providerId) {
      fetchProviderProducts(providerId).then(setProducts);
    }
  }, [providerId, isOwner, refreshKey]);

  if (!products.length) {
    return <div className="text-gray-500">No products available.</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Products</h2>

      {products.map((p) => (
        <div key={p.id} className="bg-white p-3 rounded shadow mb-2">
          {p.name} – KES {p.price}
        </div>
      ))}
    </div>
  );
}
