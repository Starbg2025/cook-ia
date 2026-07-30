import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Code2, Cpu } from 'lucide-react';

interface TypingIndicatorProps {
  status: string;
  isDark: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ status, isDark }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border ${isDark ? 'bg-black/40 border-orange-primary/30 shadow-[0_0_20px_rgba(255,107,0,0.15)]' : 'bg-slate-900 border-slate-700 text-white'}`}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 p-0.5 border border-white/20 shadow-md">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px] opacity-20" />
            <Cpu className="w-5 h-5 text-orange-primary relative z-10" />
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-orange-primary text-white p-0.5 rounded-full shadow animate-pulse">
          <Loader2 size={10} className="animate-spin" />
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-primary flex items-center gap-1">
            <Cpu size={10} /> IA RÉFLEXION CONNECTÉE
          </span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold animate-pulse">● En Direct</span>
        </div>
        <div className="flex items-center gap-2">
          <Code2 size={13} className="text-amber-400 shrink-0" />
          <span className="text-xs font-semibold truncate text-white">{status}</span>
        </div>
      </div>
    </motion.div>
  );
};

