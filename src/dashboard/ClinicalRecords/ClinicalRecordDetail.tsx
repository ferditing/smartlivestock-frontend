// ClinicalRecordDetail.tsx – Premium Redesign (SmartLivestock Design System)
// All original API calls, state and logic unchanged.

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  ArrowLeft, Calendar, User, Activity, FileText,
  Clock, CheckCircle, AlertCircle, Stethoscope, PawPrint, Printer,
  BarChart3,
} from "lucide-react";

/* ── Types (unchanged) ──────────────────────────────────────── */
interface ClinicalRecord {
  id: string;
  animal: { id: string; name: string; breed?: string; reg_no?: string; type: string; };
  ml_diagnosis: string; ml_confidence: number;
  vet_diagnosis?: string; status: "pending" | "under_treatment" | "recovered";
  vet: { name: string; email: string; };
  notes?: string; created_at: string;
  followUps?: Array<{ id: string; scheduledDate: string; notes?: string; status: "completed"|"pending"; }>;
}

/* ── Status config ───────────────────────────────────────────── */
const STATUS_CFG = {
  pending:         { label:"Pending",         badge:"bg-amber-100 text-amber-800",  heroGrad:"from-amber-500 to-orange-600",    icon:<Clock className="w-5 h-5 text-amber-600" />, dot:"bg-amber-400" },
  under_treatment: { label:"Under Treatment", badge:"bg-blue-100 text-blue-800",    heroGrad:"from-blue-600 to-indigo-700",     icon:<Activity className="w-5 h-5 text-blue-600" />, dot:"bg-blue-500" },
  recovered:       { label:"Recovered",       badge:"bg-green-100 text-green-800",  heroGrad:"from-green-600 to-emerald-700",   icon:<CheckCircle className="w-5 h-5 text-green-600" />, dot:"bg-green-500" },
};
const getCfg = (s: string) => STATUS_CFG[s as keyof typeof STATUS_CFG] || STATUS_CFG.pending;

/* ── Confidence gauge ─────────────────────────────────────────── */
function ConfidenceGauge({ value }: { value: number }) {
  const color = value >= 80 ? { bar:"from-green-500 to-emerald-600", text:"text-green-700", bg:"bg-green-100" }
              : value >= 50 ? { bar:"from-amber-500 to-orange-500",  text:"text-amber-700", bg:"bg-amber-100" }
              : { bar:"from-red-500 to-rose-600", text:"text-red-700", bg:"bg-red-100" };
  const label = value >= 80 ? "High confidence" : value >= 50 ? "Moderate" : "Low confidence";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${color.bg} ${color.text}`}>{label}</span>
        <span className={`text-2xl font-black sora ${color.text}`}>{value}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color.bar} rounded-full transition-all duration-700`}
          style={{ width:`${value}%` }} />
      </div>
    </div>
  );
}

/* ── Field row ────────────────────────────────────────────────── */
function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold text-gray-900 ${mono ? "font-mono" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export const ClinicalRecordDetail: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate     = useNavigate();
  const { addToast } = useToast();
  const userRole     = localStorage.getItem("role") || "farmer";

  const [record,  setRecord]  = useState<ClinicalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/api/clinical-records/${recordId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setRecord(res.data);
      } catch (err: any) {
        addToast("error", "Error", err?.response?.data?.error || "Failed to fetch record");
      } finally { setLoading(false); }
    })();
  }, [recordId, addToast]);

  if (loading) return (
    <Layout role={userRole}>
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="w-7 h-7 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Loading clinical record…</p>
      </div>
    </Layout>
  );

  if (!record) return (
    <Layout role={userRole}>
      <div className="max-w-4xl mx-auto">
        <div className="card overflow-hidden">
          <div className="card-body py-16 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-gray-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Record Not Found</h3>
              <p className="text-sm text-gray-500 mt-1">The clinical record you're looking for doesn't exist.</p>
            </div>
            <button onClick={() => navigate("/clinical-records")}
              className="btn btn-primary btn-sm flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Records
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );

  const cfg = getCfg(record.status);

  return (
    <Layout role={userRole}>
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeInUp">

        {/* ── Back + actions ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate("/clinical-records")}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition mb-3">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Records
            </button>
            <h1 className="page-title">Clinical Record</h1>
            <p className="page-sub">Record ID: <span className="font-mono text-gray-600">{record.id}</span></p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
            <button onClick={() => window.print()}
              className="btn btn-outline btn-sm flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>

        {/* ── Hero banner ── */}
        <div className={`card overflow-hidden bg-gradient-to-r ${cfg.heroGrad}`}>
          <div className="card-body py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <PawPrint className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Patient</p>
                  <h2 className="text-2xl font-black text-white sora">{record.animal.name}</h2>
                  <p className="text-white/80 text-sm">
                    {record.animal.type}{record.animal.breed ? ` • ${record.animal.breed}` : ""}
                  </p>
                </div>
              </div>
              {record.animal.reg_no && (
                <div className="bg-white/20 rounded-xl px-4 py-3 flex-shrink-0">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Reg No.</p>
                  <p className="text-white font-black text-lg sora">{record.animal.reg_no}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Diagnosis card */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-blue">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 sora text-sm">Diagnosis Information</h3>
                    <p className="text-xs text-gray-400 mt-0.5">ML and veterinary assessments</p>
                  </div>
                </div>
              </div>
              <div className="card-body space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">ML Diagnosis</p>
                    </div>
                    <p className="text-base font-bold text-gray-900">{record.ml_diagnosis}</p>
                    <ConfidenceGauge value={record.ml_confidence} />
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-4 h-4 text-green-500" />
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Vet Diagnosis</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900">{record.vet_diagnosis || "Pending assessment"}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vet card */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-purple">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 sora text-sm">Attending Veterinarian</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Primary care provider</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-black text-purple-700">
                      {record.vet.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 sora">{record.vet.name}</h3>
                    <p className="text-sm text-gray-500">{record.vet.email}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" /> Veterinarian
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(record.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {record.notes && (
              <div className="card overflow-hidden">
                <div className="card-header">
                  <div className="card-icon-header">
                    <div className="card-icon-wrap card-icon-teal">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 sora text-sm">Clinical Notes</h3>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{record.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">

            {/* Follow-ups */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-amber">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 sora text-sm">Follow-ups</h3>
                </div>
              </div>
              <div className="card-body">
                {record.followUps && record.followUps.length > 0 ? (
                  <div className="space-y-3">
                    {record.followUps.map(fu => (
                      <div key={fu.id}
                        className={`border-l-4 pl-4 py-2 ${fu.status === "completed" ? "border-l-green-500" : "border-l-amber-400"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(fu.scheduledDate).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}
                          </p>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            fu.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                          }`}>{fu.status}</span>
                        </div>
                        {fu.notes && <p className="text-xs text-gray-500 mt-1">{fu.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center text-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-xs font-semibold text-gray-400">No follow-ups scheduled</p>
                  </div>
                )}
              </div>
            </div>

            {/* Record metadata */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <h3 className="font-bold text-gray-900 sora text-sm">Record Details</h3>
              </div>
              <div className="card-body space-y-4">
                <Field label="Record Created" value={new Date(record.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })} />
                <Field label="Record ID" value={record.id} mono />
                <Field label="Animal ID" value={record.animal.id} />
                <Field label="Animal Type" value={record.animal.type} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};