import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Award, BookOpen, Camera, Check, ChevronRight,
  Clock, Edit2, Globe, Lock, Mail, Moon, Settings,
  Shield, Star, Sun, User, X,
} from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';

/* ─────────────────────────── mock data ─────────────────────────── */

const BADGES = [
  { name: 'Starter Suki',    desc: 'Just getting started',                    sub: '',                                         unlocked: true,  img: '/assets/badge/startersuki.png' },
  { name: 'Founding Suki',   desc: 'One of the first 150 users',       sub: 'You are one of the OGs! Respect.',         unlocked: true,  img: '/assets/badge/foundingsuki.png' },
  { name: 'Loyal Suki',      desc: 'Bought 10 guides',                 sub: '',                                         unlocked: false, img: '/assets/badge/loyalsuki.png' },
  { name: 'Adulting Pro',    desc: 'Completed 100 guides',             sub: '',                                         unlocked: false, img: '/assets/badge/adultingpro.png' },
  { name: 'Legend Mode',     desc: 'Bought all guides',                sub: '',                                         unlocked: false, img: '/assets/badge/legendmode.png' },
];

const ACHIEVEMENTS = [
  { name: 'Feed Finder',      desc: 'Visited the Forum for the first time',   unlocked: true, img: '/assets/achievement/feedfinder.png' },
  { name: 'Joined Community', desc: 'Joined your first community',            unlocked: true, img: '/assets/achievement/joinedcommunity.png' },
  { name: 'Secured Account',  desc: 'Completed profile settings',             unlocked: true, img: '/assets/achievement/secured.png' },
  { name: 'First Guide',      desc: 'Completed your first guide',             unlocked: false, img: '/assets/achievement/firstguide.png' },
  { name: 'Helpful Post',     desc: 'Got 10 upvotes on a forum post',         unlocked: false, img: '/assets/achievement/helpfulpost.png' },
  { name: 'Form Filler',      desc: 'Used the PDF Form Filler for the first time', unlocked: false, img: '/assets/achievement/formfiller.png' },
  { name: 'Streak Starter',   desc: 'Logged in 7 days in a row',              unlocked: false, img: '/assets/achievement/streakstarter.png' },
  { name: 'Community Star',   desc: 'Got 50 upvotes on forum posts',          unlocked: false, img: '/assets/achievement/communitystar.png' },
];

const OWNED_GUIDES: { title: string; category: string; progress: number }[] = [];

const PROFANITY_LIST = ['badword', 'stupid', 'idiot', 'gago', 'tanga', 'bobo', 'puta', 'fuck', 'shit', 'bullshit', 'asshole'];

/* ─────────────────────────── component ─────────────────────────── */

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [displayName, setDisplayName] = useState('Rich');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(displayName);
  const [nameError, setNameError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [timezone, setTimezone] = useState('Asia/Manila');

  const handleSaveName = () => {
    setNameError('');
    if (!tempName.trim()) {
      setEditingName(false);
      return;
    }
    const hasProfanity = PROFANITY_LIST.some(word => tempName.toLowerCase().includes(word));
    if (hasProfanity) {
      setNameError('Please avoid using inappropriate words.');
      return;
    }
    setDisplayName(tempName.trim());
    setEditingName(false);
  };

  const TABS = [
    { id: 'profile',      label: 'Profile' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'settings',     label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <DashboardHeader />

      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-[#3B5BDB] via-[#4C6EF5] to-[#6C8EFF] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="max-w-4xl mx-auto px-5 py-8 relative z-10">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-amber-800 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white/30 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rich" alt="" className="w-full h-full" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-md transition-colors">
                <Camera size={14} />
              </button>
            </div>

            {/* Name + Email */}
            <div className="text-white">
              <div className="flex items-center gap-2">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={e => setTempName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 px-3 py-1.5 rounded-lg text-xl font-bold focus:outline-none focus:ring-2 focus:ring-white/40"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="p-1 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"><Check size={16} /></button>
                    <button onClick={() => { setEditingName(false); setTempName(displayName); setNameError(''); }} className="p-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-extrabold">{displayName}</h1>
                    <button onClick={() => { setEditingName(true); setTempName(displayName); }} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <Edit2 size={14} />
                    </button>
                  </>
                )}
              </div>
              {nameError && <p className="text-red-200 text-xs font-bold mt-1 bg-red-900/50 inline-block px-2 py-0.5 rounded shadow">{nameError}</p>}
              <p className="text-blue-200 text-sm mt-1">rc202300000@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 sticky top-[62px] z-40">
        <div className="max-w-4xl mx-auto px-5 flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">

        {/* ══════════ PROFILE TAB ══════════ */}
        {activeTab === 'profile' && (
          <div className="space-y-10">
            {/* Badges */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5">
                <Award size={22} className="text-yellow-500" /> Badges
              </h2>
              <div className="flex gap-6 overflow-x-auto pb-2">
                {BADGES.map((b, i) => (
                  <div key={i} className={`flex flex-col items-center text-center min-w-[120px] ${!b.unlocked ? 'opacity-40' : ''}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 border-4 ${
                      b.unlocked ? 'bg-yellow-100 border-yellow-400' : 'bg-slate-100 border-slate-200'
                    }`}>
                      {b.unlocked ? <img src={b.img} alt={b.name} className="w-14 h-14 object-contain" /> : <Lock size={24} className="text-slate-400" />}
                    </div>
                    <p className={`text-xs font-bold ${b.unlocked ? 'text-blue-600' : 'text-slate-500'}`}>{b.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                    {b.sub && <p className="text-[10px] text-slate-500 mt-1 italic">{b.sub}</p>}
                  </div>
                ))}
              </div>
            </section>

            {/* Owned Guides and Bundles */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                <BookOpen size={22} className="text-blue-600" /> Owned Guides and Bundles
              </h2>
              {OWNED_GUIDES.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                  <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No guides or bundles unlocked yet</h3>
                  <p className="text-sm text-slate-500 mb-6">Purchase guides or bundles to see them here</p>
                  <Link to="/guides" className="text-blue-600 font-semibold text-sm hover:underline">
                    Browse guides
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {OWNED_GUIDES.map((g, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-800">{g.title}</p>
                        <p className="text-xs text-slate-400">{g.category}</p>
                      </div>
                      <div className="text-xs font-bold text-blue-600">{g.progress}%</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ══════════ ACHIEVEMENTS TAB ══════════ */}
        {activeTab === 'achievements' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <Star size={22} className="text-yellow-500" /> Achievements
              </h2>
              <p className="text-sm text-slate-500">
                <span className="font-bold text-blue-600">{ACHIEVEMENTS.filter(a => a.unlocked).length}</span> / {ACHIEVEMENTS.length} unlocked
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((a, i) => (
                <div key={i} className={`bg-white rounded-2xl border p-5 text-center shadow-sm transition-all ${
                  a.unlocked ? 'border-yellow-200 hover:shadow-md' : 'border-slate-100 opacity-50'
                }`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    a.unlocked ? 'bg-yellow-50' : 'bg-slate-50'
                  }`}>
                    {a.unlocked ? <img src={a.img} alt={a.name} className="w-10 h-10 object-contain" /> : <Lock size={20} className="text-slate-400" />}
                  </div>
                  <p className="font-bold text-sm text-slate-800 mb-0.5">{a.name}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ SETTINGS TAB ══════════ */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Account */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Account</h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Email address</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">rc202300000@gmail.com</p>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Display Name</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-500">{displayName}</p>
                    <button onClick={() => { setEditingName(true); setTempName(displayName); setActiveTab('profile'); }}
                      className="text-blue-600 text-sm font-semibold hover:underline">
                      Edit
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">Timezone</p>
                    </div>
                  </div>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Date & Time */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Date & Time</h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-slate-400" />
                    <p className="text-sm font-medium text-slate-800">Date Format</p>
                  </div>
                  <div className="flex gap-2">
                    {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(f => (
                      <button
                        key={f}
                        onClick={() => setDateFormat(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          dateFormat === f
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-slate-400" />
                    <p className="text-sm font-medium text-slate-800">Time Format</p>
                  </div>
                  <div className="flex gap-2">
                    {['12h', '24h'].map(f => (
                      <button
                        key={f}
                        onClick={() => setTimeFormat(f)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          timeFormat === f
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Account Authorization */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Account Authorization</h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Google</p>
                    <p className="text-xs text-slate-500">Connect to log in with your Google account</p>
                  </div>
                  <button className="px-4 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    Connect
                  </button>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Two-factor authentication</p>
                    <p className="text-xs text-slate-500">Add extra security to your account</p>
                  </div>
                  <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
                  </div>
                </div>
              </div>
            </section>

            {/* Danger zone */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Advanced</h2>
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-red-600">Delete account</p>
                    <p className="text-xs text-slate-500">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-1.5 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
