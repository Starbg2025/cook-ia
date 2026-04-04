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
  LayoutGrid,
  History,
  FileText,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap
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
  currentView,
  user,
  isDark = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const buildItems = [
    { id: 'your-apps', label: 'Your apps', icon: Zap },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`w-full flex flex-col h-full border-r ${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200'}`}>
      {/* Header Dropdown */}
      <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <button className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Cook IA</span>
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>
      </div>

      {/* Build Section */}
      <div className="p-4 space-y-1">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 mb-4"
        >
          <Plus size={18} />
          New Chat
        </button>

        <h3 className={`px-3 py-2 text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Build</h3>
        {buildItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onSelectView(item.id as any);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
              currentView === item.id
                ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
            }`}
          >
            <item.icon size={18} className={currentView === item.id ? (isDark ? 'text-blue-400' : 'text-blue-600') : 'text-slate-400'} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Recently Viewed Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
        <h3 className={`px-3 py-2 text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Recently viewed</h3>
        
        {filteredConversations.length === 0 ? (
          <div className={`px-3 py-4 text-xs italic ${isDark ? 'text-white/20' : 'text-slate-300'}`}>
            No recent items
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div 
              key={conv.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
                currentConversationId === conv.id 
                  ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')
                  : (isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0 text-slate-400" />
                <span className="text-sm truncate">{conv.title}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all ${isDark ? 'hover:bg-red-500/20 text-white/20 hover:text-red-400' : 'hover:bg-red-50 text-slate-300 hover:text-red-500'}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* User Profile Section */}
      <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        {user ? (
          <div className="flex items-center justify-between group">
            <button 
              onClick={() => onOpenSettings('account')}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all flex-1 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.email?.[0].toUpperCase() || 'U'
                )}
              </div>
              <div className="flex flex-col items-start overflow-hidden">
                <span className={`text-sm font-semibold truncate w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user.user_metadata?.username || user.email?.split('@')[0]}
                </span>
                <span className={`text-[10px] truncate w-full ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  {user.email}
                </span>
              </div>
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className={`p-2 rounded-lg transition-all ${isDark ? 'text-white/20 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onOpenSettings('account')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white shrink-0">
              <User size={16} />
            </div>
            <span className="text-sm font-semibold">Se connecter</span>
          </button>
        )}
      </div>

      {/* Footer Search */}
      <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
      </div>
    </aside>
  );
};
