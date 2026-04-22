import React from 'react';
import { motion } from 'motion/react';
import { X, Palette, Type, Square, Check, MousePointer2, Zap } from 'lucide-react';
import { StyleConfig, SectionEditState } from '../types';

interface StyleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  config: StyleConfig;
  onChange: (config: StyleConfig) => void;
  elementEdit?: SectionEditState;
  onElementChange?: (newHtml: string) => void;
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
  elementEdit,
  onElementChange,
}) => {
  const [activeTab, setActiveTab] = React.useState<'global' | 'element'>(elementEdit ? 'element' : 'global');

  React.useEffect(() => {
    if (elementEdit) setActiveTab('element');
  }, [elementEdit]);

  if (!isOpen) return null;

  const handleClassToggle = (cls: string) => {
    if (!elementEdit || !onElementChange) return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(elementEdit.sectionHtml || '', 'text/html');
    const el = doc.body.firstElementChild as HTMLElement;
    if (el) {
      el.classList.toggle(cls);
      onElementChange(el.outerHTML);
    }
  };

  const handleContentChange = (content: string) => {
    if (!elementEdit || !onElementChange) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(elementEdit.sectionHtml || '', 'text/html');
    const el = doc.body.firstElementChild as HTMLElement;
    if (el) {
      el.innerText = content;
      onElementChange(el.outerHTML);
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed right-4 top-24 bottom-24 w-80 bg-[#141414] border border-white/10 rounded-[2.5rem] shadow-2xl z-[80] flex flex-col overflow-hidden"
    >
      <div className="p-6 border-b border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette size={18} className="text-orange-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest">Design Mode</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex bg-white/5 rounded-xl p-1 gap-1">
          <button 
            onClick={() => setActiveTab('global')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === 'global' ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white/40'
            }`}
          >
            Global
          </button>
          <button 
            onClick={() => setActiveTab('element')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              activeTab === 'element' ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white/40'
            }`}
          >
            Inspecteur
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {activeTab === 'global' ? (
          <>
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
          </>
        ) : (
          <div className="space-y-8">
            {!elementEdit ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MousePointer2 size={32} className="text-white/10 mb-4" />
                <p className="text-xs text-white/40 uppercase tracking-widest font-black leading-relaxed">
                  Cliquez sur un élément<br/>pour l'inspecter
                </p>
              </div>
            ) : (
              <>
                {/* Element Info */}
                <div className="space-y-4 p-4 rounded-3xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-primary">{elementEdit.elementContext?.tagName}</span>
                    <span className="text-[10px] text-white/20 font-mono italic">#{elementEdit.selector?.split('#')[1]?.substr(0,8) || 'element'}</span>
                  </div>
                  
                  <textarea 
                    value={elementEdit.elementContext?.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-orange-primary/50 min-h-[80px]"
                    placeholder="Éditer le texte..."
                  />
                </div>

                {/* Quick Classes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/40">
                    <Zap size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Styles Rapides</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Bold', cls: 'font-bold' },
                      { label: 'Italic', cls: 'italic' },
                      { label: 'Center', cls: 'text-center' },
                      { label: 'Hidden', cls: 'hidden' },
                      { label: 'Shadow', cls: 'shadow-2xl' },
                      { label: 'Border', cls: 'border' },
                    ].map((item) => (
                      <button
                        key={item.cls}
                        onClick={() => handleClassToggle(item.cls)}
                        className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          elementEdit.elementContext?.classes.includes(item.cls)
                            ? 'bg-orange-primary/20 border-orange-primary/40 text-white'
                            : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color context */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-white/40">
                    <Palette size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Propriétés</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1 items-center">
                      <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: elementEdit.elementContext?.computedStyles.color }} />
                      <span className="text-[8px] text-white/40 font-mono">Texte</span>
                    </div>
                    <div className="flex flex-col gap-1 items-center">
                      <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: elementEdit.elementContext?.computedStyles.backgroundColor }} />
                      <span className="text-[8px] text-white/40 font-mono">Fond</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
        <p className="text-[9px] text-white/20 leading-relaxed uppercase tracking-widest font-medium">
          Styles are applied instantly to the preview. Export to save permanently.
        </p>
      </div>
    </motion.div>
  );
};
