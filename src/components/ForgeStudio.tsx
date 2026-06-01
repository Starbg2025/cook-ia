import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Cpu, Image as ImageIcon, Send, Loader2, Sparkles, Check, 
  Copy, ImagePlus, RefreshCw, AlertTriangle, ShieldCheck, X, FileText,
  Search, Palette, Laptop, Sparkle, ArrowRight, BookOpen, Key
} from 'lucide-react';

interface ForgeStudioProps {
  code: string;
  isDark?: boolean;
  onClose: () => void;
  onApplyPrompt: (p: string) => void;
}

interface AuditItem {
  title: string;
  urgency: 'High' | 'Medium' | 'Low';
  description: string;
  fixPrompt: string;
}

export const ForgeStudio: React.FC<ForgeStudioProps> = ({
  code,
  isDark = true,
  onClose,
  onApplyPrompt
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'groq' | 'image-transformer'>('suggestions');
  
  // Custom API keys stored locally for convenience and privacy
  const [storedGroqKey, setStoredGroqKey] = useState<string>(() => {
    return localStorage.getItem('user_groq_api_key') || '';
  });
  
  const [showKeyInput, setShowKeyInput] = useState(false);

  // --- TAB 1: SUGGESTIONS & AUDIT STATES ---
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditList, setAuditList] = useState<AuditItem[]>([]);
  const [auditScore, setAuditScore] = useState<number>(0);

  // --- TAB 2: GROQ ADVISOR STATES ---
  const [groqQuestion, setGroqQuestion] = useState('');
  const [groqHistory, setGroqHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isGroqLoading, setIsGroqLoading] = useState(false);
  const [groqError, setGroqError] = useState<string | null>(null);

  // --- TAB 3: IMAGE TRANSFORMER STATES ---
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'avatar' | 'card' | 'wide'>('card');
  const [imageFilter, setImageFilter] = useState<'none' | 'neon' | 'glass' | 'amber' | 'night'>('none');
  const [unsplashKeyword, setUnsplashKeyword] = useState('');
  const [transformedCode, setTransformedCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Save Groq key locally
  const handleSaveGroqKey = (val: string) => {
    setStoredGroqKey(val);
    localStorage.setItem('user_groq_api_key', val);
    setShowKeyInput(false);
  };

  // Run initial lightweight code audit
  useEffect(() => {
    if (!code) {
      setAuditList([
        {
          title: "Aucun code détecté",
          urgency: "Medium",
          description: "Générez d'abord un site ou une landing page pour voir les suggestions d'optimisation.",
          fixPrompt: "Crée une landing page moderne"
        }
      ]);
      setAuditScore(50);
      return;
    }

    const staticAudits: AuditItem[] = [];
    let score = 95;

    // Direct checks
    if (!code.includes('<meta name="viewport"')) {
      staticAudits.push({
        title: "Configuration de Vue Adaptative manquante",
        urgency: "High",
        description: "L'absence de balise viewport empêchera le site d'être stable et 100% lisible sur mobile.",
        fixPrompt: "Ajoute la balise méta viewport responsive standard dans le head du code."
      });
      score -= 15;
    }

    const imgCount = (code.match(/<img/gi) || []).length;
    const altCount = (code.match(/alt=/gi) || []).length;
    if (imgCount > 0 && altCount < imgCount) {
      staticAudits.push({
        title: "Accessibilité SEO : Balises Alt manquantes",
        urgency: "Medium",
        description: `${imgCount - altCount} image(s) n'ont pas de balise 'alt'. Cela pénalisera l'indexation Google.`,
        fixPrompt: "Assure-toi que toutes les images img contiennent des attributs description alt significatifs."
      });
      score -= 10;
    }

    if (!code.includes('font-family') && !code.includes('--font-')) {
      staticAudits.push({
        title: "Vérification Typographique",
        urgency: "Low",
        description: "Le site utilise des polices par défaut système. Configurez des fontes élégantes comme Space Grotesk ou Inter.",
        fixPrompt: "Modifie la typographie principale du site pour utiliser une police Google élégante comme Inter couplée à Space Grotesk."
      });
      score -= 5;
    }

    if (!code.toLowerCase().includes('animate-') && !code.includes('transition-')) {
      staticAudits.push({
        title: "Interactivité & Animations fluides",
        urgency: "Low",
        description: "Aucun état de transition ou de micro-animation n'a été détecté. Augmentez la valeur perçue.",
        fixPrompt: "Ajoute des effets de transition doux hover:scale-[1.02] et transition-all sur les boutons d'appel à l'action."
      });
      score -= 5;
    }

    // Default checklist items
    staticAudits.push({
      title: "Optimisation de Palette de Couleurs",
      urgency: "Low",
      description: "Améliorez le contraste général pour garantir une éligibilité optimale d'accessibilité WCAG.",
      fixPrompt: "Améliore les contrastes de couleurs du site avec une palette sombre luxueuse et accents néon orange."
    });

    setAuditList(staticAudits);
    setAuditScore(Math.max(score, 60));
  }, [code]);

  // AI-powered deep audit using Gemini
  const triggerDeepAIAudit = async () => {
    setIsAuditing(true);
    try {
      const resp = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyse le code du site ci-dessous et produis un audit technique, UX et de performance au format JSON.
          
CODE DU SITE :
${code.substring(0, 8000)}

Renvoie UNIQUEMENT un objet JSON (sans bloc markdown) de la forme exacte suivante :
{
  "score": 88,
  "items": [
    {
      "title": "Titre recommandation en français",
      "urgency": "High", 
      "description": "Explication claire en français",
      "fixPrompt": "Consigne précise à donner à l'IA pour corriger ce point"
    }
  ]
}`,
          systemInstruction: "Tu es un auditeur certifié Google AI Studio. Analyse le code HTML/CSS/JS fourni et renvoie les suggestions précises au format JSON demandé. Ne produis aucun texte explicatif en dehors du JSON.",
          responseMimeType: "application/json"
        })
      });

      if (resp.ok) {
        const resData = await resp.json();
        const parsed = JSON.parse(resData.text || '{}');
        if (parsed.items && Array.isArray(parsed.items)) {
          setAuditList(parsed.items);
          setAuditScore(parsed.score || 90);
        }
      }
    } catch (e) {
      console.error("AI Audit error, staying with static", e);
    } finally {
      setIsAuditing(false);
    }
  };

  // Trigger Groq Q&A session
  const askGroqAdvisor = async () => {
    if (!groqQuestion.trim()) return;
    setIsGroqLoading(true);
    setGroqError(null);

    const updatedHistory = [...groqHistory, { role: 'user' as const, content: groqQuestion }];
    setGroqHistory(updatedHistory);
    const savedPrompt = groqQuestion;
    setGroqQuestion('');

    try {
      const resp = await fetch('/api/ai/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-groq-key': storedGroqKey || ''
        },
        body: JSON.stringify({
          question: savedPrompt,
          code: code,
          history: updatedHistory.slice(-4)
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Erreur inconnue de Groq API");
      }

      const resData = await resp.json();
      setGroqHistory(prev => [...prev, { role: 'assistant', content: resData.text || '' }]);
    } catch (err: any) {
      setGroqError(err.message || "Impossible de joindre le serveur Groq");
      // Fallback request to Gemini to ensure 100% availability
      try {
        const fallbackResp = await fetch('/api/ai/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Tu agis comme l'expert de secours de COOK IA. L'utilisateur a posé une question sur son code mais Groq est injoignable. Réponds de façon extrêmement claire en français.\n\nCODE SOURCE:\n${code.substring(0, 4000)}\n\nQUESTION: ${savedPrompt}`
          })
        });
        if (fallbackResp.ok) {
          const fallbackData = await fallbackResp.json();
          setGroqHistory(prev => [...prev, { 
            role: 'assistant', 
            content: `💡 [Note: Groq API n'est pas ou mal configurée. Réponses de Secours de Cook IA] :\n\n${fallbackData.text}` 
          }]);
          setGroqError(null);
        }
      } catch (geminiErr) {
        console.error("Failure of both services", geminiErr);
      }
    } finally {
      setIsGroqLoading(false);
    }
  };

  // Image upload and processing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Quick select Unsplash keywords and generate code snippets
  const generateUnsplashAsset = (kw: string) => {
    const encoded = encodeURIComponent(kw);
    const randomSeed = Math.floor(Math.random() * 1000);
    const url = `https://images.unsplash.com/photo-${randomSeed === 0 ? '1504868584819-f8e8b4b6d7e3' : '1551288049-bebda4e38f71'}?auto=format&fit=crop&w=1200&q=80&sig=${randomSeed}&q=unsplash_${encoded}`;
    setUploadedImage(url);
  };

  // Compile image filter & responsive styles into a polished copyable HTML element
  useEffect(() => {
    if (!uploadedImage) {
      setTransformedCode("");
      return;
    }

    let borderClasses = "rounded-2xl";
    let aspectClasses = "aspect-video w-full h-[320px]";
    let filterOverlay = "";

    if (aspectRatio === 'avatar') {
      borderClasses = "rounded-full border-4 border-orange-500/20";
      aspectClasses = "w-24 h-24 sm:w-32 sm:h-32 object-cover";
    } else if (aspectRatio === 'card') {
      borderClasses = "rounded-xl border border-white/10 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]";
      aspectClasses = "w-full h-[220px] object-cover";
    } else if (aspectRatio === 'wide') {
      borderClasses = "rounded-3xl border border-white/5 opacity-90";
      aspectClasses = "w-full h-[350px] object-cover";
    }

    if (imageFilter === 'neon') {
       filterOverlay = `<div class="absolute inset-0 bg-gradient-to-t from-fuchsia-500/20 via-transparent to-cyan-500/10 pointer-events-none mix-blend-color-hue"></div>`;
    } else if (imageFilter === 'glass') {
       filterOverlay = `<div class="absolute inset-0 backdrop-blur-[2px] bg-white/[0.02] border-t border-l border-white/10 pointer-events-none"></div>`;
    } else if (imageFilter === 'amber') {
       filterOverlay = `<div class="absolute inset-0 bg-orange-primary/15 mix-blend-color pointer-events-none"></div>`;
    } else if (imageFilter === 'night') {
       filterOverlay = `<div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 pointer-events-none"></div>`;
    }

    const codeSnippet = `<div class="relative overflow-hidden inline-block ${borderClasses} group">
  <img 
    src="${uploadedImage.startsWith('data:') ? '/* Base64 Asset */ ' + uploadedImage.substring(0, 40) + '...' : uploadedImage}" 
    alt="Asset Transformé Cook IA" 
    class="${aspectClasses} transition-transform duration-500 hover:scale-105" 
    referrerpolicy="no-referrer"
  />
  ${filterOverlay}
</div>`;

    setTransformedCode(codeSnippet);
  }, [uploadedImage, aspectRatio, imageFilter]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transformedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`w-full md:w-[420px] h-full ${isDark ? 'bg-[#0E0E0E] text-white border-l border-white/5' : 'bg-white text-slate-900 border-l border-slate-200'} flex flex-col z-[80] shadow-2xl`}>
      {/* Drawer Header */}
      <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-orange-primary animate-pulse" />
          <span className="font-display font-black text-xs uppercase tracking-widest">Forge Developer Studio</span>
        </div>
        <button 
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-white/60' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs list (Styled precisely like Google AI Studio settings controls) */}
      <div className={`p-2.5 grid grid-cols-3 gap-1 grid-shrink-0 border-b ${isDark ? 'bg-[#060606] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
        {[
          { id: 'suggestions', label: 'Suggestions', icon: <Sparkle size={13} /> },
          { id: 'groq', label: 'Groq Advisor', icon: <Cpu size={13} /> },
          { id: 'image-transformer', label: 'Visuels', icon: <ImageIcon size={13} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id 
                ? 'bg-orange-primary/10 text-orange-primary border border-orange-primary/20 shadow-md font-black' 
                : isDark ? 'text-white/40 hover:text-white/80' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        
        {/* TAB 1: SUGGESTIONS ENGINE (GOOGLE AI STUDIO STYLE) */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {/* Health indicators block */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-150'} relative overflow-hidden`}>
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">Score de qualité AI Studio</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-mono text-orange-primary">{auditScore}</span>
                <span className="text-xs text-zinc-500 uppercase">/100</span>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500">
                  <ShieldCheck size={12} />
                  <span>Analyse dynamique active</span>
                </div>
                
                <button
                  onClick={triggerDeepAIAudit}
                  disabled={isAuditing}
                  className="px-2.5 py-1.5 bg-orange-primary text-white hover:bg-orange-600 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isAuditing ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                  <span>Audit Profond</span>
                </button>
              </div>
            </div>

            {/* Suggestions Checklist */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black block mb-2">Améliorations à appliquer</span>
              {auditList.map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    item.urgency === 'High' 
                      ? (isDark ? 'bg-red-500/5 border-red-500/15' : 'bg-red-50 border-red-100')
                      : item.urgency === 'Medium'
                      ? (isDark ? 'bg-amber-500/5 border-amber-500/15' : 'bg-amber-50 border-amber-100')
                      : (isDark ? 'bg-blue-500/5 border-blue-500/15' : 'bg-blue-50 border-blue-100')
                  } space-y-2 transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-tight">{item.title}</span>
                    <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      item.urgency === 'High' ? 'bg-red-500/20 text-red-500' : item.urgency === 'Medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {item.urgency}
                    </span>
                  </div>
                  
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-600'} leading-relaxed`}>{item.description}</p>
                  
                  <button
                    onClick={() => onApplyPrompt(item.fixPrompt)}
                    className="w-full py-2 bg-black/40 hover:bg-black/60 text-white hover:text-orange-primary rounded-lg text-[9px] font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border border-white/5 shadow-inner"
                  >
                    <span>Lancer la refactorisation</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GROQ ADVISOR & TROUBLESHOOTER */}
        {activeTab === 'groq' && (
          <div className="space-y-4">
            {/* Config & Key setup */}
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-150'} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">Moteur de Diagnostic Groq</span>
                <button 
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-[9px] font-mono font-bold text-orange-primary hover:underline flex items-center gap-1"
                >
                  <Key size={10} />
                  <span>{storedGroqKey ? 'Modifier Clé' : 'Saisir Clé'}</span>
                </button>
              </div>
              <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-slate-500'} leading-relaxed`}>
                Alimenté par <span className="font-bold text-white">Llama 3.3 70B (Groq Connected)</span> pour corriger immédiatement les crashs, les bugs de styles, et formuler des idées de design.
              </p>

              <AnimatePresence>
                {showKeyInput && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pt-2 space-y-2 overflow-hidden"
                  >
                    <input 
                      type="password"
                      placeholder="Saisir votre Clé API Groq..."
                      defaultValue={storedGroqKey}
                      onBlur={(e) => handleSaveGroqKey(e.target.value)}
                      className="w-full p-2 bg-black text-xs font-mono rounded border border-white/10 text-white focus:outline-none focus:border-orange-primary"
                    />
                    <p className="text-[8px] text-zinc-500 leading-snug">Votre clé est enregistrée uniquement dans votre navigateur (localStorage) et transite de façon sécurisée par le proxy.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat History */}
            <div className="space-y-3 min-h-[160px]">
              {groqHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-2">
                  <Cpu size={24} className="opacity-30" />
                  <p className="text-xs">Posez une question technique ou signalez un bug.</p>
                </div>
              ) : (
                groqHistory.map((item, i) => (
                  <div 
                    key={i}
                    className={`p-3.5 rounded-xl border ${
                      item.role === 'user' 
                        ? (isDark ? 'bg-white/5 border-white/5 ml-8 text-right' : 'bg-slate-50 border-slate-150 ml-8 text-right')
                        : (isDark ? 'bg-orange-primary/5 border-orange-primary/10 mr-8 text-left' : 'bg-orange-50/50 border-orange-100 mr-8 text-left')
                    } text-xs space-y-1.5`}
                  >
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
                      {item.role === 'user' ? 'Vous' : 'Expert Llama-Groq'}
                    </span>
                    <p className={`leading-relaxed whitespace-pre-wrap ${isDark ? 'text-white/90' : 'text-slate-800'}`}>{item.content}</p>
                    {item.role === 'assistant' && (
                      <button 
                        onClick={() => {
                          const codeMatch = item.content.match(/```(?:html|css|javascript|jsx)?\s*([\s\S]*?)```/);
                          if (codeMatch && codeMatch[1]) {
                            navigator.clipboard.writeText(codeMatch[1].trim());
                          } else {
                            navigator.clipboard.writeText(item.content);
                          }
                        }}
                        className="text-[9px] font-mono text-orange-primary flex items-center gap-1 hover:underline"
                      >
                        <Copy size={9} />
                        <span>Copier le Code de Correctif</span>
                      </button>
                    )}
                  </div>
                ))
              )}

              {isGroqLoading && (
                <div className="flex items-center gap-2 p-3 text-xs italic text-zinc-400">
                  <Loader2 size={12} className="animate-spin text-orange-primary" />
                  <span>Groq connecte les synapses du serveur...</span>
                </div>
              )}

              {groqError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{groqError}</span>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "Pourquoi le menu bug ?",
                "Donne moi des idées folles",
                "Centrer le bouton Hero",
                "Fais des boutons fluorescents"
              ].map(q => (
                <button 
                  key={q}
                  onClick={() => {
                    setGroqQuestion(q);
                  }}
                  className="text-left p-2 border border-white/5 bg-white/[0.01] hover:bg-white/5 rounded-lg text-[9px] text-zinc-400 hover:text-white transition-all truncate"
                >
                  ⚡ {q}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex : Comment centrer verticalement mon hero..."
                value={groqQuestion}
                onChange={(e) => setGroqQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askGroqAdvisor()}
                className="flex-1 p-3 bg-black/60 text-xs rounded-xl border border-white/10 hover:border-white/20 focus:border-orange-primary text-white placeholder-zinc-600 focus:outline-none transition-all font-sans"
              />
              <button
                onClick={askGroqAdvisor}
                disabled={isGroqLoading || !groqQuestion.trim()}
                className="p-3 bg-orange-primary hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SMART IMAGE TRANSFORMER ("TRANSFORME POUR QU'IL SOIT ÉLIGIBLE") */}
        {activeTab === 'image-transformer' && (
          <div className="space-y-4">
            
            {/* Image Importer area */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black block">1. Importer ou Générer un Support Visuel</span>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Manual Upload */}
                <label className={`cursor-pointer p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-white/10 hover:border-orange-primary/30 hover:bg-white/[0.01]' : 'border-slate-200 hover:border-orange-500/20 hover:bg-slate-50'} transition-all flex flex-col items-center justify-center text-center space-y-1`}>
                  <ImagePlus size={18} className="text-orange-primary pointer-events-none" />
                  <span className="text-[10px] font-black uppercase tracking-wider pointer-events-none">Importer Fichier (JPEG, PNG)</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>

                {/* Intelligent generator */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#060606] border-white/5' : 'bg-slate-50 border-slate-150'} flex flex-col justify-between`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Search size={10} className="text-zinc-500" />
                    <span className="text-[9px] font-mono uppercase text-zinc-500">Unsplash Mock</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: SaaS mobile Dashboard..."
                    value={unsplashKeyword}
                    onChange={(e) => setUnsplashKeyword(e.target.value)}
                    className="w-full p-1 bg-black/60 text-[10px] rounded border border-white/5 text-white focus:outline-none mb-1.5 focus:border-orange-primary"
                  />
                  <button 
                    onClick={() => generateUnsplashAsset(unsplashKeyword || "technology background shadow")}
                    className="w-full py-1 bg-orange-primary text-white text-[9px] font-black uppercase tracking-widest rounded-md"
                  >
                    Générer
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Presets for Unsplash */}
            <div className="flex flex-wrap gap-1">
              {["Dashboard", "Restaurant Plat", "Boutique Mode", "Architecte 3D", "Équipe Tech", "Avatar Pro"].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setUnsplashKeyword(preset);
                    generateUnsplashAsset(preset);
                  }}
                  className="px-2 py-1 bg-white/[0.02] border border-white/5 hover:border-orange-primary/20 text-[9px] rounded text-zinc-400 hover:text-white"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Preview of visual and configuration tools */}
            {uploadedImage ? (
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black block">2. Configurer & Rendre éligible au code</span>
                
                {/* Visual rendering preview */}
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/80 border-white/5' : 'bg-slate-100 border-slate-200'} flex items-center justify-center relative overflow-hidden h-[180px]`}>
                  <div className="relative">
                    <img 
                      src={uploadedImage} 
                      alt="Aperçu Éligibilité" 
                      className={`object-cover transition-all ${
                        aspectRatio === 'avatar' ? 'w-20 h-20 rounded-full' : aspectRatio === 'card' ? 'w-36 h-24 rounded-lg' : 'w-48 h-20 rounded-xl'
                      } ${
                        imageFilter === 'neon' ? 'hue-rotate-30 saturate-150 contrast-125' : imageFilter === 'glass' ? 'opacity-85 filter contrast-75 brightness-110' : imageFilter === 'amber' ? 'sepia hue-rotate-15 saturate-200 brightness-95' : imageFilter === 'night' ? 'brightness-50 saturate-100' : ''
                      }`}
                    />
                    {imageFilter !== 'none' && (
                      <div className={`absolute inset-0 pointer-events-none rounded-lg ${
                        imageFilter === 'neon' ? 'bg-cyan-500/10 shadow-[inner_0_0_15px_#00f5d4]' : imageFilter === 'glass' ? 'backdrop-blur-[2px] bg-white/[0.02]' : imageFilter === 'amber' ? 'bg-orange-primary/20' : 'bg-slate-950/40'
                      }`} />
                    )}
                  </div>
                  <span className="absolute bottom-2 right-2 text-[8px] font-mono uppercase px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/20">Optimisé & Éligible ✅</span>
                </div>

                {/* Sizing aspect-ratios controls */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase text-zinc-500">Gabarit d'intégration CSS :</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'avatar', label: 'Pro Avatar (1:1)' },
                      { id: 'card', label: 'Bento Card (4:3)' },
                      { id: 'wide', label: 'Section Banner (16:9)' }
                    ].map(aspect => (
                      <button
                        key={aspect.id}
                        onClick={() => setAspectRatio(aspect.id as any)}
                        className={`py-1.5 rounded text-[9px] font-bold ${
                          aspectRatio === aspect.id 
                            ? 'bg-orange-primary text-white' 
                            : 'bg-white/[0.02] border border-white/5 text-zinc-400'
                        }`}
                      >
                        {aspect.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters controls */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase text-zinc-500">Ambiance Couleur / Filtre :</span>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { id: 'none', label: 'Naturel' },
                      { id: 'neon', label: 'Cyber' },
                      { id: 'glass', label: 'Glass' },
                      { id: 'amber', label: 'Amber' },
                      { id: 'night', label: 'Midnight' }
                    ].map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setImageFilter(filter.id as any)}
                        className={`py-1 rounded text-[8px] font-mono uppercase ${
                          imageFilter === filter.id 
                            ? 'bg-orange-primary/20 text-orange-primary border border-orange-primary/20' 
                            : 'bg-white/[0.01] text-zinc-400'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code snippets output */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-zinc-500">Snippets de Code HTML/Tailwind Prêt à utiliser :</span>
                    <button 
                      onClick={copyToClipboard}
                      className="text-[9px] font-mono font-bold text-orange-primary flex items-center gap-1 hover:underline"
                    >
                      {isCopied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      <span>{isCopied ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                  
                  <textarea 
                    readOnly 
                    value={transformedCode}
                    className="w-full h-24 p-2.5 bg-black/80 font-mono text-[9px] text-zinc-400 rounded-lg border border-white/5 resize-none pointer-events-all"
                  />

                  {/* Ask IA to embed directly button */}
                  <button
                    onClick={() => {
                      onApplyPrompt(`Chef Cook IA, ajoute l'image de section suivante dans le code : \n\n${transformedCode}`);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-display font-black text-[10px] uppercase tracking-widest rounded-md"
                  >
                    <span>Insérer automatiquement avec Cook IA ✨</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-xl text-center text-zinc-500">
                <ImageIcon size={32} className="opacity-20 mb-3" />
                <p className="text-xs">Choisissez un preset ci-dessus ou importez un fichier pour créer une ressource éligible.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
