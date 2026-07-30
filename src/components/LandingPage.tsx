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
  Award
} from 'lucide-react';

interface LandingPageProps {
  onEnter: (prompt?: string) => void;
}

type DemoTab = 'saas' | 'ecommerce' | 'portfolio';

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Dynamic state for landing page input
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeDepth, setActiveDepth] = useState('0m');

  // Sticky depth navigation handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Monitor scroll for sidebar indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const height = window.innerHeight;
      
      if (scrollPos < height * 0.8) {
        setActiveDepth('0m');
      } else if (scrollPos < height * 1.8) {
        setActiveDepth('100m');
      } else if (scrollPos < height * 2.8) {
        setActiveDepth('500m');
      } else if (scrollPos < height * 3.8) {
        setActiveDepth('1000m');
      } else if (scrollPos < height * 4.8) {
        setActiveDepth('1500m');
      } else if (scrollPos < height * 5.8) {
        setActiveDepth('1750m');
      } else if (scrollPos < height * 6.8) {
        setActiveDepth('2000m');
      } else {
        setActiveDepth('BOTTOM');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const backgroundValue = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      "radial-gradient(circle at 50% 0%, #0d1a2d 0%, #03070d 70%)", 
      "radial-gradient(circle at 50% 20%, #08111e 0%, #020408 80%)", 
      "radial-gradient(circle at 50% 40%, #0a0e17 0%, #010204 100%)",
      "radial-gradient(circle at 50% 60%, #050a12 0%, #000000 100%)",
      "radial-gradient(circle at 50% 80%, #0d131f 0%, #010306 100%)",
      "radial-gradient(circle at 50% 100%, #1c0e00 0%, #020100 100%)"
    ]
  );

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Abyssal micro-bubbles
    for(let i=0; i<80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height + canvas.height,
        size: Math.random() * 3 + 0.8,
        speed: Math.random() * 0.6 + 0.2,
        sway: Math.random() * 2,
        opacity: Math.random() * 0.4 + 0.1
      });
    }

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += Math.sin(p.y / 60) * 0.6;
        if(p.y < -50) {
          p.y = canvas.height + 50;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 212, ${p.opacity})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // FORGE IA: Live Interactive Demo Generator state
  const [activeDemo, setActiveDemo] = useState<DemoTab>('saas');
  const [demoStep, setDemoStep] = useState(0);
  const [demoCodeText, setDemoCodeText] = useState('');
  const [demoLogs, setDemoLogs] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'web3' | 'ia'>('all');

  const demoTemplates = {
    saas: {
      prompt: "Forger un SaaS Dashboard d'analytics financiers avec graphiques, MRR et filtres temporels",
      code: `// cook-ia-forge/saas-dashboard.tsx
import React, { useState } from 'react';
import { AreaChart, Sparkles } from 'lucide-react';

export default function SaaSAnalytics() {
  const [mrr, setMrr] = useState(24850);
  return (
    <div className="p-6 bg-slate-950/80 border border-white/5 rounded-2xl">
      <div className="flex justify-between mb-6">
        <div>
          <p className="text-[10px] text-slate-400 font-mono">FINANCIAL MRR</p>
          <p className="text-3xl font-black text-white">$24,850</p>
        </div>
        <span className="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-2 py-1 rounded">+12.4%</span>
      </div>
      
      {/* Dynamic Graph Line */}
      <svg className="w-full h-24 my-4" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,2" fill="none" stroke="#FF6B00" strokeWidth="2.5" />
        <path d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,2 L100,30 L0,30 Z" fill="url(#grad)" opacity="0.15" />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}`,
      logs: [
        "🌐 [Analyste] Initialisation de l'architecture NextJS-React. Analyse sémantique: OK.",
        "🏗️ [Planificateur] Création du schéma de base de données d'analytics temporels...",
        "🧠 [COOK IA CORE] Injection des composants de visualisation optimisés Framer Motion.",
        "🛡️ [Critique] Validation de l'intégrité des types TypeScript & Sec-Audit: 100% OK.",
        "⚡ [Testeur] Code compilé avec succès en 420ms. Déploiement Cloud complété."
      ]
    },
    ecommerce: {
      prompt: "Créer un site d'E-Commerce luxueux avec grille de produits de mode, panieres réactifs et animations Premium",
      code: `// cook-ia-forge/luxury-ecommerce.tsx
import React, { useState } from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';

export default function LuxuryStore() {
  const [cart, setCart] = useState(0);
  return (
    <div className="bg-neutral-950 text-neutral-200 min-h-64 p-6 font-serif">
      <header className="flex justify-between border-b border-white/5 pb-4 mb-6">
        <h2 className="text-lg tracking-[0.2em] uppercase">L'HORIZON</h2>
        <div className="relative">
          <ShoppingBag size={18} />
          <span className="absolute -top-2 -right-2 bg-amber-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart}</span>
        </div>
      </header>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="group cursor-pointer">
          <div className="aspect-square bg-neutral-900 rounded-lg mb-2 overflow-hidden border border-white/5 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-[10px] uppercase font-sans tracking-widest text-white">Aperçu rapide</span>
            </div>
            <div className="w-full h-full bg-radial-[at_50%_50%] from-neutral-800 to-transparent flex items-center justify-center">
              <span className="text-3xl">🏺</span>
            </div>
          </div>
          <p className="text-xs tracking-wider uppercase font-sans text-neutral-400">AMBER VASE</p>
          <p className="text-sm font-sans text-amber-500 font-bold mb-2">450 €</p>
          <button onClick={() => setCart(c => c+1)} className="w-full py-1 text-[9px] uppercase font-sans tracking-widest border border-white/10 hover:border-amber-500 hover:text-amber-500 transition-colors">AJOUTER</button>
        </div>
      </div>
    </div>
  );
}`,
      logs: [
        "🌐 [Analyste] Modélisation du thème e-commerce 'Chic Noir Vandal'. Layout flex-grid sélectionné.",
        "🏗️ [Planificateur] Spécification du panier réactif via React Context et localStorage.",
        "🧠 [COOK IA CORE] Intégration de Framer Motion pour les transitions de survol des fiches produits.",
        "🛡️ [Critique] Alignement avec les règles de sécurité CORS et routage Stripe sécurisé.",
        "⚡ [Testeur] Sandbox opérationnelle. 3/3 tests unitaires d'ajout au panier validés."
      ]
    },
    portfolio: {
      prompt: "Forger un Portfolio de Développeur minimaliste et sombre avec filtre de projets 3D/IA interactifs",
      code: `// cook-ia-forge/portfolio.tsx
import React, { useState } from 'react';
import { Code, AppWindow, Globe } from 'lucide-react';

export default function DevPortfolio() {
  const [filter, setFilter] = useState('all');
  return (
    <div className="p-6 bg-stone-950 border border-stone-800 rounded-2xl font-mono text-xs">
      <div className="mb-4">
        <h3 className="text-white text-sm font-bold">BENIT MADIMBA — PORTFOLIO</h3>
        <p className="text-stone-500 text-[10px]">Senior Web Architect & AI Tinkerer</p>
      </div>
      
      <div className="flex gap-2 mb-6">
        {['all', 'ia', 'web3'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={\`px-2 py-0.5 rounded border \${filter === f ? 'border-[#FF6B00] text-[#FF6B00]' : 'border-stone-800 text-stone-400'}\`}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}`,
      logs: [
        "🌐 [Analyste] Conception créative: Portfolio brute-industrial. Typographies monospaced.",
        "🏗️ [Planificateur] Plan de route de rendu dynamique des articles et filtres.",
        "🧠 [COOK IA CORE] Injection d'un canevas de particules d'arrière-plan interactif.",
        "🛡️ [Critique] Optimisation du score SEO (Target: 100/100) et accessibilité WCAG.",
        "⚡ [Testeur] Build finalisé avec succès. Vitesse de chargement optimale (FCP: 0.2s)."
      ]
    }
  };

  // Switch demo simulation
  useEffect(() => {
    setDemoStep(0);
    setDemoCodeText('');
    setDemoLogs([]);
    
    const activeData = demoTemplates[activeDemo];
    let codeIndex = 0;
    let logIndex = 0;
    
    // Animate typing out code
    const codeTimer = setInterval(() => {
      if (codeIndex < activeData.code.length) {
        setDemoCodeText(prev => prev + activeData.code.charAt(codeIndex));
        codeIndex += 14; // speed typing rate
      } else {
        clearInterval(codeTimer);
      }
    }, 15);

    // Animate logs typing out
    const logsTimer = setInterval(() => {
      if (logIndex < activeData.logs.length) {
        setDemoLogs(prev => [...prev, activeData.logs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logsTimer);
      }
    }, 900);

    return () => {
      clearInterval(codeTimer);
      clearInterval(logsTimer);
    };
  }, [activeDemo]);

  // Starter Prompts array
  const starterPrompts = [
    { text: "SaaS Analytics financier ultra complet", label: "📊 FinTech" },
    { text: "E-commerce de vêtements de luxe design sombre", label: "🛍️ Luxury Shop" },
    { text: "Portfolio d'architecte 3D avec galerie d'images", label: "🌐 3D Portfolio" },
    { text: "Application de gestion immobilière avec carte", label: "🏠 Cloud Estate" }
  ];

  return (
    <div ref={containerRef} className="relative min-h-[720vh] overflow-hidden bg-abyssal-deep text-white font-sans selection:bg-orange-primary selection:text-white">
      {/* Dynamic Background */}
      <motion.div 
        style={{ background: backgroundValue }}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Volumetric Rays with shifting behavior */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-25%] left-1/2 w-[350%] h-[350%] origin-top -translate-x-1/2 animate-[spin_60s_linear_infinite]"
             style={{ background: 'conic-gradient(from 180deg at 50% 0%, transparent 0%, rgba(0, 245, 212, 0.12) 130deg, transparent 240deg, rgba(255, 107, 0, 0.08) 300deg, transparent 360deg)', filter: 'blur(130px)' }} />
      </div>

      {/* Dynamic Bubble Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-1 pointer-events-none opacity-40" />

      {/* Interactive Floating Trail Cursor */}
      <div 
        className="fixed w-14 h-14 border border-orange-primary/30 rounded-full z-50 pointer-events-none bg-radial-[at_30%_30%] from-orange-primary/5 to-transparent backdrop-blur-[0.5px] hidden md:block"
        style={{ left: cursorPos.x, top: cursorPos.y, transform: 'translate(-50%, -50%)', transition: 'transform 0.12s cubic-bezier(0.1, 0.8, 0.25, 1)' }}
      />
      
      {/* Absolute Noise Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* STICKY ABSYSS DEPTH SIDEBAR INDICATOR */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[45] hidden lg:flex flex-col items-center gap-5 bg-black/45 backdrop-blur-xl border border-white/5 py-8 px-4 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {[
          { depth: '0m', label: 'Surface', id: 'hero' },
          { depth: '100m', label: 'Idées', id: 'ideas' },
          { depth: '500m', label: 'Agents', id: 'agents' },
          { depth: '1000m', label: 'Tech Stack', id: 'tech' },
          { depth: '1500m', label: 'Rapport', id: 'stats' },
          { depth: '1750m', label: 'Sécurité & Cookies', id: 'security-cookies' },
          { depth: '2000m', label: 'Pourquoi', id: 'why' },
          { depth: 'BOTTOM', label: 'Abysse', id: 'cta' }
        ].map((item) => {
          const isActive = activeDepth === item.depth;
          return (
            <button
              key={item.depth}
              onClick={() => scrollToSection(item.id)}
              className="group relative flex flex-col items-center justify-center p-1.5 focus:outline-none transition-all"
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${isActive ? 'bg-orange-primary scale-125 shadow-[0_0_12px_#FF6B00]' : 'bg-white/20 group-hover:bg-white/40'}`} />
              <div className="absolute right-8 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 origin-right transition-all duration-300 pointer-events-none flex items-center bg-black/80 border border-white/10 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg text-white shadow-2xl whitespace-nowrap">
                <span className="text-orange-primary font-mono mr-1.5">{item.depth}</span>
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-xl border-b border-white/5 bg-black/15">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
          <div className="w-10 h-10 bg-orange-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.4)]">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg tracking-widest text-white leading-none">COOK IA</span>
            <span className="text-[8px] font-black uppercase text-orange-primary font-mono tracking-widest mt-0.5">Elite Multi-Agent</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <button onClick={() => scrollToSection('ideas')} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-orange-primary transition-colors">Concept</button>
          <button onClick={() => scrollToSection('agents')} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-orange-primary transition-colors">Équipe d'Agents</button>
          <button onClick={() => scrollToSection('tech')} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-orange-primary transition-colors">Tech</button>
          <button onClick={() => scrollToSection('stats')} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-orange-primary transition-colors">Garanties</button>
        </div>

        <button 
          onClick={() => onEnter()}
          className="group relative px-6 py-3 rounded-xl bg-white/5 hover:bg-orange-primary hover:text-white text-white text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-transparent transition-all hover:scale-105"
        >
          Lancer la Console
        </button>
      </nav>

      {/* HERO SECTION (SURFACE: 0m) */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center z-10 px-6 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-orange-primary rounded-full blur-[110px] opacity-25" />
          <div className="w-24 h-24 bg-gradient-to-tr from-orange-primary to-amber-500 rounded-3xl flex items-center justify-center shadow-[0_0_80px_rgba(255,107,0,0.4)] relative z-10 animate-pulse">
            <Zap size={44} className="text-white fill-white" />
          </div>
        </motion.div>

        {/* Brand visual tags */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-widest mb-6 backdrop-blur-3xl text-orange-primary font-mono shadow-xl shadow-black/20">
          <Sparkles size={10} className="animate-spin" />
          <span>Moteur Multi-Agent de Troisième Génération v.3.5</span>
        </div>

        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl mb-8 text-center tracking-widest leading-none relative">
          {["C","O","O","K","","I","A"].map((char, i) => (
            char === "" ? <span key={i} className="inline-block">&nbsp;</span> : (
              <motion.span 
                key={i}
                className="inline-block hover:text-orange-primary transition-colors cursor-default select-none"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              >
                {char}
              </motion.span>
            )
          ))}
        </h1>

        <p className="max-w-3xl text-center text-lg sm:text-2xl text-white/70 font-medium mb-12 px-2 leading-relaxed">
          L'intelligence artificielle d'élite qui ne se contente pas de coder,<br className="hidden sm:inline" />
          <span className="text-white font-extrabold border-b-2 border-orange-primary/30 pb-1">elle forge des écosystèmes full-stack complets en quelques secondes.</span>
        </p>

        {/* HIGH-END INTERACTIVE CONTROL DECK */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2 }}
          className="w-full max-w-3xl bg-black/60 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-3xl shadow-[0_45px_100px_rgba(0,0,0,0.8)] mb-12 relative overflow-hidden group"
        >
          {/* Subtle decoration elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-primary/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-orange-primary/15 transition-all duration-700" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-bio/5 rounded-full blur-[50px] pointer-events-none" />

          {/* Core high-tech grid metrics indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between hover:border-orange-primary/20 transition-all duration-300">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Moteur Intelligent</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[11px] font-black font-mono text-white">COOK IA v3.5 Super-Active</span>
              </div>
            </div>
            
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between hover:border-orange-primary/20 transition-all duration-300">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Agents de Synapse</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-primary animate-pulse shadow-[0_0_8px_#ff6b00]" />
                <span className="text-[11px] font-black font-mono text-white">4 EXPERTS CONNECTÉS</span>
              </div>
            </div>

            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between hover:border-orange-primary/20 transition-all duration-300">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Latence Active</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-bio animate-pulse shadow-[0_0_8px_#00f5d4]" />
                <span className="text-[11px] font-black font-mono text-white">35ms (Latence Cache)</span>
              </div>
            </div>
          </div>

          {/* Interactive Custom Prompt Area */}
          <div className="mb-6 relative">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-mono uppercase tracking-widest font-black text-orange-primary flex items-center gap-1.5">
                <Brain size={12} className="animate-pulse text-orange-primary" />
                <span>Rédiger vos instructions de Forge</span>
              </label>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Input Libre</span>
            </div>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: Crée un dashboard d'analytics de crypto-monnaies avec des graphiques en temps réel et un panneau latéral de contrôle..."
              className="w-full min-h-[90px] p-4 bg-black/60 border border-white/10 hover:border-white/20 focus:border-orange-primary/50 focus:ring-1 focus:ring-orange-primary/30 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-600 focus:outline-none transition-all resize-none leading-relaxed font-sans shadow-inner"
            />
          </div>

          {/* Quick Select Preset Templates */}
          <div className="mb-6">
            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold mb-2.5">Outils de Forge Instantanée (Cliquez pour remplir)</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "📊 SaaS Analytics", text: "Un tableau de bord SaaS financier ultra moderne avec graphiques d'analyse interactive et widgets de KPI." },
                { label: "🛍️ Shop Tactile", text: "Un e-commerce sombre de vêtements de luxe incluant panier actif, filtres par catégorie et vue produit." },
                { label: "📂 Portfolio 3D", text: "Un portfolio d'architecte ultra-sleek avec galerie immersive, animations de transition et formulaire de contact." },
                { label: "✓ Task Board", text: "Une application de tableau de gestion de tâches style Agile/Kanban avec listes personnalisées." }
              ].map((template, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCustomPrompt(template.text)}
                  className="p-2 sm:p-2.5 text-left border border-white/5 bg-white/[0.01] hover:bg-white/5 rounded-lg text-[10px] sm:text-xs font-medium text-zinc-400 hover:text-white hover:border-orange-primary/25 transition-all truncate"
                >
                  <span className="text-orange-primary font-bold mr-1.5">{template.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onEnter(customPrompt)}
              className="flex-1 w-full group relative px-8 py-4 sm:py-5 bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_15px_35px_rgba(255,107,0,0.3)] hover:shadow-[0_15px_45px_rgba(255,107,0,0.45)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
            >
              <Zap size={15} className="text-white fill-white animate-pulse" />
              <span>{customPrompt.trim() ? "Forger ce Projet" : "Lancer le Moteur Cook IA"}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setCustomPrompt("Un dashboard SaaS d'analytics financières complet et design");
                scrollToSection('ideas');
              }}
              className="px-8 py-4 sm:py-5 w-full sm:w-auto border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/5 text-zinc-300 hover:text-white font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Démo Interactive</span>
              <ChevronDown size={14} className="opacity-65" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest cursor-pointer mt-4 hover:text-orange-primary transition-all"
          onClick={() => scrollToSection('ideas')}
        >
          <span>Faire défiler pour explorer l'abysse</span>
          <ChevronDown size={14} className="animate-bounce" />
        </motion.div>
      </section>

      {/* IDEAS SECTION: DESIGN FOR THE CORE ENGINE (DEPTH: 100m) */}
      <section id="ideas" className="relative min-h-screen py-32 z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="mb-20 text-center">
          <span className="text-orange-primary font-mono text-sm tracking-[0.5em] uppercase mb-4 block">Profondeur: 100m</span>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight uppercase font-black">VOS IDÉES, MATÉRIALISÉES</h2>
          <p className="max-w-2xl mx-auto mt-6 text-zinc-400 text-lg leading-relaxed">
            Saisissez un concept informel. Notre moteur l'interprète sous tous ses aspects : base de données, logique serveur de routage, et esthétique d'interface haut de gamme.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Layout />, title: "Frontend Visionnaire", desc: "Interfaces fluides basées sur React, TypeScript et Tailwind CSS, construites avec une structure modulaire saine.", delay: 0 },
            { icon: <Terminal />, title: "Logique Full-Stack", desc: "Configuration de serveurs Express.ts réactifs capables d'embarquer des connexions d'APIs tierces.", delay: 0.15 },
            { icon: <Database />, title: "Persistance Avancée", desc: "Intégration d'architectures de persistence comme Firestore et des API de stockage locales.", delay: 0.3 },
            { icon: <Rocket />, title: "Vitesse Éclair", desc: "Génération, linting et tests de compilation intégrés qui s'exécutent en arrière-plan en un instant.", delay: 0.45 }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: feat.delay, duration: 0.8 }}
              className="group relative p-8 rounded-2xl border border-white/5 bg-white/[0.015] backdrop-blur-3xl hover:bg-white/[0.035] transition-all duration-300 hover:border-orange-primary/30 shadow-2xl"
            >
              {/* Corner accent glow indicator */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-orange-primary/5 rounded-bl-full group-hover:bg-orange-primary/20 transition-all duration-500" />
              
              <div className="w-14 h-14 rounded-xl bg-orange-primary/10 flex items-center justify-center text-orange-primary mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,107,0,0.15)]">
                {feat.icon}
              </div>
              <h3 className="font-display text-lg mb-3 group-hover:text-orange-primary transition-colors tracking-wider font-extrabold">{feat.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed font-sans">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HIGHLIGHT: INTERACTIVE PROCESS SIMULATOR FORGE (BETWEEN 100m AND 500m) */}
      <section className="relative min-h-screen py-24 z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-orange-primary/20 bg-orange-primary/5 rounded-full text-[10px] font-bold text-orange-primary uppercase tracking-widest mb-4">
            <Monitor size={12} />
            <span>STUDIO DE GÉNÉRATION SIMULÉ</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight font-black uppercase">LA FORGE COOK IA EN ACTION</h2>
          <p className="max-w-2xl mx-auto mt-4 text-zinc-400 text-sm">
            Cliquez sur l'un des archétypes de projets ci-dessous et observez le flot de développement et l'interface s'architecturer en temps réel :
          </p>
        </div>

        {/* Simulator layout panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Controls & IDE - Left side */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl overflow-hidden min-h-[500px]">
            {/* Tab selector */}
            <div className="flex border-b border-white/5 bg-zinc-900/60 p-2 gap-1.5 overflow-x-auto shrink-0">
              {[
                { id: 'saas', label: 'CRM Analytics', color: 'text-orange-primary' },
                { id: 'ecommerce', label: 'Luxury E-Shop', color: 'text-amber-500' },
                { id: 'portfolio', label: 'Dev Portfolio', color: 'text-purple-neon' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveDemo(t.id as DemoTab)}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 ${activeDemo === t.id ? 'bg-white/10 border-b-2 border-orange-primary text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${activeDemo === t.id ? 'bg-orange-primary' : 'bg-zinc-700'}`} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Prompt bar */}
            <div className="p-4 border-b border-white/5 bg-zinc-950 flex items-center justify-between text-xs gap-4 shrink-0">
              <div className="flex items-center gap-2 text-zinc-400 truncate">
                <span className="font-mono text-orange-primary text-[10px]">{"PROMPT >"}</span>
                <span className="italic truncate font-sans">"{demoTemplates[activeDemo].prompt}"</span>
              </div>
              <div className="flex items-center gap-1 bg-orange-primary/15 text-orange-primary border border-orange-primary/25 text-[9px] font-mono px-2 py-0.5 rounded uppercase">
                <RefreshCw size={10} className="animate-spin" />
                <span>Compiler</span>
              </div>
            </div>

            {/* IDE Workspace body split block: Terminal and Code editors */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 text-[11px] font-mono leading-relaxed overflow-hidden">
              
              {/* Interactive Code Window */}
              <div className="border-r border-white/5 p-4 bg-zinc-950 overflow-y-auto max-h-[350px] md:max-h-[none] scrollbar-hide">
                <div className="text-[10px] text-zinc-500 mb-3 uppercase tracking-widest font-bold flex items-center justify-between">
                  <span>📝 code généré</span>
                  <span className="text-emerald-500 font-bold uppercase text-[9px]">React-TS</span>
                </div>
                <pre className="text-emerald-400/90 whitespace-pre-wrap font-mono leading-loose select-none">
                  <code>{demoCodeText || "// Génération en cours..."}</code>
                </pre>
              </div>

              {/* Streaming Agents Terminal logs */}
              <div className="p-4 bg-black/95 overflow-y-auto max-h-[220px] md:max-h-[none] scrollbar-hide">
                <div className="text-[10px] text-zinc-500 mb-3 uppercase tracking-widest font-bold">
                  <span>🤖 console des agents virtuels</span>
                </div>
                <div className="space-y-4">
                  {demoLogs.map((log, lidx) => (
                    <motion.div
                      key={lidx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-l border-zinc-800 pl-2 py-0.5"
                    >
                      <p className="text-zinc-300 font-mono text-[10.5px] whitespace-pre-wrap">{log}</p>
                    </motion.div>
                  ))}
                  {demoLogs.length < demoTemplates[activeDemo].logs.length && (
                    <div className="flex items-center gap-2 text-orange-primary font-bold animate-pulse text-[10px]">
                      <span className="w-1.5 h-1.5 bg-orange-primary rounded-full animate-ping" />
                      <span>AGENTS EN CONCERTATION SÉCURISÉE...</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Real-time Render Viewport - Right side */}
          <div className="lg:col-span-5 flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 shadow-2xl overflow-hidden min-h-[500px]">
            {/* Header style browser */}
            <div className="bg-slate-950 px-4 py-3 border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="bg-zinc-900/90 rounded-md py-1 px-4 text-[10px] text-zinc-400 font-mono flex items-center gap-2 truncate max-w-[70%]">
                <Lock size={10} className="text-emerald-500" />
                <span className="truncate">https://cook-forge-{activeDemo}.dev</span>
              </div>
              <span className="text-[10px] text-emerald-500 font-mono uppercase bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/20 rounded">LIVE</span>
            </div>

            {/* Simulated Live viewport Container */}
            <div className="flex-1 p-6 flex flex-col justify-center bg-radial-[at_50%_0%] from-slate-950 to-abyssal-blue/40 overflow-y-auto">
              
              <AnimatePresence mode="wait">
                {activeDemo === 'saas' && (
                  <motion.div
                    key="saas-demo"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-950/95 border border-white/10 p-5 rounded-2xl shadow-xl">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <p className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">mrr analytics</p>
                          <motion.p className="text-3xl font-black text-white font-mono">$24,850</motion.p>
                        </div>
                        <span className="text-emerald-400 text-xs font-mono bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/15">+12.4%</span>
                      </div>
                      
                      {/* Interactive Metrics buttons */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/5 border border-white/5 hover:border-orange-primary/30 p-3 rounded-xl transition-all cursor-pointer group">
                          <p className="text-[8px] text-zinc-400 font-mono uppercase">Ventes directes</p>
                          <p className="text-sm font-bold text-white font-mono mt-1">456</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 hover:border-orange-primary/30 p-3 rounded-xl transition-all cursor-pointer group">
                          <p className="text-[8px] text-zinc-400 font-mono uppercase">Taux Conversion</p>
                          <p className="text-sm font-bold text-orange-primary font-mono mt-1">3.14%</p>
                        </div>
                      </div>

                      {/* Spark Chart Graphic simulated using SVG */}
                      <div className="h-28 bg-white/[0.01] border border-white/5 rounded-xl p-3 relative flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
                          </linearGradient>
                          <path d="M0,25 Q15,8 30,19 T60,4 T90,14 T100,5" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" />
                          <path d="M0,25 Q15,8 30,19 T60,4 T90,14 T100,5 L100,30 L0,30 Z" fill="url(#glowGrad)" />
                        </svg>
                        <span className="absolute bottom-2 left-2 text-[8px] font-mono text-zinc-500">JANVIER 2026 - AUJOURD'HUI</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeDemo === 'ecommerce' && (
                  <motion.div
                    key="ecommerce-demo"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl shadow-xl font-serif">
                      <div className="flex justify-between items-center border-b border-stone-800 pb-3 mb-4">
                        <h3 className="text-white text-xs font-mono tracking-widest uppercase">L'HORIZON STUDIO</h3>
                        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/20 text-[10.5px] font-sans font-bold">
                          <ShoppingBag size={12} />
                          <span>Panier ({cartCount})</span>
                        </div>
                      </div>

                      <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-xl flex items-center gap-4">
                        <div className="w-14 h-14 bg-stone-800 rounded-lg flex items-center justify-center text-2xl relative shadow-inner">
                          🏺
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11.5px] text-white font-sans uppercase tracking-wider font-bold truncate">Vase d'Ambre Sculpté</h4>
                          <p className="text-[10px] text-stone-400 font-sans mt-0.5">Édition Artisanale</p>
                          <p className="text-amber-500 text-xs font-sans font-bold mt-1">450 €</p>
                        </div>
                        <button 
                          onClick={() => setCartCount(c => c + 1)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg text-[10px] font-sans font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-950/40 shrink-0"
                        >
                          Ajouter
                        </button>
                      </div>

                      <div className="mt-4 flex justify-between items-center text-[10px] font-sans text-stone-500">
                        <span>LIVRAISON GRATUITE SUR LA SÉLECTION</span>
                        <button onClick={() => setCartCount(0)} className="hover:text-amber-500 underline transition-colors uppercase text-[9px]">vider</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeDemo === 'portfolio' && (
                  <motion.div
                    key="portfolio-demo"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <div className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl shadow-xl font-mono">
                      <div className="mb-4">
                        <p className="text-xs text-white font-bold tracking-tight">ALEXANDRE DUBOIS</p>
                        <p className="text-[9px] text-neutral-500">Product Designer & Developer</p>
                      </div>

                      {/* Interactive Filter Pills */}
                      <div className="flex gap-2 mb-4 text-[9px]">
                        {['all', 'ia', 'web3'].map(category => (
                          <button
                            key={category}
                            onClick={() => setPortfolioFilter(category as 'all' | 'ia' | 'web3')}
                            className={`px-2 py-1 rounded border transition-all ${portfolioFilter === category ? 'border-orange-primary bg-orange-primary/5 text-orange-primary' : 'border-neutral-800 text-neutral-400'}`}
                          >
                            {category.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic grid mapping filtering */}
                      <div className="space-y-2">
                        {[
                          { title: "NeuroPulse Moteur", cat: "ia", desc: "Pipeline IA", icon: "🧠" },
                          { title: "Sovereign Ledger", cat: "web3", desc: "Contrats Solidity", icon: "🔗" }
                        ].filter(p => portfolioFilter === 'all' || p.cat === portfolioFilter).map((proj, idx) => (
                          <motion.div 
                            key={idx} 
                            layout
                            className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between text-[10.5px] hover:border-neutral-700 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span>{proj.icon}</span>
                              <div>
                                <span className="text-white font-bold">{proj.title}</span>
                                <span className="text-[8px] text-orange-primary bg-orange-primary/10 border border-orange-primary/20 px-1 rounded-sm ml-2">{proj.cat.toUpperCase()}</span>
                              </div>
                            </div>
                            <span className="text-neutral-500 text-[9px]">{proj.desc}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </section>

      {/* AGENTS SECTION (DEPTH: 500m) */}
      <section id="agents" className="relative min-h-screen py-32 z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="mb-24 text-center">
          <span className="text-purple-neon font-mono text-sm tracking-[0.5em] uppercase mb-4 block">Profondeur: 500m</span>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight uppercase font-black">L'ORCHESTRE MULTI-AGENTS</h2>
          <p className="max-w-2xl mx-auto mt-6 text-zinc-400 text-lg leading-relaxed">
            Plus qu'un simple éditeur assisté, notre plateforme déploie simultanément **un comité de 4 intelligences virtuelles expertes** qui s'auto-corrigent à chaque itération.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            { icon: <Microscope />, name: "L'Analyste Technique", role: "Sonde votre énoncé brut, définit les technologies cibles appropriées, structure le schéma et prépare le canevas d'exécution.", color: "border-cyan-bio/20 hover:border-cyan-bio/40 text-cyan-bio bg-cyan-bio/5" },
            { icon: <Brain />, name: "Le Planificateur d'Élite", role: "Découpe l'ensemble du projet en étapes algorithmiques progressives pour garantir une construction ordonnée sans bugs résiduels.", color: "border-orange-primary/20 hover:border-orange-primary/40 text-orange-primary bg-orange-primary/5" },
            { icon: <ShieldCheck />, name: "Le Critique de Code", role: "Vérifie méticuleusement chaque variable importée, la documentation de types, et assure un audit de sécurité continu.", color: "border-purple-neon/20 hover:border-purple-neon/40 text-purple-neon bg-purple-neon/5" },
            { icon: <Cpu />, name: "Le Compileur Sandboxed", role: "Vérifie l'intégrité de la syntaxe de compilation locale en temps réel, émulant le comportement du navigateur.", color: "border-emerald-500/20 hover:border-emerald-500/45 text-emerald-400 bg-emerald-500/5" }
          ].map((agent, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`flex items-start gap-6 p-8 rounded-2xl border ${agent.color} transition-all duration-300 shadow-xl shadow-black/10`}
            >
              <div className="w-16 h-16 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/5 relative group-hover:scale-105 transition-transform">
                {agent.icon}
              </div>
              <div>
                <h4 className="font-display text-xl mb-2 text-white font-black tracking-wider uppercase">{agent.name}</h4>
                <p className="text-zinc-400 leading-relaxed text-xs md:text-sm">{agent.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TECH STACK SECTION (DEPTH: 1000m) */}
      <section id="tech" className="relative min-h-screen py-32 z-10 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square border-2 border-dashed border-orange-primary/10 rounded-full animate-[spin_80s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square border border-dashed border-white/10 rounded-full animate-[spin_55s_linear_reverse_infinite]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <span className="text-orange-primary font-mono text-sm tracking-[0.5em] uppercase mb-8 block">Profondeur: 1000m</span>
          <h2 className="font-display text-4xl md:text-7xl mb-12 tracking-widest font-black uppercase">ÉCOSYSTÈME DE PREMIER ORDRE</h2>
          <p className="max-w-2xl mx-auto mb-16 text-zinc-400 text-sm leading-relaxed">
            Pas de langages propriétaires ou de frameworks obscurs. Nous forgeons sur les standards éprouvés de la tech mondiale pour que votre code vous appartienne entièrement.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "React 18", "TypeScript", "Node.js", "Express.ts", "Supabase", 
              "Firestore", "Tailwind CSS", "Vite", "Gemini 2.5 Flash", 
              "Framer Motion", "ESLint", "PostCSS", "HTML5 Canvas"
            ].map((tech, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-xs font-bold tracking-widest hover:border-orange-primary hover:text-orange-primary hover:scale-105 transition-all text-zinc-300 shadow-xl"
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHT STATS SECTION (DEPTH: 1500m) */}
      <section id="stats" className="relative py-28 z-10 max-w-7xl mx-auto px-6 border-y border-white/5">
        <div className="text-center mb-16">
          <span className="text-cyan-bio font-mono text-[11px] tracking-[0.5em] uppercase mb-4 block">Profondeur: 1500m</span>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight font-black uppercase">QUALITÉ DE PRODUCTION CERTIFIÉE</h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {[
            { metric: "14,230+", title: "PROJETS FORGÉS", desc: "Du site SaaS aux vitrines élégantes." },
            { metric: "12.4s", title: "M-TIME GÉNÉRATION", desc: "Compilation multi-agent quasi-instantanée." },
            { metric: "100%", title: "PERSISTANCE SÉCURISÉE", desc: "Clés API privées stockées localement de bout en bout." },
            { metric: "99.9%", title: "TAUX DISPONIBILITÉ", desc: "Infrastructures Cloud optimisées en permanence." }
          ].map((stat, idx) => (
            <div key={idx} className="bg-black/40 border border-white/5 p-8 rounded-2xl flex flex-col justify-between hover:border-orange-primary/20 transition-all duration-300">
              <span className="text-3xl md:text-4xl font-mono font-black text-orange-primary mb-4 block tracking-tighter">{stat.metric}</span>
              <div>
                <h5 className="font-display text-xs text-white uppercase tracking-widest font-bold mb-2">{stat.title}</h5>
                <p className="text-[11px] text-zinc-500 leading-normal font-sans">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY & LIVE COOKIE CONSOLE AUDIT (DEPTH: 1750m) */}
      <section id="security-cookies" className="relative py-32 z-10 max-w-7xl mx-auto px-6 border-b border-white/5">
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-orange-primary/5 to-transparent blur-[120px] pointer-events-none" />
        
        <div className="text-center mb-20">
          <span className="text-orange-primary font-mono text-sm tracking-[0.5em] uppercase mb-4 block">Profondeur: 1750m</span>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight uppercase font-black">SÉCURITÉ SANS CONCESSION & AUDIT SUR MESURE</h2>
          <p className="max-w-2xl mx-auto mt-6 text-zinc-400 text-sm leading-relaxed">
            Pour protéger votre code et optimiser le site en continu, COOK IA intègre un système d'audit intelligent. Nous lisons uniquement les paramètres autorisés de votre navigateur pour maximiser la réactivité du sandbox.
          </p>
        </div>

        {/* 2-Col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          
          {/* Column A: Testimonials & Trust */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-amber-500 text-lg">★★★★★</span>
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">ÉVALUATIONS DES FONDATEURS</span>
              </div>
              
              <h3 className="font-display text-2xl font-black uppercase tracking-wider mb-8">CE QUE LES DÉVELOPPEURS DE L'ÉLITE DISENT :</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Guillaume R.",
                    company: "SaaS Maker",
                    quote: "L'enregistrement en temps réel synchronisé avec Supabase rend l'outil incroyablement rapide. La politique de confidentialité est transparente !",
                    avatar: "👨‍💻"
                  },
                  {
                    name: "Émilie L.",
                    company: "Studio Web",
                    quote: "Le fait de pouvoir contrôler les cookies d'interface et d'avoir un audit complet de la latence m'a convaincue de forger mes projets ici.",
                    avatar: "👩‍💻"
                  }
                ].map((testimonial, tIndex) => (
                  <div key={tIndex} className="p-6 bg-zinc-950/80 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-orange-primary/20 transition-all duration-300">
                    <p className="text-zinc-400 text-xs italic leading-relaxed mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{testimonial.avatar}</span>
                      <div>
                        <h5 className="font-bold text-xs text-white uppercase tracking-wider">{testimonial.name}</h5>
                        <p className="text-[9px] text-zinc-500 font-mono">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supabase security card */}
            <div className="p-6 bg-orange-primary/5 border border-orange-primary/25 rounded-2xl flex items-center gap-4 mt-4">
              <div className="w-12 h-12 bg-orange-primary/10 border border-orange-primary/20 flex items-center justify-center text-orange-primary shrink-0 rounded-xl">
                <Database size={24} />
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-xs font-black uppercase tracking-wider text-orange-primary">CRÉATION CONFIDENTIELLE SÉCURISÉE</h4>
                <p className="text-[11px] text-zinc-300 mt-1">Vos créations sont gardées privées au moyen de la politique RLS de Supabase. Personne d'autre ne peut inspecteur votre écosystème.</p>
              </div>
            </div>
          </div>

          {/* Column B: Cookies Trigger audit */}
          <div className="p-8 rounded-3xl border border-white/10 bg-[#090C12]/90 backdrop-blur-3xl shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-primary/10 rounded-full blur-[30px] pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-primary animate-ping" />
                  <span className="text-[9px] font-mono text-orange-primary font-bold uppercase tracking-widest">MODULE SÉCURISÉ ACTIF</span>
                </div>
                <span className="text-[9px] bg-white/5 border border-white/5 px-2.5 py-1 rounded text-zinc-400 font-mono font-bold">COOK CONSOLE v2</span>
              </div>

              <h4 className="font-display text-2xl font-black uppercase tracking-widest leading-snug">
                CONTRÔLEZ LES COMPOSANTS SÉCURISÉS DU COOKIE SHIELD
              </h4>
              
              <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                Accédez instantanément aux propriétés détectées par votre propre navigateur pour optimiser l'utilisation de la console de construction d'interfaces. Vous pouvez activer ou désactiver les jetons de session Supabase en un clic.
              </p>

              <div className="p-5 bg-black/50 border border-white/5 rounded-xl space-y-3 font-mono text-[10.5px]">
                <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                  <span className="text-zinc-500 uppercase font-black">Transmission :</span>
                  <span className="text-emerald-400 font-bold uppercase">🔐 SSL / HTTPS ACTIF</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                  <span className="text-zinc-500 uppercase font-black">Stockage Supabase :</span>
                  <span className="text-orange-primary font-bold uppercase">✓ ISOLEMENT UTILISATEUR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 uppercase font-black">COOKIES OPTIONNELS :</span>
                  <span className="text-zinc-400">À personnaliser</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('trigger-cookie-guard'))}
                className="w-full text-center px-6 py-4 bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sliders size={14} />
                <span>Lancer l'Audit Navigateur & Cookies</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* WHY COOK IA? (DEPTH: 2000m) */}
      <section id="why" className="relative min-h-screen py-32 z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-orange-primary font-mono text-sm tracking-[0.5em] uppercase mb-4 block">Profondeur: 2000m</span>
            <h2 className="font-display text-4xl md:text-6xl mb-6 tracking-widest font-black leading-tight uppercase">POURQUOI CHOISIR COOK IA ?</h2>
            <p className="text-zinc-400 text-sm md:text-base mb-10 leading-relaxed font-sans">
              Traditionnellement, créer une application full-stack prend des semaines, voire des mois de mise au point. Avec Cook IA, nous condensons et ordonnons ce processus à quelques minutes, sans compromettre la flexibilité ou l'architecture de votre code réactif.
            </p>
            
            <div className="space-y-4">
              {[
                "Code source premium modulaire indexé par des experts",
                "Gestionnaire et sandbox de linting en continu",
                "Intégration d'agents intelligents autonomes en temps réel",
                "Fichiers exportables formatés de manière standard",
                "Mises en ligne assistées de haute performance"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full border border-orange-primary/30 flex items-center justify-center text-orange-primary bg-orange-primary/5 group-hover:bg-orange-primary group-hover:text-black transition-all font-bold">
                    <CheckCircle2 size={13} />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right graphics dashboard container */}
          <div className="relative">
            <div className="absolute inset-0 bg-orange-primary/10 blur-[130px] rounded-full" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative z-10 p-10 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-orange-primary/10 border border-orange-primary/20 flex items-center justify-center text-orange-primary">
                  <Cpu size={24} />
                </div>
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-black font-mono">rendement opérationnel</div>
                  <div className="text-lg font-display font-black tracking-widest uppercase">EFFICACITÉ CERTIFIÉE</div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2 font-bold tracking-widest uppercase">
                    <span>VITESSE DE FABRICATION</span>
                    <span className="text-orange-primary">98.4% PLUS RAPIDE</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "98.4%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                      className="h-full bg-orange-primary shadow-[0_0_15px_rgba(255,107,0,0.6)]" 
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-2 font-bold tracking-widest uppercase">
                    <span>COHÉRENCE & TYPE SAFETY</span>
                    <span className="text-cyan-bio">100% PRÉCISION</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 2.2, ease: "easeOut" }}
                      className="h-full bg-cyan-bio shadow-[0_0_15px_rgba(0,245,212,0.6)]" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA (DEPTH: BOTTOM) */}
      <section id="cta" className="relative h-screen flex flex-col items-center justify-center z-10 overflow-hidden px-6">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[180%] h-[50%] bg-radial-[at_50%_100%] from-orange-primary/10 via-transparent to-transparent blur-[140px] pointer-events-none" />
        
        <motion.div
           initial={{ opacity: 0, y: 60 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8 }}
           className="text-center relative z-10 max-w-4xl"
        >
          <Sparkles className="text-orange-primary mb-8 mx-auto animate-pulse" size={54} />
          <h2 className="font-display text-4xl sm:text-6xl md:text-[6.5rem] mb-12 tracking-widest leading-none font-black uppercase">
            VOTRE AVENTURE<br/>
            <span className="text-orange-primary">COMMENCE ICI.</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={() => onEnter()}
              className="group relative px-10 py-5 bg-orange-primary hover:bg-orange-600 active:scale-95 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_15px_40px_rgba(255,107,0,0.25)] flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <span>Lancer Cook IA</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <a 
              href="https://discord.gg/Pc6reuApRF"
              target="_blank"
              rel="noreferrer"
              className="px-10 py-5 border border-white/10 hover:border-white/25 hover:bg-white/5 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all bg-black/40 backdrop-blur-xl flex items-center justify-center gap-2 w-full sm:w-auto text-zinc-300 hover:text-white"
            >
              <span>Rejoindre Discord</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 border-t border-white/5 bg-black/35 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="w-8 h-8 bg-orange-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.3)]">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="font-display font-black text-md tracking-widest uppercase">COOK IA</span>
          </div>
          
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-cookie-guard'))} 
              className="hover:text-orange-primary transition-colors cursor-pointer"
            >
              Confidentialité & Cookies
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-cookie-guard'))} 
              className="hover:text-orange-primary transition-colors cursor-pointer font-extrabold text-orange-primary"
            >
              [ Audit Navigateur ]
            </button>
            <a href="#" className="hover:text-orange-primary transition-colors">Conditions</a>
            <a href="https://discord.gg/Pc6reuApRF" target="_blank" rel="noreferrer" className="hover:text-orange-primary transition-colors">Support</a>
          </div>

          <p className="text-zinc-600 text-[10px] font-bold tracking-widest uppercase text-center md:text-right">
            © 2026 COOK IA — CRÉÉ DE MANIÈRE PREMIUM — TOUS DROITS RÉSERVÉS
          </p>
        </div>
      </footer>

      {/* Mobile Floating CTA Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button
          onClick={() => onEnter(customPrompt)}
          className="px-5 py-3.5 bg-orange-primary hover:bg-orange-600 rounded-full text-white text-[11px] font-display font-black uppercase tracking-widest shadow-[0_10px_25px_rgba(255,107,0,0.5)] flex items-center gap-2 border border-white/10 active:scale-95 transition-transform"
        >
          <Zap size={13} className="text-white fill-white animate-pulse" />
          <span>Lancer Cook IA</span>
        </button>
      </div>
    </div>
  );
};
