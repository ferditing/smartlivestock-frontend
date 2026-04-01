/**
 * SmartLivestock — FarmerProfile v3 (Premium Redesign)
 * • Full-bleed hero + animated gradient cover + initials avatar
 * • Inline completion ring + missing-fields nudge panel
 * • 3 tabs: Overview · Farm Info · Location
 * • Animated stat counters · Verified badge
 * • Sidebar: stat rows, quick-action tiles, pro-tip card
 * All API calls preserved (GET /profile/me · PUT /profile/me)
 */

import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useToast }    from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, MapPin, Calendar, Edit2, Save, X, Loader2,
  Package, Tractor, PawPrint, TreePine, Phone,
  ShoppingCart, Activity, BarChart2, ArrowRight,
  CheckCircle, ChevronRight, Award, Leaf,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────── */
type FarmerProfileMeta = {
  county?: string; subcounty?: string; ward?: string; locality?: string;
  farm_size?: string; livestock_count?: number; farm_type?: string; phone?: string;
};
type FarmerUser = { id: number; name: string; email: string; role: "farmer"; profile_meta: FarmerProfileMeta; created_at?: string; };
type ActiveTab = "overview" | "farm" | "location";

/* ─── Farm config ─────────────────────────────────────────────── */
const FARM_LABEL: Record<string,string> = { dairy:"Dairy Farming", beef:"Beef Farming", poultry:"Poultry Farming", mixed:"Mixed Farming", other:"Other" };
const FARM_EMOJI: Record<string,string> = { dairy:"🐄", beef:"🥩", poultry:"🐔", mixed:"🌾", other:"🏡" };
const FARM_COVER: Record<string,string> = {
  dairy:   "from-blue-600 via-cyan-500 to-blue-700",
  beef:    "from-red-700 via-rose-500 to-orange-600",
  poultry: "from-amber-500 via-orange-400 to-yellow-500",
  mixed:   "from-green-600 via-emerald-500 to-teal-600",
  other:   "from-slate-600 via-gray-500 to-zinc-700",
  default: "from-green-700 via-emerald-500 to-teal-600",
};

/* ─── Completion score ────────────────────────────────────────── */
const FIELDS: { key: string; label: string; src: "user"|"meta" }[] = [
  { key:"name",            label:"Full name",       src:"user" },
  { key:"email",           label:"Email address",   src:"user" },
  { key:"phone",           label:"Phone number",    src:"meta" },
  { key:"county",          label:"County",          src:"meta" },
  { key:"subcounty",       label:"Sub-county",      src:"meta" },
  { key:"farm_size",       label:"Farm size",       src:"meta" },
  { key:"livestock_count", label:"Livestock count", src:"meta" },
  { key:"farm_type",       label:"Farm type",       src:"meta" },
];
function calcPct(u: FarmerUser, m: FarmerProfileMeta) {
  const filled = FIELDS.filter(f => { const v = f.src==="user" ? (u as any)[f.key] : (m as any)[f.key]; return v!=null && v!==""; });
  return Math.round((filled.length / FIELDS.length) * 100);
}
function getMissing(u: FarmerUser, m: FarmerProfileMeta) {
  return FIELDS.filter(f => { const v = f.src==="user" ? (u as any)[f.key] : (m as any)[f.key]; return !v && v!==0; }).map(f => f.label);
}

/* ─── Animated counter ────────────────────────────────────────── */
function Counter({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current || to === 0) { setVal(to); return; }
    ran.current = true;
    const frames = 48, dur = 800; let f = 0;
    const id = setInterval(() => { f++; setVal(Math.min(Math.round(to*(f/frames)), to)); if(f>=frames) clearInterval(id); }, dur/frames);
  }, [to]);
  return <>{val}</>;
}

/* ─── Completion ring ─────────────────────────────────────────── */
function Ring({ pct }: { pct: number }) {
  const r = 22, c = 2 * Math.PI * r;
  const color = pct>=80 ? "#16a34a" : pct>=50 ? "#d97706" : "#ef4444";
  const track = pct>=80 ? "#dcfce7" : pct>=50 ? "#fef3c7" : "#fee2e2";
  return (
    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke={track} strokeWidth="5" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(pct/100)*c} ${c}`} strokeLinecap="round"
          style={{ transition:"stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <span className="relative z-10 text-sm font-black" style={{ color }}>{pct}%</span>
    </div>
  );
}

/* ─── FieldTile ───────────────────────────────────────────────── */
function FieldTile({ label, value, icon, grad }: { label:string; value:string; icon:React.ReactNode; grad:string }) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-3.5 transition-all duration-200">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${grad}`} style={{ boxShadow:"0 2px 8px rgba(0,0,0,.14)" }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
        <p className="font-bold text-gray-900 text-sm mt-0.5 truncate">
          {value || <span className="font-normal text-gray-400 italic text-xs">Not specified</span>}
        </p>
      </div>
    </div>
  );
}

/* ─── StatRow ─────────────────────────────────────────────────── */
function StatRow({ label, value, icon, bg }: { label:string; value:React.ReactNode; icon:React.ReactNode; bg:string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</p>
        <p className="font-bold text-gray-900 text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <Layout role="farmer">
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-44 bg-gray-200 rounded-xl" />
        <div className="h-56 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4"><div className="h-10 bg-gray-100 rounded-xl w-64" /><div className="h-52 bg-gray-100 rounded-2xl" /></div>
          <div className="space-y-4"><div className="h-44 bg-gray-100 rounded-2xl" /><div className="h-36 bg-gray-100 rounded-2xl" /></div>
        </div>
      </div>
    </Layout>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
export default function FarmerProfile() {
  const navigate     = useNavigate();
  const { addToast } = useToast();
  const [user,        setUser]        = useState<FarmerUser|null>(null);
  const [meta,        setMeta]        = useState<FarmerProfileMeta>({});
  const [editing,     setEditing]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [tab,         setTab]         = useState<ActiveTab>("overview");
  const [showMissing, setShowMissing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/profile/me");
      setUser(res.data); setMeta(res.data.profile_meta || {});
    } catch { addToast("error","Error","Failed to load profile"); }
    finally  { setLoading(false); }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/profile/me", { profile_meta: meta });
      addToast("success","Saved","Profile updated successfully");
      setEditing(false); await load();
    } catch { addToast("error","Error","Failed to update profile"); }
    finally  { setSaving(false); }
  };

  const cancel = () => { setEditing(false); setMeta(user?.profile_meta || {}); };

  if (loading) return <Skeleton />;
  if (!user)   return (
    <Layout role="farmer">
      <div className="empty-state">
        <div className="empty-state-icon"><User className="w-7 h-7" /></div>
        <h3 className="empty-state-title">Profile Not Found</h3>
        <p className="empty-state-sub">We couldn't load your profile. Try refreshing.</p>
      </div>
    </Layout>
  );

  const initials    = user.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB",{month:"long",year:"numeric"}) : "—";
  const pct         = calcPct(user, meta);
  const missing     = getMissing(user, meta);
  const coverGrad   = FARM_COVER[meta.farm_type||""] || FARM_COVER.default;
  const isVerified  = pct >= 80;

  const TABS: { id:ActiveTab; label:string; icon:React.ReactNode }[] = [
    { id:"overview",  label:"Overview",  icon:<User className="w-3.5 h-3.5" />    },
    { id:"farm",      label:"Farm Info", icon:<Tractor className="w-3.5 h-3.5" /> },
    { id:"location",  label:"Location",  icon:<MapPin className="w-3.5 h-3.5" />  },
  ];

  return (
    <Layout role="farmer">
      <div className="max-w-5xl mx-auto space-y-6 animate-fadeInUp">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-sub">Manage your farming information and account settings</p>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={cancel} className="btn btn-outline btn-sm flex items-center gap-1.5"><X className="w-3.5 h-3.5" />Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-primary btn-sm flex items-center gap-1.5">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn btn-primary btn-sm flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5" />Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ════ HERO IDENTITY CARD ════ */}
        <div className="card overflow-hidden">
          {/* Cover */}
          <div className={`relative h-36 sm:h-44 bg-gradient-to-r ${coverGrad} overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
            <div className="absolute -top-10 -right-10 w-52 h-52 bg-white/5 rounded-full" />
            <div className="absolute -bottom-14 -left-10 w-44 h-44 bg-white/5 rounded-full" />
            <div className="absolute top-5 right-7 text-7xl opacity-15 select-none pointer-events-none">
              {meta.farm_type ? FARM_EMOJI[meta.farm_type] : "🌾"}
            </div>
            {isVerified && (
              <div className="absolute top-4 left-5 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />Verified Farmer
              </div>
            )}
          </div>

          {/* Avatar + identity */}
          <div className="px-5 sm:px-7 pb-5 flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white flex items-center justify-center text-white text-2xl font-black sora flex-shrink-0 bg-gradient-to-br ${coverGrad}`}
              style={{ boxShadow:"0 4px 20px rgba(0,0,0,.22)" }}>
              {initials}
            </div>

            <div className="sm:pb-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 sora">{user.name}</h2>
                {isVerified && <Award className="w-5 h-5 text-green-600 flex-shrink-0" />}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1.5 text-sm text-gray-500"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                {meta.county && <span className="flex items-center gap-1.5 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" />{[meta.county,meta.subcounty].filter(Boolean).join(", ")}</span>}
                {meta.phone  && <span className="flex items-center gap-1.5 text-sm text-gray-500"><Phone className="w-3.5 h-3.5" />{meta.phone}</span>}
              </div>
            </div>

            {/* Ring */}
            <button onClick={() => setShowMissing(v=>!v)} className="sm:pb-2 flex items-center gap-2.5 hover:opacity-80 transition-opacity" type="button">
              <Ring pct={pct} />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-700">Profile</p>
                <p className="text-xs text-gray-400">completeness</p>
              </div>
            </button>
          </div>

          {/* Missing fields nudge */}
          {showMissing && missing.length > 0 && (
            <div className="mx-5 sm:mx-7 mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fadeIn">
              <p className="text-xs font-bold text-amber-800 mb-2">Complete your profile to reach 100%</p>
              <div className="flex flex-wrap gap-1.5">
                {missing.map(f => (
                  <span key={f} className="bg-amber-100 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Mini stat strip */}
          <div className="border-t border-gray-100">
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              {[
                { label:"Livestock", value: meta.livestock_count, emoji:"🐄", isNum:true },
                { label:"Farm size", value: meta.farm_size ? `${meta.farm_size} ac` : null, emoji:"🌾", isNum:false },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center py-3.5 px-3">
                  <span className="text-lg">{s.emoji}</span>
                  <p className="text-sm font-black text-gray-900 sora mt-0.5 text-center">
                    {s.isNum && typeof s.value === "number" ? <Counter to={s.value} /> : (s.value ?? "—")}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Member since</span>{" "}
              <span className="text-xs font-bold text-gray-900">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* ════ MAIN GRID ════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left col */}
          <div className="lg:col-span-2 space-y-5">

            {/* Tabs */}
            <div className="tabs tabs-underline">
              {TABS.map(t => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`tab flex items-center gap-1.5 ${tab===t.id ? "active":""}`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {tab==="overview" && (
              <div className="card overflow-hidden animate-fadeIn">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="card-icon-header">
                      <div className="card-icon-wrap card-icon-green"><User className="w-5 h-5 text-white" /></div>
                      <div><h3 className="font-bold text-gray-900 sora">Account Overview</h3><p className="text-xs text-gray-400">Your personal details</p></div>
                    </div>
                    {!editing && <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm flex items-center gap-1.5"><Edit2 className="w-3 h-3" />Edit</button>}
                  </div>
                </div>
                <div className="card-body space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldTile label="Full Name"    value={user.name}   icon={<User className="w-4 h-4 text-white" />}     grad="from-green-500 to-green-700"  />
                    <FieldTile label="Email"        value={user.email}  icon={<Mail className="w-4 h-4 text-white" />}     grad="from-blue-500 to-blue-700"    />
                    <FieldTile label="Member Since" value={memberSince} icon={<Calendar className="w-4 h-4 text-white" />} grad="from-purple-500 to-purple-700" />
                    <FieldTile label="Farm Type"    value={meta.farm_type ? `${FARM_EMOJI[meta.farm_type]} ${FARM_LABEL[meta.farm_type]}` : ""} icon={<Leaf className="w-4 h-4 text-white" />} grad="from-amber-500 to-amber-700" />
                  </div>
                  {/* Progress bar */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-600">Profile completeness</p>
                      <span className={`text-xs font-black ${pct>=80?"text-green-600":pct>=50?"text-amber-600":"text-red-500"}`}>{pct}%</span>
                    </div>
                    <div className="progress-wrap h-2">
                      <div className="progress-bar h-2" style={{ width:`${pct}%`, background: pct>=80 ? "linear-gradient(90deg,#16a34a,#059669)" : pct>=50 ? "linear-gradient(90deg,#d97706,#ea580c)" : "linear-gradient(90deg,#ef4444,#dc2626)" }} />
                    </div>
                    {pct < 100 && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        {missing.length} field{missing.length!==1?"s":""} remaining —{" "}
                        <button onClick={() => { setTab("farm"); setEditing(true); }} className="text-green-600 font-semibold hover:underline">complete now</button>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FARM INFO */}
            {tab==="farm" && (
              <div className="card overflow-hidden animate-fadeIn">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="card-icon-header">
                      <div className="card-icon-wrap" style={{ background:"linear-gradient(135deg,#16a34a,#059669)", boxShadow:"0 2px 8px rgba(0,0,0,.15)" }}>
                        <Tractor className="w-5 h-5 text-white" />
                      </div>
                      <div><h3 className="font-bold text-gray-900 sora">Farm Information</h3><p className="text-xs text-gray-400">Your farming operation details</p></div>
                    </div>
                    {!editing && <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm flex items-center gap-1.5"><Edit2 className="w-3 h-3" />Edit</button>}
                  </div>
                </div>
                <div className="card-body">
                  {editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="field-label">Phone Number</label><input className="input-field" type="tel" placeholder="e.g. 0712 345678" value={meta.phone||""} onChange={e=>setMeta({...meta,phone:e.target.value})} /></div>
                      <div><label className="field-label">Farm Size (Acres)</label><input className="input-field" placeholder="e.g. 10" value={meta.farm_size||""} onChange={e=>setMeta({...meta,farm_size:e.target.value})} /></div>
                      <div><label className="field-label">Livestock Count</label><input className="input-field" type="number" min="0" placeholder="e.g. 50" value={meta.livestock_count??""} onChange={e=>setMeta({...meta,livestock_count:parseInt(e.target.value)||0})} /></div>
                      <div><label className="field-label">Farm Type</label>
                        <select className="select-field" value={meta.farm_type||""} onChange={e=>setMeta({...meta,farm_type:e.target.value})}>
                          <option value="">Select farm type</option>
                          <option value="dairy">🐄 Dairy Farming</option>
                          <option value="beef">🥩 Beef Farming</option>
                          <option value="poultry">🐔 Poultry Farming</option>
                          <option value="mixed">🌾 Mixed Farming</option>
                          <option value="other">🏡 Other</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FieldTile label="Phone"          value={meta.phone||""}                                                                  icon={<Phone className="w-4 h-4 text-white" />}    grad="from-gray-500 to-gray-700"   />
                      <FieldTile label="Farm Size"      value={meta.farm_size ? `${meta.farm_size} acres` : ""}                                icon={<Tractor className="w-4 h-4 text-white" />}  grad="from-green-500 to-green-700" />
                      <FieldTile label="Livestock Count" value={meta.livestock_count ? `${meta.livestock_count} animals` : ""}                icon={<PawPrint className="w-4 h-4 text-white" />}  grad="from-blue-500 to-blue-700"   />
                      <FieldTile label="Farm Type"       value={meta.farm_type ? `${FARM_EMOJI[meta.farm_type]} ${FARM_LABEL[meta.farm_type]}` : ""} icon={<TreePine className="w-4 h-4 text-white" />} grad="from-amber-500 to-amber-700" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LOCATION */}
            {tab==="location" && (
              <div className="card overflow-hidden animate-fadeIn">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="card-icon-header">
                      <div className="card-icon-wrap card-icon-blue"><MapPin className="w-5 h-5 text-white" /></div>
                      <div><h3 className="font-bold text-gray-900 sora">Farm Location</h3><p className="text-xs text-gray-400">Where your farm is located</p></div>
                    </div>
                    {!editing && <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm flex items-center gap-1.5"><Edit2 className="w-3 h-3" />Edit</button>}
                  </div>
                </div>
                <div className="card-body space-y-4">
                  {editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {([
                        { key:"county",    label:"County",     ph:"e.g. Nairobi"   },
                        { key:"subcounty", label:"Sub-county", ph:"e.g. Westlands" },
                        { key:"ward",      label:"Ward",       ph:"e.g. Parklands" },
                        { key:"locality",  label:"Locality",   ph:"e.g. Kibera"    },
                      ] as { key: keyof FarmerProfileMeta; label:string; ph:string }[]).map(f => (
                        <div key={f.key}><label className="field-label">{f.label}</label>
                          <input className="input-field" placeholder={f.ph} value={(meta[f.key] as string)||""}
                            onChange={e=>setMeta({...meta,[f.key]:e.target.value})} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FieldTile label="County"     value={meta.county||""}    icon={<MapPin className="w-4 h-4 text-white" />} grad="from-blue-500 to-blue-700"    />
                      <FieldTile label="Sub-county" value={meta.subcounty||""} icon={<MapPin className="w-4 h-4 text-white" />} grad="from-indigo-500 to-indigo-700" />
                      <FieldTile label="Ward"       value={meta.ward||""}      icon={<MapPin className="w-4 h-4 text-white" />} grad="from-violet-500 to-violet-700" />
                      <FieldTile label="Locality"   value={meta.locality||""}  icon={<MapPin className="w-4 h-4 text-white" />} grad="from-purple-500 to-purple-700" />
                    </div>
                  )}
                  {!editing && (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <p className="text-xs text-blue-700">
                        Your location helps nearby vets and agrovets find your farm.{" "}
                        {!meta.county && <button onClick={() => setEditing(true)} className="font-bold underline">Add location →</button>}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-5">

            {/* Account card */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-green"><User className="w-5 h-5 text-white" /></div>
                  <div><h3 className="font-bold text-gray-900 sora text-sm">Account</h3><p className="text-xs text-gray-400">Account summary</p></div>
                </div>
              </div>
              <div className="card-body space-y-2.5">
                {[
                  { label:"Role",    node:<span className="badge badge-success">Farmer</span> },
                  { label:"Status",  node:<span className="flex items-center gap-1.5 text-xs font-bold text-green-600"><span className="status-dot status-online"/>Active</span> },
                  { label:"Joined",  node:<span className="text-xs font-bold text-gray-900">{memberSince}</span> },
                  { label:"Profile", node:<span className={`text-xs font-black ${pct>=80?"text-green-600":"text-amber-600"}`}>{pct}% complete</span> },
                ].map(r=>(
                  <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{r.label}</span>{r.node}
                  </div>
                ))}
              </div>
            </div>

            {/* Farm overview */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap" style={{ background:"linear-gradient(135deg,#2563eb,#4f46e5)", boxShadow:"0 2px 8px rgba(0,0,0,.15)" }}>
                    <BarChart2 className="w-5 h-5 text-white" />
                  </div>
                  <div><h3 className="font-bold text-gray-900 sora text-sm">Farm Overview</h3><p className="text-xs text-gray-400">Key metrics</p></div>
                </div>
              </div>
              <div className="card-body space-y-3.5">
                <StatRow label="Total Animals" bg="bg-green-100"  icon={<PawPrint className="w-4 h-4 text-green-600" />}  value={meta.livestock_count!=null ? <Counter to={meta.livestock_count} /> : "—"} />
                <StatRow label="Farm Size"     bg="bg-blue-100"   icon={<Tractor className="w-4 h-4 text-blue-600" />}   value={meta.farm_size ? `${meta.farm_size} acres` : "—"} />
                <StatRow label="Farm Type"     bg="bg-amber-100"  icon={<TreePine className="w-4 h-4 text-amber-600" />} value={meta.farm_type ? `${FARM_EMOJI[meta.farm_type]} ${FARM_LABEL[meta.farm_type]}` : "—"} />
                <StatRow label="Member Since"  bg="bg-purple-100" icon={<Calendar className="w-4 h-4 text-purple-600" />} value={memberSince} />
              </div>
            </div>

            {/* Quick actions */}
            <div className="card overflow-hidden">
              <div className="card-header"><h3 className="font-bold text-gray-900 sora text-sm">Quick Actions</h3></div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label:"My Animals",  icon:<PawPrint className="w-5 h-5" />,     href:"/farmer/animals",          color:"qa-tile-green"  },
                    { label:"Book Appt",   icon:<Calendar className="w-5 h-5" />,     href:"/farmer/appointments/new", color:"qa-tile-blue"   },
                    { label:"Marketplace", icon:<ShoppingCart className="w-5 h-5" />, href:"/farmer/marketplace",      color:"qa-tile-amber"  },
                    { label:"My Orders",   icon:<Package className="w-5 h-5" />,      href:"/farmer/orders",           color:"qa-tile-purple" },
                  ].map(a=>(
                    <button key={a.href} type="button" onClick={()=>navigate(a.href)} className={`qa-tile qa-tile-sm ${a.color}`}>
                      {a.icon}<span className="leading-tight text-center px-0.5">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity feed */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 sora text-sm">Recent Activity</h3>
                  <button onClick={()=>navigate("/farmer/animals")} className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-0.5">
                    All<ChevronRight className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </div>
              <div className="px-5 py-2 space-y-0">
                {[
                  { icon:<PawPrint className="w-3.5 h-3.5 text-green-600"/>, bg:"bg-green-100", text:"Profile updated",     time:"Just now" },
                  { icon:<Calendar className="w-3.5 h-3.5 text-blue-600"/>,  bg:"bg-blue-100",  text:"Appointment booked",  time:"2h ago"   },
                  { icon:<Activity className="w-3.5 h-3.5 text-red-600"/>,   bg:"bg-red-100",   text:"Health report filed",  time:"1d ago"   },
                ].map((a,i)=>(
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center flex-shrink-0`}>{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{a.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0"/>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip card */}
            <div className="rounded-2xl overflow-hidden" style={{ background:"linear-gradient(135deg,#14532d,#16a34a)" }}>
              <div className="px-5 py-4">
                <p className="text-xs font-black text-green-200 uppercase tracking-widest">Pro Tip 🌱</p>
                <p className="text-white font-semibold text-sm mt-1.5 leading-relaxed">
                  A complete profile improves your matches with nearby vets and agrovets.
                </p>
                <button onClick={() => { setTab("farm"); setEditing(true); }}
                  className="mt-3 text-xs font-bold text-green-200 hover:text-white flex items-center gap-1 transition-colors">
                  Complete now<ArrowRight className="w-3 h-3"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}