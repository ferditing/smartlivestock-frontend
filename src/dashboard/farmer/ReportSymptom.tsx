// ReportSymptom.tsx - Updated
import { useEffect, useState } from "react";
import { reportSymptom } from "../../api/farmer.api";
import { mlHealth, predict, predictFromText } from "../../api/ml.api";
import { useToast } from "../../context/ToastContext";
import {
  Thermometer,
  Calendar,
  Activity,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Brain,
  ClipboardCheck
} from "lucide-react";

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
  const [prediction, setPrediction] = useState<any>(null);
  const [freeTextPrediction, setFreeTextPrediction] = useState<any>(null);
  const { addToast } = useToast();

  useEffect(() => {
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
      .catch(() => {
        setAvailableSymptoms(["fever", "cough", "loss of appetite", "diarrhea", "lethargy"]);
      });
  }, []);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const submit = async () => {
    setLoading(true);
    setPrediction(null);

    if (!age || !temp) {
      addToast('warning', 'Missing Information', 'Please fill in age and temperature for better prediction');
    }

    try {
      const payload = {
        animal_type: animal,
        age: age ? Number(age) : 0,
        body_temperature: temp ? Number(temp) : 0,
        symptoms,
      };

      let ml: any = null;
      let canonical: string[] | undefined = undefined;

      try {
        if (symptoms && symptoms.length > 0) {
          const textPayload = {
            animal: animal.toLowerCase(),
            symptom_text: symptoms.join(', '),
            age: age ? Number(age) : 0,
            body_temperature: temp ? Number(temp) : 0,
          };
          console.log('[ReportSymptom] Calling predictFromText with:', textPayload);
          ml = await predictFromText(textPayload);
          console.log('[ReportSymptom] predictFromText response:', ml);
        } else {
          console.log('[ReportSymptom] Calling predict with:', payload);
          ml = await predict(payload);
          console.log('[ReportSymptom] predict response:', ml);
        }
        setPrediction(ml);
        // matched_symptoms is nested: {matched_symptoms: Array, confidence: ..., unmatched_phrases: ...}
        canonical = ml?.matched_symptoms?.matched_symptoms || undefined;
        console.log('[ReportSymptom] Extracted canonical_symptoms array:', canonical);
      } catch (mlErr: any) {
        console.warn('ML predict failed, falling back to local extraction', mlErr?.message || mlErr);
        if (symptoms && symptoms.length > 0) {
          canonical = symptoms.map((s) => s.replace(/\s+/g, '_').toLowerCase());
        }
      }

      const symptomText = symptoms.length ? symptoms.join(', ') : '';
      console.log('[ReportSymptom] Submitting report with canonical_symptoms:', canonical);
      await reportSymptom(symptomText, { animal_id: undefined, animal_type: animal, canonical_symptoms: canonical });
      addToast('success', 'Report Submitted', 'Symptoms reported successfully');
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Submission Failed', err?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const submitText = async () => {
    if (!freeText.trim()) {
      addToast('error', 'Error', 'Please type symptoms to predict');
      return;
    }

    setTextLoading(true);
    setFreeTextPrediction(null);

    try {
      // Try ML normalize/predict first, fall back to local extraction
      const payload = {
        animal: animal ? animal.toLowerCase() : undefined,
        symptom_text: freeText,
        age: age ? Number(age) : 0,
        body_temperature: temp ? Number(temp) : 0,
      };

      console.log('[ReportSymptom FreeText] Calling predictFromText with:', payload);
      let ml: any = null;
      try {
        ml = await predictFromText(payload);
        console.log('[ReportSymptom FreeText] predictFromText response:', ml);
        setFreeTextPrediction(ml);
      } catch (mlErr: any) {
        console.warn('[ReportSymptom FreeText] ML normalize/predict failed, falling back to local extraction', mlErr?.message || mlErr);
      }

      // canonical can come from ML or local extraction
      let canonical: string[] | undefined = undefined;
      canonical = ml?.matched_symptoms?.matched_symptoms || undefined;

      if (!canonical) {
        const textNorm = freeText.toLowerCase();
        const found: string[] = [];
        availableSymptoms.forEach((s) => {
          const norm = s.toLowerCase();
          if (textNorm.includes(norm)) {
            found.push(norm.replace(/\s+/g, '_'));
          }
        });
        canonical = found.length > 0 ? found : undefined;
      }

      console.log('[ReportSymptom FreeText] Extracted symptoms (final):', canonical);
      if (canonical && canonical.length > 0) {
        addToast('success', 'Symptoms Found', `Identified: ${canonical.join(', ')}`);
      }

      await reportSymptom(freeText, { animal_id: undefined, animal_type: ml?.animal_type || animal, canonical_symptoms: canonical });
      addToast('success', 'Report Submitted', 'Symptoms extracted and report created successfully');
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Submission Failed', err?.message || 'Failed to submit report');
    } finally {
      setTextLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Symptom Analysis</h2>
            <p className="text-sm text-gray-500">Get instant predictions for livestock symptoms</p>
          </div>
        </div>
      </div>

      <div className="card-body space-y-6">
        {/* Free Text Input */}
        <div className="space-y-3 w-full">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            Describe Symptoms (Free Text)
          </label>
          <div className="space-y-3 w-full">
            <textarea
              className="input-field min-h-[100px] w-full"
              placeholder="e.g. high fever, coughing and loss of appetite, difficulty breathing..."
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              disabled={textLoading}
            />
            <button
              onClick={submitText}
              disabled={textLoading}
              className="btn-outline flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {textLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Structured Input</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Animal Selection */}
            <div className="w-full min-w-0">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Activity className="w-4 h-4 flex-shrink-0" />
                Animal
              </label>
              <select 
                className="select-field w-full" 
                value={animal} 
                onChange={(e) => setAnimal(e.target.value)}
              >
                {animals.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Age Input */}
            <div className="w-full min-w-0">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                Age (years)
              </label>
              <input
                className="input-field w-full"
                type="number"
                placeholder="Enter age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>

            {/* Temperature Input */}
            <div className="w-full min-w-0">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 flex-shrink-0" />
                Body Temperature (°C)
              </label>
              <input
                className="input-field w-full"
                type="number"
                placeholder="Enter temperature"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Symptoms Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Symptoms
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableSymptoms.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                    symptoms.includes(s)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s}</span>
                    {symptoms.includes(s) && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              onClick={submit}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-5 h-5" />
                  Submit & Get Prediction
                </>
              )}
            </button>
          </div>

          {/* Free Text Prediction Result */}
          {freeTextPrediction && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Brain className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Free Text Analysis Result</h3>
                  <p className="text-sm text-gray-600">From your description</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Predicted Condition</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {freeTextPrediction.predicted_disease || freeTextPrediction.predicted_label}
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Confidence Level</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(freeTextPrediction.confidence || freeTextPrediction.confidence) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {Math.round((freeTextPrediction.confidence || freeTextPrediction.confidence) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">Recommended Action</p>
                    <p className="text-amber-700 mt-1">
                      Please visit a veterinary clinic or agrovet immediately for professional diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Result */}
        {prediction && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Prediction Result</h3>
                <p className="text-sm text-gray-600">Based on your input</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <p className="text-sm font-medium text-gray-500">Predicted Condition</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {prediction.predicted_disease || prediction.predicted_label}
                </p>
              </div>
              
              <div className="p-4 bg-white rounded-lg">
                <p className="text-sm font-medium text-gray-500">Confidence Level</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(prediction.confidence || prediction.confidence) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {Math.round((prediction.confidence || prediction.confidence) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800">Recommended Action</p>
                  <p className="text-amber-700 mt-1">
                    Please visit a veterinary clinic or agrovet immediately for professional diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}