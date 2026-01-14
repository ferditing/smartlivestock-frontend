import Layout from "../../components/Layout";
import NearbyServicesMap from "./NearbyServicesMap";
import ReportSymptom from "./ReportSymptom";

export default function FarmerDashboard() {
  return (
    <Layout role="farmer">
      <h1 className="text-2xl font-bold mb-4">Farmer Dashboard</h1>
      <NearbyServicesMap />
      <div className="mt-6">
        <ReportSymptom />
      </div>
    </Layout>
  );
}
