import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RotateCcw, ExternalLink, Pencil } from 'lucide-react';
import { ViewMode } from '../types';

interface PreviewProps {
  viewMode: ViewMode;
  generatedCode: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onRefresh: () => void;
  onExpand: () => void;
  onEdit?: () => void;
  onCodeChange?: (newCode: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({
  viewMode,
  generatedCode,
  iframeRef,
  onRefresh,
  onExpand,
  onEdit,
  onCodeChange
}) => {
  const [isVisualEditing, setIsVisualEditing] = React.useState(false);

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || viewMode !== 'preview' || !generatedCode) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      if (isVisualEditing) {
        // Make all text-containing elements editable
        const walk = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null);
        let node;
        while (node = walk.nextNode() as HTMLElement) {
          if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
            node.contentEditable = "true";
            node.style.outline = "1px dashed rgba(255, 165, 0, 0.3)";
            node.style.cursor = "text";
          }
        }

        // Listen for changes
        const observer = new MutationObserver(() => {
          let newHtml = doc.documentElement.outerHTML;
          // Ensure doctype is preserved if it was there
          if (generatedCode.toLowerCase().startsWith('<!doctype')) {
            newHtml = '<!DOCTYPE html>\n' + newHtml;
          }
          if (onCodeChange) onCodeChange(newHtml);
        });

        observer.observe(doc.body, {
          childList: true,
          characterData: true,
          subtree: true
        });

        return () => observer.disconnect();
      } else {
        // Remove editability
        const elements = doc.querySelectorAll('[contenteditable="true"]');
        elements.forEach((el: any) => {
          el.contentEditable = "false";
          el.style.outline = "";
          el.style.cursor = "";
        });
      }
    };

    iframe.addEventListener('load', handleLoad);
    // Also trigger immediately if already loaded
    handleLoad();

    return () => iframe.removeEventListener('load', handleLoad);
  }, [isVisualEditing, generatedCode, viewMode]);

  return (
    <section className="flex-1 bg-[#141414] rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
      {/* Browser-like Header */}
      <div className="h-12 bg-[#1A1A1A] border-b border-white/5 flex items-center px-6 justify-between">
        <div className="flex gap-2 w-20">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
        </div>
        
        <div className="flex-1 max-w-2xl bg-[#0A0A0A] px-4 py-1.5 rounded-xl border border-white/5 flex items-center justify-center gap-2 mx-4">
          <span className="text-[11px] font-mono text-white/20 select-none">localhost:3000/preview</span>
          {isVisualEditing && (
            <span className="text-[9px] bg-orange-primary/20 text-orange-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest animate-pulse">
              Visual Edit Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-white/30 w-20 justify-end">
          <button 
            onClick={() => setIsVisualEditing(!isVisualEditing)}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${isVisualEditing ? 'text-orange-primary' : 'hover:text-white'}`}
            title={isVisualEditing ? "Disable Visual Edit" : "Enable Visual Edit"}
          >
            <Pencil size={15} />
          </button>
          <button 
            onClick={onRefresh}
            className="hover:text-white transition-all p-1 hover:scale-110 active:scale-95"
            title="Refresh Preview"
          >
            <RotateCcw size={15} />
          </button>
          <button 
            onClick={onExpand}
            className="hover:text-white transition-all p-1 hover:scale-110 active:scale-95"
            title="Open in New Tab"
          >
            <ExternalLink size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-white overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'preview' ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              {generatedCode ? (
                <iframe 
                  ref={iframeRef}
                  title="Preview"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A0A0A] text-white/20">
                  <Zap size={64} className="mb-4 opacity-10" />
                  <p className="text-sm font-medium uppercase tracking-widest">Waiting for your prompt</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full bg-[#0D0D0D] overflow-auto p-6"
            >
              <pre className="font-mono text-sm leading-relaxed">
                <code className="language-markup">
                  {generatedCode || "<!-- No code generated yet -->"}
                </code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
