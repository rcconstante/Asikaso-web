import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronRight, X, Lock,
  Plane, Building2, Wallet, CreditCard, Heart,
  Briefcase, Car, Shield, BookOpen, Grid3X3, Scale, Home, Info, Gift, PiggyBank,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardHeader from '../components/DashboardHeader';
import Navbar from '../components/Navbar';

/* ───────────────────────── data ───────────────────────── */

const CATEGORIES = [
  { label: 'All',               icon: <Grid3X3 size={14} /> },
  { label: 'Travel',            icon: <Plane size={14} /> },
  { label: 'Finance',           icon: <Wallet size={14} /> },
  { label: 'Government',        icon: <Building2 size={14} /> },
  { label: 'IDs',               icon: <CreditCard size={14} /> },
  { label: 'Healthcare',        icon: <Heart size={14} /> },
  { label: 'Workplace',         icon: <Briefcase size={14} /> },
  { label: 'Benefits',          icon: <Shield size={14} /> },
  { label: 'Tax',               icon: <Scale size={14} /> },
  { label: 'Vehicle',           icon: <Car size={14} /> },
  { label: 'Housing',           icon: <Home size={14} /> },
];

const GUIDES_DATA = [
  { title: 'Getting a Local SIM Card When You Land',            category: 'Travel',     steps: 16, price: 79, icon: <Plane size={22} />,       iconBg: 'bg-purple-100 text-purple-600', time: '10-30 min' },
  { title: 'SSS (Social Security System) Registration',         category: 'Benefits',   steps: 4,  price: 79, icon: <Gift size={22} />,        iconBg: 'bg-orange-100 text-orange-600', time: '30 min' },
  { title: 'PhilHealth Registration for New Employees',         category: 'Healthcare', steps: 4,  price: 79, icon: <Heart size={22} />,       iconBg: 'bg-teal-100 text-teal-600', time: '30 min' },
  { title: 'Pag-IBIG Fund Registration',                        category: 'Benefits',   steps: 4,  price: 79, icon: <Gift size={22} />,        iconBg: 'bg-orange-100 text-orange-600', time: '30 min' },
  { title: 'How to Get a TIN (Tax Identification Number)',      category: 'Tax',        steps: 3,  price: 79, icon: <Scale size={22} />,       iconBg: 'bg-amber-100 text-amber-600', time: '1 hr' },
  { title: 'Opening a Savings Account',                         category: 'Finance',    steps: 2,  price: 79, icon: <Wallet size={22} />,      iconBg: 'bg-blue-100 text-blue-600', time: '1 hr' },
  { title: 'National ID (PhilSys) Registration',                category: 'IDs',        steps: 4,  price: 79, icon: <CreditCard size={22} />,  iconBg: 'bg-rose-100 text-rose-600', time: '1.5 hrs' },
  { title: 'NBI Clearance Appointment',                         category: 'Government', steps: 3,  price: 79, icon: <Building2 size={22} />,   iconBg: 'bg-slate-100 text-slate-600', time: '1 hr' },
];

const BUNDLES_DATA = [
  { title: 'First Job Ready', subtitle: 'Gov docs, payslip math, and contract know-how for day one', price: 199, guidesCount: 8, baseColor: '#10B981', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  { title: 'Just Graduated', subtitle: 'The starter pack for leaving university', price: 199, guidesCount: 9, baseColor: '#F59E0B', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  { title: 'Freelancer', subtitle: 'Setting up taxes and invoicing as a pro', price: 299, guidesCount: 10, baseColor: '#6366F1', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
  { title: 'Getting Married', subtitle: 'Paperwork for tying the knot', price: 349, guidesCount: 8, baseColor: '#F43F5E', color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
  { title: 'Building a Family', subtitle: 'Birth certificates, dependents, and schools', price: 349, guidesCount: 8, baseColor: '#EC4899', color: 'bg-pink-500/10 text-pink-600 border-pink-200' },
  { title: 'Travel Ready', subtitle: 'Passports, visas, and SIM cards', price: 349, guidesCount: 6, baseColor: '#A855F7', color: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200' },
];

const SORT_OPTIONS = ['A to Z', 'Z to A', 'Newest', 'Most Steps'];

export default function GuidesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'guides' | 'bundles'>('guides');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('A to Z');
  const [showSort, setShowSort] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Modals state
  const [selectedBundle, setSelectedBundle] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('asikaso_token');
    setIsAuthenticated(!!token);
  }, []);

  const filteredGuides = GUIDES_DATA.filter(g => {
    const matchCategory = activeCategory === 'All' || g.category === activeCategory;
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredBundles = BUNDLES_DATA.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleGuideClick = (guide: any) => {
    navigate(`/guide/${encodeURIComponent(guide.title)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 pb-20">
      {isAuthenticated ? <DashboardHeader /> : <Navbar />}

      <div className="max-w-4xl mx-auto px-5 py-10 relative z-10">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-1">Guides & Bundles</h1>
        <p className="text-slate-500 mb-8">Step-by-step instructions for adulting in the PH</p>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'guides' ? "Search guides..." : "Search bundles..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all font-medium"
          />
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-6 bg-white shadow-sm">
          <button
            onClick={() => setActiveTab('guides')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all ${
              activeTab === 'guides' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50 border-b-2 border-transparent'
            }`}
          >
            <BookOpen size={16} /> Guides
          </button>
          <button
            onClick={() => setActiveTab('bundles')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all ${
              activeTab === 'bundles' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50 border-b-2 border-transparent'
            }`}
          >
            <Shield size={16} /> Bundles
          </button>
        </div>

        {/* Content based on Tab */}
        {activeTab === 'guides' ? (
          <>
            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeCategory === cat.label
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Count + Sort */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredGuides.length} GUIDES</p>
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-sm"
                >
                  {sortBy} <ChevronDown size={14} />
                </button>
                {showSort && (
                  <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-20">
                    {SORT_OPTIONS.map(so => (
                      <button
                        key={so}
                        onClick={() => { setSortBy(so); setShowSort(false); }}
                        className={`block w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors ${sortBy === so ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                      >
                        {so}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Guide list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGuides.map((guide, i) => (
                <div
                  key={i}
                  onClick={() => handleGuideClick(guide)}
                  className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between w-full">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${guide.iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
                       {guide.icon}
                     </div>
                     <span className="inline-block bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-1 rounded-md border border-blue-100/50">₱{guide.price}</span>
                  </div>
                  <div className="flex-1 min-w-0 mt-1">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">{guide.category}</p>
                    <h3 className="font-bold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">{guide.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
                      <Info size={12} className="text-slate-400"/> {guide.steps} systematic steps
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredBundles.length} BUNDLES</p>
            </div>
            
            {/* Bundles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredBundles.map((bundle, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedBundle(bundle)}
                  className={`rounded-2xl border-2 p-5 flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden bg-white ${bundle.color.split(' ')[2]}`}
                >
                  {/* Decorative background blur */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-60" style={{ backgroundColor: bundle.baseColor }}></div>
                  
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="pr-4">
                      <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-blue-700 transition-colors">{bundle.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{bundle.subtitle}</p>
                    </div>
                  </div>
                  <div className="mt-auto relative z-10">
                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{bundle.guidesCount} Guides Included</p>
                    <div className="flex items-center justify-between">
                       <span className={`text-sm font-extrabold px-3 py-1.5 rounded-lg ${bundle.color.split(' ')[0]} ${bundle.color.split(' ')[1]}`}>
                         ₱{bundle.price}
                       </span>
                       <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bundle Modal (Enlarged and Re-styled) */}
      <AnimatePresence>
        {selectedBundle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedBundle(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#F8F9FA] rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
            >
              <button onClick={() => setSelectedBundle(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-20 transition-colors">
                <X size={20} />
              </button>
              
              <div className="overflow-y-auto custom-scrollbar flex-1 relative rounded-t-3xl">
                {/* Large Green Header area */}
                <div 
                  className="px-6 py-10 sm:px-10 sm:py-12 relative rounded-b-2xl shadow-sm z-10" 
                  style={{ backgroundColor: selectedBundle.baseColor }}
                >
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '16px 16px' }} />
                  
                  <Briefcase size={36} className="text-white/90 mb-4" />
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2">
                    {selectedBundle.title}
                  </h2>
                  <p className="text-white/80 text-sm md:text-base font-medium max-w-xl mb-6">
                    {selectedBundle.subtitle}
                  </p>
                  
                  {isAuthenticated ? (
                     <button className="bg-white text-slate-900 font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2">
                       <CreditCard size={18} /> Buy bundle for ₱{selectedBundle.price}
                     </button>
                  ) : (
                    <Link to="/signup" className="inline-block bg-white text-emerald-600 font-extrabold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform tracking-wide">
                      Login to buy this bundle
                    </Link>
                  )}
                </div>

                {/* Guides List */}
                <div className="p-6 sm:p-10 -mt-6 pt-12 relative z-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    {selectedBundle.guidesCount} Essential Guides
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    {GUIDES_DATA.map((g: any, idx: number) => (
                      <div key={idx} onClick={() => handleGuideClick(g)} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${g.iconBg}`}>
                          {g.icon}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm md:text-base font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors mb-0.5 truncate">{g.title}</p>
                          <p className="text-xs font-medium text-slate-500 truncate">Register with {g.category} for benefits, loans, and retirement options.</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 flex-shrink-0" />
                      </div>
                    ))}
                    
                    <div className="text-center py-6 text-sm font-semibold text-slate-400">
                      End of bundle list
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
