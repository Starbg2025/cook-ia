import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Shield, Check, Lock, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoaded: () => void;
  }
}

interface AntiBotProps {
  onVerify: () => void;
  isOpen: boolean;
}

// ✅ Ta clé publique (safe à mettre dans le frontend)
const SITE_KEY = "6LdTZoMsAAAAADwDW39iCQPo7Szlz1aelljqmvHa";

// ✅ URL de ta Netlify Function
const VERIFY_URL = "/.netlify/functions/verify-captcha";

export const AntiBot: React.FC<AntiBotProps> = ({ onVerify, isOpen }) => {
  const [isVerified, setIsVerified]   = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef  = useRef<number | null>(null);

  // ── 1. Charger le script reCAPTCHA v2 une seule fois ──
  useEffect(() => {
    if (window.grecaptcha) {
      setScriptReady(true);
      return;
    }

    if (document.querySelector('script[src*="recaptcha/api.js"]')) {
      const interval = setInterval(() => {
        if (window.grecaptcha) {
          clearInterval(interval);
          setScriptReady(true);
        }
      }, 100);
      return;
    }

    window.onRecaptchaLoaded = () => setScriptReady(true);

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // ── 2. Rendre le widget quand le script est prêt et le modal ouvert ──
  useEffect(() => {
    if (!isOpen || !scriptReady || !containerRef.current) return;
    if (widgetIdRef.current !== null) return;

    try {
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey:            SITE_KEY,
        theme:              'dark',
        callback:           handleCaptchaSuccess,
        'expired-callback': handleCaptchaExpire,
        'error-callback':   handleCaptchaError,
      });
    } catch (e) {
      console.error('Erreur rendu reCAPTCHA:', e);
      setError('Impossible de charger le CAPTCHA. Vérifie ta connexion.');
    }
  }, [isOpen, scriptReady]);

  // ── 3. Reset à chaque fermeture du modal ──
  useEffect(() => {
    if (!isOpen) {
      setIsVerified(false);
      setIsVerifying(false);
      setError(null);
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch (_) {}
      }
    }
  }, [isOpen]);

  // ── Callback : l'utilisateur a coché la case ──
  const handleCaptchaSuccess = async (token: string) => {
    setError(null);
    setIsVerifying(true);

    try {
      const response = await fetch(VERIFY_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Réponse serveur invalide.');
      }

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        setIsVerifying(false);
        setTimeout(() => onVerify(), 1000);
      } else {
        throw new Error(data.message || 'Vérification échouée.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setError(err.message || 'Une erreur est survenue.');
      if (widgetIdRef.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    }
  };

  const handleCaptchaExpire = () => {
    setError('La vérification a expiré. Recommence.');
    setIsVerifying(false);
  };

  const handleCaptchaError = () => {
    setError('Erreur reCAPTCHA. Vérifie ta connexion.');
    setIsVerifying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] p-10 space-y-10 shadow-[0_0_100px_rgba(255,107,0,0.1)] relative overflow-hidden"
      >
        {/* Ligne décorative */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />

        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div
            animate={
              isVerifying
                ? { rotate: 360 }
                : isVerified
                ? { scale: [1, 1.2, 1] }
                : {}
            }
            transition={
              isVerifying
                ? { duration: 3, repeat: Infinity, ease: 'linear' }
                : { duration: 0.4 }
            }
            className={`w-20 h-20 rounded-3xl flex items-center justify-center border transition-all duration-500 ${
              isVerified
                ? 'bg-green-500/10 border-green-500/40'
                : 'bg-orange-500/10 border-orange-500/20'
            }`}
          >
            {isVerified
              ? <Check className="text-green-500" size={40} />
              : <Shield className="text-orange-500" size={40} />
            }
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter text-white">
              {isVerified ? 'VÉRIFIÉ !' : 'ÊTES-VOUS HUMAIN ?'}
            </h2>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold">
              Sécurité COOK IA v2.5
            </p>
          </div>
        </div>

        {/* ── Corps ── */}
        <div className="flex flex-col items-center gap-5">

          {!isVerified && (
            <>
              {!scriptReady ? (
                <div className="flex items-center gap-2 text-white/30 text-sm py-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/20 border-t-orange-500 rounded-full"
                  />
                  Chargement du CAPTCHA…
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* ✅ Widget Google reCAPTCHA v2 "Je ne suis pas un robot" */}
                  <div ref={containerRef} />
                </motion.div>
              )}

              {isVerifying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-orange-500/80 text-xs font-black uppercase tracking-widest"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 border-2 border-orange-500/30 border-t-orange-500 rounded-full"
                  />
                  Vérification en cours…
                </motion.div>
              )}
            </>
          )}

          {isVerified && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-400 font-black uppercase tracking-widest"
            >
              Accès accordé 🎉
            </motion.p>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-3 rounded-xl border border-red-500/20 w-full justify-center"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-[0.3em] font-black">
            <Lock size={12} />
            <span>PROTECTION RECAPTCHA V2</span>
          </div>
          <p className="text-[8px] text-white/10 text-center max-w-[200px] leading-relaxed">
            Coche la case pour prouver que tu es humain.
            Tes données sont protégées par Google reCAPTCHA.
          </p>
        </div>
      </motion.div>
    </div>
  );
};