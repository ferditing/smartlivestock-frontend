import { useLocation } from "react-router-dom";

export default function CaseDetails() {
  const { state } = useLocation();

  if (!state) return <p>No case selected</p>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Case Details</h2>

      <p><b>Animal:</b> {state.animal_type}</p>
      <p><b>Age:</b> {state.age}</p>
      <p><b>Weight:</b> {state.weight} kg</p>
      <p><b>Symptoms:</b> {state.symptom_text}</p>
      <p><b>Status:</b> {state.status}</p>
    </div>
  );
}
