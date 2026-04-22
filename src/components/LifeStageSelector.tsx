import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Gem, 
  Car, 
  Plane, 
  Briefcase, 
  PiggyBank, 
  Gift, 
  Heart, 
  Receipt, 
  BarChart3, 
  CreditCard 
} from 'lucide-react';

const stages = [
  { id: 'grad', label: 'Just Graduated', icon: GraduationCap },
  { id: 'wedding', label: 'Getting Married', icon: Gem },
  { id: 'road', label: 'Hit the Road', icon: Car },
  { id: 'travel', label: 'Travel Ready', icon: Plane },
  { id: 'job', label: 'First Job Ready', icon: Briefcase },
  { id: 'money', label: 'Money Smart', icon: PiggyBank },
];

const guidesData: Record<string, any[]> = {
  grad: [
    { title: 'SSS Membership Registration', category: 'Benefits', time: '~30-60 min', steps: 4, icon: Gift, iconColor: 'text-orange-600', bgColor: 'bg-orange-100' },
    { title: 'PhilHealth Membership Registration', category: 'Healthcare', time: '~30-60 min', steps: 4, icon: Heart, iconColor: 'text-teal-600', bgColor: 'bg-teal-100' },
    { title: 'Pag-IBIG Fund Registration', category: 'Benefits', time: '~30-60 min', steps: 4, icon: Gift, iconColor: 'text-orange-700', bgColor: 'bg-orange-100' },
    { title: 'TIN Application', category: 'Tax', time: '~30-60 min', steps: 3, icon: Receipt, iconColor: 'text-amber-800', bgColor: 'bg-amber-100' },
    { title: 'Opening a Bank Account', category: 'Finance', time: '~30-60 min', steps: 2, icon: BarChart3, iconColor: 'text-emerald-700', bgColor: 'bg-emerald-100' },
    { title: 'PhilSys Registration', category: 'Id', time: '~30-60 min', steps: 4, icon: CreditCard, iconColor: 'text-rose-700', bgColor: 'bg-rose-100' },
  ],
  wedding: [
    { title: 'Marriage License Application', category: 'Legal', time: '~1-2 hours', steps: 5, icon: Gem, iconColor: 'text-pink-600', bgColor: 'bg-pink-100' },
    { title: 'CENOMAR Request', category: 'Legal', time: '~30 min', steps: 3, icon: Receipt, iconColor: 'text-purple-600', bgColor: 'bg-purple-100' },
  ],
  road: [
    { title: 'Student Permit Application', category: 'License', time: '~2-3 hours', steps: 4, icon: Car, iconColor: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Vehicle Registration (LTO)', category: 'Registration', time: '~1 day', steps: 6, icon: Receipt, iconColor: 'text-slate-600', bgColor: 'bg-slate-100' },
  ],
  travel: [
    { title: 'Passport Application', category: 'Travel', time: '~1-2 hours', steps: 5, icon: Plane, iconColor: 'text-sky-600', bgColor: 'bg-sky-100' },
    { title: 'Travel Clearance (DMW)', category: 'Travel', time: '~1 hour', steps: 4, icon: Receipt, iconColor: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  ],
  job: [
    { title: 'NBI Clearance Appointment', category: 'Clearance', time: '~30-60 min', steps: 3, icon: Briefcase, iconColor: 'text-slate-800', bgColor: 'bg-slate-200' },
    { title: 'Barangay Clearance', category: 'Clearance', time: '~30 min', steps: 2, icon: Receipt, iconColor: 'text-slate-600', bgColor: 'bg-slate-100' },
  ],
  money: [
    { title: 'BIR Registration', category: 'Tax', time: '~2 hours', steps: 6, icon: PiggyBank, iconColor: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Mutual Fund/UITF', category: 'Invest', time: '~1 hour', steps: 3, icon: BarChart3, iconColor: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  ]
};

export default function LifeStageSelector() {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const currentGuides = activeStage ? (guidesData[activeStage] || []) : [];

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Blue container for the whole widget */}
        <div className="bg-[#4a89f3] rounded-2xl overflow-hidden shadow-xl p-2 md:p-3 relative">
          
          {/* Tab Headers */}
          <div className="flex flex-wrap overflow-x-auto no-scrollbar gap-2 items-center justify-center lg:flex-nowrap">
            {stages.map((stage) => {
              const isActive = activeStage === stage.id;
              const Icon = stage.icon;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(prev => prev === stage.id ? null : stage.id)}
                  className={`flex flex-col items-center justify-center min-w-[110px] md:flex-1 py-3 px-2 rounded-xl transition-all duration-200 border-2 ${
                    isActive
                      ? 'bg-white text-slate-900 border-white shadow-sm'
                      : 'bg-white/20 text-white border-transparent hover:bg-white/30'
                  }`}
                >
                  <Icon size={20} className={`mb-1.5 ${isActive ? 'text-[#4a89f3]' : 'text-white'}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[11px] md:text-sm font-bold text-center leading-tight whitespace-nowrap">
                    {stage.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* White Content Area */}
          <AnimatePresence>
            {activeStage && (
              <motion.div 
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="bg-slate-50 rounded-xl overflow-hidden"
              >
                <div className="p-4 md:p-6 relative max-h-[500px] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                      {stages.find(s => s.id === activeStage)?.label || 'Guides'}
                    </h3>
                    <button 
                      onClick={() => setActiveStage(null)} 
                      className="p-1 px-3 text-slate-500 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors flex items-center gap-2 text-sm font-semibold"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentGuides.map((guide, idx) => {
                      const GuideIcon = guide.icon;
                      return (
                        <Link to="/login" 
                          key={idx} 
                          className="bg-white border-2 block border-[#4a89f3]/20 shadow-sm rounded-2xl p-5 hover:border-[#4a89f3]/60 hover:shadow-md transition-all duration-200 cursor-pointer group"
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${guide.bgColor}`}>
                            <GuideIcon size={22} className={guide.iconColor} strokeWidth={2.5} />
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#4a89f3] transition-colors">
                            {guide.title}
                          </h4>
                          <div className="flex items-center text-xs font-semibold text-slate-500 space-x-2">
                            <span className="capitalize">{guide.category}</span>
                            <span>•</span>
                            <span>{guide.time}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}
