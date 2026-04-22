import { useState } from 'react';
import {
  Search, Lock, FileText, ChevronRight, Send,
} from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';

/* ─────────────────────────── data ─────────────────────────── */

interface PdfForm {
  title: string;
  locked: boolean;
  unlockLabel?: string;
}

interface FormSection {
  agency: string;
  forms: PdfForm[];
}

const FORM_SECTIONS: FormSection[] = [
  {
    agency: 'PHILHEALTH',
    forms: [
      { title: 'PhilHealth Member Registration Form',         locked: true,  unlockLabel: 'Unlock Just Graduated to access' },
      { title: 'PhilHealth Voluntary Membership Registration Form', locked: true, unlockLabel: 'Unlock Freelancer to access' },
      { title: 'PhilHealth Claim Form 1 (Member & Patient Info)',  locked: true, unlockLabel: 'Unlock Just Graduated to access' },
      { title: 'PhilHealth Claim Form 2 (Provider & Clinical Info)', locked: true, unlockLabel: 'Unlock Just Graduated to access' },
    ],
  },
  {
    agency: 'BUREAU OF INTERNAL REVENUE (BIR)',
    forms: [
      { title: 'Annual Income Tax Return (Pure Compensation)',             locked: true, unlockLabel: 'Unlock Freelancer to access' },
      { title: 'Annual Income Tax Return (Mixed Income / Self-Employed)',  locked: true, unlockLabel: 'Unlock Freelancer to access' },
      { title: 'BIR Form 1901 – Self-Employed Registration',              locked: false },
      { title: 'BIR Form 2316 – Certificate of Final Tax',                locked: true, unlockLabel: 'Unlock First-Job Ready to access' },
    ],
  },
  {
    agency: 'SSS (Social Security System)',
    forms: [
      { title: 'SSS E-1 Form – Personal Information Record',              locked: false },
      { title: 'SSS Sickness Notification (SN)',                           locked: true, unlockLabel: 'Unlock Just Graduated to access' },
      { title: 'SSS Mat-1 Maternity Notification',                         locked: true, unlockLabel: 'Unlock Building a Family to access' },
    ],
  },
  {
    agency: 'PAG-IBIG / HDMF',
    forms: [
      { title: 'Pag-IBIG Member Registration Form',                       locked: false },
      { title: 'Pag-IBIG Housing Loan Application',                       locked: true, unlockLabel: 'Unlock Building a Home to access' },
    ],
  },
];

/* ─────────────────────────── component ─────────────────────────── */

export default function PdfFormsPage() {
  const [search, setSearch] = useState('');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  const filteredSections = FORM_SECTIONS.map(sec => ({
    ...sec,
    forms: sec.forms.filter(f => f.title.toLowerCase().includes(search.toLowerCase())),
  })).filter(sec => sec.forms.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <DashboardHeader />

      {/* Blue banner */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#334155] text-white">
        <div className="max-w-4xl mx-auto px-5 py-8">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Fill government forms with AI assistance</p>
          <h1 className="text-3xl font-extrabold">PDF Form Filler</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Intro */}
        <h2 className="text-lg font-bold text-slate-800 mb-1">Select a Government Form</h2>
        <p className="text-sm text-slate-500 mb-6">
          Choose the form you need and I will collect your details to generate a pre-filled PDF.
        </p>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search forms (e.g. TIN, SSS, PhilHealth...)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Form sections */}
        <div className="space-y-8">
          {filteredSections.map((sec, si) => (
            <section key={si}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-dashed border-slate-200 pb-2">
                {sec.agency}
              </p>
              <div className="space-y-2">
                {sec.forms.map((form, fi) => (
                  <button
                    key={fi}
                    onClick={() => !form.locked && setSelectedForm(form.title)}
                    className={`w-full bg-white rounded-xl border p-4 flex items-center gap-4 text-left transition-all ${
                      form.locked
                        ? 'border-slate-100 opacity-70 cursor-not-allowed'
                        : selectedForm === form.title
                          ? 'border-blue-400 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-100 hover:border-blue-200 hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      form.locked ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {form.locked ? <Lock size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${form.locked ? 'text-slate-500' : 'text-slate-800'}`}>
                        {form.title}
                      </p>
                      {form.locked && form.unlockLabel && (
                        <p className="text-xs text-orange-500 font-semibold mt-0.5">{form.unlockLabel}</p>
                      )}
                    </div>
                    {!form.locked && <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center text-slate-400 py-16">
            <FileText size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold">No forms found</p>
            <p className="text-sm">Try a different search term.</p>
          </div>
        )}

        {/* Bottom prompt bar */}
        <div className="mt-10 sticky bottom-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-3 flex gap-3">
            <input
              type="text"
              placeholder="Select a form above to get started..."
              disabled
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
            />
            <button className="bg-blue-600 text-white p-3 rounded-xl shadow-sm opacity-50 cursor-not-allowed">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
