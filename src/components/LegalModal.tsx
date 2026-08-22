import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Cookie, 
  Lock, 
  Sliders, 
  Check, 
  Copy, 
  Search, 
  ExternalLink,
  ChevronRight,
  Info,
  Server,
  UserCheck,
  Code
} from 'lucide-react';

export type LegalTabType = 'tos' | 'privacy' | 'cookies';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTabType;
  type?: 'tos' | 'privacy' | 'cookies'; // backward compatibility
  isDark?: boolean;
}

interface LegalSection {
  id: string;
  title: string;
  badge?: string;
  content: string[];
  bullets?: string[];
}

export const LegalModal: React.FC<LegalModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'privacy',
  type,
  isDark = true 
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(type || initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync tab when prop changes
  useEffect(() => {
    if (type) {
      setActiveTab(type);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [type, initialTab, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const triggerCookiePreferences = () => {
    onClose();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('trigger-cookie-guard'));
    }, 150);
  };

  const handleCopyText = () => {
    const sections = legalData[activeTab].sections;
    const fullText = legalData[activeTab].title + '\n\n' + 
      sections.map(s => `${s.title}\n${s.content.join('\n')}\n${s.bullets ? s.bullets.map(b => `• ${b}`).join('\n') : ''}`).join('\n\n');
    
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const legalData: Record<LegalTabType, {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    lastUpdated: string;
    sections: LegalSection[];
  }> = {
    tos: {
      title: "Conditions Générales d'Utilisation",
      subtitle: "Règles d'accès, utilisation du générateur IA et propriété intellectuelle",
      icon: <FileText className="text-orange-primary" size={20} />,
      lastUpdated: "Dernière mise à jour : 2026",
      sections: [
        {
          id: 'tos-1',
          title: "1. Objet et acceptation des conditions",
          badge: "Fondamental",
          content: [
            "Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation de la plateforme COOK IA (ci-après 'le Service').",
            "En accédant au site, en créant un compte ou en générant du code ou des applications web, vous acceptez sans réserve l'intégralité des présentes conditions. Si vous n'acceptez pas ces termes, vous devez cesser immédiatement d'utiliser le Service."
          ]
        },
        {
          id: 'tos-2',
          title: "2. Propriété Intellectuelle & Droits sur le Code Généré",
          badge: "100% Votre Propriété",
          content: [
            "Tous les fichiers sources, architectures logicielles, pages web HTML/CSS/JS, composants React, scripts et assets générés par COOK IA en réponse à vos demandes vous appartiennent intégralement.",
            "Vous disposez d'un droit de propriété exclusif, perpétuel et mondial sur l'ensemble du code généré. Vous êtes libre de l'exporter, le modifier, le déployer, l'héberger et le commercialiser sans aucune redevance.",
            "COOK IA et ses créateurs conservent la propriété exclusive de l'interface, des algorithmes d'orchestration multi-agents, de la marque, du logo et des technologies sous-jacentes de la plateforme."
          ],
          bullets: [
            "Le code généré est libre de droits pour un usage personnel ou commercial.",
            "Aucune redevance ou royalties n'est exigée sur les sites créés avec COOK IA.",
            "Vous êtes libre d'exporter vos projets en un clic au format ZIP ou de les déployer."
          ]
        },
        {
          id: 'tos-3',
          title: "3. Utilisation Acceptable & Règles de Conduite",
          badge: "Sécurité & Éthique",
          content: [
            "L'utilisateur s'engage à utiliser le Service dans le respect des lois et règlements en vigueur.",
            "Sont formellement interdits :"
          ],
          bullets: [
            "La génération de contenus illégaux, haineux, diffamatoires, discriminatoires ou violents.",
            "La création de logiciels malveillants (malwares, ransomwares, scripts de phishing ou d'exploitation de vulnérabilités).",
            "Toute tentative de saturation ou d'attaque par déni de service (DDoS) sur l'infrastructure de COOK IA.",
            "Le contournement des mécanismes d'authentification ou des quotas d'utilisation des modèles d'IA."
          ]
        },
        {
          id: 'tos-4',
          title: "4. Comptes, Authentification & Code de Vérification (OTP)",
          badge: "Authentification",
          content: [
            "Pour accéder à certaines fonctionnalités (sauvegarde dans le cloud, synchronisation des projets, déploiement), l'utilisateur peut se connecter via Google, GitHub, Magic Link ou par e-mail avec un mot de passe sécurisé et un code de vérification à usage unique (OTP).",
            "L'utilisateur est seul responsable de la confidentialité de ses identifiants et de son adresse e-mail. COOK IA ne vous demandera jamais votre mot de passe par message direct."
          ]
        },
        {
          id: 'tos-5',
          title: "5. Disponibilité du Service & Modèles d'IA",
          badge: "Infrastructure",
          content: [
            "COOK IA met en œuvre tous les moyens raisonnables pour assurer une disponibilité maximale du Service 24h/24 et 7j/7.",
            "Le Service utilise des modèles d'intelligence artificielle avancés. Bien que le moteur multi-agents effectue des tests et vérifications automatiques, le code généré est fourni 'en l'état'. L'utilisateur est invité à relire et tester ses applications avant toute mise en production critique."
          ]
        },
        {
          id: 'tos-6',
          title: "6. Limitation de Responsabilité & Droit Applicable",
          content: [
            "Dans la mesure permise par la loi, COOK IA ne saurait être tenu responsable des pertes de données, interruptions d'activité ou dommages indirects résultant de l'utilisation du Service.",
            "Les présentes conditions sont soumises au droit français et aux réglementations européennes en vigueur. Tout litige sera soumis aux tribunaux compétents."
          ]
        }
      ]
    },
    privacy: {
      title: "Politique de Confidentialité",
      subtitle: "Traitement des données personnelles, sécurité du cloud et conformité RGPD",
      icon: <ShieldCheck className="text-emerald-500" size={20} />,
      lastUpdated: "Dernière mise à jour : 2026",
      sections: [
        {
          id: 'priv-1',
          title: "1. Engagement de Confidentialité & Conformité RGPD",
          badge: "RGPD / GDPR",
          content: [
            "COOK IA attache une importance capitale à la protection de votre vie privée et de vos données personnelles.",
            "Nous appliquons les principes de minimisation des données : seules les données strictement nécessaires au bon fonctionnement de l'application et à la génération de vos projets sont traitées."
          ]
        },
        {
          id: 'priv-2',
          title: "2. Données Personnelles Collectées",
          badge: "Transparence",
          content: [
            "Nous pouvons collecter et traiter les catégories de données suivantes :"
          ],
          bullets: [
            "Données de compte : adresse e-mail, pseudonyme ou nom d'utilisateur, avatar lors d'une connexion OAuth (Google ou GitHub).",
            "Données de création : prompts textuels, instructions de design, fichiers de code source créés dans l'éditeur.",
            "Données techniques : type de navigateur, résolution d'écran (pour adapter le canvas de prévisualisation), adresse IP de session anonymisée, jeton de session JWT Supabase chiffré.",
            "Préférences locales : thème d'affichage (sombre/clair), langue sélectionnée (français/anglais), modèle d'IA sélectionné."
          ]
        },
        {
          id: 'priv-3',
          title: "3. Finalités du Traitement",
          content: [
            "Vos données sont exclusivement utilisées pour :"
          ],
          bullets: [
            "Fournir le service de génération de sites web et d'applications assisté par IA.",
            "Sauvegarder et restaurer vos projets, historiques de messages et paramètres personnalisés.",
            "Sécuriser votre compte via des protocoles d'authentification modernes (Magic Link, OTP chiffré, JWT).",
            "Optimiser la réactivité et la compatibilité de l'interface avec vos différents appareils (ordinateurs, tablettes, smartphones)."
          ]
        },
        {
          id: 'priv-4',
          title: "4. Hébergement Sécurisé & Protection des Clés API",
          badge: "Chiffrement AES-256",
          content: [
            "L'infrastructure de base de données est opérée via Supabase avec activation des règles de sécurité de niveau ligne (Row Level Security - RLS). Chaque utilisateur dispose d'un espace hermétique et isolé.",
            "Toutes les communications entre votre navigateur et nos serveurs sont protégées par le protocole HTTPS / SSL avec chiffrement de bout en bout.",
            "Vos requêtes vers les modèles d'intelligence artificielle transitent exclusivement par des serveurs proxy sécurisés côté backend : aucune clé API secrète n'est exposée sur votre navigateur."
          ]
        },
        {
          id: 'priv-5',
          title: "5. Non-Revente & Partage Limité des Données",
          badge: "Zéro Revente",
          content: [
            "COOK IA ne vend, ne loue et ne commercialise AUCUNE de vos données personnelles ou de vos codes sources à des tiers.",
            "Les seuls sous-traitants techniques intervenant sont les fournisseurs d'infrastructure essentiels (Supabase pour l'authentification et la base de données, Google Cloud pour l'inférence des modèles de langage), tous soumis à des accords stricts de protection des données."
          ]
        },
        {
          id: 'priv-6',
          title: "6. Vos Droits & Suppression des Données (Droit à l'Oubli)",
          badge: "Vos Droits",
          content: [
            "Conformément au Règlement Général sur la Protection des Données (RGPD), vous bénéficiez des droits suivants :"
          ],
          bullets: [
            "Droit d'accès et d'information sur vos données stockées.",
            "Droit de rectification de vos données et de votre nom d'utilisateur.",
            "Droit à l'effacement définitif (droit à l'oubli) : vous pouvez supprimer votre compte et tous vos projets associés à tout moment depuis les paramètres de votre compte.",
            "Droit à la portabilité : vous pouvez exporter l'intégralité de vos projets et codes sources au format ZIP."
          ]
        }
      ]
    },
    cookies: {
      title: "Politique des Cookies & Traceurs",
      subtitle: "Fonctionnement du stockage local, cookies essentiels et gestion de vos préférences",
      icon: <Cookie className="text-amber-500" size={20} />,
      lastUpdated: "Dernière mise à jour : 2026",
      sections: [
        {
          id: 'cook-1',
          title: "1. Qu'est-ce qu'un cookie et pourquoi COOK IA les utilise ?",
          badge: "Information",
          content: [
            "Un cookie ou élément de stockage local est un petit fichier texte déposé sur votre navigateur lors de votre visite.",
            "COOK IA utilise des cookies et le stockage local (LocalStorage / SessionStorage) dans un but purement technique : maintenir votre connexion, sauvegarder vos créations en cours, mémoriser vos préférences et adapter dynamiquement l'interface à votre écran."
          ]
        },
        {
          id: 'cook-2',
          title: "2. Types de Cookies & Stockage utilisés sur COOK IA",
          badge: "Catégories",
          content: [
            "Voici le détail transparent des mécanismes de stockage mis en œuvre :"
          ],
          bullets: [
            "Cookies strictement nécessaires (Obligatoires) : Gestion des jetons de session d'authentification chiffrés (Supabase JWT), sécurisation contre les requêtes contrefaites (CSRF) et persistance du statut de connexion.",
            "Stockage Local de Préférences (LocalStorage) : Mémorisation du thème sombre ou clair, de la langue choisie (FR/EN) et du modèle d'IA sélectionné (ex: Gemini 2.5 Flash).",
            "Cache de Génération IA : Conservation temporaire des messages et composants récents pour éviter les temps de chargement inutiles et permettre un travail fluide.",
            "Métriques de Résolution d'Affichage : Détection de la largeur d'écran et du ratio de pixels (DPR) pour adapter le canvas de prévisualisation en temps réel."
          ]
        },
        {
          id: 'cook-3',
          title: "3. Aucun Cookie Publicitaire ou Traçage Tiers Invasif",
          badge: "Zéro Pub",
          content: [
            "COOK IA n'utilise AUCUN cookie publicitaire, aucun traceur de reciblage commercial (retargeting) et aucun pixel d'analyse comportementale tierce non anonymisé.",
            "Vos interactions avec le générateur de code ne sont jamais partagées avec des régies publicitaires."
          ]
        },
        {
          id: 'cook-4',
          title: "4. Durée de Conservation des Cookies",
          content: [
            "Les cookies de session expirent à la fermeture de votre navigateur ou après une période d'inactivité de 30 jours pour les sessions connectées.",
            "Les préférences de stockage local (thème, langue) restent conservées sur votre appareil jusqu'à ce que vous décidiez de les effacer manuellement."
          ]
        },
        {
          id: 'cook-5',
          title: "5. Comment Contrôler & Modifier vos Préférences de Cookies ?",
          badge: "Contrôle Total",
          content: [
            "Vous disposez d'un contrôle total et immédiat sur les cookies et données stockées. Vous pouvez à tout moment :"
          ],
          bullets: [
            "Ouvrir le configurateur interactif de cookies de COOK IA pour activer ou désactiver les catégories secondaires.",
            "Effacer les cookies et le stockage local directement depuis les paramètres de votre navigateur (Chrome, Firefox, Safari, Edge).",
            "Naviguer en mode privé si vous ne souhaitez conserver aucune donnée après votre session."
          ]
        }
      ]
    }
  };

  const currentDoc = legalData[activeTab];

  // Filter sections based on search query
  const filteredSections = currentDoc.sections.filter(section => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = section.title.toLowerCase().includes(q);
    const matchContent = section.content.some(c => c.toLowerCase().includes(q));
    const matchBullets = section.bullets?.some(b => b.toLowerCase().includes(q));
    return matchTitle || matchContent || matchBullets;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className={`relative w-full max-w-3xl ${
              isDark ? 'bg-[#0E131F] text-slate-100 border border-white/10' : 'bg-white text-slate-900 border border-slate-200'
            } rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
          >
            {/* Top Bar with Title and Close Button */}
            <div className={`px-5 sm:px-8 py-5 border-b ${
              isDark ? 'border-white/[0.08] bg-[#0A0E18]/80' : 'border-slate-100 bg-slate-50/80'
            } flex items-center justify-between gap-4 shrink-0 backdrop-blur-sm`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-white/[0.06] border border-white/10' : 'bg-orange-50 border border-orange-200'
                }`}>
                  {currentDoc.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight truncate">
                      {currentDoc.title}
                    </h2>
                  </div>
                  <p className={`text-xs truncate ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    COOK IA • {currentDoc.lastUpdated}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyText}
                  title="Copier le texte"
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    copied 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : (isDark ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-slate-200 text-slate-600')
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
                </button>

                <button 
                  onClick={onClose}
                  aria-label="Fermer"
                  className={`p-2 rounded-xl transition-colors ${
                    isDark 
                      ? 'hover:bg-white/10 text-white/60 hover:text-white border border-white/5' 
                      : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Single-line, Responsive, No Wrap) */}
            <div className={`px-4 sm:px-8 py-3 border-b ${
              isDark ? 'border-white/[0.06] bg-[#0A0E18]/40' : 'border-slate-100 bg-slate-50/50'
            } flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide shrink-0`}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[
                  { id: 'tos' as LegalTabType, label: "Conditions d'utilisation", icon: <FileText size={14} /> },
                  { id: 'privacy' as LegalTabType, label: "Politique de confidentialité", icon: <ShieldCheck size={14} /> },
                  { id: 'cookies' as LegalTabType, label: "Politique des cookies", icon: <Cookie size={14} /> }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSearchQuery('');
                      }}
                      className={`whitespace-nowrap shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                        isActive
                          ? (isDark 
                              ? 'bg-orange-primary text-white shadow-md shadow-orange-950/50 font-bold' 
                              : 'bg-slate-900 text-white shadow-md font-bold')
                          : (isDark 
                              ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' 
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70')
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar filter */}
            <div className={`px-5 sm:px-8 py-2.5 border-b ${
              isDark ? 'border-white/[0.04] bg-[#0E131F]' : 'border-slate-100 bg-white'
            } flex items-center gap-2 shrink-0`}>
              <Search size={15} className={isDark ? 'text-white/40' : 'text-slate-400'} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Rechercher un terme dans ${currentDoc.title.toLowerCase()}...`}
                className={`w-full text-xs sm:text-sm bg-transparent focus:outline-none placeholder:${isDark ? 'text-white/30' : 'text-slate-400'} ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`p-1 rounded-full text-xs ${isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 scrollbar-hide">
              {/* Intro banner */}
              <div className={`p-4 rounded-2xl border ${
                isDark 
                  ? 'bg-white/[0.02] border-white/[0.08] text-white/80' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              } text-xs sm:text-sm leading-relaxed flex items-start gap-3`}>
                <Info size={18} className="text-orange-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{currentDoc.subtitle}</p>
                  <p className={`mt-1 text-xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    Chez COOK IA, nous garantissons la transparence totale : votre code vous appartient à 100%, vos données sont protégées par chiffrement et aucun cookie publicitaire tiers n'est utilisé.
                  </p>
                </div>
              </div>

              {/* Sections list */}
              {filteredSections.length === 0 ? (
                <div className="text-center py-12">
                  <Search size={32} className={`mx-auto mb-2 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
                  <p className={`text-sm font-semibold ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                    Aucun résultat trouvé pour « {searchQuery} »
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-xs text-orange-primary font-bold hover:underline"
                  >
                    Effacer la recherche
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredSections.map((section) => (
                    <div 
                      key={section.id} 
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isDark 
                          ? 'bg-[#121826] border-white/[0.06] hover:border-white/10' 
                          : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {section.title}
                        </h3>
                        {section.badge && (
                          <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                            isDark 
                              ? 'bg-orange-primary/15 text-orange-400 border border-orange-primary/30' 
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {section.badge}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {section.content.map((paragraph, pIdx) => (
                          <p 
                            key={pIdx} 
                            className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}
                          >
                            {paragraph}
                          </p>
                        ))}

                        {section.bullets && section.bullets.length > 0 && (
                          <ul className="mt-3 space-y-2 pl-2">
                            {section.bullets.map((bullet, bIdx) => (
                              <li 
                                key={bIdx} 
                                className={`text-xs sm:text-sm leading-relaxed flex items-start gap-2 ${isDark ? 'text-white/85' : 'text-slate-700'}`}
                              >
                                <span className="text-orange-primary font-bold text-base leading-none">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Extra cookie configuration banner if in cookies tab */}
              {activeTab === 'cookies' && (
                <div className={`p-5 rounded-2xl border ${
                  isDark 
                    ? 'bg-gradient-to-r from-orange-primary/10 to-amber-500/10 border-orange-primary/25 text-white' 
                    : 'bg-orange-50/70 border-orange-200 text-slate-900'
                } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-primary/20 flex items-center justify-center text-orange-primary shrink-0">
                      <Sliders size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Personnaliser vos Cookies en Direct</h4>
                      <p className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                        Configurez individuellement vos clés de stockage et sessions Supabase.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={triggerCookiePreferences}
                    className="whitespace-nowrap px-4 py-2 bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
                  >
                    <Sliders size={14} />
                    <span>Gérer mes cookies</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className={`px-5 sm:px-8 py-4 border-t ${
              isDark ? 'border-white/[0.08] bg-[#0A0E18]' : 'border-slate-100 bg-slate-50'
            } flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0`}>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} className="text-emerald-500" />
                <span>Protection des Données et Propriété Certifiées par COOK IA</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {activeTab === 'cookies' && (
                  <button 
                    onClick={triggerCookiePreferences}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isDark 
                        ? 'border-white/10 hover:bg-white/5 text-white/80 hover:text-white' 
                        : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    } flex items-center justify-center gap-1.5`}
                  >
                    <Sliders size={14} />
                    <span>Préférences Cookies</span>
                  </button>
                )}

                <button 
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-orange-primary hover:bg-orange-hover text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>J'ai compris / Fermer</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
