import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { LogIn, Mail, Lock, Eye, EyeOff, PawPrint, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast("error", "Validation Error", "Please enter both email and password");
      return;
    }
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
      if (user.mustChangePassword) {
        navigate("/set-password");
      } else {
        navigate(user.role === "subadmin" ? "/subadmin" : `/${user.role}`);
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string }; status?: number }; message?: string; code?: string };
      let errorMessage = ax?.response?.data?.error;
      if (!errorMessage) {
        if (ax?.code === "ERR_NETWORK" || ax?.message?.includes("Network")) {
          errorMessage = "Cannot reach server. Is the backend running on port 3000?";
        } else if (ax?.response?.status === 401) {
          errorMessage = "Invalid email or password";
        } else {
          errorMessage = ax?.message || "Login failed";
        }
      }
      addToast("error", "Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Left: branding - hidden on small, visible sm+ */}
      <div className="hidden sm:flex sm:w-1/2 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 p-10 flex-col justify-center text-white animate-fadeInUp">
        <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-12 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
            <PawPrint className="w-8 h-8" />
          </div>
          <span className="text-2xl font-bold">SmartLivestock</span>
        </div>
        <p className="text-xl text-white/90 max-w-sm">
          Sign in to manage your livestock, orders, and connect with vets and agrovets.
        </p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fadeInUp">
          <Link to="/" className="sm:hidden inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                <p className="text-gray-500 mt-1">Sign in to your account</p>
              </div>

              <form onSubmit={login} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="input-field pl-11 w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="input-field pl-11 pr-11 w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign in
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold transition">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} SmartLivestock
          </p>
        </div>
      </div>
    </div>
  );
}
