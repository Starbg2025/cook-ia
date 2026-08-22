import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, 
  Check, 
  X, 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  Terminal, 
  FileText, 
  ShieldCheck, 
  Eye, 
  Clock, 
  Square, 
  AlertTriangle, 
  RotateCw, 
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { LiveActionEvent, LiveActionTask, LiveActionDiff } from '../types/liveAction';

interface LiveActionsPanelProps {
  task?: LiveActionTask;
  events?: LiveActionEvent[];
  isDark?: boolean;
  onAbort?: () => void;
  onOpenPreview?: () => void;
  onSelectFile?: (filePath: string) => void;
  onRetryError?: (errorMessage: string) => void;
  compact?: boolean;
  defaultExpanded?: boolean;
}

export const LiveActionsPanel: React.FC<LiveActionsPanelProps> = ({
  task,
  events: propEvents,
  isDark = true,
  onAbort,
  onOpenPreview,
  onSelectFile,
  onRetryError,
  compact = false,
  defaultExpanded = true
}) => {
  const events = task?.events || propEvents || [];
  const status = task?.status || (events.some(e => e.status === 'running') ? 'running' : 'completed');
  
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    analysis: true,
    files: true,
    verification: true,
    system: true
  });
  const [selectedDiff, setSelectedDiff] = useState<LiveActionDiff | null>(null);
  const [selectedTerminalEvent, setSelectedTerminalEvent] = useState<LiveActionEvent | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Live timer while task is running
  useEffect(() => {
    if (status !== 'running') {
      if (task?.totalDurationMs) {
        setElapsedSeconds(task.totalDurationMs / 1000);
      }
      return;
    }

    const start = performance.now();
    const interval = setInterval(() => {
      setElapsedSeconds((performance.now() - start) / 1000);
    }, 100);

    return () => clearInterval(interval);
  }, [status, task?.totalDurationMs]);

  if (events.length === 0 && status !== 'running') {
    return null;
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const analysisEvents = events.filter(e => e.group === 'analysis');
  const filesEvents = events.filter(e => e.group === 'files');
  const verificationEvents = events.filter(e => e.group === 'verification');
  const systemEvents = events.filter(e => e.group === 'system');

  const completedCount = events.filter(e => e.status === 'completed').length;
  const runningEvent = events.find(e => e.status === 'running');
  const failedEvent = events.find(e => e.status === 'failed');

  const formattedTime = elapsedSeconds.toFixed(1) + 's';

  const getStatusIcon = (st: string) => {
    switch (st) {
      case 'running':
        return <Loader2 size={13} className="animate-spin text-orange-primary shrink-0" />;
      case 'completed':
        return (
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Check size={9} strokeWidth={3} />
          </div>
        );
      case 'failed':
        return (
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <X size={9} strokeWidth={3} />
          </div>
        );
      case 'cancelled':
        return <span className="text-white/40 text-xs shrink-0">—</span>;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />;
    }
  };

  const getEventIcon = (event: LiveActionEvent) => {
    if (event.type === 'file_operation') {
      return <FileCode size={13} className="text-blue-400 shrink-0" />;
    }
    if (event.type === 'terminal' || event.type === 'build') {
      return <Terminal size={13} className="text-amber-400 shrink-0" />;
    }
    if (event.type === 'preview') {
      return <Eye size={13} className="text-purple-400 shrink-0" />;
    }
    if (event.type === 'analysis') {
      return <Cpu size={13} className="text-sky-400 shrink-0" />;
    }
    return <FileText size={13} className="text-slate-400 shrink-0" />;
  };

  const renderGroup = (title: string, groupKey: string, groupEvents: LiveActionEvent[], IconComponent: any) => {
    if (groupEvents.length === 0) return null;
    const isGroupOpen = expandedGroups[groupKey] !== false;

    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleGroup(groupKey)}
          className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
            isDark ? 'hover:bg-white/[0.04] text-white/80' : 'hover:bg-slate-100 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isGroupOpen ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
            <IconComponent size={13} className="text-orange-primary" />
            <span>{title}</span>
            <span className={`text-[10px] font-mono font-normal ml-1 ${isDark ? 'text-white/40' : 'text-slate-600'}`}>
              ({groupEvents.filter(e => e.status === 'completed').length}/{groupEvents.length})
            </span>
          </div>
        </button>

        {isGroupOpen && (
          <div className="space-y-1 pl-4 border-l border-white/[0.06] ml-2 my-1">
            {groupEvents.map(event => {
              const hasDiff = !!event.details?.diff;
              const hasTerminalOutput = !!event.details?.command || !!event.details?.output || !!event.details?.error;
              const isClickable = hasDiff || hasTerminalOutput || (event.details?.path && onSelectFile);

              return (
                <div
                  key={event.id}
                  onClick={() => {
                    if (hasDiff) setSelectedDiff(event.details!.diff!);
                    else if (hasTerminalOutput) setSelectedTerminalEvent(event);
                    else if (event.details?.path && onSelectFile) onSelectFile(event.details.path);
                  }}
                  className={`flex items-center justify-between gap-2.5 py-1 px-2 rounded-md transition-all text-xs font-mono ${
                    isClickable ? (isDark ? 'hover:bg-white/[0.06] cursor-pointer' : 'hover:bg-slate-100 cursor-pointer') : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getStatusIcon(event.status)}
                    <span className={`truncate ${event.status === 'failed' ? 'text-rose-400' : (isDark ? 'text-white/85' : 'text-slate-800')}`}>
                      {event.title}
                    </span>
                    
                    {event.details?.diff && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] border border-white/[0.08]">
                        <span className="text-emerald-400 font-bold">+{event.details.diff.added}</span>
                        {event.details.diff.removed > 0 && <span className="text-rose-400 font-bold">-{event.details.diff.removed}</span>}
                      </span>
                    )}

                    {event.details?.sizeBytes && (
                      <span className={`text-[10px] shrink-0 ${isDark ? 'text-white/40' : 'text-slate-600'}`}>
                        {(event.details.sizeBytes / 1024).toFixed(1)} kB
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[10px] opacity-60">
                    {event.durationMs !== undefined && (
                      <span>{(event.durationMs / 1000).toFixed(1)}s</span>
                    )}
                    {isClickable && <ExternalLink size={10} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div 
        aria-live="polite"
        className={`rounded-2xl border transition-all overflow-hidden shadow-lg ${
          isDark 
            ? 'bg-[#0A0E17] border-white/[0.08] text-white' 
            : 'bg-white border-slate-200/90 text-slate-900 shadow-md'
        }`}
      >
        {/* Header Bar */}
        <div className={`px-3.5 py-2.5 flex items-center justify-between gap-3 border-b ${
          isDark ? 'bg-[#0E1420] border-white/[0.06]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {status === 'running' ? (
              <Loader2 size={15} className="animate-spin text-orange-primary shrink-0" />
            ) : status === 'failed' ? (
              <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <X size={11} strokeWidth={3} />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Check size={11} strokeWidth={3} />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight">
                  {status === 'running' 
                    ? (runningEvent ? runningEvent.title : "Cook IA exécute la tâche...") 
                    : status === 'failed' 
                    ? "Opération interrompue"
                    : status === 'cancelled'
                    ? "Tâche annulée"
                    : "Tâche terminée avec succès"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[11px] font-mono font-medium ${isDark ? 'text-white/60' : 'text-slate-700'}`}>
              {status === 'running' 
                ? `${completedCount}/${events.length} · ${formattedTime}`
                : `✓ ${completedCount} actions · ${formattedTime}`}
            </span>

            {status === 'running' && onAbort && (
              <button
                onClick={onAbort}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[11px] font-bold transition-colors border border-rose-500/30"
                title="Arrêter l'exécution réelle de l'agent"
              >
                <Square size={10} className="fill-rose-400" />
                <span>Stop</span>
              </button>
            )}

            {onOpenPreview && status === 'completed' && (
              <button
                onClick={onOpenPreview}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-primary hover:bg-orange-hover text-white text-[11px] font-bold transition-colors shadow-xs"
                title="Voir le résultat dans la preview"
              >
                <Eye size={11} />
                <span className="hidden sm:inline">Aperçu</span>
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1 rounded-md transition-colors ${
                isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={isExpanded ? 'Réduire' : 'Développer'}
            >
              {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>
        </div>

        {/* Collapsible Action Groups */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-3 space-y-3"
            >
              {renderGroup("Analyse du projet", "analysis", analysisEvents, Cpu)}
              {renderGroup("Modifications & Fichiers", "files", filesEvents, Layers)}
              {renderGroup("Vérification & Qualité", "verification", verificationEvents, ShieldCheck)}
              {renderGroup("Opérations Système", "system", systemEvents, Terminal)}

              {/* Error Callout if failed */}
              {failedEvent && (
                <div className={`p-3 rounded-xl border flex flex-col gap-2 ${
                  isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <AlertTriangle size={14} />
                    <span>Erreur rencontrée lors de l'exécution</span>
                  </div>
                  <p className="text-xs font-mono bg-black/30 p-2 rounded border border-rose-500/20 overflow-x-auto">
                    {failedEvent.details?.error || task?.error || "Une commande ou un appel a échoué."}
                  </p>
                  {onRetryError && (
                    <button
                      onClick={() => onRetryError(failedEvent.details?.error || task?.error || "Corrige l'erreur détectée")}
                      className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <RotateCw size={12} />
                      <span>Corriger l'erreur</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Real Diff Inspector Modal */}
      {selectedDiff && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedDiff(null)}
        >
          <div 
            className={`w-full max-w-3xl max-h-[85vh] rounded-2xl border flex flex-col shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0B0F17] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-4 border-b flex items-center justify-between gap-3 ${
              isDark ? 'bg-[#0E1420] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <FileCode size={16} className="text-orange-primary" />
                <span className="font-bold text-sm font-mono">{selectedDiff.path}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                  +{selectedDiff.added}
                </span>
                {selectedDiff.removed > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold font-mono">
                    -{selectedDiff.removed}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedDiff(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-0.5 bg-black/40">
              {selectedDiff.lines.map((line, idx) => (
                <div 
                  key={idx}
                  className={`flex items-start px-2 py-0.5 rounded leading-relaxed ${
                    line.type === 'add'
                      ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500'
                      : line.type === 'del'
                      ? 'bg-rose-500/15 text-rose-300 border-l-2 border-rose-500 line-through opacity-80'
                      : (isDark ? 'text-white/60' : 'text-slate-600')
                  }`}
                >
                  <span className="w-6 text-[10px] opacity-40 select-none">{line.lineNumber || idx + 1}</span>
                  <span className="w-4 select-none font-bold">{line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}</span>
                  <span className="flex-1 whitespace-pre-wrap break-all">{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real Terminal / Command Output Modal */}
      {selectedTerminalEvent && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedTerminalEvent(null)}
        >
          <div 
            className={`w-full max-w-2xl max-h-[85vh] rounded-2xl border flex flex-col shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0B0F17] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`p-4 border-b flex items-center justify-between gap-3 ${
              isDark ? 'bg-[#0E1420] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-amber-400" />
                <span className="font-bold text-sm">{selectedTerminalEvent.title}</span>
              </div>
              <button 
                onClick={() => setSelectedTerminalEvent(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3 bg-black/60 text-slate-200">
              {selectedTerminalEvent.details?.command && (
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1 font-bold">Commande exécutée :</div>
                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-amber-300 font-bold">
                    $ {selectedTerminalEvent.details.command}
                  </div>
                </div>
              )}

              {selectedTerminalEvent.details?.output && (
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1 font-bold">Sortie standard :</div>
                  <pre className="p-3 rounded-lg bg-black/40 border border-white/10 text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {selectedTerminalEvent.details.output}
                  </pre>
                </div>
              )}

              {selectedTerminalEvent.details?.error && (
                <div>
                  <div className="text-[10px] text-rose-400 uppercase tracking-wider mb-1 font-bold">Erreur stderr :</div>
                  <pre className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 whitespace-pre-wrap leading-relaxed">
                    {selectedTerminalEvent.details.error}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
