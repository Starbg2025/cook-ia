import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'motion/react';
import { Shield, Check, ChevronRight, Lock, Loader2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface AntiBotProps {
  onVerify: () => void;
  isOpen: boolean;
}

export const AntiBot: React.FC<AntiBotProps> = ({ onVerify, isOpen }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Calculate the width of the track for the slider
  const [trackWidth, setTrackWidth] = useState(0);
  const sliderWidth = 60; // Width of the handle

  useEffect(() => {
    if (containerRef.current) {
      setTrackWidth(containerRef.current.offsetWidth - sliderWidth - 8); // 8 for padding
    }
  }, [isOpen]);

  const opacity = useTransform(x, [0, trackWidth * 0.5], [1, 0]);
  const bgOpacity = useTransform(x, [0, trackWidth], [0.05, 0.2]);

  const handleDragEnd = async () => {
    if (x.get() > trackWidth * 0.9) {
      setIsVerifying(true);
      setError(null);
      
      try {
        // 1. Get reCAPTCHA token
        const token = await new Promise<string>((resolve, reject) => {
          if (!window.grecaptcha) {
            reject(new Error("reCAPTCHA not loaded"));
            return;
          }
          window.grecaptcha.ready(() => {
            window.grecaptcha.execute('6LccYIMsAAAAAO0N3ZdaIzmKe8ObtTCWzIzk4vH8', { action: 'verify' })
              .then(resolve)
              .catch(reject);
          });
        });

        // 2. Verify with backend
        const response = await fetch('/api/verify-captcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.success) {
          setIsVerified(true);
          controls.start({ x: trackWidth });
          setTimeout(() => {
            onVerify();
            setTimeout(() => {
              setIsVerified(false);
              setIsVerifying(false);
              x.set(0);
            }, 500);
          }, 800);
        } else {
          throw new Error(data.message || "Verification failed");
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(err.message || "Une erreur est survenue");
        controls.start({ x: 0 });
        setIsVerifying(false);
      }
    } else {
      controls.start({ x: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-primary/10 flex items-center justify-center">
            <Shield className="text-orange-primary" size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">VÉRIFICATION HUMAINE</h2>
            <p className="text-sm text-white/40 leading-relaxed">
              Veuillez confirmer que vous êtes un humain pour continuer.
            </p>
          </div>
        </div>

        <div 
          ref={containerRef}
          className={`relative h-16 bg-white/5 rounded-2xl border border-white/5 p-1 flex items-center overflow-hidden ${isVerifying ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <motion.div 
            style={{ opacity: bgOpacity }}
            className="absolute inset-0 bg-orange-primary"
          />
          
          <motion.div 
            style={{ opacity }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/20">
              {isVerifying ? "Vérification..." : "Glisser pour vérifier"}
            </span>
          </motion.div>

          <motion.div
            drag={isVerifying ? false : "x"}
            dragConstraints={{ left: 0, right: trackWidth }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            animate={controls}
            style={{ x }}
            className={`relative z-10 w-[60px] h-full rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors ${
              isVerified ? 'bg-green-500' : isVerifying ? 'bg-orange-primary/50' : 'bg-white text-black'
            }`}
          >
            {isVerified ? (
              <Check size={24} className="text-white" />
            ) : isVerifying ? (
              <Loader2 size={24} className="text-white animate-spin" />
            ) : (
              <ChevronRight size={24} />
            )}
          </motion.div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 justify-center text-red-500 text-[10px] font-bold uppercase tracking-wider"
          >
            <AlertCircle size={12} />
            {error}
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase tracking-widest font-bold">
          <Lock size={10} />
          <span>Sécurisé par COOK IA Anti-Bot</span>
        </div>
      </motion.div>
    </div>
  );
};
