import { useState, useEffect, useMemo, useCallback } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import {
  getAdminAnalytics,
  getAdminCounties,
  getSymptomReports,
  getSymptomReport,
  getVerifiedDocuments,
  createVerifiedDocument,
} from "../../api/admin.api";
import { useToast } from "../../context/ToastContext";
import {
  BarChart3,
  ArrowLeft,
  MapPin,
  Activity,
  AlertTriangle,
  FileBarChart,
  Stethoscope,
  TrendingUp,
  Eye,
  FileCheck,
  X,
  Printer,
  LayoutGrid,
  FolderOpen,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/** Disease analytics: admin-only. All endpoints require auth + admin. */
type Analytics = {
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
    canonical_symptoms?: string[] | null;
  };
  user: { name: string; county: string | null; sub_county: string | null } | null;
  diagnosis: {
    id: number;
    predicted_label: string;
    confidence: number | string | null;
    recommended_actions: unknown;
  } | null;
  verified_document: { id: number; prescription_notes: string | null; recommendations: string | null; generated_at: string } | null;
};

type VerifiedDocRow = {
  id: number;
  report_id: number;
  generated_at: string;
  prescription_notes: string | null;
  recommendations: string | null;
  status: string;
  symptom_text: string | null;
  animal_type: string | null;
  report_created_at: string;
  generated_by_name: string;
};

type VerifiedDocPayload = {
  document: { id: number; prescription_notes: string | null; recommendations: string | null; generated_at: string };
  report: { id: number; symptom_text: string | null; animal_type: string | null; status: string; created_at: string };
  reporter: { name: string; county: string | null; sub_county: string | null } | null;
  diagnosis: { predicted_label: string; confidence: number | string | null } | null;
};

const COLORS = ["#16a34a", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#0891b2"];

const sectionCardClass =
  "card border border-gray-100 bg-white/80 dark:bg-slate-900/60 rounded-2xl shadow-sm";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "cases", label: "Cases", icon: FolderOpen },
  { id: "spread", label: "Spread", icon: MapPin },
  { id: "documents", label: "Documents", icon: FileCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
    getAdminAnalytics()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.error || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getAdminCounties().then(setCounties).catch(() => setCounties([]));
  }, []);

  const fetchCases = useCallback(() => {
    setCasesLoading(true);
    getSymptomReports({
      page: casesPage,
      limit: 20,
      county: casesCounty !== "all" ? casesCounty : undefined,
      status: casesStatus !== "all" ? casesStatus : undefined,
    })
      .then((r) => {
        setCases(r.cases || []);
        setCasesTotal(r.total ?? 0);
      })
      .catch((e) => addToast("error", "Error", e?.response?.data?.error || "Failed to load cases"))
      .finally(() => setCasesLoading(false));
  }, [casesPage, casesCounty, casesStatus, addToast]);

  useEffect(() => {
    if (activeTab === "cases") fetchCases();
  }, [activeTab, fetchCases]);

  const fetchDocuments = useCallback(() => {
    setDocumentsLoading(true);
    getVerifiedDocuments({ page: documentsPage, limit: 20 })
      .then((r) => {
        setDocuments(r.documents || []);
        setDocumentsTotal(r.total ?? 0);
      })
      .catch((e) => addToast("error", "Error", e?.response?.data?.error || "Failed to load documents"))
      .finally(() => setDocumentsLoading(false));
  }, [documentsPage, addToast]);

  useEffect(() => {
    if (activeTab === "documents") fetchDocuments();
  }, [activeTab, fetchDocuments]);

  useEffect(() => {
    if (caseDetailId == null) {
      setCaseDetail(null);
      return;
    }
    setCaseDetailLoading(true);
    getSymptomReport(caseDetailId)
      .then(setCaseDetail)
      .catch((e) => addToast("error", "Error", e?.response?.data?.error || "Failed to load case"))
      .finally(() => setCaseDetailLoading(false));
  }, [caseDetailId, addToast]);

  const openDocumentForm = (reportId: number) => {
    setDocumentForm({ reportId, prescription_notes: "", recommendations: "" });
    setCaseDetailId(null);
  };

  const submitVerifiedDocument = () => {
    if (!documentForm) return;
    setGeneratingDoc(true);
    createVerifiedDocument(documentForm.reportId, {
      prescription_notes: documentForm.prescription_notes || undefined,
      recommendations: documentForm.recommendations || undefined,
    })
      .then((r) => {
        addToast("success", "Document generated", "Verified document created.");
        setDocumentForm(null);
        setVerifiedDocPrint(r);
        fetchDocuments();
      })
      .catch((e) => addToast("error", "Error", e?.response?.data?.error || "Failed to generate document"))
      .finally(() => setGeneratingDoc(false));
  };

  const symptomData = useMemo(
    () =>
      (data?.symptomByCounty || []).slice(0, 12).map((c) => ({
        name: c.county || "Unknown",
        count: Number(c.count),
      })),
    [data]
  );

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

  const topCounty = useMemo(() => {
    const arr = data?.symptomByCounty || [];
    if (arr.length === 0) return null;
    return { county: arr[0].county || "Unknown", count: Number(arr[0].count || 0) };
  }, [data]);

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="admin">
        <div className="card border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-8 rounded-2xl text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <FileBarChart className="w-7 h-7 text-green-600 dark:text-emerald-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Disease Analytics
              </h1>
            </div>
            <p className="text-gray-600 dark:text-slate-300 mt-1 max-w-2xl">
              National surveillance: view cases, spread, and generate verified documents with prescriptions. Admin-only.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex gap-1" aria-label="Analytics sections">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    isActive
                      ? "border-green-600 dark:border-emerald-500 text-green-700 dark:text-emerald-400"
                      : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <>
        {/* KPI summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Total symptom reports
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalSymptomReports.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 rounded-xl">
                <Stethoscope className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Total AI diagnoses
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalDiagnoses.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 p-4 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Top county (reports)
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {topCounty ? `${topCounty.county} (${topCounty.count.toLocaleString()})` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={sectionCardClass}>
            <div className="card-header flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Symptom reports by county
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Top counties by farmer-reported symptoms (aggregated)
                </p>
              </div>
            </div>
            <div className="card-body h-80">
              {symptomData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={symptomData}
                    layout="vertical"
                    margin={{ left: 20, right: 30 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="text-gray-200 dark:text-slate-700"
                    />
                    <XAxis type="number" stroke="currentColor" className="text-gray-500 dark:text-slate-400" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={90}
                      tick={{ fontSize: 11 }}
                      stroke="currentColor"
                      className="text-gray-600 dark:text-slate-300"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--tooltip-bg, #fff)",
                        border: "1px solid var(--border-color, #e5e7eb)",
                        borderRadius: "12px",
                      }}
                      labelStyle={{ color: "var(--text-color, #111)" }}
                    />
                    <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} name="Reports" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-slate-400">
                  <Activity className="w-12 h-12 mb-2 opacity-50" />
                  <p>No symptom reports by county yet</p>
                </div>
              )}
            </div>
          </div>

          <div className={sectionCardClass}>
            <div className="card-header flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI diagnosis distribution
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Predicted conditions from symptom analysis
                </p>
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--tooltip-bg, #fff)",
                        border: "1px solid var(--border-color, #e5e7eb)",
                        borderRadius: "12px",
                      }}
                    />
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
        </div>

        {/* Report tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={sectionCardClass}>
            <div className="card-header">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600 dark:text-emerald-500" />
                Symptom reports by county (full list)
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Count per county from symptom_reports joined with users
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              {(data?.symptomByCounty?.length ?? 0) > 0 ? (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700 sticky top-0">
                      <tr className="text-xs uppercase text-gray-500 dark:text-slate-400">
                        <th className="px-4 py-2.5 text-left font-semibold">County</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Reports</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {(data?.symptomByCounty || []).map((row) => (
                        <tr
                          key={row.county || "unknown"}
                          className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                            {row.county || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-700 dark:text-slate-200">
                            {Number(row.count || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                  No symptom report data
                </div>
              )}
            </div>
          </div>

          <div className={sectionCardClass}>
            <div className="card-header">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Diagnoses by condition (full list)
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Count per predicted_label from diagnoses table
              </p>
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
                        <tr
                          key={row.predicted_label ?? i}
                          className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">
                            {row.predicted_label || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-700 dark:text-slate-200">
                            {Number(row.count || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                  No diagnosis data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Outbreak alerts */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-sm">
          <div className="card-body flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Outbreak alerts</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300/90 mt-1">
                Real-time outbreak detection and county-level alerts will be available when
                threshold rules are configured in System Settings.
              </p>
              <Link
                to="/admin/settings"
                className="inline-block mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
              >
                Configure alert thresholds →
              </Link>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Tab: Cases */}
        {activeTab === "cases" && (
          <div className={sectionCardClass}>
            <div className="card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-green-600 dark:text-emerald-500" />
                  Symptom cases
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  View case details and generate verified documents (prescriptions, recommendations).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={casesCounty}
                  onChange={(e) => { setCasesCounty(e.target.value); setCasesPage(1); }}
                  className="select-field w-full sm:w-36 text-xs"
                >
                  <option value="all">All counties</option>
                  {counties.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={casesStatus}
                  onChange={(e) => { setCasesStatus(e.target.value); setCasesPage(1); }}
                  className="select-field w-full sm:w-32 text-xs"
                >
                  <option value="all">All status</option>
                  <option value="received">Received</option>
                  <option value="diagnosed">Diagnosed</option>
                  <option value="predicted">Predicted</option>
                  <option value="resolved">Resolved</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              {casesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : cases.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                  No cases match your filters.
                </div>
              ) : (
                <>
                  {/* Mobile-first: card list */}
                  <div className="md:hidden p-3 sm:p-4 space-y-3">
                    {cases.map((c) => {
                      const badgeClass =
                        c.report_status === "resolved"
                          ? "badge-success"
                          : c.report_status === "diagnosed" || c.report_status === "predicted"
                          ? "badge-info"
                          : c.report_status === "error"
                          ? "badge-error"
                          : "badge-warning";
                      return (
                        <div
                          key={c.id}
                          className="rounded-xl border border-gray-100 dark:border-slate-700 bg-white/70 dark:bg-slate-900/50 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400">Case ID</p>
                              <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                {c.id}
                              </p>
                            </div>
                            <span className={`badge ${badgeClass}`}>{c.report_status}</span>
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-gray-500 dark:text-slate-400">Date</p>
                              <p className="text-gray-900 dark:text-white">
                                {new Date(c.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-slate-400">County</p>
                              <p className="text-gray-900 dark:text-white">{c.county || "—"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-slate-400">Reporter</p>
                              <p className="text-gray-900 dark:text-white">
                                {c.reporter_name || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-slate-400">Animal</p>
                              <p className="text-gray-900 dark:text-white">{c.animal_type || "—"}</p>
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-slate-400">Symptoms</p>
                            <p className="text-sm text-gray-700 dark:text-slate-200 line-clamp-3">
                              {c.symptom_text || "—"}
                            </p>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                            <p className="text-gray-500 dark:text-slate-400">Diagnosis</p>
                            <p className="text-gray-900 dark:text-white text-right">
                              {c.predicted_label || "—"}
                            </p>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setCaseDetailId(c.id)}
                              className="btn-outline text-xs py-2 px-2 inline-flex items-center justify-center gap-1.5"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => openDocumentForm(c.id)}
                              className="btn-primary text-xs py-2 px-2 inline-flex items-center justify-center gap-1.5"
                              title="Generate verified document"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Document
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop/tablet: full table */}
                  <div className="hidden md:block overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700 sticky top-0">
                        <tr className="text-xs uppercase text-gray-500 dark:text-slate-400">
                          <th className="px-4 py-2.5 text-left font-semibold">ID</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Reporter</th>
                          <th className="px-4 py-2.5 text-left font-semibold">County</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Animal</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Symptoms</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Diagnosis</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {cases.map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors">
                            <td className="px-4 py-3 text-gray-900 dark:text-white font-mono text-xs">{c.id}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-slate-200 text-xs">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.reporter_name || "—"}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{c.county || "—"}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{c.animal_type || "—"}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-slate-300 max-w-[220px] truncate" title={c.symptom_text || ""}>
                              {c.symptom_text ? (c.symptom_text.length > 70 ? c.symptom_text.slice(0, 70) + "…" : c.symptom_text) : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge ${
                                c.report_status === "resolved" ? "badge-success" :
                                c.report_status === "diagnosed" || c.report_status === "predicted" ? "badge-info" :
                                c.report_status === "error" ? "badge-error" : "badge-warning"
                              }`}>
                                {c.report_status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{c.predicted_label || "—"}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setCaseDetailId(c.id)}
                                  className="btn-ghost text-xs text-gray-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-emerald-400 inline-flex items-center gap-1"
                                  title="View details"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDocumentForm(c.id)}
                                  className="btn-outline text-xs py-1 px-2 border-emerald-300 text-emerald-700 hover:border-emerald-400 dark:border-emerald-500/60 dark:text-emerald-300 inline-flex items-center gap-1"
                                  title="Generate verified document"
                                >
                                  <FileCheck className="w-3.5 h-3.5" /> Document
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            {casesTotal > 20 && (
              <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-slate-400">
                <p>Showing {(casesPage - 1) * 20 + 1}–{Math.min(casesPage * 20, casesTotal)} of {casesTotal}</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCasesPage((p) => Math.max(1, p - 1))}
                    disabled={casesPage <= 1}
                    className="btn-outline p-1.5"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCasesPage((p) => p + 1)}
                    disabled={casesPage * 20 >= casesTotal}
                    className="btn-outline p-1.5"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Spread */}
        {activeTab === "spread" && (
          <div className="space-y-6">
            <div className={sectionCardClass}>
              <div className="card-header flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Case spread by county</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Geographic distribution of symptom reports. Use for surveillance and outbreak awareness.
                  </p>
                </div>
              </div>
              <div className="card-body">
                {(data?.symptomByCounty?.length ?? 0) > 0 ? (
                  <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700 sticky top-0">
                          <tr className="text-xs uppercase text-gray-500 dark:text-slate-400">
                            <th className="px-4 py-2.5 text-left font-semibold">County</th>
                            <th className="px-4 py-2.5 text-right font-semibold">Cases</th>
                            <th className="px-4 py-2.5 text-right font-semibold">Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                          {(data?.symptomByCounty || []).map((row, idx) => {
                            const count = Number(row.count || 0);
                            const pct = totalSymptomReports > 0 ? ((count / totalSymptomReports) * 100).toFixed(1) : "0";
                            return (
                              <tr key={row.county || idx} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60">
                                <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{row.county || "—"}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700 dark:text-slate-200">{count.toLocaleString()}</td>
                                <td className="px-4 py-2.5 text-right text-gray-500 dark:text-slate-400">{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    No spread data yet.
                  </div>
                )}
              </div>
            </div>
            {data?.symptomByCounty && symptomData.length > 0 && (
              <div className={sectionCardClass}>
                <div className="card-body h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={symptomData} layout="vertical" margin={{ left: 20, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" className="text-gray-200 dark:text-slate-700" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} name="Cases" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Documents */}
        {activeTab === "documents" && (
          <div className={sectionCardClass}>
            <div className="card-header">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-green-600 dark:text-emerald-500" />
                Verified documents
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Officially generated documents with prescriptions and recommendations. Generate new from Cases tab.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
              {documentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                  No verified documents yet. Generate one from a case in the Cases tab.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-100 dark:border-slate-700">
                      <tr className="text-xs uppercase text-gray-500 dark:text-slate-400">
                        <th className="px-4 py-2.5 text-left font-semibold">Report ID</th>
                        <th className="px-4 py-2.5 text-left font-semibold">Generated</th>
                        <th className="px-4 py-2.5 text-left font-semibold">By</th>
                        <th className="px-4 py-2.5 text-left font-semibold">Prescription</th>
                        <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {documents.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/60">
                          <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white">{d.report_id}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-slate-200 text-xs">
                            {new Date(d.generated_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-slate-200">{d.generated_by_name || "—"}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-slate-300 max-w-[200px] truncate" title={d.prescription_notes || ""}>
                            {d.prescription_notes ? (d.prescription_notes.length > 40 ? d.prescription_notes.slice(0, 40) + "…" : d.prescription_notes) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setDocumentView({
                                document: { id: d.id, prescription_notes: d.prescription_notes, recommendations: d.recommendations, generated_at: d.generated_at },
                                report: { id: d.report_id, symptom_text: d.symptom_text, animal_type: d.animal_type, status: "", created_at: d.report_created_at },
                                reporter: null,
                                diagnosis: null,
                              })}
                              className="btn-ghost text-xs text-gray-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-emerald-400 inline-flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" /> View / Print
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {documentsTotal > 20 && (
              <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-slate-400">
                <p>Showing {(documentsPage - 1) * 20 + 1}–{Math.min(documentsPage * 20, documentsTotal)} of {documentsTotal}</p>
                <div className="flex gap-1.5">
                  <button onClick={() => setDocumentsPage((p) => Math.max(1, p - 1))} disabled={documentsPage <= 1} className="btn-outline p-1.5">←</button>
                  <button onClick={() => setDocumentsPage((p) => p + 1)} disabled={documentsPage * 20 >= documentsTotal} className="btn-outline p-1.5">→</button>
                </div>
              </div>
            )}
          </div>
        )}

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
                  <>
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
                      {caseDetail.verified_document && (
                        <div><dt className="text-xs text-gray-500 dark:text-slate-400">Verified document</dt><dd className="text-emerald-600 dark:text-emerald-400 text-xs">Generated {new Date(caseDetail.verified_document.generated_at).toLocaleString()}</dd></div>
                      )}
                    </dl>
                    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                      <button type="button" onClick={() => { openDocumentForm(caseDetail.report.id); setCaseDetailId(null); }} className="btn-outline text-sm py-2 px-3 border-emerald-300 text-emerald-700 dark:border-emerald-500/60 dark:text-emerald-300 inline-flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4" /> Generate verified document
                      </button>
                      <button type="button" onClick={() => setCaseDetailId(null)} className="btn-ghost text-sm py-2 px-3">Close</button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Failed to load case.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document form modal (prescription + recommendations) */}
        {documentForm != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDocumentForm(null)} role="dialog" aria-modal="true">
            <div className="card border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="card-header flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Generate verified document</h2>
                <button type="button" onClick={() => setDocumentForm(null)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Close"><X className="w-5 h-5" /></button>
              </div>
              <div className="card-body space-y-4">
                <p className="text-sm text-gray-600 dark:text-slate-300">Report ID: <span className="font-mono font-medium">{documentForm.reportId}</span>. Add prescription and recommendations to generate an official verified document.</p>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Prescription / clinical notes</label>
                  <textarea value={documentForm.prescription_notes} onChange={(e) => setDocumentForm((f) => f ? { ...f, prescription_notes: e.target.value } : null)} rows={4} className="input-field w-full text-sm" placeholder="e.g. Medication, dosage, duration..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Recommendations</label>
                  <textarea value={documentForm.recommendations} onChange={(e) => setDocumentForm((f) => f ? { ...f, recommendations: e.target.value } : null)} rows={3} className="input-field w-full text-sm" placeholder="e.g. Follow-up, isolation, reporting..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={submitVerifiedDocument} disabled={generatingDoc} className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2">
                    {generatingDoc ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileCheck className="w-4 h-4" />}
                    Generate & view
                  </button>
                  <button type="button" onClick={() => setDocumentForm(null)} className="btn-ghost text-sm py-2 px-3">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verified document print view */}
        {(verifiedDocPrint != null || documentView != null) && (() => {
          const payload = verifiedDocPrint ?? documentView!;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { setVerifiedDocPrint(null); setDocumentView(null); }} role="dialog" aria-modal="true">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 print:shadow-none print:max-h-none" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6 print:mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Verified document</h2>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => window.print()} className="btn-outline text-sm py-2 px-3 inline-flex items-center gap-1"><Printer className="w-4 h-4" /> Print</button>
                    <button type="button" onClick={() => { setVerifiedDocPrint(null); setDocumentView(null); }} className="btn-ghost text-sm py-2 px-3"><X className="w-4 h-4" /> Close</button>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 space-y-4 text-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Case summary</p>
                  <p><strong>Report ID:</strong> {payload.report.id}</p>
                  <p><strong>Date reported:</strong> {new Date(payload.report.created_at).toLocaleString()}</p>
                  {payload.reporter && <p><strong>Reporter / location:</strong> {payload.reporter.name} — {[payload.reporter.county, payload.reporter.sub_county].filter(Boolean).join(", ") || "—"}</p>}
                  <p><strong>Animal type:</strong> {payload.report.animal_type ?? "—"}</p>
                  <p><strong>Symptoms:</strong> {payload.report.symptom_text ?? "—"}</p>
                  {payload.diagnosis && <p><strong>AI diagnosis:</strong> {payload.diagnosis.predicted_label} {payload.diagnosis.confidence != null ? `(${(Number(payload.diagnosis.confidence) * 100).toFixed(0)}%)` : ""}</p>}
                  <hr className="border-gray-200 dark:border-slate-700" />
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Prescription / clinical notes</p>
                  <p className="whitespace-pre-wrap text-gray-900 dark:text-white">{payload.document.prescription_notes || "—"}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Recommendations</p>
                  <p className="whitespace-pre-wrap text-gray-900 dark:text-white">{payload.document.recommendations || "—"}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 pt-4">Generated: {new Date(payload.document.generated_at).toLocaleString()} · SmartLivestock Admin</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </Layout>
  );
}
