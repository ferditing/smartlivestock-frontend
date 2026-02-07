import Layout from "../../components/Layout";
import NearbyServicesMap from "./NearbyServicesMap";
import ReportSymptom from "./ReportSymptom";
import StatsCard from "../../components/StartsCard";
import { 
  PawPrint, 
  Activity, 
  Calendar, 
  TrendingUp,
  Bell,
  AlertTriangle,
  MapPin
} from "lucide-react";

export default function FarmerDashboard() {
  // Mock data for demo - replace with actual API calls
  const statsData = {
    totalAnimals: 24,
    pendingAppointments: 3,
    activeAlerts: 2,
    monthlyReports: 12
  };

  const recentActivities = [
    { id: 1, type: 'appointment', title: 'Vet checkup scheduled', time: '2 hours ago' },
    { id: 2, type: 'health', title: 'Cow #45 showed symptoms', time: '1 day ago' },
    { id: 3, type: 'vaccination', title: 'Vaccination due for Goats', time: '3 days ago' },
  ];

  return (
    <Layout role="farmer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your livestock overview</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Quick Report
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Animals" 
            value={statsData.totalAnimals}
            trend="up"
            icon={PawPrint}
          />
          <StatsCard 
            title="Pending Appointments" 
            value={statsData.pendingAppointments}
            trend="down"
            icon={Calendar}
          />
          <StatsCard 
            title="Active Alerts" 
            value={statsData.activeAlerts}
            icon={AlertTriangle}
          />
          <StatsCard 
            title="Monthly Reports" 
            value={statsData.monthlyReports}
            trend="up"
            icon={TrendingUp}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Section */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Nearby Services</h2>
                    <p className="text-sm text-gray-500">Find vets and agrovets in your area</p>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="h-[400px]">
                  <NearbyServicesMap />
                </div>
              </div>
            </div>
            {/* Quick Actions moved to right column to avoid overlapping provider list */}
          </div>

          {/* Right Column - Report & Activities */}
          <div className="space-y-6">
            {/* Quick Actions - moved here so it won't overlap the provider list */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                    <div className="text-center">
                      <PawPrint className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-900">Add Animal</span>
                    </div>
                  </button>
                  <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                    <div className="text-center">
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-900">Book Appointment</span>
                    </div>
                  </button>
                  <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                    <div className="text-center">
                      <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-900">Health Report</span>
                    </div>
                  </button>
                  <button className="p-4 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors">
                    <div className="text-center">
                      <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-900">Emergency</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            {/* Symptom Report */}
            <ReportSymptom />

            {/* Recent Activities */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'appointment' ? 'bg-blue-100' :
                        activity.type === 'health' ? 'bg-red-100' :
                        'bg-green-100'
                      }`}>
                        {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'health' && <Activity className="w-4 h-4 text-red-600" />}
                        {activity.type === 'vaccination' && <PawPrint className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-center text-green-600 hover:text-green-700 font-medium">
                  View All Activities →
                </button>
              </div>
            </div>

            {/* Weather/Seasonal Alert */}
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Seasonal Alert</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Rainy season approaching. Consider preventive treatments for common infections.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}