import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import type { ClinicalRecordResponse } from '../../types/clinical.types';

export default function ClinicalRecordsList() {
  const [records, setRecords] = useState<ClinicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');


  useEffect(() => {
  const fetchRecords = async () => {
    try {
      const response = await axios.get('/api/clinical-records', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Handle different response formats
      let recordsData = response.data;
      
      if (response.data.data) {
        recordsData = response.data.data;
      }
      
      // Ensure it's an array
      if (Array.isArray(recordsData)) {
        setRecords(recordsData);
      } else {
        setRecords([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };
  
  fetchRecords();
 }, [token]);
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clinical Records</h1>
        <Link to="/clinical-records/new" className="bg-green-600 text-white px-4 py-2 rounded">
          New Record
        </Link>
      </div>

      {records.length === 0 ? (
        <p>No clinical records found</p>
      ) : (
        <div className="grid gap-4">


          {records.map(record => (
            <div key={record.id} className="border rounded-lg p-4 hover:shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{record.animal.name}</h2>
                  <p className="text-gray-600">{record.animal.type} - {record.animal.breed}</p>
                  <p className="text-sm mt-2">
                    <strong>ML Diagnosis:</strong> {record.ml_diagnosis} ({record.ml_confidence}%)
                  </p>
                  <p className="text-sm">
                    <strong>Vet:</strong> {record.vet.name}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded text-white text-sm ${
                    record.status === 'pending' ? 'bg-yellow-500' :
                    record.status === 'under_treatment' ? 'bg-blue-500' :
                    record.status === 'recovered' ? 'bg-green-500' :
                    'bg-red-500'
                  }`}>
                    {record.status}
                  </span>
                </div>
                <Link 
                  to={`/clinical-records/${record.id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}