// ClinicalRecordDetail.tsx - Updated
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Calendar,
  User,
  Activity,
  FileText,
  Thermometer,
  Clock,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  PawPrint
} from 'lucide-react';

interface ClinicalRecord {
  id: string;
  animal: {
    id: string;
    name: string;
    breed?: string;
    reg_no?: string;
    type: string;
  };
  ml_diagnosis: string;
  ml_confidence: number;
  vet_diagnosis?: string;
  status: 'pending' | 'under_treatment' | 'recovered';
  vet: {
    name: string;
    email: string;
  };
  notes?: string;
  created_at: string;
  followUps?: Array<{
    id: string;
    scheduledDate: string;
    notes?: string;
    status: 'completed' | 'pending';
  }>;
}

export const ClinicalRecordDetail: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ClinicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const userRole = localStorage.getItem('role') || 'farmer';

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await axios.get(
          `/api/clinical-records/${recordId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setRecord(response.data);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.error || 'Failed to fetch record';
        addToast('error', 'Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [recordId, addToast]);

  if (loading) {
    return (
      <Layout role={userRole}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clinical record...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!record) {
    return (
      <Layout role={userRole}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Record Not Found</h3>
            <p className="text-gray-600 mb-6">The clinical record you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/clinical-records')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Records
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_treatment': return 'bg-blue-100 text-blue-800';
      case 'recovered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout role={userRole}>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/clinical-records')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Records
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clinical Record</h1>
            <p className="text-gray-600 mt-1">Record ID: {record.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${getStatusColor(record.status)} px-3 py-1.5`}>
              {record.status.replace('_', ' ')}
            </span>
            <button
              onClick={() => window.print()}
              className="btn-outline flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Animal Information Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <PawPrint className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Animal Information</h2>
                    <p className="text-sm text-gray-500">Patient details</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Species</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{record.animal.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Breed</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{record.animal.breed || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration Number</p>
                      <p className="text-xl font-bold text-green-700 mt-1">
                        {record.animal.reg_no || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{record.animal.type}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Diagnosis Information</h2>
                    <p className="text-sm text-gray-500">ML and veterinary assessments</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ML Diagnosis</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{record.ml_diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">ML Confidence</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${record.ml_confidence}%` }}
                          ></div>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-2">{record.ml_confidence}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Vet Diagnosis</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{record.vet_diagnosis || 'Pending'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Record Status</p>
                      <div className="mt-2">
                        <span className={`badge ${getStatusColor(record.status)} px-3 py-1.5 text-sm`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Veterinarian Information Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Attending Veterinarian</h2>
                    <p className="text-sm text-gray-500">Primary care provider</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{record.vet.name}</h3>
                    <p className="text-gray-600">{record.vet.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Stethoscope className="w-4 h-4" />
                        Veterinarian
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Card */}
            {record.notes && (
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Clinical Notes</h2>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Follow-ups Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Follow-ups</h2>
                </div>
              </div>
              <div className="card-body">
                {record.followUps && record.followUps.length > 0 ? (
                  <ul className="space-y-4">
                    {record.followUps.map(followUp => (
                      <li key={followUp.id} className="border-l-4 border-blue-500 pl-4 py-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(followUp.scheduledDate).toLocaleDateString()}
                            </p>
                            {followUp.notes && (
                              <p className="text-sm text-gray-600 mt-1">{followUp.notes}</p>
                            )}
                          </div>
                          <span className={`badge px-2 py-1 text-xs ${
                            followUp.status === 'completed' 
                              ? 'badge-success' 
                              : 'badge-warning'
                          }`}>
                            {followUp.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No follow-ups scheduled</p>
                  </div>
                )}
              </div>
            </div>

            {/* Record Metadata Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Record Details</h2>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Record Created</p>
                  <p className="text-gray-900">
                    {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Record ID</p>
                  <p className="text-gray-900 font-mono">{record.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Animal ID</p>
                  <p className="text-gray-900">{record.animal.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};