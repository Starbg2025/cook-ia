import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Bell, 
  User, 
  Shield, 
  Lock, 
  Users, 
  Database, 
  Sparkles, 
  ChevronDown, 
  Globe, 
  Smartphone,
  Trash2,
  ExternalLink,
  Plus,
  Github,
  FileText,
  Layout,
  Loader2,
  Activity
} from 'lucide-react';
import { supabase } from '../services/supabaseService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
  user: any;
}

type TabType = 'general' | 'notifications' | 'personalization' | 'applications' | 'data' | 'security' | 'parental' | 'account' | 'help' | 'sites' | 'policy' | 'watchdog' | 'admin';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialTab = 'general', user }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'parent' | 'child' | null>(null);
  
  // Profile editing state
  const [editUsername, setEditUsername] = useState(user?.profile?.username || '');
  const [editFullName, setEditFullName] = useState(user?.profile?.full_name || user?.user_metadata?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);

  // Help form state
  const [helpSubject, setHelpSubject] = useState('');
  const [helpMessage, setHelpMessage] = useState('');
  const [isSubmittingHelp, setIsSubmittingHelp] = useState(false);

  // Sites management state
  const [publishedSites, setPublishedSites] = useState<any[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editSiteSlug, setEditSiteSlug] = useState('');

  // Watchdog state
  const [watchdogData, setWatchdogData] = useState<any>(null);
  const [isRefreshingWatchdog, setIsRefreshingWatchdog] = useState(false);

  // Admin state
  const [adminData, setAdminData] = useState<{
    users: any[];
    sites: any[];
    conversations: any[];
    onlineUsers: any[];
  }>({ users: [], sites: [], conversations: [], onlineUsers: [] });
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setEditUsername(user?.profile?.username || '');
      setEditFullName(user?.profile?.full_name || user?.user_metadata?.full_name || '');
    }
  }, [isOpen, initialTab]);

  React.useEffect(() => {
    if (isOpen) {
      if (activeTab === 'sites') {
        loadPublishedSites();
      }
      if (activeTab === 'watchdog') {
        loadWatchdogStatus();
      }
      if (activeTab === 'admin' && user?.email === 'benit800@gmail.com') {
        loadAdminData();
        const cleanup = setupPresence();
        return cleanup;
      }
    }
  }, [activeTab, isOpen]);

  const setupPresence = () => {
    if (user?.email !== 'benit800@gmail.com') return;

    const channel = supabase.channel('online_users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = Object.values(state).flat();
        setAdminData(prev => ({ ...prev, onlineUsers: online }));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const loadAdminData = async () => {
    setIsAdminLoading(true);
    try {
      const [usersRes, sitesRes, convsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('published_sites').select('*'),
        supabase.from('conversations').select('*')
      ]);

      setAdminData(prev => ({
        ...prev,
        users: usersRes.data || [],
        sites: sitesRes.data || [],
        conversations: convsRes.data || []
      }));
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsAdminLoading(false);
    }
  };

  const loadWatchdogStatus = async () => {
    setIsRefreshingWatchdog(true);
    try {
      const res = await fetch('/api/watchdog/status');
      const data = await res.json();
      setWatchdogData(data);
    } catch (error) {
      console.error("Error loading watchdog status:", error);
    } finally {
      setIsRefreshingWatchdog(false);
    }
  };

  const loadPublishedSites = async () => {
    if (!user) return;
    setIsLoadingSites(true);
    try {
      const { data, error } = await supabase
        .from('published_sites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPublishedSites(data || []);
    } catch (error: any) {
      console.error("Error loading sites:", error);
    } finally {
      setIsLoadingSites(false);
    }
  };

  const handleUpdateSite = async (id: string) => {
    if (!editSiteSlug.trim()) return;
    try {
      const { error } = await supabase
        .from('published_sites')
        .update({ slug: editSiteSlug })
        .eq('id', id);
      
      if (error) throw error;
      alert('Site mis à jour !');
      setEditingSiteId(null);
      loadPublishedSites();
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) return;
    try {
      const { error } = await supabase
        .from('published_sites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setPublishedSites(prev => prev.filter(s => s.id !== id));
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: editUsername,
          full_name: editFullName,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      alert('Profil mis à jour avec succès !');
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage.trim() || !user) return;

    setIsSubmittingHelp(true);
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert([{
          user_id: user.id,
          subject: helpSubject || 'Demande d\'aide',
          message: helpMessage,
          status: 'open'
        }]);
      
      if (error) throw error;
      
      alert('Votre message a été envoyé ! Nous vous répondrons dès que possible.');
      setHelpSubject('');
      setHelpMessage('');
      setActiveTab('general');
    } catch (error: any) {
      alert(`Erreur lors de l'envoi : ${error.message}`);
    } finally {
      setIsSubmittingHelp(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'personalization', label: 'Personnalisation', icon: Sparkles },
    { id: 'applications', label: 'Applications', icon: Smartphone },
    { id: 'data', label: 'Gestion des données', icon: Database },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'parental', label: 'Contrôles parentaux', icon: Users },
    { id: 'sites', label: 'Mes Sites', icon: Layout },
    { id: 'watchdog', label: 'Architecture Watchdog', icon: Activity },
    ...(user?.email === 'benit800@gmail.com' ? [{ id: 'admin', label: 'Admin Panel', icon: Shield }] : []),
    { id: 'policy', label: 'Politique d\'utilisation', icon: FileText },
    { id: 'account', label: 'Compte', icon: User },
    { id: 'help', label: 'Aide', icon: HelpCircleIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Lock size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Sécurisation de votre compte</h3>
                  <p className="text-sm text-white/40 mb-4">
                    Ajoutez une authentification multifacteur (MFA), avec une clé d'accès ou un message texte par exemple, pour protéger votre compte au moment de la connexion.
                  </p>
                  <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-all">
                    Configurer la MFA
                  </button>
                </div>
                <button className="text-white/20 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/20">Fonctionnalités Avancées</h4>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Accélération Matérielle (3D)</span>
                  <p className="text-[11px] text-white/30">Optimise le rendu des éléments Three.js et des animations complexes.</p>
                </div>
                <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Mode Développeur</span>
                  <p className="text-[11px] text-white/30">Affiche des informations techniques détaillées lors de la génération.</p>
                </div>
                <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Thème</span>
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  Système <ChevronDown size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Couleur d'accentuation</span>
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  <div className="w-3 h-3 rounded-full bg-white/40" /> Par défaut <ChevronDown size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Langue</span>
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  Détection automatique <ChevronDown size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium">Langue parlée</span>
                  <p className="text-[11px] text-white/30 max-w-[400px]">
                    Pour de meilleurs résultats, sélectionnez votre langue principale. Même si elle ne figure pas dans la liste, elle sera peut-être quand même prise en charge via la détection automatique.
                  </p>
                </div>
                <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                  Détection automatique <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              {[
                { label: 'Réponses', desc: 'Recevoir une notification lorsque COOK IA répond à des demandes qui prennent du temps.' },
                { label: 'Conversations de groupe', desc: 'Vous recevrez des notifications pour les nouveaux messages dans les chats de groupe.' },
                { label: 'Tâches', desc: 'Recevez des notifications lorsque les tâches que vous avez créées sont mises à jour.' },
                { label: 'Projects', desc: 'Recevez une notification à la réception d\'une invitation par e-mail à rejoindre un projet partagé.' },
                { label: 'Recommandations', desc: 'Soyez toujours informé des dernières nouveautés de COOK IA (outils, fonctionnalités, conseils).' },
                { label: 'Utilisation', desc: 'Nous vous informerons lorsque vos limites relatives aux plans sont atteintes.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start justify-between border-b border-white/5 pb-6 last:border-0">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <p className="text-xs text-white/40 max-w-[400px]">{item.desc}</p>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                    {i === 0 || i === 1 ? 'Notifications push' : i === 3 ? 'E-mail' : 'Push, e-mail'} <ChevronDown size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'personalization':
        return (
          <div className="space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium">Style et ton des réponses</span>
                <p className="text-xs text-white/40">Définissez le style et le ton des réponses de COOK IA. Ce réglage n'affecte pas ses fonctionnalités.</p>
              </div>
              <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                Par défaut <ChevronDown size={14} />
              </button>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/20">Caractéristiques</h4>
              {[
                { label: 'Chaleureux' },
                { label: 'Enthousiaste' },
                { label: 'Titres et listes' },
                { label: 'Émojis' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                    Par défaut <ChevronDown size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/20">Instructions personnalisées</h4>
              <textarea 
                placeholder="Préférences supplémentaires de comportement, de style et de ton"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold">À propos de vous</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Alias</span>
                <button className="text-sm text-white/40 hover:text-white transition-colors">Modifier</button>
              </div>
            </div>
          </div>
        );
      case 'account':
        const avatarUrl = user?.profile?.avatar_url || user?.user_metadata?.avatar_url;
        const displayName = user?.profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0];
        
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold">{displayName?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold">{displayName}</p>
                  <p className="text-xs text-white/40">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold">Informations personnelles</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Nom d'utilisateur</label>
                  <input 
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/30 transition-all"
                    placeholder="Pseudo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Nom complet</label>
                  <input 
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/30 transition-all"
                    placeholder="Nom complet"
                  />
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Supprimer le compte</span>
              <button className="text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-500/10 transition-all">
                Supprimer
              </button>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Comment pouvons-nous vous aider ?</h3>
              <p className="text-sm text-white/40">Décrivez votre problème ou posez votre question ci-dessous. Notre équipe vous répondra directement sur votre adresse e-mail.</p>
            </div>

            <form onSubmit={handleSubmitHelp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Sujet</label>
                <input 
                  type="text"
                  value={helpSubject}
                  onChange={(e) => setHelpSubject(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/30 transition-all"
                  placeholder="Ex: Problème de connexion, Bug d'affichage..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase tracking-widest font-bold">Message</label>
                <textarea 
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-white/30 transition-all min-h-[150px] resize-none"
                  placeholder="Décrivez votre problème en détail..."
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingHelp}
                className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingHelp ? 'Envoi en cours...' : 'Envoyer ma demande'}
              </button>
            </form>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-sm font-bold">Autres ressources</h4>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm text-white/60 hover:text-white transition-all border border-white/5">
                  <Globe size={16} /> Documentation
                </button>
                <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm text-white/60 hover:text-white transition-all border border-white/5">
                  <ExternalLink size={16} /> Communauté
                </button>
              </div>
            </div>
          </div>
        );
      case 'parental':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">Contrôles parentaux</h3>
              <HelpCircleIcon size={16} className="text-white/20" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Les comptes parents et adolescents peuvent être liés, ce qui donne aux parents la possibilité d'ajuster certains paramètres, de fixer des limites et d'ajouter des protections adaptées aux besoins de la famille.
            </p>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm font-medium transition-all"
            >
              <Plus size={16} /> Ajouter un membre de la famille
            </button>

            {/* Invite Modal Overlay */}
            <AnimatePresence>
              {isInviteModalOpen && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsInviteModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-[480px] bg-[#1A1A1A] border border-white/10 rounded-[32px] p-8 shadow-2xl text-white"
                  >
                    <button 
                      onClick={() => setIsInviteModalOpen(false)}
                      className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
                    >
                      <X size={20} />
                    </button>

                    <h3 className="text-xl font-bold mb-6">Inviter un membre de la famille</h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Adresse e-mail</label>
                        </div>
                        <input 
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-white/20"
                        />
                        <p className="text-[11px] text-white/30">
                          Si le membre de votre famille n'a jamais utilisé COOK IA, il sera d'abord invité à créer un compte.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium">Cette personne est :</p>
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="radio" 
                                name="role" 
                                className="sr-only" 
                                onChange={() => setInviteRole('parent')}
                              />
                              <div className={`w-5 h-5 rounded-full border-2 transition-all ${inviteRole === 'parent' ? 'border-white bg-white' : 'border-white/20'}`} />
                              {inviteRole === 'parent' && <div className="absolute w-2 h-2 bg-black rounded-full" />}
                            </div>
                            <span className="text-sm text-white/70 group-hover:text-white transition-colors">Mon parent ou tuteur</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="radio" 
                                name="role" 
                                className="sr-only" 
                                onChange={() => setInviteRole('child')}
                              />
                              <div className={`w-5 h-5 rounded-full border-2 transition-all ${inviteRole === 'child' ? 'border-white bg-white' : 'border-white/20'}`} />
                              {inviteRole === 'child' && <div className="absolute w-2 h-2 bg-black rounded-full" />}
                            </div>
                            <span className="text-sm text-white/70 group-hover:text-white transition-colors">Mon enfant</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4">
                        <button 
                          onClick={() => setIsInviteModalOpen(false)}
                          className="px-6 py-2.5 rounded-full text-sm font-bold border border-white/10 hover:bg-white/5 transition-all"
                        >
                          Annuler
                        </button>
                        <button 
                          disabled={!inviteEmail || !inviteRole}
                          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                            !inviteEmail || !inviteRole 
                              ? 'bg-white/10 text-white/20 cursor-not-allowed' 
                              : 'bg-white text-black hover:bg-white/90'
                          }`}
                        >
                          Envoyer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'sites':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Mes Sites Publiés</h3>
              <button 
                onClick={loadPublishedSites}
                className="text-xs text-white/40 hover:text-white transition-colors"
              >
                Actualiser
              </button>
            </div>
            
            {isLoadingSites ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-orange-primary" />
              </div>
            ) : publishedSites.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                <Layout size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm text-white/40">Vous n'avez pas encore publié de site.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publishedSites.map((site) => (
                  <div key={site.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between group">
                    <div className="flex-1 min-w-0 mr-4">
                      {editingSiteId === site.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={editSiteSlug}
                            onChange={(e) => setEditSiteSlug(e.target.value)}
                            className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-primary"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleUpdateSite(site.id)}
                            className="text-xs font-bold text-orange-primary"
                          >
                            Sauver
                          </button>
                          <button 
                            onClick={() => setEditingSiteId(null)}
                            className="text-xs font-bold text-white/40"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-bold truncate">{site.slug}.cook.ia</h4>
                          <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">
                            Publié le {new Date(site.created_at).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingSiteId(site.id);
                          setEditSiteSlug(site.slug);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                        title="Modifier le nom"
                      >
                        <Settings size={16} />
                      </button>
                      <a 
                        href={`${window.location.origin}/?p=${site.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                        title="Voir le site"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button 
                        onClick={() => handleDeleteSite(site.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-500/60 hover:text-red-500 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'policy':
        return (
          <div className="space-y-8 prose prose-invert prose-sm max-w-none">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Politique d'Utilisation de COOK IA</h3>
              <p className="text-white/60">Dernière mise à jour : 25 Février 2026</p>
            </div>

            <div className="space-y-6">
              <section className="space-y-2">
                <h4 className="text-white font-bold">1. Acceptation des conditions</h4>
                <p className="text-white/40">En utilisant COOK IA, vous acceptez d'être lié par les présentes conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le service.</p>
              </section>

              <section className="space-y-2">
                <h4 className="text-white font-bold">2. Utilisation du service</h4>
                <p className="text-white/40">COOK IA est un outil de génération de sites web assisté par IA. Vous êtes responsable du contenu généré et de son utilisation. Il est interdit d'utiliser le service pour créer du contenu illégal, haineux, ou portant atteinte aux droits d'autrui.</p>
              </section>

              <section className="space-y-2">
                <h4 className="text-white font-bold">3. Propriété intellectuelle</h4>
                <p className="text-white/40">Le code généré par COOK IA vous appartient pour une utilisation personnelle ou commerciale. Cependant, l'architecture et les algorithmes de COOK IA restent la propriété exclusive de Benit Madimba.</p>
              </section>

              <section className="space-y-2">
                <h4 className="text-white font-bold">4. Publication et Hébergement</h4>
                <p className="text-white/40">Les sites publiés via notre sous-domaine .cook.ia sont hébergés à titre gracieux. Nous nous réservons le droit de supprimer tout site ne respectant pas nos règles de sécurité ou d'éthique.</p>
              </section>

              <section className="space-y-2">
                <h4 className="text-white font-bold">5. Limitation de responsabilité</h4>
                <p className="text-white/40">COOK IA est fourni "en l'état". Nous ne garantissons pas que le service sera exempt d'erreurs ou d'interruptions. Benit Madimba ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation du service.</p>
              </section>
            </div>
          </div>
        );
      case 'watchdog':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Architecture Watchdog</h3>
                <p className="text-sm text-white/40">Surveillance des processus d'arrière-plan et file d'attente asynchrone.</p>
              </div>
              <button 
                onClick={loadWatchdogStatus}
                disabled={isRefreshingWatchdog}
                className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <Loader2 size={16} className={isRefreshingWatchdog ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-white/20 uppercase tracking-widest font-bold mb-2">État du Système</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-lg font-bold">Opérationnel</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-white/20 uppercase tracking-widest font-bold mb-2">Tâches en File</p>
                <span className="text-lg font-bold">{watchdogData?.queueSize || 0}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold">Dernières Activités Invisibles</h4>
              <div className="space-y-2">
                {watchdogData?.tasks?.map((task: any) => (
                  <div key={task.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-emerald-500' : 
                        task.status === 'processing' ? 'bg-orange-primary animate-pulse' : 
                        task.status === 'failed' ? 'bg-red-500' : 'bg-white/20'
                      }`} />
                      <div>
                        <p className="text-sm font-medium capitalize">{task.type.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-white/20">{new Date(task.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        task.status === 'completed' ? 'text-emerald-500' : 
                        task.status === 'processing' ? 'text-orange-primary' : 
                        task.status === 'failed' ? 'text-red-500' : 'text-white/20'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
                {(!watchdogData?.tasks || watchdogData.tasks.length === 0) && (
                  <p className="text-center py-8 text-white/10 text-sm italic">Aucune activité récente.</p>
                )}
              </div>
            </div>

            <div className="p-6 bg-orange-primary/5 border border-orange-primary/10 rounded-2xl">
              <p className="text-sm text-orange-primary font-medium mb-2 flex items-center gap-2">
                <Sparkles size={16} /> Note Technique
              </p>
              <p className="text-xs text-white/40 leading-relaxed">
                L'architecture Watchdog utilise une file d'attente asynchrone pour traiter les tâches lourdes (optimisation, scan de sécurité, synchronisation) sans bloquer l'interface utilisateur. C'est ce qui rend l'expérience COOK IA fluide et "invisible".
              </p>
            </div>
          </div>
        );
      case 'admin':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Panneau d'Administration</h3>
                <p className="text-sm text-white/40">Vue globale de la base de données Supabase.</p>
              </div>
              <button 
                onClick={loadAdminData}
                disabled={isAdminLoading}
                className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <Loader2 size={16} className={isAdminLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-white/20 uppercase tracking-widest font-bold mb-2">Utilisateurs</p>
                <span className="text-2xl font-black">{adminData.users.length}</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-white/20 uppercase tracking-widest font-bold mb-2">En Ligne</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-2xl font-black">{adminData.onlineUsers.length}</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-white/20 uppercase tracking-widest font-bold mb-2">Sites Publiés</p>
                <span className="text-2xl font-black">{adminData.sites.length}</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <p className="text-xs text-white/20 uppercase tracking-widest font-bold mb-2">Conversations</p>
                <span className="text-2xl font-black">{adminData.conversations.length}</span>
              </div>
            </div>

            <div className="space-y-6">
              <section className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" /> Personnes Connectées ({adminData.onlineUsers.length})
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {adminData.onlineUsers.map((u: any, i: number) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{u.email || 'Utilisateur Anonyme'}</span>
                        <span className="text-[10px] text-white/20">Connecté à {new Date(u.online_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                  {adminData.onlineUsers.length === 0 && (
                    <p className="text-xs text-white/20 italic col-span-2 py-4 text-center">Aucun utilisateur en ligne actuellement.</p>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <User size={16} className="text-orange-primary" /> Utilisateurs Récents (Supabase)
                </h4>
                <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-white/40 uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-4 py-3">Email / Username</th>
                        <th className="px-4 py-3">Full Name</th>
                        <th className="px-4 py-3">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminData.users.slice(0, 10).map((u) => (
                        <tr key={u.id}>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-white">{u.email || u.username || 'N/A'}</span>
                              <span className="text-[10px] text-white/20 font-mono">{u.id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white/60">{u.full_name || 'N/A'}</td>
                          <td className="px-4 py-3 text-white/40">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Globe size={16} className="text-emerald-500" /> Sites Récemment Publiés
                </h4>
                <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-white/40 uppercase tracking-widest font-bold">
                      <tr>
                        <th className="px-4 py-3">Slug</th>
                        <th className="px-4 py-3">User ID</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminData.sites.slice(0, 5).map((s) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3 font-medium text-emerald-500">{s.slug}.cook.ia</td>
                          <td className="px-4 py-3 text-white/40 font-mono">{s.user_id.slice(0, 8)}...</td>
                          <td className="px-4 py-3 text-white/40">{new Date(s.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <Settings size={48} className="mb-4 opacity-20" />
            <p>Cette section est en cours de développement.</p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[900px] h-[640px] bg-[#141414] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex text-white"
          >
            {/* Sidebar */}
            <div className="w-[280px] bg-[#0D0D0D] border-r border-white/5 p-6 flex flex-col">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 self-start mb-8"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white/10 text-white shadow-lg' 
                        : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-8 border-b border-white/5">
                <h2 className="text-2xl font-bold">{tabs.find(t => t.id === activeTab)?.label}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                {renderContent()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const HelpCircleIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
