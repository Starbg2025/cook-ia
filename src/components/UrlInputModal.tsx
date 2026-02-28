import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link as LinkIcon, Globe, ShoppingBag, ArrowRight } from 'lucide-react';

interface UrlInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  type: 'clone' | 'ecommerce';
}

export const UrlInputModal: React.FC<UrlInputModalProps> = ({ isOpen, onClose, onSubmit, type }) => {
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-[32px] p-8 lg:p-10 shadow-2xl text-white"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-orange-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Icon className="text-orange-primary" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">{current.title}</h2>
              <p className="text-white/40 text-sm leading-relaxed">
                {current.description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">URL de destination</label>
                <div className="relative group">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-primary transition-colors" size={18} />
                  <input 
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={current.placeholder}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-orange-primary/50 transition-all placeholder:text-white/10"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!url.trim()}
                className="w-full bg-white text-black py-4 rounded-2xl font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-20 flex items-center justify-center gap-2 group"
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
