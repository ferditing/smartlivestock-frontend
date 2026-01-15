import { useEffect, useState } from "react";
import { fetchProducts } from "../../api/agro.api";

type Props = { refreshKey?: number; providerId?: number };

export default function ProductCatalog({ refreshKey, providerId }: Props) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts(providerId).then(setProducts);
  }, [refreshKey, providerId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">My Products</h2>

      {products.length === 0 ? (
        <div className="text-gray-500">You currently have no products.</div>
      ) : (
        products.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded shadow mb-2">
            {p.name} – KES {p.price}
          </div>
        ))
      )}
    </div>
  );
}
