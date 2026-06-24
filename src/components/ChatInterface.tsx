import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Send, Loader2, ImagePlus, X, Image as ImageIcon, Copy, ShoppingBag, Video, Search, Layout, CheckCircle, User, Mic, Plus, Sparkles, Flag, ThumbsUp, ThumbsDown, Eye, RotateCcw, ChevronDown, FileText, Clock, Settings, Terminal, MessageSquare, Paintbrush, Trash2, ArrowUp, ArrowDown, Box, Play, Sliders } from 'lucide-react';
import { Message, ActionHistory } from '../types';
import { shadowWatchdog } from '../services/multiAgentService';

export interface CanvasBlock {
  id: string;
  type: 'header' | 'hero' | 'features' | 'motionsites3d' | 'cta' | 'footer';
  title: string;
  description: string;
  accentColor: string;
  has3DModel?: boolean;
  modelType?: 'crystal' | 'torus' | 'landscape' | 'sphere';
}
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
}

const ActionHistoryItem: React.FC<{ action: ActionHistory; isDark: boolean }> = ({ action, isDark }) => {
  const isCompleted = action.status === 'completed';
  const isLoading = action.status === 'loading';
  const isFailed = action.status === 'failed';

  const icon = action.type === 'read' ? <FileText size={12} /> : action.type === 'shell' ? <Terminal size={12} /> : <Clock size={12} />;
  
  return (
    <div className={`flex items-center justify-between gap-3 py-1.5 px-3 rounded-lg group transition-all`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <span className={`${isDark ? 'text-white/40' : 'text-slate-400'} shrink-0`}>{icon}</span>
        <span className={`text-xs truncate ${isDark ? 'text-white/60' : 'text-slate-600'} font-mono`}>
          {action.content}
        </span>
      </div>
      <div className="shrink-0">
        {isLoading && <Loader2 size={12} className="animate-spin text-blue-500" />}
        {isCompleted && (
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-3.5 h-3.5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center"
          >
            <CheckCircle size={8} className="text-green-500" strokeWidth={3} />
          </motion.div>
        )}
        {isFailed && <X size={12} className="text-red-500" />}
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
}) => {
  const t = translations[lang];
  const [suggestion, setSuggestion] = React.useState<string>("");
  const [chatMode, setChatMode] = React.useState<'chat' | 'canvas'>('chat');
  const [canvasBlocks, setCanvasBlocks] = React.useState<CanvasBlock[]>([
    {
      id: '1',
      type: 'header',
      title: 'Cook Studio Navigation',
      description: 'Barre de navigation transparente avec logo cyberpunk et effets néon de survol.',
      accentColor: '#FF6B00'
    },
    {
      id: '2',
      type: 'hero',
      title: 'Cinematic Fluid Motion Platform',
      description: 'Grande bannière immersive avec typographies de prestige et transitions fluides.',
      accentColor: '#3B82F6',
      has3DModel: true,
      modelType: 'torus'
    },
    {
      id: '3',
      type: 'motionsites3d',
      title: 'motionsites.ai Interactive 3D Grid',
      description: 'Section de modèles 3D haut de gamme fluides de motionsites.ai intégrés nativement pour l\'engagement utilisateur.',
      accentColor: '#8B5CF6',
      has3DModel: true,
      modelType: 'landscape'
    },
    {
      id: '4',
      type: 'features',
      title: 'Bento Grid Cybernetic Analytics',
      description: 'Grille d\'information asymétrique avec données réelles, micro-interactions et survol dynamique.',
      accentColor: '#10B981'
    },
    {
      id: '5',
      type: 'cta',
      title: 'Rejoignez la Révolution Virtuelle',
      description: 'Bouton d\'appel à l\'action interactif avec vagues énergétiques et champ d\'inscription.',
      accentColor: '#FF6B00'
    }
  ]);
  const [canvasPrompt, setCanvasPrompt] = React.useState('');
  const [isCompiling, setIsCompiling] = React.useState(false);
  const [compileStep, setCompileStep] = React.useState(0);
  const [isGeneratingDesign, setIsGeneratingDesign] = React.useState(false);
  const [editingBlockId, setEditingBlockId] = React.useState<string | null>(null);

  const addBlock = (type: CanvasBlock['type']) => {
    const newBlock: CanvasBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: type === 'header' ? 'New Navigation Bar' :
             type === 'hero' ? 'Epic Showcase Hero' :
             type === 'features' ? 'Dynamic Features Bento Grid' :
             type === 'motionsites3d' ? 'motionsites.ai 3D Space' :
             type === 'cta' ? 'Action Conversion Panel' : 'Footer Section',
      description: type === 'motionsites3d' 
        ? 'Modèle 3D fluide interactif connecté à motionsites.ai pour magnifier le design.'
        : 'Double-cliquez pour personnaliser la description de cette section originale.',
      accentColor: type === 'header' ? '#FF6B00' : type === 'hero' ? '#3B82F6' : type === 'motionsites3d' ? '#8B5CF6' : '#10B981',
      has3DModel: type === 'hero' || type === 'motionsites3d',
      modelType: type === 'hero' ? 'torus' : type === 'motionsites3d' ? 'landscape' : undefined
    };
    setCanvasBlocks([...canvasBlocks, newBlock]);
  };

  const deleteBlock = (id: string) => {
    setCanvasBlocks(canvasBlocks.filter(b => b.id !== id));
    if (editingBlockId === id) setEditingBlockId(null);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const idx = canvasBlocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === canvasBlocks.length - 1) return;

    const newBlocks = [...canvasBlocks];
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    const temp = newBlocks[idx];
    newBlocks[idx] = newBlocks[swapWith];
    newBlocks[swapWith] = temp;
    setCanvasBlocks(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<CanvasBlock>) => {
    setCanvasBlocks(canvasBlocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const generateAICanvasDesign = () => {
    setIsGeneratingDesign(true);
    setTimeout(() => {
      const p = canvasPrompt.trim().toLowerCase();
      let themeName = p ? `Themed [${canvasPrompt}]` : "Neo-Minimalist Dashboard";
      let accent = p.includes('orange') ? '#FF6B00' : p.includes('purple') ? '#8B5CF6' : p.includes('green') ? '#10B981' : '#3B82F6';
      
      setCanvasBlocks([
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'header',
          title: `${themeName} Navigation`,
          description: 'Barre de navigation aérienne optimisée pour les conversions.',
          accentColor: accent
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'hero',
          title: `Slogan Principal: ${canvasPrompt || 'Innover au-delà du possible'}`,
          description: 'Introduction cinématographique avec typographie monumentale.',
          accentColor: accent,
          has3DModel: true,
          modelType: 'crystal'
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'motionsites3d',
          title: 'motionsites.ai 3D Torus Engine',
          description: 'Élément 3D exclusif motionsites.ai créant des ondulations cinétiques au défilement.',
          accentColor: '#8B5CF6',
          has3DModel: true,
          modelType: 'torus'
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'features',
          title: 'Caractéristiques d\'Élite',
          description: 'Grille d\'information structurée asymétrique.',
          accentColor: '#10B981'
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'cta',
          title: 'Lancez votre projet',
          description: 'Bouton d\'appel d\'action fluorescent.',
          accentColor: accent
        }
      ]);
      setIsGeneratingDesign(false);
      setCanvasPrompt('');
    }, 1200);
  };

  const compileSteps = [
    { title: "Initialisation du réacteur Cook IA Canvas", desc: "Connexion aux agents de compilation d'élite..." },
    { title: "Analyse sémantique du Canvas Visuel", desc: "Traduction des blocs de mise en page en structures d'interface sémantiques..." },
    { title: "Amorçage du moteur de rendu 3D motionsites.ai", desc: "Connexion des modèles 3D ultra-fluides natifs à WebGL..." },
    { title: "Optimisation de l'architecture responsive", desc: "Ajustement des ratios mobiles et de la grille d'agencement..." },
    { title: "Lancement du pipeline Cook IA Code", desc: "Compilation finale et écriture du code cinématique original..." }
  ];

  const connectToCode = () => {
    setIsCompiling(true);
    setCompileStep(0);
    
    const interval = setInterval(() => {
      setCompileStep(prev => {
        if (prev >= compileSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCompiling(false);
            setChatMode('chat');
            
            const blockDescriptions = canvasBlocks.map((b, i) => {
              let details = `- Section ${i+1} [${b.type.toUpperCase()}]: "${b.title}" (${b.description})`;
              if (b.has3DModel) {
                details += ` avec modèle 3D motionsites.ai [${b.modelType}] fluide`;
              }
              return details;
            }).join('\n');

            const fullPrompt = `Crée le site web de rêve basé sur le design Cook IA Canvas suivant :\n${blockDescriptions}\n\nUtilise les animations fluides de motion/react, un style moderne haut de gamme, et intègre des modèles ou des animations 3D fluides inspirées de motionsites.ai pour créer des vagues cinématiques que d'autres IA conventionnelles ne peuvent pas créer.`;
            setPrompt(fullPrompt);
            setTimeout(() => {
              handleSend();
            }, 100);
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const mirrorRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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

    // 1. Local Smart Suggestion Map (French and English)
    const localTemplates: Record<string, string> = {
      "cré": "er une landing page moderne et responsive",
      "cre": "ate a stunning dark theme landing page",
      "mod": "ifier la barre de navigation pour ajouter un logo",
      "ajo": "uter une section de témoignages clients",
      "add": " a clean test suite and build pipeline",
      "fai": "s un audit complet des performances SEO",
      "gen": "érer des maquettes de présentation haut de gamme",
      "gén": "érer un superbe menu pour restaurant",
      "com": "ment connecter mon application à une base de données Firebase ?",
      "le m": "odèle d'une clé API gratuite pour tester le projet",
      "le mo": "dèle d'une clé API gratuite pour tester",
      "peux": "-tu corriger les avertissements et adapter la mise en page",
      "how": " to deploy this application on Netlify or Vercel"
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

    // 2. Real-time Gemini prediction (Debounced at 700ms)
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch("/api/ai/gemini", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Suggère une courte complétion en français (entre 2 et 5 mots) pour continuer ou terminer naturellement la phrase de l'utilisateur. L'utilisateur écrit : "${prompt}". Ne renvoie QUE la partie complétée (la suite de la phrase), pas toute la saisie, ni de remarques ou de guillemets. Garde cela simple et en minuscules. Ex: si l'utilisateur saisit "comment faire ", renvoie "une tarte aux pommes".`,
            systemInstruction: "Tu es un assistant d'autocomplétion en ligne ultra-rapide. Renvoie uniquement la suite directe de la phrase en français, sans fioritures ni guillemets.",
            model: "gemini-3.5-flash"
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
        // Suppress abort errors on keystrokes
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
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [setPrompt]);

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

    const remainingSlots = 20 - selectedImages.length;
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

  return (
    <aside className={`flex-1 flex flex-col h-full ${isDark ? 'bg-abyssal-deep' : 'bg-white'} overflow-hidden relative`}>
      {/* Dynamic Cyber-glow backdrops */}
      {isDark && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-40">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[160px]" />
        </div>
      )}

      {/* Chat Header with Switchable Modes */}
      <div className={`h-14 border-b flex items-center justify-between px-6 shrink-0 relative z-10 ${isDark ? 'border-white/5 bg-abyssal-deep/60 backdrop-blur-md' : 'border-slate-100 bg-white/80'}`}>
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setChatMode('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chatMode === 'chat'
                ? 'bg-orange-primary text-white shadow-lg shadow-orange-primary/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare size={13} />
            {lang === 'fr' ? 'Console Chat' : 'Chat Console'}
          </button>
          
          <button
            onClick={() => setChatMode('canvas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${
              chatMode === 'canvas'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Paintbrush size={13} />
            {lang === 'fr' ? 'Cook IA Canvas' : 'Cook IA Canvas'}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {chatMode === 'canvas' && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
              <Box size={10} className="animate-spin text-purple-400" style={{ animationDuration: '3s' }} />
              Design Studio Mode Only
            </span>
          )}
          <button 
            onClick={() => onOpenSettings?.('publish')}
            className={`p-2 rounded-lg transition-all ${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white hover:scale-105' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-105'}`}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {chatMode === 'chat' ? (
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-12 scrollbar-hide relative flex flex-col z-15">
          {messages.length <= 1 && !isLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-full">
              <div className="w-full max-w-2xl px-6 py-12 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl relative overflow-hidden group shadow-2xl">
                {/* Subtle background glow */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-primary/10 blur-[90px] rounded-full group-hover:bg-orange-primary/15 transition-all duration-700" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[90px] rounded-full group-hover:bg-blue-500/15 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-tr from-orange-primary to-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,107,0,0.3)] mb-8 transform group-hover:rotate-6 transition-transform duration-500">
                    <Zap size={38} className="text-white fill-white" />
                  </div>
                  
                  <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                    {lang === 'fr' ? (
                      <>CONCEVEZ <span className="text-orange-primary bg-gradient-to-r from-orange-orange-primary to-amber-400 bg-clip-text">L'EXCELLENCE.</span></>
                    ) : (
                      <>DESIGN WITH <span className="text-orange-primary bg-gradient-to-r from-orange-orange-primary to-amber-400 bg-clip-text">EXCELLENCE.</span></>
                    )}
                  </h2>
                  
                  <p className={`text-sm md:text-base ${isDark ? 'text-white/60' : 'text-slate-500'} mb-10 max-w-lg leading-relaxed`}>
                    {lang === 'fr' 
                      ? "Soumettez votre projet et laissez notre équipe d'agents IA experts forger un design d'élite, responsive et haut de gamme."
                      : "Submit your vision and watch our expert AI agents forge an elite, high-end, and fully responsive digital masterpiece."
                    }
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2.5 mb-12">
                     {[
                       { name: 'SaaS Dashboard', prompt: 'Crée un Dashboard SaaS moderne d\'analytics financiers avec graphiques interactifs multicolores et KPI' },
                       { name: 'E-commerce', prompt: 'Construis un site E-commerce haut de gamme de montres de luxe avec panier dynamique, grille de produits et effets de survol élégants' },
                       { name: 'Landing Page', prompt: 'Génère une Landing Page futuriste pour une agence d\'intelligence artificielle avec animations fluides de transition et design épuré' },
                       { name: 'Portfolio', prompt: 'Crée un portfolio interactif de photographe avec galerie d\'images bento-grid, filtrage dynamique et transitions soignées' }
                     ].map(tag => (
                       <button 
                         key={tag.name} 
                         onClick={() => setPrompt(tag.prompt)}
                         className={`px-4 py-2 rounded-xl border cursor-pointer hover:scale-105 active:scale-95 transition-all text-[10px] font-bold uppercase tracking-widest ${
                           isDark 
                             ? 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-orange-primary/10 hover:border-orange-primary/30 shadow-md shadow-black/10' 
                             : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 shadow-sm'
                         }`}
                       >
                         {tag.name}
                       </button>
                     ))}
                  </div>
  
                  <div className="flex flex-col items-center gap-2 text-orange-primary/80 animate-bounce">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                      {lang === 'fr' ? "RÉACTEUR DE CRÉATION CI-DESSOUS" : "CREATION REACTOR BELOW"}
                    </span>
                    <ChevronDown size={14} className="text-orange-primary" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 max-w-4xl mx-auto w-full relative z-10"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' 
                        ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600')
                        : (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                    }`}>
                      {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
                    </div>
                    <span className={`text-[10px] font-bold tracking-[0.2em] ${
                      msg.role === 'user' 
                        ? (isDark ? 'text-white/40' : 'text-slate-400')
                        : 'text-orange-primary'
                    }`}>
                      {msg.role === 'user' ? 'You' : 'cook-ia-engine-v3'}
                    </span>
                  </div>
  
                  <div className="flex flex-col gap-4 pl-9 group relative">
                    {msg.role === 'model' && (
                      <MessageActionOverlay 
                        isDark={isDark}
                        onCopy={() => navigator.clipboard.writeText(msg.content)}
                        onRewrite={(type) => console.log('Rewrite', type)}
                        onAnalyze={() => console.log('Analyze')}
                        onPin={() => console.log('Pin')}
                      />
                    )}
                    {msg.role === 'model' && (
                      <div className={`text-[9px] px-2 py-0.5 rounded-full border w-fit ${
                        isDark ? 'text-white/30 border-white/5 bg-white/5' : 'text-slate-400 border-slate-100 bg-slate-50'
                      } font-mono`}>
                        {msg.modelName || 'cook-ia-engine-v3'}
                      </div>
                    )}
  
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {msg.images.map((img, i) => (
                          <div key={i} className={`group relative w-32 h-32 rounded-2xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-slate-200'} shadow-sm`}>
                            <img src={img} alt={`Reference ${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className={`text-sm leading-relaxed ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                      {msg.content.startsWith('[Planificateur]') || msg.content.startsWith('[Testeur]') || msg.content.startsWith('[Analyste]') ? (
                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} italic text-xs`}>
                          {msg.content}
                        </div>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                      )}
                    </div>
  
                    {msg.actionHistory && msg.actionHistory.length > 0 && (
                      <div className="flex flex-col gap-1 border-l border-white/5 pl-4 mt-2">
                         {msg.actionHistory.map((action, i) => (
                           <ActionHistoryItem key={i} action={action} isDark={isDark} />
                         ))}
                      </div>
                    )}
  
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => onFeedback?.(idx, 'like')}
                            className={`p-1.5 rounded-md transition-colors ${
                              msg.feedback === 'like' 
                                ? 'text-green-500 bg-green-500/10' 
                                : (isDark ? 'text-white/20 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100')
                            }`}
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button 
                            onClick={() => onFeedback?.(idx, 'dislike')}
                            className={`p-1.5 rounded-md transition-colors ${
                              msg.feedback === 'dislike' 
                                ? 'text-red-500 bg-red-500/10' 
                                : (isDark ? 'text-white/20 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100')
                            }`}
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </>
          )}
          
          {isLoading && (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <Loader2 size={12} className="animate-spin" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  Cook IA
                </span>
              </div>
              <div className="pl-9 space-y-6">
                <TypingIndicator status={loadingStatus} isDark={isDark} />
  
                {actions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-xl rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50/50 border-slate-100'} overflow-hidden shadow-sm`}
                  >
                    <div className="p-1">
                      {actions.map((action, i) => (
                        <ActionHistoryItem key={i} action={action} isDark={isDark} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-hide relative flex flex-col z-15 bg-[#030712] text-white">
          {/* Beautiful grid patterns */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto w-full space-y-6 relative z-10 flex flex-col h-full min-h-[500px]">
            
            {/* Canvas Header / Info Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-xl">
              <div>
                <h3 className="font-display font-black text-lg tracking-tight bg-gradient-to-r from-white via-white/90 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                  <Paintbrush size={16} className="text-purple-400" />
                  Studio de Dessin Cook IA Canvas
                </h3>
                <p className="text-xs text-white/50 mt-1 max-w-lg">
                  Créez et organisez visuellement votre mise en page originale. Quand vous êtes prêt, connectez-la à Cook IA Code pour générer le site complet !
                </p>
              </div>
              
              <button
                onClick={connectToCode}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,107,0,0.35)] flex items-center gap-2 cursor-pointer self-stretch md:self-auto justify-center"
              >
                <Zap size={14} className="animate-bounce" />
                Connecter à Cook IA Code
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Column 1: AI Autopilot & Toolbox */}
              <div className="space-y-6">
                
                {/* AI Autopilot Prompter */}
                <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Dessin IA Intelligent</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Laissez l'IA dessiner des gabarits originaux pour vous d'après vos directives stylistiques.
                  </p>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={canvasPrompt}
                      onChange={(e) => setCanvasPrompt(e.target.value)}
                      placeholder="Ex: Minimalist, Cyberpunk, Luxe..."
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={generateAICanvasDesign}
                      disabled={isGeneratingDesign}
                      className="w-full py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/25 text-[10px] font-bold uppercase tracking-widest text-purple-300 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isGeneratingDesign ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-purple-400" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Paintbrush size={12} />
                          Générer Design Original
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Block Adder Toolbox */}
                <div className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders size={14} className="text-orange-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-primary">Boîte à Outils Visuelle</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Ajoutez manuellement des blocs d'interface haut de gamme sur votre canvas interactif :
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'header', label: 'Navigation', icon: <Layout size={12} /> },
                      { type: 'hero', label: 'Hero Bannière', icon: <Zap size={12} /> },
                      { type: 'motionsites3d', label: '3D motionsites.ai', icon: <Box size={12} /> },
                      { type: 'features', label: 'Bento Grid', icon: <Sliders size={12} /> },
                      { type: 'cta', label: 'Call To Action', icon: <Play size={12} /> },
                      { type: 'footer', label: 'Pied de page', icon: <Layout size={12} /> }
                    ].map(tool => (
                      <button
                        key={tool.type}
                        onClick={() => addBlock(tool.type as any)}
                        className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 text-xs font-semibold text-white/80 hover:text-white transition-all text-left cursor-pointer active:scale-95"
                      >
                        <span className="text-orange-primary">{tool.icon}</span>
                        {tool.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Column 2 & 3: The Canvas List */}
              <div className="lg:col-span-2 space-y-4">
                
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Disposition des calques visuels ({canvasBlocks.length})</span>
                  <button
                    onClick={() => setCanvasBlocks([])}
                    className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
                  >
                    Effacer Tout
                  </button>
                </div>

                {canvasBlocks.length === 0 ? (
                  <div className="p-12 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30">
                      <Box size={20} />
                    </div>
                    <span className="font-bold text-sm text-white/70">Votre canvas est vide</span>
                    <p className="text-xs text-white/40 max-w-xs">
                      Ajoutez des composants depuis la boîte à outils ou générez un design IA complet pour démarrer.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                    {canvasBlocks.map((block, index) => {
                      const isEditing = editingBlockId === block.id;
                      return (
                        <div
                          key={block.id}
                          className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all relative group overflow-hidden"
                          style={{ borderLeft: `4px solid ${block.accentColor}` }}
                        >
                          {/* Backglow gradient */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-2xl pointer-events-none rounded-full" />
                          
                          <div className="flex items-start justify-between gap-4 relative z-10">
                            
                            <div className="flex items-start gap-3 flex-1">
                              {/* Component Icon representation */}
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center text-white/50 shrink-0 mt-0.5 border border-white/5">
                                <span className="text-[9px] font-mono font-black text-white/30">{index + 1}</span>
                                {block.type === 'motionsites3d' ? <Box size={14} className="text-purple-400 animate-pulse" /> : <Layout size={14} />}
                              </div>

                              <div className="space-y-1 flex-1">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={block.title}
                                      onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                      className="w-full px-2 py-1 rounded border border-purple-500 bg-black/50 text-xs text-white focus:outline-none"
                                    />
                                    <textarea
                                      value={block.description}
                                      onChange={(e) => updateBlock(block.id, { description: e.target.value })}
                                      className="w-full px-2 py-1 rounded border border-purple-500 bg-black/50 text-xs text-white h-16 focus:outline-none"
                                    />
                                    <div className="flex flex-wrap items-center gap-3 pt-1">
                                      <span className="text-[10px] text-white/50">Couleur d'accent:</span>
                                      <input
                                        type="color"
                                        value={block.accentColor}
                                        onChange={(e) => updateBlock(block.id, { accentColor: e.target.value })}
                                        className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
                                      />
                                      
                                      {block.type === 'hero' || block.type === 'motionsites3d' ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-white/50">Modèle 3D:</span>
                                          <select
                                            value={block.modelType || 'torus'}
                                            onChange={(e) => updateBlock(block.id, { modelType: e.target.value as any })}
                                            className="px-2 py-1 bg-black border border-white/10 rounded text-[10px] text-white focus:outline-none"
                                          >
                                            <option value="torus">Torus motionsites.ai</option>
                                            <option value="landscape">Landscape 3D</option>
                                            <option value="crystal">Crystal Cube</option>
                                            <option value="sphere">Dynamic Sphere</option>
                                          </select>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <h4 className="font-bold text-xs text-white tracking-tight flex items-center gap-2">
                                      {block.title}
                                      <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-white/40 uppercase tracking-widest font-mono font-medium">
                                        {block.type}
                                      </span>
                                    </h4>
                                    <p className="text-xs text-white/60 leading-relaxed">
                                      {block.description}
                                    </p>
                                    {block.has3DModel && (
                                      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded mt-1">
                                        <Box size={10} className="animate-spin text-purple-400" style={{ animationDuration: '4s' }} />
                                        Modèle 3D {block.modelType} motionsites.ai activé
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Actions Controls (Move Up/Down, Edit, Delete) */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => moveBlock(block.id, 'up')}
                                disabled={index === 0}
                                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Monter"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button
                                onClick={() => moveBlock(block.id, 'down')}
                                disabled={index === canvasBlocks.length - 1}
                                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Descendre"
                              >
                                <ArrowDown size={13} />
                              </button>
                              <button
                                onClick={() => setEditingBlockId(isEditing ? null : block.id)}
                                className={`p-1.5 rounded-lg text-xs font-bold px-2 py-1 cursor-pointer transition-all ${
                                  isEditing ? 'bg-green-500 text-white' : 'hover:bg-white/5 text-white/40 hover:text-white'
                                }`}
                              >
                                {isEditing ? 'OK' : 'Éditer'}
                              </button>
                              <button
                                onClick={() => deleteBlock(block.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Elegant graphic visual preview nested inside the block */}
                          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: block.accentColor }} />
                              <span className="text-[10px] font-mono text-white/30">Aperçu du Composant</span>
                            </div>

                            {/* Visual mock elements rendering styled graphics! */}
                            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 overflow-hidden">
                              {block.type === 'header' && (
                                <div className="flex gap-2 text-[8px] font-mono text-white/40">
                                  <span className="text-orange-primary font-bold">● NAV</span>
                                  <span>Accueil</span>
                                  <span>À Propos</span>
                                  <span className="px-1.5 bg-orange-primary/15 text-orange-primary rounded">Sign In</span>
                                </div>
                              )}
                              {block.type === 'hero' && (
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col gap-0.5">
                                    <div className="w-8 h-1 bg-white/60 rounded" />
                                    <div className="w-12 h-1 bg-white/40 rounded" />
                                  </div>
                                  <div className="w-4 h-4 rounded-full border border-dashed border-blue-400/50 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  </div>
                                </div>
                              )}
                              {block.type === 'motionsites3d' && (
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-0.5 items-end h-5">
                                    <div className="w-0.5 bg-purple-500/40 rounded animate-pulse" style={{ height: '30%', animationDelay: '0.1s' }} />
                                    <div className="w-0.5 bg-purple-500 rounded animate-pulse" style={{ height: '70%', animationDelay: '0.3s' }} />
                                    <div className="w-0.5 bg-purple-500/60 rounded animate-pulse" style={{ height: '50%', animationDelay: '0.5s' }} />
                                    <div className="w-0.5 bg-purple-500 rounded animate-pulse" style={{ height: '90%', animationDelay: '0.7s' }} />
                                    <div className="w-0.5 bg-purple-500/30 rounded animate-pulse" style={{ height: '20%', animationDelay: '0.9s' }} />
                                  </div>
                                  <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest font-black animate-pulse">motionsites.ai 3D</span>
                                </div>
                              )}
                              {block.type === 'features' && (
                                <div className="flex gap-1">
                                  <div className="w-4 h-3 bg-white/10 rounded-sm" />
                                  <div className="w-6 h-3 bg-white/10 rounded-sm" />
                                  <div className="w-5 h-3 bg-white/15 rounded-sm" />
                                </div>
                              )}
                              {block.type === 'cta' && (
                                <div className="w-10 h-3 bg-orange-primary/30 rounded flex items-center justify-center">
                                  <div className="w-4 h-1 bg-white/80 rounded-full" />
                                </div>
                              )}
                              {block.type === 'footer' && (
                                <span className="text-[7px] font-mono text-white/20">© Cook Studio 2026</span>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {/* High-Fidelity Cinematic Compiler Modal */}
      <AnimatePresence>
        {isCompiling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02050b]/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="max-w-md w-full space-y-8 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-primary/10 rounded-full blur-[80px]" />
              
              <div className="flex flex-col items-center space-y-4 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-orange-primary to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(255,107,0,0.4)] animate-spin" style={{ animationDuration: '4s' }}>
                  <Box size={36} className="text-white fill-white/10" />
                </div>
                
                <h4 className="font-display font-black text-xl text-white uppercase tracking-wider">
                  RÉACTEUR COOK IA CODE
                </h4>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-bold text-orange-400 uppercase tracking-widest animate-pulse">
                  Compilation du design original
                </div>
              </div>

              {/* Progress Steps / Points Saillants */}
              <div className="space-y-4 text-left bg-white/[0.01] border border-white/5 p-6 rounded-3xl backdrop-blur-md relative z-10">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Points Saillants de Compilation</span>
                
                <div className="space-y-4 mt-2">
                  {compileSteps.map((step, i) => {
                    const isActive = i === compileStep;
                    const isDone = i < compileStep;
                    return (
                      <div key={i} className="flex gap-3 text-xs leading-relaxed transition-all duration-300">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[8px] font-black ${
                            isDone ? 'bg-green-500 border-green-500 text-black' :
                            isActive ? 'border-orange-primary text-orange-primary bg-orange-primary/10 animate-pulse' :
                            'border-white/10 text-white/30'
                          }`}>
                            {isDone ? "✓" : i + 1}
                          </div>
                          {i < compileSteps.length - 1 && (
                            <div className={`w-[1px] h-6 ${isDone ? 'bg-green-500/50' : 'bg-white/5'}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold transition-all ${isActive ? 'text-white' : isDone ? 'text-white/60' : 'text-white/20'}`}>
                            {step.title}
                          </p>
                          {isActive && (
                            <p className="text-[10px] text-orange-400 mt-0.5 animate-pulse">
                              {step.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[9px] font-mono text-white/30 relative z-10 uppercase tracking-widest">
                Aucune autre IA conventionnelle ne possède ce moteur de design visuel
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-4 lg:p-6 ${isDark ? 'bg-abyssal-deep bg-gradient-to-t from-black/80 to-transparent' : 'bg-white'}`}>
        <div className={`max-w-4xl mx-auto relative border ${isDark ? 'border-white/10 bg-[#09111e]/90 backdrop-blur-xl' : 'border-slate-200 bg-slate-50'} rounded-[24px] transition-all duration-300 focus-within:border-orange-primary focus-within:ring-4 focus-within:ring-orange-primary/10 shadow-2xl`}>
          
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border-b border-white/5">
              {selectedImages.map((img, i) => (
                <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                  <img src={img} alt="Upload" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative w-full h-24">
            {/* Mirrored backdrop for displaying suggestions perfectly stacked underneath */}
            <div 
              ref={mirrorRef}
              className={`absolute inset-0 p-4 pr-32 text-sm pointer-events-none select-none whitespace-pre-wrap break-words overflow-y-auto scrollbar-hide`}
              style={{ 
                fontFamily: 'inherit',
                lineHeight: '1.25rem',
                fontSize: '0.875rem'
              }}
            >
              <span className="opacity-0">{prompt}</span>
              {suggestion && (
                <span className={`${isDark ? 'text-white/30' : 'text-slate-400/60'} animate-pulse`}>
                  {(!prompt.endsWith(' ') && !suggestion.startsWith(' ') && !suggestion.startsWith(',') && !suggestion.startsWith('.') && !suggestion.startsWith('?') && !suggestion.startsWith('!') ? ' ' : '') + suggestion}
                </span>
              )}
            </div>

            <textarea 
              ref={textareaRef}
              value={prompt}
              onScroll={(e) => {
                if (mirrorRef.current) {
                  mirrorRef.current.scrollTop = e.currentTarget.scrollTop;
                  mirrorRef.current.scrollLeft = e.currentTarget.scrollLeft;
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
                  const needsPaddedSpace = !prompt.endsWith(' ') && !suggestion.startsWith(' ') && !suggestion.startsWith(',') && !suggestion.startsWith('.') && !suggestion.startsWith('?') && !suggestion.startsWith('!');
                  setPrompt(prompt + (needsPaddedSpace ? ' ' : '') + suggestion);
                  setSuggestion("");
                } else if (e.key === 'ArrowRight' && suggestion && textareaRef.current && textareaRef.current.selectionStart === prompt.length) {
                  e.preventDefault();
                  const needsPaddedSpace = !prompt.endsWith(' ') && !suggestion.startsWith(' ') && !suggestion.startsWith(',') && !suggestion.startsWith('.') && !suggestion.startsWith('?') && !suggestion.startsWith('!');
                  setPrompt(prompt + (needsPaddedSpace ? ' ' : '') + suggestion);
                  setSuggestion("");
                } else if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setSuggestion("");
                  handleSend();
                }
              }}
              placeholder="Type your prompt here..."
              className={`absolute inset-0 w-full bg-transparent p-4 pr-32 text-sm focus:outline-none resize-none h-full scrollbar-hide ${isDark ? 'text-white placeholder:text-white/20' : 'text-slate-900 placeholder:text-slate-400'}`}
              style={{
                fontFamily: 'inherit',
                lineHeight: '1.25rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div className="absolute left-3 bottom-3 flex items-center gap-1">
            <button 
              onClick={onCloneSite}
              className={`p-2 rounded-lg ${isDark ? 'text-orange-primary hover:text-orange-400 hover:bg-white/5' : 'text-orange-600 hover:text-orange-700 hover:bg-slate-100'} transition-all`}
              title="Clone site"
            >
              <Copy size={18} />
            </button>
            <button 
              onClick={onEcommerceProduct}
              className={`p-2 rounded-lg ${isDark ? 'text-orange-primary hover:text-orange-400 hover:bg-white/5' : 'text-orange-600 hover:text-orange-700 hover:bg-slate-100'} transition-all`}
              title="E-commerce product"
            >
              <ShoppingBag size={18} />
            </button>
            <button 
              onClick={() => {
                setPrompt("FAIS UN AUDIT SEO COMPLET DE MON SITE : Analyse les mots-clés, la structure des balises H1-H6, la méta-description et propose des améliorations pour Google.");
                handleSend();
              }}
              className={`p-2 rounded-lg ${isDark ? 'text-orange-primary hover:text-orange-400 hover:bg-white/5' : 'text-orange-600 hover:text-orange-700 hover:bg-slate-100'} transition-all`}
              title="SEO Assistant & Audit"
            >
              <FileText size={18} />
            </button>
            <button 
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-all ${
                isListening 
                  ? 'text-red-500 bg-red-500/10 animate-pulse' 
                  : (isDark ? 'text-orange-primary hover:text-orange-400 hover:bg-white/5' : 'text-orange-600 hover:text-orange-700 hover:bg-slate-100')
              }`}
              title={isListening ? "Listening..." : "Hands-Free Voice Control"}
            >
              <Mic size={18} />
            </button>
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
              className={`p-2 rounded-lg ${isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'} transition-all`}
            >
              <Plus size={18} />
            </button>
          </div>

           <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {suggestion && (
              <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                isDark 
                  ? 'bg-orange-primary/10 text-orange-primary hover:bg-orange-primary/20 border border-orange-primary/20' 
                  : 'bg-orange-50 text-orange-600 border border-orange-100'
              } animate-pulse`}>
                Tab ⇥ pour compléter
              </span>
            )}
            <button
              onClick={() => setIsFocusMode?.(!isFocusMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                isFocusMode 
                  ? 'bg-orange-primary text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]' 
                  : (isDark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-900')
              }`}
            >
              <Zap size={12} className={isFocusMode ? 'animate-pulse' : ''} />
              FOCUS MODE
            </button>
            <button 
              onClick={handleSend}
              disabled={isLoading || !prompt.trim()}
              className={`p-2 rounded-xl transition-all ${
                prompt.trim() 
                  ? 'bg-orange-primary text-white hover:bg-orange-600' 
                  : (isDark ? 'bg-white/5 text-white/20' : 'bg-slate-100 text-slate-300')
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
