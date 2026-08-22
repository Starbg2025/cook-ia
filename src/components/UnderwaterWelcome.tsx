import React from 'react';
import { motion } from 'motion/react';
import { 
  Code2, 
  Sparkles, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Database, 
  Terminal, 
  ArrowRight,
  Boxes,
  Palette
} from 'lucide-react';

interface UnderwaterWelcomeProps {
  isDark: boolean;
  onStart?: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const UnderwaterWelcome: React.FC<UnderwaterWelcomeProps> = ({ isDark, onSelectPrompt }) => {
  const starterBlueprints = [
    {
      title: "SaaS & Dashboard Analytique",
      tech: "React 18 · Recharts · Supabase",
      prompt: "Construis un tableau de bord SaaS financier moderne avec graphiques de performance Recharts, suivi du MRR et filtre de périodes."
    },
    {
      title: "Boutique E-commerce & Panier",
      tech: "React 18 · State Local · Tailwind CSS",
      prompt: "Génère une boutique e-commerce moderne avec catalogue filtrable par catégories, panier d'achat réactif et calcul dynamique du total."
    },
    {
      title: "Portfolio Éditorial & Créatif",
      tech: "Design Épuré · Typographie · Mode Sombre",
      prompt: "Conçois un portfolio de développeur et designer web au style éditorial soigné avec filtres de projets et mise en page responsive."
    },
    {
      title: "CRM & Tableau Kanban",
      tech: "Gestion Sprint · Drag & Drop · Multi-Colonnes",
      prompt: "Construis une application de gestion de sprint avec colonnes Kanban interactives (À faire, En cours, Terminé) et ajout de cartes."
    }
  ];

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center overflow-y-auto px-4 py-8 custom-scrollbar ${
      isDark ? 'bg-[#090D14] text-white' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      {/* Background Subtle Grid */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-grid-dark opacity-40' : 'bg-grid-subtle opacity-70'}`} />

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full"
      >
        {/* Brand Icon & Status */}
        <div className="w-14 h-14 rounded-2xl bg-[#172E26] flex items-center justify-center text-amber-400 shadow-md mb-4 border border-amber-400/20">
          <Code2 size={28} />
        </div>

        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold mb-3 ${
          isDark 
            ? 'bg-white/[0.05] border border-white/[0.08] text-slate-300' 
            : 'bg-white border border-slate-200 text-slate-700 shadow-2xs'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Environnement Prêt · Multi-Agent v3.5</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold mb-3 tracking-tight font-display">
          Que souhaitez-vous <span className="text-amber-500">construire</span> aujourd'hui ?
        </h1>

        <p className={`text-xs sm:text-sm font-normal mb-8 max-w-lg leading-relaxed ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Décrivez votre projet web ci-dessous. Cook IA conçoit l'architecture, assemble les composants React et affiche le résultat en direct.
        </p>

        {/* Reference Starter Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left mb-6">
          {starterBlueprints.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt && onSelectPrompt(item.prompt)}
              className={`p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
                isDark 
                  ? 'bg-[#0E1420] border-white/[0.08] hover:border-amber-500/50 hover:bg-[#131B2A]' 
                  : 'bg-white border-slate-200/90 hover:border-amber-600/50 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono font-bold uppercase ${
                  isDark ? 'text-amber-400/90' : 'text-amber-700'
                }`}>
                  {item.tech}
                </span>
                <ArrowRight size={13} className={`transition-transform group-hover:translate-x-1 ${
                  isDark ? 'text-white/40 group-hover:text-amber-400' : 'text-slate-400 group-hover:text-amber-700'
                }`} />
              </div>
              <h3 className={`text-xs sm:text-sm font-bold ${
                isDark ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-slate-950'
              }`}>
                {item.title}
              </h3>
            </button>
          ))}
        </div>

        {/* Tech Stack Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { label: "React 18 & Vite", icon: Layers },
            { label: "Tailwind CSS", icon: Palette },
            { label: "Supabase DB", icon: Database },
            { label: "Inspection Code Direct", icon: Terminal }
          ].map((tech) => {
            const Icon = tech.icon;
            return (
              <div 
                key={tech.label} 
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-mono ${
                  isDark 
                    ? 'border border-white/[0.06] bg-white/[0.02] text-slate-400' 
                    : 'border border-slate-200/70 bg-white text-slate-600 shadow-2xs'
                }`}
              >
                <Icon size={12} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                <span>{tech.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
