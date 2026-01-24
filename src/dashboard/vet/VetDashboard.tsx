import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import { fetchPendingReports } from "../../api/vet.api";
import api from "../../api/axios";

export default function VetDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingReports().then(setReports).catch(() => setReports([]));
    api.get("/appointments/assigned").then(res => setAppointments(res.data));
    api.get("/appointments/diagnoses").then(res => setDiagnoses(res.data));
  }, []);

  return (
    <Layout role="vet">
      <div>
      <h1 className="text-2xl font-bold mb-4">Vet Dashboard</h1>

      <section className="mb-6">
        <h3 className="font-semibold">Appointments</h3>
        {appointments.map( a=> (
          <div key={a.id} className="bg-white p-2 mb-2 rounded">
            Scheduled: {a.scheduled_at} <br />
            Status: {a.status}
          </div>
        ))}
      </section>

      <section>
        <h3 className="font-semibold"> Past Diagnoses</h3>
        {diagnoses.map( d=> (
          <div key={d.id} className="bg-white p-2 mb-2 rounded">
            Diagnosis: {d.result}
          </div>
        ))}
      </section>

      {reports.length === 0 ? (
        <div className="text-gray-500">No incoming reports yet.</div>
      ) : (
        reports.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded shadow mb-3">
            <p><b>Animal:</b> {r.animal_type}</p>
            <p><b>Symptoms:</b> {r.symptom_text}</p>
          </div>
        ))
      )}
      </div>

    </Layout>
  );
}
