import { useState } from "react";
import Layout from "../../components/Layout";
import AddProduct from "./AddProduct";
import ProductCatalog from "./ProductCatalog";

export default function AgroDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const onAdded = () => setRefreshKey((k) => k + 1);

  return (
    <Layout role="agrovet">
      <h1 className="text-2xl font-bold mb-4">Agro-vet Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <AddProduct onAdded={onAdded} />
        </div>
        <div>
          <ProductCatalog refreshKey={refreshKey} />
        </div>
      </div>
    </Layout>
  );
}
