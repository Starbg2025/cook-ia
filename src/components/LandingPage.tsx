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
  ArrowRight
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundValue = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    [
      "radial-gradient(circle at 50% 0%, #041e3a 0%, #020b18 70%)", 
      "radial-gradient(circle at 50% 0%, #020b18 0%, #01050a 100%)", 
      "radial-gradient(circle at 50% 0%, #01050a 0%, #000a0f 100%)",
      "radial-gradient(circle at 50% 100%, #001219 0%, #000000 100%)"
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

    for(let i=0; i<60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height + canvas.height,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 0.8 + 0.3,
        sway: Math.random() * 2,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += Math.sin(p.y / 50) * 0.8;
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

  return (
    <div ref={containerRef} className="relative min-h-[700vh] overflow-hidden bg-abyssal-deep text-white font-sans selection:bg-cyan-bio selection:text-black">
      {/* Dynamic Background */}
      <motion.div 
        style={{ background: backgroundValue }}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Volumetric Rays */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-15 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 w-[300%] h-[300%] origin-top -translate-x-1/2 animate-[spin_40s_linear_infinite]"
             style={{ background: 'conic-gradient(from 180deg at 50% 0%, transparent 0%, rgba(0, 245, 212, 0.15) 180deg, transparent 360deg)', filter: 'blur(120px)' }} />
      </div>

      {/* Bubble Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-1 pointer-events-none opacity-30" />

      {/* Custom Cursor */}
      <div 
        className="fixed w-12 h-12 border border-cyan-bio/20 rounded-full z-50 pointer-events-none bg-radial-[at_30%_30%] from-white/5 to-transparent backdrop-blur-[1px] hidden md:block"
        style={{ left: cursorPos.x, top: cursorPos.y, transform: 'translate(-50%, -50%)', transition: 'transform 0.15s cubic-bezier(0.23, 1, 0.32, 1)' }}
      />

      {/* Floating Noise */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-bio rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,245,212,0.5)]">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <span className="font-display font-black text-xl tracking-tighter text-white">COOK IA</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#vision" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-cyan-bio transition-colors">Vision</a>
          <a href="#agents" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-cyan-bio transition-colors">Experts</a>
          <a href="#tech" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-cyan-bio transition-colors">Tech</a>
        </div>
        <button 
          onClick={onEnter}
          className="group relative px-6 py-2.5 rounded-full bg-cyan-bio text-black text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,245,212,0.3)]"
        >
          Lancer l'IA
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen flex flex-col items-center justify-center z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-12 relative"
        >
          <div className="absolute inset-0 bg-cyan-bio rounded-full blur-[100px] opacity-20 animate-pulse" />
          <div className="w-36 h-36 bg-cyan-bio rounded-[48px] flex items-center justify-center shadow-[0_0_100px_rgba(0,245,212,0.5)] relative z-10">
            <Zap size={72} className="text-white fill-white" />
          </div>
        </motion.div>

        <h1 className="font-display text-7xl md:text-[10rem] mb-6 text-center tracking-tighter leading-none relative">
          {["C","O","O","K"," ","I","A"].map((char, i) => (
            <motion.span 
              key={i}
              className="inline-block"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>

        <p className="max-w-3xl text-center text-xl md:text-3xl text-cyan-bio/80 font-medium mb-16 px-4 leading-normal font-sans">
          L'intelligence artificielle qui ne se contente pas de coder,<br/>
          <span className="text-white">elle forge des écosystèmes complets.</span>
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <button 
            onClick={onEnter}
            className="group relative px-12 py-6 bg-gradient-to-r from-cyan-bio to-[#00f5d4] rounded-2xl font-display font-black text-base md:text-lg text-black uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(0,245,212,0.4)] hover:shadow-[0_0_80px_rgba(0,245,212,0.6)] transition-all hover:-translate-y-1 active:scale-95"
          >
            Commencer l'immersion
          </button>
          <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest">
            <span>Scroll pour explorer l'abysse</span>
            <ChevronDown size={14} className="animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION (DEPTH: 100m) */}
      <section className="relative min-h-screen py-32 z-10 max-w-7xl mx-auto px-6">
        <div className="mb-24 text-center">
          <span className="text-cyan-bio font-mono text-sm tracking-[0.5em] uppercase mb-4 block">Profondeur: 100m</span>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight">VOS IDÉES, MATÉRIALISÉES</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Layout />, title: "Frontend Visionnaire", desc: "Interfaces ultra-fluides basées sur React et Tailwind CSS, optimisées pour la performance.", delay: 0 },
            { icon: <Terminal />, title: "Full-Stack Logic", desc: "Génération de backends Express robustes avec gestion intelligente des routes et APIs.", delay: 0.2 },
            { icon: <Database />, title: "Persistence Abyssale", desc: "Intégration native de Supabase et Firestore pour une scalabilité infinie.", delay: 0.4 },
            { icon: <Rocket />, title: "Déploiement Cloud", desc: "Mise en ligne instantanée sur Netlify, Vercel ou Cloud Run en un clic.", delay: 0.6 }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: feat.delay, duration: 0.8 }}
              className="group relative p-10 rounded-[48px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl hover:bg-white/[0.05] transition-all hover:border-cyan-bio/20"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-bio/10 flex items-center justify-center text-cyan-bio mb-10 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,245,212,0.1)]">
                {feat.icon}
              </div>
              <h3 className="font-display text-xl mb-4 group-hover:text-cyan-bio transition-colors">{feat.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed font-sans">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AGENTS SECTION (DEPTH: 500m) */}
      <section id="agents" className="relative min-h-screen py-32 z-10 max-w-7xl mx-auto px-6">
        <div className="mb-24 text-center">
          <span className="text-purple-neon font-mono text-sm tracking-[0.5em] uppercase mb-4 block">Profondeur: 500m</span>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight">LE SYSTÈME MULTI-AGENTS</h2>
          <p className="max-w-2xl mx-auto mt-6 text-white/50 text-lg">Plus qu'une simple IA, Cook IA déploie une équipe d'experts virtuels pour chaque projet.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {[
            { icon: <Microscope />, name: "L'Analyste", role: "Analyse votre demande, extrait les besoins techniques et définit l'architecture optimale.", color: "cyan" },
            { icon: <ShieldCheck />, name: "Le Critique", role: "Examine chaque ligne de code pour détecter d'éventuels bugs ou failles de sécurité avant le déploiement.", color: "purple" },
            { icon: <Brain />, name: "Le Planificateur", role: "Organise les étapes de développement de manière logique pour une construction cohérente.", color: "blue" },
            { icon: <Cpu />, name: "Le Testeur", role: "Simule des interactions utilisateurs pour garantir que l'application finale est parfaitement fonctionnelle.", color: "green" }
          ].map((agent, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-8 p-10 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent"
            >
              <div className={`w-20 h-20 shrink-0 rounded-[28px] bg-white/5 flex items-center justify-center text-white/80 overflow-hidden relative group`}>
                <div className="absolute inset-0 bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                {agent.icon}
              </div>
              <div>
                <h4 className="font-display text-2xl mb-3 text-white">{agent.name}</h4>
                <p className="text-white/40 leading-relaxed text-sm md:text-base">{agent.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TECH STACK SECTION (DEPTH: 1000m) */}
      <section id="tech" className="relative min-h-screen py-32 z-10 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square border-2 border-dashed border-cyan-bio/20 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square border border-dashed border-white/10 rounded-full animate-[spin_40s_linear_reverse_infinite]" />
        </div>

        <div className="relative z-10 text-center px-6">
          <span className="text-cyan-bio font-mono text-sm tracking-[0.5em] uppercase mb-8 block">Profondeur: 1000m</span>
          <h2 className="font-display text-5xl md:text-8xl mb-16 tracking-tighter">TECH STACK MODERNE</h2>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {["React 18", "TypeScript", "Node.js", "Express", "Supabase", "Firestore", "Tailwind CSS", "Vite", "Gemini 1.5 Pro", "Framer Motion"].map((tech, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-bold tracking-wider hover:border-cyan-bio hover:text-cyan-bio transition-colors"
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY COOK IA? (DEPTH: 2000m) */}
      <section className="relative min-h-screen py-32 z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="text-cyan-bio font-mono text-sm tracking-[0.5em] uppercase mb-4 block">Profondeur: 2000m</span>
            <h2 className="font-display text-5xl md:text-7xl mb-8 tracking-tighter leading-tight">POURQUOI CHOISIR COOK IA ?</h2>
            <p className="text-white/60 text-lg mb-12 leading-relaxed">
              Traditionnellement, créer une application full-stack prend des semaines, voire des mois. Avec Cook IA, nous avons réduit ce processus à quelques minutes, sans compromettre la qualité du code ou la flexibilité.
            </p>
            <div className="space-y-6">
              {[
                "Code source 100% éditable et accessible",
                "Déploiement en un clic sur des infrastructures Cloud",
                "Gestion automatique des bases de données",
                "Support multi-langages et frameworks modernes",
                "Génération infinie sans limites de créativité"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full border border-soft-neon flex items-center justify-center text-soft-neon group-hover:bg-soft-neon group-hover:text-black transition-all">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-sm font-medium text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 bg-cyan-bio/20 blur-[120px] rounded-full animate-pulse" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="relative z-10 p-12 rounded-[60px] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-full bg-cyan-bio flex items-center justify-center">
                  <Cpu size={24} className="text-black" />
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Performance</div>
                  <div className="text-xl font-display">GÉNÉRATION INSTANTANÉE</div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "98%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-cyan-bio shadow-[0_0_15px_rgba(0,245,212,0.8)]" 
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-white/40">
                  <span>VITESSE DE CODAGE</span>
                  <span className="text-cyan-bio">98.4% PLUS RAPIDE</span>
                </div>
                
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                    className="h-full bg-purple-neon shadow-[0_0_15px_rgba(188,19,254,0.8)]" 
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-white/40">
                  <span>PRÉCISION DE L'IA</span>
                  <span className="text-purple-neon">100% OPTIMISÉ</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA (DEPTH: BOTTOM) */}
      <section className="relative h-screen flex flex-col items-center justify-center z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[60%] bg-radial-[at_50%_100%] from-cyan-bio/10 to-transparent blur-[150px] pointer-events-none" />
        
        <motion.div
           initial={{ opacity: 0, y: 100 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center relative z-10 px-6"
        >
          <Sparkles className="text-cyan-bio mb-12 mx-auto animate-pulse" size={64} />
          <h2 className="font-display text-6xl md:text-[8rem] mb-12 tracking-tighter leading-none">VOTRE AVENTURE<br/><span className="text-cyan-bio">COMMENCE ICI.</span></h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button 
              onClick={onEnter}
              className="group relative px-20 py-8 bg-white text-black font-display font-black text-xl uppercase tracking-[0.2em] rounded-3xl hover:bg-cyan-bio hover:scale-105 transition-all shadow-[0_0_80px_rgba(255,255,255,0.15)] flex items-center gap-4"
            >
              <span>Lancer Cook IA</span>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <a 
              href="https://discord.gg/Pc6reuApRF"
              target="_blank"
              rel="noreferrer"
              className="px-12 py-8 border border-white/10 hover:border-white/20 rounded-3xl font-display font-black text-lg uppercase tracking-[0.2em] transition-all bg-white/5 backdrop-blur-xl"
            >
              Rejoindre Discord
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 py-16 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-bio rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="font-display font-black text-lg tracking-tighter">COOK IA</span>
          </div>
          
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-white/30">
            <a href="#" className="hover:text-cyan-bio transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-bio transition-colors">Terms</a>
            <a href="https://discord.gg/Pc6reuApRF" className="hover:text-cyan-bio transition-colors">Support</a>
          </div>

          <p className="text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase">
            © 2026 COOK IA — CRÉÉ PAR BENIT MADIMBA — TOUS DROITS RÉSERVÉS
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
