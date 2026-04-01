import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { getSubadminAnalytics, getSubadminSymptomReports, getSubadminSymptomReport } from "../../api/subadmin.api";
import { useToast } from "../../context/ToastContext";
import { BarChart3, ArrowLeft, MapPin, Activity, FileBarChart, Stethoscope, Eye, X, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Analytics = { county: string; symptomByCounty: { county: string; count: string }[]; diagnosesByLabel: { predicted_label: string; count: string }[]; };
type CaseRow = { id: number; user_id: number; animal_type: string | null; symptom_text: string | null; report_status: string; created_at: string; county: string | null; sub_county: string | null; reporter_name: string; predicted_label: string | null; confidence: string | number | null; };
type CaseDetail = { report: { id: number; symptom_text: string | null; animal_type: string | null; status: string; created_at: string; }; user: { name: string; county: string | null; sub_county: string | null } | null; diagnosis: { id: number; predicted_label: string; confidence: number | string | null; } | null; verified_document: unknown; };

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];

export default function SubAdminAnalytics() {
  const { addToast } = useToast();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [casesTotal, setCasesTotal] = useState(0);
  const [casesPage, setCasesPage] = useState(1);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesStatus, setCasesStatus] = useState("all");
  const [caseDetailId, setCaseDetailId] = useState<number | null>(null);
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [caseDetailLoading, setCaseDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSubadminAnalytics().then(r => setData(r.analytics ?? r)).catch(e => setError(e?.response?.data?.error || "Failed to load analytics")).finally(() => setLoading(false));
  }, []);

   
  useEffect(() => {
    setCasesLoading(true);
    getSubadminSymptomReports({ page: casesPage, limit: 20, status: casesStatus !== "all" ? casesStatus : undefined })
      .then((r: any) => { setCases(r.reports || []); setCasesTotal(r.total || 0); })
      .catch((e: any) => addToast("error", "Error", e?.response?.data?.error || "Failed to load cases"))
      .finally(() => setCasesLoading(false));
  }, [casesPage, casesStatus]);

  useEffect(() => {
    if (caseDetailId == null) { setCaseDetail(null); return; }
    setCaseDetailLoading(true); setCaseDetail(null);
    getSubadminSymptomReport(caseDetailId).then(r => setCaseDetail(r.data ?? r)).catch(() => setCaseDetail(null)).finally(() => setCaseDetailLoading(false));
  }, [caseDetailId]);

  const diagnosisData = useMemo(() => (data?.diagnosesByLabel || []).map((d, i) => ({ name: d.predicted_label || "Unknown", value: Number(d.count), color: COLORS[i % COLORS.length] })), [data]);
  const totalSymptomReports = useMemo(() => (data?.symptomByCounty || []).reduce((sum, c) => sum + Number(c.count || 0), 0), [data]);
  const totalDiagnoses = useMemo(() => (data?.diagnosesByLabel || []).reduce((sum, d) => sum + Number(d.count || 0), 0), [data]);
  const county = data?.county || "Your county";

  if (loading) return <Layout role="subadmin"><div className="flex items-center justify-center min-h-[300px]"><div className="w-10 h-10 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div></Layout>;
  if (error) return <Layout role="subadmin"><div className="alert-card alert-card-red m-4"><p className="text-red-700">{error}</p></div></Layout>;

  const statusBadge = (s: string) => { if (s === "resolved") return <span className="badge badge-success badge-dot capitalize">{s}</span>; if (["diagnosed", "predicted"].includes(s)) return <span className="badge badge-info badge-dot capitalize">{s}</span>; if (s === "error") return <span className="badge badge-error badge-dot capitalize">{s}</span>; return <span className="badge badge-warning badge-dot capitalize">{s}</span>; };

  return (
    <Layout role="subadmin">
      <div className="space-y-6">

        {/* ── Hero Banner ── */}
        <div className="rounded-2xl overflow-hidden animate-fadeIn" style={{ background: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #0d9488 100%)" }}>
          <div className="relative px-6 py-8 md:px-8">
            <div className="absolute top-0 right-0 text-[120px] leading-none opacity-[0.07] select-none pointer-events-none pr-4 pt-2">📊</div>
            <div className="relative z-10">
              <Link to="/subadmin" className="inline-flex items-center gap-1.5 text-teal-200 hover:text-white transition-colors mb-4 text-sm font-medium"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white sora mb-1">County Analytics</h1>
              <p className="text-teal-200 text-sm mb-4">Symptom reports and AI diagnosis distribution for {county}</p>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 w-fit backdrop-blur-sm">
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-white font-bold sora">{county}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Symptom Reports", val: totalSymptomReports.toLocaleString(), Icon: Activity, color: "border-teal-500", bg: "bg-teal-50", ic: "text-teal-600" },
            { label: "AI Diagnoses", val: totalDiagnoses.toLocaleString(), Icon: Stethoscope, color: "border-blue-500", bg: "bg-blue-50", ic: "text-blue-600" },
            { label: "County", val: county, Icon: MapPin, color: "border-amber-500", bg: "bg-amber-50", ic: "text-amber-600" },
          ].map((k, i) => (
            <div key={k.label} className={`card border-l-4 ${k.color} animate-fadeInUp`} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="card-body flex items-center gap-4 py-4">
                <div className={`w-11 h-11 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}><k.Icon className={`w-5 h-5 ${k.ic}`} /></div>
                <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{k.label}</p><p className="text-xl font-bold text-gray-900 sora tabular-nums">{k.val}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <div className="card-icon-wrap card-icon-purple"><Activity className="w-4 h-4 text-white" /></div>
              <div><h2 className="font-bold text-gray-900 sora text-sm">Diagnosis Distribution</h2><p className="text-xs text-gray-500">Predicted conditions in your county</p></div>
            </div>
            <div className="card-body h-72">
              {diagnosisData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={diagnosisData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value" nameKey="name">{diagnosisData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /><Legend wrapperStyle={{ fontSize: "11px" }} /></PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400"><BarChart3 className="w-12 h-12 mb-2 opacity-30" /><p className="text-sm">No diagnosis data yet</p></div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center gap-3">
              <div className="card-icon-wrap card-icon-blue"><Stethoscope className="w-4 h-4 text-white" /></div>
              <div><h2 className="font-bold text-gray-900 sora text-sm">Diagnoses by Condition</h2><p className="text-xs text-gray-500">Breakdown of disease predictions</p></div>
            </div>
            <div className="card-body p-0">
              {(data?.diagnosesByLabel?.length ?? 0) > 0 ? (
                <div className="overflow-x-auto max-h-72 scroll-area">
                  <table className="table w-full"><thead><tr><th>Condition</th><th className="text-right">Count</th></tr></thead>
                    <tbody>{(data?.diagnosesByLabel || []).map((row, i) => <tr key={row.predicted_label ?? i}><td className="font-medium text-gray-900">{row.predicted_label || "—"}</td><td className="text-right tabular-nums">{Number(row.count || 0).toLocaleString()}</td></tr>)}</tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state py-8"><p className="empty-state-sub">No diagnosis data available yet</p></div>
              )}
            </div>
          </div>
        </div>

        {/* ── Cases List ── */}
        <div className="card">
          <div className="card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="card-icon-wrap card-icon-teal"><FolderOpen className="w-4 h-4 text-white" /></div>
              <div><h2 className="font-bold text-gray-900 sora text-sm">Symptom Cases</h2><p className="text-xs text-gray-500">View case details (read-only)</p></div>
            </div>
            <select value={casesStatus} onChange={e => { setCasesStatus(e.target.value); setCasesPage(1); }} className="select-field w-full sm:w-36 text-xs">
              <option value="all">All status</option><option value="received">Received</option><option value="diagnosed">Diagnosed</option><option value="predicted">Predicted</option><option value="resolved">Resolved</option><option value="error">Error</option>
            </select>
          </div>
          <div className="card-body p-0">
            {casesLoading ? (
              <div className="flex items-center justify-center py-10"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : cases.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon"><FileBarChart className="w-8 h-8" /></div><p className="empty-state-title">No cases found</p><p className="empty-state-sub">Try adjusting the status filter</p></div>
            ) : (
              <div className="overflow-x-auto max-h-80 scroll-area">
                <table className="table w-full">
                  <thead><tr><th>ID</th><th>Date</th><th>Reporter</th><th>Animal</th><th>Status</th><th>Diagnosis</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {cases.map((c, i) => (
                      <tr key={c.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 20}ms` }}>
                        <td className="font-mono text-xs">{c.id}</td>
                        <td className="text-xs whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="font-medium">{c.reporter_name || "—"}</td>
                        <td>{c.animal_type || "—"}</td>
                        <td>{statusBadge(c.report_status)}</td>
                        <td className="text-gray-500">{c.predicted_label || "—"}</td>
                        <td className="text-right"><button type="button" onClick={() => setCaseDetailId(c.id)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition" title="View"><Eye className="w-3.5 h-3.5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {casesTotal > 20 && (
            <div className="card-footer flex items-center justify-between">
              <p className="text-sm text-gray-600">Showing {(casesPage - 1) * 20 + 1}–{Math.min(casesPage * 20, casesTotal)} of {casesTotal}</p>
              <div className="flex gap-1.5">
                <button onClick={() => setCasesPage(p => Math.max(1, p - 1))} disabled={casesPage <= 1} className="btn btn-outline btn-icon-sm"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button onClick={() => setCasesPage(p => p + 1)} disabled={casesPage * 20 >= casesTotal} className="btn btn-outline btn-icon-sm"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Case Detail Modal ── */}
      {caseDetailId != null && (
        <div className="modal-backdrop" onClick={() => setCaseDetailId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-bold text-gray-900 sora">Case Details</h2>
              <button onClick={() => setCaseDetailId(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="modal-body">
              {caseDetailLoading ? (
                <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : caseDetail ? (
                <dl className="grid gap-3 text-sm">
                  {[
                    { label: "Report ID", val: <span className="font-mono text-sm">{caseDetail.report.id}</span> },
                    { label: "Date", val: new Date(caseDetail.report.created_at).toLocaleString() },
                    { label: "Reporter", val: caseDetail.user?.name ?? "—" },
                    { label: "Location", val: [caseDetail.user?.county, caseDetail.user?.sub_county].filter(Boolean).join(", ") || "—" },
                    { label: "Animal Type", val: caseDetail.report.animal_type ?? "—" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                      <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-28 flex-shrink-0">{f.label}</dt>
                      <dd className="font-medium text-gray-900 text-right">{f.val}</dd>
                    </div>
                  ))}
                  <div className="flex items-start justify-between py-2 border-b border-gray-50">
                    <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-28 flex-shrink-0">Symptoms</dt>
                    <dd className="font-medium text-gray-900 text-right text-sm whitespace-pre-wrap max-w-xs">{caseDetail.report.symptom_text ?? "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</dt>
                    <dd>{statusBadge(caseDetail.report.status)}</dd>
                  </div>
                  {caseDetail.diagnosis && (
                    <>
                      <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Diagnosis</dt>
                        <dd className="font-bold text-gray-900">{caseDetail.diagnosis.predicted_label}</dd>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confidence</dt>
                        <dd className="font-bold text-gray-900">{caseDetail.diagnosis.confidence != null ? `${(Number(caseDetail.diagnosis.confidence) * 100).toFixed(1)}%` : "—"}</dd>
                      </div>
                    </>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Failed to load case details.</p>
              )}
            </div>
            <div className="modal-footer"><button onClick={() => setCaseDetailId(null)} className="btn btn-ghost">Close</button></div>
          </div>
        </div>
      )}
    </Layout>
  );
}