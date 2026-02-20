import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Lock, Eye, EyeOff, CheckCircle, PawPrint } from "lucide-react";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const isTokenMode = Boolean(tokenFromUrl?.trim());

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isTokenMode && !localStorage.getItem("token")) {
      navigate("/login", { replace: true });
    }
  }, [navigate, isTokenMode]);

  const handleSubmitWithToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();
    if (!trimmedNew || !trimmedConfirm) {
      addToast("error", "Validation", "All fields are required");
      return;
    }
    if (trimmedNew.length < 8) {
      addToast("error", "Validation", "Password must be at least 8 characters");
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      addToast("error", "Validation", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/set-password-with-token", {
        token: tokenFromUrl?.trim(),
        newPassword: trimmedNew,
      });
      addToast("success", "Password set", "You can now log in with your new password");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      addToast("error", "Error", ax?.response?.data?.error || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();
    if (!trimmedCurrent || !trimmedNew || !trimmedConfirm) {
      addToast("error", "Validation", "All fields are required");
      return;
    }
    if (trimmedNew.length < 8) {
      addToast("error", "Validation", "Password must be at least 8 characters");
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      addToast("error", "Validation", "New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: trimmedCurrent,
        newPassword: trimmedNew,
      });
      addToast("success", "Password updated", "You can now use your new password");
      const role = localStorage.getItem("role") || "farmer";
      navigate(role === "subadmin" ? "/subadmin" : `/${role}`);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      addToast("error", "Error", ax?.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <div className="hidden sm:flex sm:w-1/2 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 p-10 flex-col justify-center text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
            <PawPrint className="w-8 h-8" />
          </div>
          <span className="text-2xl font-bold">SmartLivestock</span>
        </div>
        <p className="text-xl text-white/90 max-w-sm">
          {isTokenMode
            ? "Set your preferred password using the secure link from your email."
            : "Set your preferred password to secure your staff account."}
        </p>
        <div className="mt-8 flex items-center gap-3 text-white/80">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Use at least 8 characters for a strong password</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isTokenMode ? "Set your password" : "Change your password"}
                </h1>
                <p className="text-gray-500 dark:text-slate-400 mt-1">
                  {isTokenMode
                    ? "Choose a secure password. No need to enter the temporary password—just use this form."
                    : "Choose a secure password for your account"}
                </p>
              </div>

              <form onSubmit={isTokenMode ? handleSubmitWithToken : handleSubmitChangePassword} className="space-y-5">
                {!isTokenMode && (
                <div>
                  <label htmlFor="current" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    Current (temporary) password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="current"
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value.trimStart())}
                      onBlur={(e) => setCurrentPassword(e.target.value.trim())}
                      placeholder="••••••••"
                      required
                      className="input-field pl-11 pr-11 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                )}
                <div>
                  <label htmlFor="new" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="new"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value.trimStart())}
                      onBlur={(e) => setNewPassword(e.target.value.trim())}
                      placeholder="••••••••"
                      minLength={8}
                      required
                      className="input-field pl-11 pr-11 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value.trimStart())}
                    onBlur={(e) => setConfirmPassword(e.target.value.trim())}
                    placeholder="••••••••"
                    required
                    className="input-field pl-11 w-full"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Set password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
