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
  const [isChecked, setIsChecked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
  useEffect(() => {
    // Try to load reCAPTCHA script if not present
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement('script');
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleCheck = async () => {
    if (isVerifying || isVerified) return;
    
    setIsChecked(true);
    setIsVerifying(true);
    setError(null);
    
    try {
      console.log("Starting verification...");
      
      let token = "";
      const siteKey = "66LdtZYMsAAAAAKR_2XRgGvNTs2eey2xFSteprQ1U";
      
      if (!isFallbackMode) {
        try {
          // 1. Get reCAPTCHA token
          token = await new Promise<string>((resolve, reject) => {
            let attempts = 0;
            const checkInterval = setInterval(() => {
              if (window.grecaptcha) {
                clearInterval(checkInterval);
                
                // For v2 Checkbox, we might need to render it or use a hidden one
                // But since we have a custom UI, we'll try to use the invisible approach if the key allows it
                // or prompt for fallback if it's strictly v2 checkbox
                window.grecaptcha.ready(() => {
                  try {
                    // Try v3 style first, if it fails or if it's v2, we'll handle it
                    window.grecaptcha.execute(siteKey, { action: 'verify' })
                      .then(resolve)
                      .catch((err: any) => {
                        console.warn("v3 execution failed, trying v2 fallback", err);
                        // If it's a v2 key, execute might not work this way
                        reject(err);
                      });
                  } catch (e) {
                    reject(e);
                  }
                });
              } else {
                attempts++;
                if (attempts > 30) {
                  clearInterval(checkInterval);
                  reject(new Error("Timeout"));
                }
              }
            }, 100);
          });
        } catch (e) {
          console.warn("reCAPTCHA verification failed, switching to fallback mode");
          setIsFallbackMode(true);
          setIsVerifying(false);
          setIsChecked(false);
          return;
        }
      } else {
        // Fallback mode: simple delay to simulate "human" interaction
        await new Promise(resolve => setTimeout(resolve, 1500));
        token = "fallback_token_" + Math.random().toString(36).substring(7);
      }

      // 2. Verify with backend
      const response = await fetch('/api/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, isFallback: isFallbackMode })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON but got:", text);
        throw new Error("Le serveur a renvoyé une réponse invalide (non-JSON).");
      }

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        setTimeout(() => {
          onVerify();
          setTimeout(() => {
            setIsVerified(false);
            setIsVerifying(false);
            setIsChecked(false);
          }, 500);
        }, 1000);
      } else {
        throw new Error(data.message || "Verification failed");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Une erreur est survenue");
      setIsVerifying(false);
      setIsChecked(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] p-10 space-y-10 shadow-[0_0_100px_rgba(255,107,0,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-primary to-transparent opacity-50" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div 
            animate={isVerifying ? { rotate: 360 } : {}}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-3xl bg-orange-primary/10 flex items-center justify-center border border-orange-primary/20"
          >
            <Shield className="text-orange-primary" size={40} />
          </motion.div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black tracking-tighter text-white">ÊTES-VOUS HUMAIN ?</h2>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold">
              Sécurité COOK IA v2.5
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleCheck}
            disabled={isVerifying || isVerified}
            className={`w-full group relative flex items-center gap-4 p-6 rounded-2xl border transition-all duration-500 ${
              isVerified 
                ? 'bg-green-500/10 border-green-500/50 text-green-500' 
                : isVerifying 
                  ? 'bg-white/5 border-white/10 text-white/40' 
                  : 'bg-white/5 border-white/10 hover:border-orange-primary/50 text-white hover:bg-white/[0.08]'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
              isVerified 
                ? 'bg-green-500 border-green-500' 
                : isChecked 
                  ? 'bg-orange-primary border-orange-primary' 
                  : 'border-white/20 group-hover:border-orange-primary/50'
            }`}>
              {isVerified ? (
                <Check size={18} className="text-white" />
              ) : isVerifying ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : isChecked ? (
                <div className="w-2 h-2 bg-white rounded-full" />
              ) : null}
            </div>
            <span className="text-sm font-black uppercase tracking-widest">
              {isVerified ? "VÉRIFIÉ" : isVerifying ? "VÉRIFICATION..." : isFallbackMode ? "CLIQUEZ POUR VÉRIFIER" : "JE SUIS UN HUMAIN"}
            </span>
            
            {!isVerifying && !isVerified && (
              <ChevronRight size={18} className="ml-auto text-white/20 group-hover:text-orange-primary transition-colors" />
            )}
          </button>

          {isFallbackMode && !isVerified && !isVerifying && (
            <p className="text-[9px] text-orange-primary/60 text-center font-bold uppercase tracking-tighter">
              Mode de secours activé : Cliquez sur le bouton pour valider manuellement.
            </p>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 justify-center text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-3 rounded-xl border border-red-500/20"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">
            <Lock size={12} />
            <span>PROTECTION RECAPTCHA V3</span>
          </div>
          <p className="text-[8px] text-white/10 text-center max-w-[200px] leading-relaxed">
            Cette vérification utilise Google reCAPTCHA pour protéger vos données contre les accès automatisés.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
