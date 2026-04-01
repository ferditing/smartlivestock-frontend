/**
 * SmartLivestock — Set/Change Password Page
 * Matches Landing page design system (Sora + Plus Jakarta Sans, green tokens, shared CSS)
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Lock, Eye, EyeOff, CheckCircle, PawPrint, ArrowLeft, Shield, Key } from "lucide-react";
import { SHARED_STYLES } from "./Landing";

const PASSWORD_HINTS = [
  "At least 8 characters long",
  "Mix of uppercase & lowercase letters",
  "Include a number or special character",
  "Don't reuse an old password",
];

function StrengthBar({ password }: { password: string }) {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];
  return password ? (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? "text-red-500" : score === 2 ? "text-amber-500" : score === 3 ? "text-yellow-600" : "text-green-600"}`}>
        {labels[score]}
      </p>
    </div>
  ) : null;
}

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const isTokenMode = Boolean(tokenFromUrl?.trim());

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isTokenMode && !localStorage.getItem("token")) navigate("/login", { replace: true });
  }, [navigate, isTokenMode]);

  const handleSubmitWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = newPassword.trim(); const c = confirmPassword.trim();
    if (!n || !c) { addToast("error", "Validation", "All fields are required"); return; }
    if (n.length < 8) { addToast("error", "Validation", "Password must be at least 8 characters"); return; }
    if (n !== c) { addToast("error", "Validation", "Passwords do not match"); return; }
    setLoading(true);
    try {
      await api.post("/auth/set-password-with-token", { token: tokenFromUrl?.trim(), newPassword: n });
      addToast("success", "Password set", "You can now log in with your new password");
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      addToast("error", "Error", ax?.response?.data?.error || "Failed to set password");
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cur = currentPassword.trim(); const n = newPassword.trim(); const c = confirmPassword.trim();
    if (!cur || !n || !c) { addToast("error", "Validation", "All fields are required"); return; }
    if (n.length < 8) { addToast("error", "Validation", "Password must be at least 8 characters"); return; }
    if (n !== c) { addToast("error", "Validation", "New passwords do not match"); return; }
    setLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword: cur, newPassword: n });
      addToast("success", "Password updated", "Your password has been changed successfully");
      setDone(true);
      const role = localStorage.getItem("role") || "farmer";
      setTimeout(() => navigate(role === "subadmin" ? "/subadmin" : `/${role}`), 1500);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      addToast("error", "Error", ax?.response?.data?.error || "Failed to update password");
    } finally { setLoading(false); }
  };

  const pwMatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <div className="min-h-screen flex text-gray-900">
      <style>{SHARED_STYLES}</style>

      {/* Left panel */}
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

          <div className="mb-8">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-5 border border-white/20">
              {isTokenMode ? <Key className="w-7 h-7 text-green-300" /> : <Shield className="w-7 h-7 text-green-300" />}
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 sora leading-tight">
              {isTokenMode ? "Activate your\naccount" : "Secure your\naccount"}
            </h2>
            <p className="text-white/70 text-base leading-relaxed">
              {isTokenMode
                ? "Set your preferred password using the secure link sent to your email."
                : "Update your SmartLivestock account password to keep it secure."}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Password tips</p>
            {PASSWORD_HINTS.map(hint => (
              <div key={hint} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-400/25 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-green-300" />
                </div>
                <span className="text-white/70 text-sm">{hint}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-white/50 text-xs">© {new Date().getFullYear()} SmartLivestock. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fadeInUp">
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

          {done ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 sora">
                  Password {isTokenMode ? "Set" : "Updated"}!
                </h2>
                <p className="text-gray-500 text-sm">Redirecting you now…</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="p-8 sm:p-10">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 sora">
                    {isTokenMode ? "Set your password" : "Change your password"}
                  </h1>
                  <p className="text-gray-500 mt-1 text-sm">
                    {isTokenMode
                      ? "The temporary password from your email is not needed — just fill this form."
                      : "Choose a secure new password for your account."}
                  </p>
                </div>

                <form onSubmit={isTokenMode ? handleSubmitWithToken : handleChangePassword} className="space-y-5">
                  {!isTokenMode && (
                    <div>
                      <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Current (temporary) password
                      </label>
                      <div className="relative">
                        <Lock className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" style={{ left: "0.875rem" }} />
                        <input id="current" type={showCurrent ? "text" : "password"} value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value.trimStart())}
                          onBlur={e => setCurrentPassword(e.target.value.trim())}
                          placeholder="••••••••" required
                          className="input-field"
                          style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                        />
                        <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                          {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="new" className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" style={{ left: "0.875rem" }} />
                      <input id="new" type={showNew ? "text" : "password"} value={newPassword}
                        onChange={e => setNewPassword(e.target.value.trimStart())}
                        onBlur={e => setNewPassword(e.target.value.trim())}
                        placeholder="At least 8 characters" minLength={8} required
                        className="input-field"
                        style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <StrengthBar password={newPassword} />
                  </div>

                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" style={{ left: "0.875rem" }} />
                      <input id="confirm" type={showConfirm ? "text" : "password"} value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value.trimStart())}
                        onBlur={e => setConfirmPassword(e.target.value.trim())}
                        placeholder="Repeat new password" required
                        className="input-field"
                        style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {pwMatch && <p className="text-xs text-red-500 mt-1">Passwords don't match</p>}
                    {confirmPassword.length > 0 && !pwMatch && newPassword === confirmPassword && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn btn-primary w-full py-3.5 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin-anim inline-block" />
                        {isTokenMode ? " Setting password…" : " Updating password…"}</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> {isTokenMode ? "Set password" : "Update password"}</>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-5 border-t border-gray-100 text-center">
                  <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 transition">
                    ← Back to login
                  </Link>
                </div>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} SmartLivestock ·{" "}
            <Link to="/privacy" className="hover:text-gray-600 transition">Privacy</Link> ·{" "}
            <Link to="/terms" className="hover:text-gray-600 transition">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}