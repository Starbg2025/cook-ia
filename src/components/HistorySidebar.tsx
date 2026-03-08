import React, { useState, useRef } from 'react';
import { Plus, MessageSquare, History, Trash2, Settings, User, LogOut, HelpCircle, Sparkles, ChevronRight, Camera } from 'lucide-react';
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
  user,
  isDark = true
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const { error } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            avatar_url: base64String,
            updated_at: new Date().toISOString()
          });
        if (error) throw error;
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setIsUploading(false);
    }
  };

  const userDisplayName = user?.profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur';
  const userHandle = user?.profile?.username ? `@${user.profile.username}` : `@${user?.email?.split('@')[0] || 'user'}`;
  const avatarUrl = user?.profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <aside className={`w-64 flex flex-col ${isDark ? 'bg-[#0D0D0D] border-white/5' : 'bg-slate-50 border-slate-200'} border-r h-full relative`}>
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-200'} py-3 rounded-xl border transition-all font-medium text-sm`}
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-400'} flex items-center gap-2`}>
          <History size={12} />
          Recent Projects
        </div>
        
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className={`text-xs ${isDark ? 'text-white/20' : 'text-slate-300'} italic`}>No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div 
              key={conv.id}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                currentConversationId === conv.id 
                  ? (isDark ? 'bg-white/10 text-white' : 'bg-orange-primary/10 text-orange-primary') 
                  : (isDark ? 'text-white/40 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0" />
                <span className="text-sm truncate font-medium">{conv.title}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-red-500/20 text-white/20 hover:text-red-400' : 'hover:bg-red-50 text-slate-300 hover:text-red-500'}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Profile Section */}
      {user && (
        <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="relative">
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={`absolute bottom-full left-0 w-full mb-2 ${isDark ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-slate-200 shadow-xl'} border rounded-2xl shadow-2xl overflow-hidden z-50`}
                >
                  <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'} flex items-center gap-3`}>
                    <div className="relative group/avatar">
                      <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200'} flex items-center justify-center overflow-hidden border`}>
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{userDisplayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full"
                      >
                        <Camera size={14} className="text-white" />
                      </button>
                    </div>
                    <div className="overflow-hidden">
                      <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{userDisplayName}</p>
                      <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-slate-500'} truncate`}>{userHandle}</p>
                    </div>
                  </div>

                  <div className="p-2">
                    <button 
                      onClick={() => {
                        onOpenSettings('personalization');
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-sm ${isDark ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
                    >
                      <Sparkles size={16} />
                      Personnalisation
                    </button>
                    <button 
                      onClick={() => {
                        onOpenSettings();
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-sm ${isDark ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
                    >
                      <Settings size={16} />
                      Paramètres
                    </button>
                    <div className={`h-[1px] ${isDark ? 'bg-white/5' : 'bg-slate-100'} my-1`} />
                    <button 
                      onClick={() => {
                        onOpenSettings('help');
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-sm ${isDark ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle size={16} />
                        Aide
                      </div>
                      <ChevronRight size={14} className={isDark ? 'text-white/20' : 'text-slate-300'} />
                    </button>
                    <button 
                      onClick={() => supabase.auth.signOut()}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-sm ${isDark ? 'hover:bg-red-500/10 text-white/70 hover:text-red-500' : 'hover:bg-red-50 text-slate-600 hover:text-red-600'}`}
                    >
                      <LogOut size={16} />
                      Se déconnecter
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleAvatarClick}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all group ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-white/10 border-white/10' : 'bg-slate-200 border-slate-300'} flex items-center justify-center overflow-hidden border shrink-0`}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{userDisplayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="text-left overflow-hidden">
                  <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{userDisplayName}</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
    </aside>
  );
};
