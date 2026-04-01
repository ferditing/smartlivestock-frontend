import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { ArrowLeft, UserPlus, Users, MapPin, Shield, Mail, Phone, ChevronDown, Loader2, Send, CheckCircle2, Crown, UserCog, ClipboardList, RefreshCw, Sparkles, Building2, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";

type County = { id: number; name: string };
type StaffRole = "subadmin" | "secretary" | "chairman";
type StaffMember = { id: number; name: string; email: string; phone: string | null; role: string; assigned_county: string | null; must_change_password: boolean | null; created_at: string; };

const ROLE_CONFIG: Record<StaffRole, { label: string; icon: React.ElementType; color: string; bg: string; border: string; grad: string; description: string }> = {
  subadmin: { label: "Sub-Admin", icon: UserCog, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", grad: "from-blue-500 to-indigo-600", description: "Manages county-level operations" },
  secretary: { label: "Secretary", icon: ClipboardList, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", grad: "from-emerald-500 to-green-600", description: "Handles administrative tasks" },
  chairman: { label: "Chairman", icon: Crown, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300", grad: "from-amber-500 to-orange-500", description: "Oversees all operations" },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role as StaffRole];
  if (!cfg) return <span className="badge badge-gray capitalize">{role}</span>;
  const Icon = cfg.icon;
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}><Icon className="w-3 h-3" />{cfg.label}</span>;
}

export default function AdminStaffManagement() {
  const [counties, setCounties] = useState<County[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "secretary" as StaffRole, assigned_county: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    api.get("/admin/counties").then((r) => setCounties(r.data || [])).catch(() => setCounties([]));
    api.get("/admin/staff").then((r) => setStaff(r.data || [])).catch(() => setStaff([])).finally(() => setLoading(false));
  }, []);

  const refreshStaff = async () => { const res = await api.get("/admin/staff"); setStaff(res.data || []); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { addToast("error", "Validation", "Name and email are required"); return; }
    if (form.role === "subadmin" && !form.assigned_county) { addToast("error", "Validation", "County is required for Sub-Admin"); return; }
    setCreating(true);
    try {
      const payload: Record<string, string> = { name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.role === "subadmin") payload.assigned_county = form.assigned_county;
      await api.post("/admin/staff", payload);
      addToast("success", "Staff created", "Temporary credentials have been sent via email/SMS");
      setForm({ name: "", email: "", phone: "", role: "secretary", assigned_county: "" });
      await refreshStaff();
    } catch (e: unknown) { const ax = e as { response?: { data?: { error?: string } } }; addToast("error", "Error", ax?.response?.data?.error || "Failed to create staff"); }
    finally { setCreating(false); }
  };

  const handleResendInvite = async (id: number) => {
    setResendingId(id);
    try {
      await api.post(`/admin/resend-staff-invite/${id}`);
      addToast("success", "Invite resent", "Temporary credentials have been resent via email/SMS");
      setSuccessId(id); setTimeout(() => setSuccessId(null), 3000);
      await refreshStaff();
    } catch (e: unknown) { const ax = e as { response?: { data?: { error?: string } } }; addToast("error", "Error", ax?.response?.data?.error || "Failed to resend invite"); }
    finally { setResendingId(null); }
  };

  const counts = { total: staff.length, subadmins: staff.filter(s => s.role === "subadmin").length, secretaries: staff.filter(s => s.role === "secretary").length, chairmen: staff.filter(s => s.role === "chairman").length };

  return (
    <Layout role="admin">
      <div className="space-y-6">

        {/* ── Hero Banner ── */}
        <div className="rounded-2xl overflow-hidden animate-fadeIn" style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)" }}>
          <div className="relative px-6 py-8 md:px-8">
            <div className="absolute top-0 right-0 text-[120px] leading-none opacity-[0.07] select-none pointer-events-none pr-4 pt-2">👤</div>
            <div className="relative z-10">
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-green-200 hover:text-white transition-colors mb-4 text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white sora mb-1">Staff Management</h1>
              <p className="text-green-200 text-sm mb-5">Create and manage secretaries, sub-admins, and chairmen</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Total", val: counts.total, c: "bg-white/10 border border-white/20" },
                  { label: "Sub-Admins", val: counts.subadmins, c: "bg-blue-500/20 border border-blue-400/30" },
                  { label: "Secretaries", val: counts.secretaries, c: "bg-emerald-500/20 border border-emerald-400/30" },
                  { label: "Chairmen", val: counts.chairmen, c: "bg-amber-500/20 border border-amber-400/30" },
                ].map(s => (
                  <div key={s.label} className={`flex items-center gap-2.5 ${s.c} rounded-xl px-4 py-2.5 backdrop-blur-sm`}>
                    <span className="text-white font-bold sora tabular-nums text-xl leading-none">{s.val}</span>
                    <span className="text-white/70 text-xs font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Staff", val: counts.total, Icon: Users, bg: "bg-gray-100", ic: "text-gray-600" },
            { label: "Sub-Admins", val: counts.subadmins, Icon: UserCog, bg: "bg-blue-50", ic: "text-blue-600" },
            { label: "Secretaries", val: counts.secretaries, Icon: ClipboardList, bg: "bg-emerald-50", ic: "text-emerald-600" },
            { label: "Chairmen", val: counts.chairmen, Icon: Crown, bg: "bg-amber-50", ic: "text-amber-600" },
          ].map((k, i) => (
            <div key={k.label} className="card animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="card-body flex items-center gap-3 py-4">
                <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}><k.Icon className={`w-5 h-5 ${k.ic}`} /></div>
                <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{k.label}</p><p className="text-2xl font-bold text-gray-900 sora tabular-nums">{k.val}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid gap-6 xl:grid-cols-5">

          {/* Create Form */}
          <div className="xl:col-span-2 card animate-fadeInUp" style={{ animationDelay: "80ms" }}>
            <div className="card-header flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(22,163,74,0.04), rgba(5,150,105,0.04))" }}>
              <div className="card-icon-wrap card-icon-green"><UserPlus className="w-4 h-4 text-white" /></div>
              <div>
                <h2 className="font-bold text-gray-900 sora text-sm">Create New Staff</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <p className="text-xs text-gray-500">Credentials auto-sent on creation</p>
                </div>
              </div>
            </div>
            <form ref={formRef} onSubmit={handleCreate} className="card-body space-y-5">
              {/* Role selector */}
              <div>
                <label className="field-label">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["secretary", "subadmin", "chairman"] as StaffRole[]).map((r) => {
                    const cfg = ROLE_CONFIG[r];
                    const Icon = cfg.icon;
                    const active = form.role === r;
                    return (
                      <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r, assigned_county: r === "subadmin" ? f.assigned_county : "" }))} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${active ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm` : "border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600"}`}>
                        <Icon className="w-4 h-4" />{cfg.label.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
                <p className="field-hint">{ROLE_CONFIG[form.role].description}</p>
              </div>

              {/* County (subadmin only) */}
              {form.role === "subadmin" && (
                <div className="animate-fadeInUp">
                  <label className="field-label">Assigned County <span className="text-red-500">*</span></label>
                  <div className="input-icon-wrap">
                    <Building2 className="input-icon w-4 h-4" />
                    <select value={form.assigned_county} onChange={(e) => setForm(f => ({ ...f, assigned_county: e.target.value }))} className="select-field" required={form.role === "subadmin"}>
                      <option value="">Select county…</option>
                      {counties.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <p className="field-hint">One active sub-admin per county.</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="field-label">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" className="input-field" required />
              </div>

              {/* Email */}
              <div>
                <label className="field-label">Email <span className="text-red-500">*</span></label>
                <div className="input-icon-wrap">
                  <Mail className="input-icon w-4 h-4" />
                  <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="staff@example.com" className="input-field" required />
                </div>
                <p className="field-hint">Login link & temp password will be sent here</p>
              </div>

              {/* Phone */}
              <div>
                <label className="field-label">Phone <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                <div className="input-icon-wrap">
                  <Phone className="input-icon w-4 h-4" />
                  <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0712 345 678" className="input-field" />
                </div>
                <p className="field-hint">SMS credentials sent if provided</p>
              </div>

              <button type="submit" disabled={creating} className="btn btn-primary w-full">
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : <><UserPlus className="w-4 h-4" /> Create Staff Member</>}
              </button>
            </form>
          </div>

          {/* Staff List */}
          <div className="xl:col-span-3 card flex flex-col animate-fadeInUp" style={{ animationDelay: "120ms" }}>
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="card-icon-wrap card-icon-blue"><Users className="w-4 h-4 text-white" /></div>
                <div>
                  <h2 className="font-bold text-gray-900 sora text-sm">Current Staff</h2>
                  <p className="text-xs text-gray-500">{counts.total} member{counts.total !== 1 ? "s" : ""} across all roles</p>
                </div>
              </div>
              <button type="button" onClick={refreshStaff} className="btn btn-outline btn-icon-sm" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
            </div>

            <div className="card-body flex-1 overflow-y-auto scroll-area space-y-2.5 max-h-[520px]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100">
                    <div className="skeleton w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2"><div className="skeleton-text w-32" /><div className="skeleton-text w-48" /></div>
                    <div className="skeleton h-7 w-24 rounded-full" />
                  </div>
                ))
              ) : staff.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Users className="w-8 h-8" /></div>
                  <p className="empty-state-title">No staff yet</p>
                  <p className="empty-state-sub">Use the form to add your first staff member</p>
                </div>
              ) : (
                staff.map((s, i) => {
                  const cfg = ROLE_CONFIG[s.role as StaffRole];
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/40 hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 text-white bg-gradient-to-br ${cfg ? cfg.grad : "from-gray-400 to-gray-500"}`}>
                        {s.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate sora">{s.name}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{s.email}{s.phone && <span className="ml-2 text-gray-300">· {s.phone}</span>}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <RoleBadge role={s.role} />
                          {s.assigned_county && <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><MapPin className="w-3 h-3" />{s.assigned_county}</span>}
                          {s.must_change_password && <span className="badge badge-warning">Pending setup</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-xs text-gray-300">{new Date(s.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                        <button type="button" onClick={() => handleResendInvite(s.id)} disabled={resendingId === s.id} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-300 text-green-700 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          {resendingId === s.id ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending…</> : successId === s.id ? <><CheckCircle2 className="w-3 h-3 text-green-500" /> Sent!</> : <><Send className="w-3 h-3" /> Resend invite</>}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {staff.length > 0 && (
              <div className="card-footer flex items-center gap-2 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5" />
                Sub-admins are scoped to their assigned county only
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}