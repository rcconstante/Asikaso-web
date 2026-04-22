import {
  GraduationCap, Briefcase, Laptop, Heart,
  Globe, Home, Plane, Wallet, CircleArrowRight,
  CheckCircle, Clock, Lock, BookMarked, Bot,
  Gift, FileText, BookOpen,
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';

/* ─────────────────────────── mock data ─────────────────────────── */

const FEATURE_CARDS = [
  {
    icon: <FileText size={26} />,
    bg: 'bg-purple-100', iconColor: 'text-purple-600',
    title: 'PDF Form Filler',
    desc: 'Auto-fill government forms in seconds.',
    cta: 'Try Now →',
  },
  {
    icon: <BookOpen size={26} />,
    bg: 'bg-emerald-100', iconColor: 'text-emerald-600',
    title: 'Step-by-Step Guides',
    desc: 'Clear, updated guides for real-life processes.',
    cta: 'Browse Guides →',
  },
  {
    icon: <Bot size={26} />,
    bg: 'bg-orange-100', iconColor: 'text-orange-500',
    title: 'AI Assistant',
    desc: 'Get instant help on any step, anytime.',
    cta: 'Ask AI →',
  },
  {
    icon: <Gift size={26} />,
    bg: 'bg-blue-100', iconColor: 'text-blue-600',
    title: 'Life-stage Bundles',
    desc: 'Curated flows based on your current situation.',
    cta: 'Explore Bundles →',
  },
];

const LIFE_STAGE_CARDS = [
  { title: 'Just Graduated',       count: 7,  color: 'bg-blue-600',    icon: <GraduationCap size={28} /> },
  { title: 'First-Job Ready',      count: 10, color: 'bg-emerald-500', icon: <Briefcase size={28} /> },
  { title: 'Freelancer',           count: 10, color: 'bg-sky-500',     icon: <Laptop size={28} /> },
  { title: 'Getting Married',      count: 8,  color: 'bg-pink-500',    icon: <Heart size={28} /> },
  { title: 'OFW / Returning Home', count: 9,  color: 'bg-orange-400',  icon: <Globe size={28} /> },
  { title: 'Renting / Moving Out', count: 8,  color: 'bg-orange-500',  icon: <Home size={28} /> },
  { title: 'Travel Ready',         count: 12, color: 'bg-violet-600',  icon: <Plane size={28} /> },
  { title: 'Money Smart',          count: 11, color: 'bg-teal-500',    icon: <Wallet size={28} /> },
];

const STATS = [
  { icon: <CheckCircle size={28} />, color: 'text-emerald-500', bg: 'bg-emerald-50', value: '12', label: 'Guides Completed', sub: 'Keep it up!' },
  { icon: <BookMarked size={28} />,  color: 'text-blue-500',    bg: 'bg-blue-50',    value: '3',  label: 'In Progress',      sub: 'Continue learning' },
  { icon: <Lock size={28} />,        color: 'text-orange-500',  bg: 'bg-orange-50',  value: '15', label: 'Unlocked Guides',  sub: 'Keep exploring' },
  { icon: <Clock size={28} />,       color: 'text-purple-500',  bg: 'bg-purple-50',  value: '8h 30m', label: 'Saved Time',   sub: "That's amazing!" },
];

/* ─────────────────────────── component ─────────────────────────── */

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <DashboardHeader />

      {/* ══════════ HERO SECTION — with gradient ══════════ */}
      <div className="relative overflow-hidden border-b border-slate-200"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 20%, #6366f1 40%, #3b82f6 60%, #06b6d4 80%, #a78bfa 100%)',
        }}
      >
        {/* Soft overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/30 pointer-events-none" />
        {/* Decorative shapes */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-2xl" />

        <div className="max-w-7xl mx-auto px-5 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

            {/* Mascot */}
            <div className="flex-shrink-0 relative">
              <div className="absolute -top-1 left-[60%] bg-white/95 backdrop-blur-sm border border-white/60 shadow-lg rounded-2xl px-3.5 py-2 text-sm font-bold text-slate-800 whitespace-nowrap z-10"
                style={{ borderRadius: '16px 16px 16px 4px' }}>
                Hi Rich! 👋
              </div>
              <img
                src="/assets/mascot.png" alt="Mascot"
                className="h-44 w-44 object-contain"
                style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.25))' }}
              />
            </div>

            {/* Welcome text */}
            <div className="flex-1">
              <div className="text-white/80 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
                GOOD MORNING <span>⭐</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white mb-1" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>Hi Rich!</h1>
              <p className="text-white/80 text-base mb-3">Let's make today productive.</p>
              <p className="text-white/60 text-sm">rc202300000@gmail.com</p>
            </div>

            {/* Continue where you left off */}
            <div className="flex-shrink-0 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">Continue where you left off</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 leading-tight">8% vs Graduated Tax: Which Saves You More?</p>
                  <p className="text-xs text-slate-400 mt-0.5">Step 2 of 6 &nbsp;•&nbsp; 15 mins left</p>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
                Continue Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-10">

        {/* Feature cards */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">What you can do with Asikaso</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURE_CARDS.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 ${f.iconColor}`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-snug mb-4">{f.desc}</p>
                <span className="text-blue-600 text-xs font-semibold group-hover:underline">{f.cta}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Life Stage Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Where are you in life right now?</h2>
            <a href="#" className="text-blue-600 text-sm font-semibold hover:underline">See all guides →</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LIFE_STAGE_CARDS.map((card, idx) => (
              <button
                key={idx}
                className={`${card.color} text-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group text-left w-full`}
              >
                <div className="flex-shrink-0 opacity-95">{card.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm leading-tight">{card.title}</div>
                  <div className="text-white/80 text-xs mt-0.5">{card.count} guides</div>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <CircleArrowRight size={16} className="opacity-80" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
              {STATS.map((s, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-5">
                  <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-slate-800">{s.value}</div>
                    <div className="text-xs font-semibold text-slate-600">{s.label}</div>
                    <div className="text-[11px] text-slate-400">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}