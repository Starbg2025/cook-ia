import React from 'react';
import { motion } from 'motion/react';
import { Search, Music, Database, Image as ImageIcon, Mic, Plus, ArrowRight, Sparkles } from 'lucide-react';

interface StartPageProps {
  onStartChat: (prompt: string) => void;
  isDark: boolean;
}

export const StartPage: React.FC<StartPageProps> = ({ onStartChat, isDark }) => {
  const [prompt, setPrompt] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const quickActions = [
    { icon: <Music size={16} />, label: 'Generate music', color: 'text-blue-500' },
    { icon: <Database size={16} />, label: 'Add database and auth', color: 'text-blue-400' },
    { icon: <ImageIcon size={16} />, label: 'Create & edit images', color: 'text-blue-500' },
    { icon: <Sparkles size={16} />, label: 'Add voice conversations', color: 'text-blue-400' },
  ];

  const appIdeas = [
    { title: 'Vibrant Morphing', image: 'https://picsum.photos/seed/vibrant/400/250' },
    { title: 'Bring anything to life', image: 'https://picsum.photos/seed/life/400/250' },
    { title: 'Mechanical Heart', image: 'https://picsum.photos/seed/heart/400/250' },
    { title: 'Nano Banana', image: 'https://picsum.photos/seed/banana/400/250' },
  ];

  const filteredIdeas = appIdeas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-white text-slate-900'}`}>
      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-24 flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl lg:text-5xl font-medium tracking-tight">
              Build your ideas with Cook IA
            </h1>
            <div className="relative">
               <Sparkles className="text-blue-400 w-12 h-12 animate-pulse" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-3xl p-1 rounded-[32px] bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 mb-8`}
        >
          <div className={`rounded-[31px] p-4 lg:p-6 ${isDark ? 'bg-[#141414]' : 'bg-white'} flex flex-col gap-4`}>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe an app and let Cook IA do the rest"
              className="w-full bg-transparent border-none focus:ring-0 text-lg lg:text-xl resize-none h-24 placeholder:text-slate-500"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${isDark ? 'hover:bg-white/5' : ''}`}>
                  <Mic size={20} className="text-slate-500" />
                </button>
                <button className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${isDark ? 'hover:bg-white/5' : ''}`}>
                  <Plus size={20} className="text-slate-500" />
                </button>
              </div>
              <button 
                onClick={() => onStartChat(prompt)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'} transition-all font-medium text-sm`}
              >
                <Sparkles size={16} className="text-blue-400" />
                I'm feeling lucky
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-24">
          {quickActions.map((action, i) => (
            <button 
              key={i}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'} transition-all text-sm font-medium`}
            >
              <span className={action.color}>{action.icon}</span>
              {action.label}
            </button>
          ))}
          <button className={`p-2 rounded-full border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'} transition-all`}>
            <ArrowRight size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-medium">Discover and remix app ideas</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Recherche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-full border text-sm focus:outline-none focus:border-blue-500 transition-all ${
                    isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'} transition-all text-sm font-medium`}>
                Browse the app gallery <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredIdeas.map((idea, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className={`group cursor-pointer rounded-2xl overflow-hidden border ${isDark ? 'border-white/10 bg-[#141414]' : 'border-slate-200 bg-slate-50'} transition-all`}
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={idea.image} 
                    alt={idea.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm">{idea.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
