import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { serverBaseUrl } from "../../api/axios";
import { getSubadminProviders, getSubadminProviderApplication, confirmSubadminProviderDocuments, verifySubadminProvider, rejectSubadminProvider } from "../../api/subadmin.api";
import { Shield, ArrowLeft, CheckCircle, XCircle, Stethoscope, ShoppingBag, FileText, ExternalLink, Calendar, X, Mail, Phone, MapPin, Clock, Filter } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const DOC_LABELS: Record<string, string> = { national_id: "National ID", kcse_certificate: "KCSE Certificate", academic_certificate: "Academic Certificate", kvb_registration: "KVB Registration", vmd_certification: "VMD Certification", business_registration: "Business Registration", county_permit: "County Permit", pcpb_license: "PCPB License", premises_inspection: "Premises Inspection" };

type Provider = { id: number; name: string; provider_type: string; verification_status: string; verified_at: string | null; license_number: string | null; verification_badge: string | null; rejection_reason: string | null; license_expiry: string | null; email: string; phone: string | null; county: string | null; sub_county: string | null; created_at: string; };
type Doc = { type: string; path: string; filename: string };

export default function SubAdminProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [acting, setActing] = useState<number | null>(null);
  const [verifyModal, setVerifyModal] = useState<Provider | null>(null);
  const [rejectModal, setRejectModal] = useState<Provider | null>(null);
  const [docsModal, setDocsModal] = useState<Provider | null>(null);
  const [application, setApplication] = useState<{ documents?: Doc[]; documents_verified_at?: string } | null>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [verificationBadge, setVerificationBadge] = useState("");
  const { addToast } = useToast();

  const fetchProviders = () => { setLoading(true); getSubadminProviders({ status, type }).then((r: any) => setProviders(r.providers || r || [])).catch((e: any) => addToast("error", "Error", e?.response?.data?.error || "Failed to load providers")).finally(() => setLoading(false)); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProviders(); }, [status, type]);

  const handleVerify = (p: Provider) => { setVerifyModal(p); setLicenseNumber(p.license_number || ""); setLicenseExpiry(p.license_expiry ? p.license_expiry.slice(0, 10) : ""); setVerificationBadge(p.verification_badge || (p.provider_type === "vet" ? "Verified Veterinarian" : "Verified Agrovet")); };
  const openDocsModal = async (p: Provider) => { setDocsModal(p); setApplication(null); try { const res = await getSubadminProviderApplication(p.id); setApplication(res.application); } catch { setApplication(null); } };
  const confirmDocuments = async () => { if (!docsModal) return; setActing(docsModal.id); try { await confirmSubadminProviderDocuments(docsModal.id); addToast("success", "Documents confirmed", "Documents verified"); setDocsModal(null); setApplication(null); } catch (e) { addToast("error", "Error", (e as any)?.response?.data?.error || "Failed"); } finally { setActing(null); } };
  const handleReject = (p: Provider) => { setRejectModal(p); setRejectReason(p.rejection_reason || ""); };
  const submitVerify = () => { if (!verifyModal) return; setActing(verifyModal.id); verifySubadminProvider(verifyModal.id, { license_number: licenseNumber || undefined, license_expiry: licenseExpiry || undefined, verification_badge: verificationBadge || undefined }).then(() => { addToast("success", "Approved", `${verifyModal.name} has been verified`); setVerifyModal(null); fetchProviders(); }).catch((e: any) => addToast("error", "Error", e?.response?.data?.error || "Failed")).finally(() => setActing(null)); };
  const submitReject = () => { if (!rejectModal) return; setActing(rejectModal.id); rejectSubadminProvider(rejectModal.id, rejectReason || undefined).then(() => { addToast("success", "Rejected", `${rejectModal.name} has been rejected`); setRejectModal(null); fetchProviders(); }).catch((e: any) => addToast("error", "Error", e?.response?.data?.error || "Failed")).finally(() => setActing(null)); };
  const getStatusBadge = (s: string) => { if (s === "verified") return <span className="badge badge-success badge-dot">Verified</span>; if (s === "rejected") return <span className="badge badge-error badge-dot">Rejected</span>; return <span className="badge badge-warning badge-dot">Pending</span>; };
  const pendingCount = providers.filter(p => p.verification_status === "pending").length;
  const verifiedCount = providers.filter(p => p.verification_status === "verified").length;
  const rejectedCount = providers.filter(p => p.verification_status === "rejected").length;

  return (
    <Layout role="subadmin">
      <div className="space-y-6">

        {/* ── Hero Banner ── */}
        <div className="rounded-2xl overflow-hidden animate-fadeIn" style={{ background: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #0d9488 100%)" }}>
          <div className="relative px-6 py-8 md:px-8">
            <div className="absolute top-0 right-0 text-[120px] leading-none opacity-[0.07] select-none pointer-events-none pr-4 pt-2">🏥</div>
            <div className="relative z-10">
              <Link to="/subadmin" className="inline-flex items-center gap-1.5 text-teal-200 hover:text-white transition-colors mb-4 text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white sora mb-1">Provider Approvals</h1>
              <p className="text-teal-200 text-sm mb-5">Verify veterinarians and agrovets in your county</p>
              <div className="flex flex-wrap gap-3">
                {[{ label: "Pending", val: pendingCount, c: "bg-amber-500/20 border border-amber-400/30" }, { label: "Verified", val: verifiedCount, c: "bg-teal-500/20 border border-teal-400/30" }, { label: "Rejected", val: rejectedCount, c: "bg-red-500/20 border border-red-400/30" }].map(s => (
                  <div key={s.label} className={`flex items-center gap-2.5 ${s.c} rounded-xl px-4 py-2.5 backdrop-blur-sm`}>
                    <span className="text-white font-bold sora tabular-nums text-xl leading-none">{s.val}</span>
                    <span className="text-white/70 text-xs font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Status Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ label: "Pending Review", val: pendingCount, color: "border-amber-500", bg: "bg-amber-50", ic: "text-amber-600", Icon: Clock }, { label: "Verified Providers", val: verifiedCount, color: "border-teal-500", bg: "bg-teal-50", ic: "text-teal-600", Icon: CheckCircle }, { label: "Rejected", val: rejectedCount, color: "border-red-400", bg: "bg-red-50", ic: "text-red-600", Icon: XCircle }].map((k, i) => (
            <div key={k.label} className={`card border-l-4 ${k.color} animate-fadeInUp`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="card-body flex items-center gap-4 py-4">
                <div className={`w-11 h-11 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}><k.Icon className={`w-5 h-5 ${k.ic}`} /></div>
                <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{k.label}</p><p className="text-2xl font-bold text-gray-900 sora tabular-nums">{k.val}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium"><Filter className="w-4 h-4" /> Filter:</div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field w-auto min-w-[140px]"><option value="all">All statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="select-field w-auto min-w-[140px]"><option value="all">All types</option><option value="vet">Veterinarian</option><option value="agrovet">Agrovet</option></select>
        </div>

        {/* ── Provider List ── */}
        <div className="card">
          <div className="card-header flex items-center gap-3">
            <div className="card-icon-wrap card-icon-teal"><Shield className="w-4 h-4 text-white" /></div>
            <div><h2 className="font-bold text-gray-900 sora text-sm">County Providers</h2><p className="text-xs text-gray-500">{providers.length} provider{providers.length !== 1 ? "s" : ""} found</p></div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : providers.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon"><Shield className="w-8 h-8" /></div><p className="empty-state-title">No providers found</p><p className="empty-state-sub">Try adjusting your filters to see more results.</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {providers.map((p, i) => (
                  <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 hover:bg-gray-50/60 transition-colors animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${p.provider_type === "vet" ? "bg-blue-100" : "bg-amber-100"}`}>{p.provider_type === "vet" ? <Stethoscope className="w-6 h-6 text-blue-600" /> : <ShoppingBag className="w-6 h-6 text-amber-600" />}</div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900 sora">{p.name}</p>
                          {getStatusBadge(p.verification_status)}
                          <span className="badge badge-gray capitalize">{p.provider_type}</span>
                          {p.verification_badge && <span className="badge badge-success"><Shield className="w-3 h-3" /> {p.verification_badge}</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.email}</span>
                          {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</span>}
                          {(p.county || p.sub_county) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[p.county, p.sub_county].filter(Boolean).join(", ")}</span>}
                        </div>
                        {p.rejection_reason && <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-red-50 border border-red-100 text-red-700 px-2.5 py-1 rounded-lg"><XCircle className="w-3.5 h-3.5 flex-shrink-0" /> {p.rejection_reason}</div>}
                        {p.license_expiry && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-500" /> License expires: {new Date(p.license_expiry).toLocaleDateString()}</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      <button onClick={() => openDocsModal(p)} className="btn btn-outline btn-sm"><FileText className="w-3.5 h-3.5" /> View Docs</button>
                      {p.verification_status === "pending" && (<><button onClick={() => handleVerify(p)} disabled={acting === p.id} className="btn btn-primary btn-sm"><CheckCircle className="w-3.5 h-3.5" /> Approve</button><button onClick={() => handleReject(p)} disabled={acting === p.id} className="btn btn-outline-red btn-sm"><XCircle className="w-3.5 h-3.5" /> Reject</button></>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {verifyModal && <div className="modal-backdrop" onClick={() => setVerifyModal(null)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-header"><div><h3 className="font-bold text-gray-900 sora">Approve Provider</h3><p className="text-sm text-gray-500 mt-0.5">{verifyModal.name} · <span className="capitalize">{verifyModal.provider_type}</span></p></div><button onClick={() => setVerifyModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4 text-gray-500" /></button></div><div className="modal-body space-y-4"><div className="info-box info-box-green text-xs flex items-center gap-2"><Shield className="w-4 h-4 text-green-600 flex-shrink-0" />Badge: <strong>{verifyModal.provider_type === "vet" ? "Verified Veterinarian" : "Verified Agrovet"}</strong></div><div><label className="field-label">License Number <span className="text-gray-400 font-normal normal-case">(optional)</span></label><input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="KVB-xxxx..." className="input-field" /></div><div><label className="field-label">License Expiry <span className="text-gray-400 font-normal normal-case">(optional)</span></label><input type="date" value={licenseExpiry} onChange={e => setLicenseExpiry(e.target.value)} className="input-field" /></div><div><label className="field-label">Verification Badge</label><input type="text" value={verificationBadge} onChange={e => setVerificationBadge(e.target.value)} className="input-field" /></div></div><div className="modal-footer"><button onClick={() => setVerifyModal(null)} className="btn btn-ghost">Cancel</button><button onClick={submitVerify} disabled={acting === verifyModal.id} className="btn btn-primary"><CheckCircle className="w-4 h-4" /> Approve & Verify</button></div></div></div>}
      {docsModal && <div className="modal-backdrop" onClick={() => { setDocsModal(null); setApplication(null); }}><div className="modal max-w-2xl" onClick={e => e.stopPropagation()}><div className="modal-header"><div><h3 className="font-bold text-gray-900 sora">Documents — {docsModal.name}</h3><p className="text-sm text-gray-500 capitalize mt-0.5">{docsModal.provider_type}</p></div><button onClick={() => { setDocsModal(null); setApplication(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4 text-gray-500" /></button></div><div className="modal-body max-h-96 overflow-y-auto scroll-area">{application === null ? <div className="flex items-center justify-center py-10"><div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div> : !application?.documents?.length ? <div className="empty-state py-8"><p className="empty-state-sub">No documents uploaded yet.</p></div> : <div className="space-y-3">{(application.documents as Doc[]).map(d => <div key={d.path} className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-200 transition"><div><p className="font-semibold text-gray-900 text-sm">{DOC_LABELS[d.type] || d.type}</p><p className="text-xs text-gray-500 mt-0.5">{d.filename}</p></div><a href={`${serverBaseUrl}${d.path}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><ExternalLink className="w-3.5 h-3.5" /> View</a></div>)}</div>}{application?.documents_verified_at && <div className="mt-4 info-box info-box-green flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />Documents confirmed on {new Date(application.documents_verified_at).toLocaleDateString()}</div>}</div><div className="modal-footer"><button onClick={() => { setDocsModal(null); setApplication(null); }} className="btn btn-ghost">Close</button>{application?.documents?.length && !application?.documents_verified_at && <button onClick={confirmDocuments} disabled={!!acting} className="btn btn-primary"><CheckCircle className="w-4 h-4" /> Confirm Documents</button>}</div></div></div>}
      {rejectModal && <div className="modal-backdrop" onClick={() => setRejectModal(null)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-header"><div><h3 className="font-bold text-gray-900 sora">Reject Provider</h3><p className="text-sm text-gray-500 mt-0.5">{rejectModal.name}</p></div><button onClick={() => setRejectModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4 text-gray-500" /></button></div><div className="modal-body"><label className="field-label">Rejection reason <span className="text-red-500">*</span></label><textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Missing KVB registration, incomplete documents..." rows={4} className="input-field resize-none" /><p className="field-hint">This reason will be shown to the provider in their dashboard.</p></div><div className="modal-footer"><button onClick={() => setRejectModal(null)} className="btn btn-ghost">Cancel</button><button onClick={submitReject} disabled={acting === rejectModal.id || !rejectReason.trim()} className="btn btn-danger"><XCircle className="w-4 h-4" /> Reject Provider</button></div></div></div>}
    </Layout>
  );
}