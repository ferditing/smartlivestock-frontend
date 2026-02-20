import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { getAuditLogs } from "../../api/admin.api";
import { FileText, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

type Log = {
  id: number;
  action: string;
  target_id: number | null;
  details: string | null;
  created_at: string;
  actor_name: string | null;
  actor_email: string | null;
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    getAuditLogs({ page, limit })
      .then((r) => {
        setLogs(r.logs ?? []);
        setTotal(r.total ?? 0);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / limit);
  const formatAction = (a: string) => a.replace(/_/g, " ");

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Admin action history for compliance and traceability</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Admin Actions</h2>
              <p className="text-sm text-gray-500">All admin operations are logged for audit</p>
            </div>
          </div>
          <div className="card-body p-0 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-gray-500">No audit logs yet</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Time</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actor</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Action</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Target ID</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{log.actor_name || "—"}</p>
                          <p className="text-xs text-gray-500">{log.actor_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-info">{formatAction(log.action)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.target_id ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {log.details ? (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {typeof log.details === "string"
                              ? log.details.length > 80
                                ? log.details.slice(0, 80) + "..."
                                : log.details
                              : JSON.stringify(log.details).slice(0, 80)}
                          </code>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="card-footer flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-outline p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn-outline p-2"
                >
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
