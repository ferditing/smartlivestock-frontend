/**
 * SmartLivestock — Profile Page
 * Professional user profile with editable info, location, and password change.
 * Matches the Landing page / auth page design system.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import rawKenyaData from "../data/kenya_locations_complete3.json";
import {
  User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Save, CheckCircle,
  PawPrint, Stethoscope, ShoppingBag, Edit3, Camera, Shield,
} from "lucide-react";

type LocationState = {
  county?: string; sub_county?: string; ward?: string; locality?: string;
};

type ProfileData = {
  name: string; email: string; phone: string; role: string;
  location?: LocationState; assigned_county?: string;
};

const ROLE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  farmer:   { label: "Farmer",           icon: PawPrint,    color: "text-green-600",  bg: "bg-green-100"  },
  vet:      { label: "Veterinarian",     icon: Stethoscope, color: "text-blue-600",   bg: "bg-blue-100"   },
  agrovet:  { label: "Agrovet Supplier", icon: ShoppingBag, color: "text-amber-600",  bg: "bg-amber-100"  },
  admin:    { label: "System Admin",     icon: Shield,      color: "text-purple-600", bg: "bg-purple-100" },
  subadmin: { label: "County Officer",   icon: Shield,      color: "text-teal-600",   bg: "bg-teal-100"   },
};

export default function Profile() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const kenyaData: Record<string, Record<string, string[]>> = rawKenyaData;

  const role = localStorage.getItem("role") || "farmer";

  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "", phone: "", role });
  const [location, setLocation] = useState<LocationState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Password change
  const [pwSection, setPwSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  // County search
  const [countySearch, setCountySearch] = useState("");
  const [filteredCounties, setFilteredCounties] = useState<string[]>(Object.keys(kenyaData).sort());
  const [showCountyDrop, setShowCountyDrop] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login", { replace: true }); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/me");
      const data = res.data;
      setProfile({ name: data.name || "", email: data.email || "", phone: data.phone || "", role: data.role || role, assigned_county: data.assigned_county });
      const loc = data.location || {};
      setLocation(loc);
      setCountySearch(loc.county || "");
    } catch {
      addToast("error", "Error", "Could not load profile");
    } finally { setLoading(false); }
  };

  const saveProfile = async () => {
    if (!profile.name.trim()) { addToast("error", "Validation", "Name is required"); return; }
    setSaving(true);
    try {
      await api.put("/auth/profile", { name: profile.name, phone: profile.phone, location });
      localStorage.setItem("userName", profile.name);
      addToast("success", "Saved", "Profile updated successfully");
      setEditMode(false);
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error || "Failed to save profile");
    } finally { setSaving(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) { addToast("error", "Validation", "All fields are required"); return; }
    if (newPw.length < 8) { addToast("error", "Validation", "New password must be at least 8 characters"); return; }
    if (newPw !== confirmPw) { addToast("error", "Validation", "New passwords do not match"); return; }
    setPwLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword: currentPw, newPassword: newPw });
      addToast("success", "Password Changed", "Your password has been updated");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwSection(false);
    } catch (err: any) {
      addToast("error", "Error", err?.response?.data?.error || "Failed to change password");
    } finally { setPwLoading(false); }
  };

  const handleCountySearch = (val: string) => {
    setCountySearch(val);
    setFilteredCounties(val.trim() ? Object.keys(kenyaData).sort().filter(c => c.toLowerCase().includes(val.toLowerCase())) : Object.keys(kenyaData).sort());
    setShowCountyDrop(true);
  };

  const meta = ROLE_META[profile.role] || ROLE_META.farmer;
  const RoleIcon = meta.icon;
  const initials = profile.name ? profile.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  const pwStrength = (() => {
    if (!newPw) return 0;
    let s = 0;
    if (newPw.length >= 8) s++;
    if (/[A-Z]/.test(newPw)) s++;
    if (/[0-9]/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    return s;
  })();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="animate-shimmer h-48 rounded-2xl" />
        <div className="animate-shimmer h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeInUp">

      {/* ── Header ── */}
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-sub">Manage your account information and security settings</p>
      </div>

      {/* ── Profile hero card ── */}
      <div className="card overflow-hidden">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 0%, transparent 50%)" }} />
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-2xl font-bold sora border-4 border-white shadow-lg">
                {initials}
              </div>
              <button type="button" className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition opacity-0 group-hover:opacity-100">
                <Camera className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEditMode(e => !e)}
              className={`btn btn-sm flex items-center gap-1.5 ${editMode ? "btn-outline" : "btn-primary"}`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sora">{profile.name || "—"}</h2>
              <p className="text-gray-500 text-sm">{profile.email}</p>
              {profile.phone && <p className="text-gray-500 text-sm">{profile.phone}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${meta.bg} ${meta.color}`}>
                <RoleIcon className="w-4 h-4" />
                {meta.label}
              </div>
              {profile.assigned_county && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                  <MapPin className="w-3.5 h-3.5" /> {profile.assigned_county}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile info form ── */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 sora">Personal Information</h3>
            <p className="text-xs text-gray-500 mt-0.5">Your name and contact details</p>
          </div>
          {editMode && (
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          )}
        </div>
        <div className="card-body space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="field-label">
                <User className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Full Name
              </label>
              <input
                type="text"
                className={`input-field ${!editMode ? "bg-gray-50 cursor-default" : ""}`}
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                readOnly={!editMode}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="field-label">
                <Mail className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Email Address
              </label>
              <input
                type="email"
                className="input-field bg-gray-50 cursor-default"
                value={profile.email}
                readOnly
                title="Email cannot be changed"
              />
              <p className="field-hint">Contact support to change your email</p>
            </div>
            <div>
              <label className="field-label">
                <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Phone Number
              </label>
              <input
                type="tel"
                className={`input-field ${!editMode ? "bg-gray-50 cursor-default" : ""}`}
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                readOnly={!editMode}
                placeholder="+254 700 000 000"
              />
            </div>
            <div>
              <label className="field-label">Role</label>
              <div className={`input-field bg-gray-50 cursor-default flex items-center gap-2 ${meta.color}`}>
                <RoleIcon className="w-4 h-4" /> {meta.label}
              </div>
            </div>
          </div>

          {/* Location */}
          {(profile.role === "farmer" || profile.role === "vet" || profile.role === "agrovet") && (
            <div className="border-t border-gray-100 pt-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" /> Location
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* County search */}
                <div className="relative sm:col-span-2">
                  <label className="field-label">County</label>
                  <input
                    type="text"
                    className={`input-field ${!editMode ? "bg-gray-50 cursor-default" : ""}`}
                    value={countySearch}
                    onChange={e => editMode && handleCountySearch(e.target.value)}
                    onFocus={() => { if (editMode) { setFilteredCounties(Object.keys(kenyaData).sort()); setShowCountyDrop(true); } }}
                    onBlur={() => setTimeout(() => setShowCountyDrop(false), 150)}
                    readOnly={!editMode}
                    placeholder="Select your county…"
                    autoComplete="off"
                  />
                  {showCountyDrop && editMode && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto scroll-area">
                      {filteredCounties.map(county => (
                        <button key={county} type="button" onMouseDown={e => { e.preventDefault(); setLocation({ county, sub_county: undefined, ward: undefined }); setCountySearch(county); setShowCountyDrop(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 hover:text-green-700 transition">{county}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="field-label">Constituency</label>
                  <select className={`select-field ${!editMode ? "bg-gray-50 cursor-default pointer-events-none" : ""}`}
                    disabled={!editMode || !location.county}
                    value={location.sub_county || ""}
                    onChange={e => setLocation({ ...location, sub_county: e.target.value, ward: undefined })}>
                    <option value="">Select Constituency</option>
                    {location.county && kenyaData[location.county] && Object.keys(kenyaData[location.county]).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="field-label">Ward</label>
                  <select className={`select-field ${!editMode ? "bg-gray-50 cursor-default pointer-events-none" : ""}`}
                    disabled={!editMode || !location.sub_county}
                    value={location.ward || ""}
                    onChange={e => setLocation({ ...location, ward: e.target.value })}>
                    <option value="">Select Ward</option>
                    {location.county && location.sub_county && kenyaData[location.county]?.[location.sub_county]?.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="field-label">Locality / Village <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" className={`input-field ${!editMode ? "bg-gray-50 cursor-default" : ""}`}
                    value={location.locality || ""}
                    onChange={e => setLocation({ ...location, locality: e.target.value })}
                    readOnly={!editMode}
                    placeholder="e.g. Westlands, Kibera" />
                </div>
              </div>
            </div>
          )}

          {/* Save row (bottom) */}
          {editMode && (
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setEditMode(false)} className="btn btn-outline btn-sm">Cancel</button>
              <button type="button" onClick={saveProfile} disabled={saving} className="btn btn-primary btn-sm flex items-center gap-1.5">
                {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Security / Password ── */}
      <div className="card">
        <div
          className="card-header flex items-center justify-between cursor-pointer select-none hover:bg-gray-50/50 transition rounded-t-2xl"
          onClick={() => setPwSection(p => !p)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <Lock className="w-4.5 h-4.5 w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 sora">Security</h3>
              <p className="text-xs text-gray-500 mt-0.5">Change your account password</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${pwSection ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {pwSection ? "Hide" : "Change Password"}
          </span>
        </div>

        {pwSection && (
          <div className="card-body animate-fadeInUp">
            <form onSubmit={changePassword} className="space-y-4 max-w-md">
              {/* Current password */}
              <div>
                <label className="field-label">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPw.current ? "text" : "password"}
                    className="input-field"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="field-label">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPw.new ? "text" : "password"}
                    className="input-field"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPw && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength ? ["","bg-red-400","bg-amber-400","bg-yellow-400","bg-green-500"][pwStrength] : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${pwStrength <= 1 ? "text-red-500" : pwStrength === 2 ? "text-amber-500" : pwStrength === 3 ? "text-yellow-600" : "text-green-600"}`}>
                      {["","Weak","Fair","Good","Strong"][pwStrength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="field-label">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPw.confirm ? "text" : "password"}
                    className="input-field"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPw.length > 0 && newPw !== confirmPw && (
                  <p className="field-error"><span className="w-3 h-3 text-red-500 flex-shrink-0">✗</span> Passwords don't match</p>
                )}
                {confirmPw.length > 0 && newPw === confirmPw && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={pwLoading} className="btn btn-primary flex items-center gap-2">
                  {pwLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {pwLoading ? "Updating…" : "Update Password"}
                </button>
                <button type="button" onClick={() => { setPwSection(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }} className="btn btn-ghost text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Account info strip ── */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Account active</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-xs">© {new Date().getFullYear()} SmartLivestock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}