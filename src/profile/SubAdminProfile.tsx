import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import { User, Mail, Phone, MapPin, Edit2, Save, X, Loader2, Shield, BarChart3, Users } from "lucide-react";
import { Link } from "react-router-dom";

type SubAdminUser = {
  id: number; name: string; email: string; role: string; phone: string | null;
  county: string | null; sub_county: string | null; assigned_county: string | null; created_at?: string;
};

export default function SubAdminProfile() {
  const [user, setUser] = useState<SubAdminUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      setUser(res.data); setName(res.data.name || ""); setPhone(res.data.phone || "");
    } catch { addToast("error", "Error", "Failed to load profile"); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/profile/me", { name: name.trim(), phone: phone.trim() || undefined });
      addToast("success", "Success", "Profile updated successfully");
      setEditing(false); await fetchProfile();
    } catch { addToast("error", "Error", "Failed to update profile"); }
    finally { setSaving(false); }
  };

  if (loading) return <Layout role="subadmin"><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div></Layout>;
  if (!user) return (
    <Layout role="subadmin">
      <div className="empty-state">
        <div className="empty-state-icon"><User className="w-7 h-7" /></div>
        <h3 className="empty-state-title">Profile Not Found</h3>
        <p className="empty-state-sub">Unable to load your profile.</p>
      </div>
    </Layout>
  );

  const county = user.assigned_county || user.county || "—";
  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { month:"long", year:"numeric" }) : "—";

  return (
    <Layout role="subadmin">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/subadmin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition mb-2 group">
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 sora">My Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Your account and assigned county management</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing
              ? <button onClick={() => setEditing(true)} className="btn btn-primary flex items-center gap-2"><Edit2 className="w-4 h-4" />Edit</button>
              : <>
                  <button onClick={save} disabled={saving} className="btn btn-primary flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => { setEditing(false); setName(user.name); setPhone(user.phone || ""); }} className="btn btn-outline flex items-center gap-2"><X className="w-4 h-4" />Cancel</button>
                </>
            }
          </div>
        </div>

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
          <div className="h-28 bg-gradient-to-r from-teal-600 via-emerald-500 to-green-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-800/40 to-transparent" />
            <div className="absolute top-4 right-6 text-5xl opacity-20">🏛️</div>
          </div>
          <div className="px-6 pb-6 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-2xl font-bold sora shadow-lg flex-shrink-0">{initials}</div>
            <div className="sm:pb-2 flex-1">
              <h2 className="text-xl font-bold text-gray-900 sora">{user.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-gray-500"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                {user.phone && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Phone className="w-3.5 h-3.5" />{user.phone}</span>}
                <span className="flex items-center gap-1.5 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" />{county} County</span>
              </div>
            </div>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-xl text-sm font-semibold self-start sm:self-auto sm:mb-2">
              <Shield className="w-4 h-4" /> County Officer
            </span>
          </div>
        </div>

        {/* Main info card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-teal-600" /></div>
            <div><h3 className="font-bold text-gray-900 sora">Account & County</h3><p className="text-xs text-gray-500">Assigned county is managed by the system admin</p></div>
          </div>
          <div className="px-6 py-5">
            {editing ? (
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="field-label">Full Name</label>
                  <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <label className="field-label">Phone Number</label>
                  <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {icon:<User className="w-4 h-4 text-teal-600" />,bg:"bg-teal-100",label:"Full Name",value:user.name},
                  {icon:<Mail className="w-4 h-4 text-blue-600" />,bg:"bg-blue-100",label:"Email Address",value:user.email},
                  {icon:<Phone className="w-4 h-4 text-green-600" />,bg:"bg-green-100",label:"Phone Number",value:user.phone || "—"},
                  {icon:<MapPin className="w-4 h-4 text-purple-600" />,bg:"bg-purple-100",label:"Assigned County",value:county,note:"Read-only · Contact admin to change"},
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>{item.icon}</div>
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
                      {"note" in item && item.note && <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* County duties */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-green-600" /></div>
            <div><h3 className="font-bold text-gray-900 sora">County Management</h3><p className="text-xs text-gray-500">Your responsibilities for {county} County</p></div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {icon:<Users className="w-5 h-5 text-blue-600" />,bg:"bg-blue-50 border-blue-100",label:"County Users",desc:"Manage farmers, vets, and agrovets in your county",href:"/subadmin/users"},
              {icon:<BarChart3 className="w-5 h-5 text-green-600" />,bg:"bg-green-50 border-green-100",label:"County Analytics",desc:"Disease trends, livestock data, and county statistics",href:"/subadmin/analytics"},
              {icon:<Shield className="w-5 h-5 text-purple-600" />,bg:"bg-purple-50 border-purple-100",label:"Provider Approvals",desc:"Review and approve vets and agrovets in your county",href:"/subadmin/providers"},
            ].map(item => (
              <Link key={item.href} to={item.href}
                className={`rounded-xl border p-4 hover:-translate-y-0.5 hover:shadow-md transition-all ${item.bg}`}>
                <div className="flex items-center gap-2 mb-2">{item.icon}<span className="font-bold text-gray-900 text-sm sora">{item.label}</span></div>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Account strip */}
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-gray-500">Role: <span className="badge badge-info ml-1">County Officer</span></span>
            <span className="flex items-center gap-1.5 font-semibold text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Active</span>
          </div>
          <span className="text-xs text-gray-400">Member since {memberSince}</span>
        </div>
      </div>
    </Layout>
  );
}