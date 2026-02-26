import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Send, Loader2, ImagePlus, X, Image as ImageIcon } from 'lucide-react';
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
  selectedImages: string[];
  setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>;
  onOpenImageSearch?: () => void;
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
  selectedImages,
  setSelectedImages,
  onOpenImageSearch
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 20 - selectedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(`You can only upload up to 20 images. Adding the first ${remainingSlots} selected.`);
    }

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
    <aside className="w-full lg:w-[420px] flex flex-col bg-[#0D0D0D] rounded-3xl lg:rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl transition-all duration-500 hover:border-white/10">
      <div className="p-4 lg:p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-1 lg:p-1.5 shadow-inner">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xs lg:text-sm font-black uppercase tracking-[0.3em] lg:tracking-[0.4em] text-white leading-none mb-0.5 lg:mb-1">COOK IA</h2>
            <p className="text-[8px] lg:text-[9px] font-medium uppercase tracking-widest text-white/30">Engine v2.5</p>
          </div>
        </div>
        <div className="flex gap-1 lg:gap-1.5">
          <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-orange-primary animate-pulse" />
          <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-8 scrollbar-hide">
        {messages.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.images && msg.images.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2 max-w-[92%] justify-end">
                {msg.images.map((img, i) => (
                  <div key={i} className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                    <img src={img} alt={`Reference ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {msg.image && (
              <div className="mb-2 max-w-[80%] rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <img src={msg.image} alt="Reference" className="w-full h-auto" />
              </div>
            )}
            <div className={`max-w-[92%] p-4 lg:p-5 rounded-2xl lg:rounded-[1.5rem] text-xs lg:text-[13px] leading-relaxed shadow-lg ${
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
            className="flex items-center justify-between gap-2 lg:gap-3 text-orange-primary/60 text-[8px] lg:text-[10px] font-bold uppercase tracking-widest"
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <Loader2 size={12} className="animate-spin" />
              <span>Architecting your vision...</span>
            </div>
            <button 
              onClick={onAbort}
              className="text-[8px] lg:text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md transition-colors border border-white/5"
            >
              Annuler
            </button>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 lg:p-8 bg-[#0D0D0D] border-t border-white/5">
        <AnimatePresence>
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 lg:mb-4 max-h-32 overflow-y-auto scrollbar-hide p-1">
              {selectedImages.map((img, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-lg lg:rounded-xl overflow-hidden border border-orange-primary/30 shadow-2xl group shrink-0"
                >
                  <img src={img} alt={`Selected ${index}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(index)}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={8} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Describe your masterpiece..."
            className="w-full bg-[#050505] border border-white/5 rounded-2xl lg:rounded-[1.5rem] p-4 lg:p-5 pr-20 lg:pr-24 text-xs lg:text-sm focus:outline-none focus:border-orange-primary/40 transition-all resize-none h-24 lg:h-28 scrollbar-hide placeholder:text-white/10"
          />
          <div className="absolute right-3 lg:right-4 bottom-3 lg:bottom-4 flex items-center gap-1.5 lg:gap-2">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button 
              onClick={onOpenImageSearch}
              className="p-2 lg:p-3 text-white/20 hover:text-orange-primary transition-colors"
              title="Search professional photos on Unsplash"
            >
              <ImageIcon size={18} />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 lg:p-3 text-white/20 hover:text-orange-primary transition-colors"
              title="Add reference images (max 20)"
            >
              <ImagePlus size={18} />
            </button>
            <button 
              onClick={handleSend}
              disabled={isLoading || (!prompt.trim() && selectedImages.length === 0)}
              className="p-2.5 lg:p-3 bg-orange-primary text-white rounded-xl lg:rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-orange-primary/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
