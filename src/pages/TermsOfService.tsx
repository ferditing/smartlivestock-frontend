/**
 * SmartLivestock — Terms of Service
 * Professional document page matching Landing design system.
 * Content unchanged.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PawPrint, ChevronDown, Scale, ExternalLink } from "lucide-react";

const SECTIONS = [
  {
    num: "01", title: "Acceptance of Terms",
    content: `By accessing or using the SmartLivestock platform ("Service"), you agree to be bound by these Terms of Service. The Service is intended for users in Kenya and provides livestock management, veterinary appointments, and agrovet marketplace features for farmers, veterinarians, and agrovet suppliers. If you do not agree to these terms, do not use the Service.`
  },
  {
    num: "02", title: "Description of Service",
    content: `SmartLivestock offers:`,
    list: [
      "Animal health tracking and digital health records for farmers",
      "Booking and management of veterinary appointments",
      "Marketplace for ordering products from agrovet shops (payments per shop)",
      "Location-based discovery of vets and agrovets",
      "Weather information by county for planning farm activities",
    ]
  },
  {
    num: "03", title: "Account and Eligibility",
    content: `You must be at least 18 years old and provide accurate registration information. You are responsible for keeping your password secure and for all activity under your account. Accounts are role-based (farmer, vet, or agrovet); you must register under the role that reflects your actual status.`
  },
  {
    num: "04", title: "User Conduct",
    content: `You agree not to:`,
    list: [
      "Use the Service for any illegal purpose or in violation of Kenyan law",
      "Misrepresent your identity, qualifications (e.g. as a vet or agrovet), or location",
      "Harass other users, post false or misleading information, or abuse the booking or marketplace systems",
      "Attempt to gain unauthorized access to the Service or other users' data",
      "Scrape, copy, or resell data or content from the platform without permission",
    ]
  },
  {
    num: "05", title: "Payments and Marketplace",
    content: `Payments for marketplace orders are processed per agrovet shop as described in the app. You are responsible for completing payments for orders you place. Refunds and disputes are between you and the agrovet; SmartLivestock may facilitate communication but is not responsible for the quality, delivery, or legality of products sold by third-party agrovets.`
  },
  {
    num: "06", title: "Veterinary and Agrovet Services",
    content: `Veterinarians and agrovets listed on the platform are independent providers. SmartLivestock does not employ vets or agrovets and does not guarantee the quality, availability, or outcome of their services. Booking through the platform does not create a direct legal relationship between SmartLivestock and the farmer beyond the use of the platform.`
  },
  {
    num: "07", title: "Intellectual Property",
    content: `The SmartLivestock name, logo, and all content and design of the platform are owned by SmartLivestock or its licensors. You may not copy, modify, or use them for commercial purposes without written permission.`
  },
  {
    num: "08", title: "Limitation of Liability",
    content: `The Service is provided "as is." To the fullest extent permitted by law, SmartLivestock is not liable for any indirect, incidental, or consequential damages, or for loss of data, profits, or business arising from your use of the Service. Our total liability shall not exceed the amount you paid to SmartLivestock in the twelve months preceding the claim (if any).`
  },
  {
    num: "09", title: "Termination",
    content: `We may suspend or terminate your account if you breach these terms or for other operational or legal reasons. You may stop using the Service at any time. Upon termination, your right to use the Service ceases; provisions that by their nature should survive (e.g. liability limits, dispute resolution) will remain in effect.`
  },
  {
    num: "10", title: "Changes to Terms",
    content: `We may update these Terms of Service from time to time. We will post the updated terms on the platform and update the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new terms.`
  },
  {
    num: "11", title: "Governing Law and Contact",
    content: `These terms are governed by the laws of Kenya. For questions about these Terms of Service, contact us through the support or contact information provided on the SmartLivestock platform.`
  },
];

function Section({ num, title, content, list }: { num: string; title: string; content: string; list?: string[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:border-green-100 transition-colors">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-green-50/30 transition-colors"
      >
        <span className="text-xs font-bold text-green-500 tracking-widest w-6 flex-shrink-0 sora">{num}</span>
        <span className="flex-1 font-bold text-gray-900 text-base">{title}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 animate-fadeInUp">
          <div className="border-t border-gray-100 pt-4 pl-10">
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

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Inject fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap'); body, * { font-family: 'Plus Jakarta Sans', sans-serif; } .sora { font-family: 'Sora', sans-serif !important; }`}</style>

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" /> Legal Document
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sora">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: <strong className="text-gray-700">February 2025</strong></p>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl">
            Please read these terms carefully before using SmartLivestock. By using our platform you agree to be bound by these terms.
          </p>
        </div>

        {/* Quick nav */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Navigation</p>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map(s => (
              <span key={s.num} className="inline-block text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg cursor-pointer transition font-medium">
                {s.num}. {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map(s => (
            <Section key={s.num} {...s} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition">
              Privacy Policy <ExternalLink className="w-3 h-3" />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition">
              Create Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}