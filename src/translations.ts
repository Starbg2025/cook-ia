export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    // Landing navigation
    concept: "Concept",
    agents: "Équipe d'Agents",
    tech: "Infrastructures",
    guarantees: "Garanties",
    launchConsole: "Lancer la Console",
    launchCookIA: "Lancer Cook IA",
    
    // Hero
    tagline: "Moteur Multi-Agent de Troisième Génération v.3.5",
    titleLine1: "VOS IDÉES,",
    titleLine2: "MATÉRIALISÉES",
    heroDesc: "L'intelligence artificielle d'élite qui ne se contente pas de coder, elle forge des écosystèmes full-stack complets en quelques secondes.",
    
    // Console Input Section
    agentsConnected: "EXPERTS CONNECTÉS",
    activeLatency: "Latence Active",
    latencyCache: "Latence Cache",
    placeholderInput: "Saisissez votre idée de site web (ex: Un dashboard crypto style cyberpunk avec flux en direct)...",
    forgeBtn: "Forger ce Projet",
    systemStatus: "Statut Système : OPÉRATIONNEL",
    synapseConnected: "Canal Synaptique Sécurisé",
    
    // Depth navigation
    depth0: "SURFACE : LE RÊVE",
    depth500: "AUTOROUTE SYNAPTIQUE",
    depth1000: "LOGISTIQUE INTERNE",
    depth1500: "CHAMP DE CONFIANCE",
    
    // Depth sections
    ideasTitle: "CONCEVEZ SANS LIMITES",
    ideasDesc: "Sélectionnez une architecture de référence pour démarrer instantanément ou écrivez précisément vos besoins.",
    agentsTitle: "LE DESIGN SYNERGIQUE MULTI-AGENTS",
    agentsDesc: "Plusieurs experts spécialisés collaborent en parallèle pour composer l'identité visuelle, concevoir le routage réactif et assembler des layouts haut de gamme.",
    techTitle: "ARCHITECTURE ET PERFORMANCE SÉCURISÉE",
    techDesc: "Une infrastructure solide combinant le rendu optimal de Vite, la réactivité globale de Supabase, et l'excellence sémantique de Gemini.",
    guaranteesTitle: "QUALITÉ DE PRODUCTION CERTIFIÉE",
    guaranteesDesc: "Chaque projet subit un cycle complet de tests de performance et de résilience structurelle.",
    
    // Stats cards
    statsProjects: "PROJETS FORGÉS",
    statsProjectsDesc: "Du site SaaS aux vitrines élégantes.",
    statsTime: "M-TIME GÉNÉRATION",
    statsTimeDesc: "Compilation multi-agent quasi-instantanée.",
    statsPersist: "PERSISTANCE SÉCURISÉE",
    statsPersistDesc: "Clés API privées stockées localement de de bout en bout.",
    statsAvailability: "TAUX DISPONIBILITÉ",
    statsAvailabilityDesc: "Infrastructures Cloud optimisées en permanence.",
    
    // Why Cook IA
    whyTitle: "POURQUOI CHOISIR COOK IA ?",
    whyBody1: "Traditionnellement, créer une application full-stack prend des semaines, voire des mois de mise au point. Avec Cook IA, nous condensons et ordonnons ce processus à quelques minutes, sans compromettre la flexibilité ou l'architecture de votre code réactif.",
    whyCard1Title: "Aesthetic Premium Default",
    whyCard1Desc: "Oubliez les thèmes génériques. Chaque projet hérite par défaut de designs contemporains soignés et d'ombrages élégants.",
    whyCard2Title: "Sandboxing de Haute Densité",
    whyCard2Desc: "Testez votre application instantanément dans un iframe isolé prêt pour le déploiement.",
    whyCard3Title: "Export Structurel Propre",
    whyCard3Desc: "Un code modulaire prêt pour la production. Aucun framework propriétaire bloquant.",
    
    // Prompt suggestions
    promptSaaS: "Forger un site de SaaS financier avec graphiques Recharts interactifs et thème sombre de luxe",
    promptEcom: "Forger un site e-commerce de vélos rétro avec panier interactif et filtres de recherche",
    promptPortfolio: "Forger un Portfolio de Développeur minimaliste et sombre avec filtre de projets 3D/IA",
    
    // Workspace (App.tsx UI)
    backToHome: "Retour à l'accueil",
    downloadCode: "Télécharger HTML",
    deployBtn: "Mettre en ligne",
    deployStatus0: "Non publié",
    deploying: "Publication en cours...",
    deployed: "En ligne !",
    shareText: "Partagez ce lien avec vos amis :",
    copyBtn: "Copier le lien",
    copied: "Copié !",
    openPreview: "Agrandir l'Iframe",
    viewFiles: "Explorateur",
    promptPlaceholderWorkspace: "Envoyez une consigne ou des modifications à COOK IA...",
    sendBtn: "Forger",
    abortBtn: "Arrêter",
    statusPreparing: "Mise au point de l'algorithme...",
    statusAnalyse: "Analyse de votre demande...",
    statusGenerating: "Création des fichiers sources HTML/JSX/Tailwind...",
    historyTitle: "Historique",
    settingsTitle: "Réglages",
    secretsTab: "Secrets & Clés API",
    modelTab: "Thème & Modèles",
    
    // Footer / legal
    rights: "Tous droits réservés.",
    byCookIA: "Créé de manière premium avec Cook IA"
  },
  en: {
    // Landing navigation
    concept: "Concept",
    agents: "Agents Team",
    tech: "Infrastructures",
    guarantees: "Guarantees",
    launchConsole: "Launch Console",
    launchCookIA: "Start Cook IA",
    
    // Hero
    tagline: "Third Generation Multi-Agent Engine v.3.5",
    titleLine1: "YOUR IDEAS,",
    titleLine2: "MATERIALIZED",
    heroDesc: "The elite artificial intelligence that does not just write code—it fires up and builds complete full-stack ecosystems in seconds.",
    
    // Console Input Section
    agentsConnected: "AGENTS CONNECTED",
    activeLatency: "Active Latency",
    latencyCache: "Latency Cache",
    placeholderInput: "Type your website concept (e.g., A cyberpunk crypto dashboard with live-updating charts)...",
    forgeBtn: "Forge this Project",
    systemStatus: "System Status: OPERATIONAL",
    synapseConnected: "Secure Synaptic Channel",
    
    // Depth navigation
    depth0: "SURFACE: THE DREAM",
    depth500: "SYNAPTIC HIGHWAY",
    depth1000: "INTERNAL LOGISTICS",
    depth1500: "TRUST FIELD",
    
    // Depth sections
    ideasTitle: "DESIGN WITHOUT LIMITS",
    ideasDesc: "Choose a reference template to bootstrap instantly or write down your precise requirements.",
    agentsTitle: "SYNERGISTIC MULTI-AGENTS COLLABORATION",
    agentsDesc: "Several specialized agents collaborate in parallel to curate visual identity, design responsive routing, and compile elegant bento layouts.",
    techTitle: "SECURE PERFORMANCE & INFRASTRUCTURE",
    techDesc: "A stable modern core blending the high-speed rendering of Vite, responsive global queries of Supabase, and semantic excellence of Gemini.",
    guaranteesTitle: "CERTIFIED PRODUCTION QUALITY",
    guaranteesDesc: "Every project undergoes strict automation cycles tracking layout coherence, styling anomalies, and cross-device scaling.",
    
    // Stats cards
    statsProjects: "FORGED PROJECTS",
    statsProjectsDesc: "From SaaS templates to elegant landing pages.",
    statsTime: "M-TIME GENERATION",
    statsTimeDesc: "Nearly instantaneous multi-agent compilation.",
    statsPersist: "SECURE PERSISTENCE",
    statsPersistDesc: "Your private API secrets remain stored locally end-to-end.",
    statsAvailability: "CLOUD AVAILABILITY",
    statsAvailabilityDesc: "Highly audited server infrastructures running 24/7.",
    
    // Why Cook IA
    whyTitle: "WHY CHOOSE COOK IA?",
    whyBody1: "Traditionally, building a full-stack web application takes weeks, if not months of fine-tuning. With Cook IA, we streamline and sequence this cycle into minutes, with zero compromise on codebase modularity and design details.",
    whyCard1Title: "Premium Aesthetic by Default",
    whyCard1Desc: "Skip boring boilerplate. Every project inherits rich palettes, clean alignment, and refined glassmorphism cards.",
    whyCard2Title: "High-Density App Sandboxing",
    whyCard2Desc: "Inspect, test, and interact with your responsive application instantly inside a highly secure sandbox environment.",
    whyCard3Title: "Clean Code Exports",
    whyCard3Desc: "Fully modular standard ES code ready for production. Avoid complex proprietary dependencies and lock-ins.",
    
    // Prompt suggestions
    promptSaaS: "Forge a fintech SaaS app with live-updating interactive Recharts and a luxurious dark slate palette",
    promptEcom: "Forge a stylish retro bicycle e-commerce site with full shopping cart, item counts, and quick product filters",
    promptPortfolio: "Forge a minimal, elegant personal portfolio displaying live animated projects and interactive visual grids",
    
    // Workspace (App.tsx UI)
    backToHome: "Back to Home",
    downloadCode: "Download HTML",
    deployBtn: "Publish Site",
    deployStatus0: "Not Published",
    deploying: "Publishing to Web...",
    deployed: "Go Live!",
    shareText: "Share this URL with anyone:",
    copyBtn: "Copy Link",
    copied: "Copied!",
    openPreview: "Expand Preview",
    viewFiles: "File Explorer",
    promptPlaceholderWorkspace: "Send an amendment or style prompt to COOK IA...",
    sendBtn: "Forge",
    abortBtn: "Cancel",
    statusPreparing: "Curating compilation vectors...",
    statusAnalyse: "Deconstructing prompt guidelines...",
    statusGenerating: "Compiling HTML/JSX components and styling frameworks...",
    historyTitle: "History",
    settingsTitle: "Configuration",
    secretsTab: "Secrets & API Keys",
    modelTab: "Theme & Engine",
    
    // Footer / legal
    rights: "All rights reserved.",
    byCookIA: "Crafted with premium quality using Cook IA"
  }
};
