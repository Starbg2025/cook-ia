import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
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
  CheckCircle2, 
  ArrowRight, 
  Monitor, 
  RefreshCw, 
  Sliders, 
  Lock, 
  ShoppingBag, 
  ExternalLink,
  ChevronRight,
  Code
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { translations, Language } from '../translations';
import { cinematicSpaceTemplate } from '../data/cinematicSpaceTemplate';

interface Perspective3DCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const Perspective3DCard: React.FC<Perspective3DCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'rgba(255,107,0,0.15)' 
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    const rX = (mouseY / (height / 2)) * -6; 
    const rY = (mouseX / (width / 2)) * 6;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: mouseXSpring,
        rotateY: mouseYSpring,
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 40%)`,
        }}
      />
      {children}
    </motion.div>
  );
};

interface FadingVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FadingVideo: React.FC<FadingVideoProps> = ({ src, className = '', style = {} }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsLoaded(true);
    };

    video.addEventListener('playing', handlePlay);
    video.addEventListener('loadeddata', handlePlay);

    video.play().then(() => {
      setIsLoaded(true);
    }).catch(e => {
      console.log("Autoplay video preview state:", e);
      setIsLoaded(true);
    });

    return () => {
      video.removeEventListener('playing', handlePlay);
      video.removeEventListener('loadeddata', handlePlay);
    };
  }, [src]);

  return (
    <motion.video
      ref={videoRef}
      src={src}
      className={className}
      style={{ ...style, pointerEvents: 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      muted
      playsInline
      autoPlay
      loop
      preload="auto"
    />
  );
};

interface BlurTextProps {
  text: string;
}

export const BlurText: React.FC<BlurTextProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 150);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { threshold: 0.1 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const words = text.split(" ");

  return (
    <div 
      ref={containerRef}
      className="flex flex-wrap justify-center gap-y-1"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={isVisible ? {
            filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
            opacity: [0, 0.5, 1],
            y: [50, -5, 0]
          } : {}}
          transition={isVisible ? {
            duration: 0.7,
            times: [0, 0.5, 1],
            ease: "easeOut",
            delay: (i * 50) / 1000
          } : {}}
          className="inline-block mr-[0.28em]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

interface LandingPageProps {
  onEnter: (prompt?: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
  onLoadTemplate?: (code: string, promptText: string) => void;
}

type DemoTab = 'saas' | 'ecommerce' | 'portfolio';

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, lang, setLang, onLoadTemplate }) => {
  const t = translations[lang];
  const containerRef = useRef<HTMLDivElement>(null);

  // States for live telemetry simulation
  const [activeUsersCount, setActiveUsersCount] = useState(14);
  const [latence, setLatence] = useState(12);
  const [sitesCount, setSitesCount] = useState(12480);
  const [activeDepth, setActiveDepth] = useState<string>('0m');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Handle active depth tracking on scrolling
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const scrollPos = target.scrollTop || window.scrollY || document.documentElement.scrollTop;
      const height = window.innerHeight || 800;
      
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

    window.addEventListener('scroll', handleScroll, { capture: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, []);

  // Telemetry simulators
  useEffect(() => {
    const intervalUsers = setInterval(() => {
      setActiveUsersCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const next = prev + change;
        return next > 4 ? (next < 25 ? next : 24) : 5;
      });
    }, 4500);

    const intervalLatency = setInterval(() => {
      setLatence(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        const next = prev + change;
        return next > 5 ? (next < 20 ? next : 19) : 6;
      });
    }, 3000);

    const intervalSites = setInterval(() => {
      setSitesCount(prev => prev + (Math.random() > 0.4 ? 1 : 0));
    }, 7000);

    return () => {
      clearInterval(intervalUsers);
      clearInterval(intervalLatency);
      clearInterval(intervalSites);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
import { LineChart, DollarSign, ArrowUpRight } from 'lucide-react';

export default function SaasDashboard() {
  const [metric, setMetric] = useState('MRR');
  return (
    <div className="p-6 bg-slate-950 text-white rounded-3xl border border-white/10">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Finances</h3>
        <LineChart className="text-orange-primary" />
      </div>
      <div className="mt-4 text-3xl font-mono">$24,850</div>
    </div>
  );
}`,
      logs: [
        "🔍 Analyste : Lu et interprété le prompt SaaS Dashboard.",
        "📋 Planificateur : Découpage en 3 tâches (UI layout, graphiques Recharts, sélecteurs temporels).",
        "⚙️ Compileur : Génération de /src/components/SaasDashboard.tsx",
        "🛡️ Critique : Analyse de sécurité validée avec 0 alertes.",
        "🚀 Moteur : Émulateur local démarré sur le port 3000."
      ]
    },
    ecommerce: {
      prompt: "Forger un site e-commerce de design d'intérieur sombre avec panier d'achat interactif",
      code: `// cook-ia-forge/luxury-shop.tsx
import React, { useState } from 'react';
import { ShoppingBag, Star } from 'lucide-react';

export default function InteriorShop() {
  const [cart, setCart] = useState([]);
  return (
    <div className="p-6 bg-stone-950 text-white rounded-3xl border border-stone-800">
      <header className="flex justify-between items-center border-b border-stone-800 pb-3">
        <span className="font-serif tracking-widest text-xs">L'HORIZON</span>
        <div className="text-[11px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded">
          Panier ({cart.length})
        </div>
      </header>
    </div>
  );
}`,
      logs: [
        "🔍 Analyste : Lu et interprété le prompt Luxury E-Commerce.",
        "📋 Planificateur : Création de la grille de produits et du panier réactif.",
        "⚙️ Compileur : Écriture de /src/components/EcomShop.tsx",
        "🛡️ Critique : Vérification de la persistance locale du panier.",
        "🚀 Moteur : Assemblage et rendu dans le Sandbox."
      ]
    },
    portfolio: {
      prompt: "Forger un portfolio de designer 3D élégant avec filtrage interactif de projets",
      code: `// cook-ia-forge/portfolio.tsx
import React, { useState } from 'react';
import { Filter, Eye } from 'lucide-react';

export default function DesignerPortfolio() {
  const [filter, setFilter] = useState('all');
  return (
    <div className="p-6 bg-neutral-950 text-white rounded-3xl border border-neutral-800">
      <h2 className="text-lg font-mono">ALEXANDRE DUBOIS</h2>
      <p className="text-[10px] text-zinc-500">Curateur Digital</p>
    </div>
  );
}`,
      logs: [
        "🔍 Analyste : Lu et interprété le prompt Dev Portfolio.",
        "📋 Planificateur : Configuration du système de filtrage dynamique.",
        "⚙️ Compileur : Création de /src/components/Portfolio.tsx",
        "🛡️ Critique : Audit d'accessibilité et de contraste d'éléments validé.",
        "🚀 Moteur : Déploiement simulé du portfolio."
      ]
    }
  };

  // Run simulated development flow on tab change
  useEffect(() => {
    setDemoStep(0);
    setDemoCodeText('');
    setDemoLogs([]);
    
    let timer1 = setTimeout(() => {
      setDemoLogs(prev => [...prev, demoTemplates[activeDemo].logs[0]]);
      setDemoCodeText(demoTemplates[activeDemo].code.substring(0, 120) + "...");
    }, 400);

    let timer2 = setTimeout(() => {
      setDemoLogs(prev => [...prev, demoTemplates[activeDemo].logs[1]]);
      setDemoCodeText(demoTemplates[activeDemo].code.substring(0, 240) + "...");
    }, 1200);

    let timer3 = setTimeout(() => {
      setDemoLogs(prev => [...prev, demoTemplates[activeDemo].logs[2], demoTemplates[activeDemo].logs[3]]);
      setDemoCodeText(demoTemplates[activeDemo].code.substring(0, 400) + "...");
    }, 2200);

    let timer4 = setTimeout(() => {
      setDemoLogs(prev => [...prev, demoTemplates[activeDemo].logs[4]]);
      setDemoCodeText(demoTemplates[activeDemo].code);
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [activeDemo]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-[#030308] text-white font-body selection:bg-orange-primary/30 selection:text-white">
      
      {/* Background Gradients and Stars overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-radial-[at_50%_15%] from-[#150f35]/25 via-transparent to-black pointer-events-none" />
        <div className="absolute top-[-30%] left-1/4 w-[180%] h-[180%] bg-radial-[at_50%_0%] from-orange-primary/5 via-transparent to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-radial-[at_50%_50%] from-cyan-bio/5 via-transparent to-transparent blur-[120px]" />
      </div>

      {/* Noise dust effect */}
      <div className="fixed inset-0 z-1 pointer-events-none opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* STICKY SIDEBAR DEPTH INDICATOR */}
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

      {/* NAVIGATION BAR */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/10 bg-black/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-primary to-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.4)]">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg tracking-widest text-white leading-none">COOK IA</span>
              <span className="text-[8px] font-black uppercase text-orange-primary font-mono tracking-widest mt-0.5">Elite Multi-Agent</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => scrollToSection('ideas')} className="text-xs font-bold uppercase tracking-widest text-white/55 hover:text-orange-primary transition-colors cursor-pointer">
              {lang === 'fr' ? "Concept" : "Concept"}
            </button>
            <button onClick={() => scrollToSection('agents')} className="text-xs font-bold uppercase tracking-widest text-white/55 hover:text-orange-primary transition-colors cursor-pointer">
              {lang === 'fr' ? "Équipe d'Agents" : "Agent Suite"}
            </button>
            <button onClick={() => scrollToSection('tech')} className="text-xs font-bold uppercase tracking-widest text-white/55 hover:text-orange-primary transition-colors cursor-pointer">
              {lang === 'fr' ? "Tech" : "Tech Stack"}
            </button>
            <button onClick={() => scrollToSection('stats')} className="text-xs font-bold uppercase tracking-widest text-white/55 hover:text-orange-primary transition-colors cursor-pointer">
              {lang === 'fr' ? "Garanties" : "Guarantees"}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5" id="lang-switcher">
              <button 
                onClick={() => setLang('fr')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'fr' ? 'bg-orange-primary text-white shadow-md font-extrabold' : 'text-white/60 hover:text-white cursor-pointer'}`}
              >
                FR
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-orange-primary text-white shadow-md font-extrabold' : 'text-white/60 hover:text-white cursor-pointer'}`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={() => onEnter()}
              className="group relative px-6 py-3 rounded-xl bg-white/5 hover:bg-orange-primary hover:text-white text-white text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-transparent transition-all hover:scale-105 cursor-pointer"
            >
              {lang === 'fr' ? "Lancer la Console" : "Launch Console"}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center z-10 px-6 pt-36 pb-20 overflow-hidden">
        
        {/* Beautiful Fading looping video as backdrop */}
        <div className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-20">
          <FadingVideo 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
            className="w-full h-full object-cover"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 relative z-10 animate-pulse"
        >
          <div className="absolute inset-x-0 -top-4 bottom-0 bg-orange-primary rounded-full blur-[110px] opacity-25" />
          <div className="w-20 h-20 bg-gradient-to-tr from-orange-primary to-amber-500 rounded-3xl flex items-center justify-center shadow-[0_0_80px_rgba(255,107,0,0.4)] relative z-10">
            <Zap size={36} className="text-white fill-white" />
          </div>
        </motion.div>

        {/* Brand visual tags */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-widest mb-6 backdrop-blur-3xl text-orange-primary font-mono shadow-xl shadow-black/20 z-10">
          <Sparkles size={10} className="animate-spin text-orange-primary" />
          <span>{t.tagline}</span>
        </div>

        <h1 className="font-heading italic text-5xl sm:text-7xl md:text-[5.5rem] text-center tracking-[-2px] leading-[0.95] max-w-4xl mb-6 text-white z-10">
          <BlurText text={lang === 'fr' ? "Façonnez l'extraordinaire d'un simple prompt" : "Forge extraordinary websites from a single prompt"} />
        </h1>

        <p className="max-w-2xl text-center text-sm sm:text-base text-white/70 font-light mb-12 px-2 leading-relaxed z-10 font-body">
          {t.heroDesc}
        </p>

        {/* HIGH-END INTERACTIVE CONTROL DECK IN 3D PERSPECTIVE */}
        <Perspective3DCard className="w-full max-w-3xl mb-12 group z-10" glowColor="rgba(255,107,0,0.3)">
          <div className="w-full bg-gradient-to-b from-slate-950/95 to-black/98 border border-white/10 hover:border-orange-primary/45 p-6 sm:p-8 rounded-3xl backdrop-blur-3xl relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 left-0 w-32 h-32 bg-orange-primary/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-orange-primary/15 transition-all duration-700" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-bio/5 rounded-full blur-[50px] pointer-events-none" />

            {/* Core high-tech grid metrics indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 relative z-10">
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between hover:border-orange-primary/25 transition-all duration-300">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                  {lang === 'fr' ? "Moteur Intelligent" : "AI Core Engine"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-[11px] font-black font-mono text-white">COOK IA v3.5 Super-Active</span>
                </div>
              </div>
              
              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between hover:border-orange-primary/25 transition-all duration-300">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                  {lang === 'fr' ? "Agents de Synapse" : "Synaptic Agents"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-primary animate-pulse shadow-[0_0_8px_#ff5a00]" />
                  <span className="text-[11px] font-black font-mono text-white">{activeUsersCount} {t.agentsConnected}</span>
                </div>
              </div>

              <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col justify-between hover:border-orange-primary/25 transition-all duration-300">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                  {lang === 'fr' ? "Latence Active" : "Active Latency"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-bio animate-pulse shadow-[0_0_8px_#00f3ff]" />
                  <span className="text-[11px] font-black font-mono text-white">{latence}ms ({t.activeLatency})</span>
                </div>
              </div>
            </div>

            {/* Interactive Custom Prompt Area */}
            <div className="mb-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono uppercase tracking-widest font-black text-orange-primary flex items-center gap-1.5">
                  <Brain size={12} className="animate-pulse text-orange-primary" />
                  <span>{lang === 'fr' ? "Rédiger vos instructions de Forge" : "Write your forge instructions"}</span>
                </label>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">{lang === 'fr' ? "Entrée Libre" : "Free Input"}</span>
              </div>

              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={t.placeholderInput}
                className="w-full min-h-[90px] p-4 bg-black/60 border border-white/10 hover:border-white/25 focus:border-orange-primary/50 focus:ring-1 focus:ring-orange-primary/30 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all resize-none leading-relaxed font-sans shadow-inner"
              />
            </div>

            {/* Quick Select Preset Templates */}
            <div className="mb-6 relative z-10">
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-extrabold mb-3">
                {lang === 'fr' ? "🚀 Outils de Forge Instantanée (Cliquez pour remplir)" : "🚀 Instant Forge Presets (Click to fill)"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { 
                    label: "📊 SaaS Analytics", 
                    text: lang === 'fr' 
                       ? "Un tableau de bord SaaS financier ultra moderne avec graphiques d'analyse interactive et widgets de KPI." 
                       : "A ultra-modern financial SaaS dashboard with interactive analytics and KPI widgets." 
                  },
                  { 
                    label: "🛍️ Shop Tactile", 
                    text: lang === 'fr' 
                       ? "Un e-commerce sombre de vêtements de luxe incluant panier actif, filtres par catégorie et vue produit." 
                       : "A luxurious dark e-commerce marketplace featuring shopping cart, filters, and product views." 
                  },
                  { 
                    label: "📂 Portfolio 3D", 
                    text: lang === 'fr' 
                       ? "Un portfolio d'architecte ultra-sleek avec galerie immersive, animations de transition et formulaire de contact." 
                       : "An ultra-sleek design architect portfolio with immersive layout, transition animations, and contact forms." 
                  },
                  { 
                    label: "✓ Task Board", 
                    text: lang === 'fr' 
                       ? "Une application de tableau de gestion de tâches style Agile/Kanban avec listes personnalisées." 
                       : "An interactive Kanban style task management agile index flow with customizable lists." 
                  }
                ].map((template, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCustomPrompt(template.text)}
                    className="px-3 py-3 text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] rounded-xl text-[10px] sm:text-xs font-semibold text-zinc-300 hover:text-white hover:border-orange-primary/30 transition-all truncate cursor-pointer shadow-sm shadow-black/35"
                  >
                    <span className="text-orange-primary font-extrabold mr-1.5">{template.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action buttons */}
            <div className="flex flex-col xl:flex-row items-center gap-3 relative z-10 w-full">
              <button
                onClick={() => onEnter(customPrompt)}
                className="flex-1 w-full group relative px-6 py-4 sm:py-5 bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_15px_35px_rgba(255,107,0,0.3)] hover:shadow-[0_15px_45px_rgba(255,107,0,0.45)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Zap size={15} className="text-white fill-white animate-pulse" />
                <span>{customPrompt.trim() ? t.forgeBtn : t.launchCookIA}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setCustomPrompt(lang === 'fr' ? "Un dashboard SaaS d'analytics financières complet et design" : "A complete financial SaaS analytics dashboard with premium layout");
                  scrollToSection('ideas');
                }}
                className="px-6 py-4 sm:py-5 w-full xl:w-auto border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/5 text-zinc-300 hover:text-white font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === 'fr' ? "Démo Interactive" : "Interactive Demo"}</span>
                <ChevronDown size={14} className="opacity-65" />
              </button>

              {onLoadTemplate && (
                <button
                  onClick={() => {
                    onLoadTemplate(
                      cinematicSpaceTemplate,
                      lang === 'fr'
                        ? "Construis une landing page cinématique d'exploration spatiale avec défilement fluide, verre liquide et fondu enchaîné de vidéos d'arrière-plan."
                        : "Build Prompt: Cinematic Space-Travel Landing Page\nBuild a single-page landing site with two full-height sections (Hero + Capabilities), both using looping background videos with custom JS crossfade, a shared liquid-glass design system, and Framer Motion entrance animations."
                    );
                  }}
                  className="px-6 py-4 sm:py-5 w-full xl:w-auto border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 hover:text-white font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{lang === 'fr' ? "Démo Spatiale Cinématique ✨" : "Cinematic Space Demo ✨"}</span>
                </button>
              )}
            </div>
          </div>
        </Perspective3DCard>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest cursor-pointer mt-4 hover:text-orange-primary transition-all pb-8 z-10"
          onClick={() => scrollToSection('ideas')}
        >
          <span>{lang === 'fr' ? "Faire défiler pour explorer l'abysse" : "Scroll to explore the abyss"}</span>
          <ChevronDown size={14} className="animate-bounce" />
        </motion.div>
      </section>

      {/* IDEAS SECTION */}
      <section id="ideas" className="relative py-32 z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="mb-20 text-center">
          <span className="text-orange-primary font-mono text-xs tracking-[0.5em] uppercase mb-4 block font-black">Profondeur: 100m</span>
          <h2 className="font-heading italic text-4xl md:text-6xl tracking-tight max-w-4xl mx-auto text-white leading-tight">VOS IDÉES, MATÉRIALISÉES</h2>
          <p className="max-w-2xl mx-auto mt-6 text-zinc-400 text-sm leading-relaxed font-body font-light">
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
              className="group relative p-8 rounded-2xl border border-white/5 bg-gradient-to-b from-slate-950 to-neutral-950/40 backdrop-blur-3xl hover:bg-slate-900/40 transition-all duration-300 hover:border-orange-primary/20 shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-orange-primary/5 rounded-bl-full group-hover:bg-orange-primary/20 transition-all duration-500" />
              
              <div className="w-14 h-14 rounded-xl bg-orange-primary/10 flex items-center justify-center text-orange-primary mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,107,0,0.15)]">
                {feat.icon}
              </div>
              <h3 className="font-display text-sm mb-3 group-hover:text-orange-primary transition-colors tracking-wider font-bold uppercase text-white">{feat.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed font-body font-light">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE PROCESS SIMULATOR FORGE */}
      <section className="relative py-24 z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-orange-primary/20 bg-orange-primary/5 rounded-full text-[10px] font-bold text-orange-primary uppercase tracking-widest mb-4 font-mono">
            <Monitor size={12} className="text-orange-primary" />
            <span>STUDIO DE GÉNÉRATION SIMULÉ</span>
          </div>
          <h2 className="font-heading italic text-4xl md:text-6xl tracking-tight text-white leading-tight">LA FORGE COOK IA EN ACTION</h2>
          <p className="max-w-2xl mx-auto mt-4 text-zinc-400 text-sm font-body font-light leading-relaxed">
            Cliquez sur l'un des archétypes de projets ci-dessous et observez le flot de développement et l'interface s'architecturer en temps réel :
          </p>
        </div>

        {/* Simulator layout panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Controls & IDE - Left side */}
          <Perspective3DCard className="lg:col-span-7 flex flex-col shadow-2xl rounded-2xl overflow-hidden" glowColor="rgba(255,90,0,0.15)">
            <div className="w-full flex-1 flex flex-col border border-white/10 bg-gradient-to-b from-zinc-950 to-[#0c0d0f]">
              {/* Tab selector */}
              <div className="flex border-b border-white/5 bg-[#121316]/80 p-2 gap-1.5 overflow-x-auto shrink-0 scrollbar-hide">
                {[
                  { id: 'saas', label: 'CRM Analytics', color: 'text-orange-primary' },
                  { id: 'ecommerce', label: 'Luxury E-Shop', color: 'text-amber-500' },
                  { id: 'portfolio', label: 'Dev Portfolio', color: 'text-purple-neon' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveDemo(t.id as DemoTab)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 cursor-pointer ${activeDemo === t.id ? 'bg-white/10 border-b-2 border-orange-primary text-white shadow-sm' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeDemo === t.id ? 'bg-orange-primary' : 'bg-zinc-700'}`} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Prompt bar */}
              <div className="p-4 border-b border-white/5 bg-zinc-950 flex items-center justify-between text-xs gap-4 shrink-0">
                <div className="flex items-center gap-2 text-zinc-400 truncate">
                  <span className="font-mono text-orange-primary font-bold text-[10px]">{"PROMPT_INPUT >"}</span>
                  <span className="italic truncate font-sans text-zinc-300">"{demoTemplates[activeDemo].prompt}"</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-primary/10 text-orange-primary border border-orange-primary/20 text-[9px] font-mono px-2.5 py-1 rounded uppercase font-black">
                  <RefreshCw size={10} className="animate-spin text-orange-primary" />
                  <span>Compiler</span>
                </div>
              </div>

              {/* IDE Workspace body split block: Terminal and Code editors */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 text-[11px] font-mono leading-relaxed overflow-hidden">
                
                {/* Interactive Code Window */}
                <div className="border-r border-white/5 p-4 bg-zinc-950 overflow-y-auto max-h-[350px] md:max-h-[none] scrollbar-hide">
                  <div className="text-[10px] text-zinc-500 mb-3 uppercase tracking-widest font-black flex items-center justify-between">
                    <span>📝 code généré</span>
                    <span className="text-emerald-400 font-bold uppercase text-[9px]">React-TS</span>
                  </div>
                  <pre className="text-emerald-400/90 whitespace-pre-wrap font-mono leading-loose select-none">
                    <code>{demoCodeText || "// Génération en cours..."}</code>
                  </pre>
                </div>

                {/* Streaming Agents Terminal logs */}
                <div className="p-4 bg-[#07080a] overflow-y-auto max-h-[220px] md:max-h-[none] scrollbar-hide">
                  <div className="text-[10px] text-zinc-500 mb-3 uppercase tracking-widest font-black">
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
                        <p className="text-zinc-400 font-mono text-[10.5px] whitespace-pre-wrap leading-relaxed">{log}</p>
                      </motion.div>
                    ))}
                    {demoLogs.length < demoTemplates[activeDemo].logs.length && (
                      <div className="flex items-center gap-2 text-orange-primary/95 font-black animate-pulse text-[10px] tracking-wide mt-2">
                        <span className="w-1.5 h-1.5 bg-orange-primary rounded-full animate-ping" />
                        <span>AGENTS EN CONCERTATION SÉCURISÉE...</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </Perspective3DCard>

          {/* Real-time Render Viewport - Right side */}
          <Perspective3DCard className="lg:col-span-5 flex flex-col shadow-2xl rounded-2xl overflow-hidden" glowColor="rgba(0,195,255,0.15)">
            <div className="w-full flex-1 flex flex-col border border-white/10 bg-gradient-to-b from-slate-900/40 to-black/65 min-h-[360px] justify-between">
              {/* Header style browser */}
              <div className="bg-zinc-950 px-4 py-3.5 border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="bg-zinc-900/95 border border-white/5 rounded-lg py-1 px-4 text-[10px] text-zinc-400 font-mono flex items-center gap-2 truncate max-w-[70%]">
                  <Lock size={10} className="text-emerald-500" />
                  <span className="truncate">https://cook-forge-{activeDemo}.dev</span>
                </div>
                <span className="text-[9px] text-emerald-500 font-mono font-extrabold uppercase bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/25 rounded-md">LIVE</span>
              </div>

              {/* Simulated Live viewport Container */}
              <div className="flex-1 p-6 flex flex-col justify-center bg-gradient-to-b from-slate-950 to-neutral-950/90 overflow-y-auto">
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
                      <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl shadow-xl">
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
          </Perspective3DCard>

        </div>
      </section>

      {/* AGENTS SECTION */}
      <section id="agents" className="relative py-32 z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="mb-24 text-center">
          <span className="text-orange-primary font-mono text-xs tracking-[0.5em] uppercase mb-4 block font-black">Profondeur: 500m</span>
          <h2 className="font-heading italic text-4xl md:text-6xl tracking-tight text-white max-w-4xl mx-auto leading-tight">L'ORCHESTRE MULTI-AGENTS</h2>
          <p className="max-w-2xl mx-auto mt-6 text-zinc-400 text-sm font-body font-light leading-relaxed">
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
              className={`flex items-start gap-6 p-8 rounded-2xl border ${agent.color} bg-[#0b0c0f]/90 hover:bg-[#121318]/90 transition-all duration-300 shadow-xl shadow-black/40`}
            >
              <div className="w-16 h-16 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/5 relative group-hover:scale-105 transition-transform">
                {agent.icon}
              </div>
              <div>
                <h4 className="font-display text-sm mb-2 text-white font-bold tracking-wider uppercase">{agent.name}</h4>
                <p className="text-zinc-400 leading-relaxed text-xs md:text-sm font-body font-light">{agent.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TECH STACK SECTION */}
      <section id="tech" className="relative py-32 z-10 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square border-2 border-dashed border-orange-primary/10 rounded-full animate-[spin_80s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square border border-dashed border-white/10 rounded-full animate-[spin_55s_linear_reverse_infinite]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <span className="text-orange-primary font-mono text-xs tracking-[0.5em] uppercase mb-8 block font-black">Profondeur: 1000m</span>
          <h2 className="font-heading italic text-4xl md:text-7xl mb-12 tracking-tight text-white leading-tight">ÉCOSYSTÈME DE PREMIER ORDRE</h2>
          <p className="max-w-2xl mx-auto mb-16 text-zinc-400 text-sm leading-relaxed font-body font-light">
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
                className="px-6 py-3.5 rounded-xl border border-white/5 bg-gradient-to-b from-zinc-950 to-[#0e1013] text-xs font-bold tracking-widest hover:border-orange-primary hover:text-orange-primary hover:scale-105 transition-all text-zinc-350 shadow-xl cursor-pointer"
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section id="stats" className="relative py-28 z-10 max-w-7xl mx-auto px-6 border-y border-white/5">
        <div className="text-center mb-16">
          <span className="text-orange-primary font-mono text-xs tracking-[0.5em] uppercase mb-4 block font-black">Profondeur: 1500m</span>
          <h2 className="font-heading italic text-4xl md:text-6xl tracking-tight text-white leading-tight">QUALITÉ DE PRODUCTION CERTIFIÉE</h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {[
            { metric: `${sitesCount.toLocaleString()}`, title: "PROJETS FORGÉS", desc: "Du site SaaS aux vitrines élégantes." },
            { metric: "12.4s", title: "M-TIME GÉNÉRATION", desc: "Compilation multi-agent quasi-instantanée." },
            { metric: "100%", title: "PERSISTANCE SÉCURISÉE", desc: "Clés API privées stockées localement de bout en bout." },
            { metric: "99.9%", title: "TAUX DISPONIBILITÉ", desc: "Infrastructures Cloud optimisées en permanence." }
          ].map((stat, idx) => (
            <div key={idx} className="bg-gradient-to-b from-zinc-950 to-[#0a0c0f] border border-white/5 p-8 rounded-2xl flex flex-col justify-between hover:border-orange-primary/20 hover:shadow-[0_10px_35px_rgba(255,107,0,0.05)] transition-all duration-350 shadow-lg">
              <span className="text-3xl md:text-5xl font-mono font-black text-orange-primary mb-4 block tracking-tighter filter drop-shadow-[0_4px_8px_rgba(255,107,0,0.15)]">{stat.metric}</span>
              <div>
                <h5 className="font-display text-xs text-white uppercase tracking-widest font-bold mb-2">{stat.title}</h5>
                <p className="text-[11px] text-zinc-500 leading-normal font-sans">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY & LIVE COOKIE CONSOLE AUDIT */}
      <section id="security-cookies" className="relative py-32 z-10 max-w-7xl mx-auto px-6 border-b border-white/5">
        <div className="absolute inset-0 bg-radial-[at_50%_50%] from-orange-primary/5 to-transparent blur-[120px] pointer-events-none" />
        
        <div className="text-center mb-20">
          <span className="text-orange-primary font-mono text-xs tracking-[0.5em] uppercase mb-4 block font-black">Profondeur: 1750m</span>
          <h2 className="font-heading italic text-4xl md:text-6xl tracking-tight text-white leading-tight">SÉCURITÉ SANS CONCESSION & AUDIT SUR MESURE</h2>
          <p className="max-w-2xl mx-auto mt-6 text-zinc-400 text-sm leading-relaxed font-body font-light">
            Pour protéger votre code et optimiser le site en continu, COOK IA intègre un système d'audit intelligent. Nous lisons uniquement les paramètres autorisés de votre navigateur pour maximiser la réactivité du sandbox.
          </p>
        </div>

        {/* 2-Col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          
          {/* Column A: Testimonials & Trust */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-amber-500 text-sm">★★★★★</span>
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase font-black">ÉVALUATIONS DES FONDATEURS</span>
              </div>
              
              <h3 className="font-heading italic text-2xl md:text-4xl text-white mb-8 leading-tight">CE QUE LES DÉVELOPPEURS DE L'ÉLITE DISENT :</h3>
              
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
                  <div key={tIndex} className="p-6 bg-gradient-to-b from-[#0e1014] to-black/80 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-orange-primary/20 transition-all duration-300">
                    <p className="text-zinc-400 text-xs italic leading-relaxed mb-4 font-sans">"{testimonial.quote}"</p>
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
            <div className="p-6 bg-orange-primary/5 border border-orange-primary/25 rounded-2xl flex items-center gap-4 mt-6">
              <div className="w-12 h-12 bg-orange-primary/10 border border-orange-primary/20 flex items-center justify-center text-orange-primary shrink-0 rounded-xl">
                <Database size={24} />
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-xs font-black uppercase tracking-wider text-orange-primary">CRÉATION CONFIDENTIELLE SÉCURISÉE</h4>
                <p className="text-[11px] text-zinc-300 mt-1 font-sans">Vos créations sont gardées privées au moyen de la politique RLS de Supabase. Personne d'autre ne peut inspecter votre écosystème.</p>
              </div>
            </div>
          </div>

          {/* Column B: Cookies Trigger audit */}
          <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-[#090C12]/95 to-black/95 backdrop-blur-3xl shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-primary/10 rounded-full blur-[30px] pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-primary animate-ping" />
                  <span className="text-[9px] font-mono text-orange-primary font-bold uppercase tracking-widest">MODULE SÉCURISÉ ACTIF</span>
                </div>
                <span className="text-[9px] bg-white/5 border border-white/5 px-2.5 py-1 rounded text-zinc-400 font-mono font-bold">COOK CONSOLE v2</span>
              </div>

              <h4 className="font-heading italic text-2xl md:text-3xl text-white leading-tight">
                CONTRÔLEZ LES COMPOSANTS SÉCURISÉS DU COOKIE SHIELD
              </h4>
              
              <p className="text-zinc-400 text-xs leading-relaxed font-sans font-light">
                Accédez instantanément aux propriétés détectées par votre propre navigateur pour optimiser l'utilisation de la console de construction d'interfaces. Vous pouvez activer ou désactiver les jetons de session Supabase en un clic.
              </p>

              <div className="p-5 bg-black/50 border border-white/5 rounded-xl space-y-3 font-mono text-[10.5px]">
                <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                  <span className="text-zinc-500 uppercase font-black">Transmission :</span>
                  <span className="text-emerald-400 font-bold uppercase">🔐 SSL / HTTPS ACTIF</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                  <span className="text-zinc-500 uppercase font-black">Stockage Supabase :</span>
                  <span className="text-orange-primary font-bold uppercase font-mono">✓ ISOLEMENT UTILISATEUR</span>
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

      {/* WHY COOK IA? */}
      <section id="why" className="relative py-32 z-10 max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-orange-primary font-mono text-xs tracking-[0.5em] uppercase mb-4 block font-black">Profondeur: 2000m</span>
            <h2 className="font-heading italic text-4xl md:text-6xl text-white mb-6 leading-tight">POURQUOI CHOISIR COOK IA ?</h2>
            <p className="text-zinc-400 text-sm md:text-base mb-10 leading-relaxed font-body font-light">
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
                  <div className="w-6 h-6 rounded-full border border-orange-primary/30 flex items-center justify-center text-orange-primary bg-orange-primary/5 group-hover:bg-orange-primary group-hover:text-black transition-all font-bold cursor-pointer">
                    <CheckCircle2 size={13} />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-zinc-300 font-sans">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right graphics dashboard container */}
          <div className="relative">
            <div className="absolute inset-0 bg-orange-primary/10 blur-[130px] rounded-full pointer-events-none" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative z-10 p-10 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-950 to-[#0b0c10] backdrop-blur-3xl shadow-2xl"
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

      {/* FINAL CTA */}
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
          <h2 className="font-heading italic text-5xl sm:text-7xl md:text-[6.5rem] mb-12 tracking-tight leading-none text-white leading-tight">
            VOTRE AVENTURE<br/>
            <span className="text-orange-primary filter drop-shadow-[0_4px_15px_rgba(255,107,0,0.35)]">COMMENCE ICI.</span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button 
              onClick={() => onEnter()}
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-600 hover:to-amber-500 active:scale-95 text-white font-display font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_15px_40px_rgba(255,107,0,0.35)] flex items-center justify-center gap-3 w-full sm:w-auto cursor-pointer"
            >
              <span>Lancer Cook IA</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <a 
              href="https://discord.gg/Pc6reuApRF"
              target="_blank"
              rel="noreferrer"
              className="px-10 py-5 border border-white/10 hover:border-white/25 hover:bg-white/5 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all bg-black/40 backdrop-blur-xl flex items-center justify-center gap-2 w-full sm:w-auto text-zinc-300 hover:text-white cursor-pointer"
            >
              <span>Rejoindre Discord</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-16 border-t border-white/5 bg-black/45 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="w-8 h-8 bg-orange-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.3)]">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="font-display font-black text-md tracking-widest uppercase text-white">COOK IA</span>
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
            <a href="#" className="hover:text-orange-primary transition-colors cursor-pointer">Conditions</a>
            <a href="https://discord.gg/Pc6reuApRF" target="_blank" rel="noreferrer" className="hover:text-orange-primary transition-colors cursor-pointer">Support</a>
          </div>

          <p className="text-zinc-550 text-[10px] font-bold tracking-widest uppercase text-center md:text-right">
            © 2026 COOK IA — CRÉÉ DE MANIÈRE PREMIUM — TOUS DROITS RÉSERVÉS
          </p>
        </div>
      </footer>

      {/* Mobile Floating CTA Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button
          onClick={() => onEnter(customPrompt)}
          className="px-5 py-3.5 bg-orange-primary hover:bg-orange-600 rounded-full text-white text-[11px] font-display font-black uppercase tracking-widest shadow-[0_10px_25px_rgba(255,107,0,0.5)] flex items-center gap-2 border border-white/10 active:scale-95 transition-transform cursor-pointer"
        >
          <Zap size={13} className="text-white fill-white animate-pulse" />
          <span>Lancer Cook IA</span>
        </button>
      </div>
    </div>
  );
};
