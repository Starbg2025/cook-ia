import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Cpu, Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface TypingIndicatorProps {
  status: string;
  isDark: boolean;
}

const REASONING_STEPS = [
  "🧠 Understanding your request...",
  "🔍 Identifying project type...",
  "📋 Planning architecture...",
  "🎨 Designing interface...",
  "⚙️ Building components...",
  "🗄️ Creating database...",
  "🔌 Connecting APIs...",
  "🧪 Testing interactions...",
  "🐞 Detecting issues...",
  "✅ Optimizing performance...",
  "🚀 Finalizing project..."
];

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ status, isDark }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < REASONING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const activeStepText = REASONING_STEPS[currentStepIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex flex-col gap-3 p-4 rounded-2xl border ${
        isDark 
          ? 'bg-black/60 border-orange-primary/30 shadow-[0_0_25px_rgba(255,107,0,0.15)] text-white' 
          : 'bg-slate-900 border-slate-700 text-white shadow-xl'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-0.5 shadow-md">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px] opacity-20" />
                <Cpu className="w-4 h-4 text-orange-primary relative z-10" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-orange-primary text-white p-0.5 rounded-full shadow animate-pulse">
              <Loader2 size={10} className="animate-spin" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400 animate-pulse" /> COOK IA INFINITY
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono font-semibold border border-orange-500/30">
                Adaptive Reasoning Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Raisonnement dynamique en temps réel</p>
          </div>
        </div>

        <button 
          onClick={() => setShowAllSteps(!showAllSteps)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
        >
          <span>{showAllSteps ? 'Masquer' : 'Voir tout'}</span>
          {showAllSteps ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Active Animated Reasoning Step Banner */}
      <div className="bg-slate-950/80 border border-white/10 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-amber-300 truncate font-mono">
              {activeStepText}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 shrink-0 font-semibold animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {currentStepIndex + 1}/{REASONING_STEPS.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStepIndex + 1) / REASONING_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Status Detail if present */}
      {status && status !== activeStepText && (
        <div className="text-[11px] text-slate-400 italic px-1 flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin text-orange-400 shrink-0" />
          <span className="truncate">{status}</span>
        </div>
      )}

      {/* Expandable All Steps Log */}
      <AnimatePresence>
        {showAllSteps && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 pt-2 mt-1"
          >
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {REASONING_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border text-mono transition-all ${
                      isCurrent 
                        ? 'bg-orange-500/20 border-orange-500/40 text-orange-200 font-semibold' 
                        : isCompleted 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                        : 'bg-white/5 border-transparent text-slate-500'
                    }`}
                  >
                    <span className="truncate">{step}</span>
                    {isCompleted && <CheckCircle2 size={12} className="text-emerald-400 shrink-0 ml-2" />}
                    {isCurrent && <Loader2 size={12} className="animate-spin text-orange-400 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


