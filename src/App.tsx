/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Eye, 
  Code2, 
  Github, 
  Globe, 
  Copy, 
  Check,
  Loader2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateWebsite, generateTitle } from './services/geminiService';
import { Message, ViewMode, Conversation } from './types';
import { ChatInterface } from './components/ChatInterface';
import { Preview } from './components/Preview';
import { HistorySidebar } from './components/HistorySidebar';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { supabase } from './services/supabaseService';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

const LOGO_URL = "https://i.ibb.co/mC3M8SSN/logo.png"; // Note: I used a direct link format, you may need to check the exact direct link on ImgBB

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "COOK IA, créé par Benit Madimba, est prêt à concevoir votre prochaine plateforme web ultra-moderne. Que souhaitez-vous construire aujourd'hui ?"
    }
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [isRepoPrivate, setIsRepoPrivate] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<any>('general');
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const skipIframeUpdate = useRef(false);

  useEffect(() => {
    loadConversations();
    
    // Check for user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: any) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    setUser({ ...authUser, profile });
  };

  useEffect(() => {
    if (user) {
      const channel = supabase.channel('online_users', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setConversations(data);
    if (error) console.error("Error loading conversations:", error);
  };

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversationId(id);
      setMessages(conv.messages);
      const lastModelMsg = [...conv.messages].reverse().find(m => m.role === 'model' && m.code);
      if (lastModelMsg?.code) {
        setGeneratedCode(lastModelMsg.code);
        setViewMode('preview');
      } else {
        setGeneratedCode('');
      }
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([
      {
        role: 'model',
        content: "COOK IA, créé par Benit Madimba, est prêt à concevoir votre prochaine plateforme web ultra-moderne. Que souhaitez-vous construire aujourd'hui ?"
      }
    ]);
    setGeneratedCode('');
    setViewMode('preview');
  };

  const handleDeleteConversation = async (id: string) => {
    const { error } = await supabase.from('conversations').delete().eq('id', id);
    if (!error) {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) handleNewChat();
    }
  };

  const saveConversation = async (msgs: Message[], title?: string) => {
    if (!user) return;
    
    if (currentConversationId) {
      await supabase
        .from('conversations')
        .update({ messages: msgs })
        .eq('id', currentConversationId);
    } else {
      const newTitle = title || await generateTitle(msgs[1].content);
      const { data } = await supabase
        .from('conversations')
        .insert([{ title: newTitle, messages: msgs, user_id: user.id }])
        .select();
      
      if (data && data[0]) {
        setCurrentConversationId(data[0].id);
        setConversations(prev => [data[0], ...prev]);
      }
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        setGithubToken(event.data.token);
        setIsGithubModalOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGithubClick = async () => {
    if (githubToken) {
      setIsGithubModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/auth/github/url');
      const { url } = await res.json();
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (error) {
      console.error("Error getting GitHub auth URL:", error);
    }
  };

  const handleCreateRepo = async () => {
    if (!repoName.trim() || !githubToken || !generatedCode) return;

    setIsSyncing(true);
    try {
      const res = await fetch('/api/github/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken,
          name: repoName,
          description: repoDescription,
          isPrivate: isRepoPrivate,
          code: generatedCode
        })
      });

      const result = await res.json();
      if (result.success) {
        alert(`Repository created successfully! View it at: ${result.url}`);
        setIsGithubModalOpen(false);
      } else {
        alert(`Error creating repository: ${result.message || JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error("Error creating repository:", error);
      alert("An error occurred while creating the repository.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (viewMode === 'code' && generatedCode) {
      Prism.highlightAll();
    }
  }, [viewMode, generatedCode]);

  useEffect(() => {
    if (generatedCode && iframeRef.current && !skipIframeUpdate.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(generatedCode);
        doc.close();
      }
    }
    // Reset skip ref after the effect runs
    skipIframeUpdate.current = false;
  }, [generatedCode, viewMode]);

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const userMessage = prompt;
    const currentImage = selectedImage;
    setPrompt('');
    setSelectedImage(null);
    
    const newMessages: Message[] = [...messages, { 
      role: 'user', 
      content: userMessage,
      image: currentImage || undefined
    }];
    setMessages(newMessages);
    const controller = new AbortController();
    setAbortController(controller);
    setIsLoading(true);

    try {
      const history = newMessages.map(m => {
        const parts: any[] = [{ text: m.content + (m.code ? `\n\nCode:\n${m.code}` : '') }];
        if (m.image) {
          const [mimeType, data] = m.image.split(';base64,');
          parts.push({
            inlineData: {
              mimeType: mimeType.split(':')[1],
              data: data
            }
          });
        }
        return {
          role: m.role,
          parts
        };
      });

      // Prepare current image for API if exists
      let imagePart;
      if (currentImage) {
        const [mimeType, data] = currentImage.split(';base64,');
        imagePart = {
          mimeType: mimeType.split(':')[1],
          data: data
        };
      }

      const result = await generateWebsite(userMessage, history.slice(0, -1), imagePart);
      
      const updatedMessages: Message[] = [...newMessages, { 
        role: 'model', 
        content: result.explanation,
        code: result.code
      }];
      setMessages(updatedMessages);
      setGeneratedCode(result.code);
      setViewMode('preview');
      
      // Enqueue invisible background task (Watchdog Architecture)
      fetch('/api/watchdog/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'site_optimization', 
          payload: { siteName: siteName || 'untitled', codeLength: result.code.length } 
        })
      }).catch(err => console.error("Watchdog enqueue failed:", err));

      // Save to Supabase
      await saveConversation(updatedMessages);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: "Requête annulée par l'utilisateur." 
        }]);
        return;
      }
      console.error("Error generating website:", error);
      const errorMessage = error.message?.includes("API key") 
        ? "Clé API invalide ou manquante. Vérifiez votre configuration Netlify."
        : "Désolé, une erreur est survenue lors de la génération. Veuillez réessayer.";
        
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: errorMessage 
      }]);
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleAbort = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${siteName || 'votre-site'}.cook.ia`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!generatedCode || !user || !siteName.trim()) return;
    
    setIsPublishing(true);
    try {
      const slug = siteName.toLowerCase().replace(/\s+/g, '-');
      const { data, error } = await supabase
        .from('published_sites')
        .upsert([
          { 
            slug, 
            code: generatedCode, 
            user_id: user.id 
          }
        ], { onConflict: 'slug' })
        .select();

      if (error) throw error;

      const url = `${window.location.origin}/?p=${slug}`;
      setPublishedUrl(url);
      alert(`Félicitations ! Votre site est maintenant en ligne sur ${slug}.cook.ia`);
    } catch (error: any) {
      console.error("Error publishing site:", error);
      alert(`Erreur lors de la publication : ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRefresh = () => {
    if (generatedCode && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(generatedCode);
        doc.close();
      }
    }
  };

  const [isViewOnly, setIsViewOnly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const siteSlug = params.get('p');
    if (siteSlug) {
      setIsViewOnly(true);
      const loadPublishedSite = async () => {
        const { data } = await supabase
          .from('published_sites')
          .select('code')
          .eq('slug', siteSlug)
          .single();
        
        if (data?.code) {
          setGeneratedCode(data.code);
          setViewMode('preview');
        }
      };
      loadPublishedSite();
    }
  }, []);

  if (isViewOnly && generatedCode) {
    return (
      <div className="fixed inset-0 bg-white">
        <iframe 
          srcDoc={generatedCode}
          title="Published Site"
          className="w-full h-full border-none"
        />
        <button 
          onClick={() => {
            window.location.href = window.location.origin;
          }}
          className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-black transition-all z-50 shadow-2xl"
        >
          Créé avec COOK IA
        </button>
      </div>
    );
  }

  const handleDownload = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteName || 'website'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExpand = () => {
    if (generatedCode) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(generatedCode);
        newWindow.document.close();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-xl z-50 sticky top-0">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-3.5 rounded-2xl transition-all duration-300 ${isHistoryOpen ? 'bg-white text-black' : 'bg-[#141414] text-white/40 hover:bg-[#1A1A1A] hover:text-white'} border border-white/5 shadow-2xl group`}
          >
            <div className="flex flex-col gap-1.5 w-5">
              <div className={`h-[2px] transition-all duration-300 ${isHistoryOpen ? 'w-full bg-black' : 'w-full bg-current'}`} />
              <div className={`h-[2px] transition-all duration-300 ${isHistoryOpen ? 'w-2/3 bg-black' : 'w-full bg-current'}`} />
              <div className={`h-[2px] transition-all duration-300 ${isHistoryOpen ? 'w-full bg-black' : 'w-full bg-current'}`} />
            </div>
          </button>
          
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-[#141414] rounded-[1.25rem] flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden transition-transform group-hover:scale-105">
              <img src={LOGO_URL} alt="COOK IA Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter flex items-center gap-1.5 leading-none mb-1">
                COOK <span className="text-orange-primary">IA</span>
              </h1>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Full-Stack Web Development</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex bg-[#0D0D0D] p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
            <button 
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'preview' ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/30 hover:text-white'}`}
            >
              <Eye size={14} />
              Preview
            </button>
            <button 
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'code' ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/30 hover:text-white'}`}
            >
              <Code2 size={14} />
              Code
            </button>
          </div>

          <div className="h-10 w-[1px] bg-white/5" />
          
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4 bg-white/5 pl-2 pr-4 py-1.5 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-orange-primary/20 border border-orange-primary/20 flex items-center justify-center overflow-hidden shadow-inner">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-black text-orange-primary">{user.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="text-white/30 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="text-white/30 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors px-4 py-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5"
              >
                Sign In
              </button>
            )}

            <div className="h-6 w-[1px] bg-white/5" />

            <button 
              onClick={handleDownload}
              disabled={!generatedCode}
              title="Download HTML"
              className="text-white/30 hover:text-white transition-all p-2.5 hover:bg-white/5 rounded-xl disabled:opacity-10"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={handleGithubClick}
              className="text-white/30 hover:text-white transition-all p-2.5 hover:bg-white/5 rounded-xl"
            >
              <Github size={20} />
            </button>
            <button 
              onClick={() => setIsPublishModalOpen(true)}
              className="bg-orange-primary hover:bg-orange-600 text-white px-8 py-3.5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(255,107,0,0.2)] active:scale-95 hover:-translate-y-0.5"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: -20 }}
              animate={{ width: 256, opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="overflow-hidden"
            >
              <HistorySidebar 
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={handleSelectConversation}
                onNewChat={handleNewChat}
                onDeleteConversation={handleDeleteConversation}
                onOpenSettings={(tab) => {
                  setSettingsTab(tab || 'general');
                  setIsSettingsModalOpen(true);
                }}
                user={user}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ChatInterface 
          messages={messages}
          prompt={prompt}
          setPrompt={setPrompt}
          handleSend={handleSend}
          onAbort={handleAbort}
          isLoading={isLoading}
          chatEndRef={chatEndRef}
          logoUrl={LOGO_URL}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
        
        <Preview 
          viewMode={viewMode}
          generatedCode={generatedCode}
          iframeRef={iframeRef}
          onRefresh={handleRefresh}
          onExpand={handleExpand}
          onEdit={() => setViewMode('code')}
          onCodeChange={(newCode) => {
            skipIframeUpdate.current = true;
            setGeneratedCode(newCode);
          }}
        />
      </main>

      {/* GitHub Sync Modal */}
      <AnimatePresence>
        {isGithubModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGithubModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] rounded-[32px] border border-white/10 p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white" />
              
              <div className="flex flex-col">
                <h2 className="text-xl font-bold mb-6">Sync to GitHub</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">New repository name</label>
                    <input 
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/30 transition-all"
                      placeholder="my-awesome-project"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/60">New repository description</label>
                    <input 
                      type="text"
                      value={repoDescription}
                      onChange={(e) => setRepoDescription(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-white/30 transition-all"
                      placeholder="Brief description of your site"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm text-white/60">Visibility</label>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-1">
                          <input 
                            type="radio" 
                            name="visibility" 
                            checked={isRepoPrivate}
                            onChange={() => setIsRepoPrivate(true)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all ${isRepoPrivate ? 'border-white' : 'border-white/20'}`} />
                          {isRepoPrivate && <div className="absolute w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Private</p>
                          <p className="text-xs text-white/40">Only you can access this repo on GitHub.com</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-1">
                          <input 
                            type="radio" 
                            name="visibility" 
                            checked={!isRepoPrivate}
                            onChange={() => setIsRepoPrivate(false)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all ${!isRepoPrivate ? 'border-white' : 'border-white/20'}`} />
                          {!isRepoPrivate && <div className="absolute w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Public</p>
                          <p className="text-xs text-white/40">This repo will be discoverable by everyone on GitHub.com</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={handleCreateRepo}
                    disabled={isSyncing || !repoName.trim() || !generatedCode}
                    className="w-full bg-white text-black py-4 rounded-xl font-bold transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  >
                    {isSyncing && <Loader2 size={18} className="animate-spin" />}
                    {isSyncing ? 'Creating repository...' : 'Create GitHub repository'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Publish Modal */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPublishModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] rounded-[32px] border border-white/10 p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-primary" />
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="text-orange-primary" size={32} />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Publish Website</h2>
                <p className="text-white/40 text-sm mb-8">Choose a name for your production-ready site.</p>

                <div className="w-full space-y-6">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Site Name</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        placeholder="my-awesome-site"
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 pr-20 text-sm font-mono focus:outline-none focus:border-orange-primary/50 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-mono text-sm">.cook.ia</span>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                    <span className="text-orange-primary font-mono text-sm truncate mr-4">
                      {siteName || 'votre-site'}.cook.ia
                    </span>
                    <button 
                      onClick={() => {
                        const url = publishedUrl || `${window.location.origin}/?p=${siteName || 'votre-site'}`;
                        navigator.clipboard.writeText(url);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                    >
                      {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      {isCopied ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => {
                        setIsPublishModalOpen(false);
                        setPublishedUrl(null);
                      }}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all"
                    >
                      {publishedUrl ? 'Fermer' : 'Annuler'}
                    </button>
                    {!publishedUrl && (
                      <button 
                        onClick={handlePublish}
                        disabled={isPublishing || !siteName.trim() || !generatedCode}
                        className="flex-1 bg-orange-primary hover:bg-orange-600 text-white py-4 rounded-2xl font-bold transition-all shadow-[0_10px_30px_rgba(255,107,0,0.3)] disabled:opacity-50"
                      >
                        {isPublishing ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirmer & Publier'}
                      </button>
                    )}
                    {publishedUrl && (
                      <a 
                        href={publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-orange-primary hover:bg-orange-600 text-white py-4 rounded-2xl font-bold transition-all shadow-[0_10px_30px_rgba(255,107,0,0.3)] text-center"
                      >
                        Visiter le site
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsTab}
        user={user}
      />
    </div>
  );
}
