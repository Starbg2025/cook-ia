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
import { Message, ActionHistory } from '../types';
import { shadowWatchdog } from '../services/multiAgentService';
import { UnderwaterWelcome } from './UnderwaterWelcome';
import { MessageActionOverlay } from './MessageActionOverlay';
import { TypingIndicator } from './TypingIndicator';
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
        {isLoading && <Loader2 size={13} className="animate-spin text-orange-primary" />}
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
  onToggleAiMode
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
            model: "gemini-2.5-flash"
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
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-orange-primary/10 border border-orange-primary/20 text-orange-primary text-xs font-semibold">
            <Sparkles size={13} className="text-orange-primary" />
            <span>Cook IA 3.5 Ultimate</span>
          </div>
          <span className={`text-xs hidden sm:inline ${isDark ? 'text-white/40' : 'text-slate-400'}`}>•</span>
          <span className={`text-xs hidden sm:inline font-mono ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
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
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Eye size={13} />
              <span>{lang === 'fr' ? "Aperçu Direct" : "Live Preview"}</span>
            </button>
          )}

          <button 
            onClick={() => onOpenSettings?.('publish')}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-white/60 hover:bg-white/[0.06] hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            title={lang === 'fr' ? "Paramètres" : "Settings"}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 custom-scrollbar relative flex flex-col">
        {messages.length <= 1 && !isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full py-8">
            {/* Claude / ChatGPT Signature Greeting */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center mb-8 sm:mb-10"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-primary to-amber-500 shadow-xl shadow-orange-primary/20 mb-5 border border-white/20">
                <Zap size={28} className="text-white fill-white" />
              </div>
              <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {lang === 'fr' ? "Que souhaitez-vous concevoir ?" : "What would you like to build?"}
              </h1>
              <p className={`text-sm sm:text-base max-w-lg mx-auto ${isDark ? 'text-white/60' : 'text-slate-600'} leading-relaxed`}>
                {lang === 'fr' 
                  ? "Cook IA orchestre des modèles d'élite pour concevoir, coder et déployer vos applications web en quelques secondes."
                  : "Cook IA orchestrates elite AI models to architect, code, and deploy stunning full-stack web applications in seconds."}
              </p>
            </motion.div>

            {/* Modern Starter Cards (ChatGPT / Claude 2x2 grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-8">
              {starterCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    onClick={() => {
                      setPrompt(card.prompt);
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
                      isDark 
                        ? 'bg-[#0E1420]/80 hover:bg-[#141C2C] border-white/[0.07] hover:border-orange-primary/40 shadow-sm' 
                        : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-orange-primary/40 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                        isDark 
                          ? 'bg-white/[0.04] text-orange-primary group-hover:bg-orange-primary/10' 
                          : 'bg-orange-50 text-orange-600 group-hover:bg-orange-100'
                      }`}>
                        <IconComponent size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h3 className={`text-sm font-bold truncate ${isDark ? 'text-white group-hover:text-orange-primary' : 'text-slate-900 group-hover:text-orange-600'} transition-colors`}>
                            {card.title}
                          </h3>
                          <ArrowUp size={14} className="rotate-45 opacity-0 group-hover:opacity-100 text-orange-primary transition-opacity shrink-0" />
                        </div>
                        <p className={`text-xs ${isDark ? 'text-white/50' : 'text-slate-500'} line-clamp-2 leading-relaxed`}>
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className={`text-xs font-semibold ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                {lang === 'fr' ? "Suggestions :" : "Quick start:"}
              </span>
              {[
                { label: lang === 'fr' ? "🚀 Clone un site" : "🚀 Clone a website", action: onCloneSite },
                { label: lang === 'fr' ? "🛍️ Produit E-commerce" : "🛍️ E-commerce Product", action: onEcommerceProduct },
                { label: lang === 'fr' ? "📊 Audit SEO & Performance" : "📊 SEO & Performance Audit", action: () => setPrompt("Fais un audit SEO complet et optimise la vitesse du site web.") }
              ].map((pill, i) => (
                <button
                  key={i}
                  onClick={pill.action}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    isDark 
                      ? 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.06]' 
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
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
                        ? (isDark ? 'bg-white/20 text-white' : 'bg-slate-900 text-white')
                        : 'bg-gradient-to-tr from-orange-primary to-amber-500 text-white shadow-sm'
                    }`}>
                      {isUser ? <User size={13} /> : <Zap size={13} className="fill-white" />}
                    </div>
                    <span className={`text-xs font-semibold ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                      {isUser ? (lang === 'fr' ? 'Vous' : 'You') : 'Cook IA'}
                    </span>
                    {!isUser && msg.modelName && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                        isDark ? 'bg-white/[0.04] border-white/[0.08] text-white/40' : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        {msg.modelName}
                      </span>
                    )}
                  </div>

                  {/* Bubble Container */}
                  <div className={`relative max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                    isUser
                      ? (isDark 
                          ? 'bg-orange-primary/15 text-white border border-orange-primary/30 rounded-tr-none' 
                          : 'bg-orange-500 text-white rounded-tr-none shadow-sm')
                      : (isDark 
                          ? 'bg-[#0E1420] text-white/90 border border-white/[0.08] rounded-tl-none shadow-sm' 
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-sm')
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
                      <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/10 text-white/80' : 'bg-slate-50 border-slate-200 text-slate-700'} font-mono text-xs leading-relaxed`}>
                        {msg.content}
                      </div>
                    ) : (
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none break-words"
                        dangerouslySetInnerHTML={{ __html: (msg.content || '').replace(/\n/g, '<br />') }} 
                      />
                    )}

                    {/* Action History logs */}
                    {msg.actionHistory && msg.actionHistory.length > 0 && (
                      <div className="flex flex-col gap-1 border-t border-white/[0.06] pt-3 mt-3">
                        {msg.actionHistory.map((action, i) => (
                          <ActionHistoryItem key={i} action={action} isDark={isDark} />
                        ))}
                      </div>
                    )}

                    {/* Assistant message action bar */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-white/[0.06]">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleCopyMessage(msg.content || '', idx)}
                            className={`p-1.5 rounded-md transition-colors ${
                              isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.06]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                            title={lang === 'fr' ? "Copier le texte" : "Copy text"}
                          >
                            {copiedIndex === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                          
                          <button 
                            onClick={() => onFeedback?.(idx, 'like')}
                            className={`p-1.5 rounded-md transition-colors ${
                              msg.feedback === 'like' 
                                ? 'text-emerald-400 bg-emerald-500/10' 
                                : (isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.06]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100')
                            }`}
                            title="Utile"
                          >
                            <ThumbsUp size={14} />
                          </button>

                          <button 
                            onClick={() => onFeedback?.(idx, 'dislike')}
                            className={`p-1.5 rounded-md transition-colors ${
                              msg.feedback === 'dislike' 
                                ? 'text-rose-400 bg-rose-500/10' 
                                : (isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.06]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100')
                            }`}
                            title="Pas utile"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </div>

                        {onSelectView && (
                          <button
                            onClick={() => onSelectView('preview')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-orange-primary hover:text-orange-hover transition-colors"
                          >
                            <Eye size={13} />
                            <span>{lang === 'fr' ? "Voir dans l'éditeur" : "Open Preview"}</span>
                          </button>
                        )}
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
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-primary to-amber-500 flex items-center justify-center text-white text-xs">
                <Loader2 size={13} className="animate-spin" />
              </div>
              <span className="text-xs font-bold text-orange-primary">
                Cook IA Agent Engine
              </span>
            </div>
            
            <div className="w-full">
              <TypingIndicator 
                status={loadingStatus} 
                isDark={isDark} 
                actions={actions}
                currentAgentStage={currentAgentStage}
                onAbort={onAbort}
                onOpenLivePreview={onSelectView ? () => onSelectView('preview') : undefined}
              />
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
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-orange-primary/10 border border-orange-primary/25 flex items-center justify-between gap-3 text-orange-primary text-xs font-semibold backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <Loader2 size={15} className="animate-spin shrink-0 text-orange-primary" />
                <span className="truncate">{loadingStatus || (lang === 'fr' ? "Génération du projet en cours..." : "Generating project...")}</span>
              </div>
              {onSelectView && (
                <button 
                  onClick={() => onSelectView('preview')}
                  className="px-3 py-1 bg-orange-primary text-white rounded-lg text-xs font-bold hover:bg-orange-hover transition-colors shrink-0 flex items-center gap-1"
                >
                  <Eye size={13} />
                  <span>{lang === 'fr' ? "Voir l'aperçu" : "Live View"}</span>
                </button>
              )}
            </div>
          )}

          {/* Main Floating Input Box */}
          <div className={`relative rounded-[26px] border transition-all duration-200 chat-input-shadow ${
            isDark 
              ? 'bg-[#0E1420]/95 border-white/[0.12] focus-within:border-orange-primary/60 focus-within:ring-2 focus-within:ring-orange-primary/20' 
              : 'bg-white border-slate-200 focus-within:border-orange-primary/60 focus-within:ring-2 focus-within:ring-orange-primary/10 shadow-lg'
          }`}>
            {/* Uploaded attachments thumbnails */}
            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 pb-0">
                {selectedImages.map((img, i) => (
                  <div key={i} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-white/10">
                    <img src={img} alt="Upload" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

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
                  isDark ? 'text-white placeholder:text-white/30' : 'text-slate-900 placeholder:text-slate-400'
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
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.06]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title={lang === 'fr' ? "Joindre une image ou capture" : "Attach image"}
                >
                  <ImagePlus size={17} />
                </button>

                {/* Clone Site */}
                <button 
                  onClick={onCloneSite}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'text-white/50 hover:text-orange-primary hover:bg-white/[0.06]' : 'text-slate-500 hover:text-orange-600 hover:bg-slate-100'
                  }`}
                  title={lang === 'fr' ? "Cloner un site web via URL" : "Clone site via URL"}
                >
                  <Copy size={17} />
                </button>

                {/* E-commerce product */}
                <button 
                  onClick={onEcommerceProduct}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'text-white/50 hover:text-orange-primary hover:bg-white/[0.06]' : 'text-slate-500 hover:text-orange-600 hover:bg-slate-100'
                  }`}
                  title={lang === 'fr' ? "Importer un produit e-commerce" : "Import e-commerce product"}
                >
                  <ShoppingBag size={17} />
                </button>

                {/* Hands-Free Voice Control */}
                <button 
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition-all ${
                    isListening 
                      ? 'text-red-400 bg-red-500/20 ring-2 ring-red-500/40 animate-pulse' 
                      : (isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.06]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
                  }`}
                  title={isListening ? (lang === 'fr' ? "En écoute..." : "Listening...") : (lang === 'fr' ? "Dicter vocalement" : "Voice dictation")}
                >
                  <Mic size={17} />
                </button>

                {/* AI Mode Selector: Code vs Chat/No Code */}
                <button
                  type="button"
                  onClick={() => onToggleAiMode?.()}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    aiMode === 'chat'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                      : (isDark ? 'text-white/60 hover:text-white hover:bg-white/[0.06] border border-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60')
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
                      <Code2 size={13} className="text-orange-primary" />
                      <span className="truncate max-w-[110px] sm:max-w-none">{lang === 'fr' ? "Mode Code" : "Code"}</span>
                    </>
                  )}
                </button>

                {/* Focus mode switch */}
                <button
                  type="button"
                  onClick={() => setIsFocusMode?.(!isFocusMode)}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isFocusMode 
                      ? 'bg-orange-primary text-white shadow-md shadow-orange-primary/30' 
                      : (isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.06]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100')
                  }`}
                  title="Focus Mode"
                >
                  <Zap size={13} className={isFocusMode ? 'fill-white' : ''} />
                  <span>Focus</span>
                </button>
              </div>

              {/* Right Side: Autocomplete Pill & Send Button */}
              <div className="flex items-center gap-2">
                {suggestion && (
                  <button
                    onClick={() => {
                      const needsPaddedSpace = !prompt.endsWith(' ') && !suggestion.startsWith(' ');
                      setPrompt(prompt + (needsPaddedSpace ? ' ' : '') + suggestion);
                      setSuggestion("");
                    }}
                    className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isDark 
                        ? 'bg-orange-primary/10 text-orange-primary border border-orange-primary/20 hover:bg-orange-primary/20' 
                        : 'bg-orange-50 text-orange-600 border border-orange-200'
                    }`}
                  >
                    <span>Tab ⇥</span>
                  </button>
                )}

                {/* Send Button (Glowing circular arrow button) */}
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !prompt.trim()}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    prompt.trim() && !isLoading
                      ? 'bg-gradient-to-tr from-orange-primary to-amber-500 text-white shadow-md shadow-orange-primary/30 hover:scale-105 active:scale-95 cursor-pointer' 
                      : (isDark ? 'bg-white/[0.08] text-white/20 cursor-not-allowed' : 'bg-slate-100 text-slate-300 cursor-not-allowed')
                  }`}
                  title={lang === 'fr' ? "Envoyer (Entrée)" : "Send (Enter)"}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <ArrowUp size={18} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Micro Footer Hint */}
          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-center">
            <span className={`${isDark ? 'text-white/30' : 'text-slate-400'}`}>
              {lang === 'fr' 
                ? "Cook IA peut générer du code complet React 18, Express et Tailwind CSS." 
                : "Cook IA generates production-ready React 18, Express and Tailwind CSS."}
            </span>
            <span className={`hidden sm:inline ${isDark ? 'text-white/20' : 'text-slate-300'}`}>
              ↵ Envoyer • Shift+↵ Saut de ligne
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
