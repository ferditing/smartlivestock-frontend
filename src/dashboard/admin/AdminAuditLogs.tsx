import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { getAuditLogs } from "../../api/admin.api";
import { FileText, ArrowLeft, ChevronLeft, ChevronRight, Shield, Clock, Activity } from "lucide-react";

type Log = { id: number; action: string; target_id: number | null; details: string | null; created_at: string; actor_name: string | null; actor_email: string | null; };

const ACTION_BADGE: Record<string, string> = {
  approve: "badge-success", verify: "badge-success", confirm: "badge-success",
  reject: "badge-error", delete: "badge-error",
  suspend: "badge-warning", create: "badge-info", update: "badge-info",
};

function getActionBadgeClass(action: string): string {
  const lower = action.toLowerCase();
  for (const [key, cls] of Object.entries(ACTION_BADGE)) {
    if (lower.includes(key)) return cls;
  }
  return "badge-gray";
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}

function formatAction(a: string) { return a.replace(/_/g, " "); }

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    getAuditLogs({ page, limit }).then((r) => { setLogs(r.logs ?? []); setTotal(r.total ?? 0); }).catch(() => setLogs([])).finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout role="admin">
      <div className="space-y-6">

        {/* ── Hero Banner ── */}
        <div className="rounded-2xl overflow-hidden animate-fadeIn" style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)" }}>
          <div className="relative px-6 py-8 md:px-8">
            <div className="absolute top-0 right-0 text-[120px] leading-none opacity-[0.07] select-none pointer-events-none pr-4 pt-2">📋</div>
            <div className="relative z-10">
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-green-200 hover:text-white transition-colors mb-4 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white sora mb-1">Audit Logs</h1>
              <p className="text-green-200 text-sm mb-4">Admin action history for compliance and traceability</p>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 w-fit backdrop-blur-sm">
                <Activity className="w-4 h-4 text-white/80" />
                <span className="text-white font-bold sora tabular-nums text-xl leading-none">{total.toLocaleString()}</span>
                <span className="text-white/70 text-xs font-medium">Total log entries</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Audit Table Card ── */}
        <div className="card animate-fadeInUp">
          <div className="card-header flex items-center gap-3">
            <div className="card-icon-wrap card-icon-amber"><Shield className="w-4 h-4 text-white" /></div>
            <div>
              <h2 className="font-bold text-gray-900 sora text-sm">Recent Admin Actions</h2>
              <p className="text-xs text-gray-500">All admin operations are logged for compliance and audit</p>
            </div>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FileText className="w-8 h-8" /></div>
                <p className="empty-state-title">No audit logs yet</p>
                <p className="empty-state-sub">Admin actions will appear here once recorded.</p>
              </div>
            ) : (
              <div className="overflow-x-auto scroll-area">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Actor</th>
                      <th>Action</th>
                      <th>Target ID</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={log.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 20}ms` }}>
                        <td className="whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                            <span className="text-xs">{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #16a34a, #059669)" }}>
                              {log.actor_name ? getInitials(log.actor_name) : "?"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{log.actor_name || "—"}</p>
                              <p className="text-xs text-gray-400">{log.actor_email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getActionBadgeClass(log.action)} capitalize`}>
                            {formatAction(log.action)}
                          </span>
                        </td>
                        <td>
                          {log.target_id != null ? (
                            <span className="font-mono text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg text-gray-700">{log.target_id}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="max-w-xs">
                          {log.details ? (
                            <code className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-600 block truncate">
                              {typeof log.details === "string" ? (log.details.length > 80 ? log.details.slice(0, 80) + "…" : log.details) : JSON.stringify(log.details).slice(0, 80)}
                            </code>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="card-footer flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</span> of <span className="font-semibold text-gray-900">{total.toLocaleString()}</span>
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn btn-outline btn-icon">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="flex items-center px-3 text-sm font-semibold text-gray-600">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn btn-outline btn-icon">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}