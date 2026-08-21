import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link as LinkIcon, Globe, ShoppingBag, ArrowRight } from 'lucide-react';

interface UrlInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  type: 'clone' | 'ecommerce';
  isDark?: boolean;
}

export const UrlInputModal: React.FC<UrlInputModalProps> = ({ isOpen, onClose, onSubmit, type, isDark = false }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedUrl = url.trim();
    if (formattedUrl) {
      if (!formattedUrl.startsWith('http')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      onSubmit(formattedUrl);
      setUrl('');
      onClose();
    }
  };

  const config = {
    clone: {
      title: "Cloner un site web",
      description: "Entrez l'URL du site que vous souhaitez reproduire. COOK IA analysera son design et sa structure.",
      placeholder: "https://exemple.com",
      icon: Globe,
      buttonText: "Analyser et Cloner"
    },
    ecommerce: {
      title: "Créer un E-commerce",
      description: "Collez le lien d'un produit (Amazon, Shein, etc.) pour générer une boutique en ligne complète.",
      placeholder: "https://amazon.fr/produit/...",
      icon: ShoppingBag,
      buttonText: "Générer la Boutique"
    }
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-lg ${
              isDark ? 'bg-[#141414] border border-white/10 text-white' : 'bg-white border border-slate-200 text-slate-900 shadow-2xl'
            } rounded-[32px] p-8 lg:p-10 shadow-2xl`}
          >
            <button 
              onClick={onClose}
              className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              }`}
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-orange-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Icon className="text-orange-primary" size={32} />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{current.title}</h2>
              <p className={`${isDark ? 'text-white/50' : 'text-slate-600'} text-sm leading-relaxed`}>
                {current.description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'} ml-1`}>URL de destination</label>
                <div className="relative group">
                  <LinkIcon className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-slate-400'} group-focus-within:text-orange-primary transition-colors`} size={18} />
                  <input 
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={current.placeholder}
                    className={`w-full ${
                      isDark ? 'bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    } border rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-orange-primary transition-all`}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!url.trim()}
                className={`w-full ${
                  isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-slate-900 text-white hover:bg-slate-800'
                } py-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-20 flex items-center justify-center gap-2 group shadow-sm`}
              >
                {current.buttonText}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
