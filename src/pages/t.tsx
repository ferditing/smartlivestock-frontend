import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
//import rawKenyaData from "../data/kenya_locations.json";
import rawKenyaData from "../data/kenya_locations_complete.json";
import { useToast } from "../context/ToastContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";

type LocationState = {
  lat?: number;
  lng?: number;
  county?: string;
  sub_county?: string;
  locality?: string;
};

export default function Register() {
  const navigate = useNavigate();
  const kenyaData: Record<string, Record<string, string[]>> = rawKenyaData;
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    confirmPassword: ""
  });
  const [location, setLocation] = useState<LocationState>({});
  const [gpsTried, setGpsTried] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (form.role === "vet" || form.role === "agrovet") {
      if (gpsStatus === "granted") detectLocation();
    }
  }, [form.role]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      addToast('error', 'Location Error', 'Geolocation not supported in your browser');
      return;
    }
    
    if (gpsTried) return;
    
    setGpsTried(true);
    setGpsStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setLocation((prev) => ({ ...prev, lat, lng }));
        setGpsStatus('granted');
        addToast('success', 'Location Found', 'Using your current location');

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=en`
          );
          const data = await res.json();
          const addr = data.address || {};

          const norm = (s?: string) => (s || "").toLowerCase().replace(/\s+county$/i, '').replace(/\s+/g, ' ').trim();
          const addrCountyRaw = addr.county || addr.region || addr.state || addr.county_district || '';
          const addrSubRaw = addr.state_district || addr.county_district || addr.suburb || addr.town || addr.village || '';

          const countyMatch = Object.keys(kenyaData).find(k => {
            const nk = norm(k);
            const na = norm(addrCountyRaw);
            return nk === na || nk.includes(na) || na.includes(nk);
          });

          let chosenCounty = countyMatch || (addrCountyRaw ? addrCountyRaw.replace(/\s*County$/i, '').trim() : undefined);

          let chosenSub: string | undefined = undefined;
          if (chosenCounty && kenyaData[chosenCounty]) {
            const subs = Object.keys(kenyaData[chosenCounty]);
            const matchedSub = subs.find((s: string) => {
              const ns = norm(s);
              const na = norm(addrSubRaw);
              return ns === na || ns.includes(na) || na.includes(ns);
            });
            chosenSub = matchedSub || undefined;
          }

          setLocation((prev) => ({
            ...prev,
            county: chosenCounty || prev.county,
            sub_county: chosenSub || prev.sub_county || (addrSubRaw || undefined),
            locality: addr.village || addr.town || addr.suburb || addr.hamlet || prev.locality,
          }));
        } catch (err) {
          console.warn('reverse geocode failed', err);
          addToast('warning', 'Location Details', 'Could not fetch detailed location info');
        }
      },
      (_err) => { 
        setGpsStatus('denied');
        addToast('error', 'Location Access', 'Please enable location access or select manually');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      addToast('error', 'Validation Error', 'Name is required');
      return false;
    }
    
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      addToast('error', 'Validation Error', 'Valid email is required');
      return false;
    }
    
    if (!form.phone.trim()) {
      addToast('error', 'Validation Error', 'Phone number is required');
      return false;
    }
    
    if (!form.role) {
      addToast('error', 'Validation Error', 'Please select a role');
      return false;
    }
    
    if (form.password.length < 6) {
      addToast('error', 'Validation Error', 'Password must be at least 6 characters');
      return false;
    }
    
    if (form.password !== form.confirmPassword) {
      addToast('error', 'Validation Error', 'Passwords do not match');
      return false;
    }
    
    if ((form.role === "vet" || form.role === "agrovet") && !location.county) {
      addToast('warning', 'Location Required', 'Please provide location details for this role');
      return false;
    }
    
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post("/auth/register", {
        ...form,
        location: (form.role === "vet" || form.role === "agrovet") ? location : undefined,
      });

      addToast('success', 'Registration Successful', 'Account created successfully!');
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Registration failed";
      addToast('error', 'Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showLocationFallback = form.role === "vet" || form.role === "agrovet";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join SmartLivestock</h1>
          <p className="text-gray-600 mt-2">Create your account to get started</p>
        </div>

        {/* Registration Card */}
        <div className="card shadow-2xl">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Create Account</h2>
            <p className="text-gray-600 text-sm mt-1">Fill in your details below</p>
          </div>

          <form onSubmit={submit} className="card-body space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </label>
                <input
                  className="input-field"
                  placeholder="you@example.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </label>
                <input
                  className="input-field"
                  placeholder="+254 700 000000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Role *
                </label>
                <select
                  className="select-field"
                  value={form.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    setForm({ ...form, role });
                    if (role === 'vet' || role === 'agrovet') {
                      setGpsTried(false);
                      detectLocation();
                    }
                  }}
                  disabled={loading}
                >
                  <option value="">Select your role</option>
                  <option value="farmer">Farmer</option>
                  <option value="vet">Veterinarian</option>
                  <option value="agrovet">Agro-vet Supplier</option>
                </select>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field pl-11 pr-11"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    disabled={loading}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password.length > 0 && form.password.length < 6 && (
                  <p className="text-sm text-red-600 mt-1">Password too short</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="input-field pl-11 pr-11"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    disabled={loading}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">Passwords don't match</p>
                )}
              </div>
            </div>

            {/* Location Section (Conditional) */}
            {showLocationFallback && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Location Details</h3>
                    <p className="text-sm text-gray-600">Required for service providers</p>
                  </div>
                </div>

                {/* GPS Button */}
                <div className="mb-4">
                  <button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      gpsStatus === 'granted'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => {
                      setGpsTried(false);
                      detectLocation();
                    }}
                    disabled={loading || gpsStatus === 'requesting'}
                  >
                    {gpsStatus === 'requesting' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : gpsStatus === 'granted' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : gpsStatus === 'denied' ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    {gpsStatus === 'requesting' && 'Detecting location...'}
                    {gpsStatus === 'granted' && 'Location detected'}
                    {gpsStatus === 'denied' && 'Location denied - select manually'}
                    {gpsStatus === 'idle' && 'Use my current location'}
                  </button>
                </div>

                {/* Location Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County *
                    </label>
                    <select
                      className="select-field"
                      value={location.county || ""}
                      onChange={(e) =>
                        setLocation({ ...location, county: e.target.value })
                      }
                      disabled={loading}
                      required={showLocationFallback}
                    >
                      <option value="">Select County</option>
                      {Object.keys(kenyaData).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-county
                    </label>
                    <select
                      className="select-field"
                      disabled={!location.county || loading}
                      value={location.sub_county || ""}
                      onChange={(e) =>
                        setLocation({ ...location, sub_county: e.target.value })
                      }
                    >
                      <option value="">Select Sub-county</option>
                      {location.county && kenyaData[location.county] &&
                        Object.keys(kenyaData[location.county]).map((sc: string) => (
                          <option key={sc} value={sc}>
                            {sc}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Locality
                    </label>
                    <input
                      className="input-field"
                      placeholder="Village / Estate"
                      value={location.locality || ""}
                      onChange={(e) =>
                        setLocation({ ...location, locality: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="card-footer text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SmartLivestock. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}