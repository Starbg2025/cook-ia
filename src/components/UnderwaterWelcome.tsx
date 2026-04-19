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
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-abyssal-deep">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none opacity-40"
      />
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-radial-[at_50%_0%] from-abyssal-blue via-abyssal-deep to-abyssal-deep opacity-80" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-4"
      >
        <div className="w-24 h-24 mb-12 relative">
          <div className="absolute inset-0 bg-cyan-bio rounded-3xl blur-2xl opacity-20 animate-pulse" />
          <div className="relative w-full h-full bg-cyan-bio rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(0,245,212,0.3)]">
            <Zap size={48} className="text-white fill-white" />
          </div>
        </div>

        <h1 className="font-display text-5xl md:text-7xl mb-6 text-white tracking-tighter">
          {"COOK IA".split('').map((char, i) => (
            <motion.span 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
              className="inline-block hover:text-cyan-bio transition-colors cursor-default"
              style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="max-w-xl text-lg md:text-xl text-cyan-bio/80 font-medium mb-12 leading-relaxed"
        >
          Créez des applications web full stack magnifiques en quelques minutes grâce à l'IA.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 2, duration: 1 }}
           className="flex flex-col items-center gap-8"
        >
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-2 rounded-full border border-cyan-bio/20 bg-cyan-bio/5 text-cyan-bio text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              Frontend
            </div>
            <div className="px-6 py-2 rounded-full border border-purple-neon/20 bg-purple-neon/5 text-purple-neon text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              Backend
            </div>
            <div className="px-6 py-2 rounded-full border border-cyan-bio/20 bg-cyan-bio/5 text-cyan-bio text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
              Déploiement
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-white/40 animate-bounce mt-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Posez votre question ci-dessous</span>
            <ChevronDown size={16} />
          </div>
        </motion.div>
      </motion.div>

      {/* Underwater Rays effect with pure CSS as fallback/overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="light-ray" style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          width: '2px',
          height: '1000px',
          background: 'linear-gradient(to bottom, var(--color-cyan-bio), transparent)',
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
