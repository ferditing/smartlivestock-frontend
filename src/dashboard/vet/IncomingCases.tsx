import { useEffect, useState } from "react";
import Layout from '../../components/Layout';
import { useNavigate } from "react-router-dom";
import { fetchPendingReports } from "../../api/vet.api";
import { useToast } from "../../context/ToastContext";
import {
  AlertCircle,
  Clock,
  User,
  MapPin,
  ChevronRight,
  Loader2,
  Filter,
  Search,
  Calendar
} from "lucide-react";

export default function IncomingCases() {
  const userRole = localStorage.getItem('role') || 'vet';
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingReports();
      setCases(data);
    } catch (error) {
      addToast('error', 'Error', 'Failed to load incoming cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.animal_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symptom_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === "all" || 
      c.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Layout role={userRole}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incoming Cases</h1>
          <p className="text-gray-600 mt-1">Review and manage new animal health cases</p>
        </div>
        <button
          onClick={loadCases}
          className="btn-outline flex items-center gap-2"
        >
          <Loader2 className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4" />
                Search Cases
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Search by animal, symptoms, or farmer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4" />
                Filter by Priority
              </label>
              <select
                className="select-field"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="card p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading cases...</span>
          </div>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all" 
                ? "No matching cases found" 
                : "All clear! No pending cases"
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "New cases will appear here when reported by farmers"
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="card hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/vet/cases/${c.id}`, { state: c })}
            >
              <div className="card-body">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Case Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        c.priority === 'high' ? 'bg-red-100' :
                        c.priority === 'medium' ? 'bg-yellow-100' :
                        'bg-green-100'
                      }`}>
                        <AlertCircle className={`w-5 h-5 ${
                          c.priority === 'high' ? 'text-red-600' :
                          c.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{c.animal_type || 'Unknown Animal'}</h3>
                        <p className="text-gray-600 text-sm mt-1">{c.symptom_text}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Farmer</p>
                          <p className="font-medium text-gray-900">{c.farmer_name || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">{c.location || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge ${getPriorityColor(c.priority)} px-3 py-1`}>
                          {c.priority || 'normal'} priority
                        </span>
                        <span className="badge bg-blue-100 text-blue-800">
                          {c.status || 'new'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Reported {getTimeAgo(c.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="font-medium">Review Case</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {filteredCases.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-red-600">
                  {filteredCases.filter(c => c.priority === 'high').length}
                </div>
                <p className="text-sm text-gray-600">High Priority</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredCases.filter(c => c.priority === 'medium').length}
                </div>
                <p className="text-sm text-gray-600">Medium Priority</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-green-600">
                  {filteredCases.filter(c => c.priority === 'low' || !c.priority).length}
                </div>
                <p className="text-sm text-gray-600">Low Priority</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}