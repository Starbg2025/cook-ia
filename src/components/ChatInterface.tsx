import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Send, Loader2, ImagePlus, X } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  prompt: string;
  setPrompt: (val: string) => void;
  handleSend: () => void;
  onAbort?: () => void;
  isLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  logoUrl: string;
  selectedImage: string | null;
  setSelectedImage: (val: string | null) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  prompt,
  setPrompt,
  handleSend,
  onAbort,
  isLoading,
  chatEndRef,
  logoUrl,
  selectedImage,
  setSelectedImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-[420px] flex flex-col bg-[#0D0D0D] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/10">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-1.5 shadow-inner">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white leading-none mb-1">COOK IA</h2>
            <p className="text-[9px] font-medium uppercase tracking-widest text-white/30">Engine v2.5</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-primary animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.image && (
              <div className="mb-2 max-w-[80%] rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <img src={msg.image} alt="Reference" className="w-full h-auto" />
              </div>
            )}
            <div className={`max-w-[92%] p-5 rounded-[1.5rem] text-[13px] leading-relaxed shadow-lg ${
              msg.role === 'user' 
                ? 'bg-orange-primary text-white font-medium shadow-orange-primary/20' 
                : 'bg-[#1A1A1A] text-white/90 border border-white/5'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between gap-3 text-orange-primary/60 text-[10px] font-bold uppercase tracking-widest"
          >
            <div className="flex items-center gap-3">
              <Loader2 size={14} className="animate-spin" />
              <span>Architecting your vision...</span>
            </div>
            <button 
              onClick={onAbort}
              className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md transition-colors border border-white/5"
            >
              Annuler
            </button>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-8 bg-[#0D0D0D] border-t border-white/5">
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="relative w-20 h-20 mb-4 rounded-2xl overflow-hidden border border-orange-primary/30 shadow-2xl group"
            >
              <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Describe your masterpiece..."
            className="w-full bg-[#050505] border border-white/5 rounded-[1.5rem] p-5 pr-24 text-sm focus:outline-none focus:border-orange-primary/40 transition-all resize-none h-28 scrollbar-hide placeholder:text-white/10"
          />
          <div className="absolute right-4 bottom-4 flex items-center gap-2">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-white/20 hover:text-orange-primary transition-colors"
              title="Add reference image"
            >
              <ImagePlus size={20} />
            </button>
            <button 
              onClick={handleSend}
              disabled={isLoading || (!prompt.trim() && !selectedImage)}
              className="p-3 bg-orange-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-orange-primary/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
