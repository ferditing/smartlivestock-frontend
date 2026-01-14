import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import { fetchProducts } from "../../api/agro.api";

export default function AgroDashboard() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <Layout role="agro">
      <h1 className="text-2xl font-bold mb-4">Agro-vet Dashboard</h1>
      {products.map((p) => (
        <div key={p.id} className="bg-white p-3 rounded shadow mb-2">
          {p.name} – KES {p.price}
        </div>
      ))}
    </Layout>
  );
}
