import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Star, 
  Sparkles, 
  Paperclip, 
  Mic, 
  Search, 
  ChevronDown, 
  ArrowUp, 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  Layers, 
  Code, 
  CheckCircle, 
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { Language, translations } from '../translations';

interface LandingPageProps {
  onEnter: (prompt?: string, forceAuth?: boolean) => void;
  lang: Language;
  setLang: (l: Language) => void;
  onLoadTemplate?: (code: string, promptText: string) => void;
}

// Custom JS-based requestAnimationFrame fade video component
export const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const opacityRef = useRef<number>(0);
  const fadingOutRef = useRef<boolean>(false);

  const animateOpacity = (targetOpacity: number, duration: number, callback?: () => void) => {
    // Cancel any running animation frames to prevent competing animations
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    const startOpacity = opacityRef.current;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Interpolate opacity smoothly without snapping
      const current = startOpacity + (targetOpacity - startOpacity) * progress;
      opacityRef.current = current;
      
      if (videoRef.current) {
        videoRef.current.style.opacity = current.toFixed(4);
      }

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        rafIdRef.current = null;
        if (callback) callback();
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration;
    const currentTime = video.currentTime;

    // 250ms fade-out when 0.55 seconds remain before video end
    if (duration && (duration - currentTime <= 0.55)) {
      if (!fadingOutRef.current) {
        fadingOutRef.current = true;
        animateOpacity(0, 250);
      }
    }
  };

  const handleEnded = () => {
    // On ended: opacity set to 0, 100ms delay, reset to currentTime = 0, play, fade back in
    if (videoRef.current) {
      videoRef.current.style.opacity = "0";
    }
    opacityRef.current = 0;

    setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        fadingOutRef.current = false;
        video.play()
          .then(() => {
            animateOpacity(1, 250);
          })
          .catch(err => {
            console.log("Play interrupted:", err);
            animateOpacity(1, 250);
          });
      }
    }, 100);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;

      // Initial 250ms fade-in on load/loop start
      video.play()
        .then(() => {
          animateOpacity(1, 250);
        })
        .catch(err => {
          console.log("Autoplay blocked, waiting for interaction:", err);
          animateOpacity(1, 250);
        });
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 bg-[#010101] pointer-events-none">
      {/* 115% width and height, centered horizontally, anchored to top with object-top focal point */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[115vw] h-[115vh] max-w-none max-h-none">
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4"
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover object-top"
          style={{ opacity: 0 }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      </div>
      {/* Premium semi-transparent white/glass overlay so that black and gray text has gorgeous, crystal clear contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/70 to-white/85 backdrop-blur-[1px] pointer-events-none" />
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, lang, setLang }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);

  const t = translations[lang];

  // Smooth scroll helper
  const handleScrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
    setFeaturesDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onEnter(inputValue);
    } else {
      onEnter();
    }
  };

  return (
    <div 
      className="relative w-full min-h-screen overflow-y-auto overflow-x-hidden bg-[#010101] text-black selection:bg-black/10 selection:text-black scroll-smooth"
      id="landing-container"
    >
      {/* Custom Loop Video Background with Light Glass Overlay */}
      <VideoBackground />

      {/* STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm">
        <nav 
          className="w-full max-w-7xl mx-auto px-6 md:px-[120px] py-[16px] flex items-center justify-between" 
          id="landing-navbar"
        >
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-schibsted font-semibold text-[24px] tracking-[-1px] md:tracking-[-1.44px] text-[#000000] cursor-pointer hover:opacity-80 transition-opacity"
            id="brand-logo"
          >
            Cook IA
          </div>

          {/* Desktop Menu Items */}
          <div className="hidden md:flex items-center gap-[34px]" id="desktop-nav-menu">
            <button
              onClick={() => handleScrollTo('platform')}
              className="font-schibsted font-medium text-[16px] tracking-[-0.2px] text-[#000000] hover:text-black/70 transition-colors cursor-pointer"
            >
              Platform
            </button>

            {/* Features Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                className="font-schibsted font-medium text-[16px] tracking-[-0.2px] text-[#000000] hover:text-black/70 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Features
                <ChevronDown size={14} className={`transform transition-transform ${featuresDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {featuresDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-8 left-0 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-black/5 p-2 flex flex-col z-50"
                  >
                    <button
                      onClick={() => handleScrollTo('features')}
                      className="px-3 py-2 text-left text-sm text-[#000000] hover:bg-black/5 rounded-lg transition-colors font-schibsted"
                    >
                      AI Code Generation
                    </button>
                    <button
                      onClick={() => handleScrollTo('features')}
                      className="px-3 py-2 text-left text-sm text-[#000000] hover:bg-black/5 rounded-lg transition-colors font-schibsted"
                    >
                      Secure Database Sync
                    </button>
                    <button
                      onClick={() => handleScrollTo('features')}
                      className="px-3 py-2 text-left text-sm text-[#000000] hover:bg-black/5 rounded-lg transition-colors font-schibsted"
                    >
                      Live Canvas Studio
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => handleScrollTo('projects')}
              className="font-schibsted font-medium text-[16px] tracking-[-0.2px] text-[#000000] hover:text-black/70 transition-colors cursor-pointer"
            >
              Projects
            </button>

            <button
              onClick={() => handleScrollTo('community')}
              className="font-schibsted font-medium text-[16px] tracking-[-0.2px] text-[#000000] hover:text-black/70 transition-colors cursor-pointer"
            >
              Community
            </button>

            <button
              onClick={() => handleScrollTo('contact')}
              className="font-schibsted font-medium text-[16px] tracking-[-0.2px] text-[#000000] hover:text-black/70 transition-colors cursor-pointer"
            >
              Contact
            </button>

            <button
              onClick={() => onEnter()}
              className="font-schibsted font-semibold text-[16px] tracking-[-0.2px] text-orange-600 hover:text-orange-700 transition-colors cursor-pointer flex items-center gap-1 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 shadow-sm"
            >
              <Sparkles size={14} className="text-orange-500 animate-pulse" />
              {lang === 'fr' ? 'Studio de Chat' : 'Chat Studio'}
            </button>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center gap-4" id="desktop-auth-buttons">
            <button
              onClick={() => onEnter(undefined, true)}
              className="w-[82px] text-center font-schibsted font-medium text-[15px] text-[#000000] hover:text-black/70 transition-colors cursor-pointer py-2"
            >
              Sign Up
            </button>
            <button
              onClick={() => onEnter(undefined, true)}
              className="w-[101px] h-[40px] rounded-lg bg-black text-white hover:bg-black/85 font-schibsted font-medium text-[15px] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              Log In
            </button>
            
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="text-[10px] ml-2 px-2 py-1 rounded border border-black/10 text-black/60 hover:text-black transition-colors font-mono tracking-widest uppercase cursor-pointer"
            >
              {lang}
            </button>
          </div>

          {/* Mobile hamburger & Lang */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="text-[9px] px-1.5 py-0.5 rounded border border-black/10 text-[#000000]/60 hover:text-black transition-colors font-mono tracking-widest uppercase"
            >
              {lang}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#000000] focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* MOBILE NAV DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-16 left-4 right-4 z-50 md:hidden mobile-menu-glass rounded-2xl py-8 flex flex-col items-center gap-5"
            id="mobile-nav-drawer"
          >
            <button
              onClick={() => handleScrollTo('platform')}
              className="text-white/90 uppercase font-light tracking-[0.25em] text-sm hover:text-white transition-colors duration-200"
            >
              Platform
            </button>
            <button
              onClick={() => handleScrollTo('features')}
              className="text-white/90 uppercase font-light tracking-[0.25em] text-sm hover:text-white transition-colors duration-200"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo('projects')}
              className="text-white/90 uppercase font-light tracking-[0.25em] text-sm hover:text-white transition-colors duration-200"
            >
              Projects
            </button>
            <button
              onClick={() => handleScrollTo('community')}
              className="text-white/90 uppercase font-light tracking-[0.25em] text-sm hover:text-white transition-colors duration-200"
            >
              Community
            </button>
            <button
              onClick={() => handleScrollTo('contact')}
              className="text-white/90 uppercase font-light tracking-[0.25em] text-sm hover:text-white transition-colors duration-200"
            >
              Contact
            </button>

            <button
              onClick={() => { onEnter(); setMobileMenuOpen(false); }}
              className="text-amber-400 font-semibold uppercase tracking-[0.2em] text-xs hover:text-amber-300 transition-colors duration-200 flex items-center gap-1 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/25"
            >
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              {lang === 'fr' ? 'Studio de Chat' : 'Chat Studio'}
            </button>
            
            <hr className="w-1/2 border-white/10 my-1" />
            
            <button
              onClick={() => { onEnter(undefined, true); setMobileMenuOpen(false); }}
              className="text-white bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all"
            >
              Sign Up
            </button>
            <button
              onClick={() => { onEnter(undefined, true); setMobileMenuOpen(false); }}
              className="text-black bg-white hover:bg-white/90 px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
            >
              Log In
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN HERO CONTENT BLOCK */}
      <section 
        className="relative z-10 w-full pt-[60px] pb-24 md:pb-36 flex flex-col items-center justify-center"
        id="hero-section"
      >
        <div className="flex flex-col items-center justify-center -mt-[50px] px-6 md:px-[120px] max-w-7xl mx-auto z-10 relative">
          
          {/* Header elements with 34px gap within them */}
          <div className="flex flex-col items-center gap-y-[34px]">
            
            {/* Badge Component */}
            <div 
              className="inline-flex items-center gap-2 bg-[#ffffff] border border-black/5 shadow-sm rounded-full p-1 pr-3 font-inter text-[14px] text-[#000000]"
              id="badge-container"
            >
              <span className="flex items-center gap-1 bg-[#0e1311] text-white rounded-full px-2.5 py-0.5 text-xs font-medium">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                New
              </span>
              <span className="font-normal text-black">Discover what's possible</span>
            </div>

            {/* Main Headline (Responsive tracking to prevent overlapping) */}
            <h1 
              className="font-fustat font-bold text-center tracking-[-1.5px] sm:tracking-[-3px] md:tracking-[-4.8px] leading-none text-[#000000] text-5xl sm:text-6xl md:text-[80px]"
              id="hero-title"
            >
              Transform Data Quickly
            </h1>

            {/* Subtitle */}
            <p 
              className="font-fustat font-medium text-center tracking-[-0.2px] md:tracking-[-0.4px] text-[#505050] text-base sm:text-lg md:text-[20px] max-w-[736px] w-full md:w-[542px]"
              id="hero-subtitle"
            >
              Upload your information and get powerful insights right away. Work smarter and achieve goals effortlessly.
            </p>
          </div>

          {/* Interactive Search input box with backdrop blur */}
          <div className="mt-[44px] w-full max-w-[728px]" id="search-playground">
            <form onSubmit={handleSearchSubmit}>
              <div 
                style={{ backgroundColor: 'rgba(0,0,0,0.24)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} 
                className="w-full max-w-[728px] h-auto md:h-[200px] rounded-[18px] p-4 flex flex-col justify-between text-white shadow-lg border border-white/10 gap-4 md:gap-0"
              >
                {/* Top Row: Credit info */}
                <div className="flex items-center justify-between font-schibsted font-medium text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="opacity-95 text-white">60/450 credits</span>
                    <button 
                      type="button"
                      onClick={() => onEnter("S'abonner / Upgrade credits")}
                      style={{ backgroundColor: 'rgba(90,225,76,0.89)' }} 
                      className="text-[#0e1311] font-semibold px-2 py-0.5 rounded-md hover:scale-105 transition-transform text-[11px] cursor-pointer border-none"
                    >
                      Upgrade
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-95 text-white">
                    <Sparkles size={12} className="text-amber-400 animate-pulse" />
                    <span>Powered by GPT-4o</span>
                  </div>
                </div>

                {/* Main Input Area */}
                <div className="bg-white rounded-[12px] p-2 flex items-center shadow-md justify-between border border-black/5">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.slice(0, 3000))}
                    placeholder="Type question..."
                    className="flex-1 bg-transparent border-none text-[#000000] placeholder-black/40 focus:outline-none text-[16px] px-3 py-1.5 font-inter font-normal"
                  />
                  <button
                    type="submit"
                    className="w-[36px] h-[36px] rounded-full bg-black hover:bg-black/80 flex items-center justify-center text-white transition-all duration-300 shrink-0 cursor-pointer shadow-sm active:scale-95"
                  >
                    <ArrowUp size={16} />
                  </button>
                </div>

                {/* Bottom Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  {/* Left Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert(lang === 'fr' ? 'Sélectionnez un fichier à attacher.' : 'Select a file or document to attach.')}
                      className="bg-[#f8f8f8] hover:bg-white text-[#505050] font-sans font-medium text-xs rounded-[6px] px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      <Paperclip size={12} />
                      Attach
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(lang === 'fr' ? "Entrée vocale en cours d'écoute..." : 'Voice input is listening...')}
                      className="bg-[#f8f8f8] hover:bg-white text-[#505050] font-sans font-medium text-xs rounded-[6px] px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      <Mic size={12} />
                      Voice
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputValue(lang === 'fr' ? 'Optimise mon design de page' : 'Analyze my loaded dataset for trends.')}
                      className="bg-[#f8f8f8] hover:bg-white text-[#505050] font-sans font-medium text-xs rounded-[6px] px-3 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer border-none"
                    >
                      <Search size={12} />
                      Prompts
                    </button>
                  </div>

                  {/* Character Counter */}
                  <div className="text-[12px] text-[#f8f8f8]/70 font-sans self-end sm:self-auto">
                    {inputValue.length}/3,000
                  </div>
                </div>

              </div>
            </form>
            
            {/* Elegant prompt-to-creation guide caption */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-center sm:text-left">
              <span className="font-schibsted font-medium text-xs text-slate-500 flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles size={12} className="text-orange-500 animate-pulse" />
                {lang === 'fr' 
                  ? "Saisissez votre prompt ci-dessus pour lancer Cook IA et générer votre site web de rêve instantanément !" 
                  : "Type your prompt above to launch Cook IA and generate your dream website instantly!"
                }
              </span>
              <button
                onClick={() => onEnter()}
                className="font-schibsted font-bold text-xs text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 shadow-sm cursor-pointer"
              >
                {lang === 'fr' ? "Accéder directement au Chat →" : "Access Chat Interface directly →"}
              </button>
            </div>
          </div>

          {/* Quick instructions indicator */}
          <div className="mt-12 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-[#505050] uppercase tracking-widest font-mono">
              {lang === 'fr' ? 'Défilez pour Explorer' : 'Scroll to Explore'}
            </span>
            <ChevronDown size={16} className="text-[#505050]" />
          </div>

        </div>
      </section>

      {/* SECTION 1: PLATFORM SHOWCASE (SCROLLABLE SECTION) */}
      <section 
        id="platform" 
        className="relative z-10 w-full py-24 px-6 border-t border-black/5 bg-white text-black"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs text-emerald-600 font-mono tracking-widest uppercase block mb-2">
              {lang === 'fr' ? 'PLATEFORME DE FORGE' : 'THE CORE PLATFORM'}
            </span>
            <h2 className="font-fustat font-bold text-3xl sm:text-5xl tracking-tight text-black">
              {lang === 'fr' ? 'Intelligence Modulaire Cook IA' : 'Cook IA Modular Engine'}
            </h2>
            <p className="mt-4 text-[#505050] font-fustat font-medium text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {lang === 'fr' 
                ? 'Une architecture de développement pilotée par IA pour forger des interfaces exceptionnelles.'
                : 'An intelligent development framework designed to design, refine, and deploy full-stack assets instantly.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f8f8f8] border border-black/5 rounded-2xl p-8 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-6">
                <Code size={20} />
              </div>
              <h3 className="font-fustat font-bold text-xl mb-3 text-black">
                {lang === 'fr' ? 'Génération de Code TS' : 'Strict TS Generation'}
              </h3>
              <p className="text-[#505050] text-sm leading-relaxed">
                {lang === 'fr'
                  ? 'Génère du code React et TypeScript propre et modulaire, validé par des linters professionnels.'
                  : 'Compiles pristine modular React and TypeScript component structures, optimized for deployment.'
                }
              </p>
            </div>

            <div className="bg-[#f8f8f8] border border-black/5 rounded-2xl p-8 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-6">
                <Layers size={20} />
              </div>
              <h3 className="font-fustat font-bold text-xl mb-3 text-black">
                {lang === 'fr' ? 'Style Tailwind v4' : 'Tailwind v4 Aesthetics'}
              </h3>
              <p className="text-[#505050] text-sm leading-relaxed">
                {lang === 'fr'
                  ? 'Designs contemporains soignés avec palettes de couleurs équilibrées, polices d\'élite et négatif réfléchi.'
                  : 'Stunning layouts mapped with modern palettes, premium typography, and fluid responsive spacing.'
                }
              </p>
            </div>

            <div className="bg-[#f8f8f8] border border-black/5 rounded-2xl p-8 hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-6">
                <Database size={20} />
              </div>
              <h3 className="font-fustat font-bold text-xl mb-3 text-black">
                {lang === 'fr' ? 'Bases Relat. & Cloud' : 'Cloud Synchronization'}
              </h3>
              <p className="text-[#505050] text-sm leading-relaxed">
                {lang === 'fr'
                  ? 'Synchronisation transparente avec les bases PostgreSQL et Firestore pour vos authentifications.'
                  : 'Direct, persistent bindings with relational schemas, OAuth authenticators, and live APIs.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BENTO FEATURES (SCROLLABLE SECTION) */}
      <section 
        id="features" 
        className="relative z-10 w-full py-24 px-6 border-t border-white/5 bg-black text-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs text-amber-400 font-mono tracking-widest uppercase block mb-2">
              {lang === 'fr' ? 'FONCTIONNALITÉS CLÉS' : 'HIGH-PERFORMANCE FEATURES'}
            </span>
            <h2 className="font-fustat font-bold text-3xl sm:text-5xl tracking-tight">
              {lang === 'fr' ? 'Écosystème de Développement Complet' : 'Advanced Multi-Agent Synergy'}
            </h2>
          </div>

          {/* Bento Box Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-12">
            
            {/* Box 1 (Big) */}
            <div className="md:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase block mb-2">INTELLIGENT DECISIONS</span>
                <h3 className="font-fustat font-bold text-2xl mb-4">
                  {lang === 'fr' ? 'Décodage Analytique en Temps Réel' : 'Real-Time Analytic Parsing'}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-xl">
                  {lang === 'fr'
                    ? 'Notre agent décode vos directives en langage naturel et détermine instantanément la meilleure architecture applicative, l\'état réactif, et les types de bases de données requis.'
                    : 'Our analytical agent maps natural language guidelines straight to complex reactive matrices, optimizing state parameters, layouts, and relational tables.'
                  }
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-white/50 font-mono">GPT-4o & Gemini Multi-Agent Pipelines</span>
              </div>
            </div>

            {/* Box 2 (Small) */}
            <div className="md:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase block mb-2">SPEED</span>
                <h3 className="font-fustat font-bold text-xl mb-3">Instant Sandbox</h3>
                <p className="text-white/70 text-xs leading-relaxed">
                  {lang === 'fr'
                    ? 'Visualisez vos modifications immédiatement dans un bac à sable isolé de haute performance.'
                    : 'Compile, deploy, and execute in our high-performance sandbox workspace without code stuttering.'
                  }
                </p>
              </div>
              <div className="mt-6">
                <span className="text-3xl font-bold font-fustat text-white">2.5s</span>
                <span className="text-xs text-white/50 block font-mono">Build speed averages</span>
              </div>
            </div>

            {/* Box 3 (Small) */}
            <div className="md:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase block mb-2">SECURE</span>
                <h3 className="font-fustat font-bold text-xl mb-3">Isolated Keys</h3>
                <p className="text-white/70 text-xs leading-relaxed">
                  {lang === 'fr'
                    ? 'Clés API privées stockées localement de bout en bout pour une sécurité absolue.'
                    : 'Private secrets are strictly kept server-side to guarantee zero data leakage in browser sessions.'
                  }
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-blue-400">
                <ShieldCheck size={18} />
                <span className="text-xs font-mono">Verified Safe</span>
              </div>
            </div>

            {/* Box 4 (Big) */}
            <div className="md:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase block mb-2">COLLABORATION</span>
                <h3 className="font-fustat font-bold text-2xl mb-4">
                  {lang === 'fr' ? 'Dessein Systémique Synaptique' : 'Live Interactive Canvas'}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-xl">
                  {lang === 'fr'
                    ? 'Laissez nos agents codeurs, testeurs et critiques coopérer en temps réel sous vos yeux. Chaque itération améliore l\'esthétique globale sans rompre de fonctionnalités existantes.'
                    : 'Let our Coder and Critic agents cooperate live on your screen. Watch them structure beautiful palettes, typography systems, and responsive layouts concurrently.'
                  }
                </p>
              </div>
              <div className="mt-8">
                <button
                  onClick={() => onEnter()}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold hover:text-amber-300 transition-colors cursor-pointer bg-transparent border-none text-white"
                >
                  {lang === 'fr' ? 'Découvrir la Synergie' : 'Explore Synergy'}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: PROJECTS GALLERY (SCROLLABLE SECTION) */}
      <section 
        id="projects" 
        className="relative z-10 w-full py-24 px-6 border-t border-black/5 bg-white text-black"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs text-blue-600 font-mono tracking-widest uppercase block mb-2">
              {lang === 'fr' ? 'MODÈLES DE RÉFÉRENCE' : 'TEMPLATE REGISTRY'}
            </span>
            <h2 className="font-fustat font-bold text-3xl sm:text-5xl tracking-tight">
              {lang === 'fr' ? 'Projets Prêts à Forger' : 'Pre-Engineered Concepts'}
            </h2>
            <p className="mt-4 text-[#505050] font-fustat font-medium text-base sm:text-lg max-w-2xl mx-auto">
              {lang === 'fr'
                ? 'Sélectionnez l\'une de ces bases pour démarrer immédiatement votre projet d\'intelligence.'
                : 'Accelerate development by selecting one of our high-fidelity, pre-tested application models.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: lang === 'fr' ? "Dashboard SaaS Financier" : "SaaS Finance Hub",
                desc: lang === 'fr' ? "Analyseur de budget automatisé avec cartes interactives et graphiques financiers." : "Interactive dashboarding containing state graphs, transaction trackers, and custom categories.",
                badge: "Full-Stack",
                promptText: "Un dashboard de gestion financière avec graphiques interactifs en D3, authentification utilisateur, et export de rapports."
              },
              {
                title: lang === 'fr' ? "Marketplace E-Commerce" : "Retro Bicycle Store",
                desc: lang === 'fr' ? "Boutique d'achat avec filtres dynamiques, système de panier réactif et paiement sécurisé." : "Fully functional checkout experience with search filters, dynamic cart states, and address validation.",
                badge: "Interactive",
                promptText: "Une boutique d'e-commerce de vélos vintage avec panier d'achat persistant, filtres de prix et page produit détaillée."
              },
              {
                title: lang === 'fr' ? "Portfolio Minimaliste d'Art" : "Creative Director Portfolio",
                desc: lang === 'fr' ? "Layout ultra-soigné d'exposition, transitions fluides et typographies raffinées." : "Clean, content-focused editorial grid showcasing creative assets with fluid micro-animations.",
                badge: "Responsive",
                promptText: "Un portfolio de photographe d'art minimaliste avec grille fluide, animations d'entrée et formulaire de contact direct."
              }
            ].map((proj, i) => (
              <div 
                key={i} 
                className="bg-[#f8f8f8] border border-black/5 rounded-2xl p-6 hover:border-black/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] px-2.5 py-1 bg-black/5 text-black font-mono rounded-full uppercase border border-black/5 tracking-wider">
                      {proj.badge}
                    </span>
                    <Sparkle size={14} className="text-amber-500 animate-pulse" />
                  </div>
                  <h3 className="font-fustat font-bold text-lg text-black mb-2">{proj.title}</h3>
                  <p className="text-[#505050] text-xs leading-relaxed mb-6">"{proj.desc}"</p>
                </div>
                <button
                  type="button"
                  onClick={() => onEnter(proj.promptText)}
                  className="w-full py-2.5 rounded-lg bg-black text-white hover:bg-black/85 text-xs font-semibold uppercase tracking-widest transition-all text-center cursor-pointer active:scale-98 border-none"
                >
                  {lang === 'fr' ? 'Forger ce Modèle' : 'Forge Model'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: COMMUNITY & FEEDBACK (SCROLLABLE SECTION) */}
      <section 
        id="community" 
        className="relative z-10 w-full py-24 px-6 border-t border-white/5 bg-black text-white"
      >
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs text-purple-400 font-mono tracking-widest uppercase block mb-2">
            {lang === 'fr' ? 'REJOIGNEZ LE RÉSEAU' : 'THE COFFEE & CODE NETWORK'}
          </span>
          <h2 className="font-fustat font-bold text-3xl sm:text-5xl tracking-tight mb-6">
            {lang === 'fr' ? 'Écosystème Actif de Développeurs' : 'Global Developer Ecosystem'}
          </h2>
          <p className="text-white/60 font-fustat text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            {lang === 'fr'
              ? 'Faites partie d\'une communauté florissante partageant des templates, des guides de prompt, et des astuces réactives.'
              : 'Join a vibrant space of thousands of designers and programmers exchanging clean prompts and structural systems.'
            }
          </p>

          <div className="flex flex-wrap justify-center gap-12 max-w-3xl mx-auto mt-6">
            <div className="text-center">
              <span className="text-4xl sm:text-5xl font-bold font-fustat block mb-1">12K+</span>
              <span className="text-xs text-white/50 font-mono uppercase tracking-widest">Active Forgers</span>
            </div>
            <div className="text-center">
              <span className="text-4xl sm:text-5xl font-bold font-fustat block mb-1">245K+</span>
              <span className="text-xs text-white/50 font-mono uppercase tracking-widest">Projects Created</span>
            </div>
            <div className="text-center">
              <span className="text-4xl sm:text-5xl font-bold font-fustat block mb-1">1.2M+</span>
              <span className="text-xs text-white/50 font-mono uppercase tracking-widest">Sandbox Runs</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CONTACT SECTION (SCROLLABLE SECTION) */}
      <section 
        id="contact" 
        className="relative z-10 w-full py-24 px-6 border-t border-black/5 bg-white text-black"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs text-emerald-600 font-mono tracking-widest uppercase block mb-2">
              {lang === 'fr' ? 'BESOIN D\'AIDE ?' : 'GET IN TOUCH'}
            </span>
            <h2 className="font-fustat font-bold text-3xl sm:text-4xl tracking-tight">
              {lang === 'fr' ? 'Nous serions ravis de vous entendre' : 'Connect with our Specialists'}
            </h2>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              alert(lang === 'fr' ? 'Message envoyé avec succès !' : 'Message received! We will reach out shortly.');
              (e.target as HTMLFormElement).reset();
            }}
            className="space-y-6 bg-[#f8f8f8] border border-black/5 p-8 rounded-3xl shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#505050] tracking-wider mb-2">Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="John Doe" 
                  className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors font-sans text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[#505050] tracking-wider mb-2">Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="john@example.com" 
                  className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors font-sans text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#505050] tracking-wider mb-2">Message</label>
              <textarea 
                rows={4} 
                required 
                placeholder="How can we help your team?" 
                className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors font-sans text-black"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-black hover:bg-black/90 text-white font-schibsted font-medium text-sm uppercase tracking-widest py-4 rounded-xl transition-all shadow-md cursor-pointer active:scale-98 border-none"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full py-12 px-6 border-t border-white/5 bg-black text-white/50 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            &copy; {new Date().getFullYear()} Cook IA. {t.rights}
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            {t.byCookIA}
          </div>
        </div>
      </footer>
    </div>
  );
};
