import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, Layout, Sparkles, X, Layers, Sliders, 
  Monitor, Tablet, Smartphone, Plus, Trash2, Check, ArrowRight,
  RefreshCw, Wand2, Zap, MoveUp, MoveDown, Eye, SlidersHorizontal,
  ChevronRight, ZoomIn, ZoomOut, Maximize2, Type, Paintbrush, Box, Star, Code2, ArrowUpRight
} from 'lucide-react';

interface DesignCanvasStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateWebsite: (designPrompt: string, styleSpecs: DesignSpecs) => void;
  isDark?: boolean;
}

export interface DesignSpecs {
  title: string;
  subject: string;
  theme: 'dark' | 'light' | 'luxury' | 'cyber';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
  displayFont: string;
  bodyFont: string;
  borderRadius: string;
  signatureElement: string;
  signature?: string;
  sections: Array<{
    id: string;
    type: 'hero' | 'features' | 'signature' | 'stats' | 'gallery' | 'testimonials' | 'pricing' | 'faq' | 'cta' | 'footer';
    title: string;
    description: string;
    layoutType: 'grid' | 'asymmetric' | 'centered' | 'side-by-side' | 'cards';
  }>;
}

const PRESET_STUDIO_PALETTES = [
  {
    name: "Linear Studio Dark",
    theme: "dark" as const,
    bg: "#08090A",
    surface: "#121316",
    primary: "#5E6AD2",
    accent: "#707EED",
    text: "#F7F8F8",
    displayFont: "Syne",
    bodyFont: "Inter",
    borderRadius: "12px",
    signature: "Terminal interactif avec logs de compilation en direct et switchers de thèmes"
  },
  {
    name: "Éditorial Écru & Noir",
    theme: "light" as const,
    bg: "#FAF8F5",
    surface: "#FFFFFF",
    primary: "#1A1A1A",
    accent: "#C25E00",
    text: "#222222",
    displayFont: "Playfair Display",
    bodyFont: "Plus Jakarta Sans",
    borderRadius: "6px",
    signature: "Galerie photo pleine page avec loupe au survol et sélecteur de variantes"
  },
  {
    name: "Cyber Emerald Fintech",
    theme: "cyber" as const,
    bg: "#020813",
    surface: "#0A1120",
    primary: "#10B981",
    accent: "#06B6D4",
    text: "#F3F4F6",
    displayFont: "Space Grotesk",
    bodyFont: "Inter",
    borderRadius: "14px",
    signature: "Widget de télémétrie financière avec Recharts et convertisseur dynamique"
  },
  {
    name: "Awwwards Dark Luxury",
    theme: "luxury" as const,
    bg: "#0D0D11",
    surface: "#17171F",
    primary: "#EAB308",
    accent: "#F97316",
    text: "#FFFFFF",
    displayFont: "Cinzel",
    bodyFont: "Plus Jakarta Sans",
    borderRadius: "20px",
    signature: "Carte 3D glassmorphic interactive avec reflet néon et calculatrice en direct"
  }
];

const SIGNATURE_PRESETS = [
  "Carte 3D glassmorphic interactive avec reflet néon et calculatrice en direct",
  "Widget de télémétrie boursière avec Recharts et convertisseur de devises",
  "Galerie photo éditoriale avec zoom loupe et sélecteur de collections",
  "Générateur de prompt IA interactif avec prévisualisation immédiate",
  "Calculateur de bilan personnalisé avec sliders dynamiques et graphiques",
  "Lecteur audio & synthétiseur de fréquences avec animations de vagues"
];

export const DesignCanvasStudio: React.FC<DesignCanvasStudioProps> = ({
  isOpen,
  onClose,
  onGenerateWebsite,
  isDark = true
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mobileMode, setMobileMode] = useState<'editor' | 'canvas'>('editor');
  const [activeTab, setActiveTab] = useState<'preset' | 'tokens' | 'sections' | 'signature'>('preset');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>('hero');

  // Canvas Specs State
  const [specs, setSpecs] = useState<DesignSpecs>({
    title: "Aura Studio AI",
    subject: "Plateforme Créative de Web Design & Génération d'Interfaces",
    theme: "dark",
    primaryColor: "#5E6AD2",
    secondaryColor: "#707EED",
    backgroundColor: "#08090A",
    surfaceColor: "#121316",
    textColor: "#F7F8F8",
    accentColor: "#38BDF8",
    displayFont: "Syne",
    bodyFont: "Inter",
    borderRadius: "12px",
    signatureElement: "Carte 3D glassmorphic interactive avec reflet néon et calculatrice en direct",
    signature: "Carte 3D glassmorphic interactive avec reflet néon et calculatrice en direct",
    sections: [
      {
        id: "hero",
        type: "hero",
        title: "Le Web Design Repensé par l'Intelligence Artificielle",
        description: "Façonnez des interfaces d'exception grâce à un contrôle total sur les couleurs, la typographie et l'interactivité.",
        layoutType: "asymmetric"
      },
      {
        id: "signature",
        type: "signature",
        title: "Module Inédit & Expérience Interactive",
        description: "Composant exclusif conçu sur mesure pour votre univers visuel.",
        layoutType: "cards"
      },
      {
        id: "features",
        type: "features",
        title: "Architecture & Fonctionnalités",
        description: "Conçu pour offrir une rapidité fulgurante, une précision typographique et une réactivité totale.",
        layoutType: "grid"
      },
      {
        id: "stats",
        type: "stats",
        title: "Indicateurs de Performance",
        description: "Mesures précises et métriques en temps réel.",
        layoutType: "side-by-side"
      },
      {
        id: "testimonials",
        type: "testimonials",
        title: "Témoignages & Critiques",
        description: "Retour d'expérience des créatifs et directeurs artistiques.",
        layoutType: "cards"
      },
      {
        id: "cta",
        type: "cta",
        title: "Prêt à Donner Vie à Votre Vision ?",
        description: "Transmettez ce Canva à Cook IA pour générer le code complet instantanément.",
        layoutType: "centered"
      }
    ]
  });

  // Adjust canvas zoom automatically when device view changes
  useEffect(() => {
    if (deviceView === 'mobile') setZoomLevel(90);
    else if (deviceView === 'tablet') setZoomLevel(95);
    else setZoomLevel(100);
  }, [deviceView]);

  if (!isOpen) return null;

  // AI Generation from Prompt
  const handleAIGenerateDesign = () => {
    if (!prompt.trim()) return;
    setIsGeneratingCanvas(true);

    setTimeout(() => {
      const lower = prompt.toLowerCase();
      let newTheme: 'dark' | 'light' | 'luxury' | 'cyber' = 'dark';
      let newBg = "#08090A";
      let newSurface = "#121316";
      let newPrimary = "#FF6B00";
      let newAccent = "#38BDF8";
      let newText = "#F7F8F8";
      let newFont = "Syne";
      let newSignature = "Module d'interaction sur mesure avec filtres dynamiques et réactivité tactile";

      if (lower.includes('luxe') || lower.includes('chic') || lower.includes('mode') || lower.includes('ecru') || lower.includes('minimal')) {
        newTheme = 'light';
        newBg = "#FAF8F5";
        newSurface = "#FFFFFF";
        newPrimary = "#1A1A1A";
        newAccent = "#C25E00";
        newText = "#222222";
        newFont = "Playfair Display";
        newSignature = "Galerie photo éditoriale avec zoom loupe et sélecteur de collections";
      } else if (lower.includes('cyber') || lower.includes('crypto') || lower.includes('fintech') || lower.includes('neon')) {
        newTheme = 'cyber';
        newBg = "#020813";
        newSurface = "#0A1120";
        newPrimary = "#10B981";
        newAccent = "#06B6D4";
        newText = "#F3F4F6";
        newFont = "Space Grotesk";
        newSignature = "Widget de télémétrie financière avec Recharts et convertisseur dynamique";
      } else if (lower.includes('sante') || lower.includes('bio') || lower.includes('nature') || lower.includes('green')) {
        newTheme = 'light';
        newBg = "#F0FDF4";
        newSurface = "#FFFFFF";
        newPrimary = "#059669";
        newAccent = "#0D9488";
        newText = "#064E3B";
        newFont = "Plus Jakarta Sans";
        newSignature = "Calculateur de bilan santé interactif avec sliders dynamiques et graphiques";
      }

      setSpecs(prev => ({
        ...prev,
        title: prompt.slice(0, 35) + "...",
        subject: prompt,
        theme: newTheme,
        backgroundColor: newBg,
        surfaceColor: newSurface,
        primaryColor: newPrimary,
        accentColor: newAccent,
        textColor: newText,
        displayFont: newFont,
        signatureElement: newSignature,
        signature: newSignature
      }));

      setIsGeneratingCanvas(false);
    }, 700);
  };

  const handleApplyPreset = (preset: typeof PRESET_STUDIO_PALETTES[0]) => {
    setSpecs(prev => ({
      ...prev,
      theme: preset.theme,
      backgroundColor: preset.bg,
      surfaceColor: preset.surface,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      textColor: preset.text,
      displayFont: preset.displayFont,
      bodyFont: preset.bodyFont,
      borderRadius: preset.borderRadius,
      signatureElement: preset.signature,
      signature: preset.signature
    }));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newSections = [...specs.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setSpecs(prev => ({ ...prev, sections: newSections }));
  };

  const handleToggleBlock = (blockId: string) => {
    setSpecs(prev => {
      const exists = prev.sections.some(s => s.id === blockId);
      if (exists) {
        if (prev.sections.length <= 1) return prev; // Keep at least one section
        return { ...prev, sections: prev.sections.filter(s => s.id !== blockId) };
      }
      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            id: blockId,
            type: blockId as any,
            title: `Section ${blockId.toUpperCase()}`,
            description: "Structure et contenu personnalisé pour ce bloc de design.",
            layoutType: "grid"
          }
        ]
      };
    });
  };

  const handleSendToCookIA = () => {
    const promptPayload = `GENERE UN SITE WEB D'ARTISTE SUR MESURE BASE SUR CE CANVA DESIGN STUDIO :

🎯 BRIEF & SUJET : ${specs.subject}
📌 TITRE PRINCIPAL : ${specs.title}

🎨 PALETTE DE COULEURS OBLIGATOIRE (HEX) :
- Arrière-plan principal : ${specs.backgroundColor}
- Surfaces / Cartes : ${specs.surfaceColor}
- Couleur Primaire (CTA) : ${specs.primaryColor}
- Accent Lumineux : ${specs.accentColor}
- Texte : ${specs.textColor}

✍️ TYPOGRAPHIE & STYLE :
- Police Display : ${specs.displayFont} (Titres)
- Police Corps : ${specs.bodyFont} (Paragraphes)
- Arrondi des bordures : ${specs.borderRadius}
- Ambiance : ${specs.theme.toUpperCase()}

⚡ ÉLÉMENT SIGNATURE UNIQUE (À CODER EN 100% FONCTIONNEL) :
${specs.signature || specs.signatureElement}

📐 SÉQUENCE DES BLOCS DU CANVA :
${specs.sections.map((sec, idx) => `  ${idx + 1}. [${sec.type.toUpperCase()}] ${sec.title} -> ${sec.description} (Layout: ${sec.layoutType})`).join('\n')}

INSTRUCTIONS STRICTES :
1. Ne génère AUCUN placeholder ni emoji dans les titres.
2. Assure-toi que toutes les interactions, modales, filtres et cartes sont 100% fonctionnelles en JS.
3. Rédige un contenu captivant, réaliste et directement ancré dans l'univers du sujet.`;

    onGenerateWebsite(promptPayload, specs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#08090A] text-white font-sans overflow-hidden animate-in fade-in duration-200 select-none">
      
      {/* TOP STUDIO NAVIGATION BAR */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 border-b border-white/10 bg-[#0F1015]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        
        {/* BRAND & ICON */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20">
            <Palette size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-sm sm:text-base tracking-tight font-display">Canva Design Studio</h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                COOK IA CONNECTED
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">Composez votre univers visuel et transmettez-le à Cook IA</p>
          </div>
        </div>

        {/* DEVICE FRAME SWITCHER (DESKTOP/TABLET/MOBILE) */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setDeviceView('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              deviceView === 'desktop' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor size={14} /> Desktop
          </button>
          <button
            onClick={() => setDeviceView('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              deviceView === 'tablet' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet size={14} /> Tablette
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              deviceView === 'mobile' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} /> Mobile
          </button>
        </div>

        {/* MOBILE MODE TOGGLE (Éditeur vs Aperçu Canvas) */}
        <div className="flex md:hidden items-center bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setMobileMode('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileMode === 'editor' ? 'bg-orange-500 text-white' : 'text-slate-400'
            }`}
          >
            Éditeur
          </button>
          <button
            onClick={() => setMobileMode('canvas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobileMode === 'canvas' ? 'bg-orange-500 text-white' : 'text-slate-400'
            }`}
          >
            Aperçu Canvas
          </button>
        </div>

        {/* GENERATE ACTION BUTTON */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSendToCookIA}
            className="flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Zap size={15} className="fill-white" />
            <span className="hidden sm:inline">Connecter & Générer avec Cook IA</span>
            <span className="sm:hidden">Générer</span>
            <ArrowUpRight size={15} />
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* PROMPT GENERATOR INPUT BAR */}
      <div className="px-4 sm:px-6 py-2.5 bg-[#0C0D12] border-b border-white/10 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative w-full flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Wand2 size={15} />
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAIGenerateDesign()}
            placeholder="Générez un style en 1 clic (ex: Studio créatif de photographie écru luxe minimaliste)..."
            className="w-full pl-10 pr-28 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/80 transition-all"
          />
          <button
            onClick={handleAIGenerateDesign}
            disabled={isGeneratingCanvas || !prompt.trim()}
            className="absolute right-1 top-1 bottom-1 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            {isGeneratingCanvas ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            <span className="hidden sm:inline">Générer Style</span>
          </button>
        </div>

        {/* QUICK PRESET BADGES */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">Thèmes Studio :</span>
          {PRESET_STUDIO_PALETTES.map((p, i) => (
            <button
              key={i}
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.primary }} />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT CONTROL PANEL (Desktop or Mobile Editor Mode) */}
        <div className={`w-full md:w-88 bg-[#0D0E13] border-r border-white/10 flex flex-col shrink-0 z-10 transition-all ${
          mobileMode === 'editor' ? 'flex' : 'hidden md:flex'
        }`}>
          
          {/* CONTROL TABS */}
          <div className="flex border-b border-white/10 p-1.5 gap-1 bg-black/40">
            <button
              onClick={() => setActiveTab('preset')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'preset' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Paintbrush size={13} /> Thèmes
            </button>
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'tokens' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders size={13} /> Couleurs
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'sections' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={13} /> Structure
            </button>
            <button
              onClick={() => setActiveTab('signature')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'signature' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star size={13} /> Signature
            </button>
          </div>

          {/* TAB CONTENT PANEL */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            
            {/* TAB 1: PRESET THEMES */}
            {activeTab === 'preset' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">Nom du Projet</label>
                  <input
                    type="text"
                    value={specs.title}
                    onChange={(e) => setSpecs(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">Metier / Sujet Précis</label>
                  <textarea
                    rows={2}
                    value={specs.subject}
                    onChange={(e) => setSpecs(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:border-orange-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">Palettes Studio prédéfinies</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {PRESET_STUDIO_PALETTES.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyPreset(p)}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                          specs.primaryColor === p.primary && specs.backgroundColor === p.bg
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-white/10 bg-black/40 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">{p.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                            {p.displayFont}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md border border-white/20 shadow-sm" style={{ backgroundColor: p.bg }} title="Fond" />
                          <span className="w-5 h-5 rounded-md border border-white/20 shadow-sm" style={{ backgroundColor: p.surface }} title="Surface" />
                          <span className="w-5 h-5 rounded-md border border-white/20 shadow-sm" style={{ backgroundColor: p.primary }} title="Primaire" />
                          <span className="w-5 h-5 rounded-md border border-white/20 shadow-sm" style={{ backgroundColor: p.accent }} title="Accent" />
                          <span className="w-5 h-5 rounded-md border border-white/20 shadow-sm" style={{ backgroundColor: p.text }} title="Texte" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COLOR TOKENS & TYPOGRAPHY */}
            {activeTab === 'tokens' && (
              <div className="space-y-4">
                <label className="block text-[11px] font-mono uppercase text-slate-400">Tokens de Couleurs (HEX)</label>

                <div className="space-y-2">
                  {[
                    { label: 'Fond Principal', key: 'backgroundColor' },
                    { label: 'Cartes & Surfaces', key: 'surfaceColor' },
                    { label: 'Boutons / Primaire', key: 'primaryColor' },
                    { label: 'Accent Néon / Détail', key: 'accentColor' },
                    { label: 'Texte Principal', key: 'textColor' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/10">
                      <span className="text-xs text-slate-300">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(specs as any)[item.key]}
                          onChange={(e) => setSpecs(prev => ({ ...prev, [item.key]: e.target.value }))}
                          className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span className="text-xs font-mono text-slate-400">{ (specs as any)[item.key] }</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <label className="block text-[11px] font-mono uppercase text-slate-400">Typographies Studio</label>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Police Titres (Display)</span>
                    <select
                      value={specs.displayFont}
                      onChange={(e) => setSpecs(prev => ({ ...prev, displayFont: e.target.value }))}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Syne">Syne (Moderne & Studio)</option>
                      <option value="Playfair Display">Playfair Display (Luxe & Éditorial)</option>
                      <option value="Space Grotesk">Space Grotesk (Tech & Cyber)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (SaaS Clean)</option>
                      <option value="Cinzel">Cinzel (Élégant & Épique)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Arrondi des Bordures</span>
                    <div className="grid grid-cols-3 gap-2">
                      {['4px', '12px', '20px'].map(r => (
                        <button
                          key={r}
                          onClick={() => setSpecs(prev => ({ ...prev, borderRadius: r }))}
                          className={`py-1.5 text-xs font-mono rounded-xl border transition-all ${
                            specs.borderRadius === r ? 'border-orange-500 bg-orange-500/20 text-white' : 'border-white/10 text-slate-400'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SECTIONS STRUCTURE */}
            {activeTab === 'sections' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono uppercase text-slate-400">Ordre des Blocs du Canva</label>
                  <span className="text-[10px] text-slate-500">{specs.sections.length} blocs actifs</span>
                </div>

                <div className="space-y-2">
                  {specs.sections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className={`p-3 rounded-xl border transition-all ${
                        selectedBlockId === sec.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-black/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          {idx + 1}. {sec.type}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveBlock(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                            title="Monter"
                          >
                            <MoveUp size={13} />
                          </button>
                          <button
                            onClick={() => handleMoveBlock(idx, 'down')}
                            disabled={idx === specs.sections.length - 1}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                            title="Descendre"
                          >
                            <MoveDown size={13} />
                          </button>
                          <button
                            onClick={() => handleToggleBlock(sec.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Masquer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSpecs(prev => ({
                            ...prev,
                            sections: prev.sections.map(s => s.id === sec.id ? { ...s, title: val } : s)
                          }));
                        }}
                        className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded-lg text-xs text-white mb-1"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">Ajouter d'autres blocs</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['hero', 'signature', 'features', 'stats', 'gallery', 'testimonials', 'pricing', 'faq', 'cta'].map(blockKey => {
                      const isActive = specs.sections.some(s => s.id === blockKey);
                      if (isActive) return null;
                      return (
                        <button
                          key={blockKey}
                          onClick={() => handleToggleBlock(blockKey)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1"
                        >
                          <Plus size={12} />
                          <span>+ {blockKey}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SIGNATURE ELEMENT */}
            {activeTab === 'signature' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-amber-400 mb-1.5 flex items-center gap-1">
                    <Sparkles size={13} /> Éditeur de Module Signature
                  </label>
                  <p className="text-xs text-slate-400 mb-2">
                    L'élément unique et mémorable qui donnera sa vraie personnalité au site web.
                  </p>
                  <textarea
                    rows={4}
                    value={specs.signature || specs.signatureElement}
                    onChange={(e) => setSpecs(prev => ({ ...prev, signature: e.target.value, signatureElement: e.target.value }))}
                    className="w-full p-3 bg-amber-500/5 border border-amber-500/30 rounded-xl text-xs text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">Idées Signature Prêtes à l'Emploi</label>
                  <div className="space-y-2">
                    {SIGNATURE_PRESETS.map((sig, i) => (
                      <button
                        key={i}
                        onClick={() => setSpecs(prev => ({ ...prev, signature: sig, signatureElement: sig }))}
                        className="w-full p-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-amber-500/50 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2"
                      >
                        <Zap size={14} className="text-amber-400 shrink-0" />
                        <span className="line-clamp-2">{sig}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CANVAS PREVIEW BOARD (Desktop & Mobile Canvas Mode) */}
        <div className={`flex-1 bg-[#050608] overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start custom-scrollbar ${
          mobileMode === 'canvas' ? 'flex' : 'hidden md:flex'
        }`}>
          
          {/* CANVAS STAGE CONTROLS */}
          <div className="w-full max-w-5xl mb-3 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider">Aperçu en Temps Réel du Canva</span>
            </div>

            <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-xl border border-white/10">
              <button onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))} className="hover:text-white"><ZoomOut size={13} /></button>
              <span className="font-mono text-[10px] w-10 text-center">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))} className="hover:text-white"><ZoomIn size={13} /></button>
            </div>
          </div>

          {/* CANVAS DEVICE FRAME */}
          <div
            className="transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-white/15 w-full max-w-5xl my-auto"
            style={{
              backgroundColor: specs.backgroundColor,
              color: specs.textColor,
              fontFamily: specs.bodyFont,
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center'
            }}
          >
            {/* MOCK NAVBAR */}
            <header
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{
                borderColor: `${specs.textColor}15`,
                backgroundColor: `${specs.surfaceColor}CC`
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: specs.primaryColor, color: '#FFF' }}
                >
                  C
                </div>
                <span className="font-bold text-sm tracking-tight" style={{ fontFamily: specs.displayFont }}>
                  {specs.title.slice(0, 24)}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-5 text-xs opacity-75">
                <span>Accueil</span>
                <span>Projets</span>
                <span>À Propos</span>
                <span>Contact</span>
              </div>
              <button
                className="px-4 py-1.5 text-xs font-bold text-white transition-transform hover:scale-105"
                style={{
                  backgroundColor: specs.primaryColor,
                  borderRadius: specs.borderRadius
                }}
              >
                Explorer
              </button>
            </header>

            {/* SECTIONS RENDERED IN CANVA */}
            <div className="divide-y" style={{ borderColor: `${specs.textColor}10` }}>
              {specs.sections.map((sec, idx) => (
                <div key={sec.id} className="p-8 sm:p-12 relative group">
                  
                  {/* SECTION LABEL BADGE ON HOVER */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded border border-white/20">
                    BLOC {idx + 1}: {sec.type.toUpperCase()}
                  </div>

                  {sec.type === 'hero' && (
                    <div className="text-center max-w-2xl mx-auto py-6">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border"
                        style={{
                          backgroundColor: `${specs.accentColor}15`,
                          color: specs.accentColor,
                          borderColor: `${specs.accentColor}30`
                        }}
                      >
                        <Sparkles size={12} />
                        <span>Canva Studio v2.5</span>
                      </div>

                      <h1
                        className="text-3xl sm:text-5xl font-black mb-4 leading-tight"
                        style={{ fontFamily: specs.displayFont }}
                      >
                        {sec.title}
                      </h1>

                      <p className="text-sm sm:text-base opacity-80 mb-8 leading-relaxed">
                        {sec.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          className="px-6 py-3 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
                          style={{
                            backgroundColor: specs.primaryColor,
                            borderRadius: specs.borderRadius
                          }}
                        >
                          Démarrer Maintenant
                        </button>
                        <button
                          className="px-6 py-3 text-xs font-bold border transition-all"
                          style={{
                            borderColor: `${specs.textColor}30`,
                            borderRadius: specs.borderRadius
                          }}
                        >
                          En Savoir Plus
                        </button>
                      </div>
                    </div>
                  )}

                  {sec.type === 'signature' && (
                    <div
                      className="p-6 sm:p-8 rounded-2xl border shadow-xl my-2"
                      style={{
                        backgroundColor: specs.surfaceColor,
                        borderColor: `${specs.accentColor}40`,
                        borderRadius: specs.borderRadius
                      }}
                    >
                      <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: specs.accentColor }}>
                        ✨ MODULE SIGNATURE SUR MESURE
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: specs.displayFont }}>
                        {specs.signature || specs.signatureElement}
                      </h3>
                      <p className="text-xs opacity-75">
                        Ce composant unique sera codé intégralement en JavaScript interactif par Cook IA.
                      </p>
                    </div>
                  )}

                  {sec.type === 'features' && (
                    <div className="py-4">
                      <h3 className="text-xl font-bold mb-6 text-center" style={{ fontFamily: specs.displayFont }}>
                        {sec.title}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map(item => (
                          <div
                            key={item}
                            className="p-5 rounded-xl border"
                            style={{
                              backgroundColor: specs.surfaceColor,
                              borderColor: `${specs.textColor}15`,
                              borderRadius: specs.borderRadius
                            }}
                          >
                            <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center font-bold text-xs" style={{ backgroundColor: `${specs.primaryColor}20`, color: specs.primaryColor }}>
                              0{item}
                            </div>
                            <h4 className="font-bold text-sm mb-1" style={{ fontFamily: specs.displayFont }}>Fonctionnalité {item}</h4>
                            <p className="text-xs opacity-70">Description détaillée adaptée à l'univers du sujet.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'cta' && (
                    <div className="text-center py-6">
                      <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: specs.displayFont }}>
                        {sec.title}
                      </h3>
                      <p className="text-xs opacity-70 mb-6">{sec.description}</p>
                      <button
                        onClick={handleSendToCookIA}
                        className="px-6 py-3 text-xs font-bold text-white shadow-xl transition-transform hover:scale-105 inline-flex items-center gap-2"
                        style={{
                          backgroundColor: specs.primaryColor,
                          borderRadius: specs.borderRadius
                        }}
                      >
                        <Zap size={14} className="fill-white" />
                        <span>Transmettre à Cook IA</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* MOCK FOOTER */}
            <footer
              className="p-6 text-center border-t text-xs opacity-60"
              style={{ borderColor: `${specs.textColor}15` }}
            >
              © 2026 {specs.title} • Forgé avec le Canva Studio Cook IA
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};
