import { useEffect, useState } from "react";
import { fetchProducts } from "../../api/agro.api";

export default function ProductCatalog() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">My Products</h2>

      {products.map((p) => (
        <div key={p.id} className="bg-white p-3 rounded shadow mb-2">
          {p.name} – KES {p.price}
        </div>
      ))}
    </div>
  );
}
