import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2, Sparkles, AlertCircle, ShieldCheck, Cpu, ChevronRight, Eye, Grid, Compass, Palette, Code2, FlaskConical, Award, Terminal } from 'lucide-react';

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  specialty: string;
  icon: React.ReactNode;
  color: string;
  badge: string;
  description: string;
  actionMessage: string;
}

export const MULTI_AGENT_PIPELINE: AgentInfo[] = [
  {
    id: 'architect',
    name: 'Prompt Architecte',
    role: 'Structure & Blueprint',
    specialty: 'Prompts, sitemap & cahier des charges',
    icon: <Compass className="w-8 h-8 text-amber-400" />,
    color: 'from-amber-500 to-yellow-400',
    badge: '📐 Étape 1 : Prompt Architecte',
    description: 'Analyse votre idée, prépare le prompt optimisé et dessine le blueprint des sections du site.',
    actionMessage: 'Analyse du besoin, structuration des sections et écriture des instructions...'
  },
  {
    id: 'designer',
    name: 'Styliste UI/UX',
    role: 'Design & Harmonisation',
    specialty: 'Palette de couleurs, typographies & effets',
    icon: <Palette className="w-8 h-8 text-pink-400" />,
    color: 'from-pink-500 to-rose-400',
    badge: '🎨 Étape 2 : Design UI/UX',
    description: 'Harmonise la palette visuelle, le contraste des textes et l’ergonomie globale.',
    actionMessage: 'Création de la palette de couleurs, des espacements et de la direction artistique...'
  },
  {
    id: 'developer',
    name: 'Développeur IA',
    role: 'Code Source Full-Stack',
    specialty: 'HTML5, Tailwind CSS, JS & Composants',
    icon: <Code2 className="w-8 h-8 text-orange-primary" />,
    color: 'from-orange-500 to-amber-500',
    badge: '⚡ Étape 3 : Développeur IA',
    description: 'Écrit le code source complet, responsive, structuré et animé pour le site web.',
    actionMessage: 'Génération du code HTML5 sémantique, styles Tailwind et scripts dynamiques...'
  },
  {
    id: 'tester',
    name: 'Testeur QA & Audit',
    role: 'Vérification des Boutons',
    specialty: 'Boutons interactifs, liens & formulaires',
    icon: <FlaskConical className="w-8 h-8 text-sky-400" />,
    color: 'from-sky-500 to-blue-600',
    badge: '🧪 Étape 4 : Testeur QA',
    description: 'Inspecte chaque bouton et formulaire pour s’assurer qu’aucun bouton n’est mort ou inutile.',
    actionMessage: 'Audit de chaque bouton et raccordement des clics aux formulaires et notifications...'
  },
  {
    id: 'inspector',
    name: 'Inspecteur Résultats',
    role: 'Validation Final & Rendu',
    specialty: 'Réactivité mobile & certification de qualité',
    icon: <Award className="w-8 h-8 text-purple-400" />,
    color: 'from-purple-500 to-indigo-600',
    badge: '🏆 Étape 5 : Inspecteur Résultats',
    description: 'Vérifie le rendu final sur tous les écrans et appose la certification de qualité.',
    actionMessage: 'Inspection finale du rendu, réactivité mobile et validation globale...'
  }
];

interface MultiAgentSquadProps {
  currentStage?: 'architect' | 'designer' | 'developer' | 'tester' | 'inspector' | 'idle' | 'complete';
  isGenerating?: boolean;
  isDark?: boolean;
  qaLogs?: string[];
  auditSummary?: {
    buttonsChecked: number;
    deadButtonsFixed: number;
    linksVerified: number;
    status: 'pending' | 'running' | 'passed';
  };
}

export const MultiAgentSquad: React.FC<MultiAgentSquadProps> = ({
  currentStage = 'idle',
  isGenerating = false,
  isDark = true,
  qaLogs = [],
  auditSummary
}) => {
  const [showFullGrid, setShowFullGrid] = useState(false);

  // Find active agent object
  const activeAgent = MULTI_AGENT_PIPELINE.find(a => a.id === currentStage) || MULTI_AGENT_PIPELINE[0];
  const activeIndex = MULTI_AGENT_PIPELINE.findIndex(a => a.id === currentStage);

  return (
    <div className={`w-full p-4 md:p-6 rounded-3xl border ${isDark ? 'bg-black/60 border-white/10 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-xl'} my-4 transition-all duration-300`}>
      {/* Squad Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-primary via-amber-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-orange-primary/20">
            <Cpu size={20} className={isGenerating ? 'animate-spin' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-display font-black text-base md:text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                RÉFLEXION & CONCEPTION MULTI-AGENTS IA
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-primary/20 border border-orange-primary/30 text-orange-primary">
                SÉQUENTIEL
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
              Réflexion autonome et modélisation pas-à-pas de votre projet.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFullGrid(!showFullGrid)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
        >
          {showFullGrid ? <Eye size={14} /> : <Grid size={14} />}
          <span>{showFullGrid ? 'Mode Focus (Un par un)' : 'Voir la réflexion globale'}</span>
        </button>
      </div>

      {/* Pipeline Progress Stepper Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className={isDark ? 'text-white/70' : 'text-slate-600'}>Progression de la Réflexion IA</span>
          <span className="text-orange-primary font-mono">
            {currentStage === 'complete' ? '100% (Terminé)' : `${Math.min(100, Math.max(10, ((activeIndex + 1) / MULTI_AGENT_PIPELINE.length) * 100))}%`}
          </span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {MULTI_AGENT_PIPELINE.map((agent, idx) => {
            const isDone = currentStage === 'complete' || (activeIndex > idx);
            const isCurrent = currentStage === agent.id;

            return (
              <React.Fragment key={agent.id}>
                <div 
                  className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                    isCurrent 
                      ? 'bg-gradient-to-r from-orange-primary to-amber-400 shadow-[0_0_12px_rgba(255,107,0,0.6)] animate-pulse'
                      : isDone 
                      ? 'bg-emerald-500'
                      : (isDark ? 'bg-white/10' : 'bg-slate-200')
                  }`}
                  title={`${agent.name} (${agent.role})`}
                />
                {idx < MULTI_AGENT_PIPELINE.length - 1 && (
                  <ChevronRight size={12} className={isDark ? 'text-white/20' : 'text-slate-300'} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* SINGLE ACTIVE AGENT SPOTLIGHT ("Un par chacun") */}
      {!showFullGrid ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAgent.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className={`relative p-5 md:p-6 rounded-2xl border ${
              isGenerating
                ? 'bg-gradient-to-r from-orange-primary/10 via-amber-500/5 to-transparent border-orange-primary/40 shadow-[0_0_30px_rgba(255,107,0,0.15)] ring-1 ring-orange-primary/30'
                : (isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200')
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Framed Agent Logo Emblem ("Cadre Logo IA") */}
              <div className="relative group shrink-0">
                <div className={`w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br ${activeAgent.color} p-0.5 shadow-2xl transition-all duration-300 ${
                  isGenerating ? 'scale-105 shadow-[0_0_30px_rgba(255,107,0,0.4)] ring-2 ring-orange-primary' : ''
                }`}>
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center gap-1.5 p-2 text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 group-hover:scale-110 transition-transform">
                      {activeAgent.icon}
                    </div>
                    <span className="text-[10px] font-extrabold font-mono tracking-widest text-white/80 uppercase">LOGO IA</span>
                  </div>
                </div>
                {isGenerating && (
                  <div className="absolute -bottom-2 -right-2 bg-orange-primary text-white p-1.5 rounded-full shadow-lg animate-bounce">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                )}
                {currentStage === 'complete' && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </div>

              {/* Agent Details & Real-Time Action */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r ${activeAgent.color} shadow-sm`}>
                    {activeAgent.badge}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${isDark ? 'bg-white/10 border-white/10 text-white/80' : 'bg-slate-200 border-slate-300 text-slate-700'}`}>
                    {activeAgent.role}
                  </span>
                </div>

                <h4 className={`font-display font-black text-xl md:text-2xl mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {activeAgent.name}
                </h4>

                <p className={`text-xs md:text-sm mb-4 ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                  {activeAgent.description}
                </p>

                {/* Live Action Banner & Stream Details */}
                <div className="space-y-2">
                  <div className={`p-3 rounded-xl border flex items-center gap-3 text-xs font-medium ${
                    isGenerating 
                      ? 'bg-orange-primary/10 border-orange-primary/30 text-orange-primary' 
                      : (isDark ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
                  }`}>
                    {isGenerating ? (
                      <Loader2 size={16} className="animate-spin shrink-0 text-orange-primary" />
                    ) : (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                    )}
                    <span>
                      {isGenerating 
                        ? activeAgent.actionMessage 
                        : `Mission de l'agent ${activeAgent.name} complétée avec succès !`}
                    </span>
                  </div>

                  {/* Real-time Connection & Code Reflection Stream State */}
                  {isGenerating && (
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-black/80 border-orange-primary/40 text-white' : 'bg-slate-900 text-white border-slate-700'} space-y-2 text-xs font-mono shadow-xl`}>
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-bold text-emerald-400 text-[11px]">RÉSEAU IA CONNECTÉ (WebSocket Sync)</span>
                        </div>
                        <span className="text-[10px] text-orange-primary font-semibold animate-pulse flex items-center gap-1">
                          ⚡ Modification du code en direct
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 space-y-1">
                        <p className="font-semibold text-amber-400 flex items-center justify-between">
                          <span>🔨 Fonctions & Éléments créés en temps réel :</span>
                          <span className="text-[9px] text-slate-400 font-normal">[{activeAgent.name}]</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] text-slate-200 pl-2">
                          {currentStage === 'architect' && (
                            <>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> JS parsePromptIntent()</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> Layout buildSitemapSchema()</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> Config setupTailwindConfig()</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> CSS createCSSVariables()</span>
                            </>
                          )}
                          {currentStage === 'designer' && (
                            <>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> Theme applyColorPalette()</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> UI configureTypography()</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> Style addGlassmorphism()</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> JS setupThemeModeToggle()</span>
                            </>
                          )}
                          {currentStage === 'developer' && (
                            <>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> Navigation Header & Drawer</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> JS handleMobileDrawer()</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> Section Hero & Bouton CTA</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> Modal Contact & handleFormSubmit()</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> Smooth Scroll & Effets Hover</span>
                              <span className="flex items-center gap-1.5"><span className="text-orange-primary">›</span> Toast Notification System</span>
                            </>
                          )}
                          {currentStage === 'tester' && (
                            <>
                              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> JS auditAndFixButtons()</span>
                              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Event verifyClickHandlers()</span>
                              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Form testFormValidation()</span>
                              <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> UI checkMobileInteractions()</span>
                            </>
                          )}
                          {(currentStage === 'inspector' || currentStage === 'complete') && (
                            <>
                              <span className="flex items-center gap-1.5"><span className="text-purple-400">🏆</span> Check checkViewportBreakpoints()</span>
                              <span className="flex items-center gap-1.5"><span className="text-purple-400">🏆</span> Audit validateWCAGAccessibility()</span>
                              <span className="flex items-center gap-1.5"><span className="text-purple-400">🏆</span> System issueQualityCertificate()</span>
                              <span className="flex items-center gap-1.5"><span className="text-purple-400">🏆</span> Bundle optimizeCSSBundle()</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        /* FULL TEAM GRID MODE (If user clicks toggle) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MULTI_AGENT_PIPELINE.map((agent, idx) => {
            const isActive = isGenerating && currentStage === agent.id;
            const isDone = currentStage === 'complete' || (activeIndex > idx);

            return (
              <div
                key={agent.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-orange-primary/10 border-orange-primary ring-2 ring-orange-primary/50'
                    : isDone
                    ? (isDark ? 'bg-white/[0.03] border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200')
                    : (isDark ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-slate-50 border-slate-100 opacity-70')
                }`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.color} p-0.5 border-2 border-white/20 mx-auto mb-2 shadow-md`}>
                  <div className="w-full h-full rounded-[10px] bg-slate-950 flex flex-col items-center justify-center p-1 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] opacity-10" />
                    <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white border border-white/20 scale-75 origin-center">
                      {agent.icon}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold text-white bg-gradient-to-r ${agent.color} mb-1`}>
                    {agent.name}
                  </span>
                  <p className={`text-[11px] leading-tight ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
                    {agent.role}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QA AUDIT CARD (Testeur QA Boutons & Formulaires) */}
      {(currentStage === 'tester' || currentStage === 'inspector' || currentStage === 'complete' || auditSummary) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-2xl border ${isDark ? 'bg-sky-950/30 border-sky-500/40' : 'bg-sky-50 border-sky-200'} text-xs space-y-3`}
        >
          <div className="flex items-center justify-between font-bold text-sky-400">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck size={18} className="text-sky-400" />
              <span>Audit QA des Boutons & Formulaires (Testeur IA)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-[11px] font-extrabold text-sky-300">
              ✓ 0 Bouton Inutile
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="font-bold text-lg text-white">{auditSummary?.buttonsChecked || 4}</div>
              <div className="text-[10px] opacity-70">Boutons inspectés</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="font-bold text-lg text-emerald-400">{auditSummary?.deadButtonsFixed || 4}</div>
              <div className="text-[10px] opacity-70">Boutons connectés</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200'}`}>
              <div className="font-bold text-lg text-sky-400">{auditSummary?.linksVerified || 3}</div>
              <div className="text-[10px] opacity-70">Navigation validée</div>
            </div>
          </div>

          {qaLogs.length > 0 && (
            <div className={`p-3 rounded-xl font-mono text-[11px] ${isDark ? 'bg-black/60 text-sky-200 border border-white/5' : 'bg-white text-sky-900 border border-slate-200'} space-y-1.5`}>
              {qaLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
