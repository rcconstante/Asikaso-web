import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth state
  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('asikaso_token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <nav 
      className="h-16 px-8 flex items-center justify-between bg-white/80 border-b border-gray-100 backdrop-blur-md sticky top-0 z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/assets/logo-header.png" alt="Asikaso" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="/#guides" className="hover:text-primary transition-colors">Guides</a>
          <a href="/#features" className="hover:text-primary transition-colors">Features</a>
          <a href="/#pricing" className="hover:text-primary transition-colors">Pricing</a>
          
          {isAuthenticated ? (
            <Link to="/dashboard" className="px-5 py-2 bg-primary text-white rounded-full hover:opacity-90 transition-all font-semibold">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="px-5 py-2 bg-slate-900 text-white rounded-full hover:opacity-90 transition-all font-semibold">
              Log in / Sign up
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-primary transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden absolute top-16 left-0 right-0 shadow-lg"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a href="/#guides" className="block px-3 py-3 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">Guides</a>
              <a href="/#features" className="block px-3 py-3 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">Features</a>
              <a href="/#pricing" className="block px-3 py-3 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">Pricing</a>
              <div className="pt-4 flex flex-col space-y-3">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="w-full text-center bg-primary text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="w-full text-center bg-slate-100 px-5 py-3 rounded-xl font-semibold text-slate-700">
                      Log in
                    </Link>
                    <Link to="/signup" className="w-full text-center bg-primary text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25">
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
