import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  Edit2,
  Save,
  X,
  Loader2,
  Stethoscope,
  GraduationCap,
  Shield,
  FileText
} from "lucide-react";
import ProviderDocuments from "../components/ProviderDocuments";

type VetMeta = {
  county: string;
  phone: string;
  license_number?: string;
  specialisation?: string;
  years_of_experience?: number;
  country?: string;
  sub_county?: string;
  locality?: string;
  qualifications?: string[];
  hospital_affiliation?: string;
};

type User = {
  county: string;
  phone: string;
  id: number;
  name: string;
  email: string;
  role: "vet";
  profile_meta: VetMeta;
};

export default function VetProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [meta, setMeta] = useState<VetMeta>({ county: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      setUser(res.data);
      // Ensure phone is available in meta (fall back to top-level user.phone)
      const profileMeta = res.data.profile_meta || {};
      setMeta({ ...profileMeta, phone: profileMeta.phone || res.data.phone || "" });
    } catch (error) {
      addToast('error', 'Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!meta.license_number?.trim()) {
      addToast('error', 'Validation Error', 'License number is required');
      return false;
    }
    
    if (!meta.specialisation?.trim()) {
      addToast('error', 'Validation Error', 'Specialization is required');
      return false;
    }
    
    return true;
  };

  const save = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await api.put("/profile/me", { profile_meta: meta });
      addToast('success', 'Success', 'Profile updated successfully');
      setEditing(false);
      await fetchProfile();
    } catch (error) {
      addToast('error', 'Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addQualification = () => {
    const newQual = prompt("Enter a new qualification:");
    if (newQual && newQual.trim()) {
      setMeta(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), newQual.trim()]
      }));
    }
  };

  const removeQualification = (index: number) => {
    setMeta(prev => ({
      ...prev,
      qualifications: prev.qualifications?.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <Layout role="vet">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout role="vet">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="vet">
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Veterinarian Profile</h1>
            <p className="text-gray-600 mt-1">Manage your professional information and credentials</p>
          </div>
          <div className="flex items-center gap-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setMeta(user?.profile_meta || { phone: user?.phone || "", county: user?.county || "" });
                  }}
                  className="btn-outline flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Professional Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Information Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
                    <p className="text-sm text-gray-500">Your veterinary credentials and expertise</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body space-y-4">
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Number *
                        </label>
                        <input
                          className="input-field"
                          placeholder="e.g., VET/12345/2024"
                          value={meta.license_number || ""}
                          onChange={(e) => setMeta({...meta, license_number: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialization *
                        </label>
                        <input
                          className="input-field"
                          placeholder="e.g., Large Animal Surgery"
                          value={meta.specialisation || ""}
                          onChange={(e) => setMeta({...meta, specialisation: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience
                        </label>
                        <input
                          className="input-field"
                          type="number"
                          placeholder="Enter years"
                          value={meta.years_of_experience || ""}
                          onChange={(e) => setMeta({...meta, years_of_experience: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hospital Affiliation
                        </label>
                        <input
                          className="input-field"
                          placeholder="e.g., Nairobi Veterinary Hospital"
                          value={meta.hospital_affiliation || ""}
                          onChange={(e) => setMeta({...meta, hospital_affiliation: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Qualifications
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {meta.qualifications?.map((qual, index) => (
                            <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {qual}
                              {editing && (
                                <button
                                  onClick={() => removeQualification(index)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={addQualification}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          + Add Qualification
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                        <Stethoscope className="w-10 h-10 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Dr. {user.name}</h3>
                        <p className="text-gray-600">Veterinarian</p>
                        {meta.specialisation && (
                          <p className="text-green-700 font-medium mt-1">
                            {meta.specialisation}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">License Number</p>
                            <p className="font-medium text-gray-900">
                              {meta.license_number || 'Not set'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Specialization</p>
                            <p className="font-medium text-gray-900">
                              {meta.specialisation || 'Not specified'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Experience</p>
                            <p className="font-medium text-gray-900">
                              {meta.years_of_experience || '0'} years
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">
                              {meta.phone || 'Not provided'}
                            </p>
                          </div>
                        </div>
                        
                        {meta.hospital_affiliation && (
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Hospital Affiliation</p>
                              <p className="font-medium text-gray-900">{meta.hospital_affiliation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {meta.qualifications && meta.qualifications.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Qualifications</p>
                        <div className="flex flex-wrap gap-2">
                          {meta.qualifications.map((qual, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {qual}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Professional Documents (KVB, VMD, etc.) */}
            <ProviderDocuments providerType="vet" />

            {/* Location Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Practice Location</h2>
                    <p className="text-sm text-gray-500">Where you provide veterinary services</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g., Kenya"
                        value={meta.country || ""}
                        onChange={(e) => setMeta({...meta, country: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g., Nairobi"
                        value={meta.county || ""}
                        onChange={(e) => setMeta({...meta, county: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub-county
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g., Westlands"
                        value={meta.sub_county || ""}
                        onChange={(e) => setMeta({...meta, sub_county: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="font-medium text-gray-900">{meta.country || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">County</p>
                      <p className="font-medium text-gray-900">{meta.county || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Sub-county</p>
                      <p className="font-medium text-gray-900">{meta.sub_county || 'Not set'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Account Info Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Account Role</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Veterinarian
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">January 2024</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">Active</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Verification Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">Verified Professional</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Practice Stats Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Practice Overview</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Stethoscope className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Cases</p>
                      <p className="text-lg font-bold text-gray-900">12</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">+3</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Appointments Today</p>
                      <p className="text-lg font-bold text-gray-900">5</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">+2</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Patients</p>
                      <p className="text-lg font-bold text-gray-900">87</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">+12%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="card-body space-y-2">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">Update Availability</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">View Schedule</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">Manage Cases</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">Professional Settings</span>
                </button>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Verified Professional</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your credentials have been verified and approved.
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