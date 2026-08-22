import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Send, 
  Loader2, 
  ImagePlus, 
  X, 
  Image as ImageIcon, 
  Copy, 
  ShoppingBag, 
  Video, 
  Search, 
  Layout, 
  CheckCircle, 
  User, 
  Mic, 
  Plus, 
  Sparkles, 
  Flag, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  RotateCcw, 
  ChevronDown, 
  FileText, 
  Clock, 
  Settings, 
  Terminal, 
  Palette,
  ArrowUp,
  Compass,
  Layers,
  Code2,
  Cpu,
  CornerDownLeft,
  Check,
  MessageSquare
} from 'lucide-react';
import { Message, ActionHistory, LiveActionTask, LiveActionEvent } from '../types';
import { shadowWatchdog } from '../services/multiAgentService';
import { UnderwaterWelcome } from './UnderwaterWelcome';
import { MessageActionOverlay } from './MessageActionOverlay';
import { TypingIndicator } from './TypingIndicator';
import { LiveActionsPanel } from './LiveActionsPanel';
import { MarkdownRenderer } from './MarkdownRenderer';
import { translations, Language } from '../translations';

interface ChatInterfaceProps {
  messages: Message[];
  prompt: string;
  setPrompt: (val: string) => void;
  handleSend: () => void;
  onAbort?: () => void;
  isLoading: boolean;
  loadingStatus?: string;
  actions?: ActionHistory[];
  liveTask?: LiveActionTask | null;
  liveEvents?: LiveActionEvent[];
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  logoUrl: string;
  selectedImages: string[];
  setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>;
  selectedVideos: string[];
  setSelectedVideos: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenImageSearch?: () => void;
  onCloneSite?: () => void;
  onEcommerceProduct?: () => void;
  onOpenSettings?: (tab?: any) => void;
  isDark?: boolean;
  isFocusMode?: boolean;
  setIsFocusMode?: (val: boolean) => void;
  onFeedback?: (index: number, type: 'like' | 'dislike') => void;
  lang?: Language;
  currentAgentStage?: 'architect' | 'designer' | 'developer' | 'tester' | 'inspector' | 'idle' | 'complete';
  qaAuditSummary?: any;
  qaLogs?: string[];
  onSelectView?: (view: string) => void;
  aiMode?: 'code' | 'chat';
  onToggleAiMode?: (mode?: 'code' | 'chat') => void;
  onSelectFile?: (filePath: string) => void;
  onRetryError?: (errorMessage: string) => void;
}

const ActionHistoryItem: React.FC<{ action: ActionHistory; isDark: boolean }> = ({ action, isDark }) => {
  const isCompleted = action.status === 'completed';
  const isLoading = action.status === 'loading';
  const isFailed = action.status === 'failed';

  const icon = action.type === 'read' ? <FileText size={13} /> : action.type === 'shell' ? <Terminal size={13} /> : <Clock size={13} />;
  
  return (
    <div className={`flex items-center justify-between gap-3 py-1.5 px-3 rounded-lg group transition-all ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-100'}`}>
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className={`${isDark ? 'text-white/40' : 'text-slate-400'} shrink-0`}>{icon}</span>
        <span className={`text-xs truncate ${isDark ? 'text-white/70' : 'text-slate-600'} font-mono`}>
          {action.content}
        </span>
      </div>
      <div className="shrink-0">
        {isLoading && <Loader2 size={13} className="animate-spin text-[var(--color-ink)] dark:text-white" />}
        {isCompleted && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
          >
            <Check size={9} className="text-emerald-400" strokeWidth={3} />
          </motion.div>
        )}
        {isFailed && <X size={13} className="text-rose-500" />}
      </div>
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  prompt,
  setPrompt,
  handleSend,
  onAbort,
  isLoading,
  loadingStatus = "Building your site...",
  actions = [],
  liveTask,
  liveEvents,
  chatEndRef,
  logoUrl,
  selectedImages,
  setSelectedImages,
  selectedVideos,
  setSelectedVideos,
  onOpenImageSearch,
  onCloneSite,
  onEcommerceProduct,
  onOpenSettings,
  isDark = true,
  isFocusMode = false,
  setIsFocusMode,
  onFeedback,
  lang = 'fr',
  currentAgentStage = 'idle',
  qaAuditSummary,
  qaLogs = [],
  onSelectView,
  aiMode = 'code',
  onToggleAiMode,
  onSelectFile,
  onRetryError
}) => {
  const t = translations[lang];
  const [suggestion, setSuggestion] = React.useState<string>("");
  const mirrorRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!prompt) {
      setSuggestion("");
      return;
    }

    const trimmed = prompt.trim().toLowerCase();
    if (trimmed.length < 2) {
      setSuggestion("");
      return;
    }

    // Smart Suggestion Map (French and English)
    const localTemplates: Record<string, string> = {
      "cré": "er une landing page moderne et responsive avec mode sombre",
      "cre": "ate a stunning dark theme landing page with smooth animations",
      "mod": "ifier la barre de navigation pour ajouter un logo et un menu",
      "ajo": "uter une section de témoignages clients avec notes 5 étoiles",
      "add": " a clean test suite and build pipeline with React & Tailwind",
      "fai": "s un audit complet des performances SEO et accessibilité",
      "gen": "érer des maquettes de présentation haut de gamme pour SaaS",
      "gén": "érer un superbe menu interactif pour restaurant gastronomique",
      "com": "ment connecter mon application à une base de données Supabase ?",
      "peux": "-tu corriger les avertissements et adapter la mise en page mobile",
      "how": " to deploy this application to Netlify or Vercel with 1 click"
    };

    const keys = Object.keys(localTemplates);
    const foundKey = keys.find(k => k.startsWith(trimmed));
    if (foundKey) {
      const typedLen = prompt.length;
      if (typedLen <= foundKey.length) {
        const remainingInKey = foundKey.slice(typedLen);
        setSuggestion(remainingInKey + localTemplates[foundKey]);
        return;
      }
    }

    // Debounced real-time prediction
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch("/api/ai/gemini", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Suggère une courte complétion en français (2 à 5 mots) pour continuer : "${prompt}". Renvoie uniquement la suite directe, sans guillemets.`,
            systemInstruction: "Tu es un assistant d'autocomplétion ultra-rapide. Renvoie uniquement la suite directe.",
            model: "gemini-3.7-flash"
          })
        });

        if (response.ok) {
          const data = await response.json();
          let cleaned = (data.text || "").trim().replace(/^["'«“`]|["'»”`]$/g, "").trim();
          
          if (cleaned.toLowerCase().startsWith(prompt.toLowerCase())) {
            cleaned = cleaned.substring(prompt.length).trim();
          }
          
          if (cleaned && cleaned.length < 50) {
            setSuggestion(cleaned);
          }
        }
      } catch (err) {
        // Suppress abort errors
      }
    }, 700);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [prompt]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = React.useState(false);
  const recognitionRef = useRef<any>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = lang === 'fr' ? 'fr-FR' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [setPrompt, lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 10 - selectedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const starterCards = [
    {
      icon: Layers,
      title: lang === 'fr' ? "SaaS & Web App Complete" : "Full-Stack SaaS & Web App",
      desc: lang === 'fr' ? "Dashboard analytics, authentification & base de données Supabase" : "Analytics dashboard, auth & live Supabase database",
      prompt: lang === 'fr' ? "Crée une application SaaS complète avec dashboard interactif, graphiques de statistiques, système d'authentification utilisateur et mode sombre élégant." : "Build a complete SaaS web application with interactive dashboard, metrics charts, user authentication flow, and modern dark mode."
    },
    {
      icon: ShoppingBag,
      title: lang === 'fr' ? "Boutique E-commerce Moderne" : "Modern E-commerce Store",
      desc: lang === 'fr' ? "Catalogue produits, filtres dynamiques, panier & checkout Stripe" : "Product catalog, dynamic filters, slide cart & checkout",
      prompt: lang === 'fr' ? "Génère une boutique e-commerce haut de gamme avec catalogue produits, filtres par catégorie, panier d'achat coulissant et fiche produit détaillée." : "Generate a high-end e-commerce store with product catalogue, category filters, slide-over cart, and detailed product modal."
    },
    {
      icon: Compass,
      title: lang === 'fr' ? "Landing Page Haute Conversion" : "High-Conversion Landing Page",
      desc: lang === 'fr' ? "Hero signature, grille de fonctionnalités, témoignages & tarification" : "Signature hero, feature grid, testimonials & pricing tables",
      prompt: lang === 'fr' ? "Conçois une landing page ultra-moderne inspirée de Linear et Stripe avec un hero captivant, une section fonctionnalités interactive, une FAQ et des tarifs clairs." : "Design an ultra-modern landing page inspired by Linear and Stripe with captivating hero, interactive features, FAQ, and transparent pricing cards."
    },
    {
      icon: Code2,
      title: lang === 'fr' ? "Portfolio Créatif & Interactif" : "Creative & Interactive Portfolio",
      desc: lang === 'fr' ? "Galerie de projets, animations fluides, formulaire & mode sombre" : "Project showcase, smooth animations, contact & dark mode",
      prompt: lang === 'fr' ? "Crée un portfolio professionnel pour développeur/designer avec mise en page moderne, galerie de projets filtrable, timeline d'expérience et formulaire de contact." : "Create a modern developer/designer portfolio with interactive project showcase, skill badges, experience timeline, and contact form."
    }
  ];

  return (
    <aside className={`flex-1 flex flex-col h-full ${isDark ? 'bg-[#080B11]' : 'bg-[#FAFAFC]'} overflow-hidden relative`}>
      {/* Top Header Bar (Claude / ChatGPT style) */}
      <div className={`h-12 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 ${isDark ? 'border-white/[0.06] bg-[#080B11]/90 backdrop-blur-md' : 'border-slate-200/80 bg-white/90 backdrop-blur-md'}`}>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold ${
            isDark ? 'bg-orange-primary/10 border border-orange-primary/20 text-white' : 'bg-orange-50 border border-orange-200 text-orange-950 shadow-xs'
          }`}>
            <Sparkles size={13} className={isDark ? "text-orange-400" : "text-orange-600"} />
            <span>Cook IA 3.5 Ultimate</span>
          </div>
          <span className={`text-xs hidden sm:inline ${isDark ? 'text-white/40' : 'text-slate-400'}`}>•</span>
          <span className={`text-xs hidden sm:inline font-mono ${isDark ? 'text-white/60' : 'text-slate-700 font-medium'}`}>
            Gemini 2.5 Flash + Multi-Agent Squad
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {onSelectView && (
            <button
              onClick={() => onSelectView('preview')}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isDark 
                  ? 'text-white/70 hover:text-white hover:bg-white/[0.06]' 
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Eye size={13} />
              <span>{lang === 'fr' ? "Aperçu Direct" : "Live Preview"}</span>
            </button>
          )}

          <button 
            onClick={() => onOpenSettings?.('publish')}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-white/60 hover:bg-white/[0.06] hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
            title={lang === 'fr' ? "Paramètres" : "Settings"}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 custom-scrollbar relative flex flex-col">
        {messages.length <= 1 && !isLoading ? (
          <UnderwaterWelcome isDark={isDark} onSelectPrompt={(p) => setPrompt(p)} />
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} group`}
                >
                  {/* Sender Header */}
                  <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isUser 
                        ? (isDark ? 'bg-orange-primary text-white shadow-sm' : 'bg-slate-900 text-white shadow-sm')
                        : 'bg-gradient-to-tr from-orange-primary to-amber-500 text-white shadow-sm'
                    }`}>
                      {isUser ? <User size={13} /> : <Zap size={13} className="fill-white text-white" />}
                    </div>
                    <span className={`text-xs font-bold ${isDark ? 'text-white/70' : 'text-slate-800'}`}>
                      {isUser ? (lang === 'fr' ? 'Vous' : 'You') : 'Cook IA'}
                    </span>
                    {!isUser && msg.modelName && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                        isDark ? 'bg-white/[0.04] border-white/[0.08] text-white/60' : 'bg-slate-100 border-slate-300 text-slate-700 font-semibold'
                      }`}>
                        {msg.modelName}
                      </span>
                    )}
                  </div>

                  {/* Bubble Container */}
                  <div className={`relative max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                    isUser
                      ? (isDark 
                          ? 'bg-orange-primary/25 text-white border border-orange-primary/40 rounded-tr-none shadow-md' 
                          : 'bg-slate-900 text-white rounded-tr-none shadow-md border border-slate-800')
                      : (isDark 
                          ? 'bg-[#0E1420] text-slate-100 border border-white/[0.08] rounded-tl-none shadow-sm' 
                          : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-none shadow-sm')
                  }`}>
                    {/* User Images attached */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 mb-3">
                        {msg.images.map((img, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 shadow-sm">
                            <img src={img} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content text */}
                    {((msg.content || '').startsWith('[Planificateur]') || (msg.content || '').startsWith('[Testeur]') || (msg.content || '').startsWith('[Analyste]')) ? (
                      <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/10 text-white/90' : 'bg-slate-50 border-slate-200 text-slate-800'} font-mono text-xs leading-relaxed`}>
                        {msg.content}
                      </div>
                    ) : (
                      <MarkdownRenderer 
                        content={msg.content || ''} 
                        isDark={isDark} 
                        isUser={isUser} 
                      />
                    )}

                    {/* Live Actions or Legacy Action History */}
                    {(msg.liveTask || (msg.liveEvents && msg.liveEvents.length > 0)) ? (
                      <div className="pt-3 mt-3 border-t border-white/[0.06]">
                        <LiveActionsPanel 
                          task={msg.liveTask} 
                          events={msg.liveEvents} 
                          isDark={isDark} 
                          defaultExpanded={false}
                          onOpenPreview={onSelectView ? () => onSelectView('preview') : undefined}
                          onSelectFile={onSelectFile}
                          onRetryError={onRetryError}
                        />
                      </div>
                    ) : (msg.actionHistory && msg.actionHistory.length > 0) ? (
                      <div className="flex flex-col gap-1 border-t border-white/[0.06] pt-3 mt-3">
                        {msg.actionHistory.map((action, i) => (
                          <ActionHistoryItem key={i} action={action} isDark={isDark} />
                        ))}
                      </div>
                    ) : null}

                    {/* Assistant message action bar */}
                    {!isUser && (
                      <div className={`flex items-center justify-between gap-3 pt-3 mt-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleCopyMessage(msg.content || '', idx)}
                            className={`p-1.5 rounded-md transition-colors ${
                              isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.06]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title={lang === 'fr' ? "Copier le texte" : "Copy text"}
                          >
                            {copiedIndex === idx ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                          
                          <button 
                            onClick={() => onFeedback?.(idx, 'like')}
                            className={`p-1.5 rounded-md transition-colors ${
                              msg.feedback === 'like' 
                                ? 'text-emerald-500 bg-emerald-500/10' 
                                : (isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.06]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                            }`}
                            title="Utile"
                          >
                            <ThumbsUp size={14} />
                          </button>

                          <button 
                            onClick={() => onFeedback?.(idx, 'dislike')}
                            className={`p-1.5 rounded-md transition-colors ${
                              msg.feedback === 'dislike' 
                                ? 'text-rose-500 bg-rose-500/10' 
                                : (isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.06]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                            }`}
                            title="Pas utile"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </div>

                        {onSelectView && (msg.files && msg.files.length > 0) ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectView('code')}
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
                                isDark 
                                  ? 'text-white/70 hover:text-white hover:bg-white/[0.06]' 
                                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                              }`}
                              title={lang === 'fr' ? "Inspecter les fichiers sources" : "Inspect source files"}
                            >
                              <Code2 size={13} />
                              <span>{lang === 'fr' ? "Inspecter le code" : "Inspect Code"}</span>
                            </button>

                            <button
                              onClick={() => onSelectView('preview')}
                              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                                isDark 
                                  ? 'bg-orange-primary/20 text-orange-primary hover:bg-orange-primary hover:text-white' 
                                  : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white shadow-xs'
                              }`}
                              title={lang === 'fr' ? "Voir le rendu interactif" : "Open live preview"}
                            >
                              <Eye size={13} />
                              <span>{lang === 'fr' ? "Aperçu Direct" : "Live Preview"}</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Loading Indicator when Cook IA is building/processing */}
        {isLoading && (
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-3">
            <div className="flex items-center gap-2 px-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isDark ? 'bg-orange-primary text-white' : 'bg-slate-900 text-white'}`}>
                <Loader2 size={13} className="animate-spin" />
              </div>
              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Cook IA Live Execution
              </span>
            </div>
            
            <div className="w-full">
              {liveTask ? (
                <LiveActionsPanel 
                  task={liveTask} 
                  events={liveEvents} 
                  isDark={isDark} 
                  defaultExpanded={true}
                  onAbort={onAbort}
                  onOpenPreview={onSelectView ? () => onSelectView('preview') : undefined}
                  onSelectFile={onSelectFile}
                  onRetryError={onRetryError}
                />
              ) : (
                <TypingIndicator 
                  status={loadingStatus} 
                  isDark={isDark} 
                  actions={actions}
                  currentAgentStage={currentAgentStage}
                  onAbort={onAbort}
                  onOpenLivePreview={onSelectView ? () => onSelectView('preview') : undefined}
                />
              )}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Floating Prompt Bar (Claude / ChatGPT 2025/2026 Style) */}
      <div className={`p-4 sm:p-6 shrink-0 z-20 ${isDark ? 'bg-gradient-to-t from-[#080B11] via-[#080B11]/95 to-transparent' : 'bg-gradient-to-t from-[#FAFAFC] via-[#FAFAFC]/95 to-transparent'}`}>
        <div className="max-w-3xl mx-auto w-full">
          
          {/* Top banner if actively compiling */}
          {isLoading && (
            <div className={`mb-3 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold backdrop-blur-md ${
              isDark ? 'bg-orange-primary/10 border border-orange-primary/25 text-white' : 'bg-orange-50 border border-orange-200/90 text-orange-950 shadow-xs'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <Loader2 size={15} className={`animate-spin shrink-0 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                <span className="truncate">{loadingStatus || (lang === 'fr' ? "Génération du projet en cours..." : "Generating project...")}</span>
              </div>
              {onSelectView && (
                <button 
                  onClick={() => onSelectView('preview')}
                  className="px-3 py-1 bg-orange-primary text-white rounded-lg text-xs font-bold hover:bg-orange-hover transition-colors shrink-0 flex items-center gap-1 shadow-sm"
                >
                  <Eye size={13} />
                  <span>{lang === 'fr' ? "Voir l'aperçu" : "Live View"}</span>
                </button>
              )}
            </div>
          )}

          {/* Main Floating Input Box */}
          <motion.div 
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`relative rounded-[26px] border transition-all duration-300 chat-input-shadow ${
            isDark 
              ? 'bg-[#0E1420]/95 border-white/[0.12] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10' 
              : 'bg-white border-slate-200 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10 shadow-lg'
          }`}>
            {/* Uploaded attachments thumbnails */}
            <AnimatePresence>
              {selectedImages.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 p-3 pb-0"
                >
                  {selectedImages.map((img, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="relative group w-14 h-14 rounded-xl overflow-hidden border border-white/10"
                    >
                      <img src={img} alt="Upload" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={11} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <div className="relative w-full min-h-[64px] max-h-[220px] flex flex-col">
              {/* Autocomplete Ghost Layer */}
              <div 
                ref={mirrorRef}
                className="absolute inset-0 pt-3.5 px-4 pb-2 text-sm pointer-events-none select-none whitespace-pre-wrap break-words overflow-y-auto scrollbar-hide"
                style={{ 
                  fontFamily: 'inherit',
                  lineHeight: '1.45rem',
                  fontSize: '0.925rem'
                }}
              >
                <span className="opacity-0">{prompt}</span>
                {suggestion && (
                  <span className={`${isDark ? 'text-white/30' : 'text-slate-400/70'} italic`}>
                    {(!prompt.endsWith(' ') && !suggestion.startsWith(' ') ? ' ' : '') + suggestion}
                  </span>
                )}
              </div>

              <textarea 
                ref={textareaRef}
                value={prompt}
                rows={1}
                onScroll={(e) => {
                  if (mirrorRef.current) {
                    mirrorRef.current.scrollTop = e.currentTarget.scrollTop;
                  }
                }}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (mirrorRef.current) {
                    mirrorRef.current.scrollTop = e.target.scrollTop;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && suggestion) {
                    e.preventDefault();
                    const needsPaddedSpace = !prompt.endsWith(' ') && !suggestion.startsWith(' ');
                    setPrompt(prompt + (needsPaddedSpace ? ' ' : '') + suggestion);
                    setSuggestion("");
                  } else if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    setSuggestion("");
                    handleSend();
                  }
                }}
                placeholder={lang === 'fr' ? "Demandez à Cook IA de concevoir une application, modifier du code..." : "Ask Cook IA to build an app, edit code, or redesign..."}
                className={`w-full bg-transparent pt-3.5 px-4 pb-2 text-sm focus:outline-none resize-none min-h-[56px] max-h-[180px] custom-scrollbar ${
                  isDark ? 'text-white placeholder:text-white/40' : 'text-slate-900 placeholder:text-slate-500 font-medium'
                }`}
                style={{
                  lineHeight: '1.45rem',
                  fontSize: '0.925rem'
                }}
              />
            </div>

            {/* Bottom Action Bar inside prompt container (Claude / ChatGPT style) */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex items-center gap-1">
                {/* File / Image attachment */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                  title={lang === 'fr' ? "Joindre une image ou capture" : "Attach image"}
                >
                  <ImagePlus size={17} />
                </motion.button>

                {/* Clone Site */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCloneSite}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                  title={lang === 'fr' ? "Cloner un site web via URL" : "Clone site via URL"}
                >
                  <Copy size={17} />
                </motion.button>

                {/* E-commerce product */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onEcommerceProduct}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                  title={lang === 'fr' ? "Importer un produit e-commerce" : "Import e-commerce product"}
                >
                  <ShoppingBag size={17} />
                </motion.button>

                {/* Hands-Free Voice Control */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition-all ${
                    isListening 
                      ? 'text-red-400 bg-red-500/20 ring-2 ring-red-500/40 animate-pulse' 
                      : (isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100')
                  }`}
                  title={isListening ? (lang === 'fr' ? "En écoute..." : "Listening...") : (lang === 'fr' ? "Dicter vocalement" : "Voice dictation")}
                >
                  <Mic size={17} />
                </motion.button>

                {/* AI Mode Selector: Code vs Chat/No Code */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => onToggleAiMode?.()}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    aiMode === 'chat'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                      : (isDark ? 'text-white/70 hover:text-white hover:bg-white/[0.06] border border-white/10' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300')
                  }`}
                  title={aiMode === 'chat' ? (lang === 'fr' ? "Mode Conversation actif (Ne pas générer de code)" : "Chat Mode active (No code generation)") : (lang === 'fr' ? "Mode Développement Web actif (Générer du code)" : "Code generation mode")}
                >
                  {aiMode === 'chat' ? (
                    <>
                      <MessageSquare size={13} className="fill-white/30" />
                      <span className="truncate max-w-[110px] sm:max-w-none">{lang === 'fr' ? "Ne pas coder" : "Chat only"}</span>
                    </>
                  ) : (
                    <>
                      <Code2 size={13} className={isDark ? 'text-orange-primary' : 'text-orange-600'} />
                      <span className="truncate max-w-[110px] sm:max-w-none">{lang === 'fr' ? "Mode Code" : "Code"}</span>
                    </>
                  )}
                </motion.button>

                {/* Focus mode switch */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsFocusMode?.(!isFocusMode)}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isFocusMode 
                      ? 'bg-orange-primary text-white shadow-md shadow-slate-900/20' 
                      : (isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100')
                  }`}
                  title="Focus Mode"
                >
                  <Zap size={13} className={isFocusMode ? 'fill-white' : ''} />
                  <span>Focus</span>
                </motion.button>
              </div>

              {/* Right Side: Autocomplete Pill & Send Button */}
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {suggestion && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const needsPaddedSpace = !prompt.endsWith(' ') && !suggestion.startsWith(' ');
                        setPrompt(prompt + (needsPaddedSpace ? ' ' : '') + suggestion);
                        setSuggestion("");
                      }}
                      className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        isDark 
                          ? 'bg-orange-primary/10 text-orange-primary border border-orange-primary/20 hover:bg-orange-primary/20' 
                          : 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>Tab ⇥</span>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Send Button (Glowing circular arrow button) */}
                <motion.button 
                  whileHover={prompt.trim() && !isLoading ? { scale: 1.05 } : {}}
                  whileTap={prompt.trim() && !isLoading ? { scale: 0.95 } : {}}
                  onClick={handleSend}
                  disabled={isLoading || !prompt.trim()}
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    prompt.trim() && !isLoading
                      ? 'bg-slate-900 dark:bg-orange-primary text-white shadow-lg cursor-pointer overflow-hidden' 
                      : (isDark ? 'bg-white/[0.08] text-white/20 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                  }`}
                  title={lang === 'fr' ? "Envoyer (Entrée)" : "Send (Enter)"}
                >
                  {prompt.trim() && !isLoading && (
                    <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  )}
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin text-white relative z-10" />
                  ) : (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={prompt.trim() ? 'active' : 'inactive'}
                      className="relative z-10 flex items-center justify-center"
                    >
                      <ArrowUp size={18} strokeWidth={2.5} />
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Micro Footer Hint */}
          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-center">
            <span className={`${isDark ? 'text-white/40' : 'text-slate-600 font-medium'}`}>
              {lang === 'fr' 
                ? "Cook IA génère du code web complet HTML5, CSS3 et JavaScript interactif." 
                : "Cook IA generates production-ready HTML5, CSS3 and interactive JavaScript."}
            </span>
            <span className={`hidden sm:inline ${isDark ? 'text-white/30' : 'text-slate-500 font-semibold'}`}>
              ↵ Envoyer • Shift+↵ Saut de ligne
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
