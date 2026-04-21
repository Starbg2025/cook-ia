import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RotateCcw, ExternalLink, Pencil, FileCode, Folder, Download, ChevronRight, ChevronDown, MousePointer2, FileSearch, History, X } from 'lucide-react';
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
  isDark?: boolean;
}

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  onSectionSelect,
  isDark = true
}) => {
  const [isVisualEditing, setIsVisualEditing] = React.useState(false);
  const [isSectionSelectionMode, setIsSectionSelectionMode] = React.useState(false);
  const [selectedFilePath, setSelectedFilePath] = React.useState<string | null>(null);
  const [showActionHistory, setShowActionHistory] = React.useState(false);

  React.useEffect(() => {
    if (files.length > 0 && !selectedFilePath) {
      setSelectedFilePath(files[0].path);
    }
  }, [files]);

  const selectedFile = files.find(f => f.path === selectedFilePath);

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
    <section className={`flex-1 ${isDark ? 'bg-[#141414] border-white/5' : 'bg-white border-slate-200'} md:rounded-3xl md:border overflow-hidden flex flex-col md:shadow-2xl`}>
      {/* Browser-like Header */}
      <div className={`h-12 ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-slate-50 border-slate-200'} border-b flex items-center px-6 justify-between`}>
        <div className="flex gap-2 w-20">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" />
          <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
        </div>
        
        <div className={`flex-1 max-w-2xl ${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200'} px-4 py-1.5 rounded-xl border flex items-center justify-center gap-2 mx-4`}>
          <span className={`text-[11px] font-mono ${isDark ? 'text-white/20' : 'text-slate-400'} select-none`}>localhost:3000/preview</span>
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

        <div className={`flex items-center gap-4 ${isDark ? 'text-white/30' : 'text-slate-400'} w-auto justify-end`}>
          <button 
            onClick={() => setShowActionHistory(!showActionHistory)}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${showActionHistory ? 'text-blue-500' : isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}
            title="View Action History"
          >
            <History size={15} />
          </button>
          <button 
            className={`hover:text-blue-500 transition-all p-1 hover:scale-110 active:scale-95 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest`}
            title="Read File"
          >
            <FileSearch size={14} />
            <span className="hidden sm:inline">Read File</span>
          </button>
          {files.length > 0 && (
            <button 
              onClick={onDownloadZip}
              className={`hover:text-orange-primary transition-all p-1 hover:scale-110 active:scale-95 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest`}
              title="Download Project ZIP"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export ZIP</span>
            </button>
          )}
          <button 
            onClick={() => setIsSectionSelectionMode(!isSectionSelectionMode)}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${isSectionSelectionMode ? 'text-blue-400' : isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}
            title="Targeted Section Edit"
          >
            <MousePointer2 size={15} />
          </button>
          <button 
            onClick={() => setIsVisualEditing(!isVisualEditing)}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${isVisualEditing ? 'text-orange-primary' : isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}
            title={isVisualEditing ? "Disable Visual Edit" : "Enable Visual Edit"}
          >
            <Pencil size={15} />
          </button>
          <button 
            onClick={onRefresh}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all ${isDark ? 'text-white/60 hover:text-white font-bold' : 'text-slate-600 hover:text-slate-900 font-bold'} text-[10px] uppercase tracking-wider`}
            title="Reset to Original"
          >
            <RotateCcw size={14} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
            RESET
          </button>
          <button 
            onClick={onExpand}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${isDark ? 'hover:text-white' : 'hover:text-slate-900'}`}
            title="Open in New Tab"
          >
            <ExternalLink size={15} />
          </button>
        </div>
      </div>

      <div className={`flex-1 relative ${isDark ? 'bg-white' : 'bg-slate-50'} overflow-hidden`}>
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
                <div className={`w-full h-full flex flex-col items-center justify-center ${isDark ? 'bg-[#0A0A0A]' : 'bg-slate-50'} relative overflow-hidden`}>
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
                    <h3 className={`text-xl font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/40' : 'text-slate-300'} mb-2`}>COOK IA</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.5em] ${isDark ? 'text-white/10' : 'text-slate-200'}`}>Ready to architect your vision</p>
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
              className={`w-full h-full ${isDark ? 'bg-[#0D0D0D]' : 'bg-white'} flex overflow-hidden`}
            >
              {/* File Tree Sidebar */}
              <div className={`w-64 border-r ${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-slate-50 border-slate-200'} flex flex-col`}>
                <div className={`p-4 border-b ${isDark ? 'border-white/5 text-white/40' : 'border-slate-200 text-slate-400'} text-[10px] font-bold uppercase tracking-widest flex items-center gap-2`}>
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
                          ? 'bg-orange-primary/10 text-orange-primary font-bold' 
                          : isDark ? 'text-white/40 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <FileCode size={14} className={selectedFilePath === file.path ? 'text-orange-primary' : ''} />
                      <span className="truncate">{file.path}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Editor/Viewer */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <AnimatePresence>
                  {showActionHistory && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`absolute right-4 top-14 bottom-4 w-80 ${isDark ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-slate-200'} border rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden`}
                    >
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Action History</span>
                        <button onClick={() => setShowActionHistory(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                          <History size={32} className="mb-4 opacity-20" />
                          <p className="text-xs">No history recorded yet.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`h-10 ${isDark ? 'bg-[#141414] border-white/5' : 'bg-slate-50 border-slate-200'} border-b flex items-center px-4 justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{selectedFilePath}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto scrollbar-hide">
                  <SyntaxHighlighter
                    language={selectedFilePath?.split('.').pop() || 'javascript'}
                    style={isDark ? tomorrow : oneLight}
                    customStyle={{
                      margin: 0,
                      padding: '24px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      background: 'transparent',
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: 'JetBrains Mono, monospace',
                      }
                    }}
                  >
                    {selectedFile?.content || "<!-- Select a file to view code -->"}
                  </SyntaxHighlighter>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
