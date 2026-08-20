import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, 
  Cpu, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Terminal, 
  Code2, 
  Layers, 
  ShieldCheck, 
  Eye, 
  Zap, 
  Flame, 
  Check, 
  FileCode,
  Play,
  Pause,
  Clock,
  ArrowRight,
  Server
} from 'lucide-react';
import { ActionHistory } from '../types';

interface LiveActionResponseProps {
  status: string;
  isDark: boolean;
  actions?: ActionHistory[];
  currentAgentStage?: 'architect' | 'designer' | 'developer' | 'tester' | 'inspector' | 'idle' | 'complete';
  onAbort?: () => void;
  onOpenLivePreview?: () => void;
}

const AGENT_PIPELINE = [
  { id: 'architect', name: 'Architecte IA', desc: 'Analyse du prompt & structure logicielle', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'designer', name: 'Design Lead', desc: 'Système de design & composants UI/UX', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { id: 'developer', name: 'Codeur Fullstack', desc: 'Écriture TypeScript React & API', icon: Code2, color: 'text-orange-primary', bg: 'bg-orange-primary/10', border: 'border-orange-primary/20' },
  { id: 'inspector', name: 'Inspecteur QA', desc: 'Validation syntaxe, tests & zéro-bug', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
];

const MOCK_LIVE_FILES = [
  { path: 'src/App.tsx', status: 'modified', lines: '+142 -12' },
  { path: 'src/components/Dashboard.tsx', status: 'created', lines: '+88' },
  { path: 'src/services/api.ts', status: 'created', lines: '+65' },
  { path: 'src/index.css', status: 'modified', lines: '+24' }
];

export const TypingIndicator: React.FC<LiveActionResponseProps> = ({ 
  status, 
  isDark, 
  actions = [],
  currentAgentStage = 'developer',
  onAbort,
  onOpenLivePreview
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'terminal' | 'files'>('reasoning');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Live timer for reasoning execution
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec % 1) * 10);
    return `${s}.${ms}s`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`flex flex-col rounded-2xl border overflow-hidden shadow-2xl transition-all ${
        isDark 
          ? 'bg-[#0B0F17]/95 border-orange-primary/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-white' 
          : 'bg-white border-slate-200/90 text-slate-900 shadow-xl'
      }`}
    >
      {/* Top Header: Live Status + Model Badge + Elapsed Time */}
      <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${
        isDark ? 'bg-[#0E1420] border-white/[0.08]' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-primary to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-primary/30">
              <Zap size={14} className="fill-white animate-pulse" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0E1420] animate-ping" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-orange-primary flex items-center gap-1.5">
                Cook IA Live Action
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                isDark ? 'bg-white/[0.06] text-white/70 border border-white/[0.08]' : 'bg-slate-200 text-slate-700'
              }`}>
                Claude / GPT-4o Multi-Agent
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <Clock size={11} />
              <span>Exécution en direct ({formatTime(elapsedSeconds)})</span>
            </div>
          </div>
        </div>

        {/* Action Controls (Preview & Collapse) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenLivePreview && (
            <button
              onClick={onOpenLivePreview}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition-all shadow-sm"
              title="Ouvrir l'aperçu en direct"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Aperçu Live</span>
            </button>
          )}

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title={isExpanded ? 'Réduire' : 'Agrandir'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Main Execution Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 space-y-4"
          >
            {/* Live Agent Pipeline Stage Indicator */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AGENT_PIPELINE.map((stage, idx) => {
                const StageIcon = stage.icon;
                const isActive = stage.id === currentAgentStage;
                const isPassed = idx < AGENT_PIPELINE.findIndex(p => p.id === currentAgentStage);

                return (
                  <div
                    key={stage.id}
                    className={`p-2.5 rounded-xl border transition-all relative overflow-hidden ${
                      isActive 
                        ? (isDark ? 'bg-orange-primary/15 border-orange-primary text-white shadow-lg ring-1 ring-orange-primary/30' : 'bg-orange-50 border-orange-400 text-slate-900') 
                        : isPassed 
                        ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800') 
                        : (isDark ? 'bg-white/[0.02] border-white/[0.06] text-white/30' : 'bg-slate-50 border-slate-200 text-slate-400')
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-gradient-to-r from-orange-primary/20 via-transparent to-transparent pointer-events-none"
                      />
                    )}
                    
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <StageIcon size={14} className={isActive ? 'text-orange-primary animate-pulse' : isPassed ? 'text-emerald-400' : 'text-current'} />
                        <span className="text-xs font-bold truncate">{stage.name}</span>
                      </div>
                      {isPassed && <Check size={12} className="text-emerald-400 shrink-0" strokeWidth={3} />}
                      {isActive && <Loader2 size={12} className="animate-spin text-orange-primary shrink-0" />}
                    </div>
                    <p className="text-[10px] line-clamp-1 opacity-70">{stage.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Current Active Step Banner */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isDark ? 'bg-[#080B11] border-white/[0.08]' : 'bg-slate-900 text-white border-slate-800'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <Loader2 size={15} className="animate-spin text-orange-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate font-mono">
                    {status || "Génération du code source React & Express..."}
                  </div>
                  <div className="text-[10px] text-white/50 truncate">
                    Validation des imports, du styling Tailwind et des liaisons de données Supabase
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-orange-primary bg-orange-primary/10 px-2 py-0.5 rounded border border-orange-primary/20 shrink-0">
                <Flame size={11} className="fill-orange-primary" />
                <span>Turbo Engine</span>
              </div>
            </div>

            {/* Sub-Tabs: Raisonnement / Terminal logs / Fichiers modifiés */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('reasoning')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'reasoning'
                        ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900')
                        : (isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700')
                    }`}
                  >
                    <Cpu size={12} />
                    <span>Pensées IA</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('terminal')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'terminal'
                        ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900')
                        : (isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700')
                    }`}
                  >
                    <Terminal size={12} />
                    <span>Console Live</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('files')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'files'
                        ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900')
                        : (isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700')
                    }`}
                  >
                    <FileCode size={12} />
                    <span>Fichiers</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-white/30">
                  {actions.length} action(s)
                </span>
              </div>

              {/* Tab Content */}
              <div className={`rounded-xl p-3 text-xs font-mono max-h-44 overflow-y-auto custom-scrollbar border ${
                isDark ? 'bg-[#080B11] border-white/[0.06]' : 'bg-slate-950 text-emerald-400 border-slate-800'
              }`}>
                {activeTab === 'reasoning' && (
                  <div className="space-y-2 text-white/80">
                    <div className="flex items-center gap-2 text-orange-primary font-bold">
                      <Sparkles size={13} />
                      <span>Analyse du projet & décision architecturale :</span>
                    </div>
                    <p className="text-white/60 leading-relaxed text-[11px]">
                      • Modélisation de l'état global et des interfaces TypeScript de données.<br />
                      • Composition modulaire des sections avec Tailwind CSS et animations fluides.<br />
                      • Intégration de la persistance Supabase / API Express avec gestion complète des erreurs.
                    </p>
                  </div>
                )}

                {activeTab === 'terminal' && (
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    <div className="text-white/40 font-bold">$ cook-ia-builder --target=production --framework=react-vite</div>
                    <div className="text-emerald-400">✓ Validation du typage TypeScript terminée sans erreur</div>
                    <div className="text-blue-400">ℹ Optimisation des paquets Tailwind CSS et des composants Lucide</div>
                    <div className="text-amber-400 animate-pulse">⚡ Compilation des bundles JavaScript (HMR Ready)...</div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="space-y-1.5">
                    {MOCK_LIVE_FILES.map((file, i) => (
                      <div key={i} className="flex items-center justify-between py-1 px-2 rounded bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCode size={13} className="text-orange-primary shrink-0" />
                          <span className="truncate text-white/80 text-[11px]">{file.path}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          {file.lines}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
