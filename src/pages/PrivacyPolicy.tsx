/**
 * SmartLivestock — Privacy Policy
 * Professional document page matching Landing design system.
 * Content unchanged.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PawPrint, ChevronDown, ShieldCheck, ExternalLink } from "lucide-react";

const SECTIONS = [
  {
    num: "01", title: "Introduction",
    icon: "🔒",
    content: `SmartLivestock ("we", "our", or "the platform") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and disclose information when you use our livestock management platform in Kenya, including services for farmers, veterinarians, and agrovet suppliers.`
  },
  {
    num: "02", title: "Information We Collect",
    icon: "📋",
    content: `We may collect:`,
    list: [
      "Account information: name, email, phone number, password (hashed), and role (farmer, vet, agrovet)",
      "Location data: county, sub-county, ward, and locality you provide; GPS coordinates if you grant permission (e.g. for vets/agrovets)",
      "Livestock and health data: animal records, health events, vaccinations, and clinical notes you or your vet add",
      "Transaction data: orders, payments, and appointment bookings",
      "Usage data: how you use the app (e.g. pages visited, features used) to improve the service",
    ]
  },
  {
    num: "03", title: "How We Use Your Information",
    icon: "⚙️",
    content: `We use the information to:`,
    list: [
      "Provide and operate the platform (accounts, bookings, marketplace, health records)",
      "Show you relevant vets and agrovets based on location",
      "Process payments and communicate about orders and appointments",
      "Send important service updates, reminders, and (with your consent) marketing",
      "Improve the platform, fix issues, and analyse usage in an aggregated way",
      "Comply with applicable law and protect our rights and users' safety",
    ]
  },
  {
    num: "04", title: "Sharing of Information",
    icon: "🔗",
    content: `We do not sell your personal data. We may share information only as needed to run the service: for example, your name, contact, and location with vets or agrovets when you book or order; animal and clinical data with vets you choose; and with service providers (e.g. hosting, payments) under strict confidentiality. We may disclose data when required by Kenyan law or to protect rights and safety.`
  },
  {
    num: "05", title: "Data Retention and Security",
    icon: "🛡️",
    content: `We retain your data for as long as your account is active or as needed to provide the service and comply with legal obligations. We use reasonable technical and organisational measures to protect your data (e.g. encryption, access controls). No system is completely secure; you provide data at your own risk and should keep your password safe.`
  },
  {
    num: "06", title: "Your Rights",
    icon: "✅",
    content: `Depending on applicable law (including Kenyan data protection), you may have the right to access, correct, delete, or restrict use of your personal data, or to object to certain processing. You can update much of your profile and location in the app. For other requests, contact us using the support or contact details on the platform.`
  },
  {
    num: "07", title: "Cookies and Similar Technologies",
    icon: "🍪",
    content: `We may use cookies and similar technologies to keep you logged in, remember preferences, and understand how the platform is used. You can adjust browser settings to limit cookies, though some features may not work fully without them.`
  },
  {
    num: "08", title: "Children",
    icon: "👦",
    content: `The Service is not directed at anyone under 18. We do not knowingly collect personal data from children. If you believe we have collected such data, please contact us so we can delete it.`
  },
  {
    num: "09", title: "Changes to This Policy",
    icon: "📝",
    content: `We may update this Privacy Policy from time to time. We will post the updated policy on the platform and update the "Last updated" date. We encourage you to review it periodically. Continued use after changes constitutes acceptance of the updated policy.`
  },
  {
    num: "10", title: "Contact Us",
    icon: "📬",
    content: `For questions or requests about this Privacy Policy or your personal data, contact SmartLivestock through the support or contact information provided on the platform.`
  },
];

function Section({ num, title, icon, content, list }: {
  num: string; title: string; icon: string; content: string; list?: string[];
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:border-green-100 transition-colors">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-green-50/30 transition-colors"
      >
        <span className="text-base flex-shrink-0">{icon}</span>
        <span className="text-xs font-bold text-green-500 tracking-widest w-6 flex-shrink-0 sora">{num}</span>
        <span className="flex-1 font-bold text-gray-900 text-base">{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 animate-fadeInUp">
          <div className="border-t border-gray-100 pt-4 pl-14">
            <p className="text-gray-600 leading-relaxed text-sm">{content}</p>
            {list && (
              <ul className="mt-3 space-y-2">
                {list.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap'); body, * { font-family: 'Plus Jakarta Sans', sans-serif; } .sora { font-family: 'Sora', sans-serif !important; } @keyframes fadeInUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} .animate-fadeInUp{animation:fadeInUp .4s ease both}`}</style>

      {/* ── Header ── */}
      <header className="bg-white/95 backdrop-blur border-b border-gray-100 sticky top-0 z-10" style={{ boxShadow: "0 1px 0 rgba(0,0,0,.05)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition font-medium text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-sm">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 sora text-sm">SmartLivestock</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy Document
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sora">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: <strong className="text-gray-700">February 2026</strong></p>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl">
            We're committed to protecting your personal data. This policy explains how SmartLivestock collects, uses, and safeguards your information across all 47 counties in Kenya.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "🔒", title: "Data Security", desc: "Encrypted storage and secure access controls protect your information" },
            { icon: "🚫", title: "No Data Selling", desc: "We never sell your personal data to third parties" },
            { icon: "⚙️", title: "Your Control", desc: "Update, access or request deletion of your data anytime" },
          ].map(item => (
            <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-4" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
              <span className="text-2xl">{item.icon}</span>
              <h3 className="font-bold text-gray-900 text-sm mt-2 mb-1 sora">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sections</p>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map(s => (
              <span key={s.num} className="inline-block text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg cursor-pointer transition font-medium">
                {s.num}. {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map(s => <Section key={s.num} {...s} />)}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/terms" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition">
              Terms of Service <ExternalLink className="w-3 h-3" />
            </Link>
            <a href="mailto:support@smartlivestock.co.ke" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition">
              Contact Us
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}