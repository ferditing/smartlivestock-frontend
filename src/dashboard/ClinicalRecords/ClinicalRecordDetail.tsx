import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';

interface ClinicalRecord {
  id: string;
  animal: {
    id: string;
    name: string;
    type: string;
    breed: string;
    reg_no: string;
  };
  vet: {
    id: string;
    name: string;
    email: string;
  };
  ml_diagnosis: string;
  ml_confidence: number;
  vet_diagnosis?: string;
  status: string;
  notes?: string;
  followUps: Array<{
    id: string;
    scheduledDate: string;
    completedDate?: string;
    notes?: string;
    status: string;
  }>;
  created_at: string;
}

export const ClinicalRecordDetail: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ClinicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch record');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [recordId]);

  if (loading) {
    return (
      <Layout role={userRole}>
        <div className="p-6">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role={userRole}>
        <div className="p-6 text-red-600">{error}</div>
      </Layout>
    );
  }

  if (!record) {
    return (
      <Layout role={userRole}>
        <div className="p-6">Record not found</div>
      </Layout>
    );
  }

  return (
    <Layout role={userRole}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Clinical Record</h1>
          <button
            onClick={() => navigate('/clinical-records')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to List
          </button>
        </div>

        {/* Animal Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Animal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Species</p>
              <p className="text-lg font-medium">{record.animal.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Breed</p>
              <p className="text-lg font-medium">{record.animal.breed || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Registration Number</p>
              <p className="text-lg font-bold text-green-700">
                {record.animal.reg_no || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Diagnosis Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Diagnosis</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">ML Diagnosis</p>
              <p className="text-lg font-medium">{record.ml_diagnosis}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ML Confidence</p>
              <p className="text-lg font-medium">{record.ml_confidence}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vet Diagnosis</p>
              <p className="text-lg font-medium">{record.vet_diagnosis || 'Pending'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                record.status === 'under_treatment' ? 'bg-blue-100 text-blue-800' :
                record.status === 'recovered' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {record.status}
              </span>
            </div>
          </div>
        </div>

        {/* Veterinarian Information */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Attending Veterinarian</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-medium">{record.vet.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium">{record.vet.email}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {record.notes && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Notes</h2>
            <p className="text-gray-700">{record.notes}</p>
          </div>
        )}

        {/* Follow-ups */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Follow-ups</h2>
          {record.followUps && record.followUps.length > 0 ? (
            <ul className="space-y-3">
              {record.followUps.map(followUp => (
                <li key={followUp.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {new Date(followUp.scheduledDate).toLocaleDateString()}
                      </p>
                      {followUp.notes && <p className="text-sm text-gray-600 mt-1">{followUp.notes}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      followUp.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {followUp.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No follow-ups scheduled</p>
          )}
        </div>
      </div>
    </Layout>
  );
};