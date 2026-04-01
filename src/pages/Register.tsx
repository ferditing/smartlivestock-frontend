/**
 * SmartLivestock — Register Page
 * Matches Landing page design system (Sora + Plus Jakarta Sans, green tokens, shared CSS)
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import rawKenyaData from "../data/kenya_locations_complete3.json";
import { useToast } from "../context/ToastContext";
import { User, Lock, MapPin, Eye, EyeOff, Loader2, CheckCircle, XCircle, ArrowLeft, PawPrint, Stethoscope, ShoppingBag } from "lucide-react";
import { SHARED_STYLES } from "./Landing";

type LocationState = { lat?: number; lng?: number; county?: string; sub_county?: string; ward?: string; locality?: string };

const ROLE_OPTIONS = [
  { value: "farmer", label: "Farmer", icon: PawPrint, desc: "Manage livestock, book vets, order supplies", color: "border-green-300 bg-green-50 text-green-700" },
  { value: "vet", label: "Veterinarian", icon: Stethoscope, desc: "Connect with farmers, manage appointments", color: "border-blue-300 bg-blue-50 text-blue-700" },
  { value: "agrovet", label: "Agrovet Supplier", icon: ShoppingBag, desc: "List products, reach farmers in your area", color: "border-amber-300 bg-amber-50 text-amber-700" },
];

export default function Register() {
  const navigate = useNavigate();
  const kenyaData: Record<string, Record<string, string[]>> = rawKenyaData;
  const { addToast } = useToast();
  const countyList = Object.keys(kenyaData).sort();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "", confirmPassword: "" });
  const [location, setLocation] = useState<LocationState>({});
  const [countySearch, setCountySearch] = useState("");
  const [filteredCounties, setFilteredCounties] = useState<string[]>(countyList);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [gpsTried, setGpsTried] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if ((form.role === "vet" || form.role === "agrovet") && gpsStatus === "granted") detectLocation();
  }, [form.role]);

  const detectLocation = () => {
    if (!navigator.geolocation) { addToast("error", "Location Error", "Geolocation not supported"); return; }
    if (gpsTried) return;
    setGpsTried(true); setGpsStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation(prev => ({ ...prev, lat, lng })); setGpsStatus("granted");
        addToast("success", "Location Found", "Using your current location");
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=en`);
          const data = await res.json();
          const addr = data.address || {};
          const norm = (s?: string) => (s || "").toLowerCase().replace(/\s+county$/i, "").replace(/\s+/g, " ").trim();
          const addrCounty = addr.county || addr.region || addr.state || "";
          const addrSub = addr.state_district || addr.suburb || addr.town || addr.village || "";
          const countyMatch = Object.keys(kenyaData).find(k => { const nk = norm(k); const na = norm(addrCounty); return nk === na || nk.includes(na) || na.includes(nk); });
          const chosenCounty = countyMatch || addrCounty.replace(/\s*County$/i, "").trim() || undefined;
          let chosenSub: string | undefined;
          if (chosenCounty && kenyaData[chosenCounty]) {
            chosenSub = Object.keys(kenyaData[chosenCounty]).find(s => { const ns = norm(s); const na = norm(addrSub); return ns === na || ns.includes(na) || na.includes(ns); });
          }
          setLocation(prev => ({ ...prev, county: chosenCounty || prev.county, sub_county: chosenSub || prev.sub_county, locality: addr.village || addr.town || addr.suburb || prev.locality }));
        } catch { addToast("warning", "Location Details", "Could not fetch detailed location info"); }
      },
      () => { setGpsStatus("denied"); addToast("error", "Location Access", "Enable location or select manually"); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateForm = () => {
    if (!form.name.trim()) { addToast("error", "Validation", "Name is required"); return false; }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { addToast("error", "Validation", "Valid email is required"); return false; }
    if (!form.phone.trim()) { addToast("error", "Validation", "Phone number is required"); return false; }
    if (!form.role) { addToast("error", "Validation", "Please select a role"); return false; }
    if (form.password.length < 6) { addToast("error", "Validation", "Password must be at least 6 characters"); return false; }
    if (form.password !== form.confirmPassword) { addToast("error", "Validation", "Passwords do not match"); return false; }
    if (!location.county) { addToast("warning", "Location Required", "Please select your county"); return false; }
    if (!location.sub_county) { addToast("warning", "Location Required", "Please select your constituency"); return false; }
    return true;
  };

  const handleCountySearch = (value: string) => {
    setCountySearch(value);
    setFilteredCounties(value.trim() ? countyList.filter(c => c.toLowerCase().includes(value.toLowerCase())) : countyList);
    setShowCountyDropdown(true);
  };

  const selectCounty = (county: string) => {
    setLocation({ ...location, county, sub_county: undefined, ward: undefined });
    setCountySearch(county); setShowCountyDropdown(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await api.post("/auth/register", { ...form, location });
      addToast("success", "Registration Successful", "Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      let msg = err?.response?.data?.error;
      if (!msg) {
        if (err?.code === "ERR_NETWORK") msg = "Cannot reach server. Is the backend running?";
        else msg = err?.message || "Registration failed";
      }
      addToast("error", "Registration Failed", msg);
    } finally { setLoading(false); }
  };

  const showLocation = form.role === "vet" || form.role === "agrovet" || form.role === "farmer";
  const pwMatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  return (
    <div className="min-h-screen flex text-gray-900 bg-gray-50">
      <style>{SHARED_STYLES}</style>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 auth-side flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blob-anim" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blob-anim" style={{ animationDelay: "3s" }} />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition text-sm mb-10">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur border border-white/20">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white sora">SmartLivestock</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 sora leading-tight">Join Kenya's<br />livestock platform</h2>
          <p className="text-white/70 text-base mb-10 leading-relaxed">Create your account and start managing livestock, connecting with vets, or listing your products today.</p>

          <div className="space-y-4">
            {[
              "Track all livestock health records with AI",
              "Access 300+ verified agrovet shops",
              "Book appointments with 150+ vets",
              "Weather forecasts for all 47 counties",
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-green-300" />
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-white/50 text-xs">© {new Date().getFullYear()} SmartLivestock. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl animate-fadeInUp py-4">
          {/* Mobile header */}
          <div className="lg:hidden mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 sora">SmartLivestock</span>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 sora">Create your account</h1>
            <p className="text-gray-500 mt-1 text-sm">Join as farmer, veterinarian, or agrovet supplier</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-400" />

            <form onSubmit={submit} className="p-8 space-y-7">
              {/* Personal info */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm"><User className="w-4 h-4 text-green-600" /> Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={loading} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                    <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={loading} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                    <input className="input-field" placeholder="+254 700 000 000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} disabled={loading} />
                  </div>
                </div>
              </div>

              {/* Role selection */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm"><User className="w-4 h-4 text-green-600" /> I am joining as… *</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ROLE_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => {
                      setForm({ ...form, role: opt.value });
                      if (opt.value === "vet" || opt.value === "agrovet") { setGpsTried(false); detectLocation(); }
                    }}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${form.role === opt.value ? opt.color + " border-opacity-100 shadow-md" : "border-gray-200 hover:border-gray-300 bg-gray-50"}`}>
                      <opt.icon className={`w-6 h-6 ${form.role === opt.value ? "" : "text-gray-400"}`} />
                      <span className="font-semibold text-sm">{opt.label}</span>
                      <span className="text-xs text-gray-500 leading-tight">{opt.desc}</span>
                      {form.role === opt.value && <CheckCircle className="absolute top-2 right-2 w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Lock className="w-4 h-4 text-green-600" /> Set Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} className="input-field" style={{ paddingRight: "2.75rem" }} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} disabled={loading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password.length > 0 && form.password.length < 6 && <p className="text-xs text-red-500 mt-1">Too short — minimum 6 characters</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                    <div className="relative">
                      <input type={showConfirm ? "text" : "password"} className="input-field" style={{ paddingRight: "2.75rem" }} placeholder="Repeat your password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} disabled={loading} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {pwMatch && <p className="text-xs text-red-500 mt-1">Passwords don't match</p>}
                  </div>
                </div>
              </div>

              {/* Location */}
              {showLocation && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-green-600" /> Location Details *</h3>
                  <p className="text-xs text-gray-500 mb-4">County and Constituency are required. This helps connect you with nearby users.</p>

                  {/* GPS button */}
                  <button type="button" onClick={() => { setGpsTried(false); detectLocation(); }} disabled={loading || gpsStatus === "requesting"}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-medium text-sm mb-5 border-2 ${gpsStatus === "granted" ? "bg-green-50 text-green-700 border-green-300" : gpsStatus === "denied" ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}>
                    {gpsStatus === "requesting" ? <Loader2 className="w-4 h-4 spin-anim" /> : gpsStatus === "granted" ? <CheckCircle className="w-4 h-4" /> : gpsStatus === "denied" ? <XCircle className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    {gpsStatus === "requesting" && "Detecting location…"}
                    {gpsStatus === "granted" && "✓ Location detected — you can still change below"}
                    {gpsStatus === "denied" && "Location denied — select manually below"}
                    {gpsStatus === "idle" && "Use my current location (recommended)"}
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">County *</label>
                      <input type="text" className="input-field" placeholder="Type to search county…" value={countySearch}
                        onChange={e => handleCountySearch(e.target.value)}
                        onFocus={() => { setFilteredCounties(countyList); setShowCountyDropdown(true); }}
                        onBlur={() => setTimeout(() => setShowCountyDropdown(false), 150)}
                        disabled={loading} autoComplete="off" />
                      {showCountyDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                          {filteredCounties.length > 0
                            ? filteredCounties.map(county => (
                              <button key={county} type="button" onMouseDown={e => { e.preventDefault(); selectCounty(county); }}
                                className="w-full text-left px-4 py-2.5 hover:bg-green-50 hover:text-green-700 transition text-sm">{county}</button>
                            ))
                            : <div className="px-4 py-3 text-gray-400 text-sm">No counties found</div>}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Constituency *</label>
                      <select className="select-field" disabled={!location.county || loading} value={location.sub_county || ""}
                        onChange={e => setLocation({ ...location, sub_county: e.target.value, ward: undefined })}>
                        <option value="">Select Constituency</option>
                        {location.county && kenyaData[location.county] && Object.keys(kenyaData[location.county]).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ward</label>
                      <select className="select-field" disabled={!location.county || !location.sub_county || loading} value={location.ward || ""}
                        onChange={e => setLocation({ ...location, ward: e.target.value })}>
                        <option value="">Select Ward</option>
                        {location.county && location.sub_county && kenyaData[location.county]?.[location.sub_county]?.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Locality / Village <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input className="input-field" placeholder="e.g. Westlands, Kibera, Eldoret CBD" value={location.locality || ""}
                        onChange={e => setLocation({ ...location, locality: e.target.value })} disabled={loading} />
                    </div>
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" id="terms" className="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" required />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-semibold">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-semibold">Privacy Policy</Link>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin-anim inline-block" /> Creating Account…</>
                  : <><User className="w-4 h-4" /> Create Account</>}
              </button>

              <p className="text-center text-sm text-gray-600 pt-1">
                Already have an account?{" "}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold transition">Sign in here</Link>
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} SmartLivestock · <Link to="/privacy" className="hover:text-gray-600 transition">Privacy</Link> · <Link to="/terms" className="hover:text-gray-600 transition">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}