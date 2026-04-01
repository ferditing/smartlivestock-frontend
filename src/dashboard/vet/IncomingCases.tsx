import { useEffect, useState, useRef } from "react";
import Layout from '../../components/Layout';
import { useNavigate } from "react-router-dom";
import { fetchPendingReports } from "../../api/vet.api";
import { useToast } from "../../context/ToastContext";
import {
  AlertCircle, Clock, User, ChevronRight,
  Loader2, Search, RefreshCw, X,
} from "lucide-react";

function Counter({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 700, 1);
      setVal(Math.round(p * to));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to]);
  return <>{val}</>;
}

export default function IncomingCases() {
  const userRole = localStorage.getItem('role') || 'vet';
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingReports();
      const sorted = data.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setCases(sorted);
    } catch {
      addToast('error', 'Error', 'Failed to load incoming cases');
      setCases([]);
    } finally { setLoading(false); }
  };

  const filteredCases = cases.filter(c => {
    const symptomText = c.canonical_symptoms?.join(' ') || '';
    const matchesSearch =
      c.animal_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symptomText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symptom_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getTimeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const high = filteredCases.filter(c => c.priority === 'high').length;
  const medium = filteredCases.filter(c => c.priority === 'medium').length;
  const low = filteredCases.filter(c => c.priority === 'low' || !c.priority).length;

  const priorityConfig: Record<string, { border: string; bg: string; badge: string; dot: string; icon: string }> = {
    high: { border: "border-l-red-500", bg: "bg-red-50/60", badge: "bg-red-100 text-red-700", dot: "bg-red-500", icon: "text-red-500" },
    medium: { border: "border-l-amber-500", bg: "bg-amber-50/60", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500", icon: "text-amber-500" },
    low: { border: "border-l-green-500", bg: "bg-green-50/40", badge: "bg-green-100 text-green-700", dot: "bg-green-500", icon: "text-green-500" },
  };

  const pc = (p: string) => priorityConfig[p] || priorityConfig.low;

  return (
    <Layout role={userRole}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <AlertCircle className="w-7 h-7 text-green-600" />
              Incoming Cases
            </h1>
            <p className="page-sub">Review and manage new animal health cases</p>
          </div>
          <button onClick={loadCases} className="btn btn-outline flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Priority Summary Chips */}
        {!loading && cases.length > 0 && (
          <div className="flex flex-wrap gap-3 animate-fadeIn">
            {[
              { label: "High Priority", count: high, color: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500", filter: "high" },
              { label: "Medium Priority", count: medium, color: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500", filter: "medium" },
              { label: "Low Priority", count: low, color: "border-green-200 bg-green-50 text-green-700", dot: "bg-green-500", filter: "low" },
              { label: "All Cases", count: cases.length, color: "border-gray-200 bg-white text-gray-700", dot: "bg-gray-400", filter: "all" },
            ].map(s => (
              <button
                key={s.filter}
                onClick={() => setFilterStatus(s.filter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 ${s.color} ${filterStatus === s.filter ? "ring-2 ring-offset-1 ring-green-400" : "hover:shadow-sm"}`}
              >
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                {s.label}
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white/60 text-xs font-bold tabular-nums">
                  <Counter to={s.count} />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="card">
          <div className="card-body">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                className="input-field pl-10 pr-10"
                placeholder="Search by animal, symptoms, or farmer name…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cases List */}
        {loading ? (
          <div className="card p-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-green-500" />
              <p className="text-gray-500 text-sm">Loading cases…</p>
            </div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="card p-12">
            <div className="empty-state">
              <div className="empty-state-icon"><AlertCircle className="w-7 h-7" /></div>
              <h3 className="empty-state-title">
                {searchTerm || filterStatus !== "all" ? "No matching cases" : "All clear! No pending cases"}
              </h3>
              <p className="empty-state-sub">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "New cases will appear here when reported by farmers"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredCases.map((c, idx) => {
              const cfg = pc(c.priority);
              return (
                <div
                  key={c.id}
                  className={`card glow-card border-l-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${cfg.border} ${cfg.bg} animate-fadeInUp`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  onClick={() => navigate(`/vet/cases/${c.id}`, { state: c })}
                >
                  <div className="card-body">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2.5 rounded-xl bg-white shadow-sm flex-shrink-0`}>
                            <AlertCircle className={`w-5 h-5 ${cfg.icon}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-gray-900 sora">
                                {c.animal_type ? c.animal_type.charAt(0).toUpperCase() + c.animal_type.slice(1) : "Unknown Animal"}
                              </h3>
                              {c.animal_type && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Species</span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cfg.badge}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot}`} />
                                {c.priority || "normal"} priority
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {c.canonical_symptoms?.length > 0
                                ? c.canonical_symptoms.map((s: string) => s.replace(/_/g, ' ')).join(', ')
                                : c.symptom_text}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-400">Farmer</p>
                              <p className="text-sm font-semibold text-gray-900">{c.farmer_name || 'Unknown'}</p>
                            </div>
                          </div>
                          {c.canonical_symptoms?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Detected Symptoms</p>
                              <div className="flex flex-wrap gap-1">
                                {c.canonical_symptoms.slice(0, 4).map((s: string) => (
                                  <span key={s} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                    {s.replace(/_/g, ' ')}
                                  </span>
                                ))}
                                {c.canonical_symptoms.length > 4 && (
                                  <span className="text-xs text-gray-400">+{c.canonical_symptoms.length - 4}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeAgo(c.created_at)}</span>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">{c.status || 'new'}</span>
                        <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                          Review Case <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer stats */}
        {filteredCases.length > 0 && (
          <div className="card animate-fadeIn">
            <div className="card-body">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { count: high, label: "High Priority", color: "text-red-600", bg: "bg-red-50" },
                  { count: medium, label: "Medium Priority", color: "text-amber-600", bg: "bg-amber-50" },
                  { count: low, label: "Low Priority", color: "text-green-600", bg: "bg-green-50" },
                ].map(s => (
                  <div key={s.label} className={`text-center p-4 rounded-xl ${s.bg}`}>
                    <div className={`text-3xl font-bold tabular-nums sora ${s.color}`}><Counter to={s.count} /></div>
                    <p className="text-sm text-gray-600 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}