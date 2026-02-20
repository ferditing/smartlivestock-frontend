import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { getAdminSettings, updateAdminSettings } from "../../api/admin.api";
import {
  ArrowLeft,
  Sliders,
  Bell,
  DollarSign,
  FileText,
  Shield,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    getAdminSettings()
      .then(setSettings)
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, []);

  const saveOutbreakSettings = async () => {
    setSaving("notifications");
    try {
      await updateAdminSettings({
        outbreak_alert_threshold: Number(settings.outbreak_alert_threshold) || 5,
        license_renewal_reminder_days: Number(settings.license_renewal_reminder_days) || 30,
        email_on_approval: Boolean(settings.email_on_approval),
      });
      addToast("success", "Saved", "Outbreak & notification settings updated");
    } catch (e) {
      addToast("error", "Error", (e as any)?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/admin" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">Platform configuration and governance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Configuration */}
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Sliders className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Platform Configuration</h2>
                <p className="text-sm text-gray-500">AI thresholds, notifications, geo-radius</p>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI Diagnostic Confidence Threshold</label>
                <input type="number" defaultValue="0.7" min="0" max="1" step="0.05" className="input-field" disabled />
                <p className="text-xs text-gray-500 mt-1">Minimum confidence for AI predictions (0–1)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geo-location Radius (km)</label>
                <input type="number" defaultValue="10" min="1" max="100" className="input-field" disabled />
                <p className="text-xs text-gray-500 mt-1">Default radius for nearby providers</p>
              </div>
            </div>
          </div>

          {/* Outbreak & Notification Settings */}
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Outbreak & Notifications</h2>
                <p className="text-sm text-gray-500">Alert thresholds, license renewal reminders</p>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outbreak alert threshold (reports per county)
                </label>
                <input
                  type="number"
                  value={String(settings.outbreak_alert_threshold ?? 5)}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, outbreak_alert_threshold: Number(e.target.value) || 5 }))
                  }
                  min={1}
                  max={100}
                  className="input-field w-24"
                />
                <p className="text-xs text-gray-500 mt-1">Trigger alert when symptom reports exceed this count</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License renewal reminder (days before expiry)
                </label>
                <input
                  type="number"
                  value={String(settings.license_renewal_reminder_days ?? 30)}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, license_renewal_reminder_days: Number(e.target.value) || 30 }))
                  }
                  min={7}
                  max={90}
                  className="input-field w-24"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Email providers on approval/rejection</span>
                <input
                  type="checkbox"
                  checked={Boolean(settings.email_on_approval ?? true)}
                  onChange={(e) => setSettings((s) => ({ ...s, email_on_approval: e.target.checked }))}
                  className="rounded"
                />
              </div>
              <button
                onClick={saveOutbreakSettings}
                disabled={!!saving}
                className="btn-primary"
              >
                {saving === "notifications" ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>

          {/* Economic Settings */}
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Economic Settings</h2>
                <p className="text-sm text-gray-500">Pricing guidelines, commission</p>
              </div>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Commission (%)</label>
                <input type="number" defaultValue="0" min="0" max="30" className="input-field" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Pricing Guidelines</label>
                <textarea
                  rows={2}
                  defaultValue="Recommended consultation fees; market-based pricing."
                  className="input-field"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Content Management */}
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Content Management</h2>
                <p className="text-sm text-gray-500">Disease database, educational resources</p>
              </div>
            </div>
            <div className="card-body space-y-4">
              <p className="text-sm text-gray-600">
                Manage disease database updates, veterinary guidelines, and educational resources for farmers.
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="card-body flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Government Integration Ready</h3>
              <p className="text-sm text-green-700 mt-1">
                This structure supports future integration with Kenya Veterinary Board (KVB), Veterinary Medicines Directorate (VMD),
                and county agricultural authorities for license verification and disease reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
