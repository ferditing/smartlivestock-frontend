import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import { fetchPendingReports } from "../../api/vet.api";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import {
  Calendar,
  Activity,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  FileText,
  Stethoscope,
  Loader2,
  MapPin,
  CheckCircle
} from "lucide-react";
import StatsCard from "../../components/StartsCard";

export default function VetDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingCases: 0,
    todayAppointments: 0,
    totalPatients: 0,
    completedCases: 0
  });
  const { addToast } = useToast();

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load all data in parallel
        const [reportsData, appointmentsData, diagnosesData] = await Promise.all([
          fetchPendingReports().catch(() => []),
          api.get("/appointments/assigned").then(res => res.data).catch(() => []),
          api.get("/appointments/diagnoses").then(res => res.data).catch(() => [])
        ]);

        setReports(reportsData);
        setAppointments(appointmentsData);
        setDiagnoses(diagnosesData);
        
        // Calculate stats
        const today = new Date().toDateString();
        const todayAppointments = appointmentsData.filter((a: any) => 
          a.scheduled_at && new Date(a.scheduled_at).toDateString() === today
        ).length;

        setStats({
          pendingCases: reportsData.length,
          todayAppointments,
          totalPatients: new Set(appointmentsData.map((a: any) => a.farmer_id)).size,
          completedCases: diagnosesData.length
        });

      } catch (error) {
        addToast('error', 'Error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [addToast]);

  if (loading) {
    return (
      <Layout role="vet">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </Layout>
    );
  }

  const upcomingAppointments = appointments
    .filter(a => a.status === 'accepted')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 3);

  return (
    <Layout role="vet">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Veterinarian Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Overview of your practice</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-outline flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              New Case
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Pending Cases" 
            value={stats.pendingCases}
            trend="up"
            icon={AlertCircle}
          />
          <StatsCard 
            title="Today's Appointments" 
            value={stats.todayAppointments}
            trend="down"
            icon={Calendar}
          />
          <StatsCard 
            title="Total Patients" 
            value={stats.totalPatients}
            trend="up"
            icon={Users}
          />
          <StatsCard 
            title="Completed Cases" 
            value={stats.completedCases}
            trend="up"
            icon={CheckCircle}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cases & Appointments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Cases */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Pending Cases</h2>
                      <p className="text-sm text-gray-500">Cases requiring your attention</p>
                    </div>
                  </div>
                  <span className="badge bg-yellow-100 text-yellow-800">
                    {reports.length} cases
                  </span>
                </div>
              </div>
              
              <div className="card-body">
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-gray-600">No pending cases at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.slice(0, 5).map((r) => (
                      <div key={r.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{r.animal_type || 'Unknown Animal'}</h4>
                            <p className="text-sm text-gray-600 mt-1">{r.symptom_text}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {r.status || 'pending'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Reported {new Date(r.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                            Review →
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {reports.length > 5 && (
                      <button className="w-full text-center text-green-600 hover:text-green-700 font-medium">
                        View all {reports.length} cases →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                    <p className="text-sm text-gray-500">Today's schedule</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Users className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {a.farmer_name || `Farmer #${a.farmer_id}`}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {a.scheduled_at 
                                ? new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Time not set'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge bg-green-100 text-green-800">
                            {a.reason || 'Checkup'}
                          </span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Recent Diagnoses */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">New Clinical Record</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">Schedule Appointment</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900">Review AI Predictions</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="font-medium text-gray-900">View Nearby Cases</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Diagnoses */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Recent Diagnoses</h2>
                    <p className="text-sm text-gray-500">Latest completed cases</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {diagnoses.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600">No recent diagnoses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {diagnoses.slice(0, 3).map((d) => (
                      <div key={d.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {d.animal_type || 'Animal'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(d.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {d.result || 'No details available'}
                        </p>
                      </div>
                    ))}
                    
                    {diagnoses.length > 3 && (
                      <button className="w-full text-center text-green-600 hover:text-green-700 font-medium">
                        View all diagnoses →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Alert */}
            <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Emergency Protocol</h3>
                    <p className="text-sm text-red-700 mt-1">
                      For critical cases, call emergency line: 0700 123 456
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