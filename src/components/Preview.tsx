import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RotateCcw, ExternalLink } from 'lucide-react';
import { ViewMode } from '../types';

interface PreviewProps {
  viewMode: ViewMode;
  generatedCode: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onRefresh: () => void;
  onExpand: () => void;
}

export const Preview: React.FC<PreviewProps> = ({
  viewMode,
  generatedCode,
  iframeRef,
  onRefresh,
  onExpand
}) => {
  return (
    <section className="flex-1 bg-[#141414] rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
      {/* Browser-like Header */}
      <div className="h-12 bg-[#1A1A1A] border-b border-white/5 flex items-center px-4 justify-between">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        
        <div className="bg-[#0A0A0A] px-4 py-1 rounded-lg border border-white/5 flex items-center gap-2 min-w-[300px]">
          <span className="text-[10px] font-mono text-white/30">localhost:3000/preview</span>
        </div>

        <div className="flex items-center gap-3 text-white/40">
          <button 
            onClick={onRefresh}
            className="hover:text-white transition-colors p-1"
            title="Refresh Preview"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={onExpand}
            className="hover:text-white transition-colors p-1"
            title="Open in New Tab"
          >
            <ExternalLink size={14} />
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
