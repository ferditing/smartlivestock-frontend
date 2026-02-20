import { Link } from "react-router-dom";
import { ArrowLeft, PawPrint } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-green-600" />
            <span className="font-bold text-gray-900">SmartLivestock</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 2025</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the SmartLivestock platform (“Service”), you agree to be bound by these Terms of Service.
              The Service is intended for users in Kenya and provides livestock management, veterinary appointments, and
              agrovet marketplace features for farmers, veterinarians, and agrovet suppliers. If you do not agree to these
              terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p className="mb-3">
              SmartLivestock offers:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Animal health tracking and digital health records for farmers</li>
              <li>Booking and management of veterinary appointments</li>
              <li>Marketplace for ordering products from agrovet shops (payments per shop)</li>
              <li>Location-based discovery of vets and agrovets</li>
              <li>Weather information by county for planning farm activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account and Eligibility</h2>
            <p>
              You must be at least 18 years old and provide accurate registration information. You are responsible for
              keeping your password secure and for all activity under your account. Accounts are role-based (farmer, vet,
              or agrovet); you must register under the role that reflects your actual status.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. User Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service for any illegal purpose or in violation of Kenyan law</li>
              <li>Misrepresent your identity, qualifications (e.g. as a vet or agrovet), or location</li>
              <li>Harass other users, post false or misleading information, or abuse the booking or marketplace systems</li>
              <li>Attempt to gain unauthorized access to the Service or other users’ data</li>
              <li>Scrape, copy, or resell data or content from the platform without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payments and Marketplace</h2>
            <p>
              Payments for marketplace orders are processed per agrovet shop as described in the app. You are responsible
              for completing payments for orders you place. Refunds and disputes are between you and the agrovet; SmartLivestock
              may facilitate communication but is not responsible for the quality, delivery, or legality of products sold by
              third-party agrovets.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Veterinary and Agrovet Services</h2>
            <p>
              Veterinarians and agrovets listed on the platform are independent providers. SmartLivestock does not employ
              vets or agrovets and does not guarantee the quality, availability, or outcome of their services. Booking through
              the platform does not create a direct legal relationship between SmartLivestock and the farmer beyond the use of
              the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
            <p>
              The SmartLivestock name, logo, and all content and design of the platform are owned by SmartLivestock or its
              licensors. You may not copy, modify, or use them for commercial purposes without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p>
              The Service is provided “as is.” To the fullest extent permitted by law, SmartLivestock is not liable for any
              indirect, incidental, or consequential damages, or for loss of data, profits, or business arising from your use
              of the Service. Our total liability shall not exceed the amount you paid to SmartLivestock in the twelve months
              preceding the claim (if any).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p>
              We may suspend or terminate your account if you breach these terms or for other operational or legal reasons.
              You may stop using the Service at any time. Upon termination, your right to use the Service ceases; provisions
              that by their nature should survive (e.g. liability limits, dispute resolution) will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will post the updated terms on the platform and
              update the “Last updated” date. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law and Contact</h2>
            <p>
              These terms are governed by the laws of Kenya. For questions about these Terms of Service, contact us through
              the support or contact information provided on the SmartLivestock platform.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
