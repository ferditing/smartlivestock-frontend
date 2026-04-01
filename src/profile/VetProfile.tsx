import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useToast } from "../context/ToastContext";
import { User, Mail, Phone, MapPin, Award, Calendar, Edit2, Save, X, Loader2, Stethoscope, Shield, FileText } from "lucide-react";
import ProviderDocuments from "../components/ProviderDocuments";

type VetMeta = {
  county: string; phone: string; license_number?: string; specialisation?: string;
  years_of_experience?: number; country?: string; sub_county?: string; locality?: string;
  qualifications?: string[]; hospital_affiliation?: string;
};
type VetUser = { county: string; phone: string; id: number; name: string; email: string; role: "vet"; profile_meta: VetMeta; created_at?: string; };

export default function VetProfile() {
  const [user, setUser] = useState<VetUser | null>(null);
  const [meta, setMeta] = useState<VetMeta>({ county: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newQual, setNewQual] = useState("");
  const { addToast } = useToast();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      setUser(res.data);
      const pm = res.data.profile_meta || {};
      setMeta({ ...pm, phone: pm.phone || res.data.phone || "" });
    } catch { addToast("error", "Error", "Failed to load profile"); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!meta.license_number?.trim()) { addToast("error", "Validation", "License number is required"); return; }
    if (!meta.specialisation?.trim()) { addToast("error", "Validation", "Specialization is required"); return; }
    setSaving(true);
    try {
      await api.put("/profile/me", { profile_meta: meta });
      addToast("success", "Saved", "Profile updated successfully");
      setEditing(false); await fetchProfile();
    } catch { addToast("error", "Error", "Failed to update profile"); }
    finally { setSaving(false); }
  };

  const addQualification = () => {
    const q = newQual.trim();
    if (!q) return;
    setMeta(p => ({ ...p, qualifications: [...(p.qualifications || []), q] }));
    setNewQual("");
  };

  if (loading) return <Layout role="vet"><div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div></Layout>;
  if (!user) return <Layout role="vet"><div className="empty-state"><div className="empty-state-icon"><Stethoscope className="w-7 h-7" /></div><h3 className="empty-state-title">Profile Not Found</h3></div></Layout>;

  const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { month:"long", year:"numeric" }) : "—";

  return (
    <Layout role="vet">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sora">Veterinarian Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your professional information and credentials</p>
          </div>
          <div className="flex items-center gap-2">
            {!editing
              ? <button onClick={() => setEditing(true)} className="btn btn-primary flex items-center gap-2"><Edit2 className="w-4 h-4" />Edit Profile</button>
              : <>
                  <button onClick={save} disabled={saving} className="btn btn-primary flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button onClick={() => { setEditing(false); setMeta(user.profile_meta || { county:"", phone:"" }); }} className="btn btn-outline flex items-center gap-2"><X className="w-4 h-4" />Cancel</button>
                </>
            }
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
          <div className="h-28 bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-800/40 to-transparent" />
            <div className="absolute top-4 right-6 text-5xl opacity-20">🩺</div>
          </div>
          <div className="px-6 pb-6 flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold sora shadow-lg flex-shrink-0">{initials}</div>
            <div className="sm:pb-2 flex-1">
              <h2 className="text-xl font-bold text-gray-900 sora">Dr. {user.name}</h2>
              {meta.specialisation && <p className="text-blue-600 font-semibold text-sm mt-0.5">{meta.specialisation}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-gray-500"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                {meta.phone && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Phone className="w-3.5 h-3.5" />{meta.phone}</span>}
                {meta.county && <span className="flex items-center gap-1.5 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" />{meta.county}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-2 self-start sm:self-auto sm:mb-2">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold"><Stethoscope className="w-4 h-4" />Veterinarian</span>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-xl text-xs font-semibold"><Shield className="w-3.5 h-3.5" />Verified Professional</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Professional info */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center"><Stethoscope className="w-5 h-5 text-green-600" /></div>
                <div><h3 className="font-bold text-gray-900 sora">Professional Information</h3><p className="text-xs text-gray-500">Your veterinary credentials and expertise</p></div>
              </div>
              <div className="px-6 py-5">
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="field-label">License Number <span className="text-red-400">*</span></label><input className="input-field" placeholder="e.g. VET/12345/2024" value={meta.license_number || ""} onChange={e => setMeta({ ...meta, license_number: e.target.value })} /></div>
                      <div><label className="field-label">Specialization <span className="text-red-400">*</span></label><input className="input-field" placeholder="e.g. Large Animal Surgery" value={meta.specialisation || ""} onChange={e => setMeta({ ...meta, specialisation: e.target.value })} /></div>
                      <div><label className="field-label">Years of Experience</label><input className="input-field" type="number" min="0" placeholder="e.g. 5" value={meta.years_of_experience || ""} onChange={e => setMeta({ ...meta, years_of_experience: parseInt(e.target.value) || 0 })} /></div>
                      <div><label className="field-label">Phone</label><input className="input-field" placeholder="+254 700 000 000" value={meta.phone || ""} onChange={e => setMeta({ ...meta, phone: e.target.value })} /></div>
                      <div className="sm:col-span-2"><label className="field-label">Hospital Affiliation</label><input className="input-field" placeholder="e.g. Nairobi Veterinary Hospital" value={meta.hospital_affiliation || ""} onChange={e => setMeta({ ...meta, hospital_affiliation: e.target.value })} /></div>
                    </div>
                    {/* Qualifications */}
                    <div>
                      <label className="field-label">Professional Qualifications</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {meta.qualifications?.map((q, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {q}<button type="button" onClick={() => setMeta(p => ({ ...p, qualifications: p.qualifications?.filter((_,j) => j !== i) }))} className="text-blue-500 hover:text-blue-800 transition ml-0.5"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input className="input-field flex-1" placeholder="Add qualification…" value={newQual} onChange={e => setNewQual(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addQualification(); }}} />
                        <button type="button" onClick={addQualification} className="btn btn-outline btn-sm px-4">Add</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {[
                        {icon:<Shield className="w-4 h-4 text-blue-600" />,bg:"bg-blue-100",label:"License Number",value:meta.license_number || "Not set"},
                        {icon:<Award className="w-4 h-4 text-green-600" />,bg:"bg-green-100",label:"Specialization",value:meta.specialisation || "Not specified"},
                        {icon:<Calendar className="w-4 h-4 text-purple-600" />,bg:"bg-purple-100",label:"Experience",value:meta.years_of_experience ? `${meta.years_of_experience} years` : "Not specified"},
                        {icon:<Phone className="w-4 h-4 text-amber-600" />,bg:"bg-amber-100",label:"Phone",value:meta.phone || "Not provided"},
                        ...(meta.hospital_affiliation ? [{icon:<FileText className="w-4 h-4 text-teal-600" />,bg:"bg-teal-100",label:"Hospital",value:meta.hospital_affiliation}] : []),
                      ].map(item => (
                        <div key={item.label} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>{item.icon}</div>
                          <div><p className="text-xs text-gray-500">{item.label}</p><p className="font-semibold text-gray-900 text-sm">{item.value}</p></div>
                        </div>
                      ))}
                    </div>
                    {meta.qualifications && meta.qualifications.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Qualifications</p>
                        <div className="flex flex-wrap gap-2">
                          {meta.qualifications.map((q, i) => <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{q}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <ProviderDocuments providerType="vet" />

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-blue-600" /></div>
                <div><h3 className="font-bold text-gray-900 sora">Practice Location</h3><p className="text-xs text-gray-500">Where you provide veterinary services</p></div>
              </div>
              <div className="px-6 py-5">
                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className="field-label">Country</label><input className="input-field" placeholder="e.g. Kenya" value={meta.country || ""} onChange={e => setMeta({ ...meta, country: e.target.value })} /></div>
                    <div><label className="field-label">County</label><input className="input-field" placeholder="e.g. Nairobi" value={meta.county || ""} onChange={e => setMeta({ ...meta, county: e.target.value })} /></div>
                    <div><label className="field-label">Sub-county</label><input className="input-field" placeholder="e.g. Westlands" value={meta.sub_county || ""} onChange={e => setMeta({ ...meta, sub_county: e.target.value })} /></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[{label:"Country",value:meta.country},{label:"County",value:meta.county},{label:"Sub-county",value:meta.sub_county}].map(({label,value}) => (
                      <div key={label}><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p><p className="font-semibold text-gray-900 text-sm">{value || <span className="text-gray-400 font-normal">Not set</span>}</p></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 sora">Practice Overview</h3></div>
              <div className="p-5 space-y-4">
                {[
                  {icon:<Stethoscope className="w-4 h-4 text-green-600" />,bg:"bg-green-100",label:"Active Cases",value:"12"},
                  {icon:<Calendar className="w-4 h-4 text-blue-600" />,bg:"bg-blue-100",label:"Appointments Today",value:"5"},
                  {icon:<User className="w-4 h-4 text-purple-600" />,bg:"bg-purple-100",label:"Total Patients",value:"87"},
                  {icon:<Calendar className="w-4 h-4 text-teal-600" />,bg:"bg-teal-100",label:"Member Since",value:memberSince},
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>{item.icon}</div>
                    <div className="min-w-0 flex-1"><p className="text-xs text-gray-500">{item.label}</p><p className="font-bold text-gray-900 text-sm truncate">{item.value}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 sora">Account</h3></div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-gray-500">Role</span><span className="badge badge-info">Veterinarian</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Status</span><span className="flex items-center gap-1.5 font-semibold text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Active</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Verified</span><span className="flex items-center gap-1.5 font-semibold text-blue-600"><Shield className="w-3.5 h-3.5" />Verified Pro</span></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
              <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 sora">Quick Actions</h3></div>
              <div className="p-3 space-y-1">
                {[{label:"View Schedule",href:"/vet/appointments"},{label:"Manage Cases",href:"/vet/cases"},{label:"Clinical Records",href:"/clinical-records"},{label:"Update Availability",href:"/vet"}].map(a => (
                  <a key={a.href} href={a.href} className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all text-sm font-medium text-gray-700 group">
                    {a.label}<span className="opacity-0 group-hover:opacity-100 transition text-blue-500">→</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Verified badge */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-green-600" /></div>
                <div>
                  <h4 className="font-bold text-green-800 sora text-sm">Verified Professional</h4>
                  <p className="text-xs text-green-700 mt-0.5">Your credentials have been reviewed and approved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}