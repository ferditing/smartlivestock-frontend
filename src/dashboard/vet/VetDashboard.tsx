import Layout from "../../components/Layout";
import { useEffect, useState, useRef } from "react";
import { fetchPendingReports } from "../../api/vet.api";
import { fetchVetVerificationRequests, vetVerifyProduct, type VetVerificationProduct } from "../../api/agro.api";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import {
  Calendar, Activity, Users, Clock, AlertCircle, FileText,
  Stethoscope, Loader2, MapPin, CheckCircle, ShieldCheck, XCircle,
  ChevronRight, Zap,
} from "lucide-react";

function Counter({ to, duration = 800 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(p * to));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);
  return <>{val.toLocaleString()}</>;
}

export default function VetDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VetVerificationProduct[]>([]);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pendingCases: 0, todayAppointments: 0, totalPatients: 0, completedCases: 0 });
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [reportsData, appointmentsData, diagnosesData, verificationData] = await Promise.all([
          fetchPendingReports().catch(() => []),
          api.get("/appointments/assigned").then(r => r.data).catch(() => []),
          api.get("/appointments/diagnoses").then(r => r.data).catch(() => []),
          fetchVetVerificationRequests().catch(() => []),
        ]);
        setReports(reportsData); setAppointments(appointmentsData);
        setDiagnoses(diagnosesData); setVerificationRequests(verificationData);
        const today = new Date().toDateString();
        setStats({
          pendingCases: reportsData.length,
          todayAppointments: appointmentsData.filter((a: any) => a.scheduled_at && new Date(a.scheduled_at).toDateString() === today).length,
          totalPatients: new Set(appointmentsData.map((a: any) => a.farmer_id)).size,
          completedCases: diagnosesData.length,
        });
      } catch { addToast("error", "Error", "Failed to load dashboard data"); }
      finally { setLoading(false); }
    };
    load();
  }, [addToast]);

  if (loading) return (
    <Layout role="vet">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          <p className="text-sm text-gray-500">Loading your dashboard…</p>
        </div>
      </div>
    </Layout>
  );

  const upcomingAppointments = appointments
    .filter(a => a.status === "accepted")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 3);

  const getTimeAgo = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const priorityBorder: Record<string, string> = { high: "border-l-red-400", medium: "border-l-amber-400", low: "border-l-green-400" };
  const priorityBg: Record<string, string> = { high: "bg-red-50", medium: "bg-amber-50", low: "bg-green-50" };
  const priorityBadge: Record<string, string> = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-green-100 text-green-700" };

  return (
    <Layout role="vet">
      <div className="space-y-6">

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 p-6 md:p-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
            <span className="absolute top-4 right-12 text-8xl">🩺</span>
            <span className="absolute bottom-0 right-48 text-5xl">🐄</span>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="hero-content-up">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold backdrop-blur-sm mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" /> Live Dashboard
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white sora">Veterinarian Dashboard</h1>
              <p className="text-green-100 mt-1 text-sm">
                {stats.pendingCases > 0
                  ? `${stats.pendingCases} cases awaiting your expert review`
                  : "All caught up — no pending cases"}
              </p>
            </div>
            <div className="hero-content-up-d1 flex gap-3 flex-shrink-0">
              <button className="btn btn-outline btn-sm border-white/30 text-white hover:bg-white/10 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Schedule
              </button>
              <button className="btn btn-sm flex items-center gap-2" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}>
                <Stethoscope className="w-4 h-4" /> New Case
              </button>
            </div>
          </div>
          <div className="hero-content-up-d2 mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Pending Cases", value: stats.pendingCases },
              { label: "Today's Appts", value: stats.todayAppointments },
              { label: "Total Patients", value: stats.totalPatients },
              { label: "Completed", value: stats.completedCases },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <p className="text-white/70 text-xs mb-0.5">{s.label}</p>
                <p className="text-white text-2xl font-bold tabular-nums sora"><Counter to={s.value} /></p>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Product Verification */}
            <div className="card animate-fadeInUp">
              <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 sora">Product Verification</h2>
                    <p className="text-xs text-gray-500">Agrovet products pending vet review</p>
                  </div>
                </div>
                {verificationRequests.length > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    {verificationRequests.length} pending
                  </span>
                )}
              </div>
              <div className="card-body">
                {verificationRequests.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="empty-state-icon mx-auto"><CheckCircle className="w-7 h-7" /></div>
                    <h3 className="empty-state-title mt-3">All clear!</h3>
                    <p className="empty-state-sub">No products awaiting verification</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verificationRequests.slice(0, 6).map((p) => (
                      <div key={p.id} className="group p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {p.shop_name || "Agrovet"} · Stock: {p.quantity ?? 0} · <span className="font-semibold text-gray-700">KES {Number(p.price).toLocaleString()}</span>
                            </p>
                            {p.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              disabled={verifyingId === p.id}
                              onClick={async () => {
                                setVerifyingId(p.id);
                                try {
                                  await vetVerifyProduct(p.id, true, "Approved");
                                  addToast("success", "Verified", "Product approved.");
                                  setVerificationRequests(await fetchVetVerificationRequests().catch(() => []));
                                } catch (e: any) { addToast("error", "Error", e?.response?.data?.error ?? "Failed"); }
                                finally { setVerifyingId(null); }
                              }}
                              className="btn btn-primary btn-sm"
                            >
                              {verifyingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              Approve
                            </button>
                            <button
                              disabled={verifyingId === p.id}
                              onClick={async () => {
                                setVerifyingId(p.id);
                                try {
                                  await vetVerifyProduct(p.id, false, "Rejected");
                                  addToast("success", "Updated", "Product rejected.");
                                  setVerificationRequests(await fetchVetVerificationRequests().catch(() => []));
                                } catch (e: any) { addToast("error", "Error", e?.response?.data?.error ?? "Failed"); }
                                finally { setVerifyingId(null); }
                              }}
                              className="btn btn-outline btn-sm border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {verificationRequests.length > 6 && (
                      <p className="text-xs text-center text-gray-400 pt-1">+{verificationRequests.length - 6} more products</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Cases */}
            <div className="card animate-fadeInUp-delay-1">
              <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 sora">Pending Cases</h2>
                    <p className="text-xs text-gray-500">Requiring your attention</p>
                  </div>
                </div>
                {reports.length > 0 && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{reports.length} cases</span>}
              </div>
              <div className="card-body">
                {reports.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="empty-state-icon mx-auto"><CheckCircle className="w-7 h-7" /></div>
                    <h3 className="empty-state-title mt-3">All caught up!</h3>
                    <p className="empty-state-sub">No pending cases at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((r) => (
                      <div key={r.id} className={`group p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${priorityBorder[r.priority] || "border-l-gray-300"} ${priorityBg[r.priority] || "bg-gray-50"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900">{r.animal_type ? r.animal_type.charAt(0).toUpperCase() + r.animal_type.slice(1) : "Unknown"}</h4>
                              {r.priority && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${priorityBadge[r.priority] || "bg-gray-100 text-gray-600"}`}>{r.priority}</span>}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{r.symptom_text}</p>
                            <div className="flex gap-3 mt-2">
                              <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{getTimeAgo(r.created_at)}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{r.status || "pending"}</span>
                            </div>
                          </div>
                          <button className="flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            Review <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {reports.length > 5 && (
                      <button className="w-full text-center text-sm text-green-600 hover:text-green-700 font-semibold py-2 rounded-xl hover:bg-green-50 transition-colors">
                        View all {reports.length} cases →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Appointments */}
            <div className="card animate-fadeInUp-delay-2">
              <div className="card-header flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 sora">Upcoming Appointments</h2>
                  <p className="text-xs text-gray-500">Today's schedule</p>
                </div>
              </div>
              <div className="card-body">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="empty-state-icon mx-auto"><Clock className="w-7 h-7" /></div>
                    <h3 className="empty-state-title mt-3">Schedule clear</h3>
                    <p className="empty-state-sub">No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-blue-50/60 border border-blue-100 hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                            {(a.farmer_name || "F").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{a.farmer_name || `Farmer #${a.farmer_id}`}</h4>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {a.scheduled_at ? new Date(a.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Time not set"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">{a.reason || "Checkup"}</span>
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold">Details →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card animate-fadeInUp">
              <div className="card-header flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-900 sora">Quick Actions</h2>
              </div>
              <div className="card-body space-y-2">
                {[
                  { icon: FileText, label: "New Clinical Record", bg: "bg-blue-100", text: "text-blue-600" },
                  { icon: Calendar, label: "Schedule Appointment", bg: "bg-green-100", text: "text-green-600" },
                  { icon: Activity, label: "Review AI Predictions", bg: "bg-purple-100", text: "text-purple-600" },
                  { icon: MapPin, label: "View Nearby Cases", bg: "bg-amber-100", text: "text-amber-600" },
                ].map(({ icon: Icon, label, bg, text }) => (
                  <button key={label} className="w-full group flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200">
                    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${text}`} />
                    </div>
                    <span className="font-medium text-gray-800 text-sm flex-1 text-left">{label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Diagnoses */}
            <div className="card animate-fadeInUp-delay-1">
              <div className="card-header flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 sora">Recent Diagnoses</h2>
                  <p className="text-xs text-gray-500">Latest completed cases</p>
                </div>
              </div>
              <div className="card-body">
                {diagnoses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No recent diagnoses</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diagnoses.slice(0, 3).map((d) => (
                      <div key={d.id} className="p-3.5 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{d.animal_type || "Animal"}</span>
                          <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{d.result || "No details available"}</p>
                      </div>
                    ))}
                    {diagnoses.length > 3 && (
                      <button className="w-full text-center text-sm text-green-600 hover:text-green-700 font-semibold py-2 rounded-xl hover:bg-green-50 transition-colors">
                        View all diagnoses →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Emergency */}
            <div className="rounded-2xl overflow-hidden border border-red-200">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sora">Emergency Protocol</h3>
                  <p className="text-red-100 text-xs">For critical livestock cases</p>
                </div>
              </div>
              <div className="bg-red-50 px-5 py-4">
                <p className="text-sm text-red-800 font-medium">Emergency Hotline</p>
                <p className="text-lg font-bold text-red-900 sora mt-0.5">0700 123 456</p>
                <p className="text-xs text-red-600 mt-1">Available 24/7 for critical cases</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}