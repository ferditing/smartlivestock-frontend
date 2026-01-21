import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import ProductCatalog from "../dashboard/agro/ProductCatalog";

export default function ProviderProducts() {
  const { id } = useParams();

  return (
    <Layout role="farmer">
      <h1 className="text-2xl font-bold mb-4">Agrovet Products</h1>
      <ProductCatalog providerId={Number(id)} />
    </Layout>
  );
}
