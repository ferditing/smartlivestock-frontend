/**
 * SmartLivestock — CreateClinicalRecord (Premium Redesign)
 *
 * Stepped card form:
 *   1. Animal Selection — browse tile / reg search with found-animal card
 *   2. Attending Vet — auto-assign for vet role / select for others
 *   3. Diagnosis — ML diagnosis input, animated confidence gauge, vet notes
 *   Review summary before submit
 *
 * All original API calls, validation, state unchanged.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  ArrowLeft, FileText, User, Search, Loader2,
  Stethoscope, AlertCircle, CheckCircle,
  PawPrint, Microscope, BarChart3, X,
  Shield, Sparkles,
} from "lucide-react";

/* ── Confidence colour helper ─────────────────────────────────── */
function confidenceColor(v: number) {
  if (v >= 80) return { bar:"from-green-500 to-emerald-600", text:"text-green-700", bg:"bg-green-100" };
  if (v >= 50) return { bar:"from-amber-500 to-orange-500",  text:"text-amber-700", bg:"bg-amber-100" };
  return { bar:"from-red-500 to-rose-600", text:"text-red-700", bg:"bg-red-100" };
}
function confidenceLabel(v: number) {
  if (v >= 80) return "High confidence";
  if (v >= 50) return "Moderate confidence";
  return "Low confidence";
}

/* ── Section card ─────────────────────────────────────────────── */
function StepCard({ step, title, sub, iconEl, grad, children }: {
  step: number; title: string; sub: string;
  iconEl: React.ReactNode; grad: string; children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${grad}`}
            style={{ boxShadow:"0 2px 8px rgba(0,0,0,.15)" }}>
            {iconEl}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Step {step}</span>
            </div>
            <h3 className="font-bold text-gray-900 sora text-sm leading-none mt-0.5">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export const CreateClinicalRecord: React.FC = () => {
  const navigate      = useNavigate();
  const { animalId: urlAnimalId } = useParams<{ animalId?: string }>();
  const { addToast }  = useToast();

  const [formData, setFormData] = useState({
    vetId: "", mlDiagnosis: "", mlConfidence: 0, vetDiagnosis: "", notes: "",
  });
  const [loading,        setLoading]        = useState(false);
  const [vets,           setVets]           = useState<any[]>([]);
  const [animals,        setAnimals]        = useState<any[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState("");
  const [searchMode,     setSearchMode]     = useState<"browse"|"search">("browse");
  const [regNo,          setRegNo]          = useState("");
  const [foundAnimal,    setFoundAnimal]    = useState<any>(null);
  const [searchLoading,  setSearchLoading]  = useState(false);

  const userRole      = localStorage.getItem("role") || "farmer";
  const currentUserId = localStorage.getItem("userId");

  /* ── Effects ── */
  useEffect(() => {
    if (userRole === "vet" && currentUserId) {
      setFormData(prev => ({ ...prev, vetId: currentUserId }));
    }

    const fetchVets = async () => {
      try {
        const res = await axios.get("/api/users?role=vet", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = res.data?.data ?? res.data;
        setVets(Array.isArray(data) ? data : []);
      } catch { addToast("warning", "Vets", "Could not load veterinarian list"); }
    };

    const fetchAnimals = async () => {
      try {
        const res = await axios.get("/api/animal", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAnimals(res.data);
      } catch { addToast("warning", "Animals", "Could not load animal list"); }
    };

    fetchVets();
    fetchAnimals();
  }, [userRole, currentUserId, addToast]);

  useEffect(() => {
    if (urlAnimalId && animals.length > 0) {
      const id = Number(urlAnimalId);
      if (!isNaN(id) && animals.some(a => a.id === id)) {
        setSelectedAnimalId(String(id));
        setSearchMode("browse");
      }
    }
  }, [urlAnimalId, animals]);

  /* ── Search by reg no ── */
  const searchAnimalByRegNo = async () => {
    if (!regNo.trim()) { addToast("error", "Validation", "Please enter a registration number"); return; }
    setSearchLoading(true);
    try {
      const res = await axios.get(`/api/animal/search?reg_no=${encodeURIComponent(regNo)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data) {
        setFoundAnimal(res.data);
        setSelectedAnimalId(String(res.data.id));
        addToast("success", "Found", "Animal located successfully");
      } else {
        addToast("warning", "Not Found", "No animal found with that registration number");
        setFoundAnimal(null);
      }
    } catch {
      addToast("error", "Search Failed", "Failed to find animal. Check the registration number.");
      setFoundAnimal(null);
    } finally { setSearchLoading(false); }
  };

  /* ── Handlers ── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "mlConfidence" ? parseFloat(value) : value }));
  };

  const handleModeChange = (mode: "browse"|"search") => {
    setSearchMode(mode);
    if (mode === "browse") { setFoundAnimal(null); setRegNo(""); }
    else { setSelectedAnimalId(""); }
  };

  const validateForm = () => {
    if (!selectedAnimalId && !foundAnimal) {
      addToast("error", "Validation", "Please select or search for an animal"); return false;
    }
    if (userRole !== "vet" && !formData.vetId) {
      addToast("error", "Validation", "Please select an attending veterinarian"); return false;
    }
    if (!formData.mlDiagnosis.trim()) {
      addToast("error", "Validation", "ML diagnosis is required"); return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalVetId = userRole === "vet" ? (currentUserId || "TOKEN_ID") : formData.vetId;
    const animalId = searchMode === "browse"
      ? (selectedAnimalId ? Number(selectedAnimalId) : null)
      : (foundAnimal ? Number(foundAnimal.id) : null);

    if (!animalId || isNaN(animalId)) {
      addToast("error", "Validation", "Invalid animal selection"); return;
    }

    setLoading(true);
    try {
      await axios.post("/api/clinical-records", {
        animalId,
        ...(userRole !== "vet" && { vetId: Number(finalVetId) }),
        mlDiagnosis:  formData.mlDiagnosis,
        mlConfidence: formData.mlConfidence || 0,
        vetDiagnosis: formData.vetDiagnosis || null,
        notes:        formData.notes || null,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

      addToast("success", "Created", "Clinical record created successfully");
      setTimeout(() => navigate("/clinical-records"), 900);
    } catch (err: any) {
      addToast("error", "Failed", err.response?.data?.error || "Failed to create clinical record");
    } finally { setLoading(false); }
  };

  /* ── Derived ── */
  const conf = confidenceColor(formData.mlConfidence);
  const selectedAnimal = animals.find(a => String(a.id) === selectedAnimalId);
  const selectedVet    = vets.find(v => String(v.id) === formData.vetId);

  return (
    <Layout role={userRole}>
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeInUp">

        {/* ── Page header ── */}
        <div>
          <button onClick={() => navigate("/clinical-records")}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Records
          </button>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ boxShadow:"0 4px 16px rgba(22,163,74,.3)" }}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="page-title">Create Clinical Record</h1>
              <p className="page-sub">Document a new animal health assessment</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ══ STEP 1 — ANIMAL ══ */}
          <StepCard step={1} title="Select Animal" sub="Choose the animal for this record"
            iconEl={<PawPrint className="w-5 h-5 text-white" />} grad="from-green-500 to-emerald-600">

            {/* Mode toggle */}
            <div className="flex bg-gray-100 p-0.5 rounded-xl mb-5">
              {(["browse","search"] as const).map(m => (
                <button key={m} type="button" onClick={() => handleModeChange(m)}
                  className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-[10px] transition-all duration-200 ${
                    searchMode === m
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {m === "browse" ? <User className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
                  {m === "browse" ? "Browse My Animals" : "Search by Registration"}
                </button>
              ))}
            </div>

            {searchMode === "browse" ? (
              <div className="space-y-3">
                <label className="field-label">Select Animal *</label>
                <select value={selectedAnimalId}
                  onChange={e => setSelectedAnimalId(e.target.value)}
                  required={searchMode === "browse"} className="select-field">
                  <option value="">Choose an animal…</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.species} — {a.tag_id || a.name || `ID: ${a.id}`}
                    </option>
                  ))}
                </select>

                {selectedAnimal && (
                  <div className="flex items-center gap-3 p-3.5 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <PawPrint className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Selected</p>
                      <p className="text-sm font-bold text-green-900 truncate">
                        {selectedAnimal.species} — {selectedAnimal.tag_id || selectedAnimal.name || `ID: ${selectedAnimal.id}`}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="field-label">Registration Number *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={regNo} onChange={e => setRegNo(e.target.value)}
                      placeholder="e.g. COW/1/26"
                      className="input-field pl-10"
                      disabled={searchLoading}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); searchAnimalByRegNo(); } }}
                    />
                    {regNo && (
                      <button type="button" onClick={() => { setRegNo(""); setFoundAnimal(null); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 text-gray-400 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button type="button" onClick={searchAnimalByRegNo} disabled={searchLoading}
                    className="btn btn-primary btn-md flex items-center gap-1.5 flex-shrink-0">
                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </button>
                </div>

                {searchLoading && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Searching for animal…
                  </div>
                )}

                {foundAnimal && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-green-100 bg-green-100/60 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-black uppercase tracking-widest text-green-700">Animal Found</span>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {[
                        { label:"Species",      value: foundAnimal.species },
                        { label:"Breed",        value: foundAnimal.breed || "Unknown" },
                        { label:"Tag ID",       value: foundAnimal.tag_id || "N/A" },
                        { label:"Registration", value: regNo },
                      ].map(f => (
                        <div key={f.label}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{f.label}</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </StepCard>

          {/* ══ STEP 2 — VET ══ */}
          <StepCard step={2} title="Attending Veterinarian" sub="Who is handling this case?"
            iconEl={<Stethoscope className="w-5 h-5 text-white" />} grad="from-blue-500 to-indigo-600">

            {userRole === "vet" ? (
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900">You are the attending veterinarian</h4>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    This record will be created under your credentials as the primary veterinarian.
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="field-label">Select Veterinarian *</label>
                <select value={formData.vetId} onChange={handleChange} name="vetId" required className="select-field">
                  <option value="">Choose a veterinarian…</option>
                  {vets.map(v => (
                    <option key={v.id} value={v.id}>
                      Dr. {v.name} • {v.specialization || "General Veterinarian"}
                    </option>
                  ))}
                </select>

                {selectedVet && (
                  <div className="flex items-center gap-3 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Assigned</p>
                      <p className="text-sm font-bold text-blue-900 truncate">
                        Dr. {selectedVet.name}
                        {selectedVet.specialization && (
                          <span className="text-xs font-medium text-blue-600 ml-1.5">• {selectedVet.specialization}</span>
                        )}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  </div>
                )}
              </div>
            )}
          </StepCard>

          {/* ══ STEP 3 — DIAGNOSIS ══ */}
          <StepCard step={3} title="Diagnosis Information" sub="ML findings and clinical assessment"
            iconEl={<Microscope className="w-5 h-5 text-white" />} grad="from-purple-500 to-violet-600">

            <div className="space-y-5">
              {/* ML Diagnosis */}
              <div>
                <label className="field-label flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  ML Diagnosis *
                </label>
                <input type="text" name="mlDiagnosis" value={formData.mlDiagnosis}
                  onChange={handleChange}
                  placeholder="e.g. Anthrax, Mastitis, Foot and Mouth Disease"
                  required className="input-field" />
              </div>

              {/* ML Confidence gauge */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="field-label flex items-center gap-1.5 mb-0">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                    ML Confidence
                  </label>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${conf.bg}`}>
                    <span className={`text-sm font-black ${conf.text}`}>{formData.mlConfidence}%</span>
                    <span className={`text-[10px] font-semibold ${conf.text}`}>{confidenceLabel(formData.mlConfidence)}</span>
                  </div>
                </div>

                {/* Custom slider track */}
                <div className="relative">
                  <input type="range" name="mlConfidence" min="0" max="100" step="1"
                    value={formData.mlConfidence} onChange={handleChange}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #16a34a 0%, #16a34a ${formData.mlConfidence}%, #e5e7eb ${formData.mlConfidence}%, #e5e7eb 100%)`,
                    }}
                  />
                </div>

                {/* Confidence bar visual */}
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${conf.bar} rounded-full transition-all duration-300`}
                    style={{ width:`${formData.mlConfidence}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400 font-medium">0%</span>
                  <span className="text-[10px] text-gray-400 font-medium">50%</span>
                  <span className="text-[10px] text-gray-400 font-medium">100%</span>
                </div>
              </div>

              {/* Vet Diagnosis */}
              <div>
                <label className="field-label flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                  Veterinary Diagnosis
                  <span className="text-[10px] font-medium text-gray-400 ml-1">(optional)</span>
                </label>
                <textarea name="vetDiagnosis" value={formData.vetDiagnosis} onChange={handleChange}
                  placeholder="Enter your clinical diagnosis based on examination…"
                  rows={3} className="input-field resize-none" />
              </div>

              {/* Clinical Notes */}
              <div>
                <label className="field-label flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  Clinical Notes
                  <span className="text-[10px] font-medium text-gray-400 ml-1">(optional)</span>
                </label>
                <textarea name="notes" value={formData.notes} onChange={handleChange}
                  placeholder="Additional observations, treatment recommendations, follow-up notes…"
                  rows={4} className="input-field resize-none" />
              </div>
            </div>
          </StepCard>

          {/* ══ Submit ══ */}
          <div className="card overflow-hidden">
            <div className="card-body space-y-4">
              {/* Warning notice */}
              <div className="alert-card alert-card-amber">
                <div className="alert-card-icon bg-amber-100">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-800">Review before submitting</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    This clinical record will be permanently added to the system. Please ensure all information is accurate before submission.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" disabled={loading}
                  className="btn btn-primary btn-lg flex-1 flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Record…</>
                    : <><FileText className="w-5 h-5" /> Create Clinical Record</>
                  }
                </button>
                <button type="button" onClick={() => navigate("/clinical-records")}
                  className="btn btn-outline btn-lg flex items-center justify-center gap-2 sm:w-auto">
                  <ArrowLeft className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </Layout>
  );
};