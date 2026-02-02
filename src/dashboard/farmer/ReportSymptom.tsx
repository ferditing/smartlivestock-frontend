import { useEffect, useState } from "react";
import { reportSymptom } from "../../api/farmer.api";
import { mlHealth, predict, predictFromText } from "../../api/ml.api";

const DEFAULT_ANIMALS = ["Cow", "Goat", "Sheep", "Pig", "Chicken", "Calf"];

export default function ReportSymptom() {
  const [animals, setAnimals] = useState<string[]>(DEFAULT_ANIMALS);
  const [animal, setAnimal] = useState<string>(DEFAULT_ANIMALS[0]);
  const [age, setAge] = useState<string>("");
  const [temp, setTemp] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [availableSymptoms, setAvailableSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [freeText, setFreeText] = useState<string>("");
  const [textLoading, setTextLoading] = useState(false);

  useEffect(() => {
    // try to fetch model features to build symptom list and animal list
    mlHealth()
      .then((h) => {
        const feats: string[] = h.features || [];

        const animalKeys = feats
          .filter((f) => f.startsWith("animal_"))
          .map((f) => f.replace(/^animal_/, "").replace(/_/g, " "))
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .filter((s) => s.toLowerCase() !== "buffalo");

        if (animalKeys.length) {
          setAnimals(animalKeys);
          setAnimal(animalKeys[0]);
        }

        const symptomKeys = feats
          .filter((f) => !f.startsWith("animal_") && f !== "age" && f !== "body_temperature")
          .map((f) => f.replace(/_/g, " "))
          .filter(Boolean);
        if (symptomKeys.length) setAvailableSymptoms(symptomKeys);
        else setAvailableSymptoms(["fever", "cough", "loss of appetite", "diarrhea", "lethargy"]);
      })
      .catch(() => setAvailableSymptoms(["fever", "cough", "loss of appetite", "diarrhea", "lethargy"]));
  }, []);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
        animal_type: animal,
        age: age ? Number(age) : 0,
        body_temperature: temp ? Number(temp) : 0,
        symptoms,
      };

      // If the user selected symptom buttons, use the text/NLP endpoint
      if (symptoms && symptoms.length > 0) {
        const textPayload = {
          animal: animal.toLowerCase(),
          symptom_text: symptoms.join(', '),
          age: age ? Number(age) : 0,
          body_temperature: temp ? Number(temp) : 0,
        };
        const ml = await predictFromText(textPayload);
        alert(`Prediction: ${ml.predicted_disease || ml.predicted_label} (confidence ${Math.round((ml.confidence ?? ml.confidence) * 100)}%)\nAdvice: Visit an agrovet/veterinary clinic immediately.`);
      } else {
        // call ML service for immediate prediction with structured features
        const ml = await predict(payload);
        alert(`Prediction: ${ml.predicted_label} (confidence ${Math.round(ml.confidence * 100)}%)\nAdvice: Visit an agrovet/veterinary clinic immediately.`);
      }

      // persist report to backend (store symptom_text)
      const symptomText = symptoms.length ? symptoms.join(", ") : "";
      await reportSymptom(symptomText, { animal_id: undefined });
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to get prediction or save report");
    } finally {
      setLoading(false);
    }
  };

  const submitText = async () => {
    if (!freeText.trim()) return alert('Please type symptoms to predict');
    setTextLoading(true);
    try {
      const payload = {
        animal: animal.toLowerCase(),
        symptom_text: freeText,
        age: age ? Number(age) : 0,
        body_temperature: temp ? Number(temp) : 0,
      };

      const ml = await predictFromText(payload);

      alert(
        `Prediction: ${ml.predicted_disease || ml.predicted_label} (confidence ${Math.round(
          (ml.confidence ?? ml.confidence) * 100,
        )}%)\nAdvice: Visit an agrovet/veterinary clinic immediately.`,
      );
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to get prediction from text');
    } finally {
      setTextLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-2">Report Symptoms</h2>

      <div className="mb-3">
        <label className="block mb-1">Or type symptoms (free text)</label>
        <textarea
          className="border p-2 w-full mb-2"
          rows={3}
          placeholder="e.g. high fever, coughing and loss of appetite"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={submitText}
          disabled={textLoading}
        >
          {textLoading ? 'Predicting…' : 'Predict from Text'}
        </button>
      </div>

      <label className="block mb-1">Animal</label>
      <select className="border p-2 w-full mb-2" value={animal} onChange={(e) => setAnimal(e.target.value)}>
        {animals.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <div className="flex gap-2 mb-2">
        <input className="border p-2 w-1/2" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
        <input className="border p-2 w-1/2" placeholder="Body temp (°C)" value={temp} onChange={(e) => setTemp(e.target.value)} />
      </div>

      <div className="mb-2">
        <label className="block font-semibold mb-1">Tap symptoms</label>
        <div className="flex flex-col max-h-40 overflow-auto">
          {availableSymptoms.map((s) => (
            <button
              key={s}
              onClick={() => toggleSymptom(s)}
              className={`text-left p-2 mb-1 rounded ${symptoms.includes(s) ? 'bg-green-200' : 'bg-gray-100'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
        onClick={submit}
        disabled={loading}
      >
        {loading ? 'Submitting…' : 'Submit & Predict'}
      </button>
    </div>
  );
}
