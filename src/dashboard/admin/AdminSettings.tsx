import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { getAdminSettings, updateAdminSettings } from "../../api/admin.api";
import { ArrowLeft, Sliders, Bell, DollarSign, FileText, Shield, Save, Loader2, CheckCircle, Info, Lock } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    getAdminSettings().then(setSettings).catch(() => setSettings({})).finally(() => setLoading(false));
  }, []);

  const saveOutbreakSettings = async () => {
    setSaving("notifications");
    try {
      await updateAdminSettings({
        outbreak_alert_threshold: Number(settings.outbreak_alert_threshold) || 5,
        license_renewal_reminder_days: Number(settings.license_renewal_reminder_days) || 30,
        email_on_approval: Boolean(settings.email_on_approval),
      });
      addToast("success", "Settings saved", "Outbreak & notification settings updated");
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

        {/* ── Hero Banner ── */}
        <div className="rounded-2xl overflow-hidden animate-fadeIn" style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)" }}>
          <div className="relative px-6 py-8 md:px-8">
            <div className="absolute top-0 right-0 text-[120px] leading-none opacity-[0.07] select-none pointer-events-none pr-4 pt-2">⚙️</div>
            <div className="relative z-10">
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-green-200 hover:text-white transition-colors mb-4 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white sora mb-1">System Settings</h1>
              <p className="text-green-200 text-sm">Platform configuration and governance controls</p>
            </div>
          </div>
        </div>

        {/* ── Settings Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Platform Configuration */}
          <div className="card animate-fadeInUp" style={{ animationDelay: "0ms" }}>
            <div className="card-header flex items-center gap-3">
              <div className="card-icon-wrap card-icon-indigo"><Sliders className="w-4 h-4 text-white" /></div>
              <div>
                <h2 className="font-bold text-gray-900 sora text-sm">Platform Configuration</h2>
                <p className="text-xs text-gray-500">AI thresholds and geo-radius settings</p>
              </div>
            </div>
            <div className="card-body space-y-5">
              <div>
                <label className="field-label">AI Diagnostic Confidence Threshold</label>
                <div className="relative">
                  <input type="number" defaultValue="0.7" min="0" max="1" step="0.05" className="input-field pr-10" disabled />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                </div>
                <p className="field-hint">Minimum confidence for AI predictions (0–1)</p>
              </div>
              <div>
                <label className="field-label">Geo-location Radius (km)</label>
                <div className="relative">
                  <input type="number" defaultValue="10" min="1" max="100" className="input-field pr-10" disabled />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                </div>
                <p className="field-hint">Default radius for nearby providers</p>
              </div>
              <div className="info-box info-box-blue flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs">These values require a system deployment to change. Contact the platform team.</p>
              </div>
            </div>
          </div>

          {/* Outbreak & Notification Settings */}
          <div className="card animate-fadeInUp" style={{ animationDelay: "80ms" }}>
            <div className="card-header flex items-center gap-3">
              <div className="card-icon-wrap card-icon-blue"><Bell className="w-4 h-4 text-white" /></div>
              <div>
                <h2 className="font-bold text-gray-900 sora text-sm">Outbreak & Notifications</h2>
                <p className="text-xs text-gray-500">Alert thresholds and license reminders</p>
              </div>
            </div>
            <div className="card-body space-y-5">
              <div>
                <label className="field-label">Outbreak alert threshold <span className="text-gray-400 font-normal normal-case">(reports per county)</span></label>
                <input
                  type="number"
                  value={String(settings.outbreak_alert_threshold ?? 5)}
                  onChange={(e) => setSettings((s) => ({ ...s, outbreak_alert_threshold: Number(e.target.value) || 5 }))}
                  min={1} max={100}
                  className="input-field w-28"
                />
                <p className="field-hint">Trigger alert when symptom reports exceed this count</p>
              </div>
              <div>
                <label className="field-label">License renewal reminder <span className="text-gray-400 font-normal normal-case">(days before expiry)</span></label>
                <input
                  type="number"
                  value={String(settings.license_renewal_reminder_days ?? 30)}
                  onChange={(e) => setSettings((s) => ({ ...s, license_renewal_reminder_days: Number(e.target.value) || 30 }))}
                  min={7} max={90}
                  className="input-field w-28"
                />
                <p className="field-hint">Notify providers this many days before their license expires</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Email on approval/rejection</p>
                  <p className="text-xs text-gray-500 mt-0.5">Notify providers when their application status changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.email_on_approval ?? true)}
                    onChange={(e) => setSettings((s) => ({ ...s, email_on_approval: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-500/30 rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
              <button onClick={saveOutbreakSettings} disabled={!!saving} className="btn btn-primary w-full">
                {saving === "notifications" ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Settings</>}
              </button>
            </div>
          </div>

          {/* Economic Settings */}
          <div className="card animate-fadeInUp" style={{ animationDelay: "160ms" }}>
            <div className="card-header flex items-center gap-3">
              <div className="card-icon-wrap card-icon-amber"><DollarSign className="w-4 h-4 text-white" /></div>
              <div>
                <h2 className="font-bold text-gray-900 sora text-sm">Economic Settings</h2>
                <p className="text-xs text-gray-500">Pricing guidelines and commission rates</p>
              </div>
            </div>
            <div className="card-body space-y-5">
              <div>
                <label className="field-label">Platform Commission (%)</label>
                <div className="relative">
                  <input type="number" defaultValue="0" min="0" max="30" className="input-field pr-10" disabled />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                </div>
              </div>
              <div>
                <label className="field-label">Service Pricing Guidelines</label>
                <div className="relative">
                  <textarea rows={2} defaultValue="Recommended consultation fees; market-based pricing." className="input-field resize-none pr-10" disabled />
                  <Lock className="absolute right-3 top-3 w-3.5 h-3.5 text-gray-300" />
                </div>
              </div>
              <div className="info-box info-box-amber flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs">Economic settings are locked for this release. Future updates will allow flexible pricing models.</p>
              </div>
            </div>
          </div>

          {/* Content Management */}
          <div className="card animate-fadeInUp" style={{ animationDelay: "240ms" }}>
            <div className="card-header flex items-center gap-3">
              <div className="card-icon-wrap card-icon-purple"><FileText className="w-4 h-4 text-white" /></div>
              <div>
                <h2 className="font-bold text-gray-900 sora text-sm">Content Management</h2>
                <p className="text-xs text-gray-500">Disease database and educational resources</p>
              </div>
            </div>
            <div className="card-body space-y-4">
              <p className="text-sm text-gray-600">Manage disease database updates, veterinary guidelines, and educational resources for farmers.</p>
              {[
                { label: "Disease Database", note: "Up to date" },
                { label: "Veterinary Guidelines", note: "Up to date" },
                { label: "Educational Resources", note: "Up to date" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="badge badge-success"><CheckCircle className="w-3 h-3" /> {item.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Government Integration Banner ── */}
        <div className="alert-card alert-card-green animate-fadeInUp" style={{ animationDelay: "320ms" }}>
          <div className="alert-card-icon bg-green-100">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-green-800 sora">Government Integration Ready</h3>
            <p className="text-sm text-green-700 mt-1">
              This platform supports future integration with the Kenya Veterinary Board (KVB), Veterinary Medicines Directorate (VMD), and county agricultural authorities for license verification and disease reporting.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}