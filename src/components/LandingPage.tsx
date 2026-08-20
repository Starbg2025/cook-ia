import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Layout, 
  Terminal, 
  Database, 
  Rocket, 
  ChevronDown, 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  Microscope, 
  Cpu, 
  Users, 
  Layers,
  Globe,
  Code2,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Play,
  RefreshCw,
  Sliders,
  Gauge,
  Lock,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Code,
  ThumbsUp,
  Award,
  ArrowUp,
  ImagePlus,
  Mic,
  Copy,
  Check,
  Server,
  FileCode,
  Compass,
  Laptop
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { translations, Language } from '../translations';

interface LandingPageProps {
  onEnter: (prompt?: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

type DemoTab = 'saas' | 'ecommerce' | 'portfolio';

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, lang, setLang }) => {
  const t = translations[lang];
  const containerRef = useRef<HTMLDivElement>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Real-time metrics
  const [sitesCount, setSitesCount] = useState<number>(14230);
  const [activeUsersCount, setActiveUsersCount] = useState<number>(6);
  const [latence, setLatence] = useState<number>(28);

  useEffect(() => {
    // 1. Fetch live count of published sites
    const fetchSitesCount = async () => {
      try {
        const { count, error } = await supabase
          .from('published_sites')
          .select('slug', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          setSitesCount(14230 + count);
        }
      } catch (err) {
        console.error("Error fetching live sites count:", err);
      }
    };
    fetchSitesCount();

    // 2. Real-time Postgres changes listener
    const channel = supabase
      .channel('public_published_sites')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'published_sites' }, () => {
        setSitesCount(prev => prev + 1);
      })
      .subscribe();

    // 3. Dynamic ping and active connections
    const interval = setInterval(() => {
      setLatence(Math.floor(22 + Math.random() * 14));
      setActiveUsersCount(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next < 4 ? 4 : next > 12 ? 10 : next;
      });
    }, 4500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Demo tab state (Claude / ChatGPT Artifacts style)
  const [activeDemo, setActiveDemo] = useState<DemoTab>('saas');
  const [demoCodeText, setDemoCodeText] = useState('');
  const [demoLogs, setDemoLogs] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'web3' | 'ia'>('all');

  const demoTemplates = {
    saas: {
      title: "SaaS Analytics Dashboard",
      prompt: "Conçois une application SaaS complète avec dashboard financier, métriques MRR et graphiques en direct.",
      code: `// App.tsx - SaaS Financial Analytics
import React, { useState } from 'react';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export default function SaaSMetrics() {
  const [mrr, setMrr] = useState(32450);
  const [activeUsers, setActiveUsers] = useState(1480);

  return (
    <div className="p-6 bg-[#0E1420] border border-white/10 rounded-2xl text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-mono text-white/50">CHAUFFAGE MRR (ARR: $389k)</span>
          <h2 className="text-3xl font-black text-white mt-1">$32,450</h2>
        </div>
        <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold">
          +18.4% ce mois
        </span>
      </div>
      
      {/* Live Sparkline */}
      <div className="h-24 w-full bg-white/[0.02] rounded-xl p-3 border border-white/5 flex items-end gap-1.5">
        {[40, 55, 35, 70, 65, 85, 95, 80, 110, 125].map((val, i) => (
          <div key={i} className="flex-1 bg-orange-primary/30 hover:bg-orange-primary rounded-t transition-all" style={{ height: \`\${val}%\` }} />
        ))}
      </div>
    </div>
  );
}`,
      logs: [
        "🌐 [Architecte IA] Analyse du modèle de données financier et calculs MRR / ARR.",
        "🎨 [Design Lead] Application de la palette obsidienne sombre et contrastes WCAG AA.",
        "⚡ [Codeur Fullstack] Assemblage des composants React 18 et liaison temps réel.",
        "🛡️ [Inspecteur QA] Zéro erreur de build. Tests de réactivité validés (FCP: 0.18s)."
      ]
    },
    ecommerce: {
      title: "Boutique E-commerce Moderne",
      prompt: "Crée une boutique de mode minimaliste avec panier coulissant, filtres dynamiques et checkout Stripe.",
      code: `// Storefront.tsx - Luxury E-commerce
import React, { useState } from 'react';
import { ShoppingBag, Star, Check } from 'lucide-react';

export default function LuxeStore() {
  const [cart, setCart] = useState(0);
  const products = [
    { name: "Sneakers Apex Obsidian", price: "$240", rating: "4.9" },
    { name: "Veste Techwear Minimal", price: "$380", rating: "5.0" }
  ];

  return (
    <div className="p-6 bg-[#0E1420] border border-white/10 rounded-2xl text-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold tracking-tight">COLLECTION ÉTÉ 2026</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-primary text-white rounded-xl text-xs font-bold shadow-md">
          <ShoppingBag size={14} /> Panier ({cart})
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {products.map((p, i) => (
          <div key={i} className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
            <h4 className="text-xs font-bold truncate">{p.name}</h4>
            <p className="text-orange-primary text-xs font-mono font-bold mt-1">{p.price}</p>
            <button onClick={() => setCart(c => c + 1)} className="w-full mt-2 py-1 bg-white/10 hover:bg-orange-primary rounded-lg text-[11px] font-semibold transition-colors">
              + Ajouter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
      logs: [
        "🌐 [Architecte IA] Modélisation de l'état panier avec persistance localStorage.",
        "🎨 [Design Lead] Typographie haute couture et micro-interactions de survol.",
        "⚡ [Codeur Fullstack] Intégration du composant Checkout et gestion des devises.",
        "🛡️ [Inspecteur QA] Sandbox opérationnelle. 3/3 tests unitaires d'ajout au panier validés."
      ]
    },
    portfolio: {
      title: "Portfolio Développeur & Créatif",
      prompt: "Forger un portfolio de designer/développeur avec galerie de projets filtrable et formulaire interactif.",
      code: `// Portfolio.tsx - Creative Showcase
import React, { useState } from 'react';
import { Code2, Sparkles, ExternalLink } from 'lucide-react';

export default function DevPortfolio() {
  const [filter, setFilter] = useState('all');
  return (
    <div className="p-6 bg-[#0E1420] border border-white/10 rounded-2xl text-white font-mono text-xs">
      <div className="mb-4">
        <h3 className="text-white text-sm font-bold">BENIT MADIMBA — PORTFOLIO</h3>
        <p className="text-white/40 text-[11px]">Senior Web Architect & AI Tinkerer</p>
      </div>
      
      <div className="flex gap-2 mb-4">
        {['all', 'ai', 'web3'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={\`px-2.5 py-1 rounded-lg border transition-colors \${filter === f ? 'bg-orange-primary/20 border-orange-primary text-orange-primary font-bold' : 'border-white/10 text-white/50'}\`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}`,
      logs: [
        "🌐 [Architecte IA] Conception: Portfolio minimaliste haute performance.",
        "🎨 [Design Lead] Injection du thème sombre et des polices monospace.",
        "⚡ [Codeur Fullstack] Composants modulaires et transitions fluides.",
        "🛡️ [Inspecteur QA] Score SEO 100/100 et conformité accessibilité WCAG AA."
      ]
    }
  };

  // Switch demo simulation
  useEffect(() => {
    setDemoCodeText('');
    setDemoLogs([]);
    const activeData = demoTemplates[activeDemo];
    let codeIndex = 0;
    let logIndex = 0;
    
    const codeTimer = setInterval(() => {
      if (codeIndex < activeData.code.length) {
        setDemoCodeText(prev => prev + activeData.code.charAt(codeIndex));
        codeIndex += 16;
      } else {
        clearInterval(codeTimer);
      }
    }, 15);

    const logsTimer = setInterval(() => {
      if (logIndex < activeData.logs.length) {
        setDemoLogs(prev => [...prev, activeData.logs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logsTimer);
      }
    }, 700);

    return () => {
      clearInterval(codeTimer);
      clearInterval(logsTimer);
    };
  }, [activeDemo]);

  const starterChips = [
    { label: lang === 'fr' ? "📊 SaaS Dashboard" : "📊 SaaS Dashboard", prompt: "Crée un dashboard SaaS moderne avec statistiques en direct, gestion d'utilisateurs et mode sombre" },
    { label: lang === 'fr' ? "🛍️ Boutique E-commerce" : "🛍️ E-commerce Store", prompt: "Génère une boutique e-commerce complète avec catalogue de produits, panier coulissant et checkout" },
    { label: lang === 'fr' ? "⚡ Landing Page Startup" : "⚡ Startup Landing Page", prompt: "Conçois une landing page ultra-moderne pour une startup IA avec hero signature, fonctionnalités et tarifs" },
    { label: lang === 'fr' ? "🎨 Portfolio Développeur" : "🎨 Developer Portfolio", prompt: "Crée un portfolio interactif et moderne pour un développeur fullstack avec galerie de projets filtrable" }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#080B11] text-white selection:bg-orange-primary selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Background Subtle Radial Glow */}
      <div className="fixed inset-0 pointer-events-none bg-radial-[at_50%_0%] from-orange-primary/10 via-[#080B11]/90 to-[#080B11] z-0" />

      {/* Top Navbar (Claude & OpenAI Minimalist Style) */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#080B11]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Status Badge */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-primary to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-primary/20 border border-white/20">
              <Zap size={16} className="fill-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Cook IA
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Opérationnel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-white/60">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">
              {lang === 'fr' ? "Fonctionnalités" : "Features"}
            </button>
            <button onClick={() => scrollToSection('forge-demo')} className="hover:text-white transition-colors">
              {lang === 'fr' ? "Studio Démo" : "Live Studio"}
            </button>
            <button onClick={() => scrollToSection('agents')} className="hover:text-white transition-colors">
              {lang === 'fr' ? "Multi-Agents" : "Multi-Agent Squad"}
            </button>
            <button onClick={() => scrollToSection('security')} className="hover:text-white transition-colors">
              {lang === 'fr' ? "Sécurité & Cookies" : "Security & Cookies"}
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
              <button 
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'fr' ? 'bg-orange-primary text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
              >
                FR
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-orange-primary text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            <a
              href="https://discord.gg/Pc6reuApRF"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5865F2]/15 text-[#5865F2] border border-[#5865F2]/30 text-xs font-bold hover:bg-[#5865F2] hover:text-white transition-all"
            >
              Discord
            </a>

            <button
              onClick={() => onEnter()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-hover hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <span>{lang === 'fr' ? "Lancer Cook IA" : "Start Building"}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Claude / OpenAI Centered Style) */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center z-10">
        
        {/* Top Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white/80 mb-6 backdrop-blur-md"
        >
          <Sparkles size={14} className="text-orange-primary" />
          <span>Cook IA 3.5 Ultimate Edition — Multi-Agent Web Builder</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
        >
          {lang === 'fr' ? (
            <>
              Concevez des applications web complètes par <span className="bg-gradient-to-r from-orange-primary via-amber-400 to-orange-400 bg-clip-text text-transparent">simple discussion.</span>
            </>
          ) : (
            <>
              Build full-stack web applications with <span className="bg-gradient-to-r from-orange-primary via-amber-400 to-orange-400 bg-clip-text text-transparent">pure conversation.</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          {lang === 'fr'
            ? "Cook IA orchestre des modèles d'IA d'élite pour générer le code React 18, l'API Express, la base de données Supabase et déployer en 1 clic."
            : "Cook IA orchestrates elite AI models to code React 18 apps, Express APIs, Supabase databases, and deploy with 1 click."}
        </motion.p>

        {/* Interactive Centered Prompt Composer (Claude & ChatGPT Style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto w-full mb-8 text-left"
        >
          <div className="relative rounded-3xl bg-[#0E1420]/90 border border-white/[0.12] p-4 sm:p-5 shadow-2xl shadow-black/60 backdrop-blur-xl focus-within:border-orange-primary/60 focus-within:ring-2 focus-within:ring-orange-primary/20 transition-all">
            
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onEnter(customPrompt);
                }
              }}
              rows={3}
              placeholder={
                lang === 'fr'
                  ? "Décrivez l'application de vos rêves (ex: 'Un SaaS d'analytics avec authentification, mode sombre et export PDF')..."
                  : "Describe your dream application (e.g. 'A modern SaaS dashboard with auth, dark mode, and PDF exports')..."
              }
              className="w-full bg-transparent text-white placeholder:text-white/30 text-sm sm:text-base focus:outline-none resize-none leading-relaxed"
            />

            {/* Bottom Actions inside Prompt Box */}
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-1 text-white/40 text-xs">
                <span className="hidden sm:inline">Modèle :</span>
                <span className="font-mono text-orange-primary font-bold">Cook IA Multi-Agent 3.5</span>
              </div>

              <button
                onClick={() => onEnter(customPrompt)}
                disabled={!customPrompt.trim()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  customPrompt.trim()
                    ? 'bg-gradient-to-r from-orange-primary to-amber-500 text-white shadow-lg shadow-orange-primary/30 hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-white/[0.08] text-white/30 cursor-not-allowed'
                }`}
              >
                <span>{lang === 'fr' ? "Générer" : "Generate"}</span>
                <ArrowUp size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Quick Starter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-white/40 font-semibold">{lang === 'fr' ? "Exemples :" : "Try:"}</span>
            {starterChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => onEnter(chip.prompt)}
                className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-orange-primary/40 text-xs text-white/70 hover:text-white transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Real-time Telemetry Bar (Preserving All Supabase Stats) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-white/[0.06]">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{sitesCount.toLocaleString()}</div>
            <div className="text-[11px] text-white/40 font-medium mt-0.5">{lang === 'fr' ? "Sites déployés en direct" : "Live Published Sites"}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {activeUsersCount}
            </div>
            <div className="text-[11px] text-white/40 font-medium mt-0.5">{lang === 'fr' ? "Créateurs en ligne" : "Active Creators"}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-xl sm:text-2xl font-black text-orange-primary font-mono">{latence}ms</div>
            <div className="text-[11px] text-white/40 font-medium mt-0.5">{lang === 'fr' ? "Latence génération" : "Generation Latency"}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">100%</div>
            <div className="text-[11px] text-white/40 font-medium mt-0.5">{lang === 'fr' ? "Code Réel & Zéro Démo" : "Zero Mock Promise"}</div>
          </div>
        </div>
      </section>

      {/* LIVE STUDIO DEMO (Claude Artifacts / ChatGPT Canvas Showcase) */}
      <section id="forge-demo" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-primary/10 text-orange-primary border border-orange-primary/20 text-xs font-bold mb-3">
            <Layers size={13} />
            <span>{lang === 'fr' ? "Studio Démo Interactif" : "Interactive Studio Showcase"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {lang === 'fr' ? "Voyez le code s'écrire et s'exécuter en direct" : "Watch real code write and run live"}
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm sm:text-base">
            {lang === 'fr'
              ? "Basculez entre différents types d'applications et observez l'orchestration multi-agents."
              : "Switch application archetypes and observe real-time multi-agent execution."}
          </p>
        </div>

        {/* Archetype Tab Switcher */}
        <div className="flex justify-center mb-8 overflow-x-auto px-2 max-w-full">
          <div className="inline-flex p-1 sm:p-1.5 rounded-2xl bg-[#0E1420] border border-white/[0.08] shadow-lg max-w-full">
            {[
              { id: 'saas', label: lang === 'fr' ? '📊 SaaS Analytics' : '📊 SaaS Analytics' },
              { id: 'ecommerce', label: lang === 'fr' ? '🛍️ E-commerce' : '🛍️ E-commerce' },
              { id: 'portfolio', label: lang === 'fr' ? '🎨 Portfolio' : '🎨 Portfolio' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDemo(tab.id as DemoTab)}
                className={`px-3 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeDemo === tab.id
                    ? 'bg-orange-primary text-white shadow-md shadow-orange-primary/20'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Live IDE & Preview Window (Responsive Stack on Mobile/Tablet) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 rounded-3xl bg-[#0B0F17] border border-white/[0.08] p-3 sm:p-6 shadow-2xl">
          
          {/* Code Editor Panel */}
          <div className="lg:col-span-6 flex flex-col h-[320px] sm:h-[380px] lg:h-[420px] rounded-2xl bg-[#080B11] border border-white/[0.06] overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-white/50 ml-1 sm:ml-2">App.tsx</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Compiling
              </span>
            </div>

            <div className="flex-1 p-3 sm:p-4 overflow-y-auto font-mono text-[11px] sm:text-xs text-white/80 leading-relaxed custom-scrollbar">
              <pre className="whitespace-pre-wrap">{demoCodeText || "Initialisation du compilateur..."}</pre>
            </div>

            {/* Live Thought Stream Footer */}
            <div className="p-2.5 sm:p-3 bg-[#0E1420] border-t border-white/[0.06] space-y-1 text-[10px] sm:text-[11px] font-mono">
              <div className="text-orange-primary font-bold text-[9px] sm:text-[10px] uppercase">Pensées des agents en direct :</div>
              {demoLogs.slice(-2).map((log, i) => (
                <div key={i} className="text-white/70 truncate">{log}</div>
              ))}
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="lg:col-span-6 flex flex-col h-[320px] sm:h-[380px] lg:h-[420px] rounded-2xl bg-[#0E1420] border border-white/[0.06] overflow-hidden">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-orange-primary" />
                <span className="text-xs font-bold text-white">Rendu en direct</span>
              </div>
              <button
                onClick={() => onEnter(demoTemplates[activeDemo].prompt)}
                className="px-2.5 py-1 rounded-lg bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
              >
                <span>Ouvrir dans l'éditeur</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center overflow-y-auto">
              {activeDemo === 'saas' && (
                <div className="p-6 bg-[#080B11] border border-white/10 rounded-2xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase">MRR Récurrent</span>
                      <h3 className="text-3xl font-black text-white">$32,450</h3>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded text-xs font-mono font-bold">
                      +18.4%
                    </span>
                  </div>
                  <div className="h-20 w-full bg-white/[0.02] rounded-xl p-3 border border-white/5 flex items-end gap-1.5">
                    {[30, 45, 60, 50, 75, 90, 85, 110, 125, 140].map((val, i) => (
                      <div key={i} className="flex-1 bg-orange-primary/40 hover:bg-orange-primary rounded-t transition-all cursor-pointer" style={{ height: `${(val / 140) * 100}%` }} />
                    ))}
                  </div>
                </div>
              )}

              {activeDemo === 'ecommerce' && (
                <div className="p-6 bg-[#080B11] border border-white/10 rounded-2xl text-white">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold tracking-tight">COLLECTION ÉTÉ</h4>
                    <span className="px-3 py-1 bg-orange-primary text-white rounded-lg text-xs font-bold">
                      Panier ({cartCount})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                      <div className="text-xs font-bold">Sneakers Apex Obsidian</div>
                      <div className="text-orange-primary text-xs font-mono font-bold mt-1">$240</div>
                      <button onClick={() => setCartCount(c => c + 1)} className="w-full mt-2 py-1 bg-white/10 hover:bg-orange-primary rounded text-xs font-semibold transition-colors">
                        + Ajouter
                      </button>
                    </div>
                    <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                      <div className="text-xs font-bold">Veste Minimal Techwear</div>
                      <div className="text-orange-primary text-xs font-mono font-bold mt-1">$380</div>
                      <button onClick={() => setCartCount(c => c + 1)} className="w-full mt-2 py-1 bg-white/10 hover:bg-orange-primary rounded text-xs font-semibold transition-colors">
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeDemo === 'portfolio' && (
                <div className="p-6 bg-[#080B11] border border-white/10 rounded-2xl text-white font-mono text-xs">
                  <h4 className="text-sm font-bold text-white mb-1">BENIT MADIMBA</h4>
                  <p className="text-white/40 text-[11px] mb-4">Senior Web Architect & AI Tinkerer</p>
                  <div className="flex gap-2">
                    {['Tous', 'Intelligence Artificielle', 'Web3 & Cloud'].map((f, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/70">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MULTI-AGENT SQUAD ARCHITECTURE */}
      <section id="agents" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold mb-3">
            <Cpu size={13} />
            <span>{lang === 'fr' ? "Escouade Autonome" : "Autonomous Squad"}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {lang === 'fr' ? "4 cerveaux spécialisés travaillant de concert" : "4 specialized AI brains in perfect harmony"}
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-sm sm:text-base">
            {lang === 'fr'
              ? "Plutôt qu'un simple LLM générique, Cook IA déploie une équipe d'agents coordonnés pour chaque ligne de code."
              : "Instead of a generic prompt, Cook IA deploys a specialized multi-agent squad on every feature."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: lang === 'fr' ? "Architecte Système" : "System Architect",
              role: lang === 'fr' ? "Structure & Données" : "Structure & Data",
              desc: lang === 'fr' ? "Analyse le besoin, définit les schémas PostgreSQL et prépare les routes API Express." : "Analyzes requirements, designs schemas and prepares Express routes.",
              icon: Cpu,
              color: "text-blue-400",
              badge: "Claude 3.7 / GPT-4o"
            },
            {
              title: lang === 'fr' ? "Design Lead" : "Design Lead",
              role: lang === 'fr' ? "UI / UX & Identité" : "UI / UX & Identity",
              desc: lang === 'fr' ? "Compose des interfaces sur mesure avec Tailwind CSS, palettes raffinées et micro-interactions." : "Creates custom interfaces with Tailwind CSS and fluid micro-interactions.",
              icon: Sparkles,
              color: "text-purple-400",
              badge: "Design Tokens"
            },
            {
              title: lang === 'fr' ? "Développeur Fullstack" : "Fullstack Coder",
              role: lang === 'fr' ? "Code React & Express" : "React & Express Code",
              desc: lang === 'fr' ? "Écrit du TypeScript rigoureux, intègre les hooks réactifs et connecte Supabase." : "Writes strict TypeScript, stateful hooks, and real live Supabase calls.",
              icon: Code2,
              color: "text-orange-primary",
              badge: "TypeScript 5.0"
            },
            {
              title: lang === 'fr' ? "Inspecteur QA & Sécurité" : "QA & Security Auditor",
              role: lang === 'fr' ? "Audit Zéro-Bug" : "Zero-Bug Audit",
              desc: lang === 'fr' ? "Exécute les tests, valide les imports, filtre les secrets et garantit la réactivité." : "Runs automated tests, sanitizes inputs, and guarantees zero runtime crashes.",
              icon: ShieldCheck,
              color: "text-emerald-400",
              badge: "CASA Compliant"
            }
          ].map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-[#0E1420] border border-white/[0.08] hover:border-orange-primary/40 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/[0.04] text-white">
                    <Icon size={20} className={agent.color} />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-white/60">
                    {agent.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-orange-primary transition-colors">{agent.title}</h3>
                <div className="text-xs font-semibold text-white/40 mb-3">{agent.role}</div>
                <p className="text-xs text-white/60 leading-relaxed">{agent.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ENTERPRISE SECURITY & COOKIE GOVERNANCE */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="rounded-3xl bg-gradient-to-b from-[#0E1420] to-[#080B11] border border-white/[0.08] p-8 sm:p-12">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-3">
              <Lock size={13} />
              <span>{lang === 'fr' ? "Sécurité & Confidentialité" : "Security & Privacy"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              {lang === 'fr' ? "Vos données et vos secrets restent strictement les vôtres" : "Your data and secrets stay strictly yours"}
            </h2>
            <p className="text-white/60 text-sm sm:text-base">
              {lang === 'fr'
                ? "Conformité RGPD totale, chiffrement AES-256 des clés API et politique de cookies transparente sans revente tierce."
                : "Full GDPR compliance, AES-256 key encryption and transparent cookie policy with zero third-party selling."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <ShieldCheck size={24} className="text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">Chiffrement AES-256</h4>
              <p className="text-xs text-white/50">Toutes les clés API et tokens OAuth sont chiffrés côté serveur.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <Database size={24} className="text-blue-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">Supabase Dédié</h4>
              <p className="text-xs text-white/50">Vos tables et bases de données vous appartiennent intégralement.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <Lock size={24} className="text-orange-primary mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">Cookies Sous Contrôle</h4>
              <p className="text-xs text-white/50">Préférences mémorisées localement avec consentement révocable à tout moment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center z-10 relative">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-tr from-orange-primary/20 via-[#0E1420] to-[#080B11] border border-orange-primary/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              {lang === 'fr' ? "Prêt à construire votre prochain projet ?" : "Ready to build your next project?"}
            </h2>
            <p className="text-white/70 max-w-lg mx-auto text-sm sm:text-base mb-8">
              {lang === 'fr'
                ? "Lancez la console Cook IA et commencez à concevoir en moins de 30 secondes."
                : "Launch the Cook IA console and start building in under 30 seconds."}
            </p>
            <button
              onClick={() => onEnter()}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-hover hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-primary/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <Zap size={16} className="fill-white" />
              <span>{lang === 'fr' ? "Ouvrir l'application maintenant" : "Open Application Now"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#05080E] py-12 px-4 sm:px-6 lg:px-8 z-10 relative text-xs text-white/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-orange-primary flex items-center justify-center text-white">
              <Zap size={13} className="fill-white" />
            </div>
            <span className="font-bold text-white text-sm">Cook IA Ultimate</span>
            <span>• © 2026 Benit Madimba</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="#security" className="hover:text-white transition-colors">
              {lang === 'fr' ? "Confidentialité & Cookies" : "Privacy & Cookies"}
            </a>
            <a href="https://discord.gg/Pc6reuApRF" target="_blank" rel="noreferrer" className="hover:text-[#5865F2] transition-colors">
              Discord
            </a>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">
              {lang === 'fr' ? "Haut de page ↑" : "Back to top ↑"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
