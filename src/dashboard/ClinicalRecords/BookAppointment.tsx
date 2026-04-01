/**
 * SmartLivestock — BookAppointment (Premium Redesign)
 *
 * 4-step wizard: Type → Provider → Schedule → Review
 * • Appointment type visual cards (Checkup / ML Prediction)
 * • Provider cards with distance, rating, online dot
 * • Inline calendar date picker (custom grid, no native input)
 * • Time-slot grid (30-min increments 09:00–17:00)
 * • Animated step progress bar with connecting lines
 * • Review summary card with per-field confirm icons
 *
 * FIXES applied in this version:
 *  1. On successful booking → reset wizard back to Step 0 (no redirect away).
 *  2. Per-step validation before advancing:
 *     • Step 0 (Type)     — always valid (type is pre-selected by default).
 *     • Step 1 (Provider) — blocks if geo is still loading; provider itself
 *                           is optional (null = auto-assign) so always valid.
 *     • Step 2 (Schedule) — blocks until BOTH a date AND a time are chosen;
 *                           highlights the missing card with a red ring.
 *     • Step 3 (Review)   — submit validates scheduledAt before posting.
 *  3. Inline stepError banner shown below step content, auto-cleared when
 *     the user corrects the issue.
 */

import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import Layout from "../../components/Layout";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  Calendar, Clock, User, FileText, Loader2, MapPin,
  CheckCircle, ChevronRight, ChevronLeft, Stethoscope,
  Brain, AlertCircle, Check, PartyPopper,
} from "lucide-react";

/* ── Types ── */
type Step   = 0 | 1 | 2 | 3;
type Reason = "checkup" | "prediction";

type Provider = { id: number; name: string; type?: string; distance?: number };
type Report = {
  id: number;
  animal_type?: string;
  symptom_text?: string;
  status?: string;
  created_at?: string;
};

/* ══════════════════════ SUB-COMPONENTS ══════════════════════ */

const STEP_LABELS = ["Type", "Provider", "Schedule", "Review"];

function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${done   ? "bg-green-600 text-white"
                  : active ? "bg-green-600 text-white ring-4 ring-green-100"
                  :          "bg-gray-100 text-gray-400"}`}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${active || done ? "text-green-700" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 transition-all duration-300 ${i < current ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function TypeCard({
  selected, onClick, accent, icon, title, subtitle, badge,
}: {
  selected: boolean; onClick: () => void; accent: "green" | "blue";
  icon: React.ReactNode; title: string; subtitle: string; badge?: string;
}) {
  const ring   = accent === "green" ? "border-green-500 bg-green-50" : "border-blue-500 bg-blue-50";
  const iconBg = accent === "green"
    ? "bg-gradient-to-br from-green-500 to-emerald-600"
    : "bg-gradient-to-br from-blue-500 to-indigo-600";
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-4 flex items-start gap-4 transition-all duration-200
        ${selected ? ring : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 sora text-sm">{title}</span>
          {badge && <span className="badge badge-info text-[10px]">{badge}</span>}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      {selected && (
        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${accent === "green" ? "text-green-600" : "text-blue-600"}`} />
      )}
    </button>
  );
}

function ProviderCard({ provider, selected, onClick }: {
  provider: Provider | null; selected: boolean; onClick: () => void;
}) {
  if (!provider) {
    return (
      <button type="button" onClick={onClick}
        className={`w-full text-left rounded-2xl border-2 p-4 flex items-center gap-3 transition-all duration-200
          ${selected ? "border-green-500 bg-green-50" : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"}`}>
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-700 text-sm">No preference</p>
          <p className="text-xs text-gray-400">We'll assign the nearest available provider</p>
        </div>
        {selected && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-4 flex items-center gap-3 transition-all duration-200
        ${selected ? "border-green-500 bg-green-50" : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"}`}>
      <div className="w-10 h-10 rounded-xl card-icon-green flex items-center justify-center flex-shrink-0 relative">
        <User className="w-5 h-5 text-white" />
        <span className="status-dot status-online absolute -top-0.5 -right-0.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{provider.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {provider.type && <span className="text-xs text-gray-500">{provider.type}</span>}
          {provider.distance != null && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <MapPin className="w-3 h-3" /> {provider.distance.toFixed(1)} km
            </span>
          )}
        </div>
      </div>
      {selected && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
    </button>
  );
}

function ProviderSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-text w-1/2" />
        <div className="skeleton-text w-1/3" />
      </div>
    </div>
  );
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function InlineCalendar({ value, onChange }: { value: Date | null; onChange: (d: Date) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className="btn btn-ghost btn-icon-sm"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-bold text-gray-800 sora">{monthLabel}</span>
        <button type="button" onClick={nextMonth} className="btn btn-ghost btn-icon-sm"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day  = i + 1;
          const date = new Date(viewYear, viewMonth, day);
          const past = date < today;
          const sel  = value
            ? date.getFullYear() === value.getFullYear() &&
              date.getMonth()    === value.getMonth()    &&
              date.getDate()     === value.getDate()
            : false;
          const isToday = date.getTime() === today.getTime();
          return (
            <button key={day} type="button" disabled={past} onClick={() => onChange(date)}
              className={`mx-auto w-9 h-9 rounded-xl text-xs font-medium transition-all duration-150 flex items-center justify-center
                ${sel     ? "bg-green-600 text-white font-bold shadow-md"
                : isToday ? "border-2 border-green-400 text-green-700 font-bold"
                : past    ? "text-gray-300 cursor-not-allowed"
                :           "text-gray-700 hover:bg-green-50 hover:text-green-700"}`}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════ MAIN COMPONENT ══════════════════════ */

export default function BookAppointment() {
  const [step,         setStep]         = useState<Step>(0);
  const [reason,       setReason]       = useState<Reason>("checkup");
  const [providerId,   setProviderId]   = useState<number | null>(null);
  const [reportId,     setReportId]     = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading,      setLoading]      = useState(false);
  const [geoLoading,   setGeoLoading]   = useState(false);
  const [providers,    setProviders]    = useState<Provider[]>([]);
  const [reports,      setReports]      = useState<Report[]>([]);
  const [farmerLocation, setFarmerLocation] = useState<{ lat: number; lng: number } | null>(null);

  /* ── NEW: per-step inline validation error ── */
  const [stepError,   setStepError]   = useState<string>("");

  /* ── NEW: controls the post-booking success screen ── */
  const [bookingDone, setBookingDone] = useState(false);

  /* FIX: removed useNavigate — success no longer redirects away from this page */
  const [searchParams] = useSearchParams();
  const { addToast }   = useToast();

  /* ── Reset the entire wizard back to Step 0 ── */
  const resetWizard = () => {
    setStep(0);
    setReason("checkup");
    setProviderId(null);
    setReportId("");
    setSelectedDate(null);
    setSelectedTime("");
    setStepError("");
    setBookingDone(false);
  };

  /* ── Data loading ── */
  useEffect(() => {
    axios.get("/reports/my")
      .then((r) => setReports(r.data))
      .catch(() => addToast("error", "Reports", "Failed to load your reports"));

    const providerParam = searchParams.get("provider");
    if (providerParam) {
      const n = Number(providerParam);
      if (!Number.isNaN(n)) setProviderId(n);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          setFarmerLocation({ lat, lng });
          const res = await axios.get(`/providers/nearby?lat=${lat}&lng=${lng}`);
          setProviders(res.data);
        } catch { addToast("error", "Error", "Failed to load nearby providers"); }
        finally  { setGeoLoading(false); }
      },
      () => {
        addToast("warning", "Location Access", "Enable location to see nearby providers");
        setGeoLoading(false);
      }
    );
  }, [addToast]);

  /* ── Compute ISO string ── */
  const scheduledAt = selectedDate && selectedTime ? (() => {
    const d = new Date(selectedDate);
    const [h, m] = selectedTime.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  })() : "";

  /* ── Time slots 09:00–16:30 in 30-min steps ── */
  const TIME_SLOTS: string[] = [];
  for (let h = 9; h < 17; h++) {
    TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
    TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
  }

  /* ══════════════════════════════════════════════════════════════
     PER-STEP VALIDATION
     Returns "" when the current step is complete and safe to advance.
     Returns a human-readable error string when something is missing.
  ══════════════════════════════════════════════════════════════ */
  const validateStep = (s: Step): string => {
    switch (s) {
      case 0:
        // Visit type is always pre-selected — nothing can be skipped.
        return "";

      case 1:
        // Block advancing while the provider list is still loading.
        // Provider selection itself is optional (null = auto-assign).
        if (geoLoading)
          return "Please wait — we're still finding nearby providers. Try again in a moment.";
        return "";

      case 2:
        // Both date and time must be chosen before the Review step.
        if (!selectedDate && !selectedTime)
          return "Please select a date on the calendar and choose a time slot before continuing.";
        if (!selectedDate)
          return "Please pick a date from the calendar before continuing.";
        if (!selectedTime)
          return "Please choose a time slot before continuing.";
        return "";

      default:
        return "";
    }
  };

  /* ── Navigation ── */
  const next = () => {
    const error = validateStep(step);
    if (error) {
      // Show inline error and stop; do NOT advance to the next step.
      setStepError(error);
      return;
    }
    setStepError("");
    if (step < 3) setStep(s => (s + 1) as Step);
  };

  const prev = () => {
    setStepError("");
    if (step > 0) setStep(s => (s - 1) as Step);
  };

  // Auto-clear the step error as soon as the user fixes the relevant fields.
  useEffect(() => { setStepError(""); }, [reason, providerId, selectedDate, selectedTime, geoLoading]);

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!scheduledAt) {
      const msg = "Please select a date and time before confirming.";
      setStepError(msg);
      addToast("error", "Validation", msg);
      return;
    }
    setLoading(true);
    setStepError("");

    const doSubmit = async (loc: { lat: number; lng: number } | null) => {
      try {
        const payload: Record<string, unknown> = {
          provider_id:  providerId ?? null,
          scheduled_at: scheduledAt,
          reason,
        };
        if (reportId) payload.report_id = reportId;
        if (loc) { payload.farmer_lat = loc.lat; payload.farmer_lng = loc.lng; }

        await axios.post("/appointments", payload);
        addToast("success", "Booked!", "Your appointment has been confirmed.");

        /* ── FIX: was navigate("/farmer/appointments") which sent the user to
           a different page. Now we flip bookingDone to true, which swaps the
           wizard for an in-page success screen. The user can reset from there. ── */
        setBookingDone(true);

      } catch (err: unknown) {
        const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        const errMsg  = message || "Failed to book appointment";
        /* Show the API error both inline (stepError) and as a toast. */
        setStepError(errMsg);
        addToast("error", "Booking Failed", errMsg);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation && !farmerLocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doSubmit({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        ()   => doSubmit(null)
      );
    } else {
      await doSubmit(farmerLocation);
    }
  };

  /* ── Display helpers ── */
  const selectedProvider = providers.find(p => p.id === providerId);
  const selectedReport   = reports.find(r => r.id === reportId);
  const displayDate      = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "—";

  /* ══════════════════════════════════════════════════════════════
     SUCCESS SCREEN
     Replaces the wizard after a successful booking.
     No redirect — the user stays on this page.
     "Book Another Appointment" calls resetWizard() → Step 0.
  ══════════════════════════════════════════════════════════════ */
  if (bookingDone) {
    return (
      <Layout role="farmer">
        <div className="max-w-2xl mx-auto space-y-6 animate-fadeInUp">
          <div>
            <h1 className="page-title">Book Appointment</h1>
            <p className="page-sub">Schedule a veterinary visit in a few simple steps</p>
          </div>

          <div className="card overflow-hidden animate-fadeIn">
            <div className="card-body py-12 flex flex-col items-center text-center gap-6">

              {/* Success icon */}
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 sora">Appointment Booked!</h2>
                <p className="text-gray-500 text-sm max-w-sm">
                  Your appointment has been confirmed. You'll receive a notification once the
                  provider accepts.
                </p>
              </div>

              {/* Compact booking summary */}
              <div className="w-full max-w-sm bg-gray-50 rounded-2xl divide-y divide-gray-100 text-left">
                {[
                  { icon: <Stethoscope className="w-4 h-4 text-green-600" />, label: "Visit Type",
                    value: reason === "checkup" ? "General Checkup" : "AI Prediction Follow-up" },
                  { icon: <User className="w-4 h-4 text-green-600" />, label: "Provider",
                    value: selectedProvider ? selectedProvider.name : "Auto-assigned" },
                  { icon: <Calendar className="w-4 h-4 text-green-600" />, label: "Date",  value: displayDate },
                  { icon: <Clock className="w-4 h-4 text-green-600" />,    label: "Time",  value: selectedTime },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reset → Step 0 */}
              <button type="button" onClick={resetWizard}
                className="btn btn-primary flex items-center gap-2">
                <PartyPopper className="w-4 h-4" />
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  /* ══════════════════════ WIZARD ══════════════════════ */
  return (
    <Layout role="farmer">
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeInUp">

        <div>
          <h1 className="page-title">Book Appointment</h1>
          <p className="page-sub">Schedule a veterinary visit in a few simple steps</p>
        </div>

        <StepBar current={step} />

        {/* ── STEP 0: Type ── */}
        {step === 0 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-green"><Clock className="w-5 h-5 text-white" /></div>
                  <div>
                    <h2 className="font-bold text-gray-900 sora">What type of visit?</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Choose the purpose of your appointment</p>
                  </div>
                </div>
              </div>
              <div className="card-body space-y-3">
                <TypeCard selected={reason === "checkup"} onClick={() => setReason("checkup")} accent="green"
                  icon={<Stethoscope className="w-6 h-6 text-white" />}
                  title="General Checkup"
                  subtitle="Routine examination of your livestock. Ideal for wellness checks, vaccinations, and general health assessments." />
                <TypeCard selected={reason === "prediction"} onClick={() => setReason("prediction")} accent="blue" badge="AI · ML"
                  icon={<Brain className="w-6 h-6 text-white" />}
                  title="AI Prediction Follow-up"
                  subtitle="Review of an AI-generated disease prediction with a qualified vet. Attach your latest animal report for analysis." />
              </div>
            </div>

            {reason === "prediction" && (
              <div className="card overflow-hidden animate-fadeIn">
                <div className="card-header">
                  <div className="card-icon-header">
                    <div className="card-icon-wrap card-icon-blue"><FileText className="w-5 h-5 text-white" /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 sora text-sm">Link a Report</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Optional — attach the relevant ML report</p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <select className="select-field" value={reportId}
                    onChange={e => setReportId(Number(e.target.value) || "")}>
                    <option value="">No report selected</option>
                    {reports.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.animal_type ? `${r.animal_type} Report` : `Report #${r.id}`}
                        {r.created_at && ` (${new Date(r.created_at).toLocaleDateString()})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: Provider ── */}
        {step === 1 && (
          <div className="card overflow-hidden animate-fadeIn">
            <div className="card-header">
              <div className="card-icon-header">
                <div className="card-icon-wrap card-icon-green"><User className="w-5 h-5 text-white" /></div>
                <div>
                  <h2 className="font-bold text-gray-900 sora">Choose a Provider</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Select a vet or agrovet near you</p>
                </div>
              </div>
            </div>
            <div className="card-body space-y-3">
              {geoLoading ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <p className="text-sm text-green-700 font-medium">Finding nearby providers…</p>
                </div>
              ) : farmerLocation ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 font-medium">
                    Showing <strong>{providers.length}</strong> provider{providers.length !== 1 ? "s" : ""} near you
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-700">Location unavailable — enable location for nearby results</p>
                </div>
              )}

              {geoLoading ? (
                <div className="space-y-2.5">{[1, 2, 3].map(i => <ProviderSkeleton key={i} />)}</div>
              ) : (
                <div className="space-y-2.5">
                  <ProviderCard provider={null} selected={providerId === null} onClick={() => setProviderId(null)} />
                  {providers.map(p => (
                    <ProviderCard key={p.id} provider={p} selected={providerId === p.id}
                      onClick={() => setProviderId(p.id)} />
                  ))}
                  {providers.length === 0 && (
                    <div className="empty-state py-8">
                      <div className="empty-state-icon"><User className="w-6 h-6" /></div>
                      <h3 className="empty-state-title text-sm">No providers found nearby</h3>
                      <p className="empty-state-sub text-xs">We'll assign the nearest available provider</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Schedule ── */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">

            {/* Date card — red ring if still missing after a failed Continue attempt */}
            <div className={`card overflow-hidden transition-all ${!selectedDate && stepError ? "ring-2 ring-red-400" : ""}`}>
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-green"><Calendar className="w-5 h-5 text-white" /></div>
                  <div>
                    <h2 className="font-bold text-gray-900 sora">Select Date</h2>
                    <p className={`text-xs mt-0.5 transition-colors ${!selectedDate && stepError ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      {selectedDate
                        ? selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
                        : "Pick your preferred date"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <InlineCalendar value={selectedDate} onChange={setSelectedDate} />
              </div>
            </div>

            {/* Time card — red ring if still missing after a failed Continue attempt */}
            <div className={`card overflow-hidden transition-all ${!selectedTime && stepError ? "ring-2 ring-red-400" : ""}`}>
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-blue"><Clock className="w-5 h-5 text-white" /></div>
                  <div>
                    <h2 className="font-bold text-gray-900 sora">Select Time</h2>
                    <p className={`text-xs mt-0.5 transition-colors ${!selectedTime && stepError ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      {selectedTime ? selectedTime : "Choose an available slot"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} type="button" onClick={() => setSelectedTime(slot)}
                      className={`rounded-xl py-2 text-xs font-semibold transition-all duration-150 border-2
                        ${selectedTime === slot
                          ? "border-green-500 bg-green-600 text-white shadow-md"
                          : "border-gray-100 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Related Report (optional) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" /> Related Report (Optional)
              </label>
              <select className="select-field" value={reportId}
                onChange={(e) => setReportId(Number(e.target.value) || "")}>
                <option value="">No report selected</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.animal_type ? `${r.animal_type} Report` : `Report #${r.id}`}
                    {r.symptom_text && ` - ${r.symptom_text.length > 40
                      ? r.symptom_text.slice(0, 40) + "..." : r.symptom_text}`}
                    {r.created_at && ` (${new Date(r.created_at).toLocaleDateString()})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="alert-card alert-card-blue">
              <div className="alert-card-icon bg-blue-100"><MapPin className="w-5 h-5 text-blue-600" /></div>
              <div>
                <h4 className="text-sm font-bold text-blue-900">Appointment Note</h4>
                <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                  Subject to provider availability. You'll receive a notification once the provider accepts.
                  {farmerLocation && " Your location will be shared to help plan the farm visit."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div className="card overflow-hidden animate-fadeIn">
            <div className="card-header">
              <div className="card-icon-header">
                <div className="card-icon-wrap card-icon-green"><CheckCircle className="w-5 h-5 text-white" /></div>
                <div>
                  <h2 className="font-bold text-gray-900 sora">Review &amp; Confirm</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Check the details before booking</p>
                </div>
              </div>
            </div>
            <div className="card-body space-y-4">
              {[
                { icon: <Stethoscope className="w-4 h-4 text-green-600" />, label: "Visit Type",
                  value: reason === "checkup" ? "General Checkup" : "AI Prediction Follow-up" },
                { icon: <User className="w-4 h-4 text-green-600" />, label: "Provider",
                  value: selectedProvider ? selectedProvider.name : "No preference (auto-assign)" },
                { icon: <Calendar className="w-4 h-4 text-green-600" />, label: "Date", value: displayDate },
                { icon: <Clock className="w-4 h-4 text-green-600" />,    label: "Time", value: selectedTime || "—" },
                ...(selectedReport ? [{
                  icon: <FileText className="w-4 h-4 text-green-600" />, label: "Linked Report",
                  value: selectedReport.animal_type
                    ? `${selectedReport.animal_type} Report`
                    : `Report #${selectedReport.id}`,
                }] : []),
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                  </div>
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INLINE STEP ERROR BANNER ──
             Appears below the active step when validation fails or the API
             returns an error. Auto-cleared when the user corrects the issue. */}
        {stepError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{stepError}</p>
          </div>
        )}

        {/* ── Nav buttons ── */}
        <div className="flex items-center justify-between pt-2 pb-6">
          {step > 0 ? (
            <button type="button" onClick={prev}
              className="btn btn-outline btn-sm flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            /* FIX: the old `disabled={!canNext}` silently blocked the button with
               no explanation. Continue is always enabled — validation runs inside
               next() and surfaces the specific error via the banner above. */
            <button type="button" onClick={next}
              className="btn btn-primary flex items-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="btn btn-primary btn-lg flex items-center gap-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</>
                : <><CheckCircle className="w-4 h-4" /> Confirm Appointment</>
              }
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}