import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/Layout";
import { useSearchParams } from "react-router-dom";

type Provider = { id: number; name: string };
type Report = { id: number; title?: string };

export default function BookAppointment() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [providerId, setProviderId] = useState<number | "">("");
  const [reportId, setReportId] = useState<number | "">("");
  const [scheduledAt, setScheduledAt] = useState<string>(new Date().toISOString().slice(0, 16));
  const [reason, setReason] = useState<"checkup" | "prediction">("checkup");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // fetch farmer's reports
    axios
      .get("/reports/my")
      .then((r) => setReports(r.data))
      .catch(() => {});

    // try to get nearby providers for the select (backend requires lat/lng)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          axios
            .get(`/providers/nearby?lat=${lat}&lng=${lng}`)
            .then((r) => setProviders(r.data))
            .catch(() => {});
        },
        () => {
          // ignore location errors; providers list stays empty
        }
      );
    }

    const providerParam = searchParams.get("provider");
    if (providerParam) {
      const n = Number(providerParam);
      if (!Number.isNaN(n)) setProviderId(n);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const payload: any = {
        provider_id: providerId || null,
        scheduled_at: scheduledAt,
      };
      if (reportId) payload.report_id = reportId;
      payload.reason = reason;

      await axios.post("/appointments", payload);
      setMessage("Appointment requested");
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="farmer">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Book Appointment</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
              >
                <option value="checkup">General checkup</option>
                <option value="prediction">Follow-up (ML prediction)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Provider</label>
              <select
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                value={providerId}
                onChange={(e) => setProviderId(Number(e.target.value) || "")}
              >
                <option value="">Any</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Related report (optional)</label>
              <select
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                value={reportId}
                onChange={(e) => setReportId(Number(e.target.value) || "")}
              >
                <option value="">None</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title || `Report #${r.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">When</label>
              <input
                className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:ring-green-500 focus:border-green-500"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
              >
                {loading ? "Booking…" : "Book Appointment"}
              </button>
            </div>
          </form>

          {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        </div>
      </div>
    </Layout>
  );
}
