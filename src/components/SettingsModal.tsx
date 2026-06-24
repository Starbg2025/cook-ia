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
  Loader2,
  ShieldCheck,
  Users,
  CheckCircle,
  Sparkles,
  Activity,
  Search,
  Eye
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { translations, Language } from '../translations';

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
  isRealtimeEnabled?: boolean;
  onToggleRealtime?: (val: boolean) => void;
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
  lang?: Language;
}

type TabType = 'publish' | 'versions' | 'secrets' | 'integrations' | 'github' | 'general' | 'account' | 'help' | 'founder' | 'collaboration' | 'models' | 'admin';

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
  onConnectGithub,
  isRealtimeEnabled = true,
  onToggleRealtime,
  selectedModel = 'gemini-3.5-flash',
  onSelectModel,
  lang = 'fr'
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

  // Admin section states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSearchText, setAdminSearchText] = useState('');
  const [expandedUserIds, setExpandedUserIds] = useState<string[]>([]);

  const fetchAdminActivity = async () => {
    if (user?.email !== 'benit800@gmail.com') return;
    setAdminLoading(true);
    setAdminError(null);
    try {
      const response = await fetch('/api/admin/users-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail: user.email })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de communication');
      }
      const data = await response.json();
      if (data.success) {
        setAdminUsers(data.users || []);
      } else {
        throw new Error(data.error || "Impossible de récupérer les rapports.");
      }
    } catch (err: any) {
      console.error(err);
      setAdminError(err.message || "Erreur lors de la récupération.");
    } finally {
      setAdminLoading(false);
    }
  };

  const toggleUserExpanded = (userId: string) => {
    setExpandedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://cook-ia.indevs.in';

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
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'versions', label: 'Versions', icon: History },
    { id: 'secrets', label: 'Secrets', icon: Key },
    { id: 'integrations', label: 'Integrations', icon: Layers },
  ] : [
    { id: 'general', label: 'Settings', icon: Settings },
    { id: 'models', label: 'AI Models', icon: Sparkles },
    { id: 'account', label: 'Account', icon: User },
    ...(user?.email === 'benit800@gmail.com' ? [{ id: 'admin', label: 'Super Admin', icon: Activity }] : []),
    { id: 'founder', label: 'Fondateur', icon: ShieldCheck },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLocalProjectName(projectName);
    }
  }, [isOpen, initialTab, projectName]);

  React.useEffect(() => {
    if ((activeTab === 'admin' || activeTab === 'account') && user?.email === 'benit800@gmail.com') {
      fetchAdminActivity();
    }
  }, [activeTab, user]);

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
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{lang === 'fr' ? "Secrets & Clés API" : "Secrets & API Keys"}</h3>
              <p className="text-xs text-slate-400">{lang === 'fr' ? "Ces clés sont stockées en toute sécurité et ne seront jamais montrées en public." : "These keys are stored securely and will never be shown in public."}</p>
            </div>
            
            {/* Clé API Gemini Gratuite Card */}
            <div className={`p-4 rounded-xl border ${
              isDark 
                ? 'bg-orange-500/5 border-orange-500/20 text-white' 
                : 'bg-orange-50 border-orange-200 text-slate-900'
            }`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-primary rounded-lg text-white shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-orange-primary">
                      {lang === 'fr' ? "Clé API Gemini Gratuite" : "Free Gemini API Key"}
                    </h4>
                    {secrets.some(s => s.key === 'GEMINI_API_KEY') ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                        <CheckCircle size={10} />
                        {lang === 'fr' ? "Active" : "Active"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        {lang === 'fr' ? "Non configurée" : "Not configured"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {lang === 'fr' 
                      ? "Vous pouvez activer instantanément notre clé API Gemini gratuite incluse pour forger vos projets. Aucune carte de crédit requise, prêt en un clic."
                      : "You can instantly activate our included free Gemini API key to forge your projects. No credit card required, ready in one click."
                    }
                  </p>
                  
                  {!secrets.some(s => s.key === 'GEMINI_API_KEY') && (
                    <button
                      onClick={() => {
                        onAddSecret?.('GEMINI_API_KEY', 'FREE_TRIAL_KEY');
                      }}
                      className="mt-1 px-4 py-2 bg-gradient-to-r from-orange-primary to-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-lg transition-all"
                    >
                      {lang === 'fr' ? "Activer la Clé Gratuite" : "Activate Free Key"}
                    </button>
                  )}
                  
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                    <span>{lang === 'fr' ? "Ou créez votre clé personnelle sur" : "Or get your own personal key on"}</span>
                    <a 
                      href="https://aistudio.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-orange-primary hover:underline font-bold"
                    >
                      Google AI Studio
                    </a>
                  </div>
                </div>
              </div>
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
      case 'founder':
        return (
          <div className="space-y-8 p-2">
            <div className="flex flex-col gap-1">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Le Fondateur</h3>
              <p className="text-xs text-slate-400">Découvrez l'esprit derrière Cook IA.</p>
            </div>

            <div className={`p-8 rounded-[40px] border relative overflow-hidden ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50 shadow-sm'}`}>
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 p-1">
                    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl overflow-hidden shadow-2xl">
                      <img 
                        src="https://i.ibb.co/mC3M8SSN/logo.png" 
                        alt="Benit Madimba" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Benit Madimba</h4>
                    <p className="text-sm text-blue-500 font-bold uppercase tracking-widest">Fondateur & CEO</p>
                    <div className="flex items-center gap-4 mt-3 text-slate-400">
                      <a href="https://github.com/benitmadimba" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors"><Github size={18} /></a>
                      <a href="https://discord.gg/Pc6reuApRF" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors"><Globe size={18} /></a>
                    </div>
                  </div>
                </div>

                <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                  <p>
                    Benit Madimba est le visionnaire derrière <strong>Cook IA</strong>. Passionné par l'intelligence artificielle et le développement web, il a conçu cet outil pour démocratiser la création de sites web de haute qualité.
                  </p>
                  <p>
                    Son objectif est de permettre à quiconque, peu importe son niveau technique, de transformer une simple idée en un produit digital magnifique et fonctionnel en quelques secondes.
                  </p>
                </div>

                {/* Cook IA Innovation Section */}
                <div className={`mt-6 p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100/50 border-slate-200 text-slate-800'} space-y-4`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-500 shrink-0" size={18} />
                    <h5 className="font-bold text-sm tracking-tight">
                      {lang === 'fr' ? "Révolution de Conception : Cook IA Studio" : "Design Revolution: Cook IA Studio"}
                    </h5>
                  </div>
                  
                  <div className="space-y-3 text-xs leading-relaxed opacity-90">
                    <div className="flex gap-2">
                      <span className="text-amber-500">✦</span>
                      <p>
                        {lang === 'fr' 
                          ? "Cook IA dessine comme sur un canvas interactif, mais c'est l'intelligence elle-même qui engendre et mature le design original de votre interface."
                          : "Cook IA designs on an interactive canvas, but the core intelligence itself generates and matures the interface's original layout."
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-500">✦</span>
                      <p>
                        {lang === 'fr' 
                          ? "Connectez ce design visuel à Cook IA Code, notre moteur d'écriture d'élite qui développe et code l'application complète directement à partir de l'esquisse."
                          : "Connect this visual layout to Cook IA Code, our elite generation engine that compiles and codes the full application directly from the sketch."
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-emerald-500">✦</span>
                      <p>
                        {lang === 'fr' 
                          ? "Visualisez les points saillants et les étapes cinématiques pendant que l'IA code en temps réel, façonnant des sites que d'autres IA conventionnelles sont incapables de concevoir."
                          : "Observe high-fidelity highlights and live cinematic steps as the AI codes in real-time, building websites that conventional AIs are simply unable to engineer."
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-purple-500">✦</span>
                      <p>
                        {lang === 'fr' 
                          ? "Cook IA intègre nativement les modèles 3D ultra-fluides de motionsites.ai pour animer et sublimer l'expérience utilisateur de vos applications."
                          : "Cook IA natively integrates high-end 3D models from motionsites.ai to animate and enrich your user application experiences."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Direct</span>
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'} font-medium`}>benit800@gmail.com</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-orange-primary/10 border border-orange-primary/20 text-orange-primary text-xs font-bold">
                    Membre Gold
                  </div>
                </div>
              </div>
              
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
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
                <div className={`w-20 h-20 rounded-full ${user?.email === 'benit800@gmail.com' ? 'bg-gradient-to-r from-amber-400 to-yellow-600 text-black ring-4 ring-yellow-400 shadow-2xl' : 'bg-blue-600 text-white'} flex items-center justify-center font-bold text-2xl overflow-hidden shadow-2xl`}>
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.[0].toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                    {user?.email === 'benit800@gmail.com' ? 'Welcome Admin' : (user?.user_metadata?.username || user?.email?.split('@')[0])}
                    {user?.email === 'benit800@gmail.com' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                    )}
                  </h4>
                  <p className="text-sm text-slate-400">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user?.email === 'benit800@gmail.com' ? (
                      <>
                        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-yellow-500/5">
                          <Sparkles size={10} className="animate-pulse" />
                          Membre Gold
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest">
                          Super Admin
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">Plan Gratuit</span>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest">Actif</span>
                      </>
                    )}
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

              {user?.email === 'benit800@gmail.com' && (
                <div className="mt-6 border-t border-dashed border-white/10 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                      <Activity size={16} className="text-yellow-500 animate-pulse" />
                      Activités Réseau (Super Admin)
                    </h4>
                    <button 
                      onClick={fetchAdminActivity}
                      disabled={adminLoading}
                      className="text-xs text-yellow-500 hover:underline font-bold"
                    >
                      {adminLoading ? "Actualisation..." : "Actualiser ↻"}
                    </button>
                  </div>
                  
                  {adminLoading && adminUsers.length === 0 ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                      <Loader2 className="animate-spin" size={14} />
                      Chargement en direct de l'activité utilisateur...
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-xl border ${isDark ? 'border-white/5 bg-black/40' : 'border-slate-200 bg-white shadow-sm'}`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Membres</span>
                          <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{adminUsers.length}</span>
                        </div>
                        <div className={`p-3 rounded-xl border ${isDark ? 'border-white/5 bg-black/40' : 'border-slate-200 bg-white shadow-sm'}`}>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Projets / Conversations</span>
                          <span className={`text-lg font-black ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
                            {adminUsers.reduce((acc, u) => acc + (u.conversations?.length || 0), 0)}
                          </span>
                        </div>
                      </div>

                      {/* Search Bar inside Account tab */}
                      <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                          type="text"
                          value={adminSearchText}
                          onChange={(e) => setAdminSearchText(e.target.value)}
                          placeholder="Rechercher un utilisateur ou projet..."
                          className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
                            isDark 
                              ? 'border-white/10 bg-black/45 text-white focus:border-yellow-500 focus:ring-yellow-500' 
                              : 'border-slate-200 bg-white text-slate-900 focus:border-amber-500 focus:ring-amber-500'
                          }`}
                        />
                      </div>

                      {/* Interactive expandable user list of ALL users */}
                      <div className="space-y-2 mt-2 max-h-[350px] overflow-y-auto pr-1">
                        <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-500 block mb-1">Tous les Utilisateurs & Actions :</span>
                        {adminUsers
                          .filter(u => 
                            u.username?.toLowerCase().includes(adminSearchText.toLowerCase()) ||
                            u.id?.toLowerCase().includes(adminSearchText.toLowerCase()) ||
                            u.conversations?.some((c: any) => c.title?.toLowerCase().includes(adminSearchText.toLowerCase()))
                          )
                          .map(u => {
                            const isExpanded = expandedUserIds.includes(u.id);
                            const userConvs = u.conversations || [];
                            return (
                              <div key={u.id} className={`rounded-xl border text-[11px] transition-all overflow-hidden ${isDark ? 'border-white/5 bg-black/30' : 'border-slate-200/60 bg-white shadow-sm'}`}>
                                <button 
                                  onClick={() => toggleUserExpanded(u.id)}
                                  className="w-full flex items-center justify-between p-2.5 text-left hover:bg-white/5 transition-all"
                                >
                                  <div>
                                    <span className={`font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{u.username || 'Utilisateur Anonyme'}</span>
                                    <span className="text-[8px] font-mono text-slate-400 block">ID: {u.id}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-slate-400 bg-blue-500/10 px-1.5 py-0.5 rounded font-bold">
                                      {userConvs.length} {userConvs.length === 1 ? 'projet' : 'projets'}
                                    </span>
                                    <span className="text-[9px] text-slate-400">{isExpanded ? '▲' : '▼'}</span>
                                  </div>
                                </button>
                                
                                {isExpanded && (
                                  <div className={`p-2.5 border-t ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50'} space-y-2`}>
                                    {userConvs.length === 0 ? (
                                      <p className="text-slate-500 italic text-[10px]">Aucun projet démarré</p>
                                    ) : (
                                      userConvs.map((conv: any) => (
                                        <div key={conv.id} className={`p-2 rounded border text-[10px] ${isDark ? 'border-white/5 bg-zinc-900/50' : 'border-slate-200 bg-white'}`}>
                                          <div className="flex justify-between font-bold text-slate-400 mb-1">
                                            <span className={isDark ? 'text-yellow-400/90' : 'text-amber-700'}>{conv.title}</span>
                                            <span className="text-[8px] font-mono">{conv.createdAt ? new Date(conv.createdAt).toLocaleDateString('fr-FR') : ''}</span>
                                          </div>
                                          <div className={`p-1.5 rounded text-[10px] font-mono bg-black/20 text-slate-300 max-h-20 overflow-y-auto whitespace-pre-wrap border ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                            <span className="text-[8px] uppercase text-zinc-500 font-extrabold block scale-90 -ml-1">Dernière invite :</span>
                                            {conv.latestPrompt || 'Aucun message'}
                                          </div>
                                          <div className="flex justify-between text-[8px] text-slate-500 mt-1">
                                            <span>Messages: {conv.messageCount}</span>
                                            <span>Model: {conv.modelName || 'Default'}</span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </>
                  )}
                </div>
              )}
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
      case 'collaboration':
        return (
          <div className="space-y-6 p-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Mode Collaboration</h3>
                <button 
                  onClick={() => onToggleRealtime?.(!isRealtimeEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isRealtimeEnabled ? 'bg-orange-primary shadow-lg shadow-orange-primary/20' : 'bg-slate-300'}`}
                >
                  <motion.div 
                    animate={{ x: isRealtimeEnabled ? 26 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
              <p className="text-xs text-slate-400">Travaillez ensemble en temps réel sur vos designs.</p>
            </div>
            
            {!isRealtimeEnabled && (
              <div className="p-4 rounded-2xl bg-orange-primary/10 border border-orange-primary/20 text-orange-primary text-xs font-semibold flex items-center gap-2">
                <Zap size={14} className="animate-pulse" />
                Le mode temps réel est actuellement désactivé. Activez-le pour collaborer.
              </div>
            )}
            
            <div className={`p-6 rounded-3xl border flex flex-col items-center text-center gap-4 transition-opacity ${!isRealtimeEnabled ? 'opacity-50 pointer-events-none' : ''} border-dashed border-orange-primary/30 bg-orange-primary/5`}>
              <div className="w-16 h-16 rounded-full bg-orange-primary/10 text-orange-primary flex items-center justify-center">
                <Users size={32} />
              </div>
              <div className="space-y-1">
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Collaboration Supabase</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Utilisez <b>Supabase Realtime</b> pour inviter des amis. Une fois activé, vous verrez les curseurs des autres et les changements de code seront instantanés.
                </p>
              </div>
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-6 py-3 bg-orange-primary text-white rounded-full text-xs font-bold hover:bg-orange-600 transition-all shadow-lg"
              >
                {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                {isCopied ? 'Lien Copié !' : 'Partager le Lien de Collaboration'}
              </button>
            </div>

            <div className="space-y-4">
              <h4 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Configuration Supabase</h4>
              <div className="space-y-3">
                {[
                  { step: 1, text: "Activez 'Realtime' dans le dashboard Supabase (Table 'conversations')." },
                  { step: 2, text: "Configurez les règles de sécurité (RLS) pour autoriser les écritures." },
                  { step: 3, text: "Partagez l'URL avec un autre utilisateur de Cook IA." },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-slate-500/10 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">{s.step}</span>
                    <p className={`text-xs ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'admin':
        const filteredUsers = adminUsers.filter(u => 
          u.username?.toLowerCase().includes(adminSearchText.toLowerCase()) ||
          u.id?.toLowerCase().includes(adminSearchText.toLowerCase()) ||
          u.conversations?.some((c: any) => c.title?.toLowerCase().includes(adminSearchText.toLowerCase()))
        );

        return (
          <div className="space-y-6 p-2 h-[80vh] overflow-y-auto pr-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Activity size={18} className="text-yellow-500 animate-pulse" />
                    Panneau d'Activité Admin - Benit Madimba
                  </h3>
                  <p className="text-xs text-slate-400">Suivez les utilisateurs enregistrés et observez ce qu'ils créent en temps réel.</p>
                </div>
                <button 
                  onClick={fetchAdminActivity}
                  disabled={adminLoading}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isDark 
                      ? 'bg-[#EAB308]/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/35' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                  }`}
                >
                  {adminLoading ? "Mise à jour..." : "Actualiser"}
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Utilisateurs</span>
                <p className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{adminUsers.length}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Projets / Designs</span>
                <p className={`text-xl font-extrabold ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>
                  {adminUsers.reduce((acc, u) => acc + (u.conversations?.length || 0), 0)}
                </p>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Statut Serveur</span>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-green-500/20 text-green-400 border border-green-500/30">Connecté</span>
                </div>
              </div>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={adminSearchText}
                onChange={(e) => setAdminSearchText(e.target.value)}
                placeholder="Rechercher par nom d'utilisateur, ID, ou titre de conversation..."
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                  isDark 
                    ? 'border-white/10 bg-black/40 text-white focus:border-yellow-500 focus:ring-yellow-500' 
                    : 'border-slate-200 bg-white text-slate-900 focus:border-amber-500 focus:ring-amber-500'
                }`}
              />
            </div>

            {adminError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                {adminError}
              </div>
            )}

            {adminLoading && adminUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-xs">Chargement sécurisé de la base de données...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Aucun utilisateur ou projet correspondant trouvé.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((userObj) => {
                  const isExpanded = expandedUserIds.includes(userObj.id);
                  const totalConvs = userObj.conversations?.length || 0;
                  return (
                    <div 
                      key={userObj.id} 
                      className={`rounded-2xl border transition-all ${
                        isDark 
                          ? 'border-white/5 bg-zinc-900/60 hover:bg-zinc-900' 
                          : 'border-slate-100 bg-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      {/* User Header Accordion Toggle */}
                      <button 
                        onClick={() => toggleUserExpanded(userObj.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-slate-500/20 flex items-center justify-center font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {userObj.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {userObj.username}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {userObj.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                            {totalConvs} {totalConvs > 1 ? 'projets' : 'projet'}
                          </span>
                          <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      </button>

                      {/* Conversations details drawer */}
                      {isExpanded && (
                        <div className={`px-4 pb-4 pt-1 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                          {totalConvs === 0 ? (
                            <p className="text-xs text-slate-400 italic py-2">Aucune conversation active pour le moment.</p>
                          ) : (
                            <div className="space-y-3 mt-2">
                              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">Historique des Prompts et Créations :</p>
                              {userObj.conversations.map((conv: any) => (
                                <div 
                                  key={conv.id} 
                                  className={`p-3 rounded-xl border ${
                                    isDark ? 'border-white/5 bg-black/30' : 'border-slate-200/60 bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <h5 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-1.5`}>
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      {conv.title}
                                    </h5>
                                    <span className="text-[9px] font-mono text-slate-400">
                                      {conv.createdAt ? new Date(conv.createdAt).toLocaleString('fr-FR') : 'Date inconnue'}
                                    </span>
                                  </div>
                                  
                                  <div className={`p-2 rounded bg-black/10 border ${isDark ? 'border-white/5' : 'border-slate-200'} text-xs font-mono max-h-32 overflow-y-auto whitespace-pre-wrap`}>
                                    <span className="text-[9px] uppercase text-zinc-500 font-black block mb-1">Dernière action de l'utilisateur :</span>
                                    <p className={isDark ? 'text-zinc-300' : 'text-zinc-800'}>{conv.latestPrompt}</p>
                                  </div>

                                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-semibold">
                                    <span>Messages échangés: <b>{conv.messageCount}</b></span>
                                    <span className="font-mono scale-90">ID: {conv.id}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
      case 'models':
        return (
          <div className="space-y-6 p-2">
            <div className="flex flex-col gap-1">
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Intelligence Artificielle</h3>
              <p className="text-xs text-slate-400">Choisissez le moteur qui alimente vos créations.</p>
            </div>
            
            <div className="space-y-3">
              {[
                { 
                  id: 'gemini-2.5-flash',
                  name: 'Gemini 2.5 Flash', 
                  provider: 'Google', 
                  desc: 'Modèle de production phare, rapide et intelligent. Idéal pour les clés API gratuites/standards.', 
                  badge: 'Standard Free' 
                },
                { 
                  id: 'gemini-2.0-flash',
                  name: 'Gemini 2.0 Flash', 
                  provider: 'Google', 
                  desc: 'Modèle rapide avec d\'excellentes capacités de mise en page réactive et de design.', 
                  badge: 'Rapide' 
                },
                { 
                  id: 'gemini-1.5-flash',
                  name: 'Gemini 1.5 Flash', 
                  provider: 'Google', 
                  desc: 'Modèle classique stable et ultra-robuste avec un grand contexte.', 
                  badge: 'Stable' 
                },
                { 
                  id: 'gemini-3.5-flash',
                  name: 'Gemini 3.5 Flash', 
                  provider: 'Google', 
                  desc: 'Modèle expérimental de l\'infrastructure.', 
                  badge: 'Expérimental' 
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectModel?.(m.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative group ${
                    selectedModel === m.id 
                      ? 'border-orange-primary bg-orange-primary/5 ring-1 ring-orange-primary'
                      : `border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10`
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/40 uppercase font-black">{m.provider}</span>
                    </div>
                    {m.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-primary text-white font-bold uppercase tracking-wider">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pr-8">{m.desc}</p>
                  
                  {selectedModel === m.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle size={20} className="text-orange-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex gap-3">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                  Le modèle sélectionné sera utilisé pour toutes les nouvelles générations et mises à jour de sections. 
                  Si un modèle est temporairement indisponible, le système basculera automatiquement sur Gemini.
                </p>
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
