import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Loader2, Image as ImageIcon, Type, Search, Layout, CheckCircle } from 'lucide-react';
import { SectionEditState } from '../types';

interface SectionChatProps {
  section: SectionEditState;
  onClose: () => void;
  onUpdate: (prompt: string) => void;
  isLoading: boolean;
  currentAgent?: 'analyst' | 'engineer' | 'critic' | null;
  onOpenImageSearch?: () => void;
  onImproveText?: (style: 'professional' | 'creative' | 'sales') => void;
}

export const SectionChat: React.FC<SectionChatProps> = ({
  section,
  onClose,
  onUpdate,
  isLoading,
  currentAgent,
  onOpenImageSearch,
  onImproveText
}) => {
  const [prompt, setPrompt] = useState('');
  const [showCopywriting, setShowCopywriting] = useState(false);

  if (!section.isActive) return null;

  const copywritingStyles: { id: 'professional' | 'creative' | 'sales', label: string, desc: string }[] = [
    { id: 'professional', label: 'Professional', desc: 'Serious & Reassuring' },
    { id: 'creative', label: 'Creative', desc: 'Original & Dynamic' },
    { id: 'sales', label: 'Sales', desc: 'Conversion Focused' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-[#141414] border border-white/10 rounded-[2.5rem] shadow-2xl p-6 pointer-events-auto relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-primary to-blue-500" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-primary/20 flex items-center justify-center">
              <Sparkles size={16} className="text-orange-primary" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest">Section Editor</h3>
              <p className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Target: {section.selector}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center gap-4 py-2">
              {[
                { icon: Search, label: 'Analyst', color: 'bg-blue-400', role: 'analyst' },
                { icon: Layout, label: 'Architect', color: 'bg-orange-primary', role: 'engineer' },
                { icon: CheckCircle, label: 'Critic', color: 'bg-emerald-400', role: 'critic' }
              ].map((avatar, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 transition-all duration-300 ${currentAgent && currentAgent !== avatar.role ? 'opacity-20 scale-75 grayscale' : 'opacity-100 scale-100'}`}>
                  <motion.div
                    animate={currentAgent === avatar.role ? { 
                      y: [0, -8, 0],
                      scale: [1, 1.1, 1],
                    } : {
                      y: [0, -2, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    className={`w-10 h-12 rounded-[2rem] ${avatar.color} border border-white/20 flex items-center justify-center relative overflow-hidden`}
                  >
                    <div className="absolute top-1/4 flex gap-1">
                      <div className="w-0.5 h-0.5 bg-black/80 rounded-full" />
                      <div className="w-0.5 h-0.5 bg-black/80 rounded-full" />
                    </div>
                    <avatar.icon size={12} className="text-white/90 mt-4" />
                  </motion.div>
                  <span className="text-[5px] font-black uppercase tracking-tighter text-white/40">{avatar.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 max-h-32 overflow-hidden opacity-50">
            <pre className="text-[10px] font-mono text-white/40 truncate">
              {section.sectionHtml}
            </pre>
          </div>

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="How should I improve this section?"
              className="w-full bg-[#050505] border border-white/5 rounded-2xl p-4 pr-24 text-xs focus:outline-none focus:border-orange-primary/40 transition-all resize-none h-24 scrollbar-hide"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowCopywriting(!showCopywriting)}
                  className={`p-2 transition-colors rounded-xl ${showCopywriting ? 'bg-white/10 text-white' : 'text-white/20 hover:text-orange-primary'}`}
                  title="Copywriting Assistant"
                >
                  <Type size={16} />
                </button>
                
                <AnimatePresence>
                  {showCopywriting && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full right-0 mb-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl p-2 z-10"
                    >
                      {copywritingStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => {
                            if (onImproveText) onImproveText(style.id);
                            setShowCopywriting(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
                        >
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">{style.label}</p>
                          <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">{style.desc}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={onOpenImageSearch}
                className="p-2 text-white/20 hover:text-orange-primary transition-colors"
                title="Search Unsplash"
              >
                <ImageIcon size={16} />
              </button>
              <button
                onClick={() => {
                  if (prompt.trim() && !isLoading) {
                    onUpdate(prompt);
                    setPrompt('');
                  }
                }}
                disabled={!prompt.trim() || isLoading}
                className="p-2 bg-orange-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-[9px] text-white/20 uppercase tracking-widest font-medium text-center">
            COOK IA will only modify the selected block.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
