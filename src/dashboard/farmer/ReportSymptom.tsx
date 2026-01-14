import { useState } from "react";
import { reportSymptom } from "../../api/farmer.api";

export default function ReportSymptom() {
  const [symptom, setSymptom] = useState("");

  return (
    <div>
      <textarea
        className="border p-2 w-full"
        placeholder="Describe symptoms"
        onChange={(e) => setSymptom(e.target.value)}
      />
      <button
        className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
        onClick={() => reportSymptom(symptom)}
      >
        Submit
      </button>
    </div>
  );
}
