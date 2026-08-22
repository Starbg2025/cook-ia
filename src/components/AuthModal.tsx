import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Github, 
  Mail, 
  Chrome, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldCheck, 
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { LegalModal, LegalTabType } from './LegalModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'magic_link' | 'login' | 'signup' | 'username_setup' | 'verify_otp' | 'forgot_password' | 'new_password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<AuthMode>('magic_link');
  const [otpType, setOtpType] = useState<'signup' | 'recovery'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean, tab: LegalTabType }>({
    isOpen: false,
    tab: 'tos'
  });

  // Check if user needs username setup after login
  useEffect(() => {
    if (isOpen) {
      checkUserSession();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
      setErrorMsg(`Erreur de connexion avec ${provider}. Vérifiez votre connexion.`);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setSuccessMsg('Lien de connexion instantané envoyé par e-mail !');
    } catch (error: any) {
      console.error('Error with magic link:', error);
      if (error.message?.includes('security purposes')) {
        const seconds = error.message.match(/\d+/)?.[0] || 'quelques';
        setErrorMsg(`Veuillez patienter ${seconds} secondes avant de demander un nouveau lien.`);
      } else {
        setErrorMsg('Erreur lors de l\'envoi du lien. Vérifiez l\'adresse e-mail.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        if (password.length < 8) {
          throw new Error('Le mot de passe doit contenir au moins 8 caractères.');
        }
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
          throw new Error('Le mot de passe doit contenir au moins une lettre majuscule et un chiffre.');
        }

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
        
        setOtpType('signup');
        setMode('verify_otp');
        setResendCooldown(60);
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
      setErrorMsg(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      
      setOtpType('recovery');
      setMode('verify_otp');
      setResendCooldown(60);
      setSuccessMsg('Code de réinitialisation sécurisé envoyé à votre adresse e-mail !');
    } catch (error: any) {
      setErrorMsg(error.message || 'Erreur lors de l\'envoi du code de récupération');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      
      setSuccessMsg('Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.');
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (error: any) {
      setErrorMsg(error.message || 'Erreur lors de la modification du mot de passe');
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
      if (!user) throw new Error('Session non connectée');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        if (error.code === '23505') throw new Error('Ce nom d\'utilisateur est déjà utilisé par un autre créateur');
        throw error;
      }

      onClose();
    } catch (error: any) {
      setErrorMsg(error.message || 'Erreur lors de la configuration du pseudonyme');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Veuillez entrer le code complet à 6 chiffres reçu par e-mail.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: cleanOtp,
        type: otpType as any,
      });
      if (error) throw error;
      
      if (otpType === 'recovery') {
        setMode('new_password');
      } else {
        await checkUserSession();
        if (mode !== 'username_setup') onClose();
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setErrorMsg(error.message || 'Code invalide ou expiré. Veuillez vérifier le code ou en demander un nouveau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.resend({
        type: (otpType === 'recovery' ? 'recovery' : 'signup') as any,
        email: email,
      });
      if (error) throw error;
      setSuccessMsg('Un nouveau code à 6 chiffres vient de vous être envoyé !');
      setResendCooldown(60);
    } catch (error: any) {
      setErrorMsg(error.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const openLegalModal = (tab: LegalTabType) => {
    setLegalModal({ isOpen: true, tab });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className="relative w-full max-w-[460px] bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-900 overflow-y-auto max-h-[92vh] scrollbar-hide my-auto z-10"
          >
            {/* Close Button */}
            {mode !== 'username_setup' && (
              <button 
                onClick={onClose}
                aria-label="Fermer"
                className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            )}

            {/* Header Area with Status Indicator */}
            <div className="text-center mb-6">
              {mode === 'verify_otp' ? (
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-primary mx-auto flex items-center justify-center mb-3 shadow-sm">
                  <KeyRound size={24} />
                </div>
              ) : mode === 'new_password' ? (
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center mb-3 shadow-sm">
                  <Lock size={24} />
                </div>
              ) : null}

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                {mode === 'username_setup' ? 'Choisissez un pseudo' : 
                 mode === 'signup' ? 'Créer un compte COOK IA' : 
                 mode === 'verify_otp' ? 'Code de confirmation' :
                 mode === 'forgot_password' ? 'Mot de passe oublié' :
                 mode === 'new_password' ? 'Nouveau mot de passe' :
                 'Connexion à COOK IA'}
              </h2>

              <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                {mode === 'username_setup' ? 'Dernière étape pour identifier vos créations et projets web.' :
                 mode === 'verify_otp' ? `Entrez le code à 6 chiffres envoyé à :` :
                 mode === 'forgot_password' ? 'Entrez votre e-mail pour recevoir le code de réinitialisation sécurisé.' :
                 mode === 'new_password' ? 'Définissez votre nouveau mot de passe (au moins 8 caractères).' :
                 'Accédez à votre espace de création web assisté par IA.'}
              </p>

              {mode === 'verify_otp' && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-mono text-slate-700 max-w-full truncate">
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
              )}
            </div>

            {/* Social OAuth Providers (Login / Signup / Magic Link) */}
            {mode !== 'username_setup' && mode !== 'verify_otp' && mode !== 'forgot_password' && mode !== 'new_password' && (
              <>
                <div className="space-y-2.5 mb-6">
                  <button 
                    onClick={() => handleOAuthLogin('google')}
                    className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 px-4 hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-xs sm:text-sm text-slate-700 shadow-2xs"
                  >
                    <Chrome size={18} className="text-[#4285F4]" />
                    <span>Continuer avec Google</span>
                  </button>
                  
                  <button 
                    onClick={() => handleOAuthLogin('github')}
                    className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 px-4 hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-xs sm:text-sm text-slate-700 shadow-2xs"
                  >
                    <Github size={18} />
                    <span>Continuer avec GitHub</span>
                  </button>
                </div>

                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    OU
                  </span>
                </div>
              </>
            )}

            {/* Notifications */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* MODE: USERNAME SETUP */}
            {mode === 'username_setup' ? (
              <form onSubmit={handleUsernameSetup} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur public (ex: alexdev)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-xs sm:text-sm focus:outline-none focus:border-orange-primary focus:bg-white transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-primary hover:bg-orange-hover text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Enregistrement...' : 'Finaliser mon profil'}
                </button>
              </form>
            ) : mode === 'forgot_password' ? (
              /* MODE: FORGOT PASSWORD */
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Adresse e-mail"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-xs sm:text-sm focus:outline-none focus:border-orange-primary focus:bg-white transition-all placeholder:text-slate-400 text-slate-900"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-primary hover:bg-orange-hover text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Envoi...' : 'Envoyer le code de réinitialisation'}
                </button>
                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-slate-500 text-xs sm:text-sm hover:text-slate-900 transition-colors py-1"
                >
                  Retour à la connexion
                </button>
              </form>
            ) : mode === 'new_password' ? (
              /* MODE: NEW PASSWORD */
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nouveau mot de passe (8+ caractères)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 pr-11 text-xs sm:text-sm focus:outline-none focus:border-orange-primary focus:bg-white transition-all placeholder:text-slate-400 text-slate-900"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-primary hover:bg-orange-hover text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Mise à jour...' : 'Enregistrer le nouveau mot de passe'}
                </button>
              </form>
            ) : mode === 'verify_otp' ? (
              /* MODE: VERIFY CODE (OTP) - HIGHLY ADAPTIVE & RESPONSIVE */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Code de sécurité reçu par email
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="1 2 3 4 5 6"
                      autoFocus
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-primary rounded-xl p-3.5 pl-11 text-center font-mono text-lg sm:text-xl font-bold tracking-[0.35em] text-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                      required
                      maxLength={6}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Vérifiez votre boîte de réception ainsi que vos spams.
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full bg-orange-primary hover:bg-orange-hover text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>{isLoading ? 'Validation en cours...' : 'Valider et continuer'}</span>
                </button>

                <div className="pt-2 flex flex-col gap-2 items-center border-t border-slate-100 text-xs">
                  <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendCooldown > 0}
                    className={`flex items-center gap-1.5 font-medium transition-colors ${
                      resendCooldown > 0 
                        ? 'text-slate-400 cursor-not-allowed' 
                        : 'text-orange-primary hover:text-orange-hover hover:underline'
                    }`}
                  >
                    <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    <span>
                      {resendCooldown > 0 
                        ? `Renvoyer un code dans ${resendCooldown}s` 
                        : 'Renvoyer un nouveau code'}
                    </span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setMode(otpType === 'recovery' ? 'forgot_password' : 'signup')}
                    className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 mt-1"
                  >
                    <ArrowLeft size={13} />
                    <span>Modifier l'adresse email</span>
                  </button>
                </div>
              </form>
            ) : mode === 'magic_link' ? (
              /* MODE: MAGIC LINK */
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse e-mail"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-xs sm:text-sm focus:outline-none focus:border-orange-primary focus:bg-white transition-all placeholder:text-slate-400 text-slate-900"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-primary hover:bg-orange-hover text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>{isLoading ? 'Envoi...' : 'Continuer avec Magic Link'}</span>
                </button>
                <div className="flex flex-col gap-1.5 items-center pt-1 text-xs text-slate-500">
                  <button 
                    type="button"
                    onClick={() => setMode('login')}
                    className="hover:text-slate-900 hover:underline transition-colors"
                  >
                    Se connecter avec mot de passe
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMode('signup')}
                    className="hover:text-slate-900 hover:underline transition-colors"
                  >
                    Pas de compte ? S'inscrire
                  </button>
                </div>
              </form>
            ) : (
              /* MODE: LOGIN OR SIGNUP WITH PASSWORD */
              <form onSubmit={handlePasswordAuth} className="space-y-3.5">
                {mode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nom d'utilisateur (ex: jules_code)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-xs sm:text-sm focus:outline-none focus:border-orange-primary focus:bg-white transition-all placeholder:text-slate-400 text-slate-900"
                      required
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Adresse e-mail"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-xs sm:text-sm focus:outline-none focus:border-orange-primary focus:bg-white transition-all placeholder:text-slate-400 text-slate-900"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 pr-11 text-xs sm:text-sm focus:outline-none focus:border-orange-primary focus:bg-white transition-all placeholder:text-slate-400 text-slate-900"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-primary hover:bg-orange-hover text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Chargement...' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
                </button>
                
                <div className="flex flex-col gap-2 items-center pt-2 text-xs">
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      className="text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    {mode === 'login' ? 'Pas encore de compte ? S\'inscrire' : 'Déjà inscrit ? Se connecter'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMode('magic_link')}
                    className="text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Connexion rapide par Magic Link
                  </button>
                </div>
              </form>
            )}

            {/* Comprehensive Legal & Cookies Notice at Bottom */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                En continuant, vous acceptez nos{' '}
                <button 
                  type="button"
                  onClick={() => openLegalModal('tos')}
                  className="font-semibold text-slate-800 underline decoration-slate-300 hover:text-orange-primary hover:decoration-orange-primary transition-colors cursor-pointer"
                >
                  conditions d'utilisation
                </button>
                {', '}notre{' '}
                <button 
                  type="button"
                  onClick={() => openLegalModal('privacy')}
                  className="font-semibold text-slate-800 underline decoration-slate-300 hover:text-orange-primary hover:decoration-orange-primary transition-colors cursor-pointer"
                >
                  politique de confidentialité
                </button>
                {' et la '}
                <button 
                  type="button"
                  onClick={() => openLegalModal('cookies')}
                  className="font-semibold text-slate-800 underline decoration-slate-300 hover:text-orange-primary hover:decoration-orange-primary transition-colors cursor-pointer"
                >
                  politique des cookies
                </button>
                .
              </p>
            </div>
          </motion.div>

          {/* Fully Integrated Closeable Legal & Cookie Modal */}
          <LegalModal 
            isOpen={legalModal.isOpen} 
            initialTab={legalModal.tab}
            onClose={() => setLegalModal(prev => ({ ...prev, isOpen: false }))} 
            isDark={false}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
