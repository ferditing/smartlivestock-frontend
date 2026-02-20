import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import {
  getSubadminAnalytics,
  getSubadminSymptomReports,
  getSubadminSymptomReport,
} from "../../api/subadmin.api";
import { useToast } from "../../context/ToastContext";
import {
  BarChart3,
  ArrowLeft,
  MapPin,
  Activity,
  FileBarChart,
  Stethoscope,
  Eye,
  X,
  FolderOpen,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Analytics = {
  county: string;
  symptomByCounty: { county: string; count: string }[];
  diagnosesByLabel: { predicted_label: string; count: string }[];
};

type CaseRow = {
  id: number;
  user_id: number;
  animal_type: string | null;
  symptom_text: string | null;
  report_status: string;
  created_at: string;
  county: string | null;
  sub_county: string | null;
  reporter_name: string;
  predicted_label: string | null;
  confidence: string | number | null;
};

type CaseDetail = {
  report: {
    id: number;
    symptom_text: string | null;
    animal_type: string | null;
    status: string;
    created_at: string;
  };
  user: { name: string; county: string | null; sub_county: string | null } | null;
  diagnosis: {
    id: number;
    predicted_label: string;
    confidence: number | string | null;
  } | null;
  verified_document: unknown;
};

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];
const sectionCardClass =
  "card border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 rounded-2xl shadow-sm";

export default function SubAdminAnalytics() {
  const { addToast } = useToast();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cases, setCases] = useState<CaseRow[]>([]);
  const [casesTotal, setCasesTotal] = useState(0);
  const [casesPage, setCasesPage] = useState(1);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesStatus, setCasesStatus] = useState<string>("all");

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [caseDetailId, setCaseDetailId] = useState<number | null>(null);
  const [caseDetailLoading, setCaseDetailLoading] = useState(false);

  useEffect(() => {
    getSubadminAnalytics()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.error || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCasesLoading(true);
    getSubadminSymptomReports({ page: casesPage, limit: 20, status: casesStatus })
      .then((r) => {
        setCases(r.cases || []);
        setCasesTotal(r.total ?? 0);
      })
      .catch((e) => addToast("error", "Error", e?.response?.data?.error || "Failed to load cases"))
      .finally(() => setCasesLoading(false));
  }, [casesPage, casesStatus, addToast]);

  useEffect(() => {
    if (caseDetailId == null) {
      setCaseDetail(null);
      return;
    }
    setCaseDetailLoading(true);
    getSubadminSymptomReport(caseDetailId)
      .then(setCaseDetail)
      .catch((e) => addToast("error", "Error", e?.response?.data?.error || "Failed to load case"))
      .finally(() => setCaseDetailLoading(false));
  }, [caseDetailId, addToast]);

  const diagnosisData = useMemo(
    () =>
      (data?.diagnosesByLabel || []).map((d, i) => ({
        name: d.predicted_label || "Unknown",
        value: Number(d.count),
        color: COLORS[i % COLORS.length],
      })),
    [data]
  );

  const totalSymptomReports = useMemo(
    () => (data?.symptomByCounty || []).reduce((sum, c) => sum + Number(c.count || 0), 0),
    [data]
  );

  const totalDiagnoses = useMemo(
    () => (data?.diagnosesByLabel || []).reduce((sum, d) => sum + Number(d.count || 0), 0),
    [data]
  );

  if (loading) {
    return (
      <Layout role="subadmin">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="subadmin">
        <div className="card border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-8 rounded-2xl text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </Layout>
    );
  }

  const county = data?.county || "Your county";

  return (
    <Layout role="subadmin">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to="/subadmin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <FileBarChart className="w-7 h-7 text-green-600 dark:text-emerald-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                County Analytics
              </h1>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mt-1 max-w-2xl">
              Symptom reports and AI diagnosis distribution for {county}. View cases for surveillance.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Symptom reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSymptomReports.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 rounded-xl">
                <Stethoscope className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">AI diagnoses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDiagnoses.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">County</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{county}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis pie + tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={sectionCardClass}>
            <div className="card-header flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Diagnosis distribution</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">Predicted conditions in your county</p>
              </div>
            </div>
            <div className="card-body h-80">
              {diagnosisData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diagnosisData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {diagnosisData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-slate-400">
                  <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                  <p>No diagnosis data yet</p>
                </div>
              )}
            </div>
          </div>

          <div className={sectionCardClass}>
            <div className="card-header">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Diagnoses by condition
              </h2>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              {(data?.diagnosesByLabel?.length ?? 0) > 0 ? (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700 sticky top-0">
                      <tr className="text-xs uppercase text-gray-500 dark:text-slate-400">
                        <th className="px-4 py-2.5 text-left font-semibold">Condition</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {(data?.diagnosesByLabel || []).map((row, i) => (
                        <tr key={row.predicted_label ?? i} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60">
                          <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{row.predicted_label || "—"}</td>
                          <td className="px-4 py-2.5 text-right text-gray-700 dark:text-slate-200">{Number(row.count || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">No diagnosis data</div>
              )}
            </div>
          </div>
        </div>

        {/* Cases list */}
        <div className={sectionCardClass}>
          <div className="card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-green-600 dark:text-emerald-500" />
                Symptom cases
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">View case details (read-only). Verified documents are generated by system admin.</p>
            </div>
            <select
              value={casesStatus}
              onChange={(e) => { setCasesStatus(e.target.value); setCasesPage(1); }}
              className="select-field w-full sm:w-36 text-xs"
            >
              <option value="all">All status</option>
              <option value="received">Received</option>
              <option value="diagnosed">Diagnosed</option>
              <option value="predicted">Predicted</option>
              <option value="resolved">Resolved</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            {casesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : cases.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">No cases match your filters.</div>
            ) : (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700 sticky top-0">
                    <tr className="text-xs uppercase text-gray-500 dark:text-slate-400">
                      <th className="px-4 py-2.5 text-left font-semibold">ID</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Reporter</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Animal</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                      <th className="px-4 py-2.5 text-left font-semibold">Diagnosis</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {cases.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60">
                        <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">{c.id}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-200 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.reporter_name || "—"}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{c.animal_type || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${c.report_status === "resolved" ? "badge-success" : c.report_status === "diagnosed" || c.report_status === "predicted" ? "badge-info" : c.report_status === "error" ? "badge-error" : "badge-warning"}`}>
                            {c.report_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{c.predicted_label || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setCaseDetailId(c.id)}
                            className="btn-ghost text-xs text-gray-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-emerald-400 inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {casesTotal > 20 && (
            <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-slate-400">
              <p>Showing {(casesPage - 1) * 20 + 1}–{Math.min(casesPage * 20, casesTotal)} of {casesTotal}</p>
              <div className="flex gap-1.5">
                <button onClick={() => setCasesPage((p) => Math.max(1, p - 1))} disabled={casesPage <= 1} className="btn-outline p-1.5">←</button>
                <button onClick={() => setCasesPage((p) => p + 1)} disabled={casesPage * 20 >= casesTotal} className="btn-outline p-1.5">→</button>
              </div>
            </div>
          )}
        </div>

        {/* Case detail modal */}
        {caseDetailId != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setCaseDetailId(null)} role="dialog" aria-modal="true">
            <div className="card border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="card-header flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Case details</h2>
                <button type="button" onClick={() => setCaseDetailId(null)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Close"><X className="w-5 h-5" /></button>
              </div>
              <div className="card-body space-y-4">
                {caseDetailLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : caseDetail ? (
                  <dl className="grid gap-2 text-sm">
                    <div><dt className="text-xs text-gray-500 dark:text-slate-400">Report ID</dt><dd className="font-mono text-gray-900 dark:text-white">{caseDetail.report.id}</dd></div>
                    <div><dt className="text-xs text-gray-500 dark:text-slate-400">Date</dt><dd className="text-gray-900 dark:text-white">{new Date(caseDetail.report.created_at).toLocaleString()}</dd></div>
                    <div><dt className="text-xs text-gray-500 dark:text-slate-400">Reporter</dt><dd className="text-gray-900 dark:text-white">{caseDetail.user?.name ?? "—"}</dd></div>
                    <div><dt className="text-xs text-gray-500 dark:text-slate-400">Location</dt><dd className="text-gray-900 dark:text-white">{[caseDetail.user?.county, caseDetail.user?.sub_county].filter(Boolean).join(", ") || "—"}</dd></div>
                    <div><dt className="text-xs text-gray-500 dark:text-slate-400">Animal type</dt><dd className="text-gray-900 dark:text-white">{caseDetail.report.animal_type ?? "—"}</dd></div>
                    <div><dt className="text-xs text-gray-500 dark:text-slate-400">Symptoms</dt><dd className="text-gray-900 dark:text-white whitespace-pre-wrap">{caseDetail.report.symptom_text ?? "—"}</dd></div>
                    <div><dt className="text-xs text-gray-500 dark:text-slate-400">Status</dt><dd><span className="badge badge-info">{caseDetail.report.status}</span></dd></div>
                    {caseDetail.diagnosis && (
                      <>
                        <div><dt className="text-xs text-gray-500 dark:text-slate-400">Diagnosis</dt><dd className="text-gray-900 dark:text-white">{caseDetail.diagnosis.predicted_label}</dd></div>
                        <div><dt className="text-xs text-gray-500 dark:text-slate-400">Confidence</dt><dd className="text-gray-900 dark:text-white">{caseDetail.diagnosis.confidence != null ? `${Number(caseDetail.diagnosis.confidence) * 100}%` : "—"}</dd></div>
                      </>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">Failed to load case.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
