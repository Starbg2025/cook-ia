import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Send, Loader2, ImagePlus, X, Image as ImageIcon, Copy, ShoppingBag, Video, Search, Layout, CheckCircle, User, Mic, Plus, Sparkles, Flag, ThumbsUp, ThumbsDown, Eye, RotateCcw, ChevronDown, FileText, Clock, Settings, Terminal } from 'lucide-react';
import { Message, ActionHistory } from '../types';
import { shadowWatchdog } from '../services/multiAgentService';
import { UnderwaterWelcome } from './UnderwaterWelcome';
import { MessageActionOverlay } from './MessageActionOverlay';
import { TypingIndicator } from './TypingIndicator';

// ... (rest of the file remains largely the same, applying changes to message mapping logic)

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
}) => {
  const [suggestion, setSuggestion] = React.useState<string>("");
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
    <aside className={`flex-1 flex flex-col h-full ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'} overflow-hidden`}>
      {/* Chat Header */}
      <div className={`h-14 border-b flex items-center justify-between px-6 shrink-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Chat</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onOpenSettings?.('publish')}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-12 scrollbar-hide relative flex flex-col">
        {messages.length <= 1 && !isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-full">
            <div className="w-full max-w-2xl px-6 py-12 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden group">
              {/* Subtle background glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-primary/10 blur-[80px] rounded-full group-hover:bg-orange-primary/20 transition-colors" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-primary/10 blur-[80px] rounded-full group-hover:bg-orange-primary/20 transition-colors" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-primary rounded-2xl flex items-center justify-center shadow-lg mb-8">
                  <Zap size={32} className="text-white fill-white" />
                </div>
                
                <h2 className="font-display text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                  VOTRE VISION, <span className="text-orange-primary">NOS EXPERTS.</span>
                </h2>
                
                <p className={`text-sm md:text-base ${isDark ? 'text-white/60' : 'text-slate-500'} mb-10 max-w-lg leading-relaxed`}>
                  Décrivez votre projet web et laissez notre système multi-agents expert (GLM, Gemini, Llama) s'occuper de l'architecture, du design et du code.
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                   {['E-commerce', 'Dashboard', 'Landing Page', 'SaaS'].map(tag => (
                     <span key={tag} className={`px-4 py-1.5 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-200 text-slate-400'} text-[10px] font-bold uppercase tracking-widest`}>
                       {tag}
                     </span>
                   ))}
                </div>

                <div className="flex flex-col items-center gap-2 text-orange-primary/60 animate-bounce">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Posez votre question ci-dessous</span>
                  <ChevronDown size={16} />
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

      <div className={`p-4 lg:p-6 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
        <div className={`max-w-4xl mx-auto relative border ${isDark ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-slate-50'} rounded-[24px] transition-all focus-within:border-blue-500/50 shadow-sm`}>
          
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
