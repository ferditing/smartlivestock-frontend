import { Link } from "react-router-dom";
import { ArrowLeft, PawPrint } from "lucide-react";

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 2025</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              SmartLivestock (“we”, “our”, or “the platform”) is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, store, and disclose information when you use our livestock management platform
              in Kenya, including services for farmers, veterinarians, and agrovet suppliers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account information:</strong> name, email, phone number, password (hashed), and role (farmer, vet, agrovet)</li>
              <li><strong>Location data:</strong> county, sub-county, ward, and locality you provide; GPS coordinates if you grant permission (e.g. for vets/agrovets)</li>
              <li><strong>Livestock and health data:</strong> animal records, health events, vaccinations, and clinical notes you or your vet add</li>
              <li><strong>Transaction data:</strong> orders, payments, and appointment bookings</li>
              <li><strong>Usage data:</strong> how you use the app (e.g. pages visited, features used) to improve the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and operate the platform (accounts, bookings, marketplace, health records)</li>
              <li>Show you relevant vets and agrovets based on location</li>
              <li>Process payments and communicate about orders and appointments</li>
              <li>Send important service updates, reminders, and (with your consent) marketing</li>
              <li>Improve the platform, fix issues, and analyse usage in an aggregated way</li>
              <li>Comply with applicable law and protect our rights and users’ safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sharing of Information</h2>
            <p>
              We do not sell your personal data. We may share information only as needed to run the service: for example,
              your name, contact, and location with vets or agrovets when you book or order; animal and clinical data with
              vets you choose; and with service providers (e.g. hosting, payments) under strict confidentiality. We may
              disclose data when required by Kenyan law or to protect rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention and Security</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide the service and comply with
              legal obligations. We use reasonable technical and organisational measures to protect your data (e.g. encryption,
              access controls). No system is completely secure; you provide data at your own risk and should keep your
              password safe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>
              Depending on applicable law (including Kenyan data protection), you may have the right to access, correct,
              delete, or restrict use of your personal data, or to object to certain processing. You can update much of
              your profile and location in the app. For other requests, contact us using the support or contact details on
              the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies and Similar Technologies</h2>
            <p>
              We may use cookies and similar technologies to keep you logged in, remember preferences, and understand how
              the platform is used. You can adjust browser settings to limit cookies, though some features may not work
              fully without them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children</h2>
            <p>
              The Service is not directed at anyone under 18. We do not knowingly collect personal data from children.
              If you believe we have collected such data, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post the updated policy on the platform and
              update the “Last updated” date. We encourage you to review it periodically. Continued use after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
            <p>
              For questions or requests about this Privacy Policy or your personal data, contact SmartLivestock through
              the support or contact information provided on the platform.
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
