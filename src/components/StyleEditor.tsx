import React from 'react';
import { motion } from 'motion/react';
import { X, Palette, Type, Square, Check } from 'lucide-react';
import { StyleConfig } from '../types';

interface StyleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  config: StyleConfig;
  onChange: (config: StyleConfig) => void;
}

const PRESET_COLORS = [
  '#FF6B00', // Orange primary
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F43F5E', // Rose
  '#000000', // Black
  '#FFFFFF', // White
];

const PRESET_FONTS = [
  'Inter',
  'Space Grotesk',
  'Playfair Display',
  'JetBrains Mono',
  'Outfit',
  'Montserrat',
];

const PRESET_RADIUS = [
  { label: 'None', value: '0px' },
  { label: 'Small', value: '0.375rem' },
  { label: 'Medium', value: '0.75rem' },
  { label: 'Large', value: '1.5rem' },
  { label: 'Full', value: '9999px' },
];

export const StyleEditor: React.FC<StyleEditorProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed right-4 top-24 bottom-24 w-80 bg-[#141414] border border-white/10 rounded-[2.5rem] shadow-2xl z-[80] flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette size={18} className="text-orange-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest">Style Editor</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {/* Colors */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/40">
            <Palette size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Accent Color</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onChange({ ...config, primaryColor: color })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  config.primaryColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              >
                {config.primaryColor === color && (
                  <Check size={14} className={color === '#FFFFFF' ? 'text-black mx-auto' : 'text-white mx-auto'} />
                )}
              </button>
            ))}
            <input 
              type="color"
              value={config.primaryColor}
              onChange={(e) => onChange({ ...config, primaryColor: e.target.value })}
              className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer overflow-hidden"
            />
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/40">
            <Type size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Typography</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {PRESET_FONTS.map((font) => (
              <button
                key={font}
                onClick={() => onChange({ ...config, fontFamily: font })}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all border ${
                  config.fontFamily === font 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                }`}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/40">
            <Square size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Corner Radius</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_RADIUS.map((radius) => (
              <button
                key={radius.value}
                onClick={() => onChange({ ...config, borderRadius: radius.value })}
                className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  config.borderRadius === radius.value 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                }`}
              >
                {radius.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
        <p className="text-[9px] text-white/20 leading-relaxed uppercase tracking-widest font-medium">
          Styles are applied instantly to the preview. Export to save permanently.
        </p>
      </div>
    </motion.div>
  );
};
