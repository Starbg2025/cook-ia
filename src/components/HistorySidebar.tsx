import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  User, 
  LogOut, 
  HelpCircle, 
  ChevronDown, 
  Search, 
  Zap, 
  Copy, 
  ShoppingBag,
  Sparkles,
  Layers,
  Clock,
  FolderOpen
} from 'lucide-react';
import { Conversation } from '../types';
import { supabase } from '../services/supabaseService';
import { motion, AnimatePresence } from 'motion/react';

interface HistorySidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: (tab?: any) => void;
  onSelectView: (view: 'your-apps' | 'faq') => void;
  onCloneSite: () => void;
  onEcommerceProduct: () => void;
  onGoHome?: () => void;
  currentView: string;
  user: any;
  isDark?: boolean;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onOpenSettings,
  onSelectView,
  onCloneSite,
  onEcommerceProduct,
  onGoHome,
  currentView,
  user,
  isDark = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [storedProfile, setStoredProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('cook_ia_profile_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  React.useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('cook_ia_profile_data');
        if (saved) setStoredProfile(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const buildItems = [
    ...(onGoHome ? [{ id: 'home', label: 'Accueil / Vitrine', icon: Sparkles, action: onGoHome }] : []),
    { id: 'your-apps', label: 'Vos Applications', icon: Layers },
    { id: 'clone', label: 'Cloner un site', icon: Copy, action: onCloneSite },
    { id: 'ecommerce', label: 'E-commerce rapide', icon: ShoppingBag, action: onEcommerceProduct },
    { id: 'faq', label: 'Guide & FAQ', icon: HelpCircle },
  ];

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`w-full flex flex-col h-full border-r select-none ${
      isDark ? 'bg-[#0B0F17] border-white/[0.08] text-white' : 'bg-[#FAFAFC] border-slate-200 text-slate-900'
    }`}>
      {/* Top Header with App Brand */}
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/[0.06]' : 'border-slate-200/80'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-primary to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-primary/20 border border-white/20">
            <Zap size={16} className="fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
              Cook IA
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-orange-primary/15 text-orange-primary font-bold border border-orange-primary/30">
                PRO
              </span>
            </span>
          </div>
        </div>

        <button 
          onClick={onNewChat}
          className="p-1.5 rounded-lg bg-orange-primary hover:bg-orange-hover text-white transition-all shadow-sm shadow-orange-primary/20"
          title="Nouveau projet"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* New Project Primary Button (Claude / ChatGPT style) */}
      <div className="p-3">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-hover hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-primary/20 hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            <span>Nouveau projet</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-mono text-white/90">
            ⌘N
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
          <input 
            type="text"
            placeholder="Rechercher un projet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs transition-all focus:outline-none ${
              isDark 
                ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/30 focus:border-orange-primary/50' 
                : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-orange-primary/50'
            }`}
          />
        </div>
      </div>

      {/* Quick Tools Section */}
      <div className="px-3 py-2 space-y-0.5">
        <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
          Outils & Création
        </div>
        {buildItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  onSelectView(item.id as any);
                }
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-xs font-medium ${
                isActive
                  ? (isDark ? 'bg-orange-primary/15 text-orange-primary font-semibold' : 'bg-orange-50 text-orange-600 font-semibold')
                  : (isDark ? 'text-white/65 hover:bg-white/[0.05] hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
              }`}
            >
              <IconComponent size={15} className={isActive ? 'text-orange-primary' : (isDark ? 'text-white/40' : 'text-slate-400')} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recent Projects List (ChatGPT / Claude style) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        <div className="flex items-center justify-between px-2 py-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            Historique des projets
          </span>
          <span className={`text-[10px] font-mono ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            {filteredConversations.length}
          </span>
        </div>
        
        {filteredConversations.length === 0 ? (
          <div className={`px-3 py-6 text-center text-xs ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            <FolderOpen size={24} className="mx-auto mb-1.5 opacity-40" />
            Aucun projet trouvé
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = currentConversationId === conv.id;
            return (
              <div 
                key={conv.id}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? (isDark ? 'bg-white/[0.09] text-white border-l-2 border-orange-primary' : 'bg-slate-200/80 text-slate-900 border-l-2 border-orange-primary')
                    : (isDark ? 'text-white/70 hover:bg-white/[0.04] hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                  <MessageSquare size={14} className={`shrink-0 ${isSelected ? 'text-orange-primary' : (isDark ? 'text-white/40' : 'text-slate-400')}`} />
                  <span className="text-xs truncate font-medium">{conv.title}</span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all shrink-0 ${
                    isDark ? 'hover:bg-rose-500/20 text-white/30 hover:text-rose-400' : 'hover:bg-rose-50 text-slate-400 hover:text-rose-500'
                  }`}
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* User Profile / Account Footer */}
      <div className={`p-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200/80'}`}>
        {user ? (
          <div className="flex items-center justify-between gap-1">
            <button 
              onClick={() => onOpenSettings('account')}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 ${
                isDark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-100'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-bold text-xs text-white shrink-0 overflow-hidden shadow-sm">
                {storedProfile?.avatarUrl ? (
                  <img src={storedProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.email?.[0].toUpperCase() || 'U'
                )}
              </div>
              <div className="flex flex-col items-start overflow-hidden min-w-0">
                <span className={`text-xs font-bold truncate w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user.email === 'benit800@gmail.com' ? 'Benit (Créateur)' : (storedProfile?.username ? `@${storedProfile.username}` : (user.user_metadata?.username || user.email?.split('@')[0]))}
                </span>
                <span className={`text-[10px] truncate w-full ${isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>
                  {user.email === 'benit800@gmail.com' ? 'Cook IA Infinity Admin' : (storedProfile?.role || 'Profil & Instructions IA')}
                </span>
              </div>
            </button>

            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className={`p-2 rounded-lg transition-all ${
                isDark ? 'text-white/30 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
              }`}
              title="Déconnexion"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onOpenSettings('account')}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isDark 
                ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
            }`}
          >
            <User size={14} />
            <span>Se connecter</span>
          </button>
        )}
      </div>
    </aside>
  );
};
