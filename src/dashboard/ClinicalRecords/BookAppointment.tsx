// BookAppointment.tsx - Updated
import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/Layout";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { Calendar, Clock, User, FileText, Loader2, MapPin } from "lucide-react";

type Provider = { id: number; name: string; type?: string; distance?: number };
type Report = { id: number; title?: string; animal_name?: string };

export default function BookAppointment() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [providerId, setProviderId] = useState<number | "">("");
  const [reportId, setReportId] = useState<number | "">("");
  const [scheduledAt, setScheduledAt] = useState<string>(new Date().toISOString().slice(0, 16));
  const [reason, setReason] = useState<"checkup" | "prediction">("checkup");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [geoloading, setGeoLoading] = useState(false);
  const [farmerLocation, setFarmerLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // fetch farmer's reports
    axios
      .get("/reports/my")
      .then((r) => setReports(r.data))
      .catch(() => {});

    const providerParam = searchParams.get("provider");
    if (providerParam) {
      const n = Number(providerParam);
      if (!Number.isNaN(n)) setProviderId(n);
    }
  }, [searchParams]);

  useEffect(() => {
    if (navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const response = await axios.get(`/providers/nearby?lat=${lat}&lng=${lng}`);
            setProviders(response.data);
          } catch (error) {
            addToast('error', 'Error', 'Failed to load nearby providers');
          } finally {
            setGeoLoading(false);
          }
        },
        () => {
          addToast('warning', 'Location Access', 'Enable location to see nearby providers');
          setGeoLoading(false);
        }
      );
    }
  }, [addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduledAt) {
      addToast('error', 'Validation Error', 'Please select a date and time');
      return;
    }
    
    if (providerId && !providers.find(p => p.id === providerId)) {
      addToast('error', 'Validation Error', 'Selected provider is invalid');
      return;
    }

    setLoading(true);

    // Capture farmer's location
    if (navigator.geolocation && !farmerLocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setFarmerLocation(location);
          await submitAppointment(location);
        },
        () => {
          // If location fails, continue without it
          submitAppointment(null);
        }
      );
    } else {
      await submitAppointment(farmerLocation);
    }
  };

  const submitAppointment = async (location: { lat: number; lng: number } | null) => {
    try {
      const payload: any = {
        provider_id: providerId || null,
        scheduled_at: scheduledAt,
        reason: reason,
      };
      if (reportId) payload.report_id = reportId;
      if (location) {
        payload.farmer_lat = location.lat;
        payload.farmer_lng = location.lng;
      }

      await axios.post("/appointments", payload);
      addToast('success', 'Success', 'Appointment booked successfully!');
      
      // Reset form
      setProviderId("");
      setReportId("");
      setReason("checkup");
      setScheduledAt(new Date().toISOString().slice(0, 16));
      setFarmerLocation(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Failed to book appointment";
      addToast('error', 'Booking Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="farmer">
      <div className="max-w-3xl mx-auto">
        <div className="card overflow-hidden">
          <div className="card-header bg-gradient-to-r from-green-600 to-green-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Book Appointment</h2>
                <p className="text-green-100 text-sm">Schedule a veterinary appointment</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card-body space-y-6">
            {/* Appointment Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                Appointment Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReason("checkup")}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    reason === "checkup"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">General Checkup</div>
                  <p className="text-sm text-gray-600 mt-1">Routine examination</p>
                </button>
                <button
                  type="button"
                  onClick={() => setReason("prediction")}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    reason === "prediction"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">Follow-up (ML)</div>
                  <p className="text-sm text-gray-600 mt-1">AI prediction review</p>
                </button>
              </div>
            </div>

            {/* Provider Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                Select Provider
              </label>
              <div className="space-y-2">
                <select
                  className="select-field"
                  value={providerId}
                  onChange={(e) => setProviderId(Number(e.target.value) || "")}
                >
                  <option value="">Any available provider</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.type && `(${p.type})`} {p.distance && `- ${(p.distance / 1000).toFixed(1)}km`}
                    </option>
                  ))}
                </select>
                {geoloading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Finding nearby providers...
                  </div>
                )}
              </div>
            </div>

            {/* Related Report */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Related Report (Optional)
              </label>
              <select
                className="select-field"
                value={reportId}
                onChange={(e) => setReportId(Number(e.target.value) || "")}
              >
                <option value="">No report selected</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title || `Report #${r.id}`} {r.animal_name && `- ${r.animal_name}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Date & Time
              </label>
              <input
                className="input-field"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="card-footer bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Appointments are scheduled based on provider availability</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}