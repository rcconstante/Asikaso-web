import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('asikaso_cookie_consent');
    if (!consent) {
      // Small delay so it doesn't pop up immediately
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('asikaso_cookie_consent', 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('asikaso_cookie_consent', 'declined');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-0 sm:bottom-4 left-0 sm:left-4 right-0 sm:right-auto sm:max-w-md bg-white border border-slate-200 shadow-2xl rounded-t-2xl sm:rounded-2xl z-50 p-5 m-2 sm:m-0"
        >
          <button 
            onClick={() => setShow(false)} 
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-xl text-primary flex-shrink-0">
              <Cookie size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">We use cookies</h3>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                We use cookies to improve your experience and personalize content. By continuing to use this site, you agree to our policies.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={accept}
                  className="flex-1 bg-primary text-white font-semibold py-2 px-4 rounded-xl hover:bg-primary/90 transition-colors text-sm"
                >
                  Accept All
                </button>
                <button 
                  onClick={decline}
                  className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-xl hover:bg-slate-200 transition-colors text-sm"
                >
                  Essential Only
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
