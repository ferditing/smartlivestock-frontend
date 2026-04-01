/**
 * SmartLivestock — Landing Page (Full Redesign v2)
 * ─────────────────────────────────────────────────
 * NEW vs original:
 *  • Navbar popup dropdowns (Product / Services)
 *  • Sub-county Administration section (restored + improved with images)
 *  • Contact section with form + info cards + image
 *  • Shared design system (DS tokens) used across Login/Register/SetPassword
 *  • Scroll-to-top button, hero progress bar, stat count-up
 *  • All sections have images, consistent green-primary theme
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu, X, PawPrint, CloudRain, MapPin, ShoppingBag, Stethoscope,
  ChevronLeft, ChevronRight, ChevronDown, Users, TrendingUp, Shield, Clock,
  CheckCircle, Star, Smartphone, Package, Award, Brain, Zap, Globe,
  BarChart, PieChart, LineChart, Activity, FileText, ArrowUp,
  Mail, Phone, MessageSquare, Send, ExternalLink,
} from "lucide-react";
import kenyaLocations from "../data/kenya_locations_complete3.json";
import { KENYA_COUNTY_COORDINATES, WMO_WEATHER_LABELS } from "../data/kenya_county_coordinates";

type HeroAnimation = "fade" | "slideRight" | "slideLeft" | "zoom";

// ─── Shared Design System styles (also imported in Login/Register/SetPassword) ───
export const SHARED_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Sora:wght@400;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body, * { font-family: 'Plus Jakarta Sans', sans-serif; }
h1, h2, h3, .sora { font-family: 'Sora', sans-serif !important; }

:root {
  --green: #16a34a; --green-dark: #15803d; --green-xdark: #14532d;
  --green-light: #dcfce7; --emerald: #059669;
}

/* Buttons */
.btn { display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;font-weight:600;border-radius:0.875rem;transition:all 0.2s;cursor:pointer; }
.btn-primary { background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;box-shadow:0 4px 14px rgba(22,163,74,.28); }
.btn-primary:hover { transform:translateY(-1px);box-shadow:0 8px 22px rgba(22,163,74,.38); }
.btn-primary:disabled { opacity:0.65;cursor:not-allowed;transform:none; }
.btn-white { background:white;color:#15803d;box-shadow:0 4px 14px rgba(0,0,0,.12); }
.btn-white:hover { background:#f0fdf4;transform:translateY(-1px); }
.btn-ghost { background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:white;backdrop-filter:blur(8px); }
.btn-ghost:hover { background:rgba(255,255,255,.22); }
.btn-outline-green { border:2px solid #16a34a;color:#16a34a;background:transparent; }
.btn-outline-green:hover { background:#f0fdf4; }
.btn-outline-white { border:2px solid rgba(255,255,255,.6);color:white;background:transparent; }
.btn-outline-white:hover { background:rgba(255,255,255,.1); }

/* Inputs */
.input-field { width:100%;padding:0.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:0.75rem;font-size:0.9375rem;color:#111827;background:white;transition:all 0.2s;outline:none; }
.input-field:focus { border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.11); }
.input-field::placeholder { color:#9ca3af; }
.input-field:disabled { background:#f9fafb;opacity:.7;cursor:not-allowed; }
textarea.input-field { resize:vertical; }
.select-field { width:100%;padding:0.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:0.75rem;font-size:0.9375rem;color:#111827;background:white;transition:all 0.2s;outline:none;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 1rem center;padding-right:2.5rem; }
.select-field:focus { border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.11); }

/* Cards */
.card { background:white;border:1.5px solid #f3f4f6;border-radius:1.25rem;overflow:hidden; }
.card-header { padding:1.5rem 2rem;border-bottom:1px solid #f3f4f6; }
.card-body { padding:2rem; }
.card-footer { padding:1.25rem 2rem;background:#f9fafb;border-top:1px solid #f3f4f6; }
.glow-card:hover { box-shadow:0 0 0 1.5px #bbf7d0,0 20px 55px -10px rgba(22,163,74,.1); }

/* Animations */
@keyframes fadeInUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
@keyframes heroFade { from{opacity:0}to{opacity:1} }
@keyframes heroSlideR { from{opacity:0;transform:translateX(55px)}to{opacity:1;transform:translateX(0)} }
@keyframes heroSlideL { from{opacity:0;transform:translateX(-55px)}to{opacity:1;transform:translateX(0)} }
@keyframes heroZoom { from{opacity:0;transform:scale(1.07)}to{opacity:1;transform:scale(1)} }
@keyframes contentUp { from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)} }
@keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)} }
@keyframes blob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
@keyframes shimmer { from{background-position:-400px 0}to{background-position:400px 0} }
@keyframes pulseDot { 0%,100%{opacity:1}50%{opacity:.3} }
@keyframes gradShift { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }

.animate-fadeInUp { animation:fadeInUp 0.6s ease both; }
.hero-fade { animation:heroFade 0.8s ease forwards; }
.hero-slideRight { animation:heroSlideR 0.8s ease forwards; }
.hero-slideLeft { animation:heroSlideL 0.8s ease forwards; }
.hero-zoom { animation:heroZoom 0.9s ease forwards; }
.hero-content { animation:contentUp 0.7s ease 0.15s both; }
.hero-content-d1 { animation:contentUp 0.7s ease 0.3s both; }
.hero-content-d2 { animation:contentUp 0.7s ease 0.45s both; }
.blob-anim { animation:blob 8s ease-in-out infinite; }
.float-anim { animation:float 6s ease-in-out infinite; }
.dropdown-anim { animation:slideDown 0.2s ease both; }
.spin-anim { animation:spin 0.8s linear infinite; }

.shimmer-bg { background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:800px 100%;animation:shimmer 1.5s infinite; }
.nav-link::after { content:'';display:block;height:2px;background:#16a34a;border-radius:2px;width:0;transition:width .25s ease; }
.nav-link:hover::after { width:100%; }
.hero-progress { height:3px;background:linear-gradient(90deg,#16a34a,#34d399);transition:width .1s linear;box-shadow:0 0 8px rgba(22,163,74,.5); }
.step-connector::after { content:'';position:absolute;top:3rem;left:calc(50% + 3rem);width:calc(100% - 6rem);height:2px;background:linear-gradient(90deg,#16a34a,#d1fae5);border-radius:2px; }
@media(max-width:767px){.step-connector::after{display:none}}
.cta-grad { background:linear-gradient(135deg,#14532d,#166534,#15803d,#16a34a,#065f46);background-size:300% 300%;animation:gradShift 8s ease infinite; }

/* Auth panel */
.auth-side { background:linear-gradient(145deg,#14532d 0%,#166534 45%,#059669 100%); }
`;

// ─── Data ─────────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  { title: "Smart Livestock Management", subtitle: "Track health, orders, and vets in one place.", image: "https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1920", caption: "Modern farming made simple", animation: "fade" as HeroAnimation, accent: "#16a34a" },
  { title: "Agrovet Marketplace", subtitle: "Order from shops near you. Pay per shop, securely.", image: "https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=1920", caption: "Connect with local suppliers", animation: "slideRight" as HeroAnimation, accent: "#d97706" },
  { title: "Veterinary Care & Reports", subtitle: "Book appointments and get expert advice.", image: "https://images.pexels.com/photos/6131613/pexels-photo-6131613.jpeg?auto=compress&cs=tinysrgb&w=1920", caption: "Professional care for your livestock", animation: "slideLeft" as HeroAnimation, accent: "#2563eb" },
  { title: "Weather-Aware Farming", subtitle: "Plan grazing and treatments using real-time county weather.", image: "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920", caption: "Plan with confidence", animation: "zoom" as HeroAnimation, accent: "#0891b2" },
  { title: "Join SmartLivestock Today", subtitle: "Free to start. No credit card. Get going in minutes.", image: "https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=1920", caption: "Start your journey", animation: "fade" as HeroAnimation, accent: "#16a34a" },
];

const STATS = [
  { label: "Active Farmers", value: 2500, suffix: "+", icon: Users },
  { label: "Registered Vets", value: 150, suffix: "+", icon: Stethoscope },
  { label: "Agrovet Shops", value: 300, suffix: "+", icon: ShoppingBag },
  { label: "Orders Completed", value: 10000, suffix: "+", icon: Package },
];

const TESTIMONIALS = [
  { name: "James Mwangi", role: "Dairy Farmer, Nakuru", image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400", text: "SmartLivestock transformed how I manage my farm. I can track all cattle health records and order supplies without leaving the farm.", rating: 5, badge: "Verified Farmer" },
  { name: "Dr. Sarah Kimani", role: "Veterinarian, Nairobi", image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400", text: "The platform makes it easy to connect with farmers and manage appointments. Digital health records are a game changer for my practice.", rating: 5, badge: "Verified Vet" },
  { name: "Peter Ochieng", role: "Agrovet Owner, Kisumu", image: "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400", text: "My sales have increased by 40% since joining. The platform connects me with farmers in my area who need my products.", rating: 4, badge: "Verified Agrovet" },
];

const BENEFITS_TABS = [
  { label: "Farmers", icon: PawPrint, iconBg: "bg-green-600", check: "text-green-600", grad: "from-green-50 to-emerald-50", border: "border-green-100", active: "bg-green-600", items: ["Track all livestock health records", "Order supplies from nearby shops", "Book vet appointments easily", "Get weather forecasts for your area", "Monitor farm expenses and income"] },
  { label: "Veterinarians", icon: Stethoscope, iconBg: "bg-blue-600", check: "text-blue-600", grad: "from-blue-50 to-cyan-50", border: "border-blue-100", active: "bg-blue-600", items: ["Manage appointments and schedules", "Digital health records and reports", "Connect with farmers in your area", "Track treatment history", "Send prescriptions digitally"] },
  { label: "Agrovets", icon: ShoppingBag, iconBg: "bg-amber-600", check: "text-amber-600", grad: "from-amber-50 to-orange-50", border: "border-amber-100", active: "bg-amber-600", items: ["List products and manage inventory", "Reach farmers in your area", "Secure payment processing", "Track orders and deliveries", "Build your customer base"] },
];

const NAV_MENUS: Record<string, { label: string; href: string; icon: React.ElementType; desc: string }[]> = {
  Product: [
    { label: "About SmartLivestock", href: "#about", icon: PawPrint, desc: "Our mission and platform overview" },
    { label: "Features", href: "#features", icon: Zap, desc: "AI, inventory, marketplace & more" },
    { label: "Benefits", href: "#benefits", icon: CheckCircle, desc: "For farmers, vets & agrovets" },
    { label: "Modern Platform", href: "#platform", icon: Brain, desc: "Technology and capabilities" },
  ],
  Services: [
    { label: "Sub-county Admin", href: "#subadmin", icon: BarChart, desc: "County officer dashboard" },
    { label: "Weather & Planning", href: "#weather", icon: CloudRain, desc: "6-day county forecasts" },
    { label: "How It Works", href: "#how-it-works", icon: TrendingUp, desc: "Get started in 3 steps" },
    { label: "Testimonials", href: "#testimonials", icon: Star, desc: "Stories from our community" },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const getWeatherEmoji = (code?: number) => {
  if (code == null) return "🌤️";
  if (code === 0) return "☀️"; if (code <= 2) return "⛅"; if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️"; if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️"; if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️"; if (code >= 95) return "⛈️";
  return "🌤️";
};

function useCountUp(target: number, active: boolean, dur = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0; const step = target / 55; const interval = dur / 55;
    const t = setInterval(() => { cur += step; if (cur >= target) { setN(target); clearInterval(t); } else setN(Math.floor(cur)); }, interval);
    return () => clearInterval(t);
  }, [active, target, dur]);
  return n;
}

// ─── Sub-components ────────────────────────────────────────────────────────

function BenefitsTabs() {
  const [active, setActive] = useState(0);
  const t = BENEFITS_TABS[active];
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex rounded-2xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        {BENEFITS_TABS.map((tab, i) => (
          <button key={tab.label} type="button" onClick={() => setActive(i)}
            className={`flex-1 py-3 text-sm font-semibold transition-all focus-visible:outline-none ${active === i ? `${tab.active} text-white` : "text-gray-500 hover:bg-gray-50"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className={`bg-gradient-to-br ${t.grad} rounded-2xl p-8 border ${t.border}`}>
        <div className={`w-16 h-16 ${t.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}><t.icon className="w-8 h-8 text-white" /></div>
        <ul className="space-y-3">
          {t.items.map(item => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 ${t.check} flex-shrink-0 mt-0.5`} />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ stat, active }: { stat: typeof STATS[0]; active: boolean }) {
  const count = useCountUp(stat.value, active);
  const display = count >= 1000 ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k` : count.toString();
  return (
    <div className="text-center group">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 transition-transform group-hover:scale-110">
        <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </div>
      <div className="text-3xl sm:text-4xl font-bold text-white mb-1 tabular-nums sora">{display}{stat.suffix}</div>
      <div className="text-green-100 text-sm">{stat.label}</div>
    </div>
  );
}

function NavDropdown({ label, items }: { label: string; items: { label: string; href: string; icon: React.ElementType; desc: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="nav-link flex items-center gap-1 text-gray-600 hover:text-green-600 font-medium text-sm pb-0.5 transition-colors focus-visible:outline-none">
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180 text-green-600" : ""}`} />
      </button>
      {open && (
        <div className="dropdown-anim absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="p-2">
            {items.map(item => {
              const Icon = item.icon;
              return (
                <a key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition group">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-200 transition">
                    <Icon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </a>
              );
            })}
          </div>
          <div className="border-t border-gray-50 p-2">
            <Link to="/register" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition">
              <Zap className="w-3.5 h-3.5" /> Get started free
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();

  const [navOpen, setNavOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [slide, setSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTesti, setActiveTesti] = useState(0);
  const [weatherCounty, setWeatherCounty] = useState("NAIROBI");
  const [weather, setWeather] = useState<{ temp?: number; code?: number; desc?: string; daily?: { date: string; max: number; min: number; code: number }[] } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [geoWeather, setGeoWeather] = useState<{ temp?: number; code?: number; desc?: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      const dest = { admin: "/admin", subadmin: "/subadmin", farmer: "/farmer", vet: "/vet" }[role] || "/agrovet";
      navigate(dest, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fn = () => { setNavScrolled(window.scrollY > 20); setShowScrollTop(window.scrollY > 500); };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsInView(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (heroPaused) return;
    const DUR = 5500; let start: number; let raf: number;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min(((ts - start) / DUR) * 100, 100);
      setProgress(pct);
      if (pct >= 100) { setSlide(s => (s + 1) % HERO_SLIDES.length); start = ts; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [heroPaused, slide]);

  useEffect(() => {
    const t = setInterval(() => setActiveTesti(a => (a + 1) % TESTIMONIALS.length), 6500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const coords = KENYA_COUNTY_COORDINATES[weatherCounty] || KENYA_COUNTY_COORDINATES["NAIROBI"];
    if (!coords) return;
    setWeatherLoading(true);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Africa/Nairobi&forecast_days=7`)
      .then(r => r.json()).then(d => {
        const code = d.current?.weather_code ?? 0;
        setWeather({ temp: d.current?.temperature_2m, code, desc: WMO_WEATHER_LABELS[code] || "Clear", daily: (d.daily?.time ?? []).slice(0, 6).map((date: string, i: number) => ({ date, max: d.daily?.temperature_2m_max?.[i] ?? 0, min: d.daily?.temperature_2m_min?.[i] ?? 0, code: d.daily?.weather_code?.[i] ?? 0 })) });
      }).catch(() => setWeather(null)).finally(() => setWeatherLoading(false));
  }, [weatherCounty]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=Africa/Nairobi`)
          .then(r => r.json()).then(d => { const code = d.current?.weather_code ?? 0; setGeoWeather({ temp: d.current?.temperature_2m, code, desc: WMO_WEATHER_LABELS[code] || "Clear" }); })
          .catch(() => setGeoWeather(null)).finally(() => setGeoLoading(false));
      },
      () => setGeoLoading(false), { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const formatCounty = (k: string) => k.split(/[\s/]+/).map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  const changeSlide = useCallback((n: number) => { setSlide(n); setProgress(0); }, []);
  const cur = HERO_SLIDES[slide];

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault(); setContactSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setContactSending(false); setContactSent(true);
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-900">
      <style>{SHARED_STYLES}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${navScrolled ? "bg-white/98 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-white/95 backdrop-blur border-b border-gray-100/50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
              <PawPrint className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-gray-900 sora">SmartLivestock</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {Object.entries(NAV_MENUS).map(([label, items]) => (
              <div key={label} className="px-1.5"><NavDropdown label={label} items={items} /></div>
            ))}
            <a href="#contact" className="nav-link px-2 text-gray-600 hover:text-green-600 font-medium text-sm pb-0.5 transition-colors">Contact</a>
            <div className="w-px h-5 bg-gray-200 mx-2" />
            <Link to="/login" className="nav-link px-2 text-gray-600 hover:text-green-600 font-medium text-sm pb-0.5 transition-colors">Login</Link>
            <Link to="/register" className="btn btn-primary ml-1 px-5 py-2 text-sm rounded-xl">Register Free</Link>
          </div>

          <button type="button" className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition" onClick={() => setNavOpen(o => !o)} aria-label="Menu">
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${navOpen ? "max-h-[600px]" : "max-h-0"}`}>
          <div className="border-t border-gray-100 bg-white px-4 py-3">
            {Object.entries(NAV_MENUS).map(([group, items]) => (
              <div key={group} className="mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-2">{group}</p>
                {items.map(i => (
                  <a key={i.href} href={i.href} onClick={() => setNavOpen(false)}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-green-50 text-gray-700">
                    <i.icon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{i.label}</span>
                  </a>
                ))}
              </div>
            ))}
            <a href="#contact" onClick={() => setNavOpen(false)} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-green-50 text-gray-700">
              <Mail className="w-4 h-4 text-green-600" /><span className="text-sm font-medium">Contact</span>
            </a>
            <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-2">
              <Link to="/login" className="text-center py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-700 text-sm" onClick={() => setNavOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary py-2.5 text-sm rounded-xl text-center" onClick={() => setNavOpen(false)}>Register Free</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gray-900 min-h-[78vh] sm:min-h-[88vh] flex items-center justify-center"
        onMouseEnter={() => setHeroPaused(true)} onMouseLeave={() => setHeroPaused(false)}
        onKeyDown={e => { if (e.key === "ArrowLeft") changeSlide((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); if (e.key === "ArrowRight") changeSlide((slide + 1) % HERO_SLIDES.length); }}
        tabIndex={0} aria-label="Hero slideshow">
        <div key={slide} className={`absolute inset-0 hero-${cur.animation}`}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cur.image})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/60" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-20 blob-anim" style={{ background: cur.accent }} />
          <div className="absolute bottom-1/3 left-1/5 w-48 h-48 rounded-full blur-3xl opacity-15 blob-anim" style={{ background: "#10b981", animationDelay: "3s" }} />
        </div>

        <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-white/10">
          <div className="hero-progress" style={{ width: `${progress}%` }} />
        </div>

        <div className="relative z-10 px-4 w-full py-16 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl mx-auto">
            <div className="hero-content inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" style={{ animation: "pulseDot 1.5s ease infinite" }} />
              {cur.caption}
            </div>
            <h1 className="hero-content-d1 text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight sora drop-shadow-lg">{cur.title}</h1>
            <p className="hero-content-d2 text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">{cur.subtitle}</p>
            <div className="hero-content-d2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn btn-white px-8 py-3.5 text-base rounded-xl font-bold">Get started free →</Link>
              <a href="#features" className="btn btn-ghost px-8 py-3.5 text-base rounded-xl">Learn more</a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} type="button" onClick={() => changeSlide(i)}
              className={`transition-all duration-300 rounded-full ${i === slide ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/65"}`} />
          ))}
        </div>
        <button type="button" onClick={() => changeSlide((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 bg-black/25 hover:bg-black/45 text-white p-2.5 rounded-full transition backdrop-blur-sm border border-white/10"><ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /></button>
        <button type="button" onClick={() => changeSlide((slide + 1) % HERO_SLIDES.length)} className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 bg-black/25 hover:bg-black/45 text-white p-2.5 rounded-full transition backdrop-blur-sm border border-white/10"><ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" /></button>
        {heroPaused && <span className="absolute bottom-2 right-4 text-white/40 text-xs tracking-widest">PAUSED</span>}
      </section>

      {/* ══ ABOUT ═══════════════════════════════════════════════════════════ */}
      <section id="about" className="py-16 sm:py-24 px-4 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-5"><PawPrint className="w-4 h-4" /> About SmartLivestock</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight sora">One Platform for<br />Livestock Management</h2>
            <p className="text-gray-600 text-lg mb-5 leading-relaxed">SmartLivestock connects Kenyan farmers with veterinarians and agrovet suppliers. Report symptoms with AI-powered predictions, order supplies, and book vet appointments—all in one place.</p>
            <p className="text-gray-500 mb-7 leading-relaxed">Covering all 47 counties with weather forecasts to help plan grazing and treatments. Built mobile-first, works on any device.</p>
            <ul className="space-y-3 mb-8">
              {["AI-powered symptom analysis and disease prediction", "Integrated marketplace with M-Pesa & Paystack", "GPS-based discovery of vets and agrovets", "6-day county weather forecasts", "Full inventory management for your livestock"].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><CheckCircle className="w-3.5 h-3.5 text-green-600" /></div>
                  <span className="text-gray-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 flex-wrap">
              <Link to="/register" className="btn btn-primary px-6 py-3 rounded-xl text-sm">Get started free →</Link>
              <a href="#features" className="btn btn-outline-green px-6 py-3 rounded-xl text-sm">View features</a>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-gray-100 aspect-video">
              <img src="https://images.pexels.com/photos/2382904/pexels-photo-2382904.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Kenyan farmers using SmartLivestock" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-semibold mb-2"><Globe className="w-3.5 h-3.5" /> All 47 Counties Covered</div>
                <p className="text-white/80 text-sm">Mobile-first, fast, and easy to use across Kenya</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { src: "https://images.pexels.com/photos/247076/pexels-photo-247076.jpeg?auto=compress&cs=tinysrgb&w=800", label: "Health Tracking" },
                { src: "https://images.pexels.com/photos/4386329/pexels-photo-4386329.jpeg?auto=compress&cs=tinysrgb&w=800", label: "Vet Services" },
              ].map(img => (
                <div key={img.label} className="relative group rounded-xl overflow-hidden shadow-md border border-gray-100 h-36">
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <p className="absolute bottom-3 left-3 text-white text-xs font-semibold">{img.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════════════════ */}
      <div ref={statsRef} className="py-14 px-4 bg-gradient-to-r from-green-700 to-emerald-600">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(s => <StatCard key={s.label} stat={s} active={statsInView} />)}
        </div>
      </div>

      {/* ══ FEATURES ════════════════════════════════════════════════════════ */}
      <section id="features" className="py-16 sm:py-24 px-4 bg-gray-50 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4"><Zap className="w-4 h-4" /> Powerful Features</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sora">Everything You Need</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Built for farmers, veterinarians, and agrovet suppliers across Kenya</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "AI Symptom Analysis", desc: "Describe symptoms in plain text. Get instant disease predictions with confidence scores.", highlight: true },
              { icon: PawPrint, title: "Livestock Inventory", desc: "Add, edit, and manage all your animals. View and update records with professional modals.", highlight: false },
              { icon: ShoppingBag, title: "Agrovet Marketplace", desc: "Order medicines, feed, and supplies from verified shops. M-Pesa and Paystack payments.", highlight: false },
              { icon: Stethoscope, title: "Veterinary Services", desc: "Book appointments, get digital health records, and clinical reports.", highlight: false },
              { icon: MapPin, title: "Nearby Services Map", desc: "GPS-powered map shows vets and agrovets near you. Book or view with one click.", highlight: false },
              { icon: CloudRain, title: "Weather & Planning", desc: "6-day forecasts for all 47 counties. Plan grazing and treatments with real-time data.", highlight: false },
            ].map(f => (
              <div key={f.title} className={`glow-card rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 ${f.highlight ? "bg-gradient-to-br from-green-600 to-emerald-700 border-green-500 shadow-xl shadow-green-200/40" : "bg-white border-gray-100 hover:shadow-lg"}`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${f.highlight ? "bg-white/20" : "bg-green-100"}`}><f.icon className={`w-7 h-7 ${f.highlight ? "text-white" : "text-green-600"}`} /></div>
                <h3 className={`font-bold text-lg mb-3 ${f.highlight ? "text-white" : "text-gray-900"}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${f.highlight ? "text-green-100" : "text-gray-500"}`}>{f.desc}</p>
                {f.highlight && <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 bg-white/15 px-3 py-1.5 rounded-full"><Zap className="w-3.5 h-3.5" /> Most popular</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BENEFITS ════════════════════════════════════════════════════════ */}
      <section id="benefits" className="py-16 sm:py-24 px-4 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sora">Built for Everyone</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Tailored features for farmers, veterinarians, and agrovet suppliers</p>
          </div>
          <div className="lg:hidden"><BenefitsTabs /></div>
          <div className="hidden lg:grid grid-cols-3 gap-8">
            {BENEFITS_TABS.map(tab => (
              <div key={tab.label} className={`glow-card bg-gradient-to-br ${tab.grad} rounded-2xl p-8 border ${tab.border} transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-16 h-16 ${tab.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}><tab.icon className="w-8 h-8 text-white" /></div>
                <h3 className="text-2xl font-bold mb-5 text-gray-900 sora">For {tab.label}</h3>
                <ul className="space-y-3.5">
                  {tab.items.map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 ${tab.check} flex-shrink-0 mt-0.5`} />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SUB-COUNTY ADMIN ════════════════════════════════════════════════ */}
      <section id="subadmin" className="py-16 sm:py-24 px-4 bg-gradient-to-b from-emerald-50 via-white to-blue-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">Sub-county Administration</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sora">Sub-county Dashboard</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">A modern workspace for county officers to manage users, review disease signals, and approve service providers—scoped to their assigned county and coverage.</p>
          </div>

          {/* Main 2-col layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group h-96 lg:h-auto">
              <img src="https://images.pexels.com/photos/5905708/pexels-photo-5905708.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="County administration dashboard" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2 sora">County-Level Control</h3>
                  <p className="text-white/85">Manage all aspects of livestock services within your county boundaries</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {[
                { icon: Users, bg: "bg-emerald-100", color: "text-emerald-600", check: "text-emerald-600", title: "User Management", desc: "View, search, and manage farmers, veterinarians, and agrovets in your county. Suspend accounts when necessary.", checks: ["Sub-county and ward breakdown", "Role-based filtering and search"] },
                { icon: BarChart, bg: "bg-blue-100", color: "text-blue-600", check: "text-blue-600", title: "County Analytics", desc: "Comprehensive analytics with interactive charts showing symptom reports, diagnoses, and user distribution.", checks: ["Bar charts, pie charts, line graphs", "Real-time case monitoring"] },
                { icon: Shield, bg: "bg-amber-100", color: "text-amber-600", check: "text-amber-600", title: "Provider Approvals", desc: "Review and verify veterinarians and agrovets in your county. Confirm documents and approve applications.", checks: ["Document verification workflow", "License management"] },
              ].map(item => (
                <div key={item.title} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 glow-card">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}><item.icon className={`w-6 h-6 ${item.color}`} /></div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm mb-2">{item.desc}</p>
                      {item.checks.map(c => <div key={c} className="flex items-center gap-2 text-xs text-gray-600 mt-1"><CheckCircle className={`w-3.5 h-3.5 ${item.check}`} />{c}</div>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards with images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 glow-card group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <img src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Sub-county breakdown" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-700/80 to-transparent flex items-end p-4"><MapPin className="w-7 h-7 text-white" /></div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2">Sub-county Breakdown</h3>
                <p className="text-gray-500 text-sm mb-3">Interactive cards showing user distribution by sub-county and ward. Click to filter users instantly.</p>
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold"><Activity className="w-4 h-4" /> Real-time statistics</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 glow-card group hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center space-y-1">
                  <BarChart className="w-12 h-12 text-blue-500 mx-auto" />
                  <PieChart className="w-9 h-9 text-purple-500 mx-auto" />
                  <LineChart className="w-10 h-10 text-indigo-500 mx-auto" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2">Interactive Charts</h3>
                <p className="text-gray-500 text-sm mb-3">Bar graphs, pie charts, line graphs and histograms for comprehensive data analysis and disease tracking.</p>
                <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold"><Activity className="w-4 h-4" /> Live data insights</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 glow-card group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48">
                <img src="https://images.pexels.com/photos/5905712/pexels-photo-5905712.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Provider verification" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-700/80 to-transparent flex items-end p-4"><Shield className="w-7 h-7 text-white" /></div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2">Provider Verification</h3>
                <p className="text-gray-500 text-sm mb-3">Review documents, verify credentials, and approve service providers within your county jurisdiction.</p>
                <div className="flex items-center gap-2 text-sm text-amber-600 font-semibold"><FileText className="w-4 h-4" /> Secure workflow</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 sora">Ready to Manage Your County?</h3>
              <p className="text-gray-600 mb-6">County officer accounts are created by system administrators. Contact your admin to get started with sub-county management tools.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login" className="btn btn-primary px-7 py-3 rounded-xl text-sm"><Users className="w-4 h-4" /> Login as County Officer</Link>
                <a href="#contact" className="btn btn-outline-green px-7 py-3 rounded-xl text-sm"><Mail className="w-4 h-4" /> Contact Admin</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PLATFORM ════════════════════════════════════════════════════════ */}
      <section id="platform" className="py-16 sm:py-24 px-4 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4"><Brain className="w-4 h-4" /> Modern Technology</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sora">Built with Modern Features</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Cutting-edge tools to help you manage livestock efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "AI Health Predictions", desc: "ML models analyze symptom text and return predicted conditions with confidence scores.", bg: "#f3e8ff", color: "#7c3aed" },
              { icon: Zap, title: "Instant Reporting", desc: "Free-text or structured input. Reports sync to vets and trigger follow-ups.", bg: "#fef3c7", color: "#d97706" },
              { icon: MapPin, title: "Location-Aware", desc: "Geolocation finds nearby providers. Filter by vet or agrovet. All devices.", bg: "#dbeafe", color: "#2563eb" },
              { icon: CloudRain, title: "Weather Integration", desc: "County-level forecasts and 6-day outlook. Plan based on real conditions.", bg: "#cffafe", color: "#0891b2" },
            ].map(item => (
              <div key={item.title} className="glow-card bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:bg-white transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: item.bg }}>
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 bg-gray-50 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sora">How It Works</h2>
            <p className="text-gray-500 text-lg">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { step: "01", icon: Smartphone, title: "Register", desc: "Sign up as farmer, vet, or agrovet. Set your location to connect with nearby users.", img: "https://images.pexels.com/photos/6347/coffee-smartphone-desk-pen.jpg?auto=compress&cs=tinysrgb&w=600" },
              { step: "02", icon: Users, title: "Connect", desc: "Browse shops, book appointments, or list your products. Build your network.", img: "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=600" },
              { step: "03", icon: TrendingUp, title: "Grow", desc: "Manage orders, payments, and health records. Track your success over time.", img: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=600" },
            ].map((item, idx) => (
              <div key={item.step} className={`relative text-center ${idx < 2 ? "step-connector" : ""}`}>
                <div className="relative rounded-2xl overflow-hidden h-44 mb-5 shadow-lg group">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  <div className="absolute top-3 left-3 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold sora shadow">{idx + 1}</div>
                </div>
                <div className="text-xs font-bold text-green-500 tracking-widest mb-1">{item.step}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 sora">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-16 sm:py-24 px-4 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sora">Farmers Love SmartLivestock</h2>
            <p className="text-gray-500 text-lg">Real stories from our growing community</p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activeTesti * 100}%)` }}>
                {TESTIMONIALS.map(t => (
                  <div key={t.name} className="min-w-full px-2">
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 sm:p-10 max-w-2xl mx-auto">
                      <div className="flex gap-1 mb-5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-5 h-5 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />)}</div>
                      <blockquote className="text-gray-700 text-lg leading-relaxed mb-7 italic">"{t.text}"</blockquote>
                      <div className="flex items-center gap-4">
                        <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-green-100 shadow" loading="lazy" />
                        <div>
                          <p className="font-bold text-gray-900">{t.name}</p>
                          <p className="text-gray-500 text-sm">{t.role}</p>
                          <span className="inline-block text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1">{t.badge}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              {TESTIMONIALS.map((_, i) => <button key={i} type="button" onClick={() => setActiveTesti(i)} className={`rounded-full transition-all ${i === activeTesti ? "w-8 h-2.5 bg-green-600" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"}`} />)}
            </div>
            <button type="button" onClick={() => setActiveTesti((activeTesti - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="absolute left-0 top-1/2 -translate-y-10 -translate-x-3 bg-white shadow-md border border-gray-100 text-gray-600 hover:text-green-600 p-2 rounded-full transition hidden sm:block"><ChevronLeft className="w-5 h-5" /></button>
            <button type="button" onClick={() => setActiveTesti((activeTesti + 1) % TESTIMONIALS.length)} className="absolute right-0 top-1/2 -translate-y-10 translate-x-3 bg-white shadow-md border border-gray-100 text-gray-600 hover:text-green-600 p-2 rounded-full transition hidden sm:block"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </section>

      {/* ══ WEATHER ═════════════════════════════════════════════════════════ */}
      <section id="weather" className="py-16 sm:py-24 px-4 bg-gray-50 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4"><CloudRain className="w-4 h-4" /> Live Weather Data</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sora">Weather-Aware Farming</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">6-day forecasts for all 47 counties. Plan grazing and vet visits with confidence.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl border border-sky-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center"><CloudRain className="w-5 h-5 text-cyan-600" /></div>
                <div><h3 className="font-bold text-gray-900">County Weather</h3><p className="text-xs text-gray-500">Select a county to view forecast</p></div>
              </div>
              <select className="w-full border border-sky-200 bg-white rounded-xl px-4 py-3 text-sm font-medium text-gray-700 mb-5 focus:outline-none focus:ring-2 focus:ring-cyan-300" value={weatherCounty} onChange={e => setWeatherCounty(e.target.value)}>
                {Object.keys(KENYA_COUNTY_COORDINATES).sort().map(c => <option key={c} value={c}>{formatCounty(c)}</option>)}
              </select>
              {weatherLoading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="shimmer-bg h-10 rounded-xl" />)}</div>
              ) : weather ? (
                <>
                  <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-xl border border-sky-100">
                    <span className="text-5xl">{getWeatherEmoji(weather.code)}</span>
                    <div><p className="text-3xl font-bold text-gray-900">{Math.round(weather.temp ?? 0)}°C</p><p className="text-sm text-gray-500 capitalize">{weather.desc}</p></div>
                  </div>
                  {weather.daily && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {weather.daily.map(day => (
                        <div key={day.date} className="bg-white rounded-xl p-2 text-center border border-sky-50 shadow-sm">
                          <p className="text-xs text-gray-400 mb-1">{new Date(day.date).toLocaleDateString("en-KE", { weekday: "short" })}</p>
                          <span className="text-lg">{getWeatherEmoji(day.code)}</span>
                          <p className="text-xs font-semibold text-gray-700 mt-1">{Math.round(day.min)}°/{Math.round(day.max)}°</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : <p className="text-gray-500 text-sm">Could not load weather data.</p>}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-blue-600" /> Your Location</h3>
                {geoLoading ? <div className="shimmer-bg h-16 rounded-xl" /> : geoWeather?.temp != null ? (
                  <div><p className="text-3xl font-bold">{getWeatherEmoji(geoWeather.code)} {Math.round(geoWeather.temp)}°C</p><p className="text-sm text-gray-500 mt-1 capitalize">{geoWeather.desc}</p></div>
                ) : <p className="text-gray-500 text-sm">Enable browser location to see current conditions.</p>}
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-5">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Farming Tips</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">🌧️ Avoid spraying on rainy days</li>
                  <li className="flex gap-2">☀️ Schedule vet visits on clear days</li>
                  <li className="flex gap-2">🌡️ High temps — ensure shade and water</li>
                  <li className="flex gap-2">💨 Wind — keep livestock sheltered</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">Weather data is approximate for county centres. Always verify local conditions for critical decisions.</p>
        </div>
      </section>

      {/* ══ TRUST ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sora">Trusted & Secure</h2>
            <p className="text-gray-500 text-lg">Your data and transactions are protected</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Secure Payments", desc: "Bank-level encryption for all transactions", bg: "#dcfce7", color: "#16a34a" },
              { icon: Clock, title: "24/7 Support", desc: "Always here to help when you need us", bg: "#dbeafe", color: "#2563eb" },
              { icon: Award, title: "Verified Providers", desc: "All vets and agrovets are document-verified", bg: "#fef3c7", color: "#d97706" },
              { icon: Users, title: "2,500+ Active Users", desc: "Growing community of Kenyan farmers", bg: "#d1fae5", color: "#059669" },
            ].map(item => (
              <div key={item.title} className="glow-card bg-white text-center rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: item.bg }}><item.icon className="w-7 h-7" style={{ color: item.color }} /></div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ═════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-16 sm:py-24 px-4 bg-gray-50 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4"><MessageSquare className="w-4 h-4" /> Get in Touch</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sora">Contact Us</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Have questions about SmartLivestock? We're here to help farmers, vets, and agrovets get started.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Info side */}
            <div className="lg:col-span-2 space-y-5">
              <div className="relative rounded-2xl overflow-hidden h-52 shadow-lg">
                <img src="https://images.pexels.com/photos/1459505/pexels-photo-1459505.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Kenya farm support" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-5">
                  <div className="text-white"><p className="font-bold text-lg sora">We're here for you</p><p className="text-white/75 text-sm">Kenyan farmers deserve great support</p></div>
                </div>
              </div>

              {[
                { icon: Mail, label: "Email Us", value: "support@smartlivestock.co.ke", href: "mailto:support@smartlivestock.co.ke", bg: "#dcfce7", color: "#16a34a" },
                { icon: Phone, label: "WhatsApp", value: "+254 700 000 000", href: "https://wa.me/254700000000", bg: "#dbeafe", color: "#2563eb" },
                { icon: MapPin, label: "Coverage", value: "All 47 Counties — Kenya", href: "#about", bg: "#fef3c7", color: "#d97706" },
              ].map(item => (
                <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.bg }}>
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-green-600 transition">{item.value}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 ml-auto group-hover:text-green-400 transition" />
                </a>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                {contactSent ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 sora">Message Sent!</h3>
                    <p className="text-gray-500 mb-6">We'll get back to you within 24 hours.</p>
                    <button type="button" onClick={() => setContactSent(false)} className="btn btn-outline-green px-6 py-2.5 rounded-xl text-sm">Send another message</button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 sora">Send us a message</h3>
                    <form onSubmit={handleContact} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                          <input className="input-field" placeholder="John Doe" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                          <input type="email" className="input-field" placeholder="you@example.com" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a…</label>
                        <select className="select-field" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} required>
                          <option value="">Select your role…</option>
                          <option value="farmer">Farmer — questions about registration</option>
                          <option value="vet">Veterinarian — joining the platform</option>
                          <option value="agrovet">Agrovet — listing my shop/products</option>
                          <option value="subadmin">County Officer — admin account request</option>
                          <option value="support">General — technical support</option>
                          <option value="other">Other enquiry</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                        <textarea className="input-field" rows={5} placeholder="Tell us how we can help you…" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} required />
                      </div>
                      <button type="submit" disabled={contactSending} className="btn btn-primary w-full py-3.5 rounded-xl text-sm">
                        {contactSending
                          ? <><span className="spin-anim w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" /> Sending…</>
                          : <><Send className="w-4 h-4" /> Send Message</>}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 cta-grad text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-green-100 mb-6 font-medium">
            <Users className="w-4 h-4" /> Join 2,500+ farmers already on SmartLivestock
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight sora">Ready to Transform Your Livestock Business?</h2>
          <p className="text-green-100 text-lg mb-8">Join thousands of farmers, vets, and agrovets already using SmartLivestock</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-white px-8 py-3.5 text-base rounded-xl font-bold">Create free account →</Link>
            <Link to="/login" className="btn btn-outline-white px-8 py-3.5 text-base rounded-xl">Sign in</Link>
          </div>
          <p className="text-green-200/70 text-sm mt-6">No credit card required. Get started in minutes.</p>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="bg-gray-950 text-gray-400 py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center"><PawPrint className="w-5 h-5 text-white" /></div>
                <span className="font-bold text-white text-lg sora">SmartLivestock</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 mb-4">Smart livestock management for farmers, vets, and agrovet suppliers across all 47 counties in Kenya.</p>
              <div className="flex items-center gap-2 text-xs text-gray-600"><span className="w-2 h-2 rounded-full bg-green-500" /> Platform Online</div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
              {[["About", "#about"], ["Features", "#features"], ["Benefits", "#benefits"], ["Platform", "#platform"], ["How it Works", "#how-it-works"]].map(([l, h]) => (
                <a key={h} href={h} className="block text-sm py-1.5 hover:text-white transition">{l}</a>
              ))}
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Services</h4>
              {[["Sub-county Admin", "#subadmin"], ["Weather", "#weather"], ["Testimonials", "#testimonials"], ["Contact", "#contact"]].map(([l, h]) => (
                <a key={h} href={h} className="block text-sm py-1.5 hover:text-white transition">{l}</a>
              ))}
              <div className="mt-3 border-t border-gray-800 pt-3">
                <Link to="/login" className="block text-sm py-1.5 hover:text-white transition">Login</Link>
                <Link to="/register" className="block text-sm py-1.5 hover:text-green-400 font-semibold transition">Register Free →</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Support</h4>
              <a href="mailto:support@smartlivestock.co.ke" className="block text-sm py-1.5 hover:text-white transition break-all">support@smartlivestock.co.ke</a>
              <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" className="block text-sm py-1.5 hover:text-green-400 transition">💬 WhatsApp Support</a>
              <a href="#contact" className="block text-sm py-1.5 hover:text-white transition">Contact Form</a>
              <div className="mt-4 space-y-1">
                <Link to="/privacy" className="block text-sm py-0.5 text-gray-600 hover:text-white transition">Privacy Policy</Link>
                <Link to="/terms" className="block text-sm py-0.5 text-gray-600 hover:text-white transition">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} SmartLivestock. All rights reserved.</p>
            <p className="text-sm text-gray-600">Made with ❤️ for Kenyan farmers</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 btn btn-primary rounded-full shadow-xl transition-all duration-300 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}