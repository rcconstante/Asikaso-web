import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative text-center py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto relative">
          {/* Decorative Assets */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -left-12 opacity-80 hidden md:block w-20 h-20"
          >
            <img src="/assets/id.png" alt="ID Card" className="w-full h-full object-contain" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -top-4 -right-16 opacity-80 hidden md:block w-20 h-20"
          >
            <img src="/assets/cash.png" alt="Money" className="w-full h-full object-contain" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-20 -right-24 opacity-80 hidden md:block w-20 h-20"
          >
             <img src="/assets/Logo.png" alt="Logo" className="w-full h-full object-contain" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-0 -left-16 opacity-80 hidden md:block w-32 h-32"
          >
            <img src="/assets/jeep.png" alt="Jeepney" className="w-full h-full object-contain" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
              Stop guessing. Start completing.<br/>
              <span className="text-primary tracking-tight font-black underline decoration-primary/20 underline-offset-4">Asikaso na ’yan.</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 font-medium">
              We guide you step-by-step — from IDs to taxes to travel — with built-in AI and automation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4"
          >
            <Link to="/login" className="px-10 py-3 bg-primary text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-transform active:scale-95">
              Get Started
            </Link>
            <Link to="/guides" className="px-10 py-3 bg-white text-slate-700 font-bold rounded-full border border-gray-200 shadow-sm transition-transform active:scale-95">
              See Guides
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
