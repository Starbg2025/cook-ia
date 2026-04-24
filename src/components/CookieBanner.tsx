import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Check } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100]"
        >
          <div className="bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-primary/5 to-transparent pointer-events-none" />
            
            <div className="flex items-start gap-4 relative">
              <div className="w-12 h-12 rounded-xl bg-orange-primary/10 flex items-center justify-center shrink-0">
                <Cookie className="text-orange-primary" size={24} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-lg">Cookies & Confidentialité</h3>
                  <button 
                    onClick={() => setIsVisible(false)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. En continuant, vous acceptez notre utilisation de cette technologie.
                </p>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-orange-primary hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-orange-primary/20 flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Tout accepter
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
