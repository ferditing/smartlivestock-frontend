import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';

interface CreateClinicalRecordForm {
  vetId: string;
  mlDiagnosis: string;
  mlConfidence: number;
  vetDiagnosis: string;
  notes: string;
}

export const CreateClinicalRecord: React.FC = () => {
  const { animalId } = useParams<{ animalId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateClinicalRecordForm>({
    vetId: '',
    mlDiagnosis: '',
    mlConfidence: 0,
    vetDiagnosis: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vets, setVets] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');


  const userRole = localStorage.getItem('role') || 'farmer';

  
  useEffect(() => {
    const fetchVets = async () => {
      try {
        const response = await axios.get('/api/users?role=vet', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        
        console.log('Vets API response:', response.data);
        
        let vetsData = response.data;
        
        if (response.data.data) {
          vetsData = response.data.data;
        }
      
        if (Array.isArray(vetsData)) {
          setVets(vetsData);
        } else {
          console.error('Expected array but got:', vetsData);
          setVets([]);
        }
      } catch (err) {
        console.error('Failed to fetch vets:', err);
        setVets([]);
      }
    };
    fetchVets();

      const fetchAnimals = async () => {
      try {
        const response = await axios.get('/api/animal', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAnimals(response.data);
      } catch (err) {
        console.error('Failed to fetch animals:', err);
      }
    };
    fetchAnimals();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mlConfidence' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/clinical-records`,
        {
          animalId: animalId || selectedAnimalId, 
          ...formData
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('Clinical record created:', response.data);
      navigate('/clinical-records');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create clinical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role={userRole}>
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Create Clinical Record</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="animalId">
            Animal *
          </label>
          <select
            id="animalId"
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            required
            className="shadow border rounded w-full py-2 px-3 text-gray-700"
          >
            <option value="">Select an animal</option>
            {animals.map(animal => (
              <option key={animal.id} value={animal.id}>
                {animal.species} - {animal.tag_id || animal.id}
              </option>
            ))}
          </select>
        </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vetId">
              Attending Vet *
            </label>
            <select
              id="vetId"
              name="vetId"
              value={formData.vetId}
              onChange={handleChange}
              required
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select a vet</option>
              {vets.map(vet => (
                <option key={vet.id} value={vet.id}>
                  {vet.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mlDiagnosis">
              ML Diagnosis *
            </label>
            <input
              type="text"
              id="mlDiagnosis"
              name="mlDiagnosis"
              value={formData.mlDiagnosis}
              onChange={handleChange}
              placeholder="e.g., East Coast Fever"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mlConfidence">
              ML Confidence (%)
            </label>
            <input
              type="number"
              id="mlConfidence"
              name="mlConfidence"
              min="0"
              max="100"
              step="0.1"
              value={formData.mlConfidence || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vetDiagnosis">
              Vet Diagnosis
            </label>
            <textarea
              id="vetDiagnosis"
              name="vetDiagnosis"
              value={formData.vetDiagnosis}
              onChange={handleChange}
              placeholder="Vet's clinical diagnosis"
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes"
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Clinical Record'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/clinical-records')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};