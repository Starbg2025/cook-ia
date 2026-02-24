import React from 'react';
import { motion } from 'motion/react';
import { Zap, Send, Loader2 } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  prompt: string;
  setPrompt: (val: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  logoUrl: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  prompt,
  setPrompt,
  handleSend,
  isLoading,
  chatEndRef,
  logoUrl
}) => {
  return (
    <aside className="w-[400px] flex flex-col bg-[#141414] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 bg-white/5 p-1">
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">COOK IA</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-orange-primary text-white font-medium shadow-[0_10px_30px_rgba(255,107,0,0.2)]' 
                : 'bg-[#1F1F1F] text-white/80 border border-white/5'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 text-white/40 text-xs font-medium animate-pulse">
            <Loader2 size={14} className="animate-spin" />
            Cooking your website...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-6 bg-[#1A1A1A]">
        <div className="relative">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Build a futuristic landing page..."
            className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 pr-12 text-sm focus:outline-none focus:border-orange-primary/50 transition-all resize-none h-24 scrollbar-hide"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !prompt.trim()}
            className="absolute right-3 bottom-3 p-2 bg-orange-primary/10 text-orange-primary rounded-xl hover:bg-orange-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
