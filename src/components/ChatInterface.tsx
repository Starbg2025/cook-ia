import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Send, Loader2, ImagePlus, X, Image as ImageIcon, Copy, ShoppingBag, Video, Search, Layout, CheckCircle, User, Mic, Plus, Sparkles, Flag, ThumbsUp, ThumbsDown, Eye, RotateCcw, ChevronDown, FileText, Clock, Settings, Terminal } from 'lucide-react';
import { Message, ActionHistory } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  prompt: string;
  setPrompt: (val: string) => void;
  handleSend: () => void;
  onAbort?: () => void;
  isLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  logoUrl: string;
  selectedImages: string[];
  setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>;
  selectedVideos: string[];
  setSelectedVideos: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenImageSearch?: () => void;
  onCloneSite?: () => void;
  onEcommerceProduct?: () => void;
  onOpenSettings?: (tab?: any) => void;
  isDark?: boolean;
  isFocusMode?: boolean;
  setIsFocusMode?: (val: boolean) => void;
}

const ActionHistoryItem: React.FC<{ action: ActionHistory; isDark: boolean }> = ({ action, isDark }) => {
  const icon = action.type === 'read' ? <FileText size={14} /> : action.type === 'shell' ? <Terminal size={14} /> : <Clock size={14} />;
  const label = action.type === 'read' ? 'Read file' : action.type === 'shell' ? 'Executed shell command' : 'Thought';
  
  return (
    <div className={`flex items-center gap-2 py-1 px-2 rounded-md ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'} transition-colors cursor-default group`}>
      <span className={isDark ? 'text-white/40' : 'text-slate-400'}>{icon}</span>
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{label}</span>
        <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{action.content}</span>
      </div>
    </div>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  prompt,
  setPrompt,
  handleSend,
  onAbort,
  isLoading,
  chatEndRef,
  logoUrl,
  selectedImages,
  setSelectedImages,
  selectedVideos,
  setSelectedVideos,
  onOpenImageSearch,
  onCloneSite,
  onEcommerceProduct,
  onOpenSettings,
  isDark = true,
  isFocusMode = false,
  setIsFocusMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 20 - selectedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  return (
    <aside className={`flex-1 flex flex-col h-full ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'} overflow-hidden`}>
      {/* Chat Header */}
      <div className={`h-14 border-b flex items-center justify-between px-6 shrink-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Chat</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onOpenSettings?.('publish')}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-12 scrollbar-hide">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 max-w-4xl mx-auto w-full"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' 
                  ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600')
                  : (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600')
              }`}>
                {msg.role === 'user' ? <User size={12} /> : <Sparkles size={12} />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                msg.role === 'user' 
                  ? (isDark ? 'text-white/40' : 'text-slate-400')
                  : 'text-orange-primary'
              }`}>
                {msg.role === 'user' ? 'You' : (msg._provider || 'Cook IA')}
              </span>
            </div>

            <div className="flex flex-col gap-4 pl-9">
              {msg.role === 'model' && (
                <div className={`text-[9px] px-2 py-0.5 rounded-full border w-fit ${
                  isDark ? 'text-white/30 border-white/5 bg-white/5' : 'text-slate-400 border-slate-100 bg-slate-50'
                } font-mono`}>
                  {msg.modelName || 'cook-ia-engine-v3'}
                </div>
              )}

              {msg.images && msg.images.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {msg.images.map((img, i) => (
                    <div key={i} className={`group relative w-32 h-32 rounded-2xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-slate-200'} shadow-sm`}>
                      <img src={img} alt={`Reference ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              
              <div className={`text-sm leading-relaxed ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                {msg.content}
              </div>

              {msg.role === 'model' && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <button className={`p-1.5 rounded-md ${isDark ? 'text-white/20 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}>
                      <ThumbsUp size={14} />
                    </button>
                    <button className={`p-1.5 rounded-md ${isDark ? 'text-white/20 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}>
                      <ThumbsDown size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <Loader2 size={12} className="animate-spin" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                Cook IA
              </span>
            </div>
            <div className="pl-9">
              <div className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-400'} italic animate-pulse`}>
                Building your site...
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className={`p-4 lg:p-6 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
        <div className={`max-w-4xl mx-auto relative border ${isDark ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-slate-50'} rounded-[24px] transition-all focus-within:border-blue-500/50 shadow-sm`}>
          
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 border-b border-white/5">
              {selectedImages.map((img, i) => (
                <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                  <img src={img} alt="Upload" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type your prompt here..."
            className={`w-full bg-transparent p-4 pr-32 text-sm focus:outline-none resize-none h-24 scrollbar-hide ${isDark ? 'text-white placeholder:text-white/20' : 'text-slate-900 placeholder:text-slate-400'}`}
          />
          
          <div className="absolute left-3 bottom-3 flex items-center gap-1">
            <button 
              onClick={onCloneSite}
              className={`p-2 rounded-lg ${isDark ? 'text-orange-primary hover:text-orange-400 hover:bg-white/5' : 'text-orange-600 hover:text-orange-700 hover:bg-slate-100'} transition-all`}
              title="Clone site"
            >
              <Copy size={18} />
            </button>
            <button 
              onClick={onEcommerceProduct}
              className={`p-2 rounded-lg ${isDark ? 'text-orange-primary hover:text-orange-400 hover:bg-white/5' : 'text-orange-600 hover:text-orange-700 hover:bg-slate-100'} transition-all`}
              title="E-commerce product"
            >
              <ShoppingBag size={18} />
            </button>
            <button className={`p-2 rounded-lg ${isDark ? 'text-orange-primary hover:text-orange-400 hover:bg-white/5' : 'text-orange-600 hover:text-orange-700 hover:bg-slate-100'} transition-all`}>
              <Layout size={18} />
            </button>
            <button className={`p-2 rounded-lg ${isDark ? 'text-orange-primary hover:text-orange-400 hover:bg-white/5' : 'text-orange-600 hover:text-orange-700 hover:bg-slate-100'} transition-all`}>
              <Mic size={18} />
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-lg ${isDark ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'} transition-all`}
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              onClick={() => setIsFocusMode?.(!isFocusMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                isFocusMode 
                  ? 'bg-orange-primary text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]' 
                  : (isDark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-900')
              }`}
            >
              <Zap size={12} className={isFocusMode ? 'animate-pulse' : ''} />
              FOCUS MODE
            </button>
            <button 
              onClick={handleSend}
              disabled={isLoading || !prompt.trim()}
              className={`p-2 rounded-xl transition-all ${
                prompt.trim() 
                  ? 'bg-orange-primary text-white hover:bg-orange-600' 
                  : (isDark ? 'bg-white/5 text-white/20' : 'bg-slate-100 text-slate-300')
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
