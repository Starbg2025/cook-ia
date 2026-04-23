import React from 'react';
import { Copy, RefreshCw, Search, Bookmark, MoreHorizontal } from 'lucide-react';

interface MessageActionOverlayProps {
  isDark: boolean;
  onCopy: () => void;
  onRewrite: (type: 'pro' | 'creative') => void;
  onAnalyze: () => void;
  onPin: () => void;
}

export const MessageActionOverlay: React.FC<MessageActionOverlayProps> = ({
  isDark,
  onCopy,
  onRewrite,
  onAnalyze,
  onPin,
}) => {
  const buttonClass = `p-1.5 rounded-lg transition-all ${
    isDark
      ? 'text-white/40 hover:text-white hover:bg-white/10'
      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
  }`;

  return (
    <div className={`absolute -right-2 -top-3 flex items-center gap-1 p-1 rounded-xl shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity ${
      isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-200'
    }`}>
      <button onClick={onCopy} className={buttonClass} title="Copier le code"><Copy size={14} /></button>
      <button onClick={() => onRewrite('pro')} className={buttonClass} title="Réécriture Pro"><RefreshCw size={14} /></button>
      <button onClick={onAnalyze} className={buttonClass} title="Analyser (SEO)"><Search size={14} /></button>
      <button onClick={onPin} className={buttonClass} title="Épingler"><Bookmark size={14} /></button>
    </div>
  );
};
