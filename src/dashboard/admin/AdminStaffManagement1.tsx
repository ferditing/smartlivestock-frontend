import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  ArrowLeft,
  UserPlus,
  Users,
  MapPin,
  Shield,
  Mail,
  Phone,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

type County = { id: number; name: string };
type StaffRole = "subadmin" | "secretary" | "chairman";

type StaffMember = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  assigned_county: string | null;
  must_change_password: boolean | null;
  created_at: string;
};

const ROLE_LABELS: Record<StaffRole, string> = {
  subadmin: "Sub-Admin (County)",
  secretary: "Secretary",
  chairman: "Chairman",
};

export default function AdminStaffManagement() {
  const [counties, setCounties] = useState<County[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "secretary" as StaffRole,
    assigned_county: "",
  });
  const { addToast } = useToast();

  useEffect(() => {
    api.get("/admin/counties").then((r) => setCounties(r.data || [])).catch(() => setCounties([]));
    api
      .get("/admin/staff")
      .then((r) => setStaff(r.data || []))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  }, []);

  const refreshStaff = async () => {
    const res = await api.get("/admin/staff");
    setStaff(res.data || []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      addToast("error", "Validation", "Name and email are required");
      return;
    }
    if (form.role === "subadmin" && !form.assigned_county) {
      addToast("error", "Validation", "County is required for Sub-Admin");
      return;
    }
    setCreating(true);
    try {
      const payload: Record<string, string> = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.role === "subadmin") payload.assigned_county = form.assigned_county;

      await api.post("/admin/staff", payload);
      addToast(
        "success",
        "Staff created",
        "Temporary credentials have been sent via email/SMS"
      );
      setForm({ name: "", email: "", phone: "", role: "secretary", assigned_county: "" });
      await refreshStaff();
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { error?: string } } };
      addToast("error", "Error", ax?.response?.data?.error || "Failed to create staff");
    } finally {
      setCreating(false);
    }
  };

  const handleResendInvite = async (id: number) => {
    setResendingId(id);
    try {
      await api.post(`/admin/resend-staff-invite/${id}`);
      addToast(
        "success",
        "Invite resent",
        "Temporary credentials have been resent via email/SMS"
      );
      await refreshStaff();
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { error?: string } } };
      addToast(
        "error",
        "Error",
        ax?.response?.data?.error || "Failed to resend invite"
      );
    } finally {
      setResendingId(null);
    }
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-green-600" />
              Staff Management
            </h1>
            <p className="text-gray-600 dark:text-slate-300 mt-1">
              Create secretaries, sub-admins (one per county), and chairmen. Credentials are sent via email/SMS.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create form */}
          <div className="card border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 rounded-2xl shadow-sm">
            <div className="card-header flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-emerald-500/20 rounded-xl">
                <UserPlus className="w-5 h-5 text-green-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create New Staff
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Sub-admins manage their assigned county. Credentials sent to email & phone.
                </p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Jane Doe"
                    className="input-field pl-10 w-full"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="staff@example.com"
                    className="input-field pl-10 w-full"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Temporary password and set-password link will be sent here
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Phone <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="0712345678"
                    className="input-field pl-10 w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  SMS with set-password link will be sent if no email
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        role: e.target.value as StaffRole,
                        assigned_county: e.target.value === "subadmin" ? f.assigned_county : "",
                      }))
                    }
                    className="select-field pl-10 w-full"
                  >
                    {(["secretary", "subadmin", "chairman"] as const).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {form.role === "subadmin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    Assigned county
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={form.assigned_county}
                      onChange={(e) => setForm((f) => ({ ...f, assigned_county: e.target.value }))}
                      className="select-field pl-10 w-full"
                      required={form.role === "subadmin"}
                    >
                      <option value="">Select county</option>
                      {counties.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Sub-admin will manage all users and data for this county. One active sub-admin per county only—suspend the current one in User Management before assigning a new one.
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={creating}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create staff
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Staff list */}
          <div className="card border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 rounded-2xl shadow-sm">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Existing staff ({staff.length})
              </h2>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : staff.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 py-8 text-center">
                  No staff created yet. Use the form to add secretaries, sub-admins, or chairmen.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {staff.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {s.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          {s.email}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <span
                            className={`badge text-xs ${
                              s.role === "subadmin"
                                ? "badge-info"
                                : s.role === "chairman"
                                ? "badge-warning"
                                : "badge-success"
                            }`}
                          >
                            {ROLE_LABELS[s.role as StaffRole] || s.role}
                          </span>
                          {s.assigned_county && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300">
                              <MapPin className="w-3 h-3" />
                              {s.assigned_county}
                            </span>
                          )}
                          {s.must_change_password && (
                            <span className="badge badge-warning text-xs">Must set password</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          {new Date(s.created_at).toLocaleDateString()}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleResendInvite(s.id)}
                          disabled={resendingId === s.id}
                          className="text-xs px-2 py-1 rounded-full border border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                        >
                          {resendingId === s.id ? "Resending..." : "Resend invite"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
