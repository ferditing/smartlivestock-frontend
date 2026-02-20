import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import { User, Mail, Phone, MapPin, Edit2, Save, X, Loader2, Shield } from "lucide-react";
import { Link } from "react-router-dom";

type SubAdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  county: string | null;
  sub_county: string | null;
  assigned_county: string | null;
  created_at?: string;
};

export default function SubAdminProfile() {
  const [user, setUser] = useState<SubAdminUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
      setName(res.data.name || "");
      setPhone(res.data.phone || "");
    } catch {
      addToast("error", "Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/profile/me", { name: name.trim(), phone: phone.trim() || undefined });
      addToast("success", "Success", "Profile updated successfully");
      setEditing(false);
      await fetchProfile();
    } catch {
      addToast("error", "Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout role="subadmin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout role="subadmin">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Not Found</h3>
          <p className="text-gray-600 dark:text-slate-400">Unable to load your profile.</p>
        </div>
      </Layout>
    );
  }

  const county = user.assigned_county || user.county || "—";

  return (
    <Layout role="subadmin">
      <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to="/subadmin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white mb-2"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-slate-300 mt-1">Your account and assigned county</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <>
                <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(user.name);
                    setPhone(user.phone || "");
                  }}
                  className="btn-outline flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account & County</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Assigned county is set by system admin</p>
            </div>
          </div>
          <div className="card-body space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                  <input
                    className="input-field w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    className="input-field w-full"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 ..."
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{user.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Assigned county</p>
                    <p className="font-medium text-gray-900 dark:text-white">{county}</p>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Read-only · Contact admin to change</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
