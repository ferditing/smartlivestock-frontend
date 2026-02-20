import { useState, useEffect, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Menu, X, PawPrint, CloudRain, MapPin, ShoppingBag, Stethoscope,
  ChevronLeft, ChevronRight, Users, TrendingUp, Shield, Clock,
  CheckCircle, Star, BarChart3, Smartphone, Calendar,
  Package, Heart, Award, Sun, Cloud, Brain, Zap, Globe,
  BarChart, PieChart, LineChart, Eye, FileText, Activity
} from "lucide-react";
import kenyaLocations from "../data/kenya_locations_complete3.json";
import { KENYA_COUNTY_COORDINATES, WMO_WEATHER_LABELS } from "../data/kenya_county_coordinates";

type HeroAnimation = "fade" | "slideRight" | "slideLeft" | "slideUp" | "slideDown" | "zoom" | "scaleFade" | "flip" | "blur";

const HERO_SLIDES: Array<{
  title: string;
  subtitle: string;
  image: string;
  caption: string;
  animation: HeroAnimation;
  contentAnimation: "up" | "down";
}> = [
  {
    title: "Smart Livestock Management",
    subtitle: "Track health, orders, and vets in one place.",
    image: "https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Modern farming made simple",
    animation: "fade",
    contentAnimation: "up"
  },
  {
    title: "Agrovet Marketplace",
    subtitle: "Order from shops near you. Pay per shop, securely.",
    image: "https://images.pexels.com/photos/2959192/pexels-photo-2959192.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Connect with local suppliers",
    animation: "slideRight",
    contentAnimation: "up"
  },
  {
    title: "Veterinary Care & Reports",
    subtitle: "Book appointments and get expert advice.",
    image: "https://images.pexels.com/photos/6131613/pexels-photo-6131613.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Professional care for your livestock",
    animation: "slideLeft",
    contentAnimation: "down"
  },
  {
    title: "Healthy Animals, Thriving Farm",
    subtitle: "Digital health records and vaccination reminders at your fingertips.",
    image: "https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Care that scales",
    animation: "slideUp",
    contentAnimation: "up"
  },
  {
    title: "Local Agrovets, Delivered",
    subtitle: "Medicines, feed, and supplies from trusted shops in your county.",
    image: "https://images.pexels.com/photos/2132111/pexels-photo-2132111.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Support local, grow local",
    animation: "zoom",
    contentAnimation: "up"
  },
  {
    title: "Expert Vets When You Need Them",
    subtitle: "Schedule visits and get prescriptions without the wait.",
    image: "https://images.pexels.com/photos/7578896/pexels-photo-7578896.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Quality care, on demand",
    animation: "scaleFade",
    contentAnimation: "down"
  },
  {
    title: "Weather-Aware Farming",
    subtitle: "Plan grazing and treatments using real-time county weather.",
    image: "https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Plan with confidence",
    animation: "flip",
    contentAnimation: "up"
  },
  {
    title: "One Platform, Every Need",
    subtitle: "From health records to marketplace orders—all in one place.",
    image: "https://images.pexels.com/photos/3933881/pexels-photo-3933881.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Built for Kenyan farmers",
    animation: "blur",
    contentAnimation: "down"
  },
  {
    title: "Grow Your Livestock Business",
    subtitle: "Connect with vets and agrovets across all 47 counties.",
    image: "https://images.pexels.com/photos/1625683/pexels-photo-1625683.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Nationwide coverage",
    animation: "slideDown",
    contentAnimation: "up"
  },
  {
    title: "Join SmartLivestock Today",
    subtitle: "Free to start. No credit card. Get going in minutes.",
    image: "https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=1920",
    caption: "Start your journey",
    animation: "fade",
    contentAnimation: "up"
  },
];

const STATS = [
  { label: "Active Farmers", value: "2,500+", icon: Users },
  { label: "Registered Vets", value: "150+", icon: Stethoscope },
  { label: "Agrovet Shops", value: "300+", icon: ShoppingBag },
  { label: "Orders Completed", value: "10,000+", icon: Package },
];

const TESTIMONIALS = [
  {
    name: "James Mwangi",
    role: "Dairy Farmer, Nakuru",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
    text: "SmartLivestock has transformed how I manage my farm. I can track all my cattle health records and order supplies without leaving the farm.",
    rating: 5
  },
  {
    name: "Dr. Sarah Kimani",
    role: "Veterinarian, Nairobi",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    text: "The platform makes it easy to connect with farmers and manage appointments. The digital health records are a game changer.",
    rating: 5
  },
  {
    name: "Peter Ochieng",
    role: "Agrovet Owner, Kisumu",
    image: "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400",
    text: "My sales have increased by 40% since joining. The platform connects me with farmers in my area who need my products.",
    rating: 5
  },
];

const heroEnterClasses: Record<HeroAnimation, string> = {
  fade: "hero-enter-fade",
  slideRight: "hero-enter-slideRight",
  slideLeft: "hero-enter-slideLeft",
  slideUp: "hero-enter-slideUp",
  slideDown: "hero-enter-slideDown",
  zoom: "hero-enter-zoom",
  scaleFade: "hero-enter-scaleFade",
  flip: "hero-enter-flip",
  blur: "hero-enter-blur",
};

const getWeatherEmoji = (code?: number): string => {
  if (code == null) return "🌤️";
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code >= 95 && code <= 99) return "⛈️";
  return "🌤️";
};

export default function Landing() {
  const counties = useMemo(
    () => Object.keys(kenyaLocations as Record<string, unknown>).sort(),
    []
  );
  const [navOpen, setNavOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [weatherCounty, setWeatherCounty] = useState("NAIROBI");
  const [weather, setWeather] = useState<{
    temp?: number;
    code?: number;
    desc?: string;
    daily?: { date: string; max: number; min: number; code: number }[];
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [geoWeather, setGeoWeather] = useState<{
    temp?: number;
    code?: number;
    desc?: string;
    countyName?: string;
  } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (token && role) {
    const dest =
      role === "admin" ? "/admin"
      : role === "subadmin" ? "/subadmin"
      : role === "farmer" ? "/farmer"
      : role === "vet" ? "/vet"
      : "/agrovet";
    return <Navigate to={dest} replace />;
  }

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const handleSlideChange = (next: number) => setSlide(next);

  const formatCountyName = (key: string) =>
    key.split(/[\s/]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  useEffect(() => {
    const coords = KENYA_COUNTY_COORDINATES[weatherCounty] || KENYA_COUNTY_COORDINATES["NAIROBI"];
    if (!coords) return;
    setWeatherLoading(true);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Africa/Nairobi&forecast_days=7`
    )
      .then((r) => r.json())
      .then((d) => {
        const code = d.current?.weather_code ?? 0;
        const daily = (d.daily?.time ?? []).slice(0, 6).map((date: string, i: number) => ({
          date,
          max: d.daily?.temperature_2m_max?.[i] ?? 0,
          min: d.daily?.temperature_2m_min?.[i] ?? 0,
          code: d.daily?.weather_code?.[i] ?? 0,
        }));
        setWeather({
          temp: d.current?.temperature_2m,
          code,
          desc: WMO_WEATHER_LABELS[code] || "Clear",
          daily,
        });
      })
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, [weatherCounty]);

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=Africa/Nairobi`
        )
          .then((r) => r.json())
          .then((d) => {
            const code = d.current?.weather_code ?? 0;
            setGeoWeather({
              temp: d.current?.temperature_2m,
              code,
              desc: WMO_WEATHER_LABELS[code] || "Clear",
              countyName: undefined,
            });
          })
          .catch(() => setGeoWeather(null))
          .finally(() => setGeoLoading(false));
      },
      () => {
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-gray-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <PawPrint className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-gray-900">SmartLivestock</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-gray-600 hover:text-green-600 font-medium transition">About</a>
            <a href="#features" className="text-gray-600 hover:text-green-600 font-medium transition">Features</a>
            <a href="#benefits" className="text-gray-600 hover:text-green-600 font-medium transition">Benefits</a>
            <a href="#subadmin" className="text-gray-600 hover:text-green-600 font-medium transition">Sub-county</a>
            <a href="#platform" className="text-gray-600 hover:text-green-600 font-medium transition">Platform</a>
            <a href="#testimonials" className="text-gray-600 hover:text-green-600 font-medium transition">Testimonials</a>
            <a href="#weather" className="text-gray-600 hover:text-green-600 font-medium transition">Weather</a>
            <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium transition">Login</Link>
            <Link to="/register" className="btn-primary py-2 px-4">Register</Link>
          </div>
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setNavOpen((o) => !o)}
            aria-label="Menu"
          >
            {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden border-t border-gray-200 px-4 py-3 flex flex-col gap-2 bg-white">
            <a href="#about" className="py-2 font-medium" onClick={() => setNavOpen(false)}>About</a>
            <a href="#features" className="py-2 font-medium" onClick={() => setNavOpen(false)}>Features</a>
            <a href="#benefits" className="py-2 font-medium" onClick={() => setNavOpen(false)}>Benefits</a>
            <a href="#subadmin" className="py-2 font-medium" onClick={() => setNavOpen(false)}>Sub-county</a>
            <a href="#platform" className="py-2 font-medium" onClick={() => setNavOpen(false)}>Platform</a>
            <a href="#testimonials" className="py-2 font-medium" onClick={() => setNavOpen(false)}>Testimonials</a>
            <a href="#weather" className="py-2 font-medium" onClick={() => setNavOpen(false)}>Weather</a>
            <Link to="/login" className="py-2 font-medium" onClick={() => setNavOpen(false)}>Login</Link>
            <Link to="/register" className="btn-primary py-2 text-center" onClick={() => setNavOpen(false)}>Register</Link>
          </div>
        )}
      </nav>

      {/* Hero - 10 slides with varied entrance animations */}
      <section className="relative overflow-hidden bg-gray-900 min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center">
        {(() => {
          const s = HERO_SLIDES[slide];
          return (
            <div
              key={slide}
              className={`absolute inset-0 z-10 ${heroEnterClasses[s.animation]}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${s.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
              </div>
              <div className="relative z-10 h-full flex items-center justify-center px-4">
                <div
                  className={`text-center text-white max-w-3xl ${
                    s.contentAnimation === "up" ? "hero-content-up" : "hero-content-down"
                  }`}
                >
                  <div className="inline-block px-4 py-2 bg-green-600/90 rounded-full text-sm font-medium mb-4">
                    {s.caption}
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{s.title}</h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 max-w-2xl mx-auto">{s.subtitle}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition shadow-lg">
                      Get started free
                    </Link>
                    <a href="#features" className="inline-block border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-3 rounded-xl transition">
                      Learn more
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 sm:gap-3 z-20 flex-wrap px-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSlideChange(i)}
              className={`transition-all duration-300 rounded-full ${
                i === slide
                  ? "w-8 h-3 bg-white"
                  : "w-3 h-3 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white hover:bg-white/10 p-2 sm:p-3 rounded-full transition backdrop-blur"
          onClick={() => handleSlideChange((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
        <button
          type="button"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 text-white/80 hover:text-white hover:bg-white/10 p-2 sm:p-3 rounded-full transition backdrop-blur"
          onClick={() => handleSlideChange((slide + 1) % HERO_SLIDES.length)}
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </section>

      {/* About the System */}
      <section id="about" className="py-16 sm:py-24 px-4 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">About SmartLivestock</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">One Platform for Livestock Management</h2>
              <p className="text-gray-600 text-lg mb-6">
                SmartLivestock is a digital platform connecting Kenyan farmers with veterinarians and agrovet suppliers. 
                Manage your animals, report symptoms with AI-powered predictions, order supplies, and book vet appointments—all in one place.
              </p>
              <p className="text-gray-600 mb-6">
                The system covers all 47 counties, with weather forecasts to help you plan grazing and treatments. 
                Built for mobile-first use, it works on any device.
              </p>
              <ul className="space-y-3">
                {["AI-powered symptom analysis and disease prediction", "Inventory management for your livestock", "Integrated marketplace with M-Pesa & Paystack", "GPS-based discovery of vets and agrovets", "6-day county weather forecasts"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <img
                  src="https://images.pexels.com/photos/2382904/pexels-photo-2382904.jpeg?auto=compress&cs=tinysrgb&w=1600"
                  alt="SmartLivestock in Kenya"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/25 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur text-xs font-semibold">
                    <Globe className="w-4 h-4" />
                    All 47 Counties
                  </div>
                  <p className="mt-3 text-white/90 text-sm">
                    Built for Kenya—mobile-first, fast, and easy to use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center animate-fadeInUp ${i === 0 ? "" : i === 1 ? "animate-fadeInUp-delay-1" : i === 2 ? "animate-fadeInUp-delay-2" : "animate-fadeInUp-delay-3"}`}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-110">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Everything you need to manage your livestock business efficiently</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: Brain, title: "AI Symptom Analysis", desc: "Describe symptoms in plain text or select from a list. Get instant disease predictions with confidence scores." },
              { icon: PawPrint, title: "Livestock Inventory", desc: "Add, edit, and manage all your animals. View and update records with professional modals." },
              { icon: ShoppingBag, title: "Agrovet Marketplace", desc: "Order medicines, feed, and supplies from verified shops. M-Pesa and Paystack payments." },
              { icon: Stethoscope, title: "Veterinary Services", desc: "Book appointments, get digital health records, and clinical reports." },
              { icon: MapPin, title: "Nearby Services Map", desc: "GPS-powered map shows vets and agrovets near you. Book or view with one click." },
              { icon: BarChart3, title: "Weather & Planning", desc: "6-day forecasts for all 47 counties. Plan grazing and treatments with real-time data." },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-green-100"
              >
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-xl mb-3">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits for each user type */}
      <section id="benefits" className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Everyone</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Tailored features for farmers, veterinarians, and agrovet suppliers</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <PawPrint className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">For Farmers</h3>
              <ul className="space-y-3">
                {[
                  "Track all livestock health records",
                  "Order supplies from nearby shops",
                  "Book vet appointments easily",
                  "Get weather forecasts for your area",
                  "Monitor farm expenses and income",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">For Veterinarians</h3>
              <ul className="space-y-3">
                {[
                  "Manage appointments and schedules",
                  "Digital health records and reports",
                  "Connect with farmers in your area",
                  "Track treatment history",
                  "Send prescriptions digitally",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">For Agrovets</h3>
              <ul className="space-y-3">
                {[
                  "List products and manage inventory",
                  "Reach farmers in your area",
                  "Secure payment processing",
                  "Track orders and deliveries",
                  "Build your customer base",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-county Administration */}
      <section id="subadmin" className="py-16 sm:py-24 px-4 bg-gradient-to-b from-emerald-50 via-white to-blue-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">Sub-county Administration</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Sub-county Dashboard</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              A modern workspace for county officers to manage users, review disease signals, and approve service providers—scoped to their assigned county and coverage.
            </p>
          </div>

          {/* Main Feature Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Left: Image with overlay */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <img
                src="https://images.pexels.com/photos/5905708/pexels-photo-5905708.jpeg?auto=compress&cs=tinysrgb&w=1920"
                alt="County administration dashboard"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">County-Level Control</h3>
                  <p className="text-white/90">Manage all aspects of livestock services within your county boundaries</p>
                </div>
              </div>
            </div>

            {/* Right: Feature Cards */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-gray-900">User Management</h3>
                    <p className="text-gray-600 mb-3">View, search, and manage farmers, veterinarians, and agrovets in your county. Suspend accounts when necessary.</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Sub-county and ward breakdown
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Role-based filtering and search
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-gray-900">County Analytics</h3>
                    <p className="text-gray-600 mb-3">Comprehensive analytics with interactive charts showing symptom reports, diagnoses, and user distribution.</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        Bar charts, pie charts, and line graphs
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        Real-time case monitoring
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-gray-900">Provider Approvals</h3>
                    <p className="text-gray-600 mb-3">Review and verify veterinarians and agrovets in your county. Confirm documents and approve applications.</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-600" />
                        Document verification workflow
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-600" />
                        License management
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Feature 1: Sub-county Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Sub-county breakdown"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/80 to-transparent flex items-end p-4">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Sub-county Breakdown</h3>
              <p className="text-gray-600 text-sm mb-3">Interactive cards showing user distribution by sub-county and ward. Click to filter users instantly.</p>
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                <Activity className="w-4 h-4" />
                Real-time statistics
              </div>
            </div>

            {/* Feature 2: Advanced Charts */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                  <PieChart className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <LineChart className="w-14 h-14 text-indigo-600 mx-auto" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Interactive Charts</h3>
              <p className="text-gray-600 text-sm mb-3">Multiple chart types: bar graphs for comparisons, pie charts for distributions, line graphs for trends, and histograms for status analysis.</p>
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                <BarChart3 className="w-4 h-4" />
                Data visualization
              </div>
            </div>

            {/* Feature 3: User Details Modal */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/5905710/pexels-photo-5905710.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="User details modal"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/80 to-transparent flex items-end p-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Detailed User Views</h3>
              <p className="text-gray-600 text-sm mb-3">Click the eye icon to view comprehensive user details including location, status, verification, and account history.</p>
              <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                <Eye className="w-4 h-4" />
                Quick access modal
              </div>
            </div>
          </div>

          {/* Removed: Modern Web Development section */}

          {/* Feature Highlights with Images */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-64">
                <img
                  src="https://images.pexels.com/photos/5905711/pexels-photo-5905711.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Analytics dashboard"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h4 className="text-xl font-bold mb-2">County Analytics Dashboard</h4>
                  <p className="text-white/90 text-sm">Monitor disease patterns, user growth, and provider verification status with comprehensive analytics.</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Visual Data Insights</h5>
                    <p className="text-sm text-gray-600">Charts update in real-time as data changes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-64">
                <img
                  src="https://images.pexels.com/photos/5905712/pexels-photo-5905712.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Provider management"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h4 className="text-xl font-bold mb-2">Provider Verification</h4>
                  <p className="text-white/90 text-sm">Review documents, verify credentials, and approve service providers within your county jurisdiction.</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Secure Approval Process</h5>
                    <p className="text-sm text-gray-600">Streamlined workflow for document verification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Manage Your County?</h3>
              <p className="text-gray-600 mb-6">
                County officer accounts are created by system administrators. Contact your admin to get started with sub-county management tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login" className="btn-primary inline-flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Login as County Officer
                </Link>
                <a href="#features" className="btn-outline inline-flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Platform Features */}
      <section id="platform" className="py-16 sm:py-24 px-4 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">Modern Technology</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built with Modern Features</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Cutting-edge tools to help you manage livestock efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: "AI Health Predictions", desc: "Machine learning models analyze symptom text and return predicted conditions with confidence.", color: "purple" },
              { icon: Zap, title: "Instant Symptom Reporting", desc: "Free-text or structured input. Reports sync to vets and trigger follow-ups.", color: "amber" },
              { icon: MapPin, title: "Location-Aware", desc: "Geolocation finds nearby providers. Filter by vet or agrovet. Responsive on all devices.", color: "blue" },
              { icon: CloudRain, title: "Weather Integration", desc: "County-level forecasts and 6-day outlook. Plan based on real conditions.", color: "cyan" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center mb-4`} style={{
                  backgroundColor: item.color === "purple" ? "#f3e8ff" : item.color === "amber" ? "#fef3c7" : item.color === "blue" ? "#dbeafe" : "#cffafe"
                }}>
                  <item.icon className="w-6 h-6" style={{
                    color: item.color === "purple" ? "#7c3aed" : item.color === "amber" ? "#d97706" : item.color === "blue" ? "#2563eb" : "#0891b2"
                  }} />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Get started in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "1",
                icon: Smartphone,
                title: "Register",
                desc: "Sign up as farmer, vet, or agrovet. Set your location to connect with nearby users."
              },
              {
                step: "2",
                icon: Users,
                title: "Connect",
                desc: "Browse shops, book appointments, or list your products. Build your network."
              },
              {
                step: "3",
                icon: TrendingUp,
                title: "Grow",
                desc: "Manage orders, payments, and health records. Track your success over time."
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-green-700">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-12 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Join thousands of satisfied farmers, vets, and agrovets</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">{testimonial.text}</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weather - County-based from Kenya locations */}
      <section id="weather" className="py-16 sm:py-24 px-4 bg-gradient-to-b from-slate-50 to-blue-50/30 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Weather by County</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Real-time weather for all 47 counties, plus a 6-day outlook to help you plan grazing,
              treatments, and fieldwork.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select your county</label>
            <select
              value={weatherCounty}
              onChange={(e) => setWeatherCounty(e.target.value)}
              className="input-field w-full text-base py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
            >
              {counties.map((c) => (
                <option key={c} value={c}>
                  {formatCountyName(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Current weather card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scaleIn">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-8 text-white">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                      {weather?.code != null && (weather.code >= 61 && weather.code <= 82) ? (
                        <CloudRain className="w-12 h-12" />
                      ) : weather?.code != null && weather.code >= 95 ? (
                        <CloudRain className="w-12 h-12" />
                      ) : weather?.code != null && (weather.code >= 1 && weather.code <= 3) ? (
                        <Cloud className="w-12 h-12" />
                      ) : (
                        <Sun className="w-12 h-12" />
                      )}
                    </div>
                    <div>
                      {weatherLoading ? (
                        <p className="text-xl text-white/90">Loading...</p>
                      ) : weather?.temp != null ? (
                        <>
                          <p className="text-5xl font-bold flex items-center gap-3">
                            <span>{getWeatherEmoji(weather.code)}</span>
                            <span>{Math.round(weather.temp)}°C</span>
                          </p>
                          <p className="text-white/90 mt-1 capitalize flex items-center gap-2">
                            <span>{weather.desc ?? "—"}</span>
                          </p>
                          <p className="text-white/80 text-sm mt-2">
                            {formatCountyName(weatherCounty)}, Kenya
                          </p>
                        </>
                      ) : (
                        <p className="text-white/90">Unable to load weather</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-white/80 text-sm">
                    <p>Real-time from Open-Meteo</p>
                    <p>Africa/Nairobi timezone</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6-day outlook + current location */}
            <div className="space-y-4 animate-scaleIn" style={{ animationDelay: "0.1s" }}>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  6-day outlook
                </h3>
                {weatherLoading || !weather?.daily?.length ? (
                  <p className="text-gray-500 text-sm">Loading forecast...</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {weather.daily.slice(0, 6).map((day, i) => (
                      <div
                        key={day.date}
                        className="flex flex-col justify-between rounded-xl border border-gray-100 bg-slate-50/70 px-3 py-2"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            {i === 0
                              ? "Today"
                              : i === 1
                                ? "Tomorrow"
                                : new Date(day.date).toLocaleDateString("en-KE", {
                                    weekday: "short",
                                  })}
                          </span>
                          <span className="text-lg">{getWeatherEmoji(day.code)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 capitalize">
                            {WMO_WEATHER_LABELS[day.code] || "—"}
                          </span>
                          <span className="text-xs font-semibold text-gray-900">
                            {Math.round(day.min)}° / {Math.round(day.max)}°
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Current location
                </h3>
                {geoLoading ? (
                  <p className="text-gray-500 text-sm">Detecting your location...</p>
                ) : geoWeather?.temp != null ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold flex items-center gap-2">
                        <span>{getWeatherEmoji(geoWeather.code)}</span>
                        <span>{Math.round(geoWeather.temp)}°C</span>
                      </p>
                      <p className="text-sm text-gray-600 capitalize mt-1">
                        {geoWeather.desc ?? "—"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 max-w-[8rem] text-right">
                      Based on your browser location. Approximate.
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    We couldn't access your location. Enable location in your browser to see
                    current conditions here.
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6 max-w-xl mx-auto">
            Weather data is approximate for the county centre and your browser location. Use it to
            plan feeding, grazing, and vet visits—always check local conditions for critical
            decisions.
          </p>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted & Secure</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Your data and transactions are safe with us</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Secure Payments", desc: "Bank-level encryption for all transactions" },
              { icon: Clock, title: "24/7 Support", desc: "Always here to help when you need us" },
              { icon: Award, title: "Verified Users", desc: "All vets and agrovets are verified" },
              { icon: Heart, title: "Trusted by Thousands", desc: "Join our growing community" },
            ].map((item) => (
              <div key={item.title} className="group text-center bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110">
                  <item.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Livestock Business?</h2>
          <p className="text-green-100 text-lg mb-8">Join thousands of farmers, vets, and agrovets already using SmartLivestock</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-block bg-white text-green-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition shadow-lg">
              Create free account
            </Link>
            <Link to="/login" className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition">
              Sign in
            </Link>
          </div>
          <p className="text-green-100 text-sm mt-6">No credit card required. Get started in minutes.</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PawPrint className="w-6 h-6 text-green-400" />
                <span className="font-bold text-white text-lg">SmartLivestock</span>
              </div>
              <p className="text-sm text-gray-400">Smart livestock management for farmers, veterinarians, and agrovet suppliers across Kenya.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <a href="#about" className="block text-sm py-2 hover:text-white transition">About</a>
              <a href="#features" className="block text-sm py-2 hover:text-white transition">Features</a>
              <a href="#benefits" className="block text-sm py-2 hover:text-white transition">Benefits</a>
              <a href="#subadmin" className="block text-sm py-2 hover:text-white transition">Sub-county</a>
              <a href="#platform" className="block text-sm py-2 hover:text-white transition">Platform</a>
              <a href="#how-it-works" className="block text-sm py-2 hover:text-white transition">How it works</a>
              <a href="#weather" className="block text-sm py-2 hover:text-white transition">Weather</a>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Account</h4>
              <Link to="/login" className="block text-sm py-2 hover:text-white transition">Login</Link>
              <Link to="/register" className="block text-sm py-2 hover:text-white transition">Register</Link>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <p className="text-sm text-gray-400">SmartLivestock Platform</p>
              <p className="text-sm text-gray-400">Farm Management & Veterinary Services</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} SmartLivestock. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
