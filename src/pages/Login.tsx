/**
 * SmartLivestock — Login Page
 * Matches Landing page design system (Sora + Plus Jakarta Sans, green tokens, shared CSS)
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { LogIn, Mail, Lock, Eye, EyeOff, PawPrint, ArrowLeft, CheckCircle, Zap, Shield, Users } from "lucide-react";
import { SHARED_STYLES } from "./Landing";

const FEATURES = [
  { icon: Zap, text: "AI-powered livestock health predictions" },
  { icon: Shield, text: "Secure M-Pesa & Paystack payments" },
  { icon: Users, text: "Connect with 150+ verified vets" },
  { icon: CheckCircle, text: "6-day county weather forecasts" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { addToast("error", "Validation Error", "Please enter both email and password"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", String(user.id));
      if (user.name) localStorage.setItem("userName", user.name);
      if (user.assigned_county) localStorage.setItem("assignedCounty", user.assigned_county);
      addToast("success", "Welcome Back", `Logged in as ${user.name}`);
      if (user.mustChangePassword) navigate("/set-password");
      else navigate(user.role === "subadmin" ? "/subadmin" : `/${user.role}`);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string }; status?: number }; message?: string; code?: string };
      let msg = ax?.response?.data?.error;
      if (!msg) {
        if (ax?.code === "ERR_NETWORK" || ax?.message?.includes("Network")) msg = "Cannot reach server. Is the backend running on port 3000?";
        else if (ax?.response?.status === 401) msg = "Invalid email or password";
        else msg = ax?.message || "Login failed";
      }
      addToast("error", "Login Failed", msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex text-gray-900">
      <style>{SHARED_STYLES}</style>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 auth-side flex-col justify-between p-10 relative overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,.05) 0%, transparent 50%)" }} />
        {/* Decorative circles */}
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
          <h2 className="text-3xl font-bold text-white mb-3 sora leading-tight">Welcome back<br />to your farm</h2>
          <p className="text-white/70 text-base mb-10 leading-relaxed">Sign in to manage your livestock, connect with vets and agrovets, and plan better harvests.</p>

          <div className="space-y-4">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 border border-white/20">
                  <f.icon className="w-4 h-4 text-green-300" />
                </div>
                <span className="text-white/80 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/50 text-xs">© {new Date().getFullYear()} SmartLivestock. All 47 Counties.</p>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="w-full max-w-md animate-fadeInUp">
          {/* Mobile back + logo */}
          <div className="lg:hidden mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition text-sm mb-5">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow-md">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 sora">SmartLivestock</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card header accent */}
            <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-400" />

            <div className="p-8 sm:p-10">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 sora">Sign in</h1>
                <p className="text-gray-500 mt-1 text-sm">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={login} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      id="email" type="email" autoComplete="email" placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} disabled={loading}
                      className="input-field pl-11"
                      style={{ paddingLeft: "2.75rem" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" style={{ left: "0.875rem" }} />
                    <input
                      id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)} disabled={loading}
                      className="input-field"
                      style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn btn-primary w-full py-3.5 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin-anim inline-block" /> Signing in…</>
                    : <><LogIn className="w-4 h-4" /> Sign in</>}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold transition">Create account</Link>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} SmartLivestock · <Link to="/privacy" className="hover:text-gray-600 transition">Privacy</Link> · <Link to="/terms" className="hover:text-gray-600 transition">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}