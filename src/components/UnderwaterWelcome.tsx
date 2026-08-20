import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, ChevronDown, Cpu, Layers, ShieldCheck } from 'lucide-react';

interface UnderwaterWelcomeProps {
  isDark: boolean;
  onStart?: () => void;
}

export const UnderwaterWelcome: React.FC<UnderwaterWelcomeProps> = ({ isDark, onStart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let particles: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height + canvas.height,
          size: Math.random() * 2.5 + 1,
          speed: Math.random() * 0.4 + 0.15,
          opacity: Math.random() * 0.4 + 0.1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw subtle particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 107, 0, ${p.opacity * 0.8})`;
        ctx.fill();
        
        p.y -= p.speed;
        p.x += Math.sin(p.y / 60) * 0.4;

        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrame = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#080B11]">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none opacity-30"
      />
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-radial-[at_50%_20%] from-orange-primary/10 via-[#080B11]/80 to-[#080B11] opacity-90" />

      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-6 relative">
          <div className="absolute inset-0 bg-orange-primary rounded-2xl blur-xl opacity-30 animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-tr from-orange-primary to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
            <Zap size={36} className="text-white fill-white" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/70 text-xs font-semibold mb-4 backdrop-blur-md">
          <Sparkles size={13} className="text-orange-primary" />
          <span>Cook IA 3.5 Ultimate Edition</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black mb-4 text-white tracking-tight leading-tight">
          L'ingénierie Web par <span className="bg-gradient-to-r from-orange-primary to-amber-400 bg-clip-text text-transparent">Intelligence Artificielle</span>
        </h1>

        <p className="text-white/60 text-sm sm:text-base font-normal mb-8 max-w-lg leading-relaxed">
          Générez des plateformes web réactives, complètes avec backend, base de données Supabase et déploiement instantané.
        </p>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-2 max-w-md">
            {[
              { label: "React 18", icon: Layers },
              { label: "Express API", icon: Cpu },
              { label: "Supabase DB", icon: ShieldCheck },
              { label: "Tailwind CSS", icon: Sparkles }
            ].map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-white/60 text-[11px] font-medium backdrop-blur-sm">
                  <Icon size={12} className="text-orange-primary" />
                  <span>{tech.label}</span>
                </div>
              );
            })}
          </div>

          <motion.div 
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-1.5 text-orange-primary/80 mt-4"
          >
            <span className="text-[11px] font-bold tracking-wider uppercase">Décrivez votre projet ci-dessous</span>
            <ChevronDown size={18} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
