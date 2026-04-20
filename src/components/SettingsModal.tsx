import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  User, 
  Lock, 
  ChevronDown, 
  Github,
  HelpCircle,
  Share2,
  History,
  Key,
  Layers,
  Link as LinkIcon,
  Info,
  Globe,
  Copy,
  Check,
  Zap,
  ChevronRight,
  LogOut,
  Loader2
} from 'lucide-react';
import { supabase } from '../services/supabaseService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
  user: any;
  isProjectSettings?: boolean;
  prompts?: string[];
  conversationsCount?: number;
  isDark?: boolean;
  projectName?: string;
  onUpdateProjectName?: (name: string) => void;
  repoName?: string;
  onUpdateRepoName?: (name: string) => void;
  repoDescription?: string;
  onUpdateRepoDescription?: (desc: string) => void;
  isRepoPrivate?: boolean;
  onToggleRepoPrivate?: (val: boolean) => void;
  secrets?: { key: string; value: string }[];
  onAddSecret?: (key: string, value: string) => void;
  onRemoveSecret?: (key: string) => void;
  isLinkFullscreen?: boolean;
  onToggleLinkFullscreen?: (val: boolean) => void;
  onConnectGithub?: () => void;
}

type TabType = 'publish' | 'versions' | 'secrets' | 'integrations' | 'github' | 'general' | 'account' | 'help';

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'publish', 
  user, 
  isProjectSettings = true, 
  prompts = [], 
  conversationsCount = 0, 
  isDark = false,
  projectName = '',
  onUpdateProjectName,
  repoName = '',
  onUpdateRepoName,
  repoDescription = '',
  onUpdateRepoDescription,
  isRepoPrivate = true,
  onToggleRepoPrivate,
  secrets = [],
  onAddSecret,
  onRemoveSecret,
  isLinkFullscreen = false,
  onToggleLinkFullscreen,
  onConnectGithub
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [accessLevel, setAccessLevel] = useState('Restricted: Only people you specify can access');
  const [isAccessDropdownOpen, setIsAccessDropdownOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaborators, setCollaborators] = useState<{email: string, role: string}[]>([]);
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [localProjectName, setLocalProjectName] = useState(projectName);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://cook-ia.netlify.app';

  const handleAddCollaborator = () => {
    if (!collaboratorEmail.trim()) return;
    if (collaborators.find(c => c.email === collaboratorEmail)) return;
    setCollaborators([...collaborators, { email: collaboratorEmail, role: 'Editor' }]);
    setCollaboratorEmail('');
  };

  const handleSendSupportMessage = async () => {
    if (!supportMessage.trim()) return;
    
    if (!user) {
      alert("Vous devez être connecté pour envoyer un message de support.");
      return;
    }

    setIsSending(true);
    try {
      // Note: We assume a 'support_messages' table exists in Supabase
      const { error } = await supabase
        .from('support_messages')
        .insert([
          { 
            user_id: user.id, 
            email: user.email, 
            message: supportMessage,
            created_at: new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      setSendSuccess(true);
      setSupportMessage('');
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMessage = err.message?.includes('relation "support_messages" does not exist') || err.message?.includes('Could not find the table')
        ? "Le système de messagerie n'est pas encore configuré sur la base de données. Veuillez contacter Benit directement par email à benit800@gmail.com."
        : "Erreur lors de l'envoi du message. Veuillez réessayer ou contacter benit800@gmail.com.";
      alert(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const tabs = isProjectSettings ? [
    { id: 'publish', label: 'Share', icon: Share2 },
    { id: 'versions', label: 'Versions', icon: History },
    { id: 'secrets', label: 'Secrets', icon: Key },
    { id: 'integrations', label: 'Integrations', icon: Layers },
  ] : [
    { id: 'general', label: 'Settings', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLocalProjectName(projectName);
    }
  }, [isOpen, initialTab, projectName]);

  const renderContent = () => {
    switch (activeTab) {
      case 'publish':
        return (
          <div className="space-y-8 p-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Share your app</h3>
                <Info size={16} className="text-slate-400 cursor-help" />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>General access</label>
                <div className="relative">
                  <button 
                    onClick={() => setIsAccessDropdownOpen(!isAccessDropdownOpen)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-sm ${
                      isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Lock size={16} className="text-slate-400" />
                      <span>{accessLevel}</span>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isAccessDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isAccessDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute top-full left-0 right-0 mt-2 p-2 rounded-xl border z-10 shadow-xl ${
                          isDark ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-slate-200'
                        }`}
                      >
                        {['Restricted: Only people you specify can access', 'Anyone with the link can view'].map((level) => (
                          <button
                            key={level}
                            onClick={() => {
                              setAccessLevel(level);
                              setIsAccessDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                              accessLevel === level 
                                ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')
                                : (isDark ? 'text-white/40 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>People and groups with access</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Start typing email addresses here"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    className={`flex-1 p-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                  <button 
                    onClick={handleAddCollaborator}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">Les personnes ajoutées pourront modifier le site web en temps réel.</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                      {user?.email?.charAt(0).toUpperCase() || 'B'}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.user_metadata?.full_name || 'benit'}</span>
                      <span className="text-xs text-slate-400">{user?.email || 'benit800@gmail.com'}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">Owner</span>
                </div>

                {collaborators.map((c, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-xs">
                        {c.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.email.split('@')[0]}</span>
                        <span className="text-xs text-slate-400">{c.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{c.role}</span>
                      <button 
                        onClick={() => setCollaborators(collaborators.filter((_, idx) => idx !== i))}
                        className="p-1 hover:bg-red-500/10 text-red-500 rounded-md transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`space-y-4 pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Link setting</span>
                    <span className="text-xs text-slate-400">Default to fullscreen</span>
                  </div>
                  <button 
                    onClick={() => onToggleLinkFullscreen?.(!isLinkFullscreen)}
                    className={`w-10 h-5 rounded-full relative transition-all ${isLinkFullscreen ? 'bg-blue-500' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isLinkFullscreen ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={handleCopyLink}
                  className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${
                  isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                }`}>
                  {isCopied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} />}
                  {isCopied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'versions':
        return (
          <div className="space-y-6 p-2">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Prompts History</h3>
            <div className="space-y-4">
              {prompts.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No prompts recorded for this project.</p>
              ) : (
                prompts.map((p, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Version {prompts.length - i}</span>
                      <span className="text-[10px] text-slate-400">2 mins ago</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{p}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'secrets':
        return (
          <div className="space-y-6 p-2">
            <div className="flex flex-col gap-1">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Secrets & API Keys</h3>
              <p className="text-xs text-slate-400">Ces clés sont stockées en toute sécurité et ne seront jamais montrées en public.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Key name (e.g. STRIPE_KEY)"
                  value={newSecretKey}
                  onChange={(e) => setNewSecretKey(e.target.value)}
                  className={`flex-1 p-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <input 
                  type="password"
                  placeholder="Value"
                  value={newSecretValue}
                  onChange={(e) => setNewSecretValue(e.target.value)}
                  className={`flex-1 p-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
                <button 
                  onClick={() => {
                    if (newSecretKey && newSecretValue) {
                      onAddSecret?.(newSecretKey, newSecretValue);
                      setNewSecretKey('');
                      setNewSecretValue('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {secrets.map((s, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <Key size={14} className="text-blue-500" />
                      <span className={`text-sm font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.key}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">••••••••••••••••</span>
                      <button 
                        onClick={() => onRemoveSecret?.(s.key)}
                        className="p-1 hover:bg-red-500/10 text-red-500 rounded-md transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'integrations':
        return (
          <div className="space-y-6 p-2">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Public URL</h3>
            <div className={`p-6 rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'} text-center`}>
              <Globe size={32} className="mx-auto mb-4 text-blue-500 opacity-50" />
              <p className={`text-sm mb-4 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Partagez ce lien avec vos amis pour qu'ils voient votre site web.</p>
              <div className={`flex items-center gap-2 p-3 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-white border-slate-200'}`}>
                <span className={`text-xs font-mono flex-1 truncate ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{currentUrl}</span>
                <button 
                  onClick={handleCopyLink}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                >
                  {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-8 p-2">
            <div className="flex flex-col gap-1">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Mon Compte</h3>
              <p className="text-xs text-slate-400">Gérez vos informations personnelles et votre abonnement.</p>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden shadow-2xl">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.[0].toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {user?.user_metadata?.username || user?.email?.split('@')[0]}
                  </h4>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">Plan Gratuit</span>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest">Actif</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Sites créés</span>
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{conversationsCount}</span>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Stockage utilisé</span>
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>0 MB</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all border-red-500/10 hover:bg-red-500/5 text-red-500`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <LogOut size={18} />
                  </div>
                  <span className="text-sm font-bold">Se déconnecter</span>
                </div>
              </button>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-6 p-2">
            <div className="flex flex-col gap-1">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Aide & Support</h3>
              <p className="text-xs text-slate-400">Besoin d'aide pour utiliser Cook IA ?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className={`p-6 rounded-3xl border text-left transition-all ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                  <Globe size={20} />
                </div>
                <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Documentation</h4>
                <p className="text-xs text-slate-400">Apprenez à maîtriser toutes les fonctionnalités.</p>
              </button>
              
              <button className={`p-6 rounded-3xl border text-left transition-all ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="w-10 h-10 rounded-xl bg-orange-primary/10 text-orange-primary flex items-center justify-center mb-4">
                  <Zap size={20} />
                </div>
                <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Tutoriels</h4>
                <p className="text-xs text-slate-400">Des guides pas à pas pour vos projets.</p>
              </button>
            </div>

            <div className={`p-6 rounded-3xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
              <h4 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Contactez-nous</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                      <User size={14} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Benit Madimba</p>
                      <p className="text-[10px] text-slate-400">Créateur de Cook IA</p>
                    </div>
                  </div>
                  <a 
                    href="https://discord.gg/Pc6reuApRF" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#5865F2] text-white rounded-lg text-xs font-bold hover:bg-[#4752C4] transition-all"
                  >
                    Rejoindre Discord
                  </a>
                </div>
                
                <div className="space-y-2">
                  {!user && (
                    <div className={`p-3 rounded-xl border text-xs text-center mb-2 ${isDark ? 'bg-orange-primary/10 border-orange-primary/20 text-orange-primary' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                      Vous devez être connecté pour envoyer un message.
                    </div>
                  )}
                  <textarea 
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder={user ? "Votre message (sera envoyé à Benit via Supabase)..." : "Veuillez vous connecter pour envoyer un message..."}
                    disabled={!user}
                    className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-all min-h-[100px] resize-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <button 
                    onClick={handleSendSupportMessage}
                    disabled={isSending || !supportMessage.trim() || !user}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      sendSuccess 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                    }`}
                  >
                    {isSending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : sendSuccess ? (
                      <>
                        <Check size={18} />
                        Message envoyé !
                      </>
                    ) : (
                      'Envoyer un message'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'github':
        return (
          <div className="space-y-6 p-2">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>GitHub Integration</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Repository Name</label>
                <input 
                  type="text"
                  value={repoName}
                  onChange={(e) => onUpdateRepoName?.(e.target.value)}
                  placeholder="my-awesome-project"
                  className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Description</label>
                <textarea 
                  value={repoDescription}
                  onChange={(e) => onUpdateRepoDescription?.(e.target.value)}
                  placeholder="A brief description of your site"
                  className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-all min-h-[80px] resize-none ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5">
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Private Repository</span>
                  <span className="text-xs text-slate-400">Only you can access this repo</span>
                </div>
                <button 
                  onClick={() => onToggleRepoPrivate?.(!isRepoPrivate)}
                  className={`w-10 h-5 rounded-full relative transition-all ${isRepoPrivate ? 'bg-blue-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isRepoPrivate ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'} text-center`}>
              <Github size={32} className={`mx-auto mb-4 ${isDark ? 'text-white' : 'text-slate-900'} opacity-50`} />
              <p className={`text-sm mb-6 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Enregistrez votre projet directement sur GitHub pour le déployer ailleurs.</p>
              <button 
                onClick={onConnectGithub}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <Github size={18} />
                Connect to GitHub
              </button>
            </div>
          </div>
        );
      case 'general':
        return (
          <div className="space-y-6 p-2">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Project Name</span>
                  <span className="text-xs text-slate-400">Change the name of your project</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={localProjectName}
                    onChange={(e) => setLocalProjectName(e.target.value)}
                    className={`p-2 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                  <button 
                    onClick={() => onUpdateProjectName?.(localProjectName)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Settings size={48} className="mb-4 opacity-20" />
            <p className="text-sm">This section is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${
              isDark ? 'bg-[#141414] border border-white/10' : 'bg-white'
            }`}
          >
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 min-w-max">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeTab === tab.id 
                          ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')
                          : (isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`p-2 rounded-full transition-colors shrink-0 ml-2 ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {renderContent()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
