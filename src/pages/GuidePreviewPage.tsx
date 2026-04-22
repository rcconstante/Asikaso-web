import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Plane, Building2, Wallet, CreditCard, Heart, Briefcase, Car, Shield, Scale, Home, Lock } from 'lucide-react';

export default function GuidePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('asikaso_token');
    setIsAuthenticated(!!token);
  }, []);

  const decodedTitle = decodeURIComponent(id || 'Getting a Local SIM Card When You Land');

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* Header */}
      <header className="bg-[#F8F9FA] sticky top-0 z-50 flex items-center justify-between px-4 py-4 max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm hover:bg-slate-50">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <span className="font-bold text-slate-800">Guide</span>
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm hover:bg-slate-50">
          <Bookmark size={20} className="text-slate-600" />
        </button>
      </header>

      {/* Guide Header */}
      <main className="max-w-4xl mx-auto px-4 mt-4">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#A855F7] text-white tracking-widest uppercase mb-4">
            <Plane size={14} /> Travel
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">{decodedTitle}</h1>
          <p className="text-slate-600 font-medium leading-relaxed max-w-3xl">
            Decide between eSIM, physical SIM at the airport, pocket WiFi, or PH carrier roaming. Country-by-country guide for top destinations: Japan, Korea, Hong Kong, Singapore, Thailand, Vietnam, Taiwan, USA, UAE, Australia, and Europe.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-slate-500 font-semibold bg-white p-3 rounded-lg border border-slate-200 shadow-sm inline-flex">
            <span className="flex items-center"><span className="mr-1">??</span> 16 steps</span>
            <span className="flex items-center"><span className="mr-1">??</span> 10-30 minutes</span>
            <span className="flex items-center"><span className="mr-1">?</span> Verified April 2026</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="p-6 sm:p-8 relative">
            <div className="space-y-6">
              {/* Visible Content */}
              <div className="flex gap-4">
                <span className="text-blue-500 mt-0.5">??</span>
                <p className="text-slate-700 font-medium leading-relaxed">
                  eSIM (Airalo, Nomad, Ubigi, capped data): USD 5 to USD 30 (about PHP 280 to PHP 1,700) for most short-trip data plans
                </p>
              </div>
              <div className="flex gap-4">
                <span className="w-5" />
                <p className="text-slate-700 font-medium leading-relaxed">
                  eSIM (Holafly, unlimited data): USD 11 (3 days) to USD 75 (30 days), about PHP 620 to PHP 4,200
                </p>
              </div>

              {/* Fading Content */}
              <div className="flex gap-4 opacity-70">
                <span className="w-5" />
                <p className="text-slate-700 font-medium leading-relaxed">
                  Pocket WiFi rental (Klook, KKDay): about PHP 250 to PHP 500 per day, shareable for 3 to 5 devices
                </p>
              </div>
              <div className="flex gap-4 opacity-40">
                <span className="w-5" />
                <p className="text-slate-700 font-medium leading-relaxed">
                  Globe and Smart roaming day passes: about PHP 250 to PHP 600 per day depending on country
                </p>
              </div>
              <div className="flex gap-4 opacity-20 blur-[2px]">
                <span className="w-5" />
                <p className="text-slate-700 font-medium leading-relaxed">
                  Japan tourist physical SIM: JPY 1,500 to JPY 4,000 (about PHP 530 to PHP 1,400) for 15 to 30 days
                </p>
              </div>
              <div className="flex gap-4 opacity-10 blur-[4px]">
                <span className="w-5" />
                <p className="text-slate-700 font-medium leading-relaxed">
                  Korea tourist physical SIM: KRW 27,500 to KRW 55,000 (about PHP 1,100 to PHP 2,200) for unlimited data
                </p>
              </div>
              <div className="flex gap-4 opacity-5 blur-[6px]">
                <span className="w-5" />
                <p className="text-slate-700 font-medium leading-relaxed">
                  Hong Kong tourist physical SIM: HKD 88 (5-day Discover Hong Kong Tourist SIM by csl) up to HKD 148
                </p>
              </div>
              <div className="flex gap-4 opacity-0 blur-[8px] h-32">
                <span className="w-5" />
                <p className="text-slate-700 font-medium leading-relaxed">
                  More hidden text lorem ipsum dolor sit.
                </p>
              </div>
            </div>

            {/* Gradient Overlay bottom to cover blurring neatly */}
            <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="w-full max-w-4xl">
          {isAuthenticated ? (
             <button className="w-full bg-[#3B5BDB] hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-lg">
                <Lock size={20} /> Proceed to Payment • ?79
             </button>
          ) : (
            <Link to="/signup" className="w-full block text-center bg-[#3B5BDB] hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-blue-900/20 transition-all text-lg tracking-wide">
              Sign up free to start this guide &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
