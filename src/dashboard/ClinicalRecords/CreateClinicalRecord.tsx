import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  FileText,
  User,
  Activity,
  Search,
  Loader2,
  Calendar,
  Stethoscope,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// ... (interfaces remain the same)

export const CreateClinicalRecord: React.FC = () => {
  const navigate = useNavigate();
  const { animalId: urlAnimalId } = useParams<{ animalId?: string }>();
  const [formData, setFormData] = useState({
    vetId: '',
    mlDiagnosis: '',
    mlConfidence: 0,
    vetDiagnosis: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [vets, setVets] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [searchMode, setSearchMode] = useState<'browse' | 'search'>('browse');
  const [regNo, setRegNo] = useState('');
  const [foundAnimal, setFoundAnimal] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const { addToast } = useToast();

  const userRole = localStorage.getItem('role') || 'farmer';
  const currentUserId = localStorage.getItem('userId');

  const searchAnimalByRegNo = async () => {
    if (!regNo.trim()) {
      addToast('error', 'Validation Error', 'Please enter a registration number');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(`/api/animal/search?reg_no=${encodeURIComponent(regNo)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data) {
        setFoundAnimal(response.data);
        setSelectedAnimalId(String(response.data.id));
        addToast('success', 'Animal Found', 'Animal located successfully');
      } else {
        addToast('warning', 'Not Found', 'No animal found with that registration number');
        setFoundAnimal(null);
      }
    } catch (err) {
      addToast('error', 'Search Failed', 'Failed to find animal. Please check the registration number.');
      setFoundAnimal(null);
    } finally {
      setSearchLoading(false);
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
        addToast('warning', 'Veterinarians', 'Could not load veterinarian list');
      }
    };

    const fetchAnimals = async () => {
      try {
        const response = await axios.get('/api/animal', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAnimals(response.data);
      } catch (err) {
        addToast('warning', 'Animals', 'Could not load animal list');
      }
    };

    fetchVets();
    fetchAnimals();
  }, [userRole, currentUserId, addToast]);

  useEffect(() => {
    if (urlAnimalId && animals.length > 0) {
      const id = Number(urlAnimalId);
      if (!isNaN(id) && animals.some((a) => a.id === id)) {
        setSelectedAnimalId(String(id));
        setSearchMode('browse');
      }
    }
  }, [urlAnimalId, animals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mlConfidence' ? parseFloat(value) : value
    }));
  };

  const handleModeChange = (mode: 'browse' | 'search') => {
    setSearchMode(mode);
    if (mode === 'browse') {
      setFoundAnimal(null);
      setRegNo('');
    } else {
      setSelectedAnimalId('');
    }
  };

  const validateForm = () => {
    if (!selectedAnimalId && !foundAnimal) {
      addToast('error', 'Validation Error', 'Please select or search for an animal');
      return false;
    }

    if (userRole !== 'vet' && !formData.vetId) {
      addToast('error', 'Validation Error', 'Please select an attending veterinarian');
      return false;
    }

    if (!formData.mlDiagnosis.trim()) {
      addToast('error', 'Validation Error', 'ML diagnosis is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const finalVetId = userRole === 'vet' ? (currentUserId || 'TOKEN_ID') : formData.vetId;

    let animalId: number | null = null;
    if (searchMode === 'browse') {
      animalId = selectedAnimalId ? Number(selectedAnimalId) : null;
    } else {
      animalId = foundAnimal ? Number(foundAnimal.id) : null;
    }

    if (!animalId || isNaN(animalId)) {
      addToast('error', 'Validation Error', 'Invalid animal selection');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        '/api/clinical-records',
        {
          animalId: animalId,
          ...(userRole !== 'vet' && { vetId: Number(finalVetId) }),
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

      addToast('success', 'Record Created', 'Clinical record created successfully');
      setTimeout(() => {
        navigate('/clinical-records');
      }, 1000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create clinical record';
      addToast('error', 'Creation Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role={userRole}>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/clinical-records')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Records
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Clinical Record</h1>
              <p className="text-gray-600">Document new animal health assessment</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Animal Selection Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">1. Select Animal</h2>
              <p className="text-sm text-gray-500">Choose the animal for this record</p>
            </div>
            
            <div className="card-body space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Find Animal By:
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleModeChange('browse')}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      searchMode === 'browse' 
                        ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Browse My Animals
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange('search')}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      searchMode === 'search' 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Search by Registration
                  </button>
                </div>
              </div>

              {/* Browse Animals */}
              {searchMode === 'browse' ? (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Select Animal *
                  </label>
                  <select
                    value={selectedAnimalId}
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                    required={searchMode === 'browse'}
                    className="select-field"
                  >
                    <option value="">Choose an animal...</option>
                    {animals.map(animal => (
                      <option key={animal.id} value={animal.id}>
                        {animal.species} - {animal.tag_id || animal.name || `ID: ${animal.id}`}
                      </option>
                    ))}
                  </select>
                  {selectedAnimalId && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Animal selected</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Search by Registration */
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4" />
                    Registration Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder="e.g., COW/1/26"
                      className="input-field flex-1"
                      disabled={searchLoading}
                    />
                    <button
                      type="button"
                      onClick={searchAnimalByRegNo}
                      disabled={searchLoading}
                      className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                      {searchLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Search
                    </button>
                  </div>
                  
                  {searchLoading && (
                    <div className="mt-2 flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Searching for animal...</span>
                    </div>
                  )}
                  
                  {foundAnimal && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-800">Animal Found!</h4>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-gray-600">Species</p>
                              <p className="font-medium">{foundAnimal.species}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Breed</p>
                              <p className="font-medium">{foundAnimal.breed || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Tag ID</p>
                              <p className="font-medium">{foundAnimal.tag_id || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Registration</p>
                              <p className="font-medium">{regNo}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Veterinarian Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">2. Attending Veterinarian</h2>
              <p className="text-sm text-gray-500">Who is handling this case?</p>
            </div>
            
            <div className="card-body">
              {userRole === 'vet' ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800">You are the attending veterinarian</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This record will be created under your name as the primary veterinarian.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Select Veterinarian *
                  </label>
                  <select
                    value={formData.vetId}
                    onChange={handleChange}
                    name="vetId"
                    required
                    className="select-field"
                  >
                    <option value="">Choose a veterinarian...</option>
                    {vets.map(vet => (
                      <option key={vet.id} value={vet.id}>
                        Dr. {vet.name} • {vet.specialization || 'General Veterinarian'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Diagnosis Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">3. Diagnosis Information</h2>
              <p className="text-sm text-gray-500">Enter ML and clinical findings</p>
            </div>
            
            <div className="card-body space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Activity className="w-4 h-4" />
                  ML Diagnosis *
                </label>
                <input
                  type="text"
                  name="mlDiagnosis"
                  value={formData.mlDiagnosis}
                  onChange={handleChange}
                  placeholder="e.g., Anthrax, Mastitis, Foot and Mouth Disease"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Activity className="w-4 h-4" />
                  ML Confidence (%)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    name="mlConfidence"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.mlConfidence}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">0%</span>
                    <span className="text-lg font-bold text-gray-900">{formData.mlConfidence}%</span>
                    <span className="text-sm text-gray-500">100%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Stethoscope className="w-4 h-4" />
                  Veterinary Diagnosis (Optional)
                </label>
                <textarea
                  name="vetDiagnosis"
                  value={formData.vetDiagnosis}
                  onChange={handleChange}
                  placeholder="Enter your clinical diagnosis based on examination..."
                  rows={3}
                  className="input-field"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Clinical Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes, observations, treatment recommendations..."
                  rows={4}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Submit Card */}
          <div className="card">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Record...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Create Clinical Record
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/clinical-records')}
                  className="btn-outline flex-1 flex items-center justify-center gap-2 py-3"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel
                </button>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">Important Notice</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This clinical record will be permanently added to the system. 
                      Please ensure all information is accurate before submission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};