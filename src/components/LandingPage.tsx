import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  Code2, 
  ArrowRight, 
  Monitor, 
  Database, 
  Lock, 
  ArrowUp, 
  Terminal,
  Activity,
  CheckCircle2,
  FileCode,
  Sliders,
  ExternalLink,
  ChevronRight,
  UserCircle,
  FileText,
  Cookie
} from 'lucide-react';
import { translations, Language } from '../translations';
import { LegalModal, LegalTabType } from './LegalModal';

interface LandingPageProps {
  onEnter: (prompt?: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

type DemoTab = 'saas' | 'ecommerce' | 'portfolio';

interface CodeSnippet {
  title: string;
  filename: string;
  prompt: string;
  code: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, lang, setLang }) => {
  const t = translations[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [activeDemo, setActiveDemo] = useState<DemoTab>('saas');
  const [displayedLineCount, setDisplayedLineCount] = useState<number>(100);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTabType>('privacy');

  const openLegal = (tab: LegalTabType) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const demoTemplates: Record<DemoTab, CodeSnippet> = useMemo(() => ({
    saas: {
      title: "Tableau de Bord Métier",
      filename: "Dashboard.tsx",
      prompt: "Un tableau de bord métier épuré pour suivre les KPIs d'une plateforme.",
      code: `import React, { useState } from 'react';
import { TrendingUp, Users, Activity } from 'lucide-react';

export default function Dashboard() {
  const [kpis] = useState({ revenue: 32450, growth: 18.4 });

  return (
    <div className="p-6 bg-[var(--color-card-light)] border border-[var(--color-border-light)] rounded-2xl text-[var(--color-ink)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-mono text-[var(--color-accent-blue)]">REVENU MENSUEL</span>
          <h2 className="text-3xl font-display font-bold mt-1">€{kpis.revenue.toLocaleString()}</h2>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono font-bold">
          +{kpis.growth}%
        </span>
      </div>
      
      {/* Sparkline Graph */}
      <div className="h-24 w-full bg-[#F9F9F8] rounded-xl p-3 border border-[var(--color-border-light)] flex items-end gap-1.5">
        {[40, 55, 35, 70, 65, 85, 95, 80, 110, 125].map((val, i) => (
          <div key={i} className="flex-1 bg-[var(--color-accent-blue)] opacity-50 hover:opacity-100 rounded-t transition-all" style={{ height: \`\${val}%\` }} />
        ))}
      </div>
    </div>
  );
}`
    },
    ecommerce: {
      title: "Boutique Minimaliste",
      filename: "Store.tsx",
      prompt: "Une vitrine e-commerce minimaliste avec gestion d'état panier local.",
      code: `import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Store() {
  const [cart, setCart] = useState(0);
  const products = [
    { name: "Chemise Oxford Édition Limitée", price: "120€" },
    { name: "Veste Moleskine", price: "240€" }
  ];

  return (
    <div className="p-6 bg-[var(--color-card-light)] border border-[var(--color-border-light)] rounded-2xl text-[var(--color-ink)]">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border-light)] pb-4">
        <h3 className="text-sm font-bold font-display">ATELIER 2026</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-xl text-xs font-bold">
          <ShoppingBag size={14} /> Panier ({cart})
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((p, i) => (
          <div key={i} className="p-4 bg-[#F9F9F8] border border-[var(--color-border-light)] rounded-xl">
            <h4 className="text-sm font-bold truncate">{p.name}</h4>
            <p className="text-[var(--color-accent-earth)] text-xs font-mono font-bold mt-1">{p.price}</p>
            <button onClick={() => setCart(c => c + 1)} className="w-full mt-3 py-2 bg-white border border-[var(--color-border-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] rounded-lg text-xs font-semibold transition-colors">
              Ajouter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`
    },
    portfolio: {
      title: "Portfolio Éditorial",
      filename: "Portfolio.tsx",
      prompt: "Un portfolio de designer avec une typographie éditoriale pointue.",
      code: `import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function Portfolio() {
  return (
    <div className="p-8 bg-[var(--color-card-light)] border border-[var(--color-border-light)] rounded-2xl text-[var(--color-ink)]">
      <div className="mb-8">
        <h3 className="text-2xl font-editorial font-bold italic">Benit Madimba</h3>
        <p className="text-[var(--color-accent-earth)] text-xs font-mono uppercase mt-2 tracking-widest">
          Ingénieur & Designer
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="group flex justify-between items-end border-b border-[var(--color-border-light)] pb-2 cursor-pointer">
          <div>
            <h4 className="font-bold text-sm">Système de Design</h4>
            <p className="text-xs text-slate-500 mt-1">Architecture Frontend</p>
          </div>
          <ExternalLink size={14} className="text-slate-400 group-hover:text-[var(--color-primary)] transition-colors mb-1" />
        </div>
        <div className="group flex justify-between items-end border-b border-[var(--color-border-light)] pb-2 cursor-pointer">
          <div>
            <h4 className="font-bold text-sm">Plateforme SaaS</h4>
            <p className="text-xs text-slate-500 mt-1">Application Complète</p>
          </div>
          <ExternalLink size={14} className="text-slate-400 group-hover:text-[var(--color-primary)] transition-colors mb-1" />
        </div>
      </div>
    </div>
  );
}`
    }
  }), []);

  // Syntax highlighting helper for code view
  const renderHighlightedLine = (line: string, index: number) => {
    let formatted = line;
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return <span key={index} className="text-slate-400 italic">{line}</span>;
    }
    const parts = line.split(/(\b(?:import|export|default|function|return|const|let|var|from|true|false)\b|'[^']*'|"[^"]*"|`[^`]*`|<\/?[A-Za-z0-9_]+|[{}()=>[\]])/g);
    return (
      <span key={index} className="leading-relaxed">
        {parts.map((part, pIdx) => {
          if (!part) return null;
          if (['import', 'export', 'default', 'function', 'return', 'const', 'let', 'var', 'from'].includes(part)) {
            return <span key={pIdx} className="text-[#8C6A5D] font-bold">{part}</span>;
          }
          if (['true', 'false', 'null', 'undefined'].includes(part)) {
            return <span key={pIdx} className="text-[#3A5F8F] font-bold">{part}</span>;
          }
          if (part.startsWith('"') || part.startsWith("'") || part.startsWith('`')) {
            return <span key={pIdx} className="text-[#297340]">{part}</span>;
          }
          if (part.startsWith('<') || part.startsWith('</')) {
            return <span key={pIdx} className="text-[#A34433] font-bold">{part}</span>;
          }
          if (['useState', 'useEffect'].includes(part)) {
            return <span key={pIdx} className="text-[#3A5F8F] font-bold">{part}</span>;
          }
          return <span key={pIdx} className="text-[var(--color-ink)]">{part}</span>;
        })}
      </span>
    );
  };

  const currentLines = useMemo(() => {
    const full = demoTemplates[activeDemo].code.split('\n');
    return full;
  }, [activeDemo, demoTemplates]);

  const starterChips = [
    { label: lang === 'fr' ? "Tableau de Bord SaaS" : "SaaS Dashboard", prompt: "Crée un tableau de bord SaaS avec graphiques." },
    { label: lang === 'fr' ? "Boutique Minimaliste" : "Minimal Store", prompt: "Crée une vitrine e-commerce minimaliste." },
    { label: lang === 'fr' ? "Portfolio Créatif" : "Creative Portfolio", prompt: "Génère un portfolio au style éditorial." }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-ink)] selection:bg-[var(--color-accent-blue)] selection:text-white font-sans antialiased overflow-x-hidden relative">
      
      {/* Background Subtle Grid */}
      <div className="fixed inset-0 pointer-events-none bg-grid-subtle opacity-60 z-0" />
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border-light)] bg-[var(--color-bg-light)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-black transition-transform duration-300">
              <Code2 size={16} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight font-display">
                Cook IA
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[var(--color-ink)] transition-colors">
              {lang === 'fr' ? "Notre Approche" : "Our Approach"}
            </button>
            <button onClick={() => document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[var(--color-ink)] transition-colors">
              {lang === 'fr' ? "Studio Code" : "Code Studio"}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-[var(--color-border-light)] rounded-lg p-0.5 shadow-sm">
              <button 
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${lang === 'fr' ? 'bg-[var(--color-surface-hover)] text-[var(--color-ink)]' : 'text-slate-500 hover:text-[var(--color-ink)]'}`}
              >
                FR
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${lang === 'en' ? 'bg-[var(--color-surface-hover)] text-[var(--color-ink)]' : 'text-slate-500 hover:text-[var(--color-ink)]'}`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => onEnter()}
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <span>{lang === 'fr' ? "Ouvrir le Studio" : "Open Studio"}</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[var(--color-border-light)] text-xs font-bold text-[var(--color-accent-earth)] mb-8 shadow-sm"
        >
          <UserCircle size={14} />
          <span>Créé par Benit Madimba</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1] font-display text-[var(--color-ink)]"
        >
          {lang === 'fr' ? (
             <>Le développement assisté par l'IA,<br/> <span className="font-editorial italic font-normal text-[var(--color-accent-blue)]">repensé pour les architectes web.</span></>
          ) : (
             <>AI-assisted development,<br/> <span className="font-editorial italic font-normal text-[var(--color-accent-blue)]">rethought for web architects.</span></>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          {lang === 'fr'
            ? "Cook IA est un environnement expérimental conçu pour assembler l'architecture front-end et back-end de vos projets React, sans cacher le code généré."
            : "Cook IA is an experimental environment designed to assemble the front-end and back-end architecture of your React projects, without hiding the generated code."}
        </motion.p>

        {/* Interactive Prompt Composer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto w-full mb-8 text-left"
        >
          <motion.div 
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative rounded-2xl bg-white border border-[var(--color-border-light)] p-3 sm:p-4 shadow-sm focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/10 transition-colors"
          >
            
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && customPrompt.trim()) {
                  e.preventDefault();
                  onEnter(customPrompt);
                }
              }}
              placeholder={lang === 'fr' ? "Décrivez l'interface ou le composant que vous souhaitez construire..." : "Describe the interface or component you want to build..."}
              className="w-full h-24 bg-transparent text-[var(--color-ink)] placeholder-slate-400 text-sm sm:text-base font-medium resize-none focus:outline-none custom-scrollbar"
            />
            
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-light)]/50 mt-2">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <span>Mode :</span>
                <span className="text-[var(--color-primary)] font-bold flex items-center gap-1">
                  Architecture 
                </span>
              </div>

              <motion.button
                whileHover={customPrompt.trim() ? { scale: 1.05 } : {}}
                whileTap={customPrompt.trim() ? { scale: 0.95 } : {}}
                onClick={() => onEnter(customPrompt)}
                disabled={!customPrompt.trim()}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 overflow-hidden ${
                  customPrompt.trim()
                    ? 'bg-[var(--color-primary)] text-white shadow-md cursor-pointer hover:bg-[var(--color-primary-hover)]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <span className="relative z-10">{lang === 'fr' ? "Lancer" : "Start"}</span>
                <ArrowUp size={14} strokeWidth={3} className="relative z-10" />
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Starter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {starterChips.map((chip, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEnter(chip.prompt)}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[var(--color-border-light)] text-xs text-slate-600 hover:text-[var(--color-ink)] hover:border-[var(--color-primary)] transition-colors duration-200 shadow-sm"
              >
                {chip.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* MANIFESTO / ABOUT SECTION */}
      <section id="manifesto" className="py-20 bg-white border-t border-b border-[var(--color-border-light)] relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-display font-bold mb-4">L'ingénierie avant l'illusion.</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                La plupart des générateurs de code actuels cachent la complexité derrière des interfaces simplistes et produisent du code jetable. Cook IA a été pensé différemment.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Ce projet est né de la volonté de construire un véritable assistant pour développeurs : un outil qui comprend l'architecture de fichiers (React, Vite, Tailwind), écrit des composants modulaires et vous donne un accès total au code source pour le modifier et l'apprendre.
              </p>
            </div>
            <div className="bg-[var(--color-bg-light)] p-6 rounded-2xl border border-[var(--color-border-light)]">
              <h3 className="text-sm font-bold font-mono text-[var(--color-accent-blue)] mb-4">STACK TECHNIQUE UTILISÉE</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                  <span><strong>React 18 & Vite</strong> - Rendu client haute performance</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                  <span><strong>Tailwind CSS</strong> - Styling utilitaire strict</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                  <span><strong>API Anthropic / Gemini</strong> - Modèles de langage avancés</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                  <span><strong>Architecture Multi-Fichiers</strong> - Séparation claire des responsabilités</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE STUDIO DEMO */}
      <section id="studio" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[var(--color-ink)] mb-4">
              {lang === 'fr' ? "Le code généré est le vôtre." : "The generated code is yours."}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {lang === 'fr' 
                ? "Pas de boîte noire. Explorez la qualité du code produit par nos agents avant même de vous lancer." 
                : "No black box. Explore the quality of the code produced by our agents before diving in."}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Left: Component Selection */}
            <div className="w-full lg:w-1/3 flex flex-col gap-3">
              {(Object.keys(demoTemplates) as DemoTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveDemo(tab)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    activeDemo === tab 
                      ? 'bg-white border-[var(--color-primary)] shadow-sm' 
                      : 'bg-[var(--color-bg-light)] border-[var(--color-border-light)] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{demoTemplates[tab].title}</span>
                    <ChevronRight size={14} className={activeDemo === tab ? 'text-[var(--color-primary)]' : 'text-slate-400'} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{demoTemplates[tab].prompt}</p>
                </button>
              ))}
            </div>

            {/* Right: Code Viewer & Preview */}
            <div className="w-full lg:w-2/3 flex flex-col sm:flex-row gap-6 bg-white border border-[var(--color-border-light)] rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
              
              {/* Fake Code Editor */}
              <div className="w-full sm:w-1/2 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border-light)] pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-slate-400" />
                    <span className="text-xs font-mono font-bold text-slate-600">{demoTemplates[activeDemo].filename}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F9F9F8] p-3 rounded-lg border border-[var(--color-border-light)]/50 text-[11px] sm:text-xs font-mono">
                  {currentLines.map((line, idx) => (
                    <div key={idx} className="flex hover:bg-black/5 px-1 py-0.5 rounded">
                      <span className="w-6 text-slate-400 select-none opacity-50 shrink-0 text-right pr-2">{idx + 1}</span>
                      <span className="whitespace-pre-wrap break-all">{renderHighlightedLine(line, idx)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fake Component Render */}
              <div className="w-full sm:w-1/2 flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-3 border-b border-[var(--color-border-light)] pb-2">
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">Rendu Interface</span>
                  </div>
                </div>
                <div className="flex-1 rounded-lg border border-[var(--color-border-light)]/50 bg-[var(--color-bg-light)] flex items-center justify-center p-4">
                   <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{
                      // Dirty trick just to render the fake HTML from the code strings
                      __html: demoTemplates[activeDemo].code
                        .replace(/import .*;/, '')
                        .replace(/export default function .*\(\) {/, '')
                        .replace(/const .* = .*;/g, '')
                        .replace(/return \(/, '')
                        .replace(/\);\n}/, '')
                        // Replace some React specific syntax to render purely for demo
                        .replace(/className=/g, 'class=')
                        .replace(/style={{[^}]+}}/g, '')
                        .replace(/\{kpis\.revenue\.toLocaleString\(\)\}/g, '32 450')
                        .replace(/\{kpis\.growth\}/g, '18.4')
                        .replace(/\{products\.map[^\)]+\)\)}/g, '<div class="p-4 bg-white border rounded-xl"><h4 class="text-sm font-bold">Produit Demo</h4><p class="text-xs font-mono mt-1">120€</p></div>')
                        .replace(/\{tab\}/g, '')
                        .replace(/onClick=\{[^\}]+\}/g, '')
                        .replace(/\{cart\}/g, '0')
                    }}
                   />
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-slate-500 text-xs font-mono border-t border-[var(--color-border-light)] relative z-10 px-4">
        <p className="leading-relaxed">© {new Date().getFullYear()} Cook IA par Benit Madimba. Tous droits réservés.</p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4">
          <button 
            onClick={() => openLegal('privacy')}
            className="hover:text-[var(--color-primary)] transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            Politique de confidentialité
          </button>
          <span className="text-slate-300 select-none">•</span>
          <button 
            onClick={() => openLegal('tos')}
            className="hover:text-[var(--color-primary)] transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            Conditions d'utilisation
          </button>
          <span className="text-slate-300 select-none">•</span>
          <button 
            onClick={() => openLegal('cookies')}
            className="hover:text-[var(--color-primary)] transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            Politique des cookies
          </button>
        </div>
      </footer>

      {/* COMPREHENSIVE LEGAL & PRIVACY MODAL */}
      <LegalModal
        isOpen={legalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setLegalModalOpen(false)}
        isDark={false}
      />
    </div>
  );
};
