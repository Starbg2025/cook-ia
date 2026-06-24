import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, ChevronDown } from 'lucide-react';

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
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height + canvas.height,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Bubbles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 245, 212, ${p.opacity})`;
        ctx.fill();
        
        p.y -= p.speed;
        p.x += Math.sin(p.y / 50) * 0.5;

        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
      });

      // Draw volumetric rays (subtle)
      const gradient = ctx.createConicGradient(Math.PI, canvas.width / 2, 0);
      gradient.addColorStop(0.4, 'transparent');
      gradient.addColorStop(0.5, 'rgba(0, 245, 212, 0.03)');
      gradient.addColorStop(0.6, 'transparent');
      
      ctx.save();
      ctx.translate(canvas.width / 2, 0);
      ctx.rotate(Math.sin(Date.now() / 2000) * 0.1);
      ctx.translate(-canvas.width / 2, 0);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

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
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#150f35] via-[#040409] to-[#040409] text-white">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none opacity-20"
      />
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-radial-[at_50%_0%] from-[#0b1a2f]/40 via-[#040409] to-[#040409] opacity-85" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-2xl"
      >
        <div className="w-20 h-20 mb-10 relative">
          <div className="absolute inset-0 bg-orange-primary rounded-2xl blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-full h-full bg-orange-primary rounded-2xl flex items-center justify-center shadow-2xl">
            <Zap size={40} className="text-white fill-white" />
          </div>
        </div>

        <h1 className="font-display text-4xl md:text-6xl mb-6 text-white tracking-tighter uppercase font-black">
          COOK IA <span className="text-orange-primary">V.3</span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl font-medium mb-10 leading-relaxed">
          Propulsez vos idées web dans une nouvelle dimension. <br className="hidden md:block" />
          Génération full-stack ultra-performante par IA.
        </p>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-3">
            {["React 18", "Next.js", "Express", "Supabase"].map((tech) => (
              <div key={tech} className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                {tech}
              </div>
            ))}
          </div>

          <motion.div 
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-orange-primary/60 mt-8"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Décrivez votre projet ci-dessous</span>
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </motion.div>


      {/* Underwater Rays effect with pure CSS as fallback/overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="light-ray" style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          width: '2px',
          height: '1000px',
          background: 'linear-gradient(to bottom, var(--color-orange-primary), transparent)',
          transform: 'rotate(20deg)',
          filter: 'blur(10px)',
          animation: 'rayMove 10s infinite alternate'
        }} />
      </div>

      <style>{`
        @keyframes rayMove {
          from { transform: translateX(-100px) rotate(15deg); }
          to { transform: translateX(100px) rotate(25deg); }
        }
      `}</style>
    </div>
  );
};
