import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useToast } from "../../context/ToastContext";
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Activity,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";

export default function CaseDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  if (!state) {
    return (
      <Layout role="vet">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Case Selected</h3>
            <p className="text-gray-600 mb-6">Please select a case from the incoming cases list.</p>
            <button
              onClick={() => navigate('/vet')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cases
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAcceptCase = () => {
    addToast('success', 'Case Accepted', 'You have accepted this case and will be notified of updates');
    // Add your case acceptance logic here
  };

  const handleRequestMoreInfo = () => {
    const info = prompt("What additional information do you need from the farmer?");
    if (info) {
      addToast('info', 'Information Requested', 'Your request has been sent to the farmer');
    }
  };

  const handleScheduleFollowup = () => {
    const date = prompt("Enter follow-up date (YYYY-MM-DD):");
    if (date) {
      addToast('success', 'Follow-up Scheduled', `Follow-up scheduled for ${date}`);
    }
  };

  return (
    <Layout role="vet">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/vet')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cases
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Case Details</h1>
            <p className="text-gray-600 mt-1">Case ID: {state.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${
              state.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              state.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            } px-3 py-1.5`}>
              {state.status || 'pending'}
            </span>
            <button
              onClick={handleAcceptCase}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Accept Case
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Case Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Animal Information Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Animal Information</h2>
                    <p className="text-sm text-gray-500">Patient details and history</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Species</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {state.animal_type || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Age</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {state.age || 'Not specified'} years
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Weight</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {state.weight || 'Not specified'} kg
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Breed</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {state.breed || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration No.</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {state.reg_no || 'Not registered'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tag ID</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {state.tag_id || 'Not tagged'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Symptoms Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Symptoms & Observations</h2>
                    <p className="text-sm text-gray-500">Reported by the farmer</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Symptom Description</p>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                      {state.symptom_text || 'No symptoms description provided'}
                    </p>
                  </div>
                  
                  {state.symptoms && Array.isArray(state.symptoms) && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Specific Symptoms</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {state.symptoms.map((symptom: string, index: number) => (
                          <span key={index} className="badge bg-blue-100 text-blue-800 px-3 py-1">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.body_temperature && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Body Temperature</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {state.body_temperature}°C
                        </p>
                      </div>
                    )}
                    
                    {state.duration && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Duration</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {state.duration}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Farmer Information Card */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Farmer Information</h2>
                    <p className="text-sm text-gray-500">Case reporter details</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{state.farmer_name || 'Unknown Farmer'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{state.farmer_phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{state.location || 'Location not specified'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Timeline */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Case Actions</h2>
              </div>
              <div className="card-body space-y-3">
                <button
                  onClick={handleAcceptCase}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept Case
                </button>
                
                <button
                  onClick={handleRequestMoreInfo}
                  className="w-full btn-outline flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Request More Info
                </button>
                
                <button
                  onClick={handleScheduleFollowup}
                  className="w-full btn-outline flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Follow-up
                </button>
                
                <button className="w-full btn-outline flex items-center justify-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Start Treatment Plan
                </button>
                
                <button className="w-full text-red-600 hover:text-red-700 font-medium py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  Escalate to Specialist
                </button>
              </div>
            </div>

            {/* Case Timeline Card */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Case Timeline</h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Case Reported</p>
                      <p className="text-sm text-gray-600">
                        {new Date(state.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Status Changed</p>
                      <p className="text-sm text-gray-600">Awaiting review</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Current Status</p>
                      <p className="text-sm text-gray-600">Pending veterinarian review</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prediction Card */}
            {state.ml_prediction && (
              <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800">AI Prediction</h3>
                      <p className="text-sm text-blue-700">Based on reported symptoms</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Likely Condition</p>
                      <p className="text-lg font-bold text-blue-900">{state.ml_prediction}</p>
                    </div>
                    
                    {state.confidence && (
                      <div>
                        <p className="text-sm font-medium text-blue-800">Confidence Level</p>
                        <div className="mt-2">
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${state.confidence}%` }}
                            ></div>
                          </div>
                          <p className="text-lg font-bold text-blue-900 mt-2">
                            {state.confidence}%
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Note:</span> This is an AI-generated prediction. 
                        Always verify with clinical examination.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">Emergency Contact</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Farmer: {state.farmer_phone || 'Contact not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Add missing Phone icon component
const Phone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);