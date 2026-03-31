import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import { getAgroStats, type AgroStats } from "../api/agro.api";
import { Store, Mail, Phone, MapPin, Edit2, Save, X, Loader2, User, Package, Calendar, Award } from "lucide-react";
import ProviderDocuments from "../components/ProviderDocuments";

type AgroMeta = {
  shop_name?: string; phone?: string; county?: string; sub_county?: string;
  locality?: string; business_hours?: string; specialties?: string[];
};
type AgroUser = { id: number; name: string; email: string; role: "agrovet"; profile_meta: AgroMeta; created_at?: string; };

export default function AgroProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AgroUser | null>(null);
  const [meta, setMeta] = useState<AgroMeta>({});
  const [stats, setStats] = useState<AgroStats | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");
  const { addToast } = useToast();

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => {
    if (!user) return;
    (async () => { try { setStats(await getAgroStats()); } catch { setStats(null); } })();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      setUser(res.data); setMeta(res.data.profile_meta || {});
    } catch { addToast("error", "Error", "Failed to load profile"); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!meta.shop_name?.trim()) { addToast("error", "Validation", "Shop name is required"); return; }
    setSaving(true);
    try {
      await api.put("/profile/me", { profile_meta: meta });
      addToast("success", "Saved", "Profile updated successfully");
      setEditing(false); await fetchProfile();
    } catch { addToast("error", "Error", "Failed to update profile"); }
    finally { setSaving(false); }
  };

  const addSpecialty = () => {
    const s = newSpecialty.trim();
    if (!s) return;
    setMeta(p => ({ ...p, specialties: [...(p.specialties || []), s] }));
    setNewSpecialty("");
  };

  if (loading) return <Layout role="agrovet"><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div></Layout>;
  if (!user) return <Layout role="agrovet"><div className="empty-state"><div className="empty-state-icon"><Store className="w-7 h-7" /></div><h3 className="empty-state-title">Profile Not Found</h3></div></Layout>;

  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { month:"long", year:"numeric" }) : "—";

  return (
    <Layout role="agrovet">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sora">Agrovet Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your business profile and shop details</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing
              ? <button onClick={() => setEditing(true)} className="btn btn-primary flex items-center gap-2"><Edit2 className="w-4 h-4" />Edit Profile</button>
              : <>
                  <button onClick={save} disabled={saving} className="btn btn-primary flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button onClick={() => { setEditing(false); setMeta(user.profile_meta || {}); }} className="btn btn-outline flex items-center gap-2"><X className="w-4 h-4" />Cancel</button>
                </>
            }
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
          <div className="h-28 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-800/40 to-transparent" />
            <div className="absolute top-4 right-6 text-5xl opacity-20">🏪</div>
          </div>
          <div className="px-6 pb-6 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-2xl font-bold sora shadow-lg flex-shrink-0">{initials}</div>
            <div className="sm:pb-2 flex-1">
              <h2 className="text-xl font-bold text-gray-900 sora">{meta.shop_name || user.name}</h2>
              {meta.shop_name && <p className="text-gray-500 text-sm">{user.name}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-gray-500"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                {meta.phone && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Phone className="w-3.5 h-3.5" />{meta.phone}</span>}
                {meta.county && <span className="flex items-center gap-1.5 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" />{meta.county}</span>}
              </div>
            </div>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold self-start sm:self-auto sm:mb-2">
              <Store className="w-4 h-4" /> Agrovet Supplier
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Business Information */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center"><Store className="w-5 h-5 text-amber-600" /></div>
                <div><h3 className="font-bold text-gray-900 sora">Business Information</h3><p className="text-xs text-gray-500">Your shop details and contact information</p></div>
              </div>
              <div className="px-6 py-5">
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="field-label">Shop Name <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="e.g. Agro Solutions Ltd" value={meta.shop_name || ""} onChange={e => setMeta({ ...meta, shop_name: e.target.value })} />
                      </div>
                      <div><label className="field-label">Phone</label><input className="input-field" placeholder="+254 700 000 000" value={meta.phone || ""} onChange={e => setMeta({ ...meta, phone: e.target.value })} /></div>
                      <div><label className="field-label">Business Hours</label><input className="input-field" placeholder="e.g. Mon-Sat 8am-6pm" value={meta.business_hours || ""} onChange={e => setMeta({ ...meta, business_hours: e.target.value })} /></div>
                    </div>
                    {/* Specialties */}
                    <div>
                      <label className="field-label">Specialties / Product Categories</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {meta.specialties?.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                            {s}<button type="button" onClick={() => setMeta(p => ({ ...p, specialties: p.specialties?.filter((_,j) => j !== i) }))} className="text-amber-500 hover:text-amber-800 ml-0.5"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input className="input-field flex-1" placeholder="Add specialty…" value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSpecialty(); }}} />
                        <button type="button" onClick={addSpecialty} className="btn btn-outline btn-sm px-4">Add</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        {icon:<Store className="w-4 h-4 text-amber-600" />,bg:"bg-amber-100",label:"Shop Name",value:meta.shop_name || "Not set"},
                        {icon:<Phone className="w-4 h-4 text-green-600" />,bg:"bg-green-100",label:"Phone",value:meta.phone || "Not provided"},
                        {icon:<Calendar className="w-4 h-4 text-blue-600" />,bg:"bg-blue-100",label:"Business Hours",value:meta.business_hours || "Not set"},
                        {icon:<Mail className="w-4 h-4 text-purple-600" />,bg:"bg-purple-100",label:"Email",value:user.email},
                      ].map(item => (
                        <div key={item.label} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>{item.icon}</div>
                          <div><p className="text-xs text-gray-500">{item.label}</p><p className="font-semibold text-gray-900 text-sm">{item.value}</p></div>
                        </div>
                      ))}
                    </div>
                    {meta.specialties && meta.specialties.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          {meta.specialties.map((s, i) => <span key={i} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">{s}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-blue-600" /></div>
                <div><h3 className="font-bold text-gray-900 sora">Shop Location</h3><p className="text-xs text-gray-500">Where your agrovet shop is based</p></div>
              </div>
              <div className="px-6 py-5">
                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className="field-label">County</label><input className="input-field" placeholder="e.g. Nairobi" value={meta.county || ""} onChange={e => setMeta({ ...meta, county: e.target.value })} /></div>
                    <div><label className="field-label">Sub-county</label><input className="input-field" placeholder="e.g. Westlands" value={meta.sub_county || ""} onChange={e => setMeta({ ...meta, sub_county: e.target.value })} /></div>
                    <div><label className="field-label">Locality</label><input className="input-field" placeholder="e.g. Village / Estate" value={meta.locality || ""} onChange={e => setMeta({ ...meta, locality: e.target.value })} /></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[{label:"County",value:meta.county},{label:"Sub-county",value:meta.sub_county},{label:"Locality",value:meta.locality}].map(({label,value}) => (
                      <div key={label}><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p><p className="font-semibold text-gray-900 text-sm">{value || <span className="text-gray-400 font-normal">Not set</span>}</p></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <ProviderDocuments providerType="agrovet" />
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Business stats */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 sora">Business Overview</h3></div>
              <div className="p-5 space-y-4">
                {[
                  {icon:<Package className="w-4 h-4 text-green-600" />,bg:"bg-green-100",label:"Products",value:stats?.productCount ?? "—"},
                  {icon:<User className="w-4 h-4 text-blue-600" />,bg:"bg-blue-100",label:"Customers",value:stats?.customerCount ?? "—"},
                  {icon:<Calendar className="w-4 h-4 text-purple-600" />,bg:"bg-purple-100",label:"Orders This Month",value:stats?.ordersThisMonth ?? "—"},
                  {icon:<Award className="w-4 h-4 text-amber-600" />,bg:"bg-amber-100",label:"Total Revenue",value:stats != null ? `KES ${Number(stats.totalRevenue).toLocaleString("en-KE",{maximumFractionDigits:0})}` : "—"},
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>{item.icon}</div>
                    <div className="min-w-0 flex-1"><p className="text-xs text-gray-500">{item.label}</p><p className="font-bold text-gray-900 text-sm truncate">{item.value}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 sora">Account</h3></div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-gray-500">Role</span><span className="badge badge-warning">Agrovet</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Status</span><span className="flex items-center gap-1.5 font-semibold text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Active</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Joined</span><span className="font-semibold text-gray-900">{memberSince}</span></div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 sora">Quick Actions</h3></div>
              <div className="p-3 space-y-1">
                {[
                  {label:"Add New Product",onClick:() => navigate("/agrovet")},
                  {label:"View Orders",onClick:() => navigate("/agrovet/orders")},
                  {label:"Business Analytics",onClick:() => navigate("/agrovet")},
                  {label:"Update Pricing / Catalog",onClick:() => navigate("/agrovet/products")},
                ].map(a => (
                  <button key={a.label} type="button" onClick={a.onClick}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-all text-sm font-medium text-gray-700 group">
                    {a.label}<span className="opacity-0 group-hover:opacity-100 transition text-amber-500">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}