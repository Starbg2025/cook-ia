import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Brain, Code2, Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  status: string;
  isDark: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ status, isDark }) => {
  const getIcon = () => {
    if (status.includes('Analyse')) return <Brain size={14} className="text-purple-400" />;
    if (status.includes('Code')) return <Code2 size={14} className="text-blue-400" />;
    return <Sparkles size={14} className="text-orange-400" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-center gap-3 p-3 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}
    >
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-6 h-6 flex items-center justify-center"
      >
        <Loader2 size={18} className="text-orange-primary" />
      </motion.div>
      <div className="flex flex-col">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Étape en cours</span>
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{status}</span>
        </div>
      </div>
    </motion.div>
  );
};
