import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Github, Mail, Chrome, Lock, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { LegalModal } from './LegalModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'magic_link' | 'login' | 'signup' | 'username_setup' | 'verify_otp';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<AuthMode>('magic_link');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean, type: 'tos' | 'privacy' }>({
    isOpen: false,
    type: 'tos'
  });

  // Check if user needs username setup after login
  useEffect(() => {
    if (isOpen) {
      checkUserSession();
    }
  }, [isOpen]);

  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
      
      if (!profile?.username) {
        setMode('username_setup');
      }
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error(`Error logging in with ${provider}:`, error);
      setErrorMsg(`Erreur de connexion avec ${provider}`);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      alert('Lien de connexion envoyé par email !');
    } catch (error: any) {
      console.error('Error with magic link:', error);
      if (error.message?.includes('security purposes')) {
        const seconds = error.message.match(/\d+/)?.[0] || 'quelques';
        setErrorMsg(`Veuillez patienter ${seconds} secondes avant de demander un nouveau lien.`);
      } else {
        setErrorMsg('Erreur lors de l\'envoi du lien');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            }
          }
        });
        if (error) throw error;
        
        // Create profile entry
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: username,
          });
        }
        
        setMode('verify_otp');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // After login, check if username exists
        await checkUserSession();
        if (mode !== 'username_setup') onClose();
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        if (error.code === '23505') throw new Error('Ce nom d\'utilisateur est déjà pris');
        throw error;
      }

      onClose();
    } catch (error: any) {
      setErrorMsg(error.message || 'Erreur lors de la configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });
      if (error) throw error;
      
      // After verification, check if username exists
      await checkUserSession();
      if (mode !== 'username_setup') onClose();
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setErrorMsg(error.message || 'Code invalide ou expiré');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      alert('Nouveau code envoyé !');
    } catch (error: any) {
      setErrorMsg(error.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[440px] bg-[#141414] border border-white/10 rounded-2xl lg:rounded-[32px] p-6 lg:p-10 shadow-2xl text-white overflow-y-auto max-h-[90vh] scrollbar-hide"
          >
            {mode !== 'username_setup' && (
              <button 
                onClick={onClose}
                className="absolute top-4 lg:top-6 right-4 lg:right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
              >
                <X size={20} />
              </button>
            )}

            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-[32px] font-semibold leading-tight mb-3 lg:mb-4 tracking-tight">
                {mode === 'username_setup' ? 'Choisissez un pseudo' : 
                 mode === 'signup' ? 'Créez votre compte' : 
                 mode === 'verify_otp' ? 'Vérifiez votre email' :
                 'Bon retour parmi nous'}
              </h2>
              <p className="text-white/60 text-sm lg:text-[15px] leading-relaxed px-2 lg:px-4">
                {mode === 'username_setup' ? 'Dernière étape ! Comment souhaitez-vous être appelé sur COOK IA ?' :
                 mode === 'verify_otp' ? `Nous avons envoyé un code de vérification à ${email}.` :
                 'Vous recevrez un site web full-stack prêt à l\'emploi, avec une architecture moderne.'}
              </p>
            </div>

            {mode !== 'username_setup' && mode !== 'verify_otp' && (
              <>
                <div className="space-y-3 mb-8">
                  <button 
                    onClick={() => handleOAuthLogin('google')}
                    className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-full py-3.5 px-6 hover:bg-white/5 transition-all font-medium text-[15px]"
                  >
                    <Chrome size={20} className="text-[#4285F4]" />
                    Continuer avec Google
                  </button>
                  
                  <button 
                    onClick={() => handleOAuthLogin('github')}
                    className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-full py-3.5 px-6 hover:bg-white/5 transition-all font-medium text-[15px]"
                  >
                    <Github size={20} />
                    Continuer avec GitHub
                  </button>
                </div>

                <div className="relative flex items-center justify-center mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <span className="relative bg-[#141414] px-4 text-[11px] font-bold uppercase tracking-widest text-white/30">OU</span>
                </div>
              </>
            )}

            {mode === 'username_setup' ? (
              <form onSubmit={handleUsernameSetup} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 pl-12 text-[15px] focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30 text-white"
                    required
                  />
                </div>
                {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black py-4 rounded-full font-bold text-[15px] transition-all hover:bg-white/90 disabled:opacity-50"
                >
                  {isLoading ? 'Enregistrement...' : 'Terminer'}
                </button>
              </form>
            ) : mode === 'verify_otp' ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Code de vérification"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 pl-12 text-[15px] focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30 text-white tracking-[0.3em] font-mono text-center"
                    required
                    maxLength={8}
                  />
                </div>
                {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
                <button 
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full bg-white text-black py-4 rounded-full font-bold text-[15px] transition-all hover:bg-white/90 disabled:opacity-50"
                >
                  {isLoading ? 'Vérification...' : 'Vérifier le code'}
                </button>
                <div className="flex flex-col gap-2 items-center">
                  <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-white/40 text-sm hover:text-white transition-colors"
                  >
                    Renvoyer le code
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-white/40 text-sm hover:text-white transition-colors"
                  >
                    Retour à l'inscription
                  </button>
                </div>
              </form>
            ) : mode === 'magic_link' ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Adresse e-mail"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 pl-12 text-[15px] focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30 text-white"
                    required
                  />
                </div>
                {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black py-4 rounded-full font-bold text-[15px] transition-all hover:bg-white/90 disabled:opacity-50"
                >
                  {isLoading ? 'Envoi...' : 'Continuer avec Magic Link'}
                </button>
                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-white/40 text-sm hover:text-white transition-colors"
                >
                  Utiliser un mot de passe
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nom d'utilisateur"
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 pl-12 text-[15px] focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30 text-white"
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Adresse e-mail"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 pl-12 text-[15px] focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30 text-white"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 pl-12 pr-12 text-[15px] focus:outline-none focus:border-white/30 transition-all placeholder:text-white/30 text-white"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black py-4 rounded-full font-bold text-[15px] transition-all hover:bg-white/90 disabled:opacity-50"
                >
                  {isLoading ? 'Chargement...' : mode === 'signup' ? 'S\'inscrire' : 'Se connecter'}
                </button>
                <div className="flex flex-col gap-2 items-center">
                  <button 
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-white/40 text-sm hover:text-white transition-colors"
                  >
                    {mode === 'login' ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMode('magic_link')}
                    className="text-white/40 text-sm hover:text-white transition-colors"
                  >
                    Retour au Magic Link
                  </button>
                </div>
              </form>
            )}

            <p className="mt-8 text-center text-[12px] text-white/40 leading-relaxed">
              En continuant, vous acceptez nos <span 
                onClick={() => setLegalModal({ isOpen: true, type: 'tos' })}
                className="underline cursor-pointer hover:text-white transition-colors"
              >conditions d'utilisation</span> et notre <span 
                onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
                className="underline cursor-pointer hover:text-white transition-colors"
              >politique de confidentialité</span>.
            </p>
          </motion.div>

          <LegalModal 
            isOpen={legalModal.isOpen} 
            type={legalModal.type} 
            onClose={() => setLegalModal({ ...legalModal, isOpen: false })} 
          />
        </div>
      )}
    </AnimatePresence>
  );
};
