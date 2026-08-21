import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, RotateCcw, ExternalLink, Pencil, FileCode, Folder, Download, ChevronRight, ChevronDown, MousePointer2, FileSearch, History, X, Sparkles, Smartphone, Tablet, Monitor, Loader2, Eye, Minimize2, Maximize2 } from 'lucide-react';
import { ViewMode, ProjectFile, StyleConfig, SectionEditState, ActionHistory } from '../types';
import { ForgeStudio } from './ForgeStudio';
import { cleanAndUnescapeCode, bundleProjectFiles } from '../services/geminiService';

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
  onApplyPrompt?: (promptText: string) => void;
  isLoading?: boolean;
  loadingStatus?: string;
  currentAgentStage?: string;
  actions?: ActionHistory[];
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
  isDark = true,
  onApplyPrompt,
  isLoading,
  loadingStatus,
  currentAgentStage,
  actions
}) => {
  const [isVisualEditing, setIsVisualEditing] = React.useState(false);
  const [isSectionSelectionMode, setIsSectionSelectionMode] = React.useState(false);
  const [isElementSelectionMode, setIsElementSelectionMode] = React.useState(false);
  const [selectedFilePath, setSelectedFilePath] = React.useState<string | null>(null);
  const [showActionHistory, setShowActionHistory] = React.useState(false);
  const [showForgeStudio, setShowForgeStudio] = React.useState(false);
  const [deviceViewport, setDeviceViewport] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isOverlayMinimized, setIsOverlayMinimized] = React.useState(false);

  const [isEditingCode, setIsEditingCode] = React.useState(false);
  const [editableCode, setEditableCode] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);

  const effectiveFiles = React.useMemo(() => {
    let result: ProjectFile[] = [];

    if (files && files.length > 0) {
      result = files
        .filter(f => f && (f.path || f.content || (f as any).code || (f as any).html))
        .map(f => ({
          path: f.path || 'index.html',
          content: cleanAndUnescapeCode(f.content || (f as any).code || (f as any).html || '')
        }));
    }

    // Ensure index.html exists with content
    const htmlFileIndex = result.findIndex(f => f.path === 'index.html' || f.path.endsWith('.html'));
    if (htmlFileIndex !== -1) {
      if (!result[htmlFileIndex].content.trim() && generatedCode) {
        result[htmlFileIndex].content = cleanAndUnescapeCode(generatedCode);
      }
    } else if (generatedCode) {
      const cleanGen = cleanAndUnescapeCode(generatedCode);
      result.unshift({ path: 'index.html', content: cleanGen });
    }

    // If still empty but generatedCode exists
    if (result.length === 0 && generatedCode) {
      const cleanGen = cleanAndUnescapeCode(generatedCode);
      result = [
        { path: 'index.html', content: cleanGen },
        { path: 'styles.css', content: '/* Styles CSS personnalisés */\n' },
        { path: 'script.js', content: '// Script JavaScript interactif\n' }
      ];
    }

    return result;
  }, [files, generatedCode]);

  const bundledSrcDoc = React.useMemo(() => {
    return bundleProjectFiles(effectiveFiles, generatedCode);
  }, [effectiveFiles, generatedCode]);

  React.useEffect(() => {
    if (effectiveFiles.length > 0 && (!selectedFilePath || !effectiveFiles.some(f => f.path === selectedFilePath))) {
      setSelectedFilePath(effectiveFiles[0].path);
    }
  }, [effectiveFiles, selectedFilePath]);

  const selectedFile = effectiveFiles.find(f => f.path === selectedFilePath) || effectiveFiles[0];

  React.useEffect(() => {
    const currentContent = selectedFile?.content || generatedCode || '';
    setEditableCode(currentContent);
  }, [selectedFile, generatedCode]);

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
      .bg-[var(--color-primary)], .bg-primary { background-color: ${styleConfig.primaryColor} !important; }
      .text-[var(--color-primary)], .text-primary { color: ${styleConfig.primaryColor} !important; }
      .border-[var(--color-primary)], .border-primary { border-color: ${styleConfig.primaryColor} !important; }
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

      // Element Selection Mode (Visual Inspector)
      if (isElementSelectionMode) {
        const allElements = doc.querySelectorAll('body *:not(script):not(style)');
        allElements.forEach((el: any) => {
          el.style.cursor = 'crosshair';
          el.style.transition = 'outline 0.1s';

          const handleMouseOver = (e: MouseEvent) => {
            e.stopPropagation();
            el.style.outline = '1px solid #3B82F6';
            el.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
          };

          const handleMouseOut = (e: MouseEvent) => {
            e.stopPropagation();
            el.style.outline = '';
            el.style.backgroundColor = '';
          };

          const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Generate basic selector
            let selector = el.tagName.toLowerCase();
            if (el.id) selector += `#${el.id}`;
            if (el.className) {
              const classes = el.className.split(' ').filter((c: string) => c.trim() && !c.includes(':')).join('.');
              if (classes) selector += `.${classes}`;
            }

            if (onSectionSelect) {
              onSectionSelect({
                isActive: true,
                selector: selector,
                sectionHtml: el.outerHTML,
                elementContext: {
                  tagName: el.tagName.toLowerCase(),
                  classes: Array.from(el.classList),
                  content: el.innerText || el.value || '',
                  computedStyles: {
                    color: window.getComputedStyle(el).color,
                    backgroundColor: window.getComputedStyle(el).backgroundColor,
                    fontSize: window.getComputedStyle(el).fontSize,
                    fontWeight: window.getComputedStyle(el).fontWeight,
                    borderRadius: window.getComputedStyle(el).borderRadius
                  }
                }
              });
            }
            setIsElementSelectionMode(false);
          };

          el.addEventListener('mouseover', handleMouseOver);
          el.addEventListener('mouseout', handleMouseOut);
          el.addEventListener('click', handleClick);
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
        
        <div className={`flex-1 max-w-2xl ${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-300 shadow-xs'} px-4 py-1.5 rounded-xl border flex items-center justify-between gap-2 mx-4`}>
          <span className={`text-[11px] font-mono ${isDark ? 'text-white/40' : 'text-slate-600 font-medium'} select-none hidden sm:inline`}>localhost:3000/preview</span>
          
          {/* Responsive Device Viewport Switcher */}
          <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${isDark ? 'bg-[#141414] border-white/10' : 'bg-slate-100 border-slate-300'}`}>
            <button
              onClick={() => setDeviceViewport('desktop')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                deviceViewport === 'desktop'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : isDark ? 'text-white/40 hover:text-white' : 'text-slate-700 hover:text-slate-950 font-bold'
              }`}
              title="Aperçu PC / Bureau"
            >
              <Monitor size={13} />
              <span className="hidden md:inline">PC</span>
            </button>
            <button
              onClick={() => setDeviceViewport('tablet')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                deviceViewport === 'tablet'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : isDark ? 'text-white/40 hover:text-white' : 'text-slate-700 hover:text-slate-950 font-bold'
              }`}
              title="Aperçu Tablette (768px)"
            >
              <Tablet size={13} />
              <span className="hidden md:inline">Tablette</span>
            </button>
            <button
              onClick={() => setDeviceViewport('mobile')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                deviceViewport === 'mobile'
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : isDark ? 'text-white/40 hover:text-white' : 'text-slate-700 hover:text-slate-950 font-bold'
              }`}
              title="Aperçu Mobile (375px)"
            >
              <Smartphone size={13} />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {isVisualEditing && (
            <span className="text-[9px] bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest animate-pulse">
              Visual Edit Mode
            </span>
          )}
          {isSectionSelectionMode && (
            <span className="text-[9px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest animate-pulse">
              Select Section
            </span>
          )}
        </div>

        <div className={`flex items-center gap-4 ${isDark ? 'text-white/60' : 'text-slate-700'} w-auto justify-end`}>
          <button 
            onClick={() => setShowActionHistory(!showActionHistory)}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${showActionHistory ? 'text-blue-500' : isDark ? 'hover:text-white' : 'hover:text-slate-950 text-slate-700'}`}
            title="View Action History"
          >
            <History size={15} />
          </button>
          <button 
            className={`${isDark ? 'text-white/60 hover:text-blue-400' : 'text-slate-700 hover:text-blue-600'} transition-all p-1 hover:scale-110 active:scale-95 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest`}
            title="Read File"
          >
            <FileSearch size={14} />
            <span className="hidden sm:inline">Read File</span>
          </button>
          {files.length > 0 && (
            <button 
              onClick={onDownloadZip}
              className={`${isDark ? 'text-white/60 hover:text-orange-400' : 'text-slate-700 hover:text-orange-600'} transition-all p-1 hover:scale-110 active:scale-95 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest`}
              title="Download Project ZIP"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export ZIP</span>
            </button>
          )}
          <button 
            onClick={() => setIsElementSelectionMode(!isElementSelectionMode)}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${isElementSelectionMode ? 'text-blue-500' : isDark ? 'hover:text-white' : 'hover:text-slate-950 text-slate-700'}`}
            title="Visual Inspector (Element Edit)"
          >
            <MousePointer2 size={15} />
          </button>
          <button 
            onClick={() => setIsSectionSelectionMode(!isSectionSelectionMode)}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${isSectionSelectionMode ? 'text-blue-500' : isDark ? 'hover:text-white' : 'hover:text-slate-950 text-slate-700'}`}
            title="Targeted Section Edit"
          >
            <MousePointer2 size={15} />
          </button>
          <button 
            onClick={() => setIsVisualEditing(!isVisualEditing)}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${isVisualEditing ? 'text-orange-500' : isDark ? 'hover:text-white' : 'hover:text-slate-950 text-slate-700'}`}
            title={isVisualEditing ? "Disable Visual Edit" : "Enable Visual Edit"}
          >
            <Pencil size={15} />
          </button>
          <button 
            onClick={() => setShowForgeStudio(!showForgeStudio)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              showForgeStudio 
                ? 'bg-orange-500/25 border-orange-500/40 text-orange-600 font-black shadow-[0_0_15px_rgba(255,107,0,0.25)]' 
                : 'border-orange-200 bg-gradient-to-r from-orange-500/10 to-amber-500/10 hover:from-orange-500/20 hover:to-amber-500/20 text-orange-600 font-black'
            } text-[10px] uppercase tracking-wider`}
            title="Open Forge Developer Studio"
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">FORGE STUDIO ✨</span>
          </button>
          <button 
            onClick={onRefresh}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold shadow-xs'} text-[10px] uppercase tracking-wider`}
            title="Reset to Original"
          >
            <RotateCcw size={14} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
            RESET
          </button>
          <button 
            onClick={onExpand}
            className={`transition-all p-1 hover:scale-110 active:scale-95 ${isDark ? 'hover:text-white' : 'hover:text-slate-950 text-slate-700'}`}
            title="Open in New Tab"
          >
            <ExternalLink size={15} />
          </button>
        </div>
      </div>

      <div className={`flex-1 flex overflow-hidden relative ${isDark ? 'bg-white' : 'bg-slate-50'}`}>
        <div className="flex-1 h-full min-w-0 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
          {viewMode === 'preview' ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`w-full h-full flex justify-center items-center transition-all duration-300 relative ${
                deviceViewport === 'desktop' ? '' : isDark ? 'bg-black/60 p-4' : 'bg-slate-200/80 p-4'
              }`}
            >
              {isLoading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4 pointer-events-none">
                  {isOverlayMinimized ? (
                    <div className="pointer-events-auto bg-[#141414]/90 backdrop-blur-md border border-[var(--color-primary)]/30 rounded-full px-4 py-2 flex items-center justify-between gap-3 shadow-2xl text-white">
                      <div className="flex items-center gap-2 min-w-0">
                        <Loader2 size={14} className="animate-spin text-[var(--color-primary)] shrink-0" />
                        <span className="text-xs font-bold text-[var(--color-primary)] uppercase text-[10px] tracking-wider shrink-0">{currentAgentStage || 'Architect'}</span>
                        <span className="text-xs text-white/80 truncate">{loadingStatus || 'Cook IA construit...'}</span>
                      </div>
                      <button 
                        onClick={() => setIsOverlayMinimized(false)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold text-white transition-all flex items-center gap-1 shrink-0"
                        title="Agrandir les détails de construction"
                      >
                        <Maximize2 size={12} />
                        Détails
                      </button>
                    </div>
                  ) : (
                    <div className="pointer-events-auto bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden text-white">
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--color-primary)]/20 blur-[50px] rounded-full pointer-events-none" />
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 flex items-center justify-center shrink-0">
                            <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-xs tracking-tight text-white flex items-center gap-2">
                              Génération en direct
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </h4>
                            <p className="text-[10px] text-white/50">Cook IA assemble le code HTML/CSS...</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsOverlayMinimized(true)}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold text-white/80 hover:text-white transition-all flex items-center gap-1"
                          title="Réduire pour voir l'aperçu en grand"
                        >
                          <Minimize2 size={12} />
                          Voir en direct
                        </button>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="p-2.5 rounded-xl border bg-white/5 border-white/10 text-xs flex items-center justify-between">
                          <span className="font-mono text-[var(--color-primary)] uppercase text-[10px] font-bold tracking-wider">{currentAgentStage || 'Architect'}</span>
                          <span className="text-white/80 text-xs truncate max-w-[280px]">{loadingStatus || 'Création du site...'}</span>
                        </div>
                      </div>

                      {actions && actions.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
                          {actions.map((act, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] py-1 px-2.5 rounded-lg bg-white/5 font-mono text-white/60">
                              <span className="truncate">{act.content}</span>
                              <span className="ml-2 text-green-400">{act.status === 'completed' ? '✓' : '...'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {(generatedCode || (effectiveFiles && effectiveFiles.length > 0)) ? (
                <div className={`transition-all duration-300 relative flex flex-col ${
                  deviceViewport === 'desktop'
                    ? 'w-full h-full'
                    : deviceViewport === 'tablet'
                      ? 'w-[768px] max-w-full h-full rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden bg-white'
                      : 'w-[375px] max-w-full h-full rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden bg-white'
                }`}>
                  {deviceViewport !== 'desktop' && (
                    <div className="w-full bg-slate-900 text-white h-5 shrink-0 flex items-center justify-center px-4 relative z-10">
                      <div className="w-12 h-2.5 bg-black rounded-full" />
                    </div>
                  )}
                  <iframe 
                    ref={iframeRef}
                    title="Preview"
                    srcDoc={bundledSrcDoc}
                    sandbox="allow-scripts allow-modals allow-same-origin allow-popups allow-forms"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; camera; microphone; geolocation"
                    className="w-full h-full flex-1 border-none bg-white"
                  />
                </div>
              ) : (
                <div className={`w-full h-full flex flex-col items-center justify-center ${isDark ? 'bg-[#0A0A0A]' : 'bg-slate-50'} relative overflow-hidden`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div className="relative mb-8">
                      <Zap size={80} className="text-[var(--color-primary)] opacity-20 animate-pulse" />
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-[var(--color-primary)] rounded-full blur-2xl"
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
                <div className={`p-4 border-b ${isDark ? 'border-white/5 text-white/40' : 'border-slate-200 text-slate-700'} text-[10px] font-bold uppercase tracking-widest flex items-center gap-2`}>
                  <Folder size={14} />
                  Project Files
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                  {effectiveFiles.map((file) => (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFilePath(file.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                        selectedFilePath === file.path 
                          ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold' 
                          : isDark ? 'text-white/50 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium'
                      }`}
                    >
                      <FileCode size={14} className={selectedFilePath === file.path ? 'text-[var(--color-primary)]' : ''} />
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
                      className={`absolute right-4 top-14 bottom-4 w-80 ${isDark ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-slate-300'} border rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden`}
                    >
                      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Action History</span>
                        <button onClick={() => setShowActionHistory(false)} className="text-slate-500 hover:text-slate-800">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                          <History size={32} className="mb-4 opacity-30" />
                          <p className="text-xs font-medium">No history recorded yet.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`h-10 ${isDark ? 'bg-[#141414] border-white/5' : 'bg-slate-100 border-slate-200'} border-b flex items-center px-4 justify-between shrink-0`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-white/60' : 'text-slate-800'}`}>{selectedFilePath || 'index.html'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold uppercase">{selectedFilePath?.split('.').pop() || 'html'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const codeToCopy = selectedFile?.content || (selectedFilePath === 'index.html' ? generatedCode : '') || generatedCode || '';
                        navigator.clipboard.writeText(codeToCopy);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                        isCopied 
                          ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' 
                          : isDark ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      }`}
                    >
                      {isCopied ? 'Copié !' : 'Copier'}
                    </button>
                    <button
                      onClick={() => setIsEditingCode(!isEditingCode)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                        isEditingCode 
                          ? 'bg-[var(--color-primary)] text-white shadow' 
                          : isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold'
                      }`}
                    >
                      {isEditingCode ? 'Mode Lecture' : 'Éditer Code'}
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto scrollbar-hide relative flex flex-col">
                  {isEditingCode ? (
                    <textarea
                      value={editableCode}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        setEditableCode(newVal);
                        if (selectedFile) {
                          selectedFile.content = newVal;
                        }
                        const newBundle = bundleProjectFiles(effectiveFiles, newVal);
                        if (onCodeChange) {
                          onCodeChange(newBundle);
                        }
                      }}
                      className={`w-full h-full flex-1 p-6 font-mono text-xs leading-relaxed resize-none focus:outline-none ${
                        isDark ? 'bg-[#0D0D0D] text-emerald-400 selection:bg-[var(--color-primary)]/30' : 'bg-slate-900 text-emerald-300 selection:bg-[var(--color-primary)]/30'
                      }`}
                      placeholder="Saisissez ou collez votre code ici..."
                      spellCheck={false}
                    />
                  ) : (
                    <SyntaxHighlighter
                      language={selectedFilePath?.split('.').pop() || 'html'}
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
                      {selectedFile?.content || generatedCode || "<!-- Aucun code disponible pour le moment -->"}
                    </SyntaxHighlighter>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Forge Studio Panel Drawer */}
        <AnimatePresence>
          {showForgeStudio && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full shrink-0 overflow-hidden flex"
              id="forge-studio-drawer-outer"
            >
              <ForgeStudio 
                code={generatedCode || ""}
                isDark={isDark}
                onClose={() => setShowForgeStudio(false)}
                onApplyPrompt={(p) => onApplyPrompt?.(p)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
