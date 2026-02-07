// AgroDashboard.tsx - Updated
import { useState } from "react";
import Layout from "../../components/Layout";
import AddProduct from "./AddProduct";
import { Package, TrendingUp, Users, DollarSign } from "lucide-react";
import StatsCard from "../../components/StartsCard";

export default function AgroDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const onAdded = () => setRefreshKey((k) => k + 1);

  return (
    <Layout role="agrovet">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Agro-vet Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your products and track your business</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Products" 
            value="24" 
            trend="up"
            icon={Package}
          />
          <StatsCard 
            title="Monthly Sales" 
            value="KES 45,800" 
            trend="up"
            icon={TrendingUp}
          />
          <StatsCard 
            title="Active Customers" 
            value="128" 
            trend="up"
            icon={Users}
          />
          <StatsCard 
            title="Revenue Growth" 
            value="+18%" 
            trend="up"
            icon={DollarSign}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6">
          <AddProduct onAdded={onAdded} />
        </div>
      </div>
    </Layout>
  );
}
