import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/Layout";

type Appointment = {
  id: number;
  farmer_id?: number;
  provider_id?: number;
  report_id?: number;
  scheduled_at?: string | null;
  status: string;
};

export default function ViewAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`/appointments/${id}`, { status });
      await load();
    } catch (err) {
      // ignore for now
    }
  };

  const statusClass = (s: string) => {
    if (s === "accepted") return "bg-green-100 text-green-800";
    if (s === "declined") return "bg-red-100 text-red-800";
    if (s === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Layout role="vet">
      <div className="max-w-4xl mx-auto mt-6">
        <h2 className="text-2xl font-semibold mb-4">Appointments</h2>

        {loading && <p className="text-sm text-gray-600">Loading…</p>}
        {!loading && appointments.length === 0 && <p className="text-sm text-gray-600">No appointments</p>}

        <div className="space-y-4">
          {appointments.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded shadow flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-600">Appointment #{a.id}</div>
                <div className="mt-1 font-medium">Status: <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${statusClass(a.status)}`}>{a.status}</span></div>
                <div className="mt-2 text-sm text-gray-700">Scheduled: {a.scheduled_at || "—"}</div>
                {a.report_id && <div className="mt-1 text-sm text-gray-700">Report: {a.report_id}</div>}
              </div>

              <div className="flex-shrink-0">
                {a.status === "pending" ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => changeStatus(a.id, "accepted")}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => changeStatus(a.id, "declined")}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No actions</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
