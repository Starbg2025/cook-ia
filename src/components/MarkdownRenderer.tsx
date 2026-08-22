import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isDark?: boolean;
  isUser?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isDark = true,
  isUser = false
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  let codeBlockCounter = 0;

  return (
    <div className={`markdown-body text-sm leading-relaxed break-words ${
      isUser 
        ? 'text-white' 
        : (isDark ? 'text-slate-100' : 'text-slate-800')
    }`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className={`text-base sm:text-lg font-bold mt-3 mb-1.5 pb-1 border-b ${
              isDark ? 'text-white border-white/10' : 'text-slate-900 border-slate-200'
            }`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-sm sm:text-base font-bold mt-3 mb-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-xs sm:text-sm font-bold mt-2.5 mb-1 ${
              isDark ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className={`font-semibold ${
              isDark ? 'text-white' : 'text-slate-950 font-bold'
            }`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic opacity-90">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2.5 pl-1.5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2.5 pl-1.5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-2 pl-3 my-2.5 italic ${
              isDark ? 'border-orange-500/70 text-slate-300 bg-white/[0.02] py-1 rounded-r' : 'border-orange-500 text-slate-700 bg-slate-50 py-1 rounded-r'
            }`}>
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }: any) => {
            const isInline = !className && typeof children === 'string' && !children.includes('\n');
            if (isInline) {
              return (
                <code 
                  className={`px-1.5 py-0.5 rounded text-[12px] font-mono font-medium ${
                    isUser
                      ? 'bg-black/30 text-amber-200 border border-white/10'
                      : (isDark 
                          ? 'bg-white/[0.08] text-amber-300 border border-white/10' 
                          : 'bg-slate-100 text-slate-900 border border-slate-300 font-semibold')
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const currentIndex = codeBlockCounter++;
            const rawCode = String(children || '').replace(/\n$/, '');

            return (
              <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 bg-slate-950 text-slate-100 shadow-md">
                <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.05] border-b border-white/[0.08] text-[11px] font-mono text-white/60">
                  <span>code</span>
                  <button
                    onClick={() => handleCopyCode(rawCode, currentIndex)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    title="Copier le code"
                  >
                    {copiedCodeIndex === currentIndex ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 text-xs font-mono overflow-x-auto custom-scrollbar leading-relaxed">
                  <code>{rawCode}</code>
                </pre>
              </div>
            );
          },
          hr: () => (
            <hr className={`my-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
          )
        }}
      >
        {content || ''}
      </ReactMarkdown>
    </div>
  );
};
