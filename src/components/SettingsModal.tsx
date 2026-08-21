import React, { useState, useEffect } from 'react';
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
  Eye,
  Bell,
  ShieldAlert,
  AlertTriangle,
  Ban,
  MessageSquare,
  Code2,
  Brain,
  Bot,
  Save,
  CheckCheck,
  Sliders,
  Smile,
  FileText,
  Upload,
  Camera,
  Trash2,
  Image as ImageIcon
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
  aiMode?: 'code' | 'chat';
  onToggleAiMode?: (mode?: 'code' | 'chat') => void;
  onUpdateUserProfile?: (data: any) => void;
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
  selectedModel = 'gemini-2.5-flash',
  onSelectModel,
  lang = 'fr',
  aiMode = 'code',
  onToggleAiMode,
  onUpdateUserProfile
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

  // Profile & Custom Instructions states (Style ChatGPT & Claude)
  const [profileFullName, setProfileFullName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileRole, setProfileRole] = useState('Développeur Full Stack');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [customInstructionsAbout, setCustomInstructionsAbout] = useState('');
  const [customInstructionsStyle, setCustomInstructionsStyle] = useState('');
  const [localAiMode, setLocalAiMode] = useState<'code' | 'chat'>(aiMode);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Custom photo upload & URL states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP, GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("L'image sélectionnée est trop volumineuse (maximum 10 Mo).");
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      // High performance canvas compression & square cropping
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setProfileAvatarUrl(compressedDataUrl);
        } else {
          setProfileAvatarUrl(rawDataUrl);
        }
        setIsUploadingImage(false);
      };
      img.onerror = () => {
        setProfileAvatarUrl(rawDataUrl);
        setIsUploadingImage(false);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      alert("Erreur lors de la lecture du fichier image.");
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyManualUrl = () => {
    if (!manualImageUrl.trim()) return;
    setProfileAvatarUrl(manualImageUrl.trim());
    setShowUrlInput(false);
    setManualImageUrl('');
  };

  // Sync profile data on open or user change
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cook_ia_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfileFullName(parsed.fullName || user?.profile?.full_name || user?.user_metadata?.full_name || '');
        setProfileUsername(parsed.username || user?.profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || '');
        setProfileBio(parsed.bio || user?.profile?.bio || '');
        setProfileRole(parsed.role || user?.profile?.role || 'Développeur Full Stack');
        setProfileAvatarUrl(parsed.avatarUrl || user?.profile?.avatar_url || user?.user_metadata?.avatar_url || '');
        setCustomInstructionsAbout(parsed.customInstructionsAbout || user?.profile?.custom_instructions_about || '');
        setCustomInstructionsStyle(parsed.customInstructionsStyle || user?.profile?.custom_instructions_style || '');
        if (parsed.aiMode) setLocalAiMode(parsed.aiMode);
      } else if (user) {
        setProfileFullName(user.profile?.full_name || user.user_metadata?.full_name || '');
        setProfileUsername(user.profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || '');
        setProfileBio(user.profile?.bio || '');
        setProfileRole(user.profile?.role || 'Développeur Full Stack');
        setProfileAvatarUrl(user.profile?.avatar_url || user.user_metadata?.avatar_url || '');
        setCustomInstructionsAbout(user.profile?.custom_instructions_about || '');
        setCustomInstructionsStyle(user.profile?.custom_instructions_style || '');
      }
    } catch (e) {
      console.warn("Error loading profile:", e);
    }
  }, [user, isOpen]);

  useEffect(() => {
    setLocalAiMode(aiMode);
  }, [aiMode]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    const data = {
      username: profileUsername.trim() || user?.email?.split('@')[0] || 'User',
      fullName: profileFullName.trim(),
      bio: profileBio.trim(),
      role: profileRole.trim(),
      avatarUrl: profileAvatarUrl,
      customInstructionsAbout: customInstructionsAbout.trim(),
      customInstructionsStyle: customInstructionsStyle.trim(),
      aiMode: localAiMode
    };

    try {
      localStorage.setItem('cook_ia_profile_data', JSON.stringify(data));
      localStorage.setItem('cook_ia_ai_mode', localAiMode);
      onToggleAiMode?.(localAiMode);
      onUpdateUserProfile?.(data);

      if (user?.id) {
        await supabase.from('profiles').upsert({
          id: user.id,
          username: data.username,
          full_name: data.fullName,
          bio: data.bio,
          role: data.role,
          avatar_url: data.avatarUrl,
          custom_instructions_about: data.customInstructionsAbout,
          custom_instructions_style: data.customInstructionsStyle,
          ai_mode: data.aiMode,
          updated_at: new Date().toISOString()
        });
      }

      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Admin section states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSearchText, setAdminSearchText] = useState('');
  const [expandedUserIds, setExpandedUserIds] = useState<string[]>([]);

  // Admin section announcement & moderation states
  const [announcementMessage, setAnnouncementMessage] = useState("Cook IA version 1.0.0 est en ligne. Découvrez le nouveau studio d'architecture.");
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementStatusMsg, setAnnouncementStatusMsg] = useState('');
  const [customBanReasons, setCustomBanReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeTab === 'admin' && user?.email === 'benit800@gmail.com') {
      fetchAdminActivity();
      fetch('/api/announcement')
        .then(r => r.json())
        .then(data => {
          if (data && data.message) {
            setAnnouncementMessage(data.message);
            setIsAnnouncementActive(data.active !== false);
          }
        })
        .catch(err => console.warn("Failed to load announcement:", err));
    }
  }, [activeTab]);

  const handleSaveAnnouncement = async () => {
    if (!user?.email) return;
    setSavingAnnouncement(true);
    setAnnouncementStatusMsg('');
    try {
      const response = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user.email,
          message: announcementMessage,
          active: isAnnouncementActive
        })
      });
      if (response.ok) {
        setAnnouncementStatusMsg("Bannière et message système mis à jour avec succès !");
        setTimeout(() => setAnnouncementStatusMsg(''), 3500);
      } else {
        const data = await response.json();
        setAnnouncementStatusMsg(`Erreur : ${data.error || 'Échec de mise à jour'}`);
      }
    } catch (err: any) {
      setAnnouncementStatusMsg(`Erreur réseau : ${err.message}`);
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleToggleBanUser = async (targetUser: any) => {
    if (!user?.email || !targetUser?.id) return;
    const isCurrentlyBanned = !!targetUser.isBanned;
    const banReason = customBanReasons[targetUser.id] || targetUser.banReason || "Non-respect des règles de la plateforme.";

    try {
      const response = await fetch('/api/admin/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: user.email,
          userId: targetUser.id,
          username: targetUser.username,
          reason: banReason,
          ban: !isCurrentlyBanned
        })
      });

      if (response.ok) {
        setAdminUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, isBanned: !isCurrentlyBanned, banReason } : u));
      }
    } catch (err: any) {
      console.error("Failed to toggle ban status:", err);
    }
  };

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
    { id: 'account', label: lang === 'fr' ? 'Profil & IA' : 'Profile & AI', icon: User },
    { id: 'versions', label: 'Versions', icon: History },
    { id: 'secrets', label: 'Secrets', icon: Key },
    { id: 'integrations', label: 'Integrations', icon: Layers },
  ] : [
    { id: 'account', label: lang === 'fr' ? 'Profil & IA' : 'Profile & AI', icon: User },
    { id: 'general', label: 'Settings', icon: Settings },
    { id: 'models', label: 'AI Models', icon: Sparkles },
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
          <div className="space-y-6 p-1 sm:p-2">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <h3 className={`text-xl font-bold font-display ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                  <User className="text-orange-primary" size={22} />
                  <span>{lang === 'fr' ? 'Profil & Personnalisation IA' : 'Profile & AI Customization'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'fr' 
                    ? "Gérez votre identité, vos instructions personnalisées façon ChatGPT/Claude et le comportement de l'IA."
                    : "Manage your identity, ChatGPT/Claude style custom instructions, and AI behavior."}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {user?.email === 'benit800@gmail.com' ? (
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-yellow-500/10">
                    <Sparkles size={11} className="animate-pulse" />
                    Super Admin Gold
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCheck size={12} />
                    Profil Synchronisé
                  </span>
                )}
              </div>
            </div>

            {/* Profile Card with Photo Import & General Info */}
            <div className={`p-5 sm:p-6 rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-sm'} space-y-6`}>
              {/* Hidden file input for custom photo upload */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/png, image/jpeg, image/webp, image/gif" 
                className="hidden" 
                onChange={handleImageFileChange}
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Photo Preview & Interactive Click to Upload */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group shrink-0 cursor-pointer"
                  title="Cliquez pour importer une photo"
                >
                  <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all relative ${
                    isDark ? 'border-white/20 bg-zinc-900 group-hover:border-amber-500' : 'border-slate-200 bg-slate-100 group-hover:border-amber-500'
                  } shadow-xl flex items-center justify-center text-2xl font-bold`}>
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center gap-1 text-amber-500">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-[9px] font-bold">Import...</span>
                      </div>
                    ) : profileAvatarUrl ? (
                      <img src={profileAvatarUrl} alt="Photo de profil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-orange-primary font-black">
                        {(profileFullName || profileUsername || user?.email || 'U')[0].toUpperCase()}
                      </span>
                    )}

                    {/* Hover Overlay */}
                    {!isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-xs">
                        <Camera size={18} />
                        <span className="text-[9px] font-bold uppercase">Changer</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Photo Import Action Controls */}
                <div className="flex-1 w-full space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Photo de profil</span>
                    {profileAvatarUrl && (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check size={12} strokeWidth={3} /> Photo personnalisée active
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Button 1: Upload from device */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                      <span>{isUploadingImage ? "Traitement..." : "Importer une photo"}</span>
                    </button>

                    {/* Button 2: Paste Image URL */}
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        showUrlInput 
                          ? (isDark ? 'bg-white/10 text-white border-white/20' : 'bg-slate-200 text-slate-900 border-slate-300')
                          : (isDark ? 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100')
                      }`}
                    >
                      <LinkIcon size={13} />
                      <span>{showUrlInput ? "Fermer URL" : "Lien d'image (URL)"}</span>
                    </button>

                    {/* Button 3: Remove photo (Reset to initials) */}
                    {profileAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setProfileAvatarUrl('')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 text-red-400 hover:text-red-300 ${
                          isDark ? 'border-red-500/20 bg-red-500/10 hover:bg-red-500/20' : 'border-red-200 bg-red-50 hover:bg-red-100'
                        }`}
                        title="Supprimer la photo et afficher l'initiale"
                      >
                        <Trash2 size={13} />
                        <span>Supprimer</span>
                      </button>
                    )}
                  </div>

                  {/* Collapsible URL Input Field */}
                  {showUrlInput && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 pt-1"
                    >
                      <div className="relative flex-1">
                        <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="url" 
                          value={manualImageUrl}
                          onChange={(e) => setManualImageUrl(e.target.value)}
                          placeholder="https://exemple.com/ma-photo.jpg"
                          className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                            isDark ? 'bg-black/40 border-white/10 text-white placeholder-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyManualUrl();
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyManualUrl}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        Appliquer
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Input Grid: Name, Username, Role, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nom complet / Prénom
                  </label>
                  <input 
                    type="text"
                    value={profileFullName}
                    onChange={(e) => setProfileFullName(e.target.value)}
                    placeholder="Ex: Benit Madimba"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-primary/30 ${
                      isDark ? 'bg-black/40 border-white/10 text-white placeholder-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nom d'utilisateur (@pseudo)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                    <input 
                      type="text"
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value.replace(/^@/, ''))}
                      placeholder="benit"
                      className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-primary/30 ${
                        isDark ? 'bg-black/40 border-white/10 text-white placeholder-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Métier / Rôle professionnel
                  </label>
                  <input 
                    type="text"
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                    placeholder="Ex: Développeur Full Stack, Entrepreneur..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-primary/30 ${
                      isDark ? 'bg-black/40 border-white/10 text-white placeholder-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Adresse Email (Connecté)
                  </label>
                  <input 
                    type="email"
                    value={user?.email || 'Non connecté'}
                    disabled
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm opacity-60 cursor-not-allowed ${
                      isDark ? 'bg-black/20 border-white/10 text-white/70' : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Biographie / Courte description
                  </label>
                  <input 
                    type="text"
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Ex: Je crée des applications modernes, des boutiques en ligne et des interfaces web épurées."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-primary/30 ${
                      isDark ? 'bg-black/40 border-white/10 text-white placeholder-white/20' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* AI Operating Mode Switcher (Code vs Chat/No Code) */}
            <div className={`p-5 sm:p-6 rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-sm'} space-y-4`}>
              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                  <Bot className="text-orange-primary" size={18} />
                  <span>Mode de Fonctionnement de l'IA</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Choisissez si Cook IA doit générer du code web complet ou uniquement discuter / conseiller sans toucher au code existant.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Option 1: Code Mode */}
                <button
                  type="button"
                  onClick={() => setLocalAiMode('code')}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    localAiMode === 'code'
                      ? 'border-orange-primary bg-orange-primary/10 ring-2 ring-orange-primary/20 shadow-md'
                      : (isDark ? 'border-white/10 bg-black/20 hover:bg-white/[0.04]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100')
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-orange-primary font-bold text-sm">
                      <Code2 size={18} />
                      <span>Mode Code & Développement</span>
                    </div>
                    {localAiMode === 'code' && (
                      <span className="w-5 h-5 rounded-full bg-orange-primary text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    L'IA génère et met à jour en direct des pages web complètes (HTML/CSS/JS, React 18, Tailwind).
                  </p>
                </button>

                {/* Option 2: Discussion / No Code Mode */}
                <button
                  type="button"
                  onClick={() => setLocalAiMode('chat')}
                  className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                    localAiMode === 'chat'
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20 shadow-md'
                      : (isDark ? 'border-white/10 bg-black/20 hover:bg-white/[0.04]' : 'border-slate-200 bg-slate-50 hover:bg-slate-100')
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <MessageSquare size={18} />
                      <span>Mode Conversation (Ne pas coder)</span>
                    </div>
                    {localAiMode === 'chat' && (
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    L'IA répond en texte pur (conseils, architecture, questions/réponses) SANS générer ni écraser de code web.
                  </p>
                </button>
              </div>
            </div>

            {/* Custom Instructions (ChatGPT & Claude Style) */}
            <div className={`p-5 sm:p-6 rounded-2xl border ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-sm'} space-y-5`}>
              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                  <Brain className="text-purple-400" size={18} />
                  <span>Instructions Personnalisées (Style ChatGPT / Claude)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Ces instructions sont injectées dans chaque échange pour que Cook IA adapte son ton, son niveau technique et ses réponses à vos attentes.
                </p>
              </div>

              {/* Instruction 1: About User */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    1. Que doit savoir Cook IA sur vous pour personnaliser ses réponses ?
                  </label>
                  <span className="text-[10px] text-slate-400">Vos compétences, vos projets, vos outils favoris</span>
                </div>
                <textarea
                  rows={3}
                  value={customInstructionsAbout}
                  onChange={(e) => setCustomInstructionsAbout(e.target.value)}
                  placeholder="Ex: Je suis un développeur fullstack qui aime React et Tailwind CSS. Je construis des projets innovants et j'apprécie un code propre, moderne et performant."
                  className={`w-full p-3 rounded-xl border text-xs leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-y ${
                    isDark ? 'bg-black/40 border-white/10 text-white placeholder-white/25' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                {/* Quick tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    "Développeur React & TypeScript",
                    "Designer UI/UX axé minimalisme",
                    "Entrepreneur / Créateur SaaS",
                    "Débutant en développement web"
                  ].map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCustomInstructionsAbout(prev => prev ? `${prev}. ${tag}` : tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                        isDark ? 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instruction 2: Response Style */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    2. Comment souhaitez-vous que Cook IA formule ses réponses ?
                  </label>
                  <span className="text-[10px] text-slate-400">Ton, concision, style rédactionnel</span>
                </div>
                <textarea
                  rows={3}
                  value={customInstructionsStyle}
                  onChange={(e) => setCustomInstructionsStyle(e.target.value)}
                  placeholder="Ex: Sois direct, concis et précis. Évite les bavardages inutiles. Explique les choix techniques avec des exemples clairs. Privilégie le format Markdown."
                  className={`w-full p-3 rounded-xl border text-xs leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-y ${
                    isDark ? 'bg-black/40 border-white/10 text-white placeholder-white/25' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                {/* Quick tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    "Direct & concis sans bavardage",
                    "Pédagogique avec explications pas à pas",
                    "Focus performance & accessibilité",
                    "Format Markdown structuré"
                  ].map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCustomInstructionsStyle(prev => prev ? `${prev}. ${tag}` : tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                        isDark ? 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10' : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button & Feedback Alert */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs">
                {profileSaveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
                  >
                    <CheckCheck size={15} />
                    <span>Informations & préférences enregistrées avec succès !</span>
                  </motion.div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-primary to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-primary/25 hover:shadow-orange-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSavingProfile ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{isSavingProfile ? "Enregistrement..." : "Enregistrer les informations"}</span>
              </button>
            </div>

            {/* Account Usage Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white shadow-sm'}`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Projets créés</span>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{conversationsCount}</span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white shadow-sm'}`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Statut synchronisation</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Actif & Sauvegardé
                </span>
              </div>
            </div>

            {/* Admin Activity Inspection Section for Super Admin Benit */}
            {user?.email === 'benit800@gmail.com' && (
              <div className={`p-5 rounded-2xl border ${isDark ? 'border-amber-500/20 bg-amber-500/[0.03]' : 'border-amber-200 bg-amber-50/50'} space-y-4`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                    <Activity size={16} className="text-yellow-500 animate-pulse" />
                    <span>Activités Réseau (Super Admin)</span>
                  </h4>
                  <button 
                    type="button"
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
                    <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto pr-1">
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
                                type="button"
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

            {/* Logout Button */}
            <div className="pt-2">
              <button 
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isDark ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400' : 'border-red-200 bg-red-50 hover:bg-red-100 text-red-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <LogOut size={18} />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold block">{lang === 'fr' ? 'Se déconnecter de Cook IA' : 'Sign out of Cook IA'}</span>
                    <span className="text-[11px] opacity-70 block">{user?.email}</span>
                  </div>
                </div>
                <ChevronRight size={16} />
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
                    Panneau de Contrôle Admin - Benit Madimba
                  </h3>
                  <p className="text-xs text-slate-400">Gérez l'annonce système, modérez les règles et suivez l'activité en temps réel.</p>
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

            {/* Section 1: Message Système / Annonce Globale aux Utilisateurs */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-200 bg-amber-50/60'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Bell size={18} className="text-amber-500" />
                <h4 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Message d'Annonce Système (Bannière Globale)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Changez le message affiché en haut du site pour tous les utilisateurs (ex: annoncer des corrections de bugs, maintenances ou nouveautés).
              </p>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setAnnouncementMessage("Cook IA version 1.0.0 est en ligne. Découvrez le nouveau studio d'architecture. Bonne création.")}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                >
                  🛠️ Bugs corrigés
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementMessage("Nouveau réseau de modèles IA 100% gratuits activé (Gemini, Groq, OpenRouter) !")}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                >
                  ⚡ Modèles IA Gratuits
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementMessage("Serveurs optimisés & stables. Toutes les fonctionnalités sont opérationnelles.")}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                >
                  🚀 Serveurs stables
                </button>
              </div>

              <textarea
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                rows={2}
                placeholder="Rédigez le message de bannière..."
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-1 ${
                  isDark 
                    ? 'border-white/10 bg-black/50 text-white focus:border-amber-500' 
                    : 'border-slate-300 bg-white text-slate-900 focus:border-amber-500'
                }`}
              />

              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-400">
                  <input
                    type="checkbox"
                    checked={isAnnouncementActive}
                    onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                  />
                  <span>Activer l'affichage de la bannière</span>
                </label>

                <button
                  onClick={handleSaveAnnouncement}
                  disabled={savingAnnouncement}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {savingAnnouncement ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Publier le message
                </button>
              </div>

              {announcementStatusMsg && (
                <div className="mt-2 text-xs font-bold text-emerald-400 text-right">
                  {announcementStatusMsg}
                </div>
              )}
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
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Utilisateurs Bannis</span>
                <p className="text-xl font-extrabold text-red-500">
                  {adminUsers.filter(u => u.isBanned).length}
                </p>
              </div>
            </div>

            {/* Moderation Title & Search filter input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500" />
                <h4 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Gestion des Règles & Bannissement des Utilisateurs
                </h4>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={adminSearchText}
                  onChange={(e) => setAdminSearchText(e.target.value)}
                  placeholder="Rechercher par nom d'utilisateur, ID, ou titre..."
                  className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-1 ${
                    isDark 
                      ? 'border-white/10 bg-black/40 text-white focus:border-yellow-500 focus:ring-yellow-500' 
                      : 'border-slate-200 bg-white text-slate-900 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
              </div>
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
                  const isBanned = !!userObj.isBanned;

                  return (
                    <div 
                      key={userObj.id} 
                      className={`rounded-2xl border transition-all ${
                        isBanned
                          ? (isDark ? 'border-red-500/30 bg-red-950/20' : 'border-red-200 bg-red-50/50')
                          : (isDark ? 'border-white/5 bg-zinc-900/60' : 'border-slate-100 bg-white shadow-sm')
                      }`}
                    >
                      {/* User Header Accordion Toggle */}
                      <div className="w-full flex items-center justify-between p-4 flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                            isBanned ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-800'
                          }`}>
                            {userObj.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {userObj.username}
                              </h4>
                              {isBanned ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                  <Ban size={10} /> BANNI
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  🟢 Conforme
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {userObj.id}</p>
                            {isBanned && userObj.banReason && (
                              <p className="text-[10px] text-red-400 italic">Raison: {userObj.banReason}</p>
                            )}
                          </div>
                        </div>

                        {/* Ban / Unban Controls */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Raison du bannissement..."
                            value={customBanReasons[userObj.id] || ''}
                            onChange={(e) => setCustomBanReasons({ ...customBanReasons, [userObj.id]: e.target.value })}
                            className={`px-2.5 py-1 text-xs rounded-lg border focus:outline-none ${
                              isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                            }`}
                          />
                          
                          <button
                            onClick={() => handleToggleBanUser(userObj)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                              isBanned
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                            }`}
                          >
                            {isBanned ? (
                              <>
                                <CheckCircle size={12} /> Débannir
                              </>
                            ) : (
                              <>
                                <Ban size={12} /> Bannir
                              </>
                            )}
                          </button>

                          <button 
                            onClick={() => toggleUserExpanded(userObj.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Voir les activités"
                          >
                            <span className={`text-xs block transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                          </button>
                        </div>
                      </div>

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
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Modèles IA 100% Gratuits</h3>
              </div>
              <p className="text-xs text-slate-400">Choisissez le modèle IA gratuit de votre choix pour alimenter vos créations.</p>
            </div>
            
              <div className="space-y-3">
                {[
                  { 
                    id: 'gemini-2.5-flash',
                    name: 'Gemini 2.5 Flash (Recommandé - Sans Quota)', 
                    provider: 'Google', 
                    desc: 'Modèle ultra-fiable et rapide sans restriction de quota. Inclus 100% gratuitement.', 
                    badge: '100% Gratuit' 
                  },
                  { 
                    id: 'gemini-3.5-flash',
                    name: 'Gemini 3.5 Flash (Performance Pro)', 
                    provider: 'Google', 
                    desc: 'Modèle de nouvelle génération ultra-performant pour le code et le design.', 
                    badge: '100% Gratuit' 
                  },
                  { 
                    id: 'gemini-3.5-flash-lite',
                    name: 'Gemini 3.5 Flash Lite', 
                    provider: 'Google', 
                    desc: 'Modèle léger nouvelle génération optimisé pour une réponse instantanée.', 
                    badge: '100% Gratuit' 
                  },
                  { 
                    id: 'gemini-3.1-flash-lite',
                    name: 'Gemini 3.1 Flash Lite', 
                    provider: 'Google', 
                    desc: 'Modèle ultra-léger conçu pour une vitesse d\'exécution instantanée.', 
                    badge: '100% Gratuit' 
                  },
                  { 
                    id: 'groq-llama-3.3-70b',
                    name: 'Groq Llama 3.3 70B (Gratuit)', 
                    provider: 'Groq Cloud', 
                    desc: 'Inférence ultra-rapide propulsée par les puces LPU Groq.', 
                    badge: '100% Gratuit' 
                  },
                  { 
                    id: 'openrouter-free',
                    name: 'OpenRouter DeepSeek R1 (Gratuit)', 
                    provider: 'OpenRouter', 
                    desc: 'Accès aux modèles gratuits de la communauté (DeepSeek R1, Llama 3.3).', 
                    badge: '100% Gratuit' 
                  },
                ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectModel?.(m.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all relative group ${
                    selectedModel === m.id 
                      ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                      : `border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10`
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{m.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-white/40 uppercase font-black">{m.provider}</span>
                    </div>
                    {m.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pr-8">{m.desc}</p>
                  
                  {selectedModel === m.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle size={20} className="text-amber-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex gap-3">
                <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-900'}`}>Cycle de Secours Automatique (Failover Multi-Fournisseurs)</h5>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-amber-300/80' : 'text-amber-800'}`}>
                    Tous les modèles ci-dessus sont 100% gratuits. Si votre modèle principal rencontre un pic de trafic, le cycle passe automatiquement la main : 
                    <b className="block mt-1">🔄 Gemini Free ➔ Groq Free ➔ OpenRouter Free</b>
                  </p>
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
            <div className={`flex items-center justify-between px-3 sm:px-4 py-3 border-b shrink-0 ${isDark ? 'border-white/5 bg-[#171717]' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex-1 overflow-x-auto no-scrollbar py-0.5">
                <div className="flex items-center gap-1.5 min-w-max">
                  {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                          activeTab === tab.id 
                            ? (isDark ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold' : 'bg-slate-900 text-white shadow-sm font-bold')
                            : (isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70')
                        }`}
                      >
                        {TabIcon && <TabIcon size={14} className="shrink-0" />}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button 
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ml-2 ${isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-700'}`}
                title="Fermer"
              >
                <X size={18} />
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
