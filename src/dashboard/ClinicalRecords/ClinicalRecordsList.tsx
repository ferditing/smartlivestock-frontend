import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { ClinicalRecordResponse } from '../../types/clinical.types';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Activity,
  CheckCircle,
  Loader2,
  Plus,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function ClinicalRecordsList() {
  const userRole = localStorage.getItem('role') || 'farmer';
  const [records, setRecords] = useState<ClinicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const token = localStorage.getItem('token');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('/api/clinical-records', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        let recordsData = response.data;
        
        if (response.data.data) {
          recordsData = response.data.data;
        }
        
        if (Array.isArray(recordsData)) {
          setRecords(recordsData);
        } else {
          setRecords([]);
          addToast('warning', 'Data Format', 'Unexpected data format received');
        }
      } catch (err: any) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch records';
        setError(errorMsg);
        addToast('error', 'Error', errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, [token, addToast]);

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ml_diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.animal.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      record.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_treatment': return 'bg-blue-100 text-blue-800';
      case 'recovered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'under_treatment': return <Activity className="w-5 h-5 text-blue-600" />;
      case 'recovered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Layout role={userRole}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading clinical records...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role={userRole}>
        <div className="card p-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Records</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role={userRole}>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clinical Records</h1>
          <p className="text-gray-600 mt-1">Manage and review all animal health records</p>
        </div>
        <Link
          to="/clinical-records/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Record
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4" />
                Search Records
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="input-field pl-11"
                  placeholder="Search by animal name, breed, or diagnosis..."
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
                <option value="under_treatment">Under Treatment</option>
                <option value="recovered">Recovered</option>
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
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{records.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Under Treatment</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {records.filter(r => r.status === 'under_treatment').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recovered</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {records.filter(r => r.status === 'recovered').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {records.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No matching records found' : 'No clinical records found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first clinical record to get started'
              }
            </p>
            {(searchTerm || filterStatus !== 'all') ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/clinical-records/new"
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Record
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecords.map(record => (
            <Link
              key={record.id}
              to={`/clinical-records/${record.id}`}
              className="card hover:shadow-lg transition-all duration-200 group"
            >
              <div className="card-body">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{getStatusIcon(record.status)}</div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                          {record.animal.name}
                        </h2>
                        <p className="text-gray-600">
                          {record.animal.type} • {record.animal.breed || 'Unknown breed'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">ML Diagnosis</p>
                          <p className="font-medium text-gray-900">{record.ml_diagnosis}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Veterinarian</p>
                          <p className="font-medium text-gray-900">{record.vet.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge ${getStatusColor(record.status)} px-3 py-1 text-sm`}>
                          {record.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {record.ml_confidence}% confidence
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(record.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-green-600 group-hover:text-green-700">
                      <span className="font-medium">View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination (Optional) */}
      {filteredRecords.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredRecords.length} of {records.length} records
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    
      </div>
    </Layout>
  );
}
