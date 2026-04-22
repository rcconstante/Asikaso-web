import { useState, useRef, useEffect } from 'react';
import {
  Search, Home, TrendingUp, ArrowUp, ArrowDown,
  MessageSquare, Share2, Bookmark, MoreHorizontal,
  LayoutGrid, AlignJustify, Clock, Flame, Award,
  Sparkles, Zap, X, ChevronDown, HelpCircle,
} from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';

/* ─────────────────────────── mock data ─────────────────────────── */

const MOCK_POSTS = [
  {
    id: 1, community: 'r/freelancingPH', author: 'u/JuanFreelancer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    time: '3 hours ago',
    title: 'How I went from 0 to ₱80k/month as a freelancer in 6 months',
    body: "I started freelancing last year with zero clients. Here's my exact step-by-step process for landing high-paying clients through Upwork and LinkedIn. AMA!",
    upvotes: 342, comments: 87, tag: 'Career Advice', tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 2, community: 'r/taxPH', author: 'u/TaxGuru2025',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TaxGuru',
    time: '5 hours ago',
    title: '8% vs Graduated Tax: The definitive comparison for freelancers',
    body: "I created a detailed spreadsheet comparing both options at different income levels. Spoiler: 8% isn't always better. Link to the free calculator inside.",
    upvotes: 528, comments: 143, tag: 'Tax', tagColor: 'bg-yellow-100 text-yellow-700',
  },
  {
    id: 3, community: 'r/adultingPH', author: 'u/MariaAdulting',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    time: '8 hours ago',
    title: 'PSA: You can now get your NBI clearance renewed online — here is how',
    body: 'Just renewed mine online in 10 minutes. No more waiting in lines at NBI branches! Step-by-step guide and tips for first-timers below.',
    upvotes: 892, comments: 201, tag: 'Government', tagColor: 'bg-slate-100 text-slate-700',
  },
  {
    id: 4, community: 'r/travelPH', author: 'u/WanderlustPH',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wanderlust',
    time: '12 hours ago',
    title: 'Complete guide: Getting your first passport in 2025 (updated requirements)',
    body: 'Updated April 2025: New DFA requirements, e-passport costs, and appointment tips. Plus how to get a rush passport if you need it ASAP.',
    upvotes: 1203, comments: 315, tag: 'Travel', tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: 5, community: 'r/moneyPH', author: 'u/FinanceBoss',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Finance',
    time: '1 day ago',
    title: 'What is the best digital bank in the PH in 2025? Full comparison inside',
    body: "I compared Maya, GCash, Tonik, CIMB, and GoTyme on interest rates, fees, and ease of use. Here's my honest ranking after using all of them for 6+ months.",
    upvotes: 677, comments: 198, tag: 'Finance', tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 6, community: 'r/uncategorized', author: 'u/HealthyJuan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Healthy',
    time: '2 days ago',
    title: 'How to maximize your PhilHealth benefits — most people miss these',
    body: 'Did you know PhilHealth covers mental health consultations? Plus 5 other benefits Filipinos rarely claim. Everything you need to know.',
    upvotes: 445, comments: 92, tag: 'Healthcare', tagColor: 'bg-red-100 text-red-700',
  },
];

const RECENT_POSTS = [
  { title: 'Best laptop under ₱30k for WFH?',    community: 'r/freelancingPH', time: '20m ago' },
  { title: 'SSS contribution table 2025 update',   community: 'r/adultingPH',    time: '45m ago' },
  { title: 'Tips para sa first Upwork client',      community: 'r/freelancingPH', time: '1h ago' },
  { title: 'Anong bank ang mabilis mag approve?',  community: 'r/moneyPH',       time: '2h ago' },
  { title: 'NBI clearance renewal experience',     community: 'r/adultingPH',    time: '3h ago' },
];

const TRENDING_SEARCHES = [
  { label: 'ChatGPT Outage',                        sub: 'Based on your interests' },
  { label: 'Kimi K2.6 AI Model',                    sub: 'Based on your interests' },
  { label: 'Free Media Heck Yeah',                  sub: 'Based on your interests' },
  { label: 'Roi Vera Dog Attack Controversy',       sub: 'Based on your interests' },
  { label: 'Euphoria Season 3 Episode 2',           sub: '' },
  { label: "Wreddits Daily Pro-Wrestling Discussion Thread", sub: '' },
];

const SORT_OPTIONS = [
  { label: 'Best',   icon: <Award size={14} /> },
  { label: 'Hot',    icon: <Flame size={14} /> },
  { label: 'New',    icon: <Sparkles size={14} /> },
  { label: 'Top',    icon: <TrendingUp size={14} /> },
  { label: 'Rising', icon: <Zap size={14} /> },
];

const VIEW_OPTIONS = [
  { label: 'Card',    icon: <LayoutGrid size={14} /> },
  { label: 'Compact', icon: <AlignJustify size={14} /> },
];

const COMMUNITIES = [
  { name: 'r/adultingPH',     letter: 'A', color: 'bg-blue-600' },
  { name: 'r/freelancingPH',  letter: 'F', color: 'bg-emerald-600' },
  { name: 'r/taxPH',          letter: 'T', color: 'bg-yellow-600' },
  { name: 'r/travelPH',       letter: 'T', color: 'bg-purple-600' },
  { name: 'r/moneyPH',        letter: 'M', color: 'bg-teal-600' },
  { name: 'r/uncategorized',  letter: '?', color: 'bg-slate-500' },
];

/* ─────────────────────────── component ─────────────────────────── */

export default function ForumPage() {
  const [sort, setSort] = useState('Best');
  const [view, setView] = useState('Card');
  const [sortOpen, setSortOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['How to get TIN', 'Best savings account', 'PhilHealth registration']);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) setViewOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getVoteCount = (post: typeof MOCK_POSTS[0]) => post.upvotes + (votes[post.id] || 0);

  const handleVote = (id: number, dir: number) => {
    setVotes(prev => {
      const current = prev[id] || 0;
      if (current === dir) return { ...prev, [id]: 0 };
      return { ...prev, [id]: dir };
    });
  };

  const handleSearch = (term: string) => {
    if (term.trim()) setRecentSearches(prev => [term, ...prev.filter(s => s !== term)].slice(0, 5));
    setSearchVal(term);
    setSearchFocused(false);
  };

  const formatVotes = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n.toString();

  const currentSort = SORT_OPTIONS.find(s => s.label === sort)!;
  const currentView = VIEW_OPTIONS.find(v => v.label === view)!;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-5 py-6">
        <div className="flex gap-6">

          {/* ═══ LEFT SIDEBAR ═══ */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <nav className="sticky top-[78px] space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm">
                <Home size={18} /> Home
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors">
                <TrendingUp size={18} /> Popular
              </button>

              <div className="pt-6 pb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Communities</p>
              </div>
              {COMMUNITIES.map(c => (
                <button key={c.name} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors">
                  <div className={`w-6 h-6 ${c.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                    {c.letter === '?' ? <HelpCircle size={12} /> : c.letter}
                  </div>
                  {c.name}
                </button>
              ))}
            </nav>
          </aside>

          {/* ═══ MAIN FEED ═══ */}
          <main className="flex-1 min-w-0">

            {/* Search */}
            <div className="relative mb-4" ref={searchRef}>
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <input
                type="text"
                placeholder="Search the forum..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(searchVal); }}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />

              {searchFocused && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-30 animate-fade-in">
                  {recentSearches.length > 0 && (
                    <div className="px-4 pt-3 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent</p>
                        <button onClick={() => setRecentSearches([])} className="text-xs text-blue-600 hover:underline">Clear</button>
                      </div>
                      {recentSearches.map((rs, i) => (
                        <button key={i} onClick={() => handleSearch(rs)}
                          className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-600 transition-colors">
                          <Clock size={14} className="text-slate-400" /> {rs}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-slate-100 px-4 pt-3 pb-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Trending</p>
                    {TRENDING_SEARCHES.map((ts, i) => (
                      <button key={i} onClick={() => handleSearch(ts.label)}
                        className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700 transition-colors">
                        <TrendingUp size={14} className="text-blue-500" />
                        <div className="text-left">
                          <p className="font-medium">{ts.label}</p>
                          {ts.sub && <p className="text-[10px] text-slate-400">{ts.sub}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort + View — side by side dropdown buttons */}
            <div className="flex items-center gap-2 mb-5">
              {/* Sort Dropdown */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => { setSortOpen(v => !v); setViewOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  {currentSort.icon}
                  {sort}
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute left-0 mt-1 w-40 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-20 animate-fade-in">
                    {SORT_OPTIONS.map(s => (
                      <button
                        key={s.label}
                        onClick={() => { setSort(s.label); setSortOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors ${
                          sort === s.label ? 'text-blue-600 bg-blue-50' : 'text-slate-700'
                        }`}
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Dropdown */}
              <div className="relative" ref={viewRef}>
                <button
                  onClick={() => { setViewOpen(v => !v); setSortOpen(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  {currentView.icon}
                  {view}
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${viewOpen ? 'rotate-180' : ''}`} />
                </button>
                {viewOpen && (
                  <div className="absolute left-0 mt-1 w-36 bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden z-20 animate-fade-in">
                    {VIEW_OPTIONS.map(v => (
                      <button
                        key={v.label}
                        onClick={() => { setView(v.label); setViewOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors ${
                          view === v.label ? 'text-blue-600 bg-blue-50' : 'text-slate-700'
                        }`}
                      >
                        {v.icon} {v.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Posts */}
            <div className={view === 'Compact' ? 'space-y-2' : 'space-y-4'}>
              {MOCK_POSTS.map(post => (
                view === 'Card' ? (
                  <article key={post.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="flex">
                      <div className="flex flex-col items-center gap-1 px-3 py-4 bg-slate-50 border-r border-slate-100">
                        <button onClick={() => handleVote(post.id, 1)} className={`p-1 rounded hover:bg-blue-50 transition-colors ${votes[post.id] === 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                          <ArrowUp size={18} />
                        </button>
                        <span className="text-xs font-bold text-slate-800">{formatVotes(getVoteCount(post))}</span>
                        <button onClick={() => handleVote(post.id, -1)} className={`p-1 rounded hover:bg-red-50 transition-colors ${votes[post.id] === -1 ? 'text-red-500' : 'text-slate-400'}`}>
                          <ArrowDown size={18} />
                        </button>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                          <img src={post.avatar} alt="" className="w-5 h-5 rounded-full" />
                          <span className="font-semibold text-blue-600">{post.community}</span>
                          <span>•</span>
                          <span>Posted by {post.author}</span>
                          <span>•</span>
                          <span>{post.time}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mb-1.5 hover:text-blue-600 cursor-pointer transition-colors">{post.title}</h3>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 ${post.tagColor}`}>{post.tag}</span>
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{post.body}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors font-medium"><MessageSquare size={14} /> {post.comments} Comments</button>
                          <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors font-medium"><Share2 size={14} /> Share</button>
                          <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors font-medium"><Bookmark size={14} /> Save</button>
                          <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors font-medium"><MoreHorizontal size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </article>
                ) : (
                  <article key={post.id} className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-1 text-xs">
                      <button onClick={() => handleVote(post.id, 1)} className={`${votes[post.id] === 1 ? 'text-blue-600' : 'text-slate-400'}`}><ArrowUp size={14} /></button>
                      <span className="font-bold text-slate-800 w-8 text-center">{formatVotes(getVoteCount(post))}</span>
                      <button onClick={() => handleVote(post.id, -1)} className={`${votes[post.id] === -1 ? 'text-red-500' : 'text-slate-400'}`}><ArrowDown size={14} /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">{post.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{post.community} • {post.author} • {post.time}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0"><MessageSquare size={13} /> {post.comments}</div>
                  </article>
                )
              ))}
            </div>
          </main>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <aside className="w-72 flex-shrink-0 hidden xl:block">
            <div className="sticky top-[78px] space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3">
                  <h3 className="text-white font-bold text-sm">Recent Posts</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {RECENT_POSTS.map((rp, i) => (
                    <button key={i} className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors">
                      <p className="text-xs font-semibold text-slate-800 leading-snug mb-0.5">{rp.title}</p>
                      <p className="text-[10px] text-slate-400">{rp.community} • {rp.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4">
                <h3 className="font-bold text-sm text-slate-800 mb-3">Community Guidelines</h3>
                <ol className="space-y-2 text-xs text-slate-600">
                  <li className="flex gap-2"><span className="font-bold text-blue-600">1.</span> Be respectful and helpful</li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600">2.</span> No spam or self-promo</li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600">3.</span> Share verified info only</li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600">4.</span> Use appropriate tags</li>
                  <li className="flex gap-2"><span className="font-bold text-blue-600">5.</span> Be supportive of beginners</li>
                </ol>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-sm hover:shadow-md">
                + Create Post
              </button>
            </div>
          </aside>

        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.15s ease-out; }
      `}</style>
    </div>
  );
}
