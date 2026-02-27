import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'tos' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  const content = {
    tos: {
      title: "Conditions d'Utilisation",
      sections: [
        {
          title: "1. Acceptation des conditions",
          text: "En accédant et en utilisant COOK IA, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service."
        },
        {
          title: "2. Description du service",
          text: "COOK IA est une plateforme de génération de sites web assistée par intelligence artificielle. Nous fournissons des outils pour créer, prévisualiser et déployer des applications web."
        },
        {
          title: "3. Propriété intellectuelle",
          text: "Le code généré par COOK IA vous appartient. Cependant, la plateforme elle-même, ses algorithmes et son interface restent la propriété exclusive de COOK IA."
        },
        {
          title: "4. Utilisation acceptable",
          text: "Vous vous engagez à ne pas utiliser le service pour générer du contenu illégal, haineux, diffamatoire ou portant atteinte aux droits de tiers."
        },
        {
          title: "5. Limitation de responsabilité",
          text: "COOK IA est fourni 'en l'état'. Nous ne garantissons pas que le service sera ininterrompu ou sans erreur. Nous ne sommes pas responsables des dommages directs ou indirects résultant de l'utilisation du service."
        }
      ]
    },
    privacy: {
      title: "Politique de Confidentialité",
      sections: [
        {
          title: "1. Collecte des données",
          text: "Nous collectons les informations que vous nous fournissez directement (email, nom d'utilisateur) ainsi que des données d'utilisation anonymisées pour améliorer notre service."
        },
        {
          title: "2. Utilisation des données",
          text: "Vos données sont utilisées pour gérer votre compte, personnaliser votre expérience et vous envoyer des informations importantes concernant le service."
        },
        {
          title: "3. Partage des données",
          text: "Nous ne vendons jamais vos données personnelles à des tiers. Nous pouvons partager des données avec des prestataires de services (comme Supabase pour l'authentification) uniquement pour le fonctionnement du service."
        },
        {
          title: "4. Cookies",
          text: "Nous utilisons des cookies pour maintenir votre session et analyser le trafic sur notre site."
        },
        {
          title: "5. Vos droits",
          text: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits depuis vos paramètres de compte."
        }
      ]
    }
  };

  const currentContent = content[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#141414] border border-white/10 rounded-[32px] p-8 lg:p-12 shadow-2xl text-white overflow-y-auto max-h-[80vh] scrollbar-hide"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">{currentContent.title}</h2>
              <div className="h-1 w-12 bg-orange-primary rounded-full" />
            </div>

            <div className="space-y-8">
              {currentContent.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-semibold text-white/90">{section.title}</h3>
                  <p className="text-white/50 leading-relaxed text-[15px]">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <button 
                onClick={onClose}
                className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-white/90 transition-all"
              >
                J'ai compris
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
