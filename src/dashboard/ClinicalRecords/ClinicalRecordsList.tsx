// ClinicalRecordsList.tsx – Premium Redesign (SmartLivestock Design System)
// All original API calls, state, filtering logic unchanged.

import React, { useEffect, useState, useRef } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import type { ClinicalRecordResponse } from "../../types/clinical.types";
import { useToast } from "../../context/ToastContext";
import {
  FileText, Search, Calendar, Clock, User, Activity,
  CheckCircle, Loader2, Plus, ChevronRight, AlertCircle, X,
} from "lucide-react";

/* ── Status config ───────────────────────────────────────────── */
const STATUS_CFG: Record<string, { label:string; badge:string; border:string; dot:string; icon:React.ReactNode }> = {
  pending:         { label:"Pending",          badge:"bg-amber-100 text-amber-800",  border:"border-l-amber-400",  dot:"bg-amber-400",  icon:<Clock className="w-4 h-4 text-amber-500" /> },
  under_treatment: { label:"Under Treatment",  badge:"bg-blue-100 text-blue-800",    border:"border-l-blue-500",   dot:"bg-blue-500",   icon:<Activity className="w-4 h-4 text-blue-500" /> },
  recovered:       { label:"Recovered",        badge:"bg-green-100 text-green-800",  border:"border-l-green-500",  dot:"bg-green-500",  icon:<CheckCircle className="w-4 h-4 text-green-500" /> },
};
const getCfg = (s: string) => STATUS_CFG[s] || { label:s, badge:"bg-gray-100 text-gray-700", border:"border-l-gray-300", dot:"bg-gray-400", icon:<AlertCircle className="w-4 h-4 text-gray-400" /> };

/* ── Animated counter ─────────────────────────────────────────── */
function Counter({ to, color }: { to: number; color: string }) {
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (done.current || to === 0) return;
    done.current = true;
    const frames = 40; let f = 0;
    const id = setInterval(() => {
      f++; setVal(Math.min(Math.round((f / frames) * to), to));
      if (f >= frames) clearInterval(id);
    }, 800 / frames);
  }, [to]);
  return <span className={`text-3xl font-black sora tabular-nums ${color}`}>{val}</span>;
}

/* ── Confidence bar ───────────────────────────────────────────── */
function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? "from-green-500 to-emerald-600"
              : value >= 50 ? "from-amber-500 to-orange-500"
              : "from-red-500 to-rose-600";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
          style={{ width:`${value}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-600 w-9 text-right">{value}%</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ClinicalRecordsList() {
  const userRole = localStorage.getItem("role") || "farmer";
  const token    = localStorage.getItem("token");
  const { addToast } = useToast();

  const [records,      setRecords]      = useState<ClinicalRecordResponse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/clinical-records");
        const data = res.data?.data ?? res.data;
        setRecords(Array.isArray(data) ? data : []);
        if (!Array.isArray(data)) addToast("warning", "Data", "Unexpected response format");
      } catch (err: any) {
        const msg = err instanceof Error ? err.message : "Failed to fetch records";
        setError(msg); addToast("error", "Error", msg);
      } finally { setLoading(false); }
    })();
  }, [token, addToast]);

  /* ── Derived ── */
  const filtered = records.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q
      || r.animal.name.toLowerCase().includes(q)
      || r.ml_diagnosis.toLowerCase().includes(q)
      || (r.animal.breed || "").toLowerCase().includes(q);
    const matchFilter = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const counts = {
    total:           records.length,
    under_treatment: records.filter(r => r.status === "under_treatment").length,
    recovered:       records.filter(r => r.status === "recovered").length,
    pending:         records.filter(r => r.status === "pending").length,
  };

  /* ── Loading / Error ── */
  if (loading) return (
    <Layout role={userRole}>
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Loading clinical records…</p>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout role={userRole}>
      <div className="card overflow-hidden">
        <div className="card-body py-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Failed to load records</h3>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
          <button onClick={() => window.location.reload()}
            className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout role={userRole}>
      <div className="space-y-6 animate-fadeInUp">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Clinical Records</h1>
            <p className="page-sub">Manage and review all animal health records</p>
          </div>
          <Link to="/clinical-records/new" className="btn btn-primary btn-md flex items-center gap-2 self-start">
            <Plus className="w-4 h-4" /> New Record
          </Link>
        </div>

        {/* ── Stat cards (clickable filter) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            { key:"total",           label:"Total",           color:"text-blue-600",   iconBg:"bg-blue-100",   icon:<FileText className="w-5 h-5 text-blue-600"/>,     border:"border-l-blue-500"  },
            { key:"under_treatment", label:"Under Treatment", color:"text-blue-600",   iconBg:"bg-blue-100",   icon:<Activity className="w-5 h-5 text-blue-600"/>,    border:"border-l-blue-500"  },
            { key:"recovered",       label:"Recovered",       color:"text-green-600",  iconBg:"bg-green-100",  icon:<CheckCircle className="w-5 h-5 text-green-600"/>, border:"border-l-green-500" },
            { key:"pending",         label:"Pending",         color:"text-amber-600",  iconBg:"bg-amber-100",  icon:<Clock className="w-5 h-5 text-amber-600"/>,      border:"border-l-amber-500" },
          ] as const).map(s => (
            <button key={s.key} type="button"
              onClick={() => setFilterStatus(s.key === "total" ? "all" : s.key)}
              className={`card overflow-hidden text-left transition-all duration-200 border-l-4 hover:shadow-md ${s.border} ${
                (filterStatus === s.key || (s.key === "total" && filterStatus === "all"))
                  ? "ring-2 ring-offset-1 ring-green-300"
                  : ""
              }`}>
              <div className="card-body py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                  <Counter to={counts[s.key as keyof typeof counts]} color={s.color} />
                </div>
                <div className={`w-11 h-11 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {s.icon}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Search + filter chips ── */}
        <div className="card overflow-hidden">
          <div className="card-body space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" className="input-field pl-10"
                placeholder="Search by animal name, breed, or diagnosis…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="filter-bar">
              {(["all","pending","under_treatment","recovered"] as const).map(s => (
                <button key={s} type="button" onClick={() => setFilterStatus(s)}
                  className={`filter-chip ${s === "all"
                    ? filterStatus === "all" ? "active" : ""
                    : filterStatus === s
                    ? s === "recovered" ? "active" : s === "pending" ? "active-amber" : "active-blue"
                    : ""
                  }`}>
                  {s === "all" ? "All" : s === "under_treatment" ? "Under Treatment" : s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== "all" && (
                    <span className="ml-1 bg-white/60 text-current text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {counts[s as keyof typeof counts]}
                    </span>
                  )}
                </button>
              ))}
              {(searchTerm || filterStatus !== "all") && (
                <button onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
                  className="ml-auto text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 flex-shrink-0">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Records list ── */}
        {filtered.length === 0 ? (
          <div className="card overflow-hidden">
            <div className="card-body py-14 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-700">
                  {searchTerm || filterStatus !== "all" ? "No matching records" : "No clinical records yet"}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm || filterStatus !== "all" ? "Adjust your search or filter" : "Create your first clinical record to get started"}
                </p>
              </div>
              {searchTerm || filterStatus !== "all" ? (
                <button onClick={() => { setSearchTerm(""); setFilterStatus("all"); }}
                  className="btn btn-outline btn-sm">Clear filters</button>
              ) : (
                <Link to="/clinical-records/new" className="btn btn-primary btn-sm flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Create First Record
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(record => {
              const cfg = getCfg(record.status);
              return (
                <Link key={record.id} to={`/clinical-records/${record.id}`}
                  className={`card overflow-hidden border-l-4 ${cfg.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group block`}>
                  <div className="card-body">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: animal + diagnosis */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                            {cfg.icon}
                          </div>
                          <div>
                            <h2 className="font-bold text-gray-900 sora text-sm group-hover:text-green-700 transition">
                              {record.animal.name}
                            </h2>
                            <p className="text-xs text-gray-500">
                              {record.animal.type}
                              {record.animal.breed ? ` • ${record.animal.breed}` : ""}
                            </p>
                          </div>
                          <span className={`ml-auto lg:hidden text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ML Diagnosis</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{record.ml_diagnosis}</p>
                            <div className="mt-2">
                              <ConfidenceBar value={record.ml_confidence} />
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Veterinarian</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{record.vet.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(record.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: status + CTA */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 lg:gap-2 flex-shrink-0">
                        <span className={`hidden lg:inline-flex text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-600 group-hover:text-green-700 ml-auto lg:ml-0">
                          View details <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Pagination footer ── */}
        {filtered.length > 0 && (
          <div className="card overflow-hidden">
            <div className="card-body py-3.5 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing <strong>{filtered.length}</strong> of <strong>{records.length}</strong> records
              </p>
              <div className="flex items-center gap-1">
                {["Prev","1","2","Next"].map(l => (
                  <button key={l}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      l === "1" ? "bg-green-600 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}