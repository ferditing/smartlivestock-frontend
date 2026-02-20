import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { serverBaseUrl } from "../../api/axios";
import {
  getSubadminProviders,
  getSubadminProviderApplication,
  confirmSubadminProviderDocuments,
  verifySubadminProvider,
  rejectSubadminProvider,
} from "../../api/subadmin.api";
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Stethoscope,
  ShoppingBag,
  FileText,
  ExternalLink,
  Calendar,
  MapPin,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

const DOC_LABELS: Record<string, string> = {
  national_id: "National ID",
  kcse_certificate: "KCSE Certificate",
  academic_certificate: "Academic Certificate",
  kvb_registration: "KVB Registration",
  vmd_certification: "VMD Certification",
  business_registration: "Business Registration",
  county_permit: "County Permit",
  pcpb_license: "PCPB License",
  premises_inspection: "Premises Inspection",
};

type Provider = {
  id: number;
  name: string;
  provider_type: string;
  verification_status: string;
  verified_at: string | null;
  license_number: string | null;
  verification_badge: string | null;
  rejection_reason: string | null;
  license_expiry: string | null;
  email: string;
  phone: string | null;
  county: string | null;
  sub_county: string | null;
  created_at: string;
};

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
  const { addToast } = useToast();

  const fetchProviders = () => {
    setLoading(true);
    getSubadminProviders({ status, type })
      .then(setProviders)
      .catch((e) => addToast("error", "Error", e?.response?.data?.error || "Failed to load providers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchProviders(), [status, type]);

  const handleVerify = (p: Provider) => {
    setVerifyModal(p);
    setLicenseNumber(p.license_number || "");
    setLicenseExpiry(p.license_expiry ? p.license_expiry.slice(0, 10) : "");
  };

  const openDocsModal = async (p: Provider) => {
    setDocsModal(p);
    setApplication(null);
    try {
      const res = await getSubadminProviderApplication(p.id);
      setApplication(res.application);
    } catch {
      setApplication(null);
    }
  };

  const confirmDocuments = async () => {
    if (!docsModal) return;
    setActing(docsModal.id);
    try {
      await confirmSubadminProviderDocuments(docsModal.id);
      addToast("success", "Documents confirmed", "Documents verified");
      setDocsModal(null);
      setApplication(null);
      fetchProviders();
    } catch (e) {
      addToast("error", "Error", (e as any)?.response?.data?.error || "Failed");
    } finally {
      setActing(null);
    }
  };

  const handleReject = (p: Provider) => {
    setRejectModal(p);
    setRejectReason(p.rejection_reason || "");
  };

  const submitVerify = () => {
    if (!verifyModal) return;
    setActing(verifyModal.id);
    verifySubadminProvider(verifyModal.id, { license_number: licenseNumber || undefined, license_expiry: licenseExpiry || undefined })
      .then(() => {
        addToast("success", "Approved", `${verifyModal.name} has been verified`);
        setVerifyModal(null);
        setLicenseNumber("");
        setLicenseExpiry("");
        fetchProviders();
      })
      .catch((e) => addToast("error", "Error", e?.response?.data?.error || "Failed"))
      .finally(() => setActing(null));
  };

  const submitReject = () => {
    if (!rejectModal) return;
    setActing(rejectModal.id);
    rejectSubadminProvider(rejectModal.id, rejectReason || undefined)
      .then(() => {
        addToast("success", "Rejected", `${rejectModal.name} has been rejected`);
        setRejectModal(null);
        setRejectReason("");
        fetchProviders();
      })
      .catch((e) => addToast("error", "Error", e?.response?.data?.error || "Failed"))
      .finally(() => setActing(null));
  };

  const getStatusBadge = (s: string) => {
    if (s === "verified") return <span className="badge badge-success">Verified</span>;
    if (s === "rejected") return <span className="badge badge-error">Rejected</span>;
    return <span className="badge badge-warning">Pending</span>;
  };

  return (
    <Layout role="subadmin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/subadmin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-6 h-6 text-green-600 dark:text-emerald-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Provider Approvals</h1>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Verify veterinarians and agrovets in your county
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field w-auto">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="select-field w-auto">
            <option value="all">All types</option>
            <option value="vet">Veterinarian</option>
            <option value="agrovet">Agrovet</option>
          </select>
        </div>

        <div className="card">
          <div className="card-body p-0 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-slate-400">No providers found in your county</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {providers.map((p) => (
                  <div key={p.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${p.provider_type === "vet" ? "bg-blue-50 dark:bg-blue-500/20" : "bg-amber-50 dark:bg-amber-500/20"}`}>
                        {p.provider_type === "vet" ? <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" /> : <ShoppingBag className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-300">{p.email}</p>
                        {p.phone && <p className="text-sm text-gray-500 dark:text-slate-400">{p.phone}</p>}
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{[p.county, p.sub_county].filter(Boolean).join(", ")}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="badge badge-info">{p.provider_type}</span>
                          {getStatusBadge(p.verification_status)}
                          {p.verification_badge && (
                            <span className="badge badge-success flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {p.verification_badge}
                            </span>
                          )}
                        </div>
                        {p.rejection_reason && <p className="text-sm text-red-600 dark:text-red-400 mt-2">Rejection: {p.rejection_reason}</p>}
                        {p.license_expiry && (
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            License expires: {new Date(p.license_expiry).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button onClick={() => openDocsModal(p)} className="btn-outline flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        View Docs
                      </button>
                      {p.verification_status === "pending" && (
                        <>
                          <button onClick={() => handleVerify(p)} disabled={acting === p.id} className="btn-primary flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button onClick={() => handleReject(p)} disabled={acting === p.id} className="btn-outline text-red-600 border-red-300 hover:border-red-400 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {verifyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Approve Provider</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{verifyModal.name} ({verifyModal.provider_type})</p>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">License Number (optional)</label>
                  <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="KVB-xxxx, VMD-xxxx..." className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">License Expiry Date (optional)</label>
                  <input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} className="input-field" />
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Badge: <strong>{verifyModal.provider_type === "vet" ? "Verified Veterinarian" : "Verified Agrovet"}</strong>
                </p>
              </div>
              <div className="card-footer flex justify-end gap-2">
                <button onClick={() => setVerifyModal(null)} className="btn-outline">Cancel</button>
                <button onClick={submitVerify} disabled={acting === verifyModal.id} className="btn-primary">Approve & Verify</button>
              </div>
            </div>
          </div>
        )}

        {docsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-slate-900">
              <div className="card-header flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents - {docsModal.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{docsModal.provider_type}</p>
                </div>
                <button onClick={() => { setDocsModal(null); setApplication(null); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-slate-300">✕</button>
              </div>
              <div className="card-body overflow-y-auto flex-1">
                {application === null ? (
                  <div className="py-8 text-center text-gray-500 dark:text-slate-400">Loading...</div>
                ) : !application?.documents?.length ? (
                  <p className="text-gray-500 dark:text-slate-400">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {(application.documents as Doc[]).map((d) => (
                      <div key={d.path} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{DOC_LABELS[d.type] || d.type}</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{d.filename}</p>
                        </div>
                        <a href={`${serverBaseUrl}${d.path}`} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm py-1.5 px-3 flex items-center gap-1.5">
                          <ExternalLink className="w-4 h-4" />
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                {application?.documents_verified_at && (
                  <p className="mt-4 text-sm text-green-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Documents confirmed on {new Date(application.documents_verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="card-footer flex justify-end gap-2">
                <button onClick={() => { setDocsModal(null); setApplication(null); }} className="btn-outline">Close</button>
                {application?.documents?.length && !application?.documents_verified_at && (
                  <button onClick={confirmDocuments} disabled={!!acting} className="btn-primary">Confirm Documents</button>
                )}
              </div>
            </div>
          </div>
        )}

        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full bg-white dark:bg-slate-900">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Provider</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{rejectModal.name}</p>
              </div>
              <div className="card-body">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rejection reason (required)</label>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Missing KVB registration..." rows={3} className="input-field" />
              </div>
              <div className="card-footer flex justify-end gap-2">
                <button onClick={() => setRejectModal(null)} className="btn-outline">Cancel</button>
                <button onClick={submitReject} disabled={acting === rejectModal.id || !rejectReason.trim()} className="btn-outline text-red-600 border-red-300 dark:border-red-600 dark:text-red-400">Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
