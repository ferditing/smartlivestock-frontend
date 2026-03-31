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
 * • All original API calls/logic preserved unchanged
 */

import React, { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";
import Layout from "../../components/Layout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  Calendar, Clock, User, FileText, Loader2, MapPin,
  CheckCircle, ChevronRight, ChevronLeft, Stethoscope,
  Brain, Star, Navigation, AlertCircle, Check, Sparkles,
} from "lucide-react";

/* ─── Types ────────────────────────────────────────────────────── */
type Provider = {
  id: number; name: string; type?: string;
  distance?: number; specialty?: string; rating?: number;
};
type Report   = { id: number; title?: string; animal_name?: string };
type Reason   = "checkup" | "prediction";
type Step     = 0 | 1 | 2 | 3;

/* ─── Calendar helpers ─────────────────────────────────────────── */
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function buildDays(year: number, month: number) {
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
}

/* ─── Time slots 09:00 – 17:00 ─────────────────────────────────── */
const TIME_SLOTS: string[] = [];
for (let h = 9; h <= 17; h++) {
  for (const m of [0, 30]) {
    if (h === 17 && m > 0) break;
    TIME_SLOTS.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
  }
}

/* ════════════════════════════════════
   INLINE CALENDAR
════════════════════════════════════ */
function InlineCalendar({ value, onChange }: { value: Date | null; onChange: (d: Date) => void }) {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const days = buildDays(view.year, view.month);

  const isToday    = (d: number) => d === today.getDate() && view.month === today.getMonth() && view.year === today.getFullYear();
  const isPast     = (d: number) => new Date(view.year, view.month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isSelected = (d: number) => value && value.getDate() === d && value.getMonth() === view.month && value.getFullYear() === view.year;

  const prevMonth = () => setView(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const nextMonth = () => setView(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow:"var(--shadow-sm)" }}>
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button type="button" onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-gray-900 sora">{MONTH_NAMES[view.month]} {view.year}</span>
        <button type="button" onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-gray-500">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        {/* day names */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
          ))}
        </div>
        {/* day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (d === null) return <div key={"b" + i} />;
            const past  = isPast(d);
            const sel   = isSelected(d);
            const tod   = isToday(d);
            return (
              <button key={d} type="button" disabled={past}
                onClick={() => onChange(new Date(view.year, view.month, d))}
                className={[
                  "relative w-full aspect-square flex items-center justify-center text-sm font-semibold rounded-xl transition-all duration-150",
                  past  ? "text-gray-300 cursor-not-allowed"                                      : "cursor-pointer",
                  sel   ? "bg-green-600 text-white shadow-md hover:bg-green-700"                  : "",
                  !sel && !past ? "hover:bg-green-50 hover:text-green-700"                        : "",
                  tod && !sel   ? "ring-2 ring-green-400 ring-offset-1 text-green-700 font-bold"  : "",
                ].filter(Boolean).join(" ")}>
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   STEP BAR
════════════════════════════════════ */
const STEP_LABELS = ["Type", "Provider", "Schedule", "Review"];

function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center mb-8">
      {STEP_LABELS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5 z-10 relative">
              <div className={[
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                done   ? "bg-green-600 text-white shadow-md"                                   : "",
                active ? "bg-green-600 text-white scale-110"                                   : "",
                !done && !active ? "bg-gray-100 text-gray-400"                                 : "",
              ].filter(Boolean).join(" ")}
                style={active ? { boxShadow:"0 0 0 4px rgba(22,163,74,.2), 0 4px 12px rgba(22,163,74,.3)" } : undefined}>
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={[
                "text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                active ? "text-green-700" : done ? "text-green-600" : "text-gray-400",
              ].join(" ")}>{label}</span>
            </div>

            {i < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 -mt-5 relative">
                <div className="absolute inset-0 bg-gray-200 rounded-full" />
                <div className="absolute inset-0 bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: i < current ? "100%" : "0%" }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════
   TYPE CARD
════════════════════════════════════ */
function TypeCard({ selected, onClick, icon, title, subtitle, accent, badge }: {
  selected: boolean; onClick: () => void; icon: React.ReactNode;
  title: string; subtitle: string; accent: "green" | "blue"; badge?: string;
}) {
  const s = accent === "green"
    ? { ring:"border-green-500 from-green-50 to-emerald-50", grad:"from-green-500 to-green-700", title:"text-green-800", dot:"bg-green-600" }
    : { ring:"border-blue-500 from-blue-50 to-indigo-50", grad:"from-blue-500 to-indigo-600", title:"text-blue-800", dot:"bg-blue-600" };

  return (
    <button type="button" onClick={onClick}
      className={[
        "relative w-full p-5 rounded-2xl border-2 text-left transition-all duration-200",
        selected ? `${s.ring} bg-gradient-to-br shadow-md` : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm",
      ].join(" ")}>
      {badge && (
        <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${s.grad}`}
          style={{ boxShadow:"0 2px 8px rgba(0,0,0,.15)" }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold sora text-sm ${selected ? s.title : "text-gray-900"}`}>{title}</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{subtitle}</p>
        </div>
        {selected && (
          <div className={`w-6 h-6 rounded-full ${s.dot} flex items-center justify-center flex-shrink-0 flex-shrink-0 mt-0.5`}>
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

/* ════════════════════════════════════
   PROVIDER CARD
════════════════════════════════════ */
function ProviderCard({ provider, selected, onClick }: {
  provider: Provider | null; selected: boolean; onClick: () => void;
}) {
  const base = "w-full p-4 rounded-2xl border-2 text-left transition-all duration-200";
  const sel  = "border-green-500 bg-green-50 shadow-md";
  const unsel = "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm";

  if (!provider) {
    return (
      <button type="button" onClick={onClick}
        className={`${base} ${selected ? sel : unsel} flex items-center gap-4`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-gray-900 sora">Any Available Provider</p>
          <p className="text-xs text-gray-500 mt-0.5">First matching vet or agrovet will be assigned</p>
        </div>
        {selected && <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>}
      </button>
    );
  }

  const initials = provider.name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
  const distKm   = provider.distance ? (provider.distance / 1000).toFixed(1) : null;

  return (
    <button type="button" onClick={onClick}
      className={`${base} ${selected ? sel : unsel}`}>
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-sm font-bold sora">
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-sm text-gray-900 sora">{provider.name}</span>
            {provider.type && (
              <span className="text-[9px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                {provider.type}
              </span>
            )}
          </div>
          {provider.specialty && <p className="text-xs text-gray-500 mt-0.5">{provider.specialty}</p>}
          <div className="flex items-center gap-3 mt-1">
            {distKm && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Navigation className="w-3 h-3" /> {distKm} km
              </span>
            )}
            {provider.rating && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" /> {provider.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

/* ════════════════════════════════════
   SKELETON
════════════════════════════════════ */
function ProviderSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 p-4 bg-white flex items-start gap-3">
      <div className="w-11 h-11 bg-gray-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════ */
export default function BookAppointment() {
  const [step, setStep]               = useState<Step>(0);
  const [reason, setReason]           = useState<Reason>("checkup");
  const [providerId, setProviderId]   = useState<number | null>(null);
  const [reportId, setReportId]       = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading]         = useState(false);
  const [geoLoading, setGeoLoading]   = useState(false);
  const [providers, setProviders]     = useState<Provider[]>([]);
  const [reports, setReports]         = useState<Report[]>([]);
  const [farmerLocation, setFarmerLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { addToast }   = useToast();

  /* ── Data loading ── */
  useEffect(() => {
    axios.get("/reports/my").then(r => setReports(r.data)).catch(() => {});
    const pParam = searchParams.get("provider");
    if (pParam) { const n = Number(pParam); if (!isNaN(n)) setProviderId(n); }
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

  /* ── Navigation ── */
  const canNext = step !== 2 || (!!selectedDate && !!selectedTime);
  const next = () => { if (step < 3) setStep(s => (s + 1) as Step); };
  const prev = () => { if (step > 0) setStep(s => (s - 1) as Step); };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!scheduledAt) { addToast("error", "Validation", "Please select a date and time"); return; }
    setLoading(true);

    const doSubmit = async (loc: { lat: number; lng: number } | null) => {
      try {
        const payload: Record<string, any> = {
          provider_id: providerId ?? null,
          scheduled_at: scheduledAt,
          reason,
        };
        if (reportId) payload.report_id = reportId;
        if (loc) { payload.farmer_lat = loc.lat; payload.farmer_lng = loc.lng; }
        await axios.post("/appointments", payload);
        addToast("success", "Booked!", "Your appointment has been confirmed.");
        navigate("/farmer/appointments");
      } catch (err: any) {
        addToast("error", "Booking Failed", err?.response?.data?.error || "Failed to book appointment");
      } finally { setLoading(false); }
    };

    if (navigator.geolocation && !farmerLocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doSubmit({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        ()  => doSubmit(null)
      );
    } else {
      await doSubmit(farmerLocation);
    }
  };

  /* ── Display values for review ── */
  const selectedProvider = providers.find(p => p.id === providerId);
  const selectedReport   = reports.find(r => r.id === reportId);
  const displayDate      = selectedDate
    ? selectedDate.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
    : "—";

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <Layout role="farmer">
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeInUp">

        {/* header */}
        <div>
          <h1 className="page-title">Book Appointment</h1>
          <p className="page-sub">Schedule a veterinary visit in a few simple steps</p>
        </div>

        {/* step bar */}
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
                        {r.title || `Report #${r.id}`}{r.animal_name && ` — ${r.animal_name}`}
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
              {/* Geo status */}
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

              {/* Provider list */}
              {geoLoading ? (
                <div className="space-y-2.5">{[1,2,3].map(i => <ProviderSkeleton key={i} />)}</div>
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
            {/* Date */}
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-green"><Calendar className="w-5 h-5 text-white" /></div>
                  <div>
                    <h2 className="font-bold text-gray-900 sora">Select Date</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedDate
                        ? selectedDate.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" })
                        : "Pick your preferred date"
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5">
                <InlineCalendar value={selectedDate} onChange={setSelectedDate} />
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="card overflow-hidden animate-fadeIn">
                <div className="card-header">
                  <div className="card-icon-header">
                    <div className="card-icon-wrap card-icon-blue"><Clock className="w-5 h-5 text-white" /></div>
                    <div>
                      <h2 className="font-bold text-gray-900 sora">Select Time</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {selectedTime ? `Appointment at ${selectedTime}` : "Choose an available slot"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {TIME_SLOTS.map(slot => (
                      <button key={slot} type="button" onClick={() => setSelectedTime(slot)}
                        className={[
                          "py-2 text-xs font-bold rounded-xl border transition-all duration-150",
                          selectedTime === slot
                            ? "bg-green-600 text-white border-green-600 shadow-md"
                            : "border-gray-100 text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700",
                        ].join(" ")}>
                        {slot}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-4">
                    Available: 09:00 – 17:00 · Mon – Sat
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="card overflow-hidden">
              <div className="card-header">
                <div className="card-icon-header">
                  <div className="card-icon-wrap card-icon-green"><Sparkles className="w-5 h-5 text-white" /></div>
                  <div>
                    <h2 className="font-bold text-gray-900 sora">Review & Confirm</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Check your details before confirming</p>
                  </div>
                </div>
              </div>

              <div className="card-body divide-y divide-gray-50 space-y-0">
                {[
                  { label:"Appointment Type", icon:<Stethoscope className="w-4 h-4 text-green-600" />,  bg:"bg-green-100",
                    value: reason === "checkup" ? "General Checkup" : "AI Prediction Follow-up",
                    sub: reason === "prediction" && selectedReport ? `Linked: ${selectedReport.title || `Report #${selectedReport.id}`}` : undefined },
                  { label:"Provider",         icon:<User className="w-4 h-4 text-blue-600" />,          bg:"bg-blue-100",
                    value: selectedProvider ? selectedProvider.name : "Any available provider",
                    sub: selectedProvider?.type },
                  { label:"Date",             icon:<Calendar className="w-4 h-4 text-purple-600" />,    bg:"bg-purple-100", value: displayDate },
                  { label:"Time",             icon:<Clock className="w-4 h-4 text-amber-600" />,        bg:"bg-amber-100",  value: selectedTime || "—" },
                ].map(row => (
                  <div key={row.label} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${row.bg}`}>{row.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{row.label}</p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">{row.value}</p>
                      {row.sub && <p className="text-xs text-gray-500 mt-0.5">{row.sub}</p>}
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5 flex-shrink-0" />
                  </div>
                ))}
              </div>
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

        {/* ── Nav buttons ── */}
        <div className="flex items-center justify-between pt-2 pb-6">
          {step > 0 ? (
            <button type="button" onClick={prev}
              className="btn btn-outline btn-sm flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button type="button" onClick={next} disabled={!canNext}
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