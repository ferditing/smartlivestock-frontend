import { useState, useEffect } from "react";
import api, { serverBaseUrl } from "../api/axios";
import { useToast } from "../context/ToastContext";
import { FileText, Upload, ExternalLink, Trash2, Loader2, Shield } from "lucide-react";

const DOC_LABELS: Record<string, string> = {
  national_id: "National ID",
  kcse_certificate: "KCSE Certificate",
  academic_certificate: "Academic Certificate (Vet/Animal Health)",
  kvb_registration: "Kenya Veterinary Board (KVB) Registration",
  vmd_certification: "VMD Certification",
  business_registration: "Business Registration Certificate",
  county_permit: "County Business Permit",
  pcpb_license: "PCPB License (Pesticides)",
  premises_inspection: "Premises Inspection Approval",
};

type Doc = { type: string; path: string; filename: string };

type Props = {
  providerType: "vet" | "agrovet";
};

export default function ProviderDocuments({ providerType }: Props) {
  const [application, setApplication] = useState<{ documents?: Doc[] } | null>(null);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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

  useEffect(() => {
    fetchApplication();
  }, [providerType]);

  const handleUpload = async (docType: string, file: File) => {
    if (!file || file.size > 10 * 1024 * 1024) {
      addToast("error", "Invalid file", "Max 10MB, PDF/JPG/PNG/DOC");
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append(`document_${docType}`, file);
    try {
      await api.post("/applications/submit", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast("success", "Uploaded", `${DOC_LABELS[docType] || docType} uploaded`);
      fetchApplication();
    } catch (e) {
      addToast("error", "Upload failed", (e as any)?.response?.data?.error || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = async (path: string) => {
    try {
      await api.delete(`/applications/documents/${encodeURIComponent(path)}`);
      addToast("success", "Removed", "Document removed");
      fetchApplication();
    } catch {
      addToast("error", "Error", "Failed to remove document");
    }
  };

  const docs = (application?.documents || []) as Doc[];
  const docsByType = Object.fromEntries(docs.map((d) => [d.type, d]));

  if (loading) {
    return (
      <div className="card">
        <div className="card-body flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Professional Documents</h2>
            <p className="text-sm text-gray-500">
              Upload required documents for verification (KVB, VMD, etc.)
            </p>
          </div>
        </div>
      </div>
      <div className="card-body space-y-4">
        {documentTypes.map((type) => {
          const doc = docsByType[type];
          const label = DOC_LABELS[type] || type;
          return (
            <div
              key={type}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                {doc ? (
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">{doc.filename}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Not uploaded</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {doc ? (
                  <>
                    <a
                      href={`${serverBaseUrl}${doc.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-sm py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </a>
                    <button
                      onClick={() => removeDoc(doc.path)}
                      className="btn-outline text-sm py-1.5 px-3 text-red-600 border-red-200 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </>
                ) : (
                  <label className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(type, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
