import React, { useState, useMemo } from 'react';
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
  Cookie,
  Layout,
  Server,
  FolderTree,
  Boxes,
  Check,
  Globe,
  Flame
} from 'lucide-react';
import { translations, Language } from '../translations';
import { LegalModal, LegalTabType } from './LegalModal';

interface LandingPageProps {
  onEnter: (prompt?: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

type DemoTab = 'saas' | 'ecommerce' | 'portfolio' | 'kanban';

interface CodeSnippet {
  title: string;
  filename: string;
  category: string;
  techs: string[];
  prompt: string;
  code: string;
}

interface ProjectCard {
  id: string;
  title: string;
  category: string;
  description: string;
  techs: string[];
  prompt: string;
  badge?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, lang, setLang }) => {
  const t = translations[lang];
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeDemo, setActiveDemo] = useState<DemoTab>('saas');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTabType>('privacy');

  const openLegal = (tab: LegalTabType) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const demoTemplates: Record<DemoTab, CodeSnippet> = useMemo(() => ({
    saas: {
      title: lang === 'fr' ? "Tableau de Bord Métier & KPIs" : "Operations & KPI Dashboard",
      filename: "AnalyticsDashboard.tsx",
      category: "SaaS & Fintech",
      techs: ["React 18", "Tailwind CSS", "Recharts", "Lucide"],
      prompt: lang === 'fr' 
        ? "Crée un tableau de bord SaaS financier moderne avec graphiques de performance, suivi du MRR et filtre de périodes."
        : "Build a modern fintech SaaS dashboard with performance metrics, MRR tracking and date filters.",
      code: `import React, { useState } from 'react';
import { TrendingUp, Users, Activity, ArrowUpRight, DollarSign, Layers } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<'7d' | '30d' | '1y'>('30d');
  const [stats] = useState({
    mrr: 48250,
    growth: 14.8,
    activeUsers: 3420,
    retention: 96.4
  });

  return (
    <div className="p-6 bg-white border border-slate-200/90 rounded-2xl text-slate-900 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">MÉTRIQUES EN DIRECT</span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 mt-1">Tableau de Bord Exécutif</h2>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['7d', '30d', '1y'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={\`px-3 py-1 text-xs font-bold rounded-lg transition-all \${
                period === p ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }\`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Revenu Récurrent (MRR)</span>
            <span className="p-1.5 bg-emerald-100/80 text-emerald-800 rounded-lg font-mono font-bold text-[11px] flex items-center">
              +{stats.growth}%
            </span>
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-slate-900">€{stats.mrr.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Utilisateurs Actifs</span>
            <span className="p-1.5 bg-blue-100/80 text-blue-800 rounded-lg font-mono font-bold text-[11px]">
              96.4% rétention
            </span>
          </div>
          <p className="text-2xl font-bold font-display mt-2 text-slate-900">{stats.activeUsers.toLocaleString()}</p>
        </div>
      </div>

      {/* Sparkline Visualisation */}
      <div className="p-4 bg-slate-950 text-white rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-mono text-slate-400">Flux d'inscriptions hebdomadaires</span>
          <span className="font-bold text-amber-400">+280 cette semaine</span>
        </div>
        <div className="h-16 w-full flex items-end gap-1.5 pt-2">
          {[35, 45, 60, 50, 75, 80, 65, 90, 100, 115, 130, 145].map((val, idx) => (
            <div
              key={idx}
              className="flex-1 bg-amber-500/80 hover:bg-amber-400 rounded-t transition-all"
              style={{ height: \`\${(val / 150) * 100}%\` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}`
    },
    ecommerce: {
      title: lang === 'fr' ? "Boutique E-commerce & Panier Réactif" : "E-Commerce Storefront & Cart",
      filename: "ProductStore.tsx",
      category: "Commerce & Retail",
      techs: ["React 18", "State Cart", "Tailwind CSS", "Filter Grid"],
      prompt: lang === 'fr'
        ? "Crée une boutique de vêtements haut de gamme avec filtre de catégories, panier réactif et calcul du total dynamique."
        : "Create a minimalist premium fashion boutique with category filters, reactive state cart and total calculations.",
      code: `import React, { useState } from 'react';
import { ShoppingBag, Star, Check, ArrowRight } from 'lucide-react';

export default function ProductStore() {
  const [cart, setCart] = useState<Array<{ id: number; name: string; price: number }>>([]);
  const [category, setCategory] = useState<'tous' | 'vetements' | 'accessoires'>('tous');

  const products = [
    { id: 1, name: "Veste Moleskine Architecte", cat: "vetements", price: 185, stock: "En stock" },
    { id: 2, name: "Carnet Grid & Stylographe", cat: "accessoires", price: 42, stock: "En stock" }
  ];

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="p-6 bg-white border border-slate-200/90 rounded-2xl text-slate-900 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <span className="text-[11px] font-mono font-bold text-amber-700 tracking-wider">ÉDITION 2026</span>
          <h3 className="text-xl font-bold font-display text-slate-900">Atelier Créateur</h3>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-1.5 bg-[#172E26] text-white rounded-xl text-xs font-bold shadow-xs">
          <ShoppingBag size={14} className="text-amber-400" />
          <span>Panier ({cart.length}) · {total}€</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map(p => (
          <div key={p.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase bg-white border px-2 py-0.5 rounded text-slate-600 font-bold">
                  {p.stock}
                </span>
                <span className="text-sm font-mono font-extrabold text-slate-900">{p.price} €</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mt-2">{p.name}</h4>
            </div>
            <button
              onClick={() => setCart(prev => [...prev, p])}
              className="mt-4 w-full py-2 bg-white border border-slate-200 hover:border-[#172E26] hover:bg-[#172E26] hover:text-white rounded-lg text-xs font-bold transition-all text-slate-800"
            >
              Ajouter au panier +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`
    },
    portfolio: {
      title: lang === 'fr' ? "Portfolio Développeur & Projets" : "Developer & Designer Portfolio",
      filename: "DeveloperPortfolio.tsx",
      category: "Identité & Portfolio",
      techs: ["React 18", "Editorial Serif", "Tailwind CSS", "Filters"],
      prompt: lang === 'fr'
        ? "Crée un portfolio de designer/développeur senior avec mise en page éditoriale soignée, badges de compétences et liste de projets."
        : "Design a senior developer & designer portfolio with editorial typography, skill badges and interactive project cards.",
      code: `import React, { useState } from 'react';
import { ExternalLink, Github, Sparkles, Terminal } from 'lucide-react';

export default function DeveloperPortfolio() {
  const [filter, setFilter] = useState<'all' | 'frontend' | 'ai'>('all');
  
  const projects = [
    { title: "Cook IA Studio", role: "Architecture Full-Stack", tag: "ai", year: "2026" },
    { title: "Nexus Design System", role: "Composants React & Tokens", tag: "frontend", year: "2025" }
  ];

  return (
    <div className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-2xl text-slate-900 shadow-xs">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 border border-amber-200/70 text-amber-800 rounded-full text-xs font-mono font-bold mb-3">
          <Terminal size={12} /> Lead Front-End Engineer
        </div>
        <h3 className="text-2xl sm:text-3xl font-editorial font-bold italic text-slate-900">
          Benit Madimba
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed max-w-md">
          Conception d'outils développeurs, interfaces réactives et architectures web de haute précision.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {projects.map((proj, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl hover:border-slate-400 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                {proj.title}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{proj.role} · {proj.year}</p>
            </div>
            <ExternalLink size={15} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}`
    },
    kanban: {
      title: lang === 'fr' ? "Gestionnaire de Tâches & Kanban" : "Kanban Task Manager",
      filename: "KanbanBoard.tsx",
      category: "Productivité & Outils",
      techs: ["React 18", "State Local", "Tailwind CSS", "Modulaire"],
      prompt: lang === 'fr'
        ? "Crée une application de gestion de sprint type Kanban avec colonnes À faire, En cours, Terminé et ajout interactif de cartes."
        : "Build a sprint Kanban task management board with Todo, In Progress, Done columns and card addition.",
      code: `import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, ListTodo } from 'lucide-react';

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Audit d'accessibilité WCAG AA", col: "done" },
    { id: 2, text: "Intégration du composant Recharts", col: "progress" },
    { id: 3, text: "Optimisation du bundle Vite", col: "todo" }
  ]);

  return (
    <div className="p-6 bg-white border border-slate-200/90 rounded-2xl text-slate-900 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <ListTodo size={18} className="text-[#172E26]" />
          <h3 className="text-base font-bold font-display text-slate-900">Sprint Actif #14</h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500">3 TÂCHES</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'todo', label: 'À faire', bg: 'bg-slate-100', text: 'text-slate-700' },
          { key: 'progress', label: 'En cours', bg: 'bg-amber-100', text: 'text-amber-800' },
          { key: 'done', label: 'Terminé', bg: 'bg-emerald-100', text: 'text-emerald-800' }
        ].map(col => (
          <div key={col.key} className="bg-slate-50 border border-slate-200/70 rounded-xl p-2.5">
            <span className={\`block text-[10px] font-mono uppercase font-bold \${col.text} px-2 py-0.5 rounded \${col.bg} w-fit mb-2\`}>
              {col.label}
            </span>
            <div className="space-y-2 min-h-[90px]">
              {tasks.filter(t => t.col === col.key).map(t => (
                <div key={t.id} className="p-2 bg-white border border-slate-200/80 rounded-lg text-xs font-medium text-slate-800 shadow-2xs">
                  {t.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`
    }
  }), [lang]);

  // Project Templates Grid Data
  const projectTemplates: ProjectCard[] = useMemo(() => [
    {
      id: 'saas',
      title: lang === 'fr' ? "SaaS & Web App Complète" : "Complete SaaS Web App",
      category: "Application Métier",
      description: lang === 'fr'
        ? "Architecture moderne avec authentification Supabase, tableaux de bord interactifs, formulaires réactifs et gestion des données."
        : "Modern multi-tenant architecture with Supabase authentication, interactive dashboards, forms and state management.",
      techs: ["React 18", "Supabase Auth", "Recharts", "Tailwind CSS"],
      prompt: "Construis une plateforme SaaS moderne complète avec dashboard analytique, gestion d'équipe et intégration Supabase.",
      badge: "Populaire"
    },
    {
      id: 'ecom',
      title: lang === 'fr' ? "Boutique E-commerce Moderne" : "Modern E-Commerce Store",
      category: "Vente & Commerce",
      description: lang === 'fr'
        ? "Vitrine produit dynamique avec filtres multicritères, gestion d'état du panier d'achat, calcul de prix et tunnel de commande."
        : "Product storefront with multi-filters, shopping cart state management, checkout summary and responsive gallery.",
      techs: ["React 18", "Panier Local", "Filtres Dynamiques", "Stripe Ready"],
      prompt: "Génère une boutique e-commerce moderne avec catalogue de produits filtrable, panier d'achat réactif et résumé de commande."
    },
    {
      id: 'portfolio',
      title: lang === 'fr' ? "Portfolio & Showcase Éditorial" : "Editorial Portfolio & Showcase",
      category: "Identité de Marque",
      description: lang === 'fr'
        ? "Mise en page haute densité pour créateurs et ingénieurs. Typographie éditoriale, filtres de réalisations et formulaire de contact."
        : "High-density editorial layout for developers and designers. Clean typography, project filtering and contact actions.",
      techs: ["Typographie Éditoriale", "Mode Sombre", "Cartes Projets", "Vite"],
      prompt: "Crée un portfolio de développeur et designer web au style éditorial soigné avec filtres de projets et présentation interactive."
    },
    {
      id: 'dashboard',
      title: lang === 'fr' ? "Plateforme CRM & Gestion Interne" : "CRM & Operations Platform",
      category: "Outils Développeurs & B2B",
      description: lang === 'fr'
        ? "Outil d'administration avec tableau Kanban, gestion des utilisateurs, journalisation d'événements et métriques opérationnelles."
        : "Administrative back-office with Kanban boards, user management, real-time activity feeds and metrics.",
      techs: ["Kanban Board", "Modales d'édition", "Export CSV", "Multi-Pages"],
      prompt: "Construis un outil de CRM et gestion de projets interne avec tableau Kanban interactif, filtres de statut et fiche client."
    }
  ], [lang]);

  // Syntax highlighting helper for code view
  const renderHighlightedLine = (line: string, index: number) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return <span key={index} className="text-slate-400 italic font-mono">{line}</span>;
    }
    const parts = line.split(/(\b(?:import|export|default|function|return|const|let|var|from|true|false|useState|useEffect|interface|type)\b|'[^']*'|"[^"]*"|`[^`]*`|<\/?[A-Za-z0-9_]+|[{}()=>[\]])/g);
    return (
      <span key={index} className="leading-relaxed font-mono">
        {parts.map((part, pIdx) => {
          if (!part) return null;
          if (['import', 'export', 'default', 'function', 'return', 'const', 'let', 'var', 'from', 'interface', 'type'].includes(part)) {
            return <span key={pIdx} className="text-[#B45309] font-bold">{part}</span>;
          }
          if (['true', 'false', 'null', 'undefined'].includes(part)) {
            return <span key={pIdx} className="text-[#2563EB] font-bold">{part}</span>;
          }
          if (part.startsWith('"') || part.startsWith("'") || part.startsWith('`')) {
            return <span key={pIdx} className="text-[#15803D]">{part}</span>;
          }
          if (part.startsWith('<') || part.startsWith('</')) {
            return <span key={pIdx} className="text-[#C2410C] font-bold">{part}</span>;
          }
          if (['useState', 'useEffect'].includes(part)) {
            return <span key={pIdx} className="text-[#4338CA] font-bold">{part}</span>;
          }
          return <span key={pIdx} className="text-slate-800">{part}</span>;
        })}
      </span>
    );
  };

  const currentLines = useMemo(() => {
    return demoTemplates[activeDemo].code.split('\n');
  }, [activeDemo, demoTemplates]);

  const starterChips = [
    { label: lang === 'fr' ? "Tableau de Bord SaaS & KPIs" : "SaaS KPI Dashboard", prompt: "Crée un tableau de bord SaaS avec graphiques Recharts et métriques en direct." },
    { label: lang === 'fr' ? "Boutique E-commerce Moderne" : "Modern E-Commerce Store", prompt: "Génère une boutique e-commerce avec catalogue filtrable et panier d'achat dynamique." },
    { label: lang === 'fr' ? "Portfolio Éditorial & Créatif" : "Editorial Portfolio", prompt: "Conçois un portfolio de designer au style éditorial soigné et mode sombre." },
    { label: lang === 'fr' ? "Tableau Kanban & Gestion Sprint" : "Kanban Task Board", prompt: "Construis une application de gestion de sprint avec colonnes Kanban interactives." }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] selection:bg-[#EA580C] selection:text-white font-sans antialiased overflow-x-hidden relative">
      
      {/* Background Architectural Grid */}
      <div className="fixed inset-0 pointer-events-none bg-grid-subtle opacity-70 z-0" />
      
      {/* TOP BAR CONTRACT: [Brand title] — [Nav links] — [Primary actions] */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Zone */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 rounded-lg bg-[#172E26] flex items-center justify-center text-white font-black shadow-xs group-hover:bg-[#0F1E19] transition-colors">
              <Code2 size={17} className="text-amber-400" />
            </div>
            <span className="font-bold text-base tracking-tight font-display text-slate-900">
              Cook IA
            </span>
          </div>

          {/* Navigation Links Zone */}
          <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold text-slate-600">
            <button 
              onClick={() => document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' })} 
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              {lang === 'fr' ? "Approche Technique" : "Architecture"}
            </button>
            <button 
              onClick={() => document.getElementById('studio-demo')?.scrollIntoView({ behavior: 'smooth' })} 
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              {lang === 'fr' ? "Inspecteur de Code" : "Code Inspector"}
            </button>
            <button 
              onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })} 
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              {lang === 'fr' ? "Architectures & Modèles" : "Templates"}
            </button>
          </nav>

          {/* Actions Zone */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-100 border border-slate-200/80 rounded-lg p-0.5 shadow-2xs">
              <button 
                onClick={() => setLang('fr')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${
                  lang === 'fr' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                FR
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => onEnter()}
              className="px-3.5 sm:px-4 py-2 rounded-lg bg-[#172E26] hover:bg-[#0F1E19] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="whitespace-nowrap">{lang === 'fr' ? "Ouvrir le Studio" : "Open Studio"}</span>
              <ArrowRight size={14} className="text-amber-400" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-14 sm:pt-24 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center z-10">
        
        {/* Creator / Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 mb-6 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Créé par <strong className="text-slate-900">Benit Madimba</strong></span>
          <span className="text-slate-300 select-none">•</span>
          <span className="text-amber-700 font-mono text-[11px] font-bold">Moteur Web v3.5</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-[1.15] font-display text-slate-900"
        >
          {lang === 'fr' ? (
             <>Le développement web assisté par l'IA,<br className="hidden sm:inline" /> <span className="font-editorial italic font-normal text-amber-800">pensé pour les créateurs exigeants.</span></>
          ) : (
             <>AI-assisted web development,<br className="hidden sm:inline" /> <span className="font-editorial italic font-normal text-amber-800">rethought for demanding builders.</span></>
          )}
        </motion.h1>

        {/* Clear Concrete Positioning Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal"
        >
          {lang === 'fr'
            ? "Cook IA structure vos idées en architectures React 18, Vite et Tailwind CSS complètes. Inspectez chaque ligne de code en direct, modifiez les composants et déployez votre application sans boîte noire."
            : "Cook IA structures your ideas into complete React 18, Vite and Tailwind CSS architectures. Inspect every line of code live, tweak components and deploy without black boxes."}
        </motion.p>

        {/* Interactive Prompt Sandbox Box */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto w-full mb-8 text-left"
        >
          <div className="relative rounded-2xl bg-white border border-slate-300/80 p-3 sm:p-4 shadow-sm focus-within:border-[#172E26] focus-within:ring-2 focus-within:ring-[#172E26]/10 transition-all">
            
            <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-500 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-amber-600" />
                <span className="font-semibold text-slate-700">Console de Forge Cook IA</span>
              </div>
              <span className="hidden sm:inline text-[11px] text-slate-400">Appuyez sur Entrée ↵ pour lancer</span>
            </div>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && customPrompt.trim()) {
                  e.preventDefault();
                  onEnter(customPrompt);
                }
              }}
              placeholder={lang === 'fr' 
                ? "Ex: Un tableau de bord SaaS moderne avec graphiques Recharts, mode sombre et filtres de données..." 
                : "Ex: A modern SaaS dashboard with Recharts metrics, dark mode and responsive tables..."}
              className="w-full h-24 sm:h-28 bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium resize-none focus:outline-none custom-scrollbar leading-relaxed"
            />
            
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-bold">
                  React 18 + Vite
                </span>
                <span className="hidden sm:inline px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold">
                  Agents Multi-Rôles
                </span>
              </div>

              <button
                onClick={() => onEnter(customPrompt)}
                disabled={!customPrompt.trim()}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-xs ${
                  customPrompt.trim()
                    ? 'bg-[#172E26] hover:bg-[#0F1E19] text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <span>{lang === 'fr' ? "Forger l'application" : "Forge Application"}</span>
                <ArrowUp size={14} strokeWidth={3} className={customPrompt.trim() ? 'text-amber-400' : ''} />
              </button>
            </div>
          </div>

          {/* Quick Starter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Idées rapides :</span>
            {starterChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => onEnter(chip.prompt)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 text-xs font-medium text-slate-700 hover:text-slate-950 hover:border-[#172E26] hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* MANIFESTO / ARCHITECTURAL APPROACH */}
      <section id="manifesto" className="py-16 sm:py-20 bg-white border-t border-b border-slate-200/80 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-700 tracking-wider mb-2">
                <Cpu size={14} /> Notre Philosophie Produit
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-4 tracking-tight leading-tight">
                L'ingénierie et la clarté avant les promesses vagues.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                La plupart des générateurs IA se contentent d'afficher un chatbot générique produisant des blocs de code isolés et difficiles à maintenir. Cook IA a été pensé comme un <strong>véritable IDE assisté</strong>.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Chaque projet généré est composé d'une architecture modulaire claire (fichiers JSX/TSX, styles Tailwind prédictibles, gestionnaires d'état) que vous pouvez inspecter, modifier et télécharger immédiatement sous forme d'archive standard.
              </p>
              
              <div className="flex items-center gap-4 text-xs font-mono text-slate-700">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Check size={14} strokeWidth={3} /> Code 100% Modulaire
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Check size={14} strokeWidth={3} /> Zéro Lock-in Propriétaire
                </span>
              </div>
            </div>

            {/* Technical Pillars Card */}
            <div className="bg-[#F8FAFC] p-6 sm:p-7 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-200">
                SOCLE TECHNIQUE & STANDARDS
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#172E26] shrink-0 mt-0.5">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">React 18 & Vite</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Rendu ultra-rapide côté client, hot-reload instantané et modules ES standards.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#172E26] shrink-0 mt-0.5">
                    <Boxes size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Tailwind CSS & Design Tokens</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Système de design cohérent avec gestion des thèmes clair/sombre et espacements stricts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#172E26] shrink-0 mt-0.5">
                    <Database size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Supabase & Intégrations</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Persistance des sessions, base PostgreSQL et authentification sécurisée.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#172E26] shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Multi-Agent Sandbox</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Pipeline avec analyste d'architecture, designer de composants et testeur d'interface.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE CODE & PREVIEW INSPECTOR */}
      <section id="studio-demo" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-700 tracking-wider mb-2">
              <Terminal size={14} /> Démonstration Interactive
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 mb-3 tracking-tight">
              {lang === 'fr' ? "Le code source est immédiatement inspectable." : "The source code is immediately inspectable."}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              {lang === 'fr' 
                ? "Sélectionnez un modèle ci-dessous pour voir la structure du code React généré et le rendu en temps réel." 
                : "Select a model below to explore the generated React code structure and live preview."}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
            {/* Left: Template Selector Sidebar */}
            <div className="w-full lg:w-1/3 flex flex-col gap-2.5">
              {(Object.keys(demoTemplates) as DemoTab[]).map(tab => {
                const item = demoTemplates[tab];
                const isActive = activeDemo === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveDemo(tab)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white border-[#172E26] shadow-sm ring-1 ring-[#172E26]/10' 
                        : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-amber-700">
                        {item.category}
                      </span>
                      <ChevronRight size={14} className={isActive ? 'text-[#172E26]' : 'text-slate-400'} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.prompt}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100">
                      {item.techs.map((tech, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}

              <div className="mt-2 p-4 rounded-xl bg-slate-900 text-white text-xs border border-slate-800">
                <div className="flex items-center gap-2 font-mono font-bold text-amber-400 mb-1">
                  <Sparkles size={14} /> Prêt à coder votre projet ?
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                  Ouvrez l'environnement Studio pour générer votre propre application complète.
                </p>
                <button
                  onClick={() => onEnter(demoTemplates[activeDemo].prompt)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Utiliser ce composant dans le Studio</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Right: Code Viewer & Live Preview */}
            <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm overflow-hidden">
              
              {/* Code File Viewer */}
              <div className="w-full md:w-1/2 flex flex-col h-[420px]">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-amber-600" />
                    <span className="font-mono font-bold text-slate-700">{demoTemplates[activeDemo].filename}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">TypeScript / JSX</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FAFAFC] p-3 rounded-xl border border-slate-200/70 text-[11px] font-mono leading-relaxed">
                  {currentLines.map((line, idx) => (
                    <div key={idx} className="flex hover:bg-black/5 px-1 py-0.5 rounded">
                      <span className="w-6 text-slate-400 select-none opacity-40 shrink-0 text-right pr-2">{idx + 1}</span>
                      <span className="whitespace-pre-wrap break-all">{renderHighlightedLine(line, idx)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Pane */}
              <div className="w-full md:w-1/2 flex flex-col h-[420px]">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-[#172E26]" />
                    <span className="font-bold text-slate-700">Rendu du Composant</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold rounded">
                    INTERACTIF
                  </span>
                </div>
                <div className="flex-1 rounded-xl border border-slate-200/70 bg-[#F8FAFC] flex items-center justify-center p-3 sm:p-4 overflow-y-auto custom-scrollbar">
                   <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{
                      __html: demoTemplates[activeDemo].code
                        .replace(/import .*;/, '')
                        .replace(/export default function .*\(\) {/, '')
                        .replace(/const .* = .*;/g, '')
                        .replace(/return \(/, '')
                        .replace(/\);\n}/, '')
                        .replace(/className=/g, 'class=')
                        .replace(/style={{[^}]+}}/g, '')
                        .replace(/\{stats\.mrr\.toLocaleString\(\)\}/g, '48 250')
                        .replace(/\{stats\.growth\}/g, '14.8')
                        .replace(/\{stats\.activeUsers\.toLocaleString\(\)\}/g, '3 420')
                        .replace(/\{products\.map[^\)]+\)\)}/g, '<div class="p-4 bg-slate-50 border border-slate-200 rounded-xl"><h4 class="text-sm font-bold text-slate-900">Veste Moleskine Architecte</h4><p class="text-xs font-mono font-bold text-slate-700 mt-1">185 €</p></div>')
                        .replace(/\{projects\.map[^\)]+\)\)}/g, '<div class="p-3 bg-slate-50 border border-slate-200 rounded-xl"><h4 class="text-sm font-bold text-slate-900">Cook IA Studio</h4><p class="text-xs text-slate-500 font-mono mt-0.5">Architecture Full-Stack · 2026</p></div>')
                        .replace(/\{tasks\.filter[^\)]+\)\)}/g, '<div class="p-2 bg-white border border-slate-200 rounded text-xs font-medium text-slate-800">Audit d\'accessibilité WCAG</div>')
                        .replace(/\{total\}€/g, '0€')
                        .replace(/\{cart\.length\}/g, '0')
                        .replace(/\{tab\}/g, '')
                        .replace(/onClick=\{[^\}]+\}/g, '')
                    }}
                   />
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT TEMPLATES & ARCHITECTURES */}
      <section id="templates" className="py-16 sm:py-20 bg-white border-t border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-700 tracking-wider mb-2">
                <Boxes size={14} /> Prêt pour la Production
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
                Architectures de Référence
              </h2>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md">
              Démarrez sur une structure testée et modulaire. Choisissez une base ou décrivez votre besoin précis dans le Studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectTemplates.map((item) => (
              <div 
                key={item.id}
                className="p-6 bg-[#F8FAFC] border border-slate-200/90 rounded-2xl flex flex-col justify-between hover:border-slate-400 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    {item.badge && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 group-hover:text-amber-700 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200/60">
                    {item.techs.map((tech, idx) => (
                      <span key={idx} className="text-[11px] font-mono bg-white border border-slate-200/80 text-slate-700 px-2.5 py-1 rounded-lg">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    onClick={() => onEnter(item.prompt)}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#172E26] hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    <span>Utiliser ce modèle</span>
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                  <span className="text-[11px] font-mono text-slate-400">Prêt en 1 clic</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-slate-500 text-xs font-mono border-t border-slate-200/80 bg-white relative z-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} Cook IA par <strong className="text-slate-800">Benit Madimba</strong>. Tous droits réservés.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <button 
              onClick={() => openLegal('privacy')}
              className="hover:text-slate-950 transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Politique de confidentialité
            </button>
            <span className="text-slate-300 select-none">•</span>
            <button 
              onClick={() => openLegal('tos')}
              className="hover:text-slate-950 transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Conditions d'utilisation
            </button>
            <span className="text-slate-300 select-none">•</span>
            <button 
              onClick={() => openLegal('cookies')}
              className="hover:text-slate-950 transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              Politique des cookies
            </button>
          </div>
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
