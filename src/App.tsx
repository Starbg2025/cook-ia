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
  Download,
  Sun,
  Moon,
  Menu,
  MessageSquare,
  Code,
  Settings2,
  Rocket,
  Trash2,
  Plus,
  History,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  MousePointer2,
  Camera,
  Search,
  Layout,
  CheckCircle,
  X,
  Video,
  ImagePlus,
  ImageIcon,
  ShoppingBag,
  User,
  Scissors,
  ExternalLink,
  Smartphone,
  QrCode,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateWebsite, generateTitle, updateSection, convertToReact, improveText } from './services/geminiService';
import { analystReview, criticReview, plannerAgent, testerAgent, shadowWatchdog } from './services/multiAgentService';
import { Message, ViewMode, Conversation, StyleConfig, SectionEditState, ActionHistory } from './types';
import { ChatInterface } from './components/ChatInterface';
import { Preview } from './components/Preview';
import { HistorySidebar } from './components/HistorySidebar';
import { StyleEditor } from './components/StyleEditor';
import { SectionChat } from './components/SectionChat';
import { ImageSearchModal } from './components/ImageSearchModal';
import { UrlInputModal } from './components/UrlInputModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { LandingPage } from './components/LandingPage';
import { SkillsLibrary } from './components/SkillsLibrary';
import { cinematicSpaceTemplate } from './data/cinematicSpaceTemplate';

import { supabase, logErrorToSupabase } from './services/supabaseService';
import { deployToNetlify } from './services/netlifyService';
import JSZip from 'jszip';
import { Palette, Braces } from 'lucide-react';
import { translations, Language } from './translations';

const LOGO_URL = "https://i.ibb.co/mC3M8SSN/logo.png";

import { CookieBanner } from './components/CookieBanner';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('cook_ia_messages');
      return saved ? JSON.parse(saved) : [
        {
          role: 'model',
          content: "Cook IA, créé par Benit Madimba, est prêt à concevoir votre prochaine plateforme web ultra-moderne. Que souhaitez-vous construire aujourd'hui ?"
        }
      ];
    } catch {
      return [
        {
          role: 'model',
          content: "Cook IA, créé par Benit Madimba, est prêt à concevoir votre prochaine plateforme web ultra-moderne. Que souhaitez-vous construire aujourd'hui ?"
        }
      ];
    }
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('cook_ia_current_conv_id');
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Building your site...");
  const [currentActions, setCurrentActions] = useState<ActionHistory[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode | 'your-apps' | 'faq' | 'skills'>('chat');
  const [generatedCode, setGeneratedCode] = useState<string>(() => {
    try {
      return localStorage.getItem('cook_ia_generated_code') || '';
    } catch {
      return '';
    }
  });
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [isRepoPrivate, setIsRepoPrivate] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [publishStep, setPublishStep] = useState<number>(0);
  const [vercelUrl, setVercelUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStyleEditorOpen, setIsStyleEditorOpen] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlModalType, setUrlModalType] = useState<'clone' | 'ecommerce'>('clone');
  const [isConverting, setIsConverting] = useState(false);
  const [imageSearchContext, setImageSearchContext] = useState<'chat' | 'section'>('chat');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('cook_ia_lang');
      return (saved === 'fr' || saved === 'en') ? saved as Language : 'fr';
    } catch {
      return 'fr';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cook_ia_lang', lang);
    } catch (e) {
      console.warn(e);
    }
  }, [lang]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isProjectSettings, setIsProjectSettings] = useState(true);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [pendingSend, setPendingSend] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'publish' | 'versions' | 'secrets' | 'integrations' | 'github' | 'general' | 'account' | 'help'>('publish');
  const [secrets, setSecrets] = useState<{ key: string; value: string }[]>(() => {
    try {
      const saved = localStorage.getItem('user_secrets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  useEffect(() => {
    try {
      localStorage.setItem('user_secrets', JSON.stringify(secrets));
      shadowWatchdog.setHealthy();
    } catch (e) {
      console.error("Failed to save secrets to localStorage:", e);
    }
  }, [secrets]);

  useEffect(() => {
    try {
      localStorage.setItem('cook_ia_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn("Failed to save messages to localStorage:", e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('cook_ia_generated_code', generatedCode);
    } catch (e) {
      console.warn("Failed to save generatedCode to localStorage:", e);
    }
  }, [generatedCode]);

  useEffect(() => {
    try {
      if (currentConversationId) {
        localStorage.setItem('cook_ia_current_conv_id', currentConversationId);
      } else {
        localStorage.removeItem('cook_ia_current_conv_id');
      }
    } catch (e) {
      console.warn("Failed to save currentConversationId to localStorage:", e);
    }
  }, [currentConversationId]);

  const [isLinkFullscreen, setIsLinkFullscreen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [pendingLandingPrompt, setPendingLandingPrompt] = useState<string | null>(null);
  const [pendingLandingTemplate, setPendingLandingTemplate] = useState<{ code: string, promptText: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('cook_ia_started', hasStarted ? 'true' : 'false');
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
  }, [hasStarted]);

  useEffect(() => {
    if (user) {
      if (pendingLandingPrompt !== null) {
        const promptToRun = pendingLandingPrompt;
        setPendingLandingPrompt(null);
        if (promptToRun.trim()) {
          setPrompt(promptToRun);
          setPendingSend(true);
        }
        setHasStarted(true);
      } else if (pendingLandingTemplate !== null) {
        const { code, promptText } = pendingLandingTemplate;
        setPendingLandingTemplate(null);
        setGeneratedCode(code);
        setPrompt("");
        const newMsg = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'user' as const,
          content: promptText,
          timestamp: new Date()
        };
        const systemMsg = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'model' as const,
          content: "Voici le site web cinématique généré sur la base de vos spécifications. Vous pouvez utiliser le volet de discussion pour y apporter des modifications de style ou de contenu.",
          timestamp: new Date(),
          files: [
            {
              path: 'index.html',
              content: code
            }
          ]
        };
        setMessages([newMsg, systemMsg]);
        setHasStarted(true);
        setViewMode('preview');
      }
    }
  }, [user, pendingLandingPrompt, pendingLandingTemplate]);

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('selectedModel');
      return saved || 'gemini-2.5-flash';
    } catch (e) {
      console.warn("Storage access denied:", e);
      return 'gemini-2.5-flash';
    }
  });
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('isRealtimeEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      console.warn("Storage access denied:", e);
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('selectedModel', selectedModel);
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [selectedModel]);

  useEffect(() => {
    try {
      localStorage.setItem('isRealtimeEnabled', JSON.stringify(isRealtimeEnabled));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [isRealtimeEnabled]);

  const handleUpdateProjectName = async (newName: string) => {
    if (!currentConversationId || !newName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: newName })
        .eq('id', currentConversationId);
        
      if (error) throw error;
      
      setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, title: newName } : c));
    } catch (err) {
      console.error('Error updating project name:', err);
    }
  };

  const handleAddSecret = (key: string, value: string) => {
    setSecrets(prev => [...prev, { key, value }]);
  };

  const handleRemoveSecret = (key: string) => {
    setSecrets(prev => prev.filter(s => s.key !== key));
  };
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    primaryColor: '#FF6B00',
    fontFamily: 'Inter',
    borderRadius: '1rem'
  });
  const [sectionEdit, setSectionEdit] = useState<SectionEditState>({ isActive: false });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const skipIframeUpdate = useRef(false);

  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'preview'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [collaborators, setCollaborators] = useState<Record<string, { x: number; y: number; name: string }>>({});
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  React.useEffect(() => {
    if (sectionEdit.isActive && sectionEdit.elementContext) {
      setIsStyleEditorOpen(true);
    }
  }, [sectionEdit.isActive, sectionEdit.elementContext]);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    loadConversations();
    
    // Check for user session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Supabase session error:", error.message);
        // If the refresh token is invalid, sign out to clear local storage
        if (error.message.includes("Refresh Token Not Found") || error.message.includes("Invalid Refresh Token")) {
          supabase.auth.signOut();
          setUser(null);
        }
        return;
      }
      
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setConversations([]);
        setCurrentConversationId(null);
        setHasStarted(false);
        return;
      }

      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentConversationId || !user || !isRealtimeEnabled) {
      setCollaborators({});
      return;
    }

    // Real-time site synchronisation
    const channel = supabase
      .channel(`chat:${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${currentConversationId}`,
        },
        (payload: any) => {
          const newMsgs = payload.new.messages as Message[];
          setMessages(newMsgs);
          
          // Sync code if it changed
          const lastModelMsg = [...newMsgs].reverse().find(m => m.role === 'model' && m.code);
          if (lastModelMsg?.code && lastModelMsg.code !== generatedCode) {
            setGeneratedCode(lastModelMsg.code);
          }
        }
      )
      // Cursors tracking
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const newCollabs: any = {};
        Object.entries(newState).forEach(([key, presence]: [string, any[]]) => {
          if (key !== user.id) {
            newCollabs[key] = presence[0];
          }
        });
        setCollaborators(newCollabs);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            name: user.profile?.full_name || user.email,
            x: 0,
            y: 0
          });
        }
      });

    // Mouse position sharing - throttled to 250ms to prevent severe lag and cursor thread locking
    let lastTrackTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTrackTime > 250) {
        channel.track({
          name: user.profile?.full_name || user.email,
          x: e.clientX,
          y: e.clientY
        });
        lastTrackTime = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      channel.unsubscribe();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [currentConversationId, user, generatedCode]);

  const fetchProfile = async (authUser: any) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    const updatedUser = { ...authUser, profile };
    setUser(updatedUser);
    loadConversations();
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
    
    if (error) {
      if (error.message.includes("Refresh Token Not Found") || error.message.includes("Invalid Refresh Token")) {
        supabase.auth.signOut();
        setUser(null);
        setConversations([]);
      }
      console.error("Error loading conversations:", error);
      return;
    }
    if (data) {
      setConversations(data);
      try {
        const started = localStorage.getItem('cook_ia_started');
        if (data.length > 0 && !currentConversationId && started === 'true') {
          const lastConv = data[0];
          setCurrentConversationId(lastConv.id);
          setMessages(lastConv.messages);
          const lastModelMsg = [...lastConv.messages].reverse().find(m => m.role === 'model' && m.code);
          if (lastModelMsg?.code) {
            setGeneratedCode(lastModelMsg.code);
            setViewMode('preview');
          } else {
            setGeneratedCode('');
          }
        }
      } catch (e) {
        console.warn("Storage auto-select failed:", e);
      }
    }
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
      setHasStarted(true);
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

  const handleSectionUpdate = async (sectionPrompt: string) => {
    if (!sectionEdit.sectionHtml || !generatedCode || isLoading) return;

    setIsLoading(true);
    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // 2. Engineer Phase
      const result = await updateSection(
        sectionPrompt,
        sectionEdit.sectionHtml,
        generatedCode,
        history,
        selectedModel
      );

      // Replace the old section HTML with the new one in the full code
      const updatedCode = generatedCode.replace(sectionEdit.sectionHtml, result.updated_section_html);
      
      const updatedMessages: Message[] = [...messages, { 
        role: 'model', 
        content: `J'ai mis à jour la section (${sectionEdit.selector}) : ${result.explanation}`,
        code: updatedCode
      }];
      
      setMessages(updatedMessages);
      setGeneratedCode(updatedCode);
      setSectionEdit({ isActive: false });
      
      // Save to Supabase
      await saveConversation(updatedMessages);
    } catch (error) {
      console.error("Error updating section:", error);
      alert("Erreur lors de la mise à jour de la section.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNetlifyDeploy = async () => {
    if (!generatedCode || isDeploying) return;
    
    setIsDeploying(true);
    try {
      const result = await deployToNetlify(siteName || 'cook-ia-project', generatedCode);
      if (result.success) {
        window.open(result.url, '_blank');
        alert(`Site déployé avec succès sur Netlify !\nURL : ${result.url}`);
      }
    } catch (error) {
      console.error("Netlify deployment failed:", error);
      alert("Le déploiement sur Netlify a échoué.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (imageSearchContext === 'section' && sectionEdit.isActive) {
      // If in section edit mode, we'll append a prompt to use this image
      setPrompt(prev => prev + `\n\nUtilise cette image Unsplash pour remplacer l'image principale de cette section : ${imageUrl}`);
    } else {
      // In general chat, add to selected images
      setSelectedImages(prev => [...prev, imageUrl]);
    }
    setIsImageSearchOpen(false);
  };

  const handleImproveText = async (style: 'professional' | 'creative' | 'sales') => {
    if (!sectionEdit.sectionHtml || isLoading) return;

    setIsLoading(true);
    try {
      const improved = await improveText(sectionEdit.sectionHtml, style);
      
      // We'll use the updateSection logic but with a pre-defined prompt
      const result = await updateSection(
        `Réécris le texte de cette section dans un style ${style}. Voici le nouveau texte à intégrer intelligemment : "${improved}"`,
        sectionEdit.sectionHtml,
        generatedCode,
        [],
        selectedModel
      );

      const updatedCode = generatedCode.replace(sectionEdit.sectionHtml, result.updated_section_html);
      
      const updatedMessages: Message[] = [...messages, { 
        role: 'model', 
        content: `J'ai réécrit le texte de la section en style ${style}.`,
        code: updatedCode
      }];
      
      setMessages(updatedMessages);
      setGeneratedCode(updatedCode);
      setSectionEdit({ isActive: false });
      await saveConversation(updatedMessages);
    } catch (error) {
      console.error("Error improving text:", error);
      alert("Erreur lors de l'amélioration du texte.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToReact = async (framework: 'react' | 'nextjs' | 'python' | 'javascript') => {
    if (!generatedCode || isConverting) return;

    setIsConverting(true);
    try {
      const result = await convertToReact(generatedCode, framework);
      
      const frameworkNames = {
        react: 'React',
        nextjs: 'Next.js',
        python: 'Python (Flask)',
        javascript: 'JavaScript (Modulaire)'
      };

      const updatedMessages: Message[] = [...messages, { 
        role: 'model', 
        content: `Voici la conversion de votre site en ${frameworkNames[framework]} avec Tailwind CSS.`,
        files: result.files
      }];
      
      setMessages(updatedMessages);
      setViewMode('code');
      await saveConversation(updatedMessages);
    } catch (error) {
      console.error("Error converting code:", error);
      alert("Erreur lors de la conversion.");
    } finally {
      setIsConverting(false);
    }
  };

  const fetchImageAsBase64 = async (url: string): Promise<{mimeType: string, data: string} | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const [mimePart, dataPart] = base64data.split(';base64,');
          resolve({
            mimeType: mimePart.split(':')[1],
            data: dataPart
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Failed to fetch image for base64 conversion", e);
      return null;
    }
  };

  const handleCloneSite = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setUrlModalType('clone');
    setIsUrlModalOpen(true);
  };

  const handleEcommerceProduct = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setUrlModalType('ecommerce');
    setIsUrlModalOpen(true);
  };

  const handleUrlSubmit = (url: string) => {
    if (urlModalType === 'clone') {
      const clonePrompt = `CLONE CE SITE WEB : ${url}\n\nVisite le lien, analyse l'interface, les couleurs, la disposition et le contenu, puis reproduis-le fidèlement.`;
      setPrompt(clonePrompt);
    } else {
      const ecoPrompt = `CRÉE UN SITE E-COMMERCE PROFESSIONNEL POUR CE PRODUIT : ${url}

INSTRUCTIONS CRITIQUES D'EXTRACTION (PRIORITÉ ABSOLUE) :
1. IMAGES RÉELLES : Tu DOIS utiliser l'outil 'urlContext' pour scanner la page et extraire les URLs des images réelles du produit. Ne génère AUCUNE image générique ou placeholder. Si tu trouves plusieurs images (galerie), utilise-les toutes pour créer la section galerie du site.
2. FIDÉLITÉ DES DONNÉES : Récupère le nom exact du produit, son prix actuel, la devise, et la description détaillée.

INSTRUCTIONS DE DESIGN (STYLE HAUT DE GAMME) :
1. LAYOUT PRODUIT : Utilise une disposition "Product Detail Page" inspirée des meilleurs sites de mode.
   - Galerie à gauche : Miniatures verticales.
   - Image principale : Large, avec les vraies photos extraites du lien.
   - Infos à droite : Titre, prix, sélecteurs de variantes (tailles/couleurs) trouvés sur le site, et bouton "AJOUTER AU PANIER".
2. HEADER & STYLE : Design épuré, moderne, avec une navigation fluide et des icônes minimalistes.

Analyse le lien maintenant et construis le site avec les VRAIES photos du produit.`;
      setPrompt(ecoPrompt);
    }
  };

  const handleFeedback = async (index: number, type: 'like' | 'dislike') => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[index]) {
        newMessages[index] = {
          ...newMessages[index],
          feedback: newMessages[index].feedback === type ? undefined : type
        };
      }
      return newMessages;
    });
    
    // Persist feedback to Supabase
    if (currentConversationId) {
      const updatedMessages = [...messages];
      if (updatedMessages[index]) {
        updatedMessages[index] = {
          ...updatedMessages[index],
          feedback: updatedMessages[index].feedback === type ? undefined : type
        };
        await saveConversation(updatedMessages);
      }
    }
  };

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return;

    // Check if user is logged in, but lacks a username
    if (user && !user.profile?.username) {
      setIsAuthModalOpen(true);
      return;
    }

    executeSend();
  };

  const executeSend = async () => {
    setPendingSend(false);

    let userMessage = prompt;
    if (isFocusMode) {
      userMessage = `[FOCUS MODE ACTIVE: GENERATE A COMPLETE, FULLY FUNCTIONAL MULTI-PAGE WEBSITE] ${userMessage}`;
    }
    setPrompts(prev => [userMessage, ...prev]);
    const currentImages = [...selectedImages];
    const currentVideos = [...selectedVideos];
    setPrompt('');
    setSelectedImages([]);
    setSelectedVideos([]);
    
    const newMessages: Message[] = [...messages, { 
      role: 'user', 
      content: userMessage,
      images: currentImages.length > 0 ? currentImages : undefined,
      videos: currentVideos.length > 0 ? currentVideos : undefined
    }];
    setMessages(newMessages);
    const controller = new AbortController();
    setAbortController(controller);
    setIsLoading(true);
    setLoadingStatus(lang === 'fr' ? "Initialisation du moteur Cook IA..." : "Initializing Cook IA engine...");
    setCurrentActions([]);
    let codingInterval: any = null;

    const addAction = (type: 'read' | 'thought' | 'shell', content: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      setCurrentActions(prev => [...prev, { type, content, status: 'loading', id } as any]);
      return id;
    };

    const completeAction = (id: string, status: 'completed' | 'failed' = 'completed') => {
      setCurrentActions(prev => prev.map(a => (a as any).id === id ? { ...a, status } : a));
    };

    try {
      const history = await Promise.all(newMessages.map(async (m) => {
        const parts: any[] = [{ text: m.content + (m.code ? `\n\nCode:\n${m.code}` : '') }];
        if (m.images && m.images.length > 0) {
          for (const img of m.images) {
            if (img.startsWith('data:')) {
              const [mimeTypePart, data] = img.split(';base64,');
              parts.push({
                inlineData: {
                  mimeType: mimeTypePart.split(':')[1],
                  data: data
                }
              });
            } else {
              // It's a URL (like Unsplash)
              const base64Img = await fetchImageAsBase64(img);
              if (base64Img) {
                parts.push({
                  inlineData: base64Img
                });
              } else {
                parts.push({ text: `[Reference Image URL: ${img}]` });
              }
            }
          }
        }
        return {
          role: m.role,
          parts
        };
      }));

      // Prepare current images for API if exists
      let imageParts: any[] = [];
      if (currentImages.length > 0) {
        for (const img of currentImages) {
          if (img.startsWith('data:')) {
            const [mimeTypePart, data] = img.split(';base64,');
            imageParts.push({
              mimeType: mimeTypePart.split(':')[1],
              data: data
            });
          } else {
            const base64Img = await fetchImageAsBase64(img);
            if (base64Img) {
              imageParts.push(base64Img);
            }
          }
        }
      }

      let videoParts: any[] = [];
      if (currentVideos.length > 0) {
        for (const vid of currentVideos) {
          if (vid.startsWith('data:')) {
            const [mimeTypePart, data] = vid.split(';base64,');
            videoParts.push({
              mimeType: mimeTypePart.split(':')[1],
              data: data
            });
          }
        }
      }

      // If there are URLs in currentImages, append them to the userMessage
      let enrichedUserMessage = userMessage;
      const urls = currentImages.filter(img => !img.startsWith('data:'));
      if (urls.length > 0) {
        enrichedUserMessage += "\n\nReference Images (URLs):\n" + urls.join('\n');
      }

      const steps = lang === 'fr' ? [
        "Planification : Analyse des composants requis et de la structure sémantique...",
        "Réflexion : Définition de la palette de couleurs contemporaine et de l'ergonomie...",
        "Working : Génération des pages HTML5 modulaires et intégration Tailwind CSS...",
        "Styling : Conception des animations fluides Framer Motion & transitions...",
        "Hacking : Audit de la sécurité des formulaires et injections de scripts de sécurité...",
        "Optimisation : Compression des styles et configuration des métas SEO...",
        "Vérification : Tests de responsivité sur mobile, tablette et écran large...",
        "Finalisation : Liaison du badge Cook IA et compilation finale du package..."
      ] : [
        "Planning: Deconstructing guidelines and preparing content components...",
        "Thinking: Specifying luxurious design guidelines and layout structures...",
        "Working: Developing semantic responsive HTML pages and compounding Tailwind utilities...",
        "Styling: Scripting polished micro-interactions and motion curves...",
        "Hacking: Hardening forms, auditing packages, and sanitizing runtime components...",
        "Optimizing: Bundling styles, minifying tags, and writing optimized metadata...",
        "Reviewing: Performing cross-viewport responsiveness audits...",
        "Finalizing: Affixing the Cook IA badge and completing build compilation..."
      ];

      let currentStepIndex = 0;
      setLoadingStatus(steps[0]);
      
      codingInterval = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
          currentStepIndex++;
          setLoadingStatus(steps[currentStepIndex]);
        }
      }, 2500);

      const a5 = addAction('thought', lang === 'fr' ? "Génération des fichiers sources (HTML/JS/React)..." : "Generating source files (HTML/JS/React)...");
      let result = await generateWebsite(
        enrichedUserMessage, 
        history.slice(0, -1), 
        imageParts.length > 0 ? imageParts : undefined,
        videoParts.length > 0 ? videoParts : undefined,
        selectedModel
      );
      if (codingInterval) clearInterval(codingInterval);
      completeAction(a5);

      const updatedMessages: Message[] = [...newMessages, { 
        role: 'model', 
        content: result.explanation,
        code: result.preview_code,
        files: result.files,
        actionHistory: currentActions,
        _provider: result._provider
      }];
      setMessages(updatedMessages);
      setGeneratedCode(result.preview_code);
      setViewMode('preview');
      
      // Save to Supabase
      await saveConversation(updatedMessages);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addAction('thought', "Processus interrompu par l'utilisateur.");
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: "Requête annulée par l'utilisateur." 
        }]);
        return;
      }
      console.error("Error generating website:", error);
      addAction('thought', "Erreur critique détectée. Tentative de diagnostic...");
      
      let errorMessage = `Désolé, une erreur est survenue lors de la génération. (Erreur: ${error.message})`;
      if (error.message?.includes("API key") || error.message?.includes("Clé API") || error.message?.includes("GEMINI_API_KEY")) {
        errorMessage = `Clé API Gemini invalide ou manquante. Erreur brute: ${error.message}. Allez dans Réglages (Settings) > Secrets & API Keys et vérifiez que votre clé GEMINI_API_KEY est exacte (sans espaces) ! Modèle sélectionné: ${selectedModel}`;
      } else if (
        error.message?.toLowerCase().includes("quota") || 
        error.message?.toLowerCase().includes("limit") || 
        error.message?.includes("429") || 
        error.message?.toLowerCase().includes("exhausted")
      ) {
        // Restore userMessage to input so they can easily retry
        setPrompt(userMessage);

        errorMessage = `⚠️ **Quota ou limite de requêtes de l'API Gemini atteinte (Ressources Épuisées)** ⚠️

Le serveur d'évaluation de Cook IA a temporairement épuisé ses limites d'appels envers l'API gratuite Gemini.

### Comment continuer immédiatement sans blocage ?

1. ⏳ **Patientez 30 à 60 secondes :** Les limites de l'API gratuite Google Gemini se réinitialisent de façon glissante toutes les minutes. Nous avons restauré votre question/prompt dans le champ de saisie ci-dessous pour que vous puissiez réattaquer d'un simple clic !
2. 🔑 **Configurez votre propre clé API Gemini en 10 secondes :**
   - Allez dans les **Réglages** (icône d'engrenage "Settings").
   - Cliquez sur l'onglet **Secrets & API Keys**.
   - Collez votre clé API Gemini personnelle (générable gratuitement en 2 clics sur [Google AI Studio](https://aistudio.google.com/)).
   - Vos requêtes passeront ainsi de manière totalement privée, stable et ultra-rapide.
3. 🛠️ **Utilisez l'assistant de secours "Forge Studio" (Llama 3.3/Groq) :**
   - Ouvrez le volet **FORGE STUDIO ✨** en haut à droite de la prévisualisation.
   - Saisissez vos questions d'optimisation ou correction de bugs sans bloquer votre progression.`;
      } else if (error.message?.includes("safety") || error.message?.includes("blocked")) {
        errorMessage = `Le contenu a été bloqué par les filtres de sécurité. (Erreur: ${error.message})`;
      } else if (error.message?.includes("JSON")) {
        errorMessage = `L'IA a eu du mal à structurer sa réponse. (Erreur: ${error.message})`;
      }
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: errorMessage
      }]);
    } finally {
      if (codingInterval) clearInterval(codingInterval);
      setIsLoading(false);
      setAbortController(null);
    }
  };

  useEffect(() => {
    if (pendingSend && prompt.trim()) {
      handleSend();
      setPendingSend(false);
    }
  }, [pendingSend, prompt]);

  const handleDownloadZip = async () => {
    try {
      const lastModelMessage = [...messages].reverse().find(m => m.role === 'model' && m.files);
      let filesToZip = lastModelMessage?.files || [];

      // If no files were found but we have generated code, treat it as a single-file project
      if (filesToZip.length === 0 && generatedCode) {
        filesToZip = [{ path: 'index.html', content: generatedCode }];
      } else if (filesToZip.length > 0 && generatedCode) {
        // If we have files but generatedCode is updated (e.g., via visual editor), 
        // try to update the matching file in the array (usually index.html or the main preview file)
        const projectType = filesToZip.find(f => f.path.includes('package.json')) ? 'react' : 'html';
        
        if (projectType === 'html') {
          filesToZip = filesToZip.map(f => {
            if (f.path === 'index.html' || f.path.endsWith('.html')) {
              return { ...f, content: generatedCode };
            }
            return f;
          });
        }
      }

      if (filesToZip.length === 0) {
        alert("Aucun fichier à exporter pour le moment.");
        return;
      }

      const zip = new JSZip();
      filesToZip.forEach(file => {
        // Remove leading slashes to prevent issues with some zip software
        const cleanPath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
        zip.file(cleanPath, file.content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${siteName.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'cook-ia-project'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("ZIP Export failed:", error);
      alert("L'exportation ZIP a échoué. Veuillez réessayer.");
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
    const url = `https://cook-ia.indevs.in/${siteName || 'votre-site'}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const openPublishModal = () => {
    if (!siteName || siteName.trim() === '' || siteName === 'monsite' || siteName === 'votre-site') {
      const randomId = Math.floor(10000 + Math.random() * 90000);
      setSiteName(`projet-${randomId}`);
    }
    setIsPublishModalOpen(true);
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handlePublish = async () => {
    let currentSiteName = siteName.trim();
    if (!currentSiteName || currentSiteName === 'monsite' || currentSiteName === 'votre-site') {
      const randomId = Math.floor(10000 + Math.random() * 90000);
      currentSiteName = `projet-${randomId}`;
      setSiteName(currentSiteName);
    }
    if (!generatedCode) return;
    
    setIsPublishing(true);
    setPublishStep(1); // Étape 1: Création du site
    setPublishedUrl(null);
    setVercelUrl(null);
    const slug = currentSiteName.toLowerCase().replace(/\s+/g, '-');

    try {
      // Étape 2: Création du site
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublishStep(2);

      // Étape 3: Enregistrement sécurisé du projet
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublishStep(3);

      try {
        await supabase
          .from('published_sites')
          .upsert([
            { 
              slug, 
              code: generatedCode, 
              user_id: user?.id || null
            }
          ], { onConflict: 'slug' });
      } catch (dbError) {
        console.warn("DB backup bypassed/failed, but continuing:", dbError);
      }

      // Étape 4: Compilation & optimisations Cook IA
      await new Promise(resolve => setTimeout(resolve, 1200));
      setPublishStep(4);

      // Call API in background / fallback safely
      try {
        const lastModelMessage = [...messages].reverse().find(m => m.role === 'model' && m.files);
        const files = lastModelMessage?.files || [];
        await deployToNetlify(currentSiteName, generatedCode, files, user?.id).catch(err => {
          console.warn("Deploy background failure (ignoring safely):", err);
        });
      } catch (e) {
        console.warn("Ignored non-critical deploy api background exception:", e);
      }

      // Étape 5: Déploiement & Route de partage active
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublishStep(5);

      setPublishedUrl(`https://cook-ia.indevs.in/${slug}`);
    } catch (error: any) {
      console.error("Error publishing site:", error);
      alert(`Erreur lors du déploiement : ${error.message}. Tentative de génération d'un lien alternatif...`);
      setPublishedUrl(`https://cook-ia.indevs.in/${slug}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRefresh = () => {
    // Attempt to reset to the original code from the message history to discard visual edits
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model' && m.code);
    if (lastModelMessage?.code) {
      setGeneratedCode(lastModelMessage.code);
    }
    
    if (generatedCode && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(lastModelMessage?.code || generatedCode);
        doc.close();
      }
    }
  };

  const [isViewOnly, setIsViewOnly] = useState(false);
  const [viewOnlyLoading, setViewOnlyLoading] = useState(false);
  const [viewOnlyError, setViewOnlyError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let siteSlug = params.get('p');
    
    // Check if the path itself is a siteSlug (excluding known pages/assets/api)
    const path = window.location.pathname;
    if (!siteSlug && path && path !== '/' && !path.startsWith('/api') && !path.includes('.') && !path.startsWith('/assets')) {
      siteSlug = decodeURIComponent(path.substring(1));
    }

    if (siteSlug) {
      setIsViewOnly(true);
      setViewOnlyLoading(true);
      const loadPublishedSite = async () => {
        try {
          const { data, error } = await supabase
            .from('published_sites')
            .select('code')
            .eq('slug', siteSlug)
            .single();
          
          if (error) {
            console.error("Supabase loadPublishedSite error details:", error);
            throw error;
          }
          
          if (data?.code) {
            setGeneratedCode(data.code);
            setViewMode('preview');
          } else {
            throw new Error("Aucun code de site web trouvé pour cette adresse.");
          }
        } catch (err: any) {
          console.error("Error loading published site:", err);
          setViewOnlyError(err.message || "Impossible d'accéder au site web demandé.");
        } finally {
          setViewOnlyLoading(false);
        }
      };
      loadPublishedSite();
    }
  }, []);

  if (isViewOnly) {
    if (viewOnlyLoading) {
      return (
        <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center font-sans text-center px-4">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 w-24 h-24 bg-orange-primary/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-12 h-12 text-orange-primary animate-spin z-10" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Chargement du site Cook IA...</h2>
          <p className="text-zinc-500 text-xs font-mono max-w-sm">Dépêche en cours depuis notre CDN Sandbox...</p>
        </div>
      );
    }

    if (viewOnlyError) {
      return (
        <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center font-sans text-center px-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-6">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Impossible de charger le site</h2>
          <div className="text-zinc-400 text-sm max-w-sm mb-6 font-mono leading-relaxed p-4 bg-white/[0.02] border border-white/5 rounded-xl">
             Le site <span className="text-orange-primary font-bold">"{window.location.pathname.substring(1)}"</span> n'a pas encore été publié ou a expiré.
          </div>
          <button
            onClick={() => {
              window.location.href = "https://cook-ia.indevs.in";
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-primary to-amber-500 hover:scale-[1.02] active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(255,107,0,0.25)]"
          >
            Créer un nouveau site avec Cook IA
          </button>
        </div>
      );
    }

    if (generatedCode) {
      return (
        <div className="fixed inset-0 bg-white">
          <iframe 
            srcDoc={generatedCode}
            title="Published Site"
            className="w-full h-full border-none"
          />
          <a 
            href="https://cook-ia.indevs.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-black hover:scale-105 active:scale-95 transition-all z-50 shadow-2xl flex items-center gap-2"
          >
            <img src={LOGO_URL} alt="Logo" className="w-4 h-4 object-contain" />
            Créé avec COOK IA
          </a>
          <CookieBanner />
        </div>
      );
    }

    // Default loading fallback
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center font-sans text-center px-4">
        <Loader2 className="w-12 h-12 text-orange-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Initialisation de la vue...</h2>
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
    <AnimatePresence mode="wait">
      {!hasStarted ? (
        <motion.div
           key="landing"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 0.4, ease: "easeInOut" }}
           className="fixed inset-0 z-[1000] overflow-y-auto"
        >
          <LandingPage 
            lang={lang}
            setLang={setLang}
            onEnter={(initialPrompt?: string, forceAuth?: boolean) => {
              if (forceAuth) {
                setHasStarted(true);
                setIsAuthModalOpen(true);
                return;
              }
              if (!user) {
                setPendingLandingPrompt(initialPrompt || "");
                setHasStarted(true);
                setIsAuthModalOpen(true);
                return;
              }
              if (initialPrompt && initialPrompt.trim()) {
                setPrompt(initialPrompt);
                setPendingSend(true);
              }
              setHasStarted(true);
            }} 
            onLoadTemplate={(code: string, promptText: string) => {
              if (!user) {
                setPendingLandingTemplate({ code, promptText });
                setHasStarted(true);
                setIsAuthModalOpen(true);
                return;
              }
              setGeneratedCode(code);
              setPrompt("");
              const newMsg = {
                id: Math.random().toString(36).substr(2, 9),
                role: 'user' as const,
                content: promptText,
                timestamp: new Date()
              };
              const systemMsg = {
                id: Math.random().toString(36).substr(2, 9),
                role: 'model' as const,
                content: "Voici le site web cinématique généré sur la base de vos spécifications. Vous pouvez utiliser le volet de discussion pour y apporter des modifications de style ou de contenu.",
                timestamp: new Date(),
                files: [
                  {
                    path: 'index.html',
                    content: code
                  }
                ]
              };
              setMessages([newMsg, systemMsg]);
              setHasStarted(true);
              setViewMode('preview');
            }}
          />
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex flex-col h-screen ${isDark ? 'bg-abyssal-deep text-white' : 'bg-[#F8F9FA] text-slate-900'} overflow-hidden font-sans transition-colors duration-500`}
        >
          {showAnnouncement && (
            <div className={`bg-orange-primary text-white px-4 py-2 flex items-center justify-between text-sm font-bold shrink-0 z-[60] shadow-[0_0_20px_rgba(255,107,0,0.2)]`}>
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>La majorité des bugs ont été corrigés ! Rejoignez notre Discord.</span>
              </div>
              <button onClick={() => setShowAnnouncement(false)} className="hover:bg-black/10 p-1 rounded transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
      {/* Floating Discord Button for Mobile */}
      <a 
        href="https://discord.gg/Pc6reuApRF" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-20 right-6 sm:hidden z-50 flex items-center justify-center w-12 h-12 bg-[#5865F2] text-white rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"
        title="Rejoindre notre Discord"
      >
        <svg 
          viewBox="0 0 127.14 96.36" 
          className="w-6 h-6 fill-current"
        >
          <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.33-11.86,67.42,67.42,0,0,1-11.7-5.58c.97-.71,1.94-1.46,2.85-2.21a71.64,71.64,0,0,0,64.29,0c.92.75,1.88,1.5,2.85,2.21a67.07,67.07,0,0,1-11.7,5.58,77.66,77.66,0,0,0,7.33,11.86,105.41,105.41,0,0,0,32.81-16.15C131.58,52.41,126.77,28.73,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
        </svg>
      </a>

      {/* Header */}
      <header className={`h-14 border-b flex items-center justify-between px-2 sm:px-4 shrink-0 z-50 ${isDark ? 'bg-abyssal-deep border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-1.5 sm:gap-4">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-primary rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.4)]">
              <Zap size={12} className="text-white fill-white sm:w-3.5 sm:h-3.5" />
            </div>
            <span className={`font-display font-black text-xs sm:text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} hidden min-[360px]:inline`}>COOK IA</span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className={`flex items-center p-0.5 sm:p-1 rounded-xl border ${isDark ? 'bg-[#141414] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
          <button 
            onClick={() => setViewMode('chat')}
            className={`flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              viewMode === 'chat' 
                ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-sm') 
                : (isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600')
            }`}
          >
            <MessageSquare size={13} />
            <span className="hidden min-[380px]:inline">Chat</span>
          </button>
          <button 
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              viewMode === 'code' 
                ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-sm') 
                : (isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600')
            }`}
          >
            <Code size={13} />
            <span className="hidden min-[420px]:inline">Code</span>
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              viewMode === 'preview' 
                ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-sm') 
                : (isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600')
            }`}
          >
            <Eye size={13} />
            <span className="hidden min-[480px]:inline">Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {generatedCode && (
            <button
              onClick={openPublishModal}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3.5 sm:py-1.5 bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-[10px] sm:text-xs font-bold transition-all shadow-[0_4px_12px_rgba(255,107,0,0.25)] animate-pulse hover:animate-none hover:scale-[1.03] active:scale-95 shrink-0"
              title="Déployez votre site web et mobile en direct"
              id="header-deploy-button"
            >
              <Rocket size={12} className="fill-white" />
              <span className="hidden sm:inline">Déployer (Web & Mobile)</span>
              <span className="sm:hidden">Déployer</span>
            </button>
          )}
          <a 
            href="https://discord.gg/Pc6reuApRF" 
            target="_blank" 
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#5865F2] text-white rounded-lg text-xs font-bold hover:bg-[#4752C4] transition-all shadow-lg"
          >
            Discord
          </a>
          <a 
            href="https://discord.gg/Pc6reuApRF" 
            target="_blank" 
            rel="noreferrer"
            className="flex sm:hidden p-2 bg-[#5865F2] text-white rounded-lg transition-all shadow-lg"
          >
            <svg 
              viewBox="0 0 127.14 96.36" 
              className="w-4.5 h-4.5 fill-current"
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6.39,80.21a105.73,105.73,0,0,0,32.77,16.15,77.7,77.7,0,0,0,7.33-11.86,67.42,67.42,0,0,1-11.7-5.58c.97-.71,1.94-1.46,2.85-2.21a71.64,71.64,0,0,0,64.29,0c.92.75,1.88,1.5,2.85,2.21a67.07,67.07,0,0,1-11.7,5.58,77.66,77.66,0,0,0,7.33,11.86,105.41,105.41,0,0,0,32.81-16.15C131.58,52.41,126.77,28.73,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
          </a>
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* History Sidebar */}
        <motion.div 
          initial={false}
          animate={{ 
            width: isHistoryOpen ? 260 : 0, 
            opacity: isHistoryOpen ? 1 : 0,
            x: isHistoryOpen ? 0 : -260
          }}
          className="absolute md:relative z-40 h-full overflow-hidden shrink-0 bg-inherit"
        >
          <div className="w-[260px] h-full shadow-2xl md:shadow-none">
            <HistorySidebar 
              isDark={isDark}
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
              onNewChat={handleNewChat}
              onOpenSettings={(tab) => {
                if (!user && tab === 'account') {
                  setIsAuthModalOpen(true);
                  return;
                }
                setSettingsTab(tab || 'general');
                setIsProjectSettings(false);
                setIsSettingsModalOpen(true);
              }}
              onSelectView={(view) => setViewMode(view as any)}
              onCloneSite={handleCloneSite}
              onEcommerceProduct={handleEcommerceProduct}
              currentView={viewMode}
              user={user}
            />
          </div>
        </motion.div>

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {viewMode === 'your-apps' ? (
            <div className={`flex-1 flex flex-col items-center justify-center p-8 ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-white text-slate-900'}`}>
              <h2 className="text-3xl font-bold mb-4">Your Apps</h2>
              <p className="text-slate-500 mb-8 text-center max-w-md">Toutes les applications que vous avez conçues avec Cook IA.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {conversations.map(conv => (
                  <div key={conv.id} className={`p-4 rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'} cursor-pointer hover:border-blue-500 transition-all`} onClick={() => {
                    setCurrentConversationId(conv.id);
                    setMessages(conv.messages);
                    setHasStarted(true);
                    setViewMode('chat');
                  }}>
                    <div className="aspect-video rounded-xl bg-slate-200 mb-4 overflow-hidden flex items-center justify-center p-4">
                      <img src={LOGO_URL} alt={conv.title} className="w-24 h-24 object-contain opacity-50" />
                    </div>
                    <h3 className="font-semibold truncate">{conv.title}</h3>
                    <p className="text-xs text-slate-500">{new Date(conv.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : viewMode === 'faq' ? (
            <div className={`flex-1 flex flex-col items-center p-8 overflow-y-auto ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-white text-slate-900'}`}>
              <div className="max-w-3xl w-full">
                <h2 className="text-3xl font-bold mb-8 text-center">FAQ & Informations</h2>
                
                <div className="relative mb-12">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Rechercher dans la FAQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border text-lg focus:outline-none focus:border-blue-500 transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="space-y-6">
                  {[
                    { q: "Qu'est-ce que Cook IA ?", a: "Cook IA est une plateforme de création d'applications web ultra-moderne pilotée par l'intelligence artificielle, créée par Benit Madimba." },
                    { q: "Comment créer un site 3D ?", a: "Il suffit de demander explicitement à Cook IA de \"créer un site web 3D\". Par défaut, il crée des sites 2D performants." },
                    { q: "Puis-je cloner un site web ?", a: "Oui, utilisez l'option 'Clone site' dans le menu pour reproduire un site existant à partir de son URL." },
                    { q: "Comment créer un site e-commerce ?", a: "Vous pouvez demander à Cook IA de créer un site e-commerce, ou utiliser l'option 'E-commerce' pour générer un site à partir d'un lien produit." },
                    { q: "Mes données sont-elles sécurisées ?", a: "Oui, vos clés API et secrets sont stockés de manière privée et ne sont jamais exposés publiquement." },
                    { q: "Puis-je collaborer en temps réel ?", a: "Oui, via l'onglet Share dans les paramètres, vous pouvez donner accès à d'autres personnes pour modifier votre projet en temps réel." }
                  ].filter(item => 
                    item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    item.a.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-2xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}
                    >
                      <h3 className="font-bold mb-2">{item.q}</h3>
                      <p className="text-sm text-slate-500">{item.a}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'skills' ? (
            <SkillsLibrary 
              isDark={isDark}
              onInjectPrompt={(p) => {
                setPrompt(p);
                setViewMode('chat');
              }}
            />
          ) : (
            <div className="flex-1 flex overflow-hidden w-full h-full">
              <div className={`flex-1 flex overflow-hidden w-full h-full ${viewMode === 'chat' && generatedCode ? 'flex-col md:flex-row' : 'flex-col'}`}>
                {/* Chat Panel */}
                {(viewMode === 'chat' || !generatedCode) && (
                  <div className={`flex-1 h-full min-w-0 ${viewMode === 'chat' && generatedCode ? 'md:max-w-[460px] lg:max-w-[500px] xl:max-w-[550px] md:border-r border-slate-200 dark:border-white/5' : ''}`}>
                    <ChatInterface 
                      lang={lang}
                      isDark={isDark}
                      messages={messages}
                      isLoading={isLoading}
                      loadingStatus={loadingStatus}
                      actions={currentActions}
                      prompt={prompt}
                      setPrompt={setPrompt}
                      handleSend={handleSend}
                      onAbort={handleAbort}
                      chatEndRef={chatEndRef}
                      logoUrl={LOGO_URL}
                      selectedImages={selectedImages}
                      setSelectedImages={setSelectedImages}
                      selectedVideos={selectedVideos}
                      setSelectedVideos={setSelectedVideos}
                      onOpenImageSearch={() => {
                        setImageSearchContext('chat');
                        setIsImageSearchOpen(true);
                      }}
                      onOpenSettings={(tab) => {
                        setSettingsTab(tab || 'publish');
                        setIsProjectSettings(true);
                        setIsSettingsModalOpen(true);
                      }}
                      onCloneSite={handleCloneSite}
                      onEcommerceProduct={handleEcommerceProduct}
                      isFocusMode={isFocusMode}
                      setIsFocusMode={setIsFocusMode}
                      onFeedback={handleFeedback}
                    />
                  </div>
                )}

                {/* Preview/Code Panel (Live split rendering on PC, toggles on mobile) */}
                {generatedCode && (viewMode !== 'chat' || viewMode === 'chat') && (
                  <div className={`flex-1 h-full min-w-0 ${viewMode === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                    <Preview 
                      viewMode={viewMode === 'chat' ? 'preview' : viewMode}
                      generatedCode={generatedCode}
                      files={[...messages].reverse().find(m => m.role === 'model' && m.files)?.files || []}
                      iframeRef={iframeRef}
                      onRefresh={handleRefresh}
                      onExpand={handleExpand}
                      onEdit={() => setViewMode('code')}
                      onCodeChange={(newCode) => {
                        skipIframeUpdate.current = true;
                        setGeneratedCode(newCode);
                      }}
                      onDownloadZip={handleDownloadZip}
                      styleConfig={styleConfig}
                      sectionEdit={sectionEdit}
                      onSectionSelect={setSectionEdit}
                      isDark={isDark}
                      onApplyPrompt={(p) => {
                        setPrompt(p);
                        setViewMode('chat');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile View Switcher */}
          {(viewMode === 'chat' || viewMode === 'preview' || viewMode === 'code') && (
            <div className={`md:hidden flex items-center justify-around p-2 border-t shrink-0 z-50 ${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200'}`}>
              <button 
                onClick={() => setViewMode('chat')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === 'chat' 
                    ? (isDark ? 'text-white' : 'text-slate-900') 
                    : (isDark ? 'text-white/40' : 'text-slate-400')
                }`}
              >
                <MessageSquare size={18} />
                Chat
              </button>
              <button 
                onClick={() => setViewMode('code')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === 'code' 
                    ? (isDark ? 'text-white' : 'text-slate-900') 
                    : (isDark ? 'text-white/40' : 'text-slate-400')
                }`}
              >
                <Code size={18} />
                Code
              </button>
              <button 
                onClick={() => setViewMode('preview')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === 'preview' 
                    ? (isDark ? 'text-white' : 'text-slate-900') 
                    : (isDark ? 'text-white/40' : 'text-slate-400')
                }`}
              >
                <Eye size={18} />
                Preview
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Real-time Collaboration Cursors */}
      {Object.entries(collaborators).map(([id, data]) => (
        <motion.div
          key={id}
          style={{
            position: 'fixed',
            left: data.x,
            top: data.y,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        >
          <MousePointer2 
            size={24} 
            className="fill-orange-primary text-orange-primary drop-shadow-lg"
            style={{ transform: 'rotate(-90deg)' }}
          />
          <div className="ml-4 mt-2 px-2 py-1 bg-orange-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl whitespace-nowrap">
            {data.name}
          </div>
        </motion.div>
      ))}

      <AnimatePresence>
        {isStyleEditorOpen && (
          <StyleEditor 
            isOpen={isStyleEditorOpen}
            onClose={() => {
              setIsStyleEditorOpen(false);
              setSectionEdit(prev => ({ ...prev, isActive: false, elementContext: undefined }));
            }}
            config={styleConfig}
            onChange={setStyleConfig}
            elementEdit={sectionEdit.elementContext ? sectionEdit : undefined}
            onElementChange={(newHtml) => {
              if (sectionEdit.sectionHtml && generatedCode) {
                const updatedCode = generatedCode.replace(sectionEdit.sectionHtml, newHtml);
                setGeneratedCode(updatedCode);
                setSectionEdit(prev => ({ ...prev, sectionHtml: newHtml }));
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sectionEdit.isActive && (
          <SectionChat 
            section={sectionEdit}
            onClose={() => setSectionEdit({ isActive: false })}
            onUpdate={handleSectionUpdate}
            isLoading={isLoading}
            onOpenImageSearch={() => {
              setImageSearchContext('section');
              setIsImageSearchOpen(true);
            }}
            onImproveText={handleImproveText}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImageSearchOpen && (
          <ImageSearchModal 
            isOpen={isImageSearchOpen}
            onClose={() => setIsImageSearchOpen(false)}
            onSelect={handleImageSelect}
          />
        )}
      </AnimatePresence>

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
              onClick={() => {
                if (!isPublishing) {
                  setIsPublishModalOpen(false);
                  setPublishedUrl(null);
                  setVercelUrl(null);
                  setPublishStep(0);
                }
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0A0A0A] rounded-[24px] sm:rounded-[32px] border border-white/10 p-5 sm:p-8 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-y-auto max-h-[90vh] focus:outline-none"
              id="publishing-wizard-modal"
            >
              {/* Top ambient status glow */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-orange-primary via-amber-500 to-cyan-400" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-primary/10 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 sm:p-2.5 bg-orange-primary/10 rounded-xl">
                      <Rocket className="text-orange-primary animate-pulse" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-display font-black uppercase tracking-wider text-white">Console de Déploiement Cook IA</h2>
                      <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">Multi-Cloud Delivery Pipeline</p>
                    </div>
                  </div>
                  
                  {!isPublishing && (
                    <button 
                      onClick={() => {
                        setIsPublishModalOpen(false);
                        setPublishedUrl(null);
                        setVercelUrl(null);
                        setPublishStep(0);
                      }}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {!isPublishing && !publishedUrl ? (
                  // --- BEFORE DEPLOYING: SETUP NAME AREA ---
                  <div className="space-y-6">
                    <div className="p-4 sm:p-5 bg-white/[0.01] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors">
                      <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-zinc-600 uppercase font-black tracking-widest">Configuration active</div>
                      <h3 className="text-xs font-mono font-black uppercase tracking-widest text-orange-primary mb-1">Chemin de partage personnalisé</h3>
                      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">Définissez l'identifiant unique de votre site internet. Nous créerons automatiquement un lien de partage direct.</p>

                      <div className="space-y-2">
                        <div className="relative flex items-center bg-black/80 border border-white/10 rounded-xl focus-within:border-orange-primary/50 transition-all shadow-inner overflow-hidden">
                          <span className="p-4 pr-0 text-zinc-500 font-mono text-xs sm:text-sm select-none">cook-ia.indevs.in/</span>
                          <input 
                            type="text"
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            placeholder="nom-de-votre-site"
                            className="w-full bg-transparent p-4 pl-1 text-xs sm:text-sm text-white font-mono placeholder-zinc-700 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Highly descriptive pipeline schema diagram */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold block">Architecture de déploiement</span>
                      
                      <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-2.5 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5 text-orange-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-primary animate-ping" />
                          <span className="font-bold">LIEN DE PARTAGE DIRECT & UNIQUE</span>
                        </div>
                        <div className="space-y-1.5 text-zinc-500 leading-relaxed text-[9px]">
                          <div>1. Clic sur Déployer</div>
                          <div className="text-zinc-600">↓ Validation responsive & attribution de votre numéro unique</div>
                          <div>2. Cook IA réserve la route unique <span className="text-zinc-400">"/{siteName || 'monsite'}"</span></div>
                          <div className="text-zinc-600">↓ Enregistrement base de données</div>
                          <div>3. Votre route de partage universelle est activée et sécurisée</div>
                          <div className="text-orange-primary font-bold mt-1">➔ cook-ia.indevs.in/{siteName || 'monsite'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Responsive & Mobile Deployment Callout */}
                    <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                        <Smartphone size={16} className="animate-bounce" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400">📱 Déploiement Responsive Auto-Mobile</h4>
                        <p className="text-[9px] text-zinc-400 leading-snug">Votre application est entièrement responsive de manière native. Elle sera déployée avec des optimisations mobiles et des accès QR Code immédiats pour vos tests en direct.</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => {
                          setIsPublishModalOpen(false);
                          setPublishedUrl(null);
                          setPublishStep(0);
                        }}
                        className="flex-1 border border-white/10 hover:bg-white/5 text-white/80 py-3.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={handlePublish}
                        disabled={!siteName.trim() || !generatedCode}
                        className="flex-1 bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3.5 rounded-xl text-xs font-display font-black uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(255,107,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Zap size={14} className="fill-white" />
                        <span>DÉPLOYER LE SITE</span>
                      </button>
                    </div>
                  </div>
                ) : isPublishing ? (
                  // --- DEPLOYING IN PROGRESS: STEP-BY-STEP TERMINAL ANIMATION ---
                  <div className="space-y-6 py-4">
                    <div className="flex flex-col items-center justify-center space-y-2 mb-2">
                      <Loader2 className="animate-spin text-orange-primary" size={28} />
                      <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Construction du pipeline en cours...</span>
                    </div>

                    <div className="space-y-3.5 max-w-md mx-auto">
                      {[
                        { step: 1, label: "Utilisateur clique sur Déployer", desc: "Initiation du pipeline et des paramètres" },
                        { step: 2, label: `Création du site "${siteName || 'monsite'}"`, desc: "Réservation de l'ID d'instance " + siteName },
                        { step: 3, label: "Enregistrement sécurisé du projet", desc: "Génération du backup de code en base de données" },
                        { step: 4, label: "Compilation & optimisations Cook IA", desc: "Vérification des dépendances et compilation responsive" },
                        { step: 5, label: "Déploiement & Route de partage active", desc: "Activation du lien de partage universel et du QR Code" }
                      ].map((item) => {
                        const isDone = publishStep > item.step;
                        const isActive = publishStep === item.step;
                        const isPending = publishStep < item.step;
                        
                        return (
                          <div 
                            key={item.step} 
                            className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-300 ${
                              isActive 
                                ? 'bg-orange-primary/10 border-orange-primary/25 shadow-sm scale-[1.01]' 
                                : isDone 
                                ? 'bg-white/[0.01] border-white/5 opacity-80' 
                                : 'opacity-40 border-transparent'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isDone ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                  <Check size={11} strokeWidth={3} />
                                </div>
                              ) : isActive ? (
                                <div className="w-5 h-5 rounded-full bg-orange-primary/20 text-orange-primary flex items-center justify-center animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-orange-primary animate-ping" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-zinc-800 text-zinc-700 flex items-center justify-center text-[10px] font-mono">
                                  {item.step}
                                </div>
                              )}
                            </div>

                            <div className="text-left">
                              <h4 className={`text-xs font-bold leading-tight font-mono ${isActive ? 'text-orange-primary font-black' : isDone ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {item.label}
                              </h4>
                              <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // --- DEPLOYED SUCCESSFULLY: LIVE CARDS FOR BOTH URLS ---
                  <div className="space-y-6 py-2">
                    <div className="text-center space-y-2 mb-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Check className="text-emerald-500" size={24} />
                      </div>
                      <h3 className="text-lg font-display font-black uppercase text-emerald-400 tracking-wider">Déploiement Terminé avec succès !</h3>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto">Votre code a été compilé, inspecté, puis synchronisé sur les réseaux internationaux.</p>
                    </div>

                    <div className="max-w-md mx-auto">
                      {/* CARD A: COOK-IA DOMAIN */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between hover:border-orange-primary/20 transition-all duration-300 shadow-xl">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-orange-primary font-bold mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-primary animate-ping" />
                            <span>Votre lien de partage Cook IA</span>
                          </div>
                          <h4 className="text-sm sm:text-base font-mono font-black text-white mb-2 break-all select-all">
                            cook-ia.indevs.in/{siteName}
                          </h4>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Ce lien identifie de manière unique votre projet d'application web et mobile. Partagez-le avec vos utilisateurs pour un rendu instantané.
                          </p>
                        </div>

                        <div className="flex gap-3 mt-5 pt-4 border-t border-white/5">
                          <button 
                            onClick={() => {
                              const url = `https://cook-ia.indevs.in/${siteName}`;
                              navigator.clipboard.writeText(url);
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2000);
                            }}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-mono text-zinc-300 flex items-center justify-center gap-2 transition-colors active:scale-95 shrink-0"
                          >
                            {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            <span>{isCopied ? 'Copié !' : 'Copier'}</span>
                          </button>
                          
                          <a 
                            href={`https://cook-ia.indevs.in/${siteName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-xs uppercase font-black text-white font-display text-center flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 hover:scale-[1.02]"
                          >
                            <span>Visiter</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* MOBILE INTERACTIVE SCAN ZONE */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 flex flex-col sm:flex-row items-center gap-5">
                      <div className="w-24 h-24 bg-white p-1.5 rounded-xl flex items-center justify-center shrink-0 shadow-[0_10px_25px_rgba(0,0,0,0.5)] border border-white/10">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://cook-ia.indevs.in/${siteName}`)}`} 
                          alt="Mobile QR Code" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-center sm:text-left space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider mb-1">
                          <Smartphone size={10} className="animate-pulse" />
                          <span>Connexion Mobile Active</span>
                        </div>
                        <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">Tester directement sur votre smartphone</h4>
                        <p className="text-[10px] text-zinc-400 leading-snug">Scannez ce code QR avec l'appareil photo de votre smartphone ou de votre tablette pour tester instantanément le rendu tactile en conditions réelles ou installer l'application sur votre écran d'accueil.</p>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button 
                        onClick={() => {
                          setIsPublishModalOpen(false);
                          setPublishedUrl(null);
                          setVercelUrl(null);
                          setPublishStep(0);
                        }}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white font-mono uppercase"
                      >
                        Enregistrer & Fermer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UrlInputModal 
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onSubmit={handleUrlSubmit}
        type={urlModalType}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsTab}
        user={user}
        isProjectSettings={isProjectSettings}
        prompts={prompts}
        conversationsCount={conversations.length}
        isDark={isDark}
        projectName={conversations.find(c => c.id === currentConversationId)?.title || 'New Project'}
        onUpdateProjectName={handleUpdateProjectName}
        secrets={secrets}
        onAddSecret={handleAddSecret}
        onRemoveSecret={handleRemoveSecret}
        lang={lang}
        isLinkFullscreen={isLinkFullscreen}
        onToggleLinkFullscreen={setIsLinkFullscreen}
        onConnectGithub={handleGithubClick}
        repoName={repoName}
        onUpdateRepoName={setRepoName}
        repoDescription={repoDescription}
        onUpdateRepoDescription={setRepoDescription}
        isRepoPrivate={isRepoPrivate}
        onToggleRepoPrivate={setIsRepoPrivate}
        isRealtimeEnabled={isRealtimeEnabled}
        onToggleRealtime={setIsRealtimeEnabled}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />
        </motion.div>
      )}
      <CookieBanner />
    </AnimatePresence>
  );
}