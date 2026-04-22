import { useState } from 'react';
import {
  AlertTriangle, Globe, Bell, Mail, CreditCard,
  Shield, Wrench, Save, ToggleLeft, ToggleRight,
} from 'lucide-react';

export default function AdminSettings() {
  /* ── app settings ──────────────────── */
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMsg,  setMaintenanceMsg]  = useState("We're performing scheduled maintenance. We'll be back shortly!");
  const [registerEnabled, setRegisterEnabled] = useState(true);
  const [forumEnabled,    setForumEnabled]    = useState(true);
  const [aiEnabled,       setAiEnabled]       = useState(true);

  /* ── payment ───────────────────────── */
  const [defaultPrice, setDefaultPrice]    = useState(89);
  const [bundlePrice,  setBundlePrice]     = useState(299);
  const [currency,     setCurrency]        = useState('PHP');

  /* ── notifications ─────────────────── */
  const [emailOnSale,  setEmailOnSale]   = useState(true);
  const [emailOnSignup,setEmailOnSignup] = useState(true);
  const [emailOnBan,   setEmailOnBan]    = useState(false);

  /* ── meta ──────────────────────────── */
  const [siteTitle, setSiteTitle]   = useState('Asikaso');
  const [siteDesc,  setSiteDesc]    = useState('Asikaso helps Filipinos complete real-life tasks step-by-step—from government IDs to taxes and travel—using guides, automation, and AI assistance.');
  const [saved, setSaved]           = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${value ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all" style={{ left: value ? '26px' : '2px' }} />
    </button>
  );

  const Row = ({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">

      {/* MAINTENANCE */}
      <section className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${maintenanceMode ? 'border-orange-300' : 'border-slate-100'}`}>
        <div className={`px-6 py-4 border-b ${maintenanceMode ? 'bg-orange-50 border-orange-200' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <Wrench size={18} className={maintenanceMode ? 'text-orange-600' : 'text-slate-500'} />
            <h2 className={`font-bold text-base ${maintenanceMode ? 'text-orange-800' : 'text-slate-800'}`}>Maintenance Mode</h2>
            {maintenanceMode && (
              <span className="ml-2 text-xs font-bold text-orange-700 bg-orange-100 border border-orange-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle size={10} /> ACTIVE
              </span>
            )}
          </div>
        </div>
        <div className="px-6">
          <Row label="Maintenance Mode" sub="Disable access to the app for non-admin users">
            <Toggle value={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
          </Row>
          {maintenanceMode && (
            <div className="pb-4">
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Maintenance Message</label>
              <textarea
                value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
              />
            </div>
          )}
        </div>
      </section>

      {/* APP FEATURES */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-slate-500" />
            <h2 className="font-bold text-slate-800 text-base">App Features</h2>
          </div>
        </div>
        <div className="px-6">
          <Row label="User Registration" sub="Allow new users to sign up">
            <Toggle value={registerEnabled} onChange={() => setRegisterEnabled(!registerEnabled)} />
          </Row>
          <Row label="Forum" sub="Enable the community forum">
            <Toggle value={forumEnabled} onChange={() => setForumEnabled(!forumEnabled)} />
          </Row>
          <Row label="AI Assistant" sub="Enable the AI step helper for guide users">
            <Toggle value={aiEnabled} onChange={() => setAiEnabled(!aiEnabled)} />
          </Row>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-slate-500" />
            <h2 className="font-bold text-slate-800 text-base">Payment & Pricing</h2>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Default Guide Price (₱)</label>
              <input type="number" value={defaultPrice} onChange={e => setDefaultPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Bundle Base Price (₱)</label>
              <input type="number" value={bundlePrice} onChange={e => setBundlePrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white">
                <option>PHP</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* EMAIL NOTIFICATIONS */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-slate-500" />
            <h2 className="font-bold text-slate-800 text-base">Email Notifications</h2>
          </div>
        </div>
        <div className="px-6">
          <Row label="Guide Sale" sub="Email admin when a guide is purchased">
            <Toggle value={emailOnSale} onChange={() => setEmailOnSale(!emailOnSale)} />
          </Row>
          <Row label="New Sign-Up" sub="Email admin when a new user registers">
            <Toggle value={emailOnSignup} onChange={() => setEmailOnSignup(!emailOnSignup)} />
          </Row>
          <Row label="User Banned" sub="Email admin when a user is banned">
            <Toggle value={emailOnBan} onChange={() => setEmailOnBan(!emailOnBan)} />
          </Row>
        </div>
      </section>

      {/* SEO DEFAULTS */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-slate-500" />
            <h2 className="font-bold text-slate-800 text-base">Default SEO / Meta</h2>
          </div>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Site Title</label>
            <input value={siteTitle} onChange={e => setSiteTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Site Description</label>
            <textarea value={siteDesc} onChange={e => setSiteDesc(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all ${
          saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
        }`}
      >
        <Save size={16} />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
