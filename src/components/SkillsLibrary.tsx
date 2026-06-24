import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  Code, 
  Layout, 
  Smartphone, 
  Compass, 
  Cpu, 
  Send,
  Sliders,
  ShieldCheck,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

interface Skill {
  id: string;
  title: string;
  category: 'UX/UI' | 'Performance' | 'Web 3D' | 'E-commerce' | 'Interactivité';
  description: string;
  detailedGuide: string;
  promptExample: string;
  technicalRule: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
}

interface SkillsLibraryProps {
  isDark: boolean;
  onInjectPrompt: (promptText: string) => void;
}

export const SkillsLibrary: React.FC<SkillsLibraryProps> = ({ isDark, onInjectPrompt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const skills: Skill[] = [
    {
      id: 'bento-grid',
      title: 'Organisation en Grille "Bento UI"',
      category: 'UX/UI',
      difficulty: 'Intermédiaire',
      description: 'Compartimente les informations complexes de manière visuelle et hautement esthétique à l\'aide de blocs asymétriques animés.',
      detailedGuide: 'Utile pour les dashboards d\'administration, les vitrines de fonctionnalités SaaS ou les portfolios. Aligne les informations de manière asynchrone avec un contraste saisissant.',
      promptExample: 'Crée un dashboard d\'outils financiers en utilisant une grille Bento de 5 blocs de tailles différentes. Utilise des ombres froides, des bordures élégantes foncées, chaque bloc affichera un micro-graphique différent (revenus, conversions, balance) et aura un effet de survol dynamique.',
      technicalRule: 'L\'IA s\'appuie sur D3/Recharts et Tailwind CSS (`grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6`) en harmonisant les alignements d\'angles.',
      icon: Layout
    },
    {
      id: 'dark-cosmic',
      title: 'Sombre Spatial & Minimalisme Pur',
      category: 'UX/UI',
      difficulty: 'Expert',
      description: 'L\'identité visuelle emblématique des technologies modernes : contrastes obscurs, halos de lumière lointaine et typographies ciselées.',
      detailedGuide: 'Inspiré des plus grandes vitrines technologiques du web, ce style intègre des dégradés de gris profonds, des lueurs arrières (glows) colorés activés au survol et des arrière-plans étoilés. Recommandé pour les applications tech d\'avant-garde, les applications mobiles IA et les portails d\'ingénieurs facétieux.',
      promptExample: 'Je veux une landing page sombre spatiale haute fidélité pour une IA de sécurité. Le fond doit être noir pur avec un halo radial bleu profond et orange subtil. Utilise la police Space Grotesk pour les grands titres contrastés en lettres majuscules d\'aspect brutaliste chic.',
      technicalRule: 'L\'IA injecte des filtres d\'effets transparents avec d\'élégants `backdrop-blur-xl` alliés à des dégradés radiaux CSS personnalisés.',
      icon: Compass
    },
    {
      id: 'mobile-touch',
      title: 'Optimisation Tactile "Mobile-First"',
      category: 'Performance',
      difficulty: 'Débutant',
      description: 'Des structures fluides et compactes garantissant une navigation irréprochable et ergonomique à une seule main sur smartphone.',
      detailedGuide: 'Assure une conformité stricte aux standards d\'accessibilité avec des zones de touche minimales de 44px, un menu tiroir (drawer) monté depuis le bas, et un scroll tactile extrêmement fluide.',
      promptExample: 'Réalise une application mobile-first de livraison de repas gastronomiques très épurée. Les boutons d\'action majeurs doivent être d\'au moins 48px de hauteur, placés de manière ergonomique près du bas de l\'écran pour une utilisation confortable à une seule main.',
      technicalRule: 'L\'IA configure systématiquement Tailwind avec des ratios flexibles (`h-[44px]`, `px-6 py-3`) et évite le sur-encombrement horizontal sur petit écran.',
      icon: Smartphone
    },
    {
      id: 'e-commerce-luxury',
      title: 'E-commerce Expérientiel & Luxe',
      category: 'E-commerce',
      difficulty: 'Expert',
      description: 'Vitrine d\'exposition de produits d\'exception. Typographies à empattement de prestige, galeries épurées et animations soyeuses du panier.',
      detailedGuide: 'Idéal pour l\'automobile haut de gamme, l\'horlogerie de luxe, le design intérieur et la mode d\'élite. Une interface respirant le luxe par le biais d\'importants espaces blancs de respiration.',
      promptExample: 'Conçois une boutique e-commerce épurée de parfums de luxe d\'inspiration parisienne. Utilise une police sérif d\'aspect éditorial pour les titres, des images de flacons de parfum spacieux de haute qualité, un bouton d\'ajout de produit interactif, et un tiroir latéral affichant le récapitulatif du panier d\'achat.',
      technicalRule: 'L\'IA couple un état réactif simple (React state) pour le panier avec des transitions douces lors des ajouts de produits au panier.',
      icon: ShoppingBag
    },
    {
      id: 'micro-feedback',
      title: 'Transitions & Micro-interactions',
      category: 'Interactivité',
      difficulty: 'Intermédiaire',
      description: 'Rapproche le site d\'une application native en ajoutant des animations d\'entrée en cascade et des réactions instantanées de survol de curseur.',
      detailedGuide: 'Utilise la bibliothèque Motion de React pour animer l\'entrée d\'éléments avec un délai progressif (staggering) et ajouter des rétroactions physiques légères lors des clics sur des boutons.',
      promptExample: 'Crée un site web d\'agence créative en insérant des animations d\'entrée graduelles pour les sections au défilement. Les boutons doivent grandir légèrement au survol et rapetisser au clic. Ajoute un effet d\'icône rotative ou d\'icône rebondissante discrète.',
      technicalRule: 'L\'IA intègre l\'écosystème `motion/react` avec des constantes de ressort (`useSpring`, damping) pour un confort d\'interaction naturel.',
      icon: Cpu
    },
    {
      id: 'cinematic-space',
      title: 'Cinématique de l\'Espace & Verre Liquide',
      category: 'UX/UI',
      difficulty: 'Expert',
      description: 'Design ultra-immersif basé sur deux sections plein écran, vidéos d\'arrière-plan en fondu enchaîné JS (requestAnimationFrame), et flous de verre liquide (Liquid Glass).',
      detailedGuide: 'Style de très haute fidélité réservé aux vitrines d\'exception. Utilise les polices Instrument Serif (pour l\'élégance des titres penchés) et Barlow (pour la lisibilité futuriste).',
      promptExample: 'Build Prompt: Cinematic Space-Travel Landing Page\nBuild a single-page landing site with two full-height sections (Hero + Capabilities), both using looping background videos with custom JS crossfade, a shared liquid-glass design system, and Framer Motion entrance animations. Body is bg: #000. Use Instrument Serif (italic heading) & Barlow (body font), custom .liquid-glass class definitions, and smooth custom JS FadingVideo looping.',
      technicalRule: 'L\'IA configure des styles CSS `.liquid-glass` et `.liquid-glass-strong` avec dégradé interne et masquage, et couple cela à un composant de fondu JS programmé avec requestAnimationFrame.',
      icon: Sparkles
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.promptExample.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || skill.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'UX/UI', 'Performance', 'Web 3D', 'E-commerce', 'Interactivité'];

  return (
    <div className={`flex-1 flex flex-col p-4 md:p-8 overflow-y-auto ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFBFC] text-slate-900'} w-full max-w-7xl mx-auto`}>
      {/* Banner/Header */}
      <div className="mb-8 relative rounded-3xl p-6 md:p-10 overflow-hidden border border-blue-500/10 bg-gradient-to-br from-blue-600/10 via-amber-500/5 to-transparent shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 ${
              isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600'
            }`}>
              <Sparkles size={14} className="animate-spin-slow text-amber-500 fill-amber-500" />
              CONCEPTION IMMERSIVE AVEC COOK IA
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase font-display bg-gradient-to-r from-blue-500 via-teal-400 to-amber-500 bg-clip-text text-transparent filter drop-shadow-sm">
              Bibliothèque de Skills
            </h1>
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              Ces fiches de compétences guident l'IA dans l'art d'architecturer des sites web remarquables, 
              fluides et performants, et vous enseignent d'excellentes mécaniques de prompting.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-black/30 border-white/5' : 'bg-white border-slate-200'} shrink-0 max-w-sm`}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-500">Mode Système Intouchable</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed">
              Ces fiches techniques font partie des directives de l'IA (comme sur Claude). Vous pouvez les lire, les copier ou les injecter pour commander l'IA de manière optimale.
            </p>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-8">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark 
                    ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'Tous les Skills' : cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[280px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' 
                : 'bg-white border-slate-200 text-slate-950 focus:border-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Grid of Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredSkills.map((skill) => {
          const IconComponent = skill.icon;
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border transition-all hover:shadow-xl flex flex-col ${
                isDark 
                  ? 'bg-[#121316]/50 border-white/5 hover:border-blue-500/20' 
                  : 'bg-white border-slate-200 hover:border-blue-500/20'
              }`}
            >
              {/* Card Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'
                }`}>
                  <IconComponent size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-full">
                      {skill.category}
                    </span>
                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${
                      skill.difficulty === 'Expert' 
                        ? 'text-purple-500 bg-purple-500/5' 
                        : skill.difficulty === 'Intermédiaire'
                          ? 'text-amber-500 bg-amber-500/5'
                          : 'text-emerald-500 bg-emerald-500/5'
                    }`}>
                      {skill.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mt-2 font-display tracking-tight leading-none">
                    {skill.title}
                  </h3>
                  <p className={`text-xs mt-2 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                    {skill.description}
                  </p>
                </div>
              </div>

              {/* Card Body & Prompt Snippet */}
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-black text-slate-400 dark:text-white/30 mb-1.5 flex items-center gap-1.5">
                    <Sliders size={12} />
                    Règle technique de l'IA (Non modifiable)
                  </h4>
                  <div className={`p-3 rounded-xl text-xs font-semibold font-mono ${
                    isDark ? 'bg-[#07080a] text-zinc-300' : 'bg-slate-50 text-slate-700'
                  }`}>
                    {skill.technicalRule}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-[10px] uppercase tracking-wider font-black text-slate-400 dark:text-white/30 flex items-center gap-1.5">
                      <Code size={12} />
                      Exemple de Prompt Conseillé
                    </h4>
                    <button
                      onClick={() => handleCopy(skill.promptExample, skill.id)}
                      className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                        copiedId === skill.id 
                          ? 'text-emerald-500 bg-emerald-500/10' 
                          : 'text-blue-500 hover:bg-blue-500/10'
                      }`}
                    >
                      {copiedId === skill.id ? (
                        <>
                          <Check size={12} />
                          Copié!
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copier
                        </>
                      )}
                    </button>
                  </div>
                  <div className={`p-4 rounded-xl text-xs flex-1 flex flex-col justify-between font-mono italic leading-relaxed border ${
                    isDark ? 'bg-[#0d0e12] border-white/5 text-white/80' : 'bg-[#F1F3F5] border-slate-200 text-slate-700'
                  }`}>
                    <p className="line-clamp-4">"{skill.promptExample}"</p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className={`p-4 border-t px-6 flex items-center justify-between ${
                isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'
              }`}>
                <span className="text-[10px] text-slate-400 dark:text-white/20 select-none font-mono">
                  Cook IA Engine v1.0
                </span>
                
                <button
                  onClick={() => onInjectPrompt(skill.promptExample)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-blue-600/20 active:scale-95 cursor-pointer"
                >
                  <Send size={12} className="fill-white" />
                  Utiliser ce Skill
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className={`py-16 text-center border border-dashed rounded-3xl ${
          isDark ? 'border-white/10 text-white/30' : 'border-slate-200 text-slate-400'
        }`}>
          <Layout size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold">Aucun skill ne correspond à votre recherche.</p>
          <button onClick={() => { setActiveCategory('all'); setSearchQuery(''); }} className="text-blue-500 text-xs underline mt-2 font-black">
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
};
