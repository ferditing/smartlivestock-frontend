import { useState, useEffect, useMemo, useCallback } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import {
  getAdminAnalytics, getAdminCounties, getSymptomReports, getSymptomReport,
  getVerifiedDocuments, createVerifiedDocument,
} from "../../api/admin.api";
import { useToast } from "../../context/ToastContext";
import {
  BarChart3, ArrowLeft, MapPin, Activity, AlertTriangle, FileBarChart, Stethoscope,
  TrendingUp, Eye, FileCheck, X, Printer, LayoutGrid, FolderOpen, ShieldCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

type Analytics = {
  symptomByCounty: { county: string; count: string }[];
  diagnosesByLabel: { predicted_label: string; count: string }[];
};
type CaseRow = {
  id: number; user_id: number; animal_type: string | null; symptom_text: string | null;
  report_status: string; created_at: string; county: string | null; sub_county: string | null;
  reporter_name: string; predicted_label: string | null; confidence: string | number | null;
};
type CaseDetail = {
  report: { id: number; symptom_text: string | null; animal_type: string | null; status: string; created_at: string; canonical_symptoms?: string[] | null };
  user: { name: string; county: string | null; sub_county: string | null } | null;
  diagnosis: { id: number; predicted_label: string; confidence: number | string | null; recommended_actions: unknown } | null;
  verified_document: { id: number; prescription_notes: string | null; recommendations: string | null; generated_at: string } | null;
};
type VerifiedDocRow = {
  id: number; report_id: number; generated_at: string; prescription_notes: string | null;
  recommendations: string | null; status: string; symptom_text: string | null;
  animal_type: string | null; report_created_at: string; generated_by_name: string;
};
type VerifiedDocPayload = {
  document: { id: number; prescription_notes: string | null; recommendations: string | null; generated_at: string };
  report: { id: number; symptom_text: string | null; animal_type: string | null; status: string; created_at: string };
  reporter: { name: string; county: string | null; sub_county: string | null } | null;
  diagnosis: { predicted_label: string; confidence: number | string | null } | null;
};

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];
const TABS = [
  { id: "overview",   label: "Overview",   icon: LayoutGrid },
  { id: "cases",      label: "Cases",      icon: FolderOpen },
  { id: "spread",     label: "Spread",     icon: MapPin },
  { id: "documents",  label: "Documents",  icon: FileCheck },
] as const;
type TabId = typeof TABS[number]["id"];

const STATUS_BADGE: Record<string, string> = {
  resolved: "badge-success", diagnosed: "badge-info", predicted: "badge-info", error: "badge-error",
};

export default function AdminAnalytics() {
  const { addToast } = useToast();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const [cases, setCases] = useState<CaseRow[]>([]);
  const [casesTotal, setCasesTotal] = useState(0);
  const [casesPage, setCasesPage] = useState(1);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesCounty, setCasesCounty] = useState<string>("all");
  const [casesStatus, setCasesStatus] = useState<string>("all");
  const [counties, setCounties] = useState<{ id: number; name: string }[]>([]);

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [caseDetailId, setCaseDetailId] = useState<number | null>(null);
  const [caseDetailLoading, setCaseDetailLoading] = useState(false);

  const [documentForm, setDocumentForm] = useState<{ reportId: number; prescription_notes: string; recommendations: string } | null>(null);
  const [generatingDoc, setGeneratingDoc] = useState(false);
  const [verifiedDocPrint, setVerifiedDocPrint] = useState<VerifiedDocPayload | null>(null);

  const [documents, setDocuments] = useState<VerifiedDocRow[]>([]);
  const [documentsTotal, setDocumentsTotal] = useState(0);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsPage, setDocumentsPage] = useState(1);
  const [documentView, setDocumentView] = useState<VerifiedDocPayload | null>(null);

  useEffect(() => {
    getAdminAnalytics().then(setData).catch(e => setError(e?.response?.data?.error || "Failed")).finally(() => setLoading(false));
  }, []);
  useEffect(() => { getAdminCounties().then(setCounties).catch(() => setCounties([])); }, []);

  const fetchCases = useCallback(() => {
    setCasesLoading(true);
    getSymptomReports({ page: casesPage, limit: 20, county: casesCounty !== "all" ? casesCounty : undefined, status: casesStatus !== "all" ? casesStatus : undefined })
      .then(r => { setCases(r.cases || []); setCasesTotal(r.total ?? 0); })
      .catch(e => addToast("error", "Error", e?.response?.data?.error || "Failed"))
      .finally(() => setCasesLoading(false));
  }, [casesPage, casesCounty, casesStatus, addToast]);
  useEffect(() => { if (activeTab === "cases") fetchCases(); }, [activeTab, fetchCases]);

  const fetchDocuments = useCallback(() => {
    setDocumentsLoading(true);
    getVerifiedDocuments({ page: documentsPage, limit: 20 })
      .then(r => { setDocuments(r.documents || []); setDocumentsTotal(r.total ?? 0); })
      .catch(e => addToast("error", "Error", e?.response?.data?.error || "Failed"))
      .finally(() => setDocumentsLoading(false));
  }, [documentsPage, addToast]);
  useEffect(() => { if (activeTab === "documents") fetchDocuments(); }, [activeTab, fetchDocuments]);

  useEffect(() => {
    if (caseDetailId == null) { setCaseDetail(null); return; }
    setCaseDetailLoading(true);
    getSymptomReport(caseDetailId)
      .then(setCaseDetail)
      .catch(e => addToast("error", "Error", e?.response?.data?.error || "Failed"))
      .finally(() => setCaseDetailLoading(false));
  }, [caseDetailId, addToast]);

  const openDocumentForm = (reportId: number) => { setDocumentForm({ reportId, prescription_notes: "", recommendations: "" }); setCaseDetailId(null); };

  const submitVerifiedDocument = () => {
    if (!documentForm) return;
    setGeneratingDoc(true);
    createVerifiedDocument(documentForm.reportId, { prescription_notes: documentForm.prescription_notes || undefined, recommendations: documentForm.recommendations || undefined })
      .then(r => { addToast("success", "Document generated", "Verified document created."); setDocumentForm(null); setVerifiedDocPrint(r); fetchDocuments(); })
      .catch(e => addToast("error", "Error", e?.response?.data?.error || "Failed"))
      .finally(() => setGeneratingDoc(false));
  };

  const symptomData = useMemo(() => (data?.symptomByCounty || []).slice(0, 12).map(c => ({ name: c.county || "Unknown", count: Number(c.count) })), [data]);
  const diagnosisData = useMemo(() => (data?.diagnosesByLabel || []).map((d, i) => ({ name: d.predicted_label || "Unknown", value: Number(d.count), color: COLORS[i % COLORS.length] })), [data]);
  const totalSymptomReports = useMemo(() => (data?.symptomByCounty || []).reduce((s, c) => s + Number(c.count || 0), 0), [data]);
  const totalDiagnoses     = useMemo(() => (data?.diagnosesByLabel || []).reduce((s, d) => s + Number(d.count || 0), 0), [data]);
  const topCounty = useMemo(() => { const a = data?.symptomByCounty || []; return a.length ? { county: a[0].county || "Unknown", count: Number(a[0].count || 0) } : null; }, [data]);

  if (loading) return (<Layout role="admin"><div className="flex items-center justify-center min-h-[300px]"><div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div></Layout>);
  if (error)   return (<Layout role="admin"><div className="card p-8 text-center text-red-600">{error}</div></Layout>);

  return (
    <Layout role="admin">
      <div className="space-y-6">

        {/* ── Hero ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#14532d 0%,#166534 55%,#15803d 100%)" }}>
          <div className="relative px-6 py-8">
            <div className="absolute top-0 right-0 text-9xl opacity-10 select-none pointer-events-none pr-6 pt-2">📊</div>
            <div className="relative">
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-green-100 hover:text-white transition mb-3 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-3 mb-1">
                <FileBarChart className="w-7 h-7 text-white opacity-80" />
                <h1 className="text-2xl md:text-3xl font-bold text-white sora">Disease Analytics</h1>
              </div>
              <p className="text-green-100 mt-1 text-sm max-w-2xl">
                National surveillance: view cases, spread, and generate verified documents with prescriptions. Admin-only.
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="card">
          <div className="card-body py-0">
            <nav className="flex gap-1 -mb-px border-b border-gray-100 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap -mb-px ${
                      isActive
                        ? "border-green-600 text-green-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Tab: Overview ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { Icon: Activity,   bg: "bg-emerald-50", ic: "text-emerald-600", accent: "border-l-emerald-500", label: "Total Symptom Reports", val: totalSymptomReports.toLocaleString() },
                { Icon: Stethoscope,bg: "bg-sky-50",     ic: "text-sky-600",     accent: "border-l-sky-500",     label: "Total AI Diagnoses",    val: totalDiagnoses.toLocaleString() },
                { Icon: TrendingUp, bg: "bg-amber-50",   ic: "text-amber-600",   accent: "border-l-amber-500",   label: "Top County (Reports)",  val: topCounty ? `${topCounty.county} (${topCounty.count.toLocaleString()})` : "—" },
              ].map(s => (
                <div key={s.label} className={`stat-card border-l-4 ${s.accent} animate-fadeInUp`}>
                  <div className={`stat-icon ${s.bg}`}><s.Icon className={`w-6 h-6 ${s.ic}`} /></div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 sora tabular-nums">{s.val}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <div className="card-icon-header">
                    <div className="card-icon-wrap card-icon-green"><MapPin className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="font-bold text-gray-900 sora">Symptom Reports by County</h2>
                      <p className="text-sm text-gray-500">Top counties by farmer-reported symptoms</p>
                    </div>
                  </div>
                </div>
                <div className="card-body h-72">
                  {symptomData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={symptomData} layout="vertical" margin={{ left: 20, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} name="Reports" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state h-full"><div className="empty-state-icon"><Activity className="w-7 h-7" /></div><p className="empty-state-sub">No data yet</p></div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-icon-header">
                    <div className="card-icon-wrap card-icon-purple"><Activity className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="font-bold text-gray-900 sora">AI Diagnosis Distribution</h2>
                      <p className="text-sm text-gray-500">Predicted conditions from symptom analysis</p>
                    </div>
                  </div>
                </div>
                <div className="card-body h-72">
                  {diagnosisData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={diagnosisData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                          {diagnosisData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state h-full"><div className="empty-state-icon"><BarChart3 className="w-7 h-7" /></div><p className="empty-state-sub">No diagnosis data yet</p></div>
                  )}
                </div>
              </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <div className="card-icon-header">
                    <div className="card-icon-wrap card-icon-green"><MapPin className="w-5 h-5 text-white" /></div>
                    <h2 className="font-bold text-gray-900 sora">Reports by County (Full List)</h2>
                  </div>
                </div>
                <div className="table-wrapper max-h-72 overflow-y-auto scroll-area">
                  {(data?.symptomByCounty?.length ?? 0) > 0 ? (
                    <table className="table">
                      <thead><tr><th>County</th><th className="text-right">Reports</th></tr></thead>
                      <tbody>
                        {(data?.symptomByCounty || []).map(row => (
                          <tr key={row.county || "unknown"}>
                            <td className="font-medium">{row.county || "—"}</td>
                            <td className="text-right tabular-nums">{Number(row.count || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-10 text-center text-sm text-gray-400">No symptom report data</div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-icon-header">
                    <div className="card-icon-wrap card-icon-blue"><Stethoscope className="w-5 h-5 text-white" /></div>
                    <h2 className="font-bold text-gray-900 sora">Diagnoses by Condition</h2>
                  </div>
                </div>
                <div className="table-wrapper max-h-72 overflow-y-auto scroll-area">
                  {(data?.diagnosesByLabel?.length ?? 0) > 0 ? (
                    <table className="table">
                      <thead><tr><th>Condition</th><th className="text-right">Count</th></tr></thead>
                      <tbody>
                        {(data?.diagnosesByLabel || []).map((row, i) => (
                          <tr key={row.predicted_label ?? i}>
                            <td className="font-medium">{row.predicted_label || "—"}</td>
                            <td className="text-right tabular-nums">{Number(row.count || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-10 text-center text-sm text-gray-400">No diagnosis data</div>
                  )}
                </div>
              </div>
            </div>

            {/* Outbreak Alert */}
            <div className="alert-card alert-card-amber">
              <div className="alert-card-icon bg-amber-100"><AlertTriangle className="w-6 h-6 text-amber-600" /></div>
              <div>
                <h3 className="font-bold text-amber-800 sora">Outbreak Alerts</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Real-time outbreak detection and county-level alerts will be available when threshold rules are configured.
                </p>
                <Link to="/admin/settings" className="inline-block mt-2 text-sm font-semibold text-amber-700 hover:text-amber-800">
                  Configure alert thresholds →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Cases ── */}
        {activeTab === "cases" && (
          <div className="card">
            <div className="card-header">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-green"><FolderOpen className="w-5 h-5 text-white" /></div>
                  <div>
                    <h2 className="font-bold text-gray-900 sora">Symptom Cases</h2>
                    <p className="text-xs text-gray-500">View details and generate verified documents</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={casesCounty} onChange={e => { setCasesCounty(e.target.value); setCasesPage(1); }} className="select-field w-auto text-xs">
                    <option value="all">All counties</option>
                    {counties.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <select value={casesStatus} onChange={e => { setCasesStatus(e.target.value); setCasesPage(1); }} className="select-field w-auto text-xs">
                    <option value="all">All status</option>
                    <option value="received">Received</option>
                    <option value="diagnosed">Diagnosed</option>
                    <option value="predicted">Predicted</option>
                    <option value="resolved">Resolved</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="table-wrapper">
              {casesLoading ? (
                <div className="flex items-center justify-center py-12"><div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : cases.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No cases match your filters.</div>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto scroll-area">
                  <table className="table">
                    <thead>
                      <tr><th>ID</th><th>Date</th><th>Reporter</th><th>County</th><th>Animal</th><th>Status</th><th>Diagnosis</th><th className="text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                      {cases.map(c => (
                        <tr key={c.id}>
                          <td className="font-mono text-xs">{c.id}</td>
                          <td className="text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                          <td className="font-medium">{c.reporter_name || "—"}</td>
                          <td>{c.county || "—"}</td>
                          <td>{c.animal_type || "—"}</td>
                          <td><span className={`badge ${STATUS_BADGE[c.report_status] || 'badge-warning'}`}>{c.report_status}</span></td>
                          <td>{c.predicted_label || "—"}</td>
                          <td className="text-right">
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => setCaseDetailId(c.id)} className="btn btn-xs btn-ghost flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> View</button>
                              <button onClick={() => openDocumentForm(c.id)} className="btn btn-xs btn-outline flex items-center gap-1 text-emerald-700 border-emerald-300"><FileCheck className="w-3.5 h-3.5" /> Doc</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {casesTotal > 20 && (
              <div className="card-footer flex items-center justify-between text-xs text-gray-500">
                <p>Showing {(casesPage - 1) * 20 + 1}–{Math.min(casesPage * 20, casesTotal)} of {casesTotal}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => setCasesPage(p => Math.max(1, p - 1))} disabled={casesPage <= 1} className="btn btn-sm btn-outline">←</button>
                  <button onClick={() => setCasesPage(p => p + 1)} disabled={casesPage * 20 >= casesTotal} className="btn btn-sm btn-outline">→</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Spread ── */}
        {activeTab === "spread" && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-green"><MapPin className="w-5 h-5 text-white" /></div>
                  <div>
                    <h2 className="font-bold text-gray-900 sora">Case Spread by County</h2>
                    <p className="text-sm text-gray-500">Geographic distribution for surveillance and outbreak awareness</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {(data?.symptomByCounty?.length ?? 0) > 0 ? (
                  <div className="table-wrapper max-h-96 overflow-y-auto scroll-area">
                    <table className="table">
                      <thead><tr><th>County</th><th className="text-right">Cases</th><th className="text-right">Share</th></tr></thead>
                      <tbody>
                        {(data?.symptomByCounty || []).map((row, idx) => {
                          const count = Number(row.count || 0);
                          const pct = totalSymptomReports > 0 ? ((count / totalSymptomReports) * 100).toFixed(1) : "0";
                          return (
                            <tr key={row.county || idx}>
                              <td className="font-medium">{row.county || "—"}</td>
                              <td className="text-right tabular-nums">{count.toLocaleString()}</td>
                              <td className="text-right text-gray-400 tabular-nums">{pct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center text-gray-400 text-sm">No spread data yet.</div>
                )}
              </div>
            </div>
            {symptomData.length > 0 && (
              <div className="card">
                <div className="card-header"><h2 className="font-bold text-gray-900 sora">Visual Spread</h2></div>
                <div className="card-body h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={symptomData} layout="vertical" margin={{ left: 20, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} name="Cases" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Documents ── */}
        {activeTab === "documents" && (
          <div className="card">
            <div className="card-header">
              <div className="card-icon-header">
                <div className="card-icon-wrap card-icon-green"><FileCheck className="w-5 h-5 text-white" /></div>
                <div>
                  <h2 className="font-bold text-gray-900 sora">Verified Documents</h2>
                  <p className="text-xs text-gray-500">Official documents with prescriptions. Generate from Cases tab.</p>
                </div>
              </div>
            </div>
            <div className="table-wrapper">
              {documentsLoading ? (
                <div className="flex items-center justify-center py-12"><div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : documents.length === 0 ? (
                <div className="empty-state py-12">
                  <div className="empty-state-icon"><FileCheck className="w-7 h-7" /></div>
                  <h3 className="empty-state-title">No documents yet</h3>
                  <p className="empty-state-sub">Generate verified documents from cases in the Cases tab.</p>
                </div>
              ) : (
                <table className="table">
                  <thead><tr><th>Report ID</th><th>Generated</th><th>By</th><th>Prescription</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {documents.map(d => (
                      <tr key={d.id}>
                        <td className="font-mono text-xs">{d.report_id}</td>
                        <td className="text-xs">{new Date(d.generated_at).toLocaleString()}</td>
                        <td>{d.generated_by_name || "—"}</td>
                        <td className="max-w-[200px] truncate text-gray-500">{d.prescription_notes ? (d.prescription_notes.length > 40 ? d.prescription_notes.slice(0, 40) + "…" : d.prescription_notes) : "—"}</td>
                        <td className="text-right">
                          <button onClick={() => setDocumentView({ document: { id: d.id, prescription_notes: d.prescription_notes, recommendations: d.recommendations, generated_at: d.generated_at }, report: { id: d.report_id, symptom_text: d.symptom_text, animal_type: d.animal_type, status: "", created_at: d.report_created_at }, reporter: null, diagnosis: null })} className="btn btn-xs btn-ghost flex items-center gap-1 ml-auto">
                            <Printer className="w-3.5 h-3.5" /> View / Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {documentsTotal > 20 && (
              <div className="card-footer flex items-center justify-between text-xs text-gray-500">
                <p>Showing {(documentsPage - 1) * 20 + 1}–{Math.min(documentsPage * 20, documentsTotal)} of {documentsTotal}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => setDocumentsPage(p => Math.max(1, p - 1))} disabled={documentsPage <= 1} className="btn btn-sm btn-outline">←</button>
                  <button onClick={() => setDocumentsPage(p => p + 1)} disabled={documentsPage * 20 >= documentsTotal} className="btn btn-sm btn-outline">→</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Case Detail Modal ── */}
        {caseDetailId != null && (
          <div className="modal-backdrop" onClick={() => setCaseDetailId(null)} role="dialog" aria-modal="true">
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="font-bold text-gray-900 sora">Case Details</h2>
                <button onClick={() => setCaseDetailId(null)} className="btn btn-icon btn-ghost btn-icon-sm"><X className="w-5 h-5" /></button>
              </div>
              <div className="modal-body">
                {caseDetailLoading ? (
                  <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : caseDetail ? (
                  <div className="space-y-3">
                    {[
                      { label: "Report ID",  val: <span className="font-mono">{caseDetail.report.id}</span> },
                      { label: "Date",       val: new Date(caseDetail.report.created_at).toLocaleString() },
                      { label: "Reporter",   val: caseDetail.user?.name ?? "—" },
                      { label: "Location",   val: [caseDetail.user?.county, caseDetail.user?.sub_county].filter(Boolean).join(", ") || "—" },
                      { label: "Animal",     val: caseDetail.report.animal_type ?? "—" },
                      { label: "Symptoms",   val: <span className="whitespace-pre-wrap">{caseDetail.report.symptom_text ?? "—"}</span> },
                      { label: "Status",     val: <span className={`badge ${STATUS_BADGE[caseDetail.report.status] || 'badge-warning'}`}>{caseDetail.report.status}</span> },
                      ...(caseDetail.diagnosis ? [
                        { label: "Diagnosis",  val: caseDetail.diagnosis.predicted_label },
                        { label: "Confidence", val: caseDetail.diagnosis.confidence != null ? `${Number(caseDetail.diagnosis.confidence) * 100}%` : "—" },
                      ] : []),
                      ...(caseDetail.verified_document ? [{ label: "Verified Doc", val: <span className="text-emerald-600 text-xs">Generated {new Date(caseDetail.verified_document.generated_at).toLocaleString()}</span> }] : []),
                    ].map((item, i) => (
                      <div key={i}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</p>
                        <div className="font-semibold text-gray-900 text-sm mt-0.5">{item.val}</div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button onClick={() => { openDocumentForm(caseDetail.report.id); setCaseDetailId(null); }} className="btn btn-sm btn-primary flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4" /> Generate Document
                      </button>
                      <button onClick={() => setCaseDetailId(null)} className="btn btn-sm btn-outline">Close</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Failed to load case.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Document Form Modal ── */}
        {documentForm != null && (
          <div className="modal-backdrop" onClick={() => setDocumentForm(null)} role="dialog" aria-modal="true">
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-gray-900 sora">Generate Verified Document</h2>
                </div>
                <button onClick={() => setDocumentForm(null)} className="btn btn-icon btn-ghost btn-icon-sm"><X className="w-5 h-5" /></button>
              </div>
              <div className="modal-body space-y-4">
                <div className="info-box info-box-green">Report ID: <span className="font-mono font-bold">{documentForm.reportId}</span>. Add prescription and recommendations to generate an official verified document.</div>
                <div>
                  <label className="field-label">Prescription / Clinical Notes</label>
                  <textarea value={documentForm.prescription_notes} onChange={e => setDocumentForm(f => f ? { ...f, prescription_notes: e.target.value } : null)} rows={4} className="input-field" placeholder="e.g. Medication, dosage, duration…" />
                </div>
                <div>
                  <label className="field-label">Recommendations</label>
                  <textarea value={documentForm.recommendations} onChange={e => setDocumentForm(f => f ? { ...f, recommendations: e.target.value } : null)} rows={3} className="input-field" placeholder="e.g. Follow-up, isolation, reporting…" />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setDocumentForm(null)} className="btn btn-outline">Cancel</button>
                <button onClick={submitVerifiedDocument} disabled={generatingDoc} className="btn btn-primary flex items-center gap-2">
                  {generatingDoc ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  Generate & View
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Document Print Modal ── */}
        {(verifiedDocPrint != null || documentView != null) && (() => {
          const payload = verifiedDocPrint ?? documentView!;
          return (
            <div className="modal-backdrop" onClick={() => { setVerifiedDocPrint(null); setDocumentView(null); }} role="dialog" aria-modal="true">
              <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-bold text-gray-900 sora">Verified Document</h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => window.print()} className="btn btn-sm btn-outline flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print</button>
                    <button onClick={() => { setVerifiedDocPrint(null); setDocumentView(null); }} className="btn btn-sm btn-ghost"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="modal-body">
                  <div className="rounded-xl border border-gray-200 p-5 space-y-3 text-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Case Summary</p>
                    {[
                      { label: "Report ID",    val: payload.report.id },
                      { label: "Date",         val: new Date(payload.report.created_at).toLocaleString() },
                      ...(payload.reporter ? [{ label: "Reporter / Location", val: `${payload.reporter.name} — ${[payload.reporter.county, payload.reporter.sub_county].filter(Boolean).join(", ") || "—"}` }] : []),
                      { label: "Animal Type", val: payload.report.animal_type ?? "—" },
                      { label: "Symptoms",    val: payload.report.symptom_text ?? "—" },
                      ...(payload.diagnosis ? [{ label: "AI Diagnosis", val: `${payload.diagnosis.predicted_label} ${payload.diagnosis.confidence != null ? `(${(Number(payload.diagnosis.confidence) * 100).toFixed(0)}%)` : ""}` }] : []),
                    ].map((item, i) => (
                      <p key={i}><strong>{item.label}:</strong> {item.val}</p>
                    ))}
                    <hr className="border-gray-200" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Prescription / Clinical Notes</p>
                    <p className="whitespace-pre-wrap text-gray-900">{payload.document.prescription_notes || "—"}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Recommendations</p>
                    <p className="whitespace-pre-wrap text-gray-900">{payload.document.recommendations || "—"}</p>
                    <p className="text-xs text-gray-400 pt-4">Generated: {new Date(payload.document.generated_at).toLocaleString()} · SmartLivestock Admin</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </Layout>
  );
}