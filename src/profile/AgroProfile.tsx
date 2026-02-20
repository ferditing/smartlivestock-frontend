import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import { getAgroStats, type AgroStats } from "../api/agro.api";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Loader2,
  User,
  Package,
  Calendar,
  Award
} from "lucide-react";
import ProviderDocuments from "../components/ProviderDocuments";

type AgroMeta = {
  shop_name?: string;
  phone?: string;
  county?: string;
  sub_county?: string;
  locality?: string;
  business_hours?: string;
  specialties?: string[];
};

type User = {
  id: number;
  name: string;
  email: string;
  role: "agrovet";
  profile_meta: AgroMeta;
  created_at?: string;
};

export default function AgroProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [meta, setMeta] = useState<AgroMeta>({});
  const [stats, setStats] = useState<AgroStats | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getAgroStats();
        setStats(data);
      } catch {
        setStats(null);
      }
    })();
  }, [user]);

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
    if (!meta.shop_name?.trim()) {
      addToast('error', 'Validation Error', 'Shop name is required');
      return;
    }

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

  const addSpecialty = () => {
    const newSpecialty = prompt("Enter a new specialty:");
    if (newSpecialty && newSpecialty.trim()) {
      setMeta(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), newSpecialty.trim()]
      }));
    }
  };

  const removeSpecialty = (index: number) => {
    setMeta(prev => ({
      ...prev,
      specialties: prev.specialties?.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <Layout role="agrovet">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout role="agrovet">
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="agrovet">
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Agrovet Profile</h1>
            <p className="text-gray-600 mt-1">Manage your business profile and details</p>
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

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Business Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Store className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                    <p className="text-sm text-gray-500">Your shop details and contact information</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body space-y-4">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Name *
                      </label>
                      <input
                        className="input-field"
                        placeholder="Your business name"
                        value={meta.shop_name || ""}
                        onChange={(e) => setMeta({...meta, shop_name: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          className="input-field"
                          placeholder="+254 700 000000"
                          value={meta.phone || ""}
                          onChange={(e) => setMeta({...meta, phone: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Hours
                        </label>
                        <input
                          className="input-field"
                          placeholder="e.g., 8:00 AM - 6:00 PM"
                          value={meta.business_hours || ""}
                          onChange={(e) => setMeta({...meta, business_hours: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialties
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {meta.specialties?.map((specialty, index) => (
                            <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {specialty}
                              {editing && (
                                <button
                                  onClick={() => removeSpecialty(index)}
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
                          onClick={addSpecialty}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          + Add Specialty
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                        <Store className="w-10 h-10 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{meta.shop_name || 'Your Shop'}</h3>
                        <p className="text-gray-600">Agrovet Supplier</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{meta.phone || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Business Hours</p>
                            <p className="font-medium text-gray-900">{meta.business_hours || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Contact Person</p>
                            <p className="font-medium text-gray-900">{user.name}</p>
                          </div>
                        </div>
                        
                        {meta.specialties && meta.specialties.length > 0 && (
                          <div className="flex items-start gap-3">
                            <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Specialties</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {meta.specialties.map((specialty, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Documents (KVB, VMD, etc.) */}
            <ProviderDocuments providerType="agrovet" />

            {/* Location Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Location Details</h2>
                    <p className="text-sm text-gray-500">Where your business is located</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {editing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locality
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">County</p>
                      <p className="font-medium text-gray-900">{meta.county || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Sub-county</p>
                      <p className="font-medium text-gray-900">{meta.sub_county || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Locality</p>
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
                      Agrovet Supplier
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-GB", {
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card - real data */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Business Overview</h2>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Products</p>
                      <p className="text-lg font-bold text-gray-900">{stats?.productCount ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customers</p>
                      <p className="text-lg font-bold text-gray-900">{stats?.customerCount ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Orders This Month</p>
                      <p className="text-lg font-bold text-gray-900">{stats?.ordersThisMonth ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Award className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-lg font-bold text-gray-900">
                        {stats != null
                          ? `KES ${Number(stats.totalRevenue).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - functional */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="card-body space-y-2">
                <button
                  type="button"
                  onClick={() => navigate("/agrovet")}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <span className="font-medium text-gray-900">Add New Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/agrovet/orders")}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <span className="font-medium text-gray-900">View Orders</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/agrovet")}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <span className="font-medium text-gray-900">Business Analytics</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/agrovet/products")}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <span className="font-medium text-gray-900">Update Pricing / Catalog</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}