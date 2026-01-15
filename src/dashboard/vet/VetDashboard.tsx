import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import { fetchPendingReports } from "../../api/vet.api";

export default function VetDashboard() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingReports().then(setReports).catch(() => setReports([]));
  }, []);

  return (
    <Layout role="vet">
      <h1 className="text-2xl font-bold mb-4">Vet Dashboard</h1>
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
    </Layout>
  );
}
