import { FileText, Bot, Calendar, Shield, MonitorSmartphone, BookOpen } from 'lucide-react';

export default function Features() {
  return (
    <div id="features" className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-bold text-sm uppercase tracking-widest mb-4">
          Features
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-6">
          Everything you need for adulting
        </h2>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium">
          Asikaso simplifies complicated government processes<br/> so you can focus on what matters.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Guides */}
          <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-3xl p-8 relative overflow-hidden flex flex-col items-start justify-center shadow-sm">
            <span className="absolute top-8 left-8 text-sm font-bold text-blue-500 bg-white/60 px-3 py-1 rounded-full">01</span>
            <div className="mt-8 mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-6">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Step-by-Step Guides</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Clear, actionable instructions for all essential government processes in the Philippines.
              </p>
            </div>
          </div>

          {/* Card 2: Form Filler */}
          <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] rounded-3xl p-8 relative overflow-hidden shadow-sm">
            <span className="absolute top-8 left-8 text-sm font-bold text-emerald-500 bg-white/60 px-3 py-1 rounded-full">02</span>
            <div className="mt-8 mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-6">
                <FileText size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Form Filler &<br/>Automation</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Automatically map your data to PDFs and reduce repetitive form-filling for SSS, PhilHealth, and more.
              </p>
            </div>
          </div>

          {/* Card 3: AI Companion */}
          <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-3xl p-8 relative overflow-hidden shadow-sm">
            <span className="absolute top-8 left-8 text-sm font-bold text-violet-500 bg-white/60 px-3 py-1 rounded-full">03</span>
            <div className="mt-8 mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-violet-600 mb-6">
                <Bot size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Companion</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Ask Asikaso AI about conflicting requirements, specific locations, or what to say to the desk officer.
              </p>
            </div>
          </div>

          {/* Card 4: Reminders */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] rounded-3xl p-8 relative overflow-hidden shadow-sm flex flex-col justify-center">
            <span className="absolute top-8 left-8 text-sm font-bold text-amber-500 bg-white/60 px-3 py-1 rounded-full">04</span>
            <div className="md:w-3/5 mt-8 md:mt-0">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-500 mb-6">
                <Calendar size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Calendar & Reminders</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Never miss an appointment or renewal date with custom tracking and smart alerts.
              </p>
            </div>
          </div>

          {/* Card 5: Secure */}
          <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] rounded-3xl p-8 relative overflow-hidden shadow-sm">
            <span className="absolute top-8 left-8 text-sm font-bold text-rose-500 bg-white/60 px-3 py-1 rounded-full">05</span>
            <div className="mt-8">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500 mb-6">
                <Shield size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Secure & Private</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Your data is encrypted and never shared. We take your privacy seriously.
              </p>
            </div>
          </div>

          {/* Card 6: Access Anywhere */}
          <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-[#F0F9FF] to-[#E0F2FE] rounded-3xl p-8 sm:px-12 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
             <div className="flex gap-6 items-center z-10 w-full mb-6 md:mb-0">
               <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-sky-500 shrink-0">
                 <MonitorSmartphone size={32} />
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Access Anywhere</h3>
                  <p className="text-slate-600 font-medium">Use Asikaso on any device, anytime. Your progress is always saved.</p>
               </div>
             </div>
             <div className="z-10 text-right shrink-0">
                <p className="text-sky-700 font-bold mb-1">Web, mobile, tablet—</p>
                <p className="text-sky-600 font-semibold">Asikaso goes with you.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
