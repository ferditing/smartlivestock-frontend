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

  const [searchMode, setSearchMode] = useState<'browse' | 'search'>('browse');
  const [regNo, setRegNo] = useState('');
  const [foundAnimal, setFoundAnimal] = useState<any>(null);


  const userRole = localStorage.getItem('role') || 'farmer';
  const currentUserId = localStorage.getItem('userId');

  const searchAnimalByRegNo = async () => {
    if (!regNo.trim()) {
      setError('Please enter a registration number');
      return;
    }

    try {
      const response = await axios.get(`/api/animal/search?reg_no=${encodeURIComponent(regNo)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data) {
        setFoundAnimal(response.data);
        setSelectedAnimalId(String(response.data.id));
        setError(null);
      } else {
        setError('No animal found with that registration number');
        setFoundAnimal(null);
      }
    } catch (err) {
      setError('Failed to find animal. Please check the registration number.');
      setFoundAnimal(null);
    }
  };
  
  useEffect(() => {

  if (userRole === 'vet' && currentUserId) {
    setFormData(prev => ({ ...prev, vetId: currentUserId }));
  }
    const fetchVets = async () => {
      try {
        const response = await axios.get('/api/users?role=vet', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
        
        
        let vetsData = response.data;
        
        if (response.data.data) {
          vetsData = response.data.data;
        }
      
        if (Array.isArray(vetsData)) {
          setVets(vetsData);
        } else {
          setVets([]);
        }
      } catch (err) {
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
      }
    };
    fetchAnimals();
  }, [userRole, currentUserId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mlConfidence' ? parseFloat(value) : value
    }));
  };

  const handleModeChange = (mode: 'browse' | 'search') => {
    setSearchMode(mode);
    setError(null);
    if (mode === 'browse') {
      setFoundAnimal(null);
      setRegNo('');
    } else {
      setSelectedAnimalId('');
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

  const finalVetId = userRole === 'vet' ? (currentUserId || 'TOKEN_ID'): formData.vetId;

  if (userRole !== 'vet' && !finalVetId) {
    setError('Missing attending vet information');
    return;
  }


  let animalId: number | null = null;

  if (searchMode === 'browse') {
    animalId = selectedAnimalId ? Number(selectedAnimalId) : null;
  } else {
    animalId = foundAnimal ? Number(foundAnimal.id) : null;
  }

  if (!animalId || isNaN(animalId)) {
    setError('Please select or search for an animal first');
    return;
  }
  
    if (isNaN(animalId) || animalId <= 0) {
      setError('Invalid animal selected');
      return;
    }


    setLoading(true);

    try {
      await axios.post(
        '/api/clinical-records',
        {
        animalId: animalId,
        ...(userRole !== 'vet' && {vetId: Number(finalVetId) }),
        mlDiagnosis: formData.mlDiagnosis,
        mlConfidence: formData.mlConfidence || 0,
        vetDiagnosis: formData.vetDiagnosis || null,
        notes: formData.notes || null
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

    navigate('/clinical-records');
  } catch (err: any) {
    const errorMsg = err.response?.data?.error || err.message || 'Failed to create clinical record';
    setError(errorMsg);
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
            <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Find Animal By:
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleModeChange('browse')}
                className={`px-4 py-2 rounded ${
                  searchMode === 'browse' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Browse Animals
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('search')}
                className={`px-4 py-2 rounded ${
                  searchMode === 'search' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Registration Number
              </button>
            </div>
          </div>

                    {searchMode === 'browse' ? (
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
          ) : (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regNo">
                Registration Number *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="regNo"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g., COW/1/26"
                  className="shadow border rounded flex-1 py-2 px-3 text-gray-700"
                />
                <button
                  type="button"
                  onClick={searchAnimalByRegNo}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Search
                </button>
              </div>
              {foundAnimal && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    ✓ Found: <strong>{foundAnimal.species}</strong> - {foundAnimal.breed || 'No breed'} 
                    (Tag: {foundAnimal.tag_id})
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Attending Vet *
            </label>
            {userRole === 'vet' ? (
              <div className="p-2 bg-gray-100 border rounded text-gray-600">
                You are recording this as the attending veterinarian.
              </div>
            ) : (
              <select
                id="vetId"
                name="vetId"
                value={formData.vetId}
                onChange={handleChange}
                required
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
              >
                <option value="">Select a vet</option>
                {vets.map(vet => (
                  <option key={vet.id} value={vet.id}>
                    {vet.name}
                  </option>
                ))}
              </select>
            )}
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
              placeholder="e.g., Anthrax"
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
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
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