import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Loader2,
  Users,
  Package,
  Award,
  Tractor
} from "lucide-react";

type FarmerProfileMeta = {
  county?: string;
  subcounty?: string;
  ward?: string;
  locality?: string;
  farm_size?: string;
  livestock_count?: number;
  farm_type?: string;
  join_date?: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: "farmer";
  profile_meta: FarmerProfileMeta;
};

export default function FarmerProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [meta, setMeta] = useState<FarmerProfileMeta>({});
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
      setMeta(res.data.profile_meta || {});
    } catch (error) {
      addToast('error', 'Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
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

  if (loading) {
    return (
      <Layout role="farmer">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout role="farmer">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="farmer">
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Farmer Profile</h1>
            <p className="text-gray-600 mt-1">Manage your farming information and preferences</p>
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
                    setMeta(user.profile_meta || {});
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
          {/* Left Column - Personal & Farm Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-500">Your contact and basic details</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        className="input-field"
                        value={user.name}
                        readOnly
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        className="input-field"
                        value={user.email}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                      <User className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                      <p className="text-gray-600">Farmer</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Farm Information Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Tractor className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Farm Information</h2>
                    <p className="text-sm text-gray-500">Details about your farming operation</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Size (Acres)
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g., 10"
                        value={meta.farm_size || ""}
                        onChange={(e) => setMeta({...meta, farm_size: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Livestock Count
                      </label>
                      <input
                        className="input-field"
                        type="number"
                        placeholder="e.g., 50"
                        value={meta.livestock_count || ""}
                        onChange={(e) => setMeta({...meta, livestock_count: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Farm Type
                      </label>
                      <select
                        className="select-field"
                        value={meta.farm_type || ""}
                        onChange={(e) => setMeta({...meta, farm_type: e.target.value})}
                      >
                        <option value="">Select farm type</option>
                        <option value="dairy">Dairy Farming</option>
                        <option value="beef">Beef Farming</option>
                        <option value="poultry">Poultry Farming</option>
                        <option value="mixed">Mixed Farming</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Farm Size</p>
                      <p className="font-medium text-gray-900">
                        {meta.farm_size ? `${meta.farm_size} acres` : 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Livestock Count</p>
                      <p className="font-medium text-gray-900">
                        {meta.livestock_count || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Farm Type</p>
                      <p className="font-medium text-gray-900">
                        {meta.farm_type || 'Not specified'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Location Details</h2>
                    <p className="text-sm text-gray-500">Where your farm is located</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g., Nakuru"
                        value={meta.county || ""}
                        onChange={(e) => setMeta({...meta, county: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub-county / Constituency
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g., Naivasha"
                        value={meta.subcounty || ""}
                        onChange={(e) => setMeta({...meta, subcounty: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ward
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g., Central Ward"
                        value={meta.ward || ""}
                        onChange={(e) => setMeta({...meta, ward: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locality / Village
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g., Village / Estate"
                        value={meta.locality || ""}
                        onChange={(e) => setMeta({...meta, locality: e.target.value})}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">County</p>
                      <p className="font-medium text-gray-900">{meta.county || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Sub-county / Constituency</p>
                      <p className="font-medium text-gray-900">{meta.subcounty || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Ward</p>
                      <p className="font-medium text-gray-900">{meta.ward || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Locality / Village</p>
                      <p className="font-medium text-gray-900">{meta.locality || 'Not set'}</p>
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
                      Farmer
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {meta.join_date ? new Date(meta.join_date).toLocaleDateString() : 'January 2024'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">Active</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Verification</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">Verified Farmer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Farm Stats Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Farm Overview</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Animals</p>
                      <p className="text-lg font-bold text-gray-900">24</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">+3</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Orders</p>
                      <p className="text-lg font-bold text-gray-900">5</p>
                    </div>
                  </div>
                  <span className="text-sm text-yellow-600">-1</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Appointments</p>
                      <p className="text-lg font-bold text-gray-900">2</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600">+1</span>
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
                  <span className="font-medium text-gray-900">Add New Animal</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">Book Appointment</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">Order Supplies</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900">View Reports</span>
                </button>
              </div>
            </div>

            {/* Seasonal Alert */}
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Seasonal Tip</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Rainy season approaching. Consider preventive treatments.
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