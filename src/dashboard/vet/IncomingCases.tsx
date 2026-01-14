import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPendingReports } from "../../api/vet.api";

export default function IncomingCases() {
  const [cases, setCases] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingReports().then(setCases);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Incoming Cases</h2>

      {cases.map((c) => (
        <div
          key={c.id}
          className="bg-white p-4 rounded shadow mb-3 cursor-pointer hover:bg-gray-50"
          onClick={() => navigate(`/vet/cases/${c.id}`, { state: c })}
        >
          <p><b>Animal:</b> {c.animal_type}</p>
          <p><b>Status:</b> {c.status}</p>
        </div>
      ))}
    </div>
  );
}
