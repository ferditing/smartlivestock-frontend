/**
 * SmartLivestock — ProviderDocuments
 * Professional document upload panel. Functionality unchanged.
 */

import { useState, useEffect } from "react";
import api, { serverBaseUrl } from "../api/axios";
import { useToast } from "../context/ToastContext";
import {
  FileText, Upload, ExternalLink, Trash2, Loader2, Shield,
  CheckCircle, Clock, AlertCircle,
} from "lucide-react";

const DOC_LABELS: Record<string, string> = {
  national_id:           "National ID",
  kcse_certificate:      "KCSE Certificate",
  academic_certificate:  "Academic Certificate (Vet / Animal Health)",
  kvb_registration:      "Kenya Veterinary Board (KVB) Registration",
  vmd_certification:     "VMD Certification",
  business_registration: "Business Registration Certificate",
  county_permit:         "County Business Permit",
  pcpb_license:          "PCPB License (Pesticides)",
  premises_inspection:   "Premises Inspection Approval",
};

const DOC_DESC: Record<string, string> = {
  national_id:           "Kenyan National ID or valid passport",
  kcse_certificate:      "Secondary school leaving certificate",
  academic_certificate:  "Degree or diploma from accredited institution",
  kvb_registration:      "Current KVB practising certificate",
  vmd_certification:     "Veterinary Medicines Directorate certificate",
  business_registration: "Certificate of incorporation or business name",
  county_permit:         "Annual county business operation permit",
  pcpb_license:          "Pesticides Control Products Board licence",
  premises_inspection:   "Government premises approval letter",
};

type Doc = { type: string; path: string; filename: string };
type Props = { providerType: "vet" | "agrovet" };

export default function ProviderDocuments({ providerType }: Props) {
  const [application, setApplication] = useState<{ documents?: Doc[] } | null>(null);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchApplication = async () => {
    try {
      const res = await api.get("/applications/me");
      setApplication(res.data.application);
      setDocumentTypes(res.data.document_types || []);
    } catch {
      setApplication(null);
      setDocumentTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplication(); }, [providerType]);

  const handleUpload = async (docType: string, file: File) => {
    if (!file || file.size > 10 * 1024 * 1024) {
      addToast("error", "Invalid file", "Max 10 MB — PDF, JPG, PNG, DOC");
      return;
    }
    setUploading(docType);
    const form = new FormData();
    form.append(`document_${docType}`, file);
    try {
      await api.post("/applications/submit", form, { headers: { "Content-Type": "multipart/form-data" } });
      addToast("success", "Uploaded", `${DOC_LABELS[docType] || docType} uploaded successfully`);
      fetchApplication();
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { error?: string } } };
      addToast("error", "Upload failed", ax?.response?.data?.error || "Failed to upload");
    } finally {
      setUploading(null);
    }
  };

  const removeDoc = async (path: string, label: string) => {
    try {
      await api.delete(`/applications/documents/${encodeURIComponent(path)}`);
      addToast("success", "Removed", `${label} removed`);
      fetchApplication();
    } catch {
      addToast("error", "Error", "Failed to remove document");
    }
  };

  const docs = (application?.documents || []) as Doc[];
  const docsByType = Object.fromEntries(docs.map(d => [d.type, d]));
  const uploaded = documentTypes.filter(t => docsByType[t]).length;
  const total = documentTypes.length;
  const allDone = total > 0 && uploaded === total;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-40" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-56" />
          </div>
        </div>
        {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse mb-2" />)}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 sora">Professional Documents</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Required for {providerType === "vet" ? "veterinary" : "agrovet"} verification
              </p>
            </div>
          </div>
          {total > 0 && (
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 ${allDone ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {allDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {uploaded}/{total}
            </span>
          )}
        </div>
        {total > 0 && (
          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${(uploaded / total) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50">
        {documentTypes.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center px-6">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-500">No documents required</p>
            <p className="text-sm text-gray-400 mt-1">Your application has no pending document requirements</p>
          </div>
        ) : documentTypes.map(type => {
          const doc = docsByType[type];
          const label = DOC_LABELS[type] || type;
          const isUploading = uploading === type;

          return (
            <div key={type} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${doc ? "bg-green-100" : "bg-gray-100"}`}>
                  {doc ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  {doc
                    ? <div className="flex items-center gap-1 mt-0.5"><FileText className="w-3 h-3 text-green-600 flex-shrink-0" /><span className="text-xs text-green-700 truncate max-w-[200px]">{doc.filename}</span></div>
                    : <p className="text-xs text-gray-400 mt-0.5">{DOC_DESC[type] || "Not uploaded"}</p>
                  }
                </div>
              </div>

              <div className="flex items-center gap-2 pl-11 sm:pl-0 flex-shrink-0">
                {doc ? (
                  <>
                    <a href={`${serverBaseUrl}${doc.path}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all">
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </a>
                    <button type="button" onClick={() => removeDoc(doc.path, label)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-red-200 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-300 transition-all">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </>
                ) : (
                  <label className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl cursor-pointer text-white select-none"
                    style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 4px 12px rgba(22,163,74,.25)" }}>
                    {isUploading
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading…</>
                      : <><Upload className="w-3.5 h-3.5" />Upload</>
                    }
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
                      disabled={!!uploading}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(type, f); e.target.value = ""; }} />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer status */}
      {total > 0 && (
        <div className={`px-6 py-3.5 border-t ${allDone ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
          <div className={`flex items-center gap-2 text-xs font-medium ${allDone ? "text-green-700" : "text-amber-700"}`}>
            {allDone
              ? <><CheckCircle className="w-3.5 h-3.5" /> All documents uploaded — your application is under review.</>
              : <><AlertCircle className="w-3.5 h-3.5" /> Upload all required documents to complete verification. Max file size: 10 MB.</>
            }
          </div>
        </div>
      )}
    </div>
  );
}