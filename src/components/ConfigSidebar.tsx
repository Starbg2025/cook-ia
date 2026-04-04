import React from 'react';
import { Settings, ChevronDown, Info, Sliders, Zap, Shield, Database } from 'lucide-react';

interface ConfigSidebarProps {
  isDark: boolean;
}

export const ConfigSidebar: React.FC<ConfigSidebarProps> = ({ isDark }) => {
  return (
    <aside className={`w-full flex flex-col h-full ${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200'} border-l overflow-y-auto scrollbar-hide`}>
      <div className="p-4 border-b border-inherit">
        <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'} mb-4 flex items-center gap-2`}>
          <Settings size={14} />
          Configuration
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Model</label>
            <button className={`w-full flex items-center justify-between p-2.5 rounded-lg border ${isDark ? 'bg-[#141414] border-white/10 text-white hover:bg-[#1A1A1A]' : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100'} transition-all text-sm`}>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-orange-primary" />
                <span>Cook IA Engine</span>
              </div>
              <ChevronDown size={14} className={isDark ? 'text-white/20' : 'text-slate-400'} />
            </button>
          </div>

          <div className="space-y-4 pt-4">
             <div className="flex items-center justify-between">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Temperature</label>
                <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>1.0</span>
             </div>
             <input type="range" className="w-full h-1 bg-orange-primary/20 rounded-lg appearance-none cursor-pointer accent-orange-primary" />
          </div>

          <div className="space-y-4 pt-2">
             <div className="flex items-center justify-between">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Top K</label>
                <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>64</span>
             </div>
             <input type="range" className="w-full h-1 bg-orange-primary/20 rounded-lg appearance-none cursor-pointer accent-orange-primary" />
          </div>

          <div className="space-y-4 pt-2">
             <div className="flex items-center justify-between">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Top P</label>
                <span className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'}`}>0.95</span>
             </div>
             <input type="range" className="w-full h-1 bg-orange-primary/20 rounded-lg appearance-none cursor-pointer accent-orange-primary" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <h4 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'} flex items-center gap-2`}>
            <Shield size={12} />
            Safety Settings
          </h4>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-[10px] ${isDark ? 'text-white/60' : 'text-slate-500'} leading-relaxed`}>
              Content filtering is active to ensure safe and high-quality code generation.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'} flex items-center gap-2`}>
            <Database size={12} />
            System Instructions
          </h4>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
             <p className={`text-[10px] font-mono ${isDark ? 'text-white/40' : 'text-slate-400'} leading-relaxed line-clamp-4`}>
                You are COOK IA, a world-class full-stack web engineer. Your goal is to build ultra-modern, responsive, and high-performance websites using Tailwind CSS and modern JS frameworks.
             </p>
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-inherit">
        <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-orange-primary/10 text-orange-primary' : 'bg-orange-50 text-orange-600'}`}>
          <Info size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Pro Features Active</span>
        </div>
      </div>
    </aside>
  );
};
