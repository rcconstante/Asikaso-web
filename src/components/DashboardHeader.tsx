import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, User, LayoutDashboard, FileText, MessageSquare,
  BookOpen, ChevronDown, X, MessageCircle, ThumbsUp,
  Star, Info, Award, Monitor, LogOut, Settings,
} from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1, type: 'reaction',
    icon: <ThumbsUp size={13} />, color: 'bg-blue-500',
    text: 'Juan dela Cruz reacted 👍 to your post in Forum.',
    time: '2 mins ago', unread: true,
  },
  {
    id: 2, type: 'forum',
    icon: <MessageCircle size={13} />, color: 'bg-emerald-500',
    text: 'Maria Santos replied to your comment on "8% vs Graduated Tax".',
    time: '15 mins ago', unread: true,
  },
  {
    id: 3, type: 'update',
    icon: <Star size={13} />, color: 'bg-yellow-500',
    text: 'New guide: "How to Get Your PhilHealth ID in 2025".',
    time: '1 hr ago', unread: true,
  },
  {
    id: 4, type: 'update',
    icon: <Info size={13} />, color: 'bg-purple-500',
    text: 'The "OFW Ready" guide has been updated.',
    time: '3 hrs ago', unread: false,
  },
  {
    id: 5, type: 'reaction',
    icon: <ThumbsUp size={13} />, color: 'bg-blue-500',
    text: 'Pedro Reyes and 3 others liked your forum post.',
    time: '1 day ago', unread: false,
  },
];

const NAV = [
  { label: 'Dashboard', icon: <LayoutDashboard size={16} />, to: '/dashboard' },
  { label: 'Guides',    icon: <BookOpen size={16} />,        to: '/guides' },
  { label: 'Forum',     icon: <MessageSquare size={16} />,   to: '/forum' },
  { label: 'Reminders', icon: <Bell size={16} />,            to: '/reminders' },
  { label: 'PDF Forms', icon: <FileText size={16} />,        to: '/pdf-forms' },
];

export default function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const PROFILE_MENU = [
    { label: 'View Profile',  icon: <User size={16} />,    action: () => { navigate('/profile'); setProfileOpen(false); } },
    { label: 'Achievements',  icon: <Award size={16} />,   action: () => { navigate('/profile?tab=achievements'); setProfileOpen(false); } },
    { label: 'Settings',      icon: <Settings size={16} />, action: () => { navigate('/profile?tab=settings'); setProfileOpen(false); } },
  ];

  return (
    <header className="bg-[#0F172A] sticky top-0 z-50 h-[62px] flex items-center shadow-md">
      <div className="w-full max-w-7xl mx-auto px-5 flex items-center gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow">
            <img src="/assets/Logo.png" alt="" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-none">Asikaso</div>
            <div className="text-slate-400 text-[10px] leading-none mt-0.5">Life tasks. Step by step. Asikaso na 'yan.</div>
          </div>
        </Link>

        {/* Nav — Profile removed */}
        <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
          {NAV.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Notification + Profile Avatar Dropdown */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(v => !v)}
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border-2 border-[#0F172A]">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {MOCK_NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${n.unread ? 'bg-blue-50/50' : ''}`}>
                      <span className={`flex-shrink-0 w-7 h-7 rounded-full ${n.color} text-white flex items-center justify-center mt-0.5`}>{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 leading-snug">{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                      {n.unread && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-slate-100 text-center">
                  <a href="#" className="text-xs text-blue-600 font-semibold hover:underline">See all notifications</a>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar + Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-1.5 cursor-pointer group"
            >
              <div className={`w-9 h-9 rounded-full overflow-hidden ring-2 ${profileOpen ? 'ring-blue-400' : 'ring-blue-500'} transition-all`}>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rich" alt="Avatar" className="w-full h-full" />
              </div>
              <ChevronDown size={14} className={`transition-all ${profileOpen ? 'text-white rotate-180' : 'text-slate-400 group-hover:text-white'}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rich" alt="" className="w-full h-full" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Rich</p>
                      <p className="text-[10px] text-slate-400">rc202300000@gmail.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {PROFILE_MENU.map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                    >
                      <span className="text-slate-400">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}

                  {/* Display mode toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-slate-400"><Monitor size={16} /></span>
                      Dark Mode
                    </span>
                    <div className={`w-9 h-5 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-300'} relative`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${darkMode ? 'left-4.5' : 'left-0.5'}`}
                        style={{ left: darkMode ? '18px' : '2px' }} />
                    </div>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 py-1">
                  <Link
                    to="/"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LogOut size={16} />
                    Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.15s ease-out; }
      `}</style>
    </header>
  );
}
