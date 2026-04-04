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
  Check
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
  user: any;
  isProjectSettings?: boolean;
  prompts?: string[];
  isDark?: boolean;
}

type TabType = 'publish' | 'versions' | 'secrets' | 'integrations' | 'github' | 'general' | 'account' | 'help';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialTab = 'publish', user, isProjectSettings = true, prompts = [], isDark = false }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [accessLevel, setAccessLevel] = useState('Restricted: Only people you specify can access');
  const [isLinkFullscreen, setIsLinkFullscreen] = useState(false);
  const [secrets, setSecrets] = useState<{ key: string; value: string }[]>([]);
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://cook-ia.online';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const tabs = isProjectSettings ? [
    { id: 'publish', label: 'Publish', icon: Share2 },
    { id: 'versions', label: 'Versions', icon: History },
    { id: 'secrets', label: 'Secrets', icon: Key },
    { id: 'integrations', label: 'Integrations', icon: Layers },
    { id: 'github', label: 'GitHub', icon: Github },
  ] : [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

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
                    onClick={() => {}}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-sm ${
                      isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Lock size={16} className="text-slate-400" />
                      <span>{accessLevel}</span>
                    </div>
                    <ChevronDown size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>People and groups with access</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Start typing email addresses here"
                    className={`flex-1 p-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">
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
              </div>

              <div className={`space-y-4 pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Link setting</span>
                    <span className="text-xs text-slate-400">Default to fullscreen</span>
                  </div>
                  <button 
                    onClick={() => setIsLinkFullscreen(!isLinkFullscreen)}
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
                      setSecrets([...secrets, { key: newSecretKey, value: newSecretValue }]);
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
                    <span className="text-xs text-slate-400">••••••••••••••••</span>
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
      case 'github':
        return (
          <div className="space-y-6 p-2">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>GitHub Integration</h3>
            <div className={`p-6 rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'} text-center`}>
              <Github size={32} className="mx-auto mb-4 text-slate-900 opacity-50" />
              <p className={`text-sm mb-6 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Enregistrez votre projet directement sur GitHub pour le déployer ailleurs.</p>
              <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-all flex items-center justify-center gap-2">
                <Github size={18} />
                Connect to GitHub
              </button>
            </div>
          </div>
        );
      case 'general':
        return (
          <div className="space-y-6 p-2">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Project Name</span>
                  <span className="text-xs text-slate-400">Change the name of your project</span>
                </div>
                <input 
                  type="text"
                  defaultValue="Vibrant Morphing"
                  className={`p-2 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
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
