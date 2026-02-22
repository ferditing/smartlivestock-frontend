import  { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Loader2,
  AlertCircle
} from "lucide-react";

type Appointment = {
  id: number;
  farmer_id?: number;
  provider_id?: number;
  report_id?: number;
  scheduled_at?: string | null;
  status: string;
  farmer_name?: string;
  farmer_phone?: string;
  farmer_email?: string;
  farmer_location?: any;
  farmer_lat?: number;
  farmer_lng?: number;
  animal_type?: string;
  reason?: string;
};

export default function ViewAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToast();
  const userRole = localStorage.getItem('role') || 'farmer';

  const load = async () => {
    setLoading(true);
    try {
      // Use different endpoints based on role
      const endpoint = userRole === 'vet' ? '/appointments/assigned' : '/appointments';
      const res = await axios.get(endpoint);
      setAppointments(res.data);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'Failed to load appointments';
      addToast('error', 'Error', errorMsg);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userRole]);

  const changeStatus = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      await axios.patch(`/appointments/${id}`, { status });
      
      if (status === "accepted") {
        addToast('success', 'Appointment Accepted', 'Appointment has been confirmed');
      } else if (status === "declined") {
        addToast('info', 'Appointment Declined', 'Appointment has been declined');
      }
      
      await load();
    } catch (err) {
      addToast('error', 'Action Failed', 'Failed to update appointment status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-6 h-6 text-green-600" /> };
      case "declined":
        return { color: "bg-red-100 text-red-800", icon: <XCircle className="w-6 h-6 text-red-600" /> };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-6 h-6 text-yellow-600" /> };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: <AlertCircle className="w-6 h-6 text-gray-600" /> };
    }
  };

  const filteredAppointments = appointments
    .filter(appointment => {
      const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
      const matchesSearch = 
        !searchTerm || // If no search term, include all
        (appointment.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (appointment.animal_type?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      // Sort order: pending (1), accepted (2), declined (3)
      const statusOrder: { [key: string]: number } = {
        pending: 1,
        accepted: 2,
        declined: 3
      };
      
      const orderA = statusOrder[a.status] ?? 999;
      const orderB = statusOrder[b.status] ?? 999;
      
      return orderA - orderB;
    });

  return (
    <Layout role={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">Manage and review all veterinary appointments</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4" />
                  Search Appointments
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input-field pl-11"
                    placeholder="Search by farmer, animal, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Filter */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4" />
                  Filter by Status
                </label>
                <select
                  className="select-field"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{appointments.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {appointments.filter(a => a.status === "pending").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Accepted</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {appointments.filter(a => a.status === "accepted").length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Declined</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {appointments.filter(a => a.status === "declined").length}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="card p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading appointments...</span>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <Calendar className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== "all" 
                  ? "No matching appointments found" 
                  : "No appointments scheduled"
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "When appointments are scheduled, they will appear here"
                }
              </p>
              {(searchTerm || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAppointments.map((a) => {
              const statusConfig = getStatusConfig(a.status);
              
              return (
                <div key={a.id} className="card hover:shadow-lg transition-shadow duration-200">
                  <div className="card-body">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Appointment Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-2xl">{statusConfig.icon}</div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              Appointment #{a.id}
                            </h3>
                            {a.farmer_name && (
                              <p className="text-gray-600">
                                Farmer: {a.farmer_name}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Farmer Contact Info */}
                        {(a.farmer_phone || a.farmer_email || a.farmer_location || a.farmer_lat) && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs font-semibold text-blue-900 mb-2">Farmer Contact Details</p>
                            <div className="space-y-2">
                              {a.farmer_phone && (
                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" color= "rgb(37, 211, 102)" width="20" height="20" viewBox="0 0 24 24" className="bi bi-telephone-outbound-fill"><path fill="currentColor" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511zM11 .5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-4.146 4.147a.5.5 0 0 1-.708-.708L14.293 1H11.5a.5.5 0 0 1-.5-.5z"/></svg>
                                  <span className="font-medium text-gray-900">{a.farmer_phone}</span>
                                </p>
                              )}
                              {a.farmer_email && (
                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" color= "rgb(37, 211, 102)" width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"/></svg>
                                  <a href={`mailto:${a.farmer_email}`} className="font-medium text-blue-600 hover:text-blue-800 underline">{a.farmer_email}</a>
                                </p>
                              )}
                              {/* Location from user profile */}
                              {a.farmer_location && (
                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" color= "rgb(37, 211, 102)" width="20" height="20" viewBox="0 0 24" className="bi bi-geo-alt"><path fill="currentColor" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7m4 8h-3v3h-2v-3H8V8h3V5h2v3h3z"/></svg>
                                  <span className="font-medium">
                                    {typeof a.farmer_location === 'string' 
                                      ? a.farmer_location 
                                      : [a.farmer_location?.county, a.farmer_location?.sub_county, a.farmer_location?.locality].filter(Boolean).join(', ') || 'Location saved'
                                    }
                                  </span>
                                </p>
                              )}
                              {/* Location from appointment coordinates */}
                              {a.farmer_lat && a.farmer_lng && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-700 mb-1 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0"><path fill="currentColor" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7m4 8h-3v3h-2v-3H8V8h3V5h2v3h3z"/></svg>
                                    <span className="font-medium">Current Location</span>
                                  </p>
                                  <p className="text-xs text-gray-600 mb-2">{a.farmer_lat.toFixed(4)}, {a.farmer_lng.toFixed(4)}</p>
                                  <a
                                    href={`https://www.openstreetmap.org/?mlat=${a.farmer_lat}&mlon=${a.farmer_lng}&zoom=16`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                                  >
                                    View on Map →
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Animal</p>
                              <p className="font-medium text-gray-900">
                                {a.animal_type || "Not specified"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Scheduled Time</p>
                              <p className="font-medium text-gray-900">
                                {a.scheduled_at 
                                  ? new Date(a.scheduled_at).toLocaleString()
                                  : "Not scheduled"
                                }
                              </p>
                            </div>
                          </div>
                          
                          {a.reason && (
                            <div className="flex items-center gap-2 md:col-span-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">Reason</p>
                                <p className="font-medium text-gray-900">{a.reason}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3">
                        <div className="flex flex-col items-end">
                          <span className={`badge ${statusConfig.color} px-3 py-1.5 mb-2`}>
                            {a.status.toUpperCase()}
                          </span>
                          {a.report_id && (
                            <p className="text-sm text-gray-500">
                              Report: #{a.report_id}
                            </p>
                          )}
                        </div>

                        {a.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => changeStatus(a.id, "accepted")}
                              disabled={actionLoading === a.id}
                              className="btn-primary flex items-center gap-2 whitespace-nowrap"
                            >
                              {actionLoading === a.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Accept
                            </button>
                            <button
                              onClick={() => changeStatus(a.id, "declined")}
                              disabled={actionLoading === a.id}
                              className="btn-outline flex items-center gap-2 whitespace-nowrap"
                            >
                              {actionLoading === a.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Decline
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No actions available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="card">
          <div className="card-body">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Status Legend:</span>
              <div className="flex items-center gap-2">
                <span className="badge bg-yellow-100 text-yellow-800">PENDING</span>
                <span className="text-sm text-gray-600">Awaiting response</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-green-100 text-green-800">ACCEPTED</span>
                <span className="text-sm text-gray-600">Confirmed appointment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge bg-red-100 text-red-800">DECLINED</span>
                <span className="text-sm text-gray-600">Cancelled or rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
