import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  ArrowLeft, Calendar, User, MapPin, Activity, Stethoscope,
  FileText, AlertCircle, CheckCircle, Clock, Phone as PhoneIcon,
} from "lucide-react";

export default function CaseDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  if (!state) {
    return (
      <Layout role="vet">
        <div className="max-w-4xl mx-auto">
          <div className="empty-state">
            <div className="empty-state-icon"><AlertCircle className="w-7 h-7" /></div>
            <h3 className="empty-state-title">No Case Selected</h3>
            <p className="empty-state-sub">Please select a case from the incoming cases list.</p>
            <button onClick={() => navigate('/vet')} className="btn btn-primary mt-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Cases
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAcceptCase = () =>
    addToast('success', 'Case Accepted', 'You have accepted this case and will be notified of updates');

  const handleRequestMoreInfo = () => {
    const info = prompt("What additional information do you need from the farmer?");
    if (info) addToast('info', 'Information Requested', 'Your request has been sent to the farmer');
  };

  const handleScheduleFollowup = () => {
    const date = prompt("Enter follow-up date (YYYY-MM-DD):");
    if (date) addToast('success', 'Follow-up Scheduled', `Follow-up scheduled for ${date}`);
  };

  const statusConfig: Record<string, { gradient: string; badge: string }> = {
    pending: { gradient: "from-amber-500 to-orange-600", badge: "bg-amber-100 text-amber-800" },
    in_progress: { gradient: "from-blue-600 to-indigo-700", badge: "bg-blue-100 text-blue-800" },
    resolved: { gradient: "from-green-600 to-emerald-700", badge: "bg-green-100 text-green-800" },
  };
  const sc = statusConfig[state.status] || statusConfig.pending;

  return (
    <Layout role="vet">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Back + Header */}
        <div>
          <button
            onClick={() => navigate('/vet')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Cases
          </button>

          {/* Hero Banner */}
          <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${sc.gradient} p-6 md:p-8`}>
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
              <span className="absolute top-4 right-10 text-8xl">🩺</span>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="hero-content-up">
                <p className="text-white/70 text-xs mb-1 font-mono">Case ID: #{state.id}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white sora">Case Details</h1>
                <p className="text-white/80 mt-1 text-sm">
                  {state.animal_type
                    ? `${state.animal_type.charAt(0).toUpperCase() + state.animal_type.slice(1)} · ${state.farmer_name || "Unknown farmer"}`
                    : "Animal case review"}
                </p>
              </div>
              <div className="hero-content-up-d1 flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${sc.badge}`}>
                  {state.status || 'pending'}
                </span>
                <button onClick={handleAcceptCase} className="btn btn-sm flex items-center gap-2" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}>
                  <CheckCircle className="w-4 h-4" /> Accept Case
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Detail cards */}
          <div className="lg:col-span-2 space-y-6">

            {/* Animal Information */}
            <div className="card animate-fadeInUp">
              <div className="card-header flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 sora">Animal Information</h2>
                  <p className="text-xs text-gray-500">Patient details and history</p>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Species", value: state.animal_type || "Unknown" },
                    { label: "Age", value: state.age ? `${state.age} years` : "Not specified" },
                    { label: "Weight", value: state.weight ? `${state.weight} kg` : "Not specified" },
                    { label: "Breed", value: state.breed || "Unknown" },
                    { label: "Registration No.", value: state.reg_no || "Not registered" },
                    { label: "Tag ID", value: state.tag_id || "Not tagged" },
                  ].map(f => (
                    <div key={f.label} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="font-bold text-gray-900 text-sm">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Symptoms */}
            <div className="card animate-fadeInUp-delay-1">
              <div className="card-header flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 sora">Symptoms & Observations</h2>
                  <p className="text-xs text-gray-500">Reported by the farmer</p>
                </div>
              </div>
              <div className="card-body space-y-4">
                <div className="p-4 rounded-xl bg-red-50/60 border border-red-100">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Symptom Description</p>
                  <p className="text-gray-800 text-sm whitespace-pre-wrap">
                    {state.symptom_text || 'No symptoms description provided'}
                  </p>
                </div>

                {state.symptoms && Array.isArray(state.symptoms) && state.symptoms.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">Specific Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {state.symptoms.map((s: string, i: number) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {state.body_temperature && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-xs text-amber-600 font-semibold uppercase tracking-widest mb-1">Body Temperature</p>
                      <p className="text-lg font-bold text-amber-900">{state.body_temperature}°C</p>
                    </div>
                  )}
                  {state.duration && (
                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100">
                      <p className="text-xs text-purple-600 font-semibold uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-lg font-bold text-purple-900">{state.duration}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Farmer Information */}
            <div className="card animate-fadeInUp-delay-2">
              <div className="card-header flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 sora">Farmer Information</h2>
                  <p className="text-xs text-gray-500">Case reporter details</p>
                </div>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold sora flex-shrink-0">
                    {(state.farmer_name || "F").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 sora">{state.farmer_name || 'Unknown Farmer'}</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        {state.farmer_phone || 'Not provided'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {state.location || 'Location not specified'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions + Timeline + AI */}
          <div className="space-y-6">
            {/* Case Actions */}
            <div className="card animate-fadeInUp">
              <div className="card-header flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-900 sora">Case Actions</h2>
              </div>
              <div className="card-body space-y-2.5">
                <button onClick={handleAcceptCase} className="btn btn-primary btn-wide flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Accept Case
                </button>
                <button onClick={handleRequestMoreInfo} className="btn btn-outline btn-wide flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Request More Info
                </button>
                <button onClick={handleScheduleFollowup} className="btn btn-outline btn-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Schedule Follow-up
                </button>
                <button className="btn btn-outline btn-wide flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> Start Treatment Plan
                </button>
                <button className="btn btn-outline-red btn-wide flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Escalate to Specialist
                </button>
              </div>
            </div>

            {/* Case Timeline */}
            <div className="card animate-fadeInUp-delay-1">
              <div className="card-header flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-900 sora">Case Timeline</h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {[
                    { icon: Calendar, color: "bg-green-100", iconColor: "text-green-600", title: "Case Reported", sub: new Date(state.created_at).toLocaleString() },
                    { icon: AlertCircle, color: "bg-blue-100", iconColor: "text-blue-600", title: "Status Changed", sub: "Awaiting review" },
                    { icon: Clock, color: "bg-gray-100", iconColor: "text-gray-600", title: "Current Status", sub: "Pending veterinarian review" },
                  ].map(({ icon: Icon, color, iconColor, title, sub }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Prediction */}
            {state.ml_prediction && (
              <div className="rounded-2xl overflow-hidden border border-blue-200 animate-fadeInUp-delay-2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm sora">AI Prediction</h3>
                    <p className="text-blue-100 text-xs">Based on reported symptoms</p>
                  </div>
                </div>
                <div className="bg-blue-50 px-5 py-4 space-y-3">
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-0.5">Likely Condition</p>
                    <p className="text-lg font-bold text-blue-900 sora">{state.ml_prediction}</p>
                  </div>
                  {state.confidence && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest">Confidence</p>
                        <span className="text-sm font-bold text-blue-900">{state.confidence}%</span>
                      </div>
                      <div className="progress-wrap h-2">
                        <div className="progress-bar" style={{ width: `${state.confidence}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="info-box info-box-blue text-xs">
                    <span className="font-semibold">Note:</span> AI prediction only. Always verify with clinical examination.
                  </div>
                </div>
              </div>
            )}

            {/* Emergency */}
            <div className="rounded-2xl overflow-hidden border border-red-200 animate-fadeInUp">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm sora">Emergency Contact</h3>
              </div>
              <div className="bg-red-50 px-5 py-4">
                <p className="text-sm text-red-800 font-medium">Farmer Phone</p>
                <p className="text-base font-bold text-red-900 sora mt-0.5">{state.farmer_phone || 'Contact not available'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const Phone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);