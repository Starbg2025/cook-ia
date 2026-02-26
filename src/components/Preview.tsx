import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RotateCcw, ExternalLink, Pencil, FileCode, Folder, Download, ChevronRight, ChevronDown, MousePointer2 } from 'lucide-react';
import { ViewMode, ProjectFile, StyleConfig, SectionEditState } from '../types';

interface PreviewProps {
  viewMode: ViewMode;
  generatedCode: string;
  files: ProjectFile[];
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onRefresh: () => void;
  onExpand: () => void;
  onEdit?: () => void;
  onCodeChange?: (newCode: string) => void;
  onDownloadZip?: () => void;
  styleConfig?: StyleConfig;
  sectionEdit?: SectionEditState;
  onSectionSelect?: (section: SectionEditState) => void;
}

import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

export const Preview: React.FC<PreviewProps> = ({
  viewMode,
  generatedCode,
  files,
  iframeRef,
  onRefresh,
  onExpand,
  onEdit,
  onCodeChange,
  onDownloadZip,
  styleConfig,
  sectionEdit,
  onSectionSelect
}) => {
  const [isVisualEditing, setIsVisualEditing] = React.useState(false);
  const [isSectionSelectionMode, setIsSectionSelectionMode] = React.useState(false);
  const [selectedFilePath, setSelectedFilePath] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (files.length > 0 && !selectedFilePath) {
      setSelectedFilePath(files[0].path);
    }
  }, [files]);

  const selectedFile = files.find(f => f.path === selectedFilePath);

  React.useEffect(() => {
    if (viewMode === 'code') {
      Prism.highlightAll();
    }
  }, [viewMode, selectedFilePath, selectedFile]);

  // Apply Style Overrides
  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !styleConfig || viewMode !== 'preview') return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    let styleTag = doc.getElementById('cook-ia-overrides');
    if (!styleTag) {
      styleTag = doc.createElement('style');
      styleTag.id = 'cook-ia-overrides';
      doc.head.appendChild(styleTag);
    }

    styleTag.textContent = `
      :root {
        --primary: ${styleConfig.primaryColor} !important;
        --primary-color: ${styleConfig.primaryColor} !important;
      }
      body {
        font-family: "${styleConfig.fontFamily}", sans-serif !important;
      }
      button, .btn, .rounded, [class*="rounded-"] {
        border-radius: ${styleConfig.borderRadius} !important;
      }
      /* Override common tailwind primary colors if they are hardcoded */
      .bg-orange-primary, .bg-primary { background-color: ${styleConfig.primaryColor} !important; }
      .text-orange-primary, .text-primary { color: ${styleConfig.primaryColor} !important; }
      .border-orange-primary, .border-primary { border-color: ${styleConfig.primaryColor} !important; }
    `;

    // Inject Google Fonts if needed
    if (!doc.getElementById(`font-${styleConfig.fontFamily}`)) {
      const link = doc.createElement('link');
      link.id = `font-${styleConfig.fontFamily}`;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${styleConfig.fontFamily.replace(/ /g, '+')}:wght@400;700;900&display=swap`;
      doc.head.appendChild(link);
    }
  }, [styleConfig, viewMode, generatedCode]);

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || viewMode !== 'preview' || !generatedCode) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      // Section Selection Logic
      if (isSectionSelectionMode) {
        const sections = doc.querySelectorAll('section, header, footer, nav, main');
        sections.forEach((sec: any) => {
          sec.style.cursor = 'pointer';
          sec.style.transition = 'all 0.2s';
          
          const handleMouseOver = (e: MouseEvent) => {
            e.stopPropagation();
            sec.style.outline = '2px solid var(--primary, #FF6B00)';
            sec.style.backgroundColor = 'rgba(255, 107, 0, 0.05)';
          };
          
          const handleMouseOut = (e: MouseEvent) => {
            e.stopPropagation();
            sec.style.outline = '';
            sec.style.backgroundColor = '';
          };
          
          const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (onSectionSelect) {
              onSectionSelect({
                isActive: true,
                sectionId: sec.id || `section-${Math.random().toString(36).substr(2, 9)}`,
                sectionHtml: sec.outerHTML,
                selector: sec.tagName.toLowerCase() + (sec.id ? `#${sec.id}` : '') + (sec.className ? `.${sec.className.split(' ').join('.')}` : '')
              });
            }
            setIsSectionSelectionMode(false);
          };

          sec.addEventListener('mouseover', handleMouseOver);
          sec.addEventListener('mouseout', handleMouseOut);
          sec.addEventListener('click', handleClick);
        });
      }

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
  }, [isVisualEditing, isSectionSelectionMode, generatedCode, viewMode]);

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
          {isSectionSelectionMode && (
            <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest animate-pulse">
              Select a Section
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-white/30 w-auto justify-end">
          {files.length > 0 && (
            <button 
              onClick={onDownloadZip}
              className="hover:text-white transition-all p-1 hover:scale-110 active:scale-95 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
              title="Download Project ZIP"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export ZIP</span>
            </button>
          )}
          <button 
            onClick={() => setIsSectionSelectionMode(!isSectionSelectionMode)}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${isSectionSelectionMode ? 'text-blue-400' : 'hover:text-white'}`}
            title="Targeted Section Edit"
          >
            <MousePointer2 size={15} />
          </button>
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
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A0A0A] relative overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-primary/5 rounded-full blur-[100px] animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-700" />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div className="relative mb-8">
                      <Zap size={80} className="text-orange-primary opacity-20 animate-pulse" />
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-orange-primary rounded-full blur-2xl"
                      />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white/40 mb-2">COOK IA</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/10">Ready to architect your vision</p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="code"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full bg-[#0D0D0D] flex overflow-hidden"
            >
              {/* File Tree Sidebar */}
              <div className="w-64 border-r border-white/5 bg-[#0A0A0A] flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                  <Folder size={14} />
                  Project Files
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                  {files.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFilePath(file.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                        selectedFilePath === file.path 
                          ? 'bg-white/10 text-white' 
                          : 'text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <FileCode size={14} className={selectedFilePath === file.path ? 'text-orange-primary' : ''} />
                      <span className="truncate">{file.path}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Editor/Viewer */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="h-10 bg-[#141414] border-b border-white/5 flex items-center px-4 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/40">{selectedFilePath}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                  <pre className="font-mono text-sm leading-relaxed">
                    <code className={`language-${selectedFilePath?.split('.').pop() || 'markup'}`}>
                      {selectedFile?.content || "<!-- Select a file to view code -->"}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
