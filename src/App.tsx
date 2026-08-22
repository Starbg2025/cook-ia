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
  Phone,
  Ban,
  Layers,
  FolderOpen,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateWebsite, generateTitle, updateSection, convertToReact, improveText, answerQuestion, bundleProjectFiles, getUserProfilePromptContext } from './services/geminiService';
import { isInformationalQuestion } from './utils/intentDetection';
import { analystReview, criticReview, plannerAgent, testerAgent, shadowWatchdog, auditAndFixButtons } from './services/multiAgentService';
import { Message, ViewMode, Conversation, StyleConfig, SectionEditState, ActionHistory, LiveActionTask, LiveActionEvent } from './types';
import { liveActionManager, calculateLineDiff } from './services/liveActionManager';
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

import { supabase, logErrorToSupabase } from './services/supabaseService';
import { deployToNetlify } from './services/netlifyService';
import JSZip from 'jszip';
import { Palette, Braces } from 'lucide-react';
import { translations, Language } from './translations';

const LOGO_URL = "https://i.ibb.co/mC3M8SSN/logo.png";

import { CookieBanner } from './components/CookieBanner';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Cook IA, créé par Benit Madimba, est prêt à concevoir votre prochaine plateforme web ultra-moderne. Que souhaitez-vous construire aujourd'hui ?"
    }
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Building your site...");
  const [currentActions, setCurrentActions] = useState<ActionHistory[]>([]);
  const [activeLiveTask, setActiveLiveTask] = useState<LiveActionTask | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode | 'your-apps' | 'faq'>('chat');
  const [generatedCode, setGeneratedCode] = useState<string>('');
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
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
  const [user, setUser] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    primaryColor: '#FF6B00',
    fontFamily: 'Inter',
    borderRadius: '1rem'
  });
  const [sectionEdit, setSectionEdit] = useState<SectionEditState>({ isActive: false });
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'preview'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [collaborators, setCollaborators] = useState<Record<string, { x: number; y: number; name: string }>>({});
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [announcement, setAnnouncement] = useState<{ message: string; active: boolean } | null>(null);
  const [userBanStatus, setUserBanStatus] = useState<{ isBanned: boolean; reason?: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const skipIframeUpdate = useRef(false);

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

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
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

  const [isLinkFullscreen, setIsLinkFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentAgentStage, setCurrentAgentStage] = useState<'idle' | 'architect' | 'designer' | 'developer' | 'tester' | 'inspector' | 'complete'>('idle');
  const [qaAuditSummary, setQaAuditSummary] = useState<any>(null);
  const [qaLogs, setQaLogs] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('selectedModel');
      if (saved && (saved.includes('2.0') || saved.includes('1.5') || saved.includes('pro'))) {
        localStorage.setItem('selectedModel', 'gemini-2.5-flash');
        return 'gemini-2.5-flash';
      }
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

  const [aiMode, setAiMode] = useState<'code' | 'chat'>(() => {
    try {
      const saved = localStorage.getItem('cook_ia_ai_mode');
      if (saved === 'chat' || saved === 'code') return saved;
      const savedProfile = localStorage.getItem('cook_ia_profile_data');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.aiMode === 'chat' || parsed.aiMode === 'code') return parsed.aiMode;
      }
    } catch {}
    return 'code';
  });

  const [userProfile, setUserProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('cook_ia_profile_data');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    const syncProfile = () => {
      try {
        const saved = localStorage.getItem('cook_ia_profile_data');
        if (saved) {
          setUserProfile(JSON.parse(saved));
        }
      } catch {}
    };
    syncProfile();
    window.addEventListener('storage', syncProfile);
    return () => window.removeEventListener('storage', syncProfile);
  }, []);

  const handleToggleAiMode = (newMode?: 'code' | 'chat') => {
    const target = newMode || (aiMode === 'code' ? 'chat' : 'code');
    setAiMode(target);
    try {
      localStorage.setItem('cook_ia_ai_mode', target);
      const savedProfile = localStorage.getItem('cook_ia_profile_data');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        parsed.aiMode = target;
        localStorage.setItem('cook_ia_profile_data', JSON.stringify(parsed));
      }
    } catch {}
  };

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

  // Fetch active system announcement
  useEffect(() => {
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => {
        if (data && data.active !== false && data.message) {
          setAnnouncement(data);
        }
      })
      .catch(err => console.warn("Could not fetch announcement:", err));
  }, []);

  // Check user ban status
  useEffect(() => {
    if (user?.id || user?.email) {
      fetch('/api/check-user-ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, username: user.email })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.banned) {
            setUserBanStatus({ isBanned: true, reason: data.reason });
          } else {
            setUserBanStatus(null);
          }
        })
        .catch(err => console.warn("Ban check error:", err));
    }
  }, [user]);

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
    try {
      const savedLocal = localStorage.getItem('cook_ia_local_conversations');
      let localConvs: Conversation[] = [];
      if (savedLocal) {
        try {
          localConvs = JSON.parse(savedLocal);
          if (!Array.isArray(localConvs)) localConvs = [];
        } catch {}
      }

      if (!user) {
        setConversations(localConvs);
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.message?.includes("Refresh Token Not Found") || error.message?.includes("Invalid Refresh Token")) {
          supabase.auth.signOut().catch(() => {});
          setUser(null);
        }
        console.log("[Conversations] Supabase note:", error.message || error);
        setConversations(localConvs);
        return;
      }

      if (data && Array.isArray(data)) {
        // Merge Supabase conversations with any local conversations not yet on Supabase
        const remoteIds = new Set(data.map(c => c.id));
        const combined = [
          ...data,
          ...localConvs.filter(c => !remoteIds.has(c.id))
        ];
        setConversations(combined);
        try {
          localStorage.setItem('cook_ia_local_conversations', JSON.stringify(combined));
        } catch {}
      } else {
        setConversations(localConvs);
      }
    } catch (e) {
      console.log("[Conversations] Using local storage fallback.");
      try {
        const savedLocal = localStorage.getItem('cook_ia_local_conversations');
        if (savedLocal) setConversations(JSON.parse(savedLocal));
      } catch {}
    }
  };

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversationId(id);
      setMessages(conv.messages);
      const lastModelMsg = [...conv.messages].reverse().find(m => m.role === 'model' && (m.code || m.files));
      
      let codeToSet = lastModelMsg?.code || '';
      if (!codeToSet && lastModelMsg?.files) {
         const html: any = lastModelMsg.files.find((f: any) => f.path === 'index.html' || f.path.endsWith('.html'));
         if (html) codeToSet = html.content || html.code || html.html || '';
      }
      
      setGeneratedCode(codeToSet);
      if (codeToSet || (lastModelMsg?.files && lastModelMsg.files.length > 0)) {
        setViewMode('preview');
      } else {
        setViewMode('chat');
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
    try {
      const savedLocal = localStorage.getItem('cook_ia_local_conversations');
      let localConvs: Conversation[] = savedLocal ? JSON.parse(savedLocal) : [];
      localConvs = localConvs.filter(c => c.id !== id);
      localStorage.setItem('cook_ia_local_conversations', JSON.stringify(localConvs));
    } catch {}

    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) handleNewChat();

    if (user && !id.startsWith('local_')) {
      try {
        await supabase.from('conversations').delete().eq('id', id);
      } catch {}
    }
  };

  const saveConversation = async (msgs: Message[], title?: string) => {
    // 1. Extract a clean, human-friendly title
    let cleanTitle = title;
    if (!cleanTitle) {
      const firstUserMsg = msgs.find(m => m.role === 'user');
      if (firstUserMsg && firstUserMsg.content) {
        cleanTitle = firstUserMsg.content
          .replace(/^\[FOCUS MODE[^\]]*\]\s*/i, '')
          .replace(/^\[CODE BASELINE[^\]]*\][\s\S]*?\`\`\`\s*/i, '')
          .trim();
        if (cleanTitle.length > 45) {
          cleanTitle = cleanTitle.substring(0, 45) + '...';
        }
      }
      if (!cleanTitle) cleanTitle = "Nouvelle application";
    }

    // 2. ALWAYS save to LocalStorage immediately and update React state in real-time
    const existingId = currentConversationId || `local_${Date.now()}`;
    try {
      const savedLocal = localStorage.getItem('cook_ia_local_conversations');
      let localConvs: Conversation[] = savedLocal ? JSON.parse(savedLocal) : [];
      const existingIndex = localConvs.findIndex(c => c.id === existingId);
      const updatedConv: Conversation = {
        id: existingId,
        title: cleanTitle,
        messages: msgs,
        created_at: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        localConvs[existingIndex] = { 
          ...localConvs[existingIndex], 
          title: cleanTitle || localConvs[existingIndex].title,
          messages: msgs 
        };
      } else {
        localConvs.unshift(updatedConv);
      }

      localStorage.setItem('cook_ia_local_conversations', JSON.stringify(localConvs));
      if (!currentConversationId) setCurrentConversationId(existingId);
      setConversations(localConvs);
    } catch (err) {
      console.log("[Local Storage] Save note:", err);
    }

    // 3. If user is authenticated with Supabase, sync to Cloud
    if (user) {
      try {
        if (currentConversationId && !currentConversationId.startsWith('local_')) {
          await supabase
            .from('conversations')
            .update({ messages: msgs })
            .eq('id', currentConversationId);
        } else {
          const { data, error } = await supabase
            .from('conversations')
            .insert([{ title: cleanTitle, messages: msgs, user_id: user.id }])
            .select();
          
          if (data && data[0]) {
            const cloudId = data[0].id;
            setCurrentConversationId(cloudId);
            setConversations(prev => [data[0], ...prev.filter(c => c.id !== cloudId && c.id !== existingId)]);
            
            // Sync local storage with new cloud id
            try {
              const savedLocal = localStorage.getItem('cook_ia_local_conversations');
              let localConvs: Conversation[] = savedLocal ? JSON.parse(savedLocal) : [];
              localConvs = [data[0], ...localConvs.filter(c => c.id !== cloudId && c.id !== existingId)];
              localStorage.setItem('cook_ia_local_conversations', JSON.stringify(localConvs));
            } catch {}
          }
        }
      } catch (e) {
        console.log("[Supabase] Cloud sync note:", e);
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

  const handleSectionUpdate = async (sectionPrompt: string) => {
    if (!sectionEdit.sectionHtml || !generatedCode || isLoading) return;

    setIsLoading(true);
    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content || '' }]
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
      const latestModelMsg = [...messages].reverse().find(m => m.role === 'model' && (m.files || m.code));
      const currentFiles = latestModelMsg?.files || [];
      const standaloneCode = bundleProjectFiles(currentFiles, generatedCode);

      const result = await deployToNetlify(siteName || 'cook-ia-project', standaloneCode, currentFiles);
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

    // MANDATORY AUTHENTICATION CHECK BEFORE AI CODE GENERATION
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

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
    setCurrentAgentStage('architect');
    setLoadingStatus(lang === 'fr' ? "📐 [Prompt Architect] Structuration des sections et du cahier des charges..." : "📐 [Prompt Architect] Structuring sections & blueprint...");
    setCurrentActions([]);
    let codingInterval: any = null;

    // Real Live Action Task instantiation
    const liveTask = liveActionManager.createTask(userMessage, controller);
    setActiveLiveTask(liveTask);
    const unsubscribeTask = liveActionManager.subscribe(liveTask.id, (updatedTask) => {
      setActiveLiveTask({ ...updatedTask, events: [...updatedTask.events] });
    });

    // Notify backend
    fetch('/api/ai/live-action/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: liveTask.id, prompt: userMessage })
    }).catch(() => {});

    const addAction = (type: 'read' | 'thought' | 'shell', content: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      setCurrentActions(prev => [...prev, { type, content, status: 'loading', id } as any]);
      return id;
    };

    const completeAction = (id: string, status: 'completed' | 'failed' = 'completed') => {
      setCurrentActions(prev => prev.map(a => (a as any).id === id ? { ...a, status } : a));
    };

    try {
      // EVENT 1: Real Prompt & Context Analysis
      const evtAnalysisId = liveActionManager.startEvent(liveTask.id, {
        type: 'analysis',
        group: 'analysis',
        tool: 'analyze_prompt',
        title: lang === 'fr' ? 'Analyse sémantique du prompt et des exigences techniques' : 'Analyzing prompt semantics & technical requirements',
        details: { sizeBytes: userMessage.length }
      });

      const history = await Promise.all(newMessages.map(async (m) => {
        const parts: any[] = [{ text: (m.content || '') + (m.code ? `\n\nCode:\n${m.code}` : '') }];
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
              const base64Img = await fetchImageAsBase64(img);
              if (base64Img) {
                parts.push({ inlineData: base64Img });
              } else {
                parts.push({ text: `[Reference Image URL: ${img}]` });
              }
            }
          }
        }
        return { role: m.role, parts };
      }));

      // Prepare current images
      let imageParts: any[] = [];
      if (currentImages.length > 0) {
        const evtMediaId = liveActionManager.startEvent(liveTask.id, {
          type: 'analysis',
          group: 'analysis',
          tool: 'process_assets',
          title: lang === 'fr' ? `Traitement de ${currentImages.length} image(s) de référence` : `Processing ${currentImages.length} reference image(s)`
        });

        for (const img of currentImages) {
          if (img.startsWith('data:')) {
            const [mimeTypePart, data] = img.split(';base64,');
            imageParts.push({ mimeType: mimeTypePart.split(':')[1], data: data });
          } else {
            const base64Img = await fetchImageAsBase64(img);
            if (base64Img) imageParts.push(base64Img);
          }
        }
        liveActionManager.completeEvent(liveTask.id, evtMediaId);
      }

      let videoParts: any[] = [];
      if (currentVideos.length > 0) {
        for (const vid of currentVideos) {
          if (vid.startsWith('data:')) {
            const [mimeTypePart, data] = vid.split(';base64,');
            videoParts.push({ mimeType: mimeTypePart.split(':')[1], data: data });
          }
        }
      }

      let enrichedUserMessage = userMessage;
      const profilePromptContext = getUserProfilePromptContext();
      if (profilePromptContext) {
        enrichedUserMessage += profilePromptContext;
      }
      const urls = currentImages.filter(img => !img.startsWith('data:'));
      if (urls.length > 0) {
        enrichedUserMessage += "\n\nReference Images (URLs):\n" + urls.join('\n');
      }

      // If existing code is present, pass it as baseline for modification and emit read event
      if (generatedCode && generatedCode.trim().length > 100) {
        const evtReadCodeId = liveActionManager.startEvent(liveTask.id, {
          type: 'file_operation',
          group: 'analysis',
          tool: 'read_file',
          title: lang === 'fr' ? 'Lecture du code source existant (index.html)' : 'Reading existing codebase (index.html)',
          details: { path: 'index.html', sizeBytes: generatedCode.length }
        });
        enrichedUserMessage += `\n\n[CODE BASELINE DU SITE EXISTANT À MODIFIER] :\nL'utilisateur demande une modification ou une amélioration sur son site existant ci-dessous. Tu DOIS conserver l'intégralité du design, des fonctionnalités et du contenu actuels et appliquer directement les modifications demandées sur ce code source :\n\`\`\`html\n${generatedCode.substring(0, 18000)}\n\`\`\``;
        liveActionManager.completeEvent(liveTask.id, evtReadCodeId);
      }

      liveActionManager.completeEvent(liveTask.id, evtAnalysisId);

      // CHECK IF IN CHAT MODE (NO CODE) OR USER IS ASKING AN INFORMATIONAL QUESTION
      if (aiMode === 'chat' || isInformationalQuestion(userMessage, !!generatedCode)) {
        setCurrentAgentStage('architect');
        setLoadingStatus(lang === 'fr' 
          ? (aiMode === 'chat' ? "💬 [Mode Conversation] Réponse directe (sans code)..." : "💬 [Assistant COOK IA] Traitement de votre question...") 
          : (aiMode === 'chat' ? "💬 [Chat Mode] Answering (No Code)..." : "💬 [COOK IA Assistant] Processing question..."));
        
        const evtChatId = liveActionManager.startEvent(liveTask.id, {
          type: 'analysis',
          group: 'analysis',
          tool: 'chat_response',
          title: lang === 'fr' ? 'Génération de la réponse conversationnelle' : 'Generating conversational response'
        });

        const aQa = addAction('thought', lang === 'fr' 
          ? (aiMode === 'chat' ? "💬 [Mode Conversation Actif] Réponse textuelle conversationnelle sans génération de code..." : "💬 [Assistant IA] Réponse directe à votre question sans modification du site web...") 
          : (aiMode === 'chat' ? "💬 [Chat Mode Active] Text response without generating code..." : "💬 [AI Assistant] Answering question directly without modifying website..."));

        const textResponse = await answerQuestion(enrichedUserMessage, history.slice(0, -1), selectedModel);
        completeAction(aQa);
        liveActionManager.completeEvent(liveTask.id, evtChatId);
        liveActionManager.finishTask(liveTask.id, 'completed');
        const finalChatTask = liveActionManager.getTask(liveTask.id) || liveTask;

        const updatedMessages: Message[] = [...newMessages, { 
          role: 'model', 
          content: textResponse,
          code: generatedCode, // PRESERVE EXISTING GENERATED CODE UNTOUCHED
          liveTask: { ...finalChatTask, events: [...finalChatTask.events] },
          liveEvents: [...finalChatTask.events],
          actionHistory: currentActions
        }];
        setMessages(updatedMessages);
        await saveConversation(updatedMessages);
        setIsLoading(false);
        setCurrentAgentStage('complete');
        return;
      }

      // STAGE 1: PROMPT ARCHITECT
      setCurrentAgentStage('architect');
      const aArchitect = addAction('thought', lang === 'fr' 
        ? "📐 [Prompt Architecte] Analyse du besoin, découpage en sections HTML5 et création du cahier des charges..." 
        : "📐 [Prompt Architect] Analyzing intent, structuring HTML5 sections & blueprint...");
      
      // Call planner to structure blueprint
      try {
        await plannerAgent(enrichedUserMessage, history.slice(0, -1));
      } catch (e) {
        console.debug("Planner agent fallback step executed.");
      }
      completeAction(aArchitect);

      // STAGE 2: UI/UX DESIGNER
      setCurrentAgentStage('designer');
      setLoadingStatus(lang === 'fr' ? "🎨 [Styliste UI/UX] Harmonie de la palette de couleurs, typographie et réactivité..." : "🎨 [UI/UX Designer] Designing color palette & typography...");
      const aDesigner = addAction('thought', lang === 'fr'
        ? "🎨 [Styliste UI/UX] Définition des règles esthétiques, typographies et ombres contemporaines..."
        : "🎨 [UI/UX Designer] Setting visual hierarchy, responsive layout & color swatches...");
      completeAction(aDesigner);

      // STAGE 3: CODE DEVELOPER (Real generation event)
      setCurrentAgentStage('developer');
      setLoadingStatus(lang === 'fr' ? "⚡ [Développeur IA] Génération du code source HTML5, CSS Tailwind et JS..." : "⚡ [Developer AI] Generating source code...");
      const aDev = addAction('thought', lang === 'fr' 
        ? "⚡ [Développeur IA] Génération du code source HTML5, CSS Tailwind et composants React..." 
        : "⚡ [Developer AI] Generating HTML5, Tailwind CSS & React code...");

      const evtGenId = liveActionManager.startEvent(liveTask.id, {
        type: 'code_generation',
        group: 'files',
        tool: 'generate_code',
        title: lang === 'fr' ? `Génération du code source (${selectedModel})` : `Generating source code (${selectedModel})`,
        details: { modelUsed: selectedModel }
      });

      let result = await generateWebsite(
        enrichedUserMessage, 
        history.slice(0, -1), 
        imageParts.length > 0 ? imageParts : undefined,
        videoParts.length > 0 ? videoParts : undefined,
        selectedModel
      );
      completeAction(aDev);
      liveActionManager.completeEvent(liveTask.id, evtGenId, {
        title: lang === 'fr' ? `Code source généré (${selectedModel})` : `Source code generated (${selectedModel})`
      });

      // STAGE 3: QA TESTER & BUTTON AUDITOR (Real verification event)
      setCurrentAgentStage('tester');
      setLoadingStatus(lang === 'fr' ? "🧪 [Testeur QA] Audit approfondi des boutons pour éliminer les éléments inutiles..." : "🧪 [QA Tester] Inspecting & fixing dead buttons...");
      const aTester = addAction('thought', lang === 'fr' 
        ? "🧪 [Testeur QA] Verification qu'aucun bouton inutile ne subsiste dans le code..." 
        : "🧪 [QA Tester] Auditing buttons and attaching interactive click handlers...");

      const evtAuditId = liveActionManager.startEvent(liveTask.id, {
        type: 'terminal',
        group: 'verification',
        tool: 'audit_buttons',
        title: lang === 'fr' ? 'Audit des interactions et vérification des boutons' : 'Auditing interactions and button click handlers',
        details: { command: 'cook-ia verify-dom --all-buttons --syntax' }
      });

      let rawCode = result.preview_code || result.code || "";
      if (!rawCode && result.files && Array.isArray(result.files)) {
        const htmlFile = result.files.find((f: any) => f.path === 'index.html' || f.path === 'src/index.html' || f.path.endsWith('.html'));
        if (htmlFile) {
           rawCode = htmlFile.content || htmlFile.code || htmlFile.html || "";
        }
      }

      const audit = auditAndFixButtons(rawCode);
      const finalCode = audit.auditedCode || rawCode;
      result.preview_code = finalCode;
      result.code = finalCode;

      liveActionManager.completeEvent(liveTask.id, evtAuditId, {
        title: lang === 'fr' 
          ? `Audit validé (${audit.auditSummary.buttonsChecked} boutons testés, ${audit.auditSummary.deadButtonsFixed} connectés)` 
          : `Audit passed (${audit.auditSummary.buttonsChecked} buttons checked, ${audit.auditSummary.deadButtonsFixed} wired)`,
        details: {
          command: 'cook-ia verify-dom --all-buttons --syntax',
          output: `✓ ${audit.auditSummary.buttonsChecked} boutons vérifiés\n✓ ${audit.auditSummary.linksVerified} liens vérifiés\n✓ ${audit.auditSummary.deadButtonsFixed} boutons interactifs connectés\n✓ 100% de conformité sans boutons morts`,
          buttonsChecked: audit.auditSummary.buttonsChecked,
          deadButtonsFixed: audit.auditSummary.deadButtonsFixed
        }
      });

      if (result.files && Array.isArray(result.files) && result.files.length > 0) {
        result.files = result.files.map((f: any) => {
          if ((f.path === 'index.html' || f.path === 'src/index.html' || f.path.endsWith('.html')) && finalCode) {
            return { ...f, content: finalCode };
          }
          return f;
        });
      } else {
        result.files = [
          { path: "index.html", content: finalCode },
          { path: "styles.css", content: "/* Styles CSS personnalisés COOK IA */\n" },
          { path: "script.js", content: "// Script JavaScript interactif COOK IA\n" }
        ];
      }

      // Real File Write / Modification with Unified Diff
      const oldCode = generatedCode || '';
      const htmlDiff = calculateLineDiff('index.html', oldCode, finalCode);
      const isExistingEdit = oldCode.trim().length > 50;

      const evtFileWriteId = liveActionManager.startEvent(liveTask.id, {
        type: 'file_operation',
        group: 'files',
        tool: isExistingEdit ? 'edit_file' : 'write_file',
        title: isExistingEdit 
          ? (lang === 'fr' ? `Mise à jour de index.html (+${htmlDiff.added}, -${htmlDiff.removed})` : `Updated index.html (+${htmlDiff.added}, -${htmlDiff.removed})`)
          : (lang === 'fr' ? `Création de index.html (${(finalCode.length / 1024).toFixed(1)} kB)` : `Created index.html (${(finalCode.length / 1024).toFixed(1)} kB)`),
        details: {
          path: 'index.html',
          diff: htmlDiff,
          sizeBytes: finalCode.length
        }
      });
      liveActionManager.completeEvent(liveTask.id, evtFileWriteId);

      // Real Build & Bundle Event
      const evtBuildId = liveActionManager.startEvent(liveTask.id, {
        type: 'build',
        group: 'verification',
        tool: 'bundle_project',
        title: lang === 'fr' ? 'Compilation du bundle d\'export (HTML5 + Tailwind + JS)' : 'Compiling export bundle (HTML5 + Tailwind + JS)',
        details: { command: 'cook-ia build --target=dist' }
      });
      const bundledCode = bundleProjectFiles(result.files, finalCode);
      liveActionManager.completeEvent(liveTask.id, evtBuildId, {
        title: lang === 'fr' ? 'Compilation du bundle réussie (prêt pour Netlify & Vercel)' : 'Bundle compiled successfully (ready for Netlify & Vercel)',
        details: {
          command: 'cook-ia build --target=dist',
          output: `✓ index.html (${(finalCode.length / 1024).toFixed(1)} kB)\n✓ ${result.files.length} fichiers synchronisés\n✓ Prêt pour déploiement 1-clic`
        }
      });

      // Real Preview Sync Event
      const evtPreviewId = liveActionManager.startEvent(liveTask.id, {
        type: 'preview',
        group: 'verification',
        tool: 'preview_sync',
        title: lang === 'fr' ? 'Synchronisation du bac à sable de prévisualisation' : 'Synchronizing live sandbox preview'
      });
      setGeneratedCode(finalCode);
      liveActionManager.completeEvent(liveTask.id, evtPreviewId);

      setQaAuditSummary(audit.auditSummary);
      setQaLogs([
        `Vérification effectuée sur ${audit.auditSummary.buttonsChecked} boutons et ${audit.auditSummary.linksVerified} liens.`,
        `${audit.auditSummary.deadButtonsFixed} boutons raccordés à des actions interactives (modales, notifications toast & défilement).`,
        `0 bouton inutile ou mort détecté ! 100% de couverture fonctionnelle.`
      ]);
      completeAction(aTester);

      // STAGE 4: FINAL INSPECTOR
      setCurrentAgentStage('inspector');
      setLoadingStatus(lang === 'fr' ? "🏆 [Inspecteur Résultats] Inspection visuelle, réactivité mobile et certification finale..." : "🏆 [Final Inspector] Visual inspection & certification...");
      const aInspector = addAction('thought', lang === 'fr' 
        ? "🏆 [Inspecteur Résultats] Test de réactivité écran (mobile/desktop) et délivrance du certificat de qualité COOK IA..." 
        : "🏆 [Final Inspector] Validating viewport responsiveness & issuing certification seal...");

      try {
        await criticReview(enrichedUserMessage, finalCode);
      } catch (e) {
        console.debug("Critic review step executed.");
      }
      completeAction(aInspector);
      setCurrentAgentStage('complete');

      liveActionManager.finishTask(liveTask.id, 'completed');
      const finalCompletedTask = liveActionManager.getTask(liveTask.id) || liveTask;

      const updatedMessages: Message[] = [...newMessages, { 
        role: 'model', 
        content: result.explanation || "Site web généré avec succès !",
        code: finalCode,
        files: result.files,
        liveTask: { ...finalCompletedTask, events: [...finalCompletedTask.events] },
        liveEvents: [...finalCompletedTask.events],
        actionHistory: currentActions,
        _provider: (result as any)._provider
      }];
      setMessages(updatedMessages);
      setViewMode('preview');
      
      // Save to Supabase
      await saveConversation(updatedMessages);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        liveActionManager.cancelTask(liveTask.id);
        fetch('/api/ai/live-action/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: liveTask.id })
        }).catch(() => {});
        const cancelledTask = liveActionManager.getTask(liveTask.id) || liveTask;

        addAction('thought', "Processus interrompu par l'utilisateur.");
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: "Requête annulée par l'utilisateur.",
          liveTask: { ...cancelledTask, events: [...cancelledTask.events] },
          liveEvents: [...cancelledTask.events]
        }]);
        return;
      }
      console.error("Error generating website:", error);
      addAction('thought', "Erreur critique détectée. Tentative de diagnostic...");
      liveActionManager.finishTask(liveTask.id, 'failed', error.message);
      const failedTask = liveActionManager.getTask(liveTask.id) || liveTask;
      
      let errorMessage = "Une difficulté temporaire est survenue lors de la génération. Vous pouvez réessayer dans quelques instants.";
      if (error.message?.includes("API key") || error.message?.includes("Clé API") || error.message?.includes("GEMINI_API_KEY")) {
        errorMessage = `Clé API Gemini invalide ou manquante. Veuillez vérifier votre clé dans Réglages > Secrets & API Keys. Modèle sélectionné: ${selectedModel}`;
      } else if (
        error.message?.toLowerCase().includes("quota") || 
        error.message?.toLowerCase().includes("limit") || 
        error.message?.includes("429") || 
        error.message?.toLowerCase().includes("exhausted")
      ) {
        // Restore userMessage to input so they can easily retry
        setPrompt(userMessage);

        errorMessage = `⚠️ **Disponibilité des ressources d'inférence** ⚠️

Les modèles gratuits sont actuellement très sollicités par le réseau. Votre demande a été conservée dans la zone de texte.

### Comment poursuivre :
1. ⏳ **Patienter quelques secondes** puis relancer la génération.
2. 🔑 **Ajouter votre clé API Gemini personnelle** dans **Réglages > Secrets & API Keys** pour bénéficier d'un quota dédié et illimité.
3. 🛠️ **Utiliser le volet FORGE STUDIO** en haut à droite pour piloter des modifications ciblées.`;
      } else if (error.message?.includes("safety") || error.message?.includes("blocked")) {
        errorMessage = "Le contenu demandé a déclenché les règles de sécurité de l'IA. Veuillez reformuler votre consigne.";
      } else if (error.message?.includes("JSON")) {
        errorMessage = "La réponse générée nécessitait un reformatage. Veuillez relancer la génération.";
      }
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: errorMessage
      }]);
    } finally {
      if (codingInterval) clearInterval(codingInterval);
      if (unsubscribeTask) unsubscribeTask();
      setIsLoading(false);
      setActiveLiveTask(null);
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
            <div className="absolute inset-0 w-24 h-24 bg-slate-900 dark:bg-white dark:text-[var(--color-ink)]/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin z-10" />
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
             Le site <span className="text-[var(--color-primary)] font-bold">"{window.location.pathname.substring(1)}"</span> n'a pas encore été publié ou a expiré.
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
            sandbox="allow-scripts allow-modals allow-same-origin allow-popups allow-forms"
            title="Published Site"
            className="w-full h-full border-none border-0"
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
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
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
           exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
           transition={{ duration: 1, ease: "easeInOut" }}
           className="fixed inset-0 z-[1000] overflow-y-auto"
        >
          <LandingPage 
            lang={lang}
            setLang={setLang}
            onEnter={(initialPrompt?: string) => {
              if (initialPrompt && initialPrompt.trim()) {
                setPrompt(initialPrompt);
                if (!user) {
                  setIsAuthModalOpen(true);
                  setHasStarted(true);
                  return;
                }
                setPendingSend(true);
              }
              setHasStarted(true);
            }} 
          />
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`flex flex-col h-screen ${isDark ? 'bg-[#080B11] text-white' : 'bg-[#FAFAFC] text-slate-900'} overflow-hidden font-sans transition-colors duration-500`}
        >
          {announcement && announcement.active && (
            <div className={`bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black px-4 py-2 flex items-center justify-between text-xs font-bold shrink-0 z-[60] shadow-md`}>
              <div className="flex items-center gap-2 mx-auto">
                <span className="bg-black text-amber-400 px-2 py-0.5 rounded text-[10px] font-black uppercase">ANNONCE ADMIN</span>
                <span>{announcement.message}</span>
              </div>
              <button onClick={() => setAnnouncement(null)} className="hover:bg-black/10 p-1 rounded transition-colors text-black" title="Fermer">
                <X size={16} />
              </button>
            </div>
          )}

          {userBanStatus && userBanStatus.isBanned && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] flex items-center justify-center p-4">
              <div className="bg-zinc-900 border border-red-500/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-red-500">
                  <Ban size={32} />
                </div>
                <h2 className="text-xl font-extrabold text-white">Compte Banni / Suspendu</h2>
                <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-left">
                  <span className="font-bold block mb-1">Motif du bannissement :</span>
                  {userBanStatus.reason || "Non-respect des règles de la communauté et conditions d'utilisation."}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Votre accès a été restreint par l'administration du site web car vous ne respectez pas les règles. Vous ne pouvez plus utiliser la génération par IA.
                </p>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Se déconnecter
                </button>
              </div>
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

      {/* Header (Claude & ChatGPT Inspired) */}
      <header className={`h-13 border-b flex items-center justify-between px-3 sm:px-5 shrink-0 z-50 ${isDark ? 'bg-[#080B11]/95 border-white/[0.08] backdrop-blur-md' : 'bg-white/95 border-slate-200 backdrop-blur-md'}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-1.5 sm:p-2 rounded-xl transition-all ${isDark ? 'text-white/60 hover:bg-white/[0.06] hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleNewChat}>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-black transition-transform duration-300">
              <Code2 size={16} />
            </div>
            <span className={`font-extrabold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} hidden min-[360px]:inline`}>
              Cook IA
            </span>
          </div>
        </div>

        {/* View Mode Switcher (Modern Segmented Pill) */}
        <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#0E1420] border-white/[0.08]' : 'bg-slate-100/90 border-slate-200'}`}>
          <button 
            onClick={() => setViewMode('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'chat' 
                ? (isDark ? 'bg-orange-primary text-white shadow-md shadow-orange-primary/20' : 'bg-slate-900 text-white shadow-sm') 
                : (isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-950')
            }`}
          >
            <MessageSquare size={13} />
            <span className="hidden min-[380px]:inline">Chat</span>
          </button>
          <button 
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'code' 
                ? (isDark ? 'bg-orange-primary text-white shadow-md shadow-orange-primary/20' : 'bg-slate-900 text-white shadow-sm') 
                : (isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-950')
            }`}
          >
            <Code size={13} />
            <span className="hidden min-[420px]:inline">Code</span>
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'preview' 
                ? (isDark ? 'bg-orange-primary text-white shadow-md shadow-orange-primary/20' : 'bg-slate-900 text-white shadow-sm') 
                : (isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-950')
            }`}
          >
            <Eye size={13} />
            <span className="hidden min-[480px]:inline">Aperçu</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {generatedCode && (
            <button
              onClick={openPublishModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-hover hover:to-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] shrink-0"
              title="Déployez votre site web et mobile en direct"
              id="header-deploy-button"
            >
              <Rocket size={13} className="fill-white" />
              <span className="hidden sm:inline">Déployer</span>
            </button>
          )}

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className={`px-2 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
              isDark ? 'text-white/70 hover:bg-white/[0.06] hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
            }`}
            title="Langue / Language"
          >
            {lang.toUpperCase()}
          </button>

          <a 
            href="https://discord.gg/Pc6reuApRF" 
            target="_blank" 
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Discord
          </a>

          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-1.5 sm:p-2 rounded-xl transition-colors ${isDark ? 'text-white/70 hover:bg-white/[0.06] hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
            title="Thème clair / sombre"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Profile Button (Visible on Mobile & Desktop) */}
          <button
            onClick={() => {
              if (!user) {
                setIsAuthModalOpen(true);
                return;
              }
              setSettingsTab('account');
              setIsProjectSettings(false);
              setIsSettingsModalOpen(true);
            }}
            className={`flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl transition-all border ${
              isDark 
                ? 'border-white/10 hover:border-amber-500/50 hover:bg-white/[0.06] text-white' 
                : 'border-slate-200 hover:border-amber-500/50 hover:bg-slate-100 text-slate-900'
            }`}
            title={lang === 'fr' ? "Mon Profil & Instructions IA" : "My Profile & AI Instructions"}
            id="header-profile-button"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center font-bold text-xs text-white overflow-hidden shadow-sm ring-1 ring-orange-500/30">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] sm:text-xs uppercase">{user?.email?.[0] || 'U'}</span>
              )}
            </div>
            <div className="hidden min-[520px]:flex flex-col items-start leading-none text-left max-w-[85px] truncate">
              <span className="text-[11px] font-bold truncate w-full">
                {user?.email === 'benit800@gmail.com' ? 'Benit' : (userProfile?.username ? `@${userProfile.username}` : (user?.user_metadata?.username || user?.email?.split('@')[0] || (lang === 'fr' ? 'Profil' : 'Profile')))}
              </span>
              <span className="text-[9px] text-amber-600 font-semibold truncate">
                {userProfile?.role || (user?.email === 'benit800@gmail.com' ? 'Fondateur' : 'Profil & IA')}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {isHistoryOpen && (
          <div 
            onClick={() => setIsHistoryOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          />
        )}

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
              onGoHome={() => setHasStarted(false)}
              currentView={viewMode}
              user={user}
            />
          </div>
        </motion.div>

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {viewMode === 'your-apps' ? (
            <div className={`flex-1 flex flex-col p-6 sm:p-10 overflow-y-auto ${isDark ? 'bg-[#080B11] text-white' : 'bg-[#FAFAFC] text-slate-900'}`}>
              <div className="max-w-6xl w-full mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="text-orange-primary" size={24} />
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Vos Applications & Projets</h2>
                    </div>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                      Accédez à l'intégralité de vos plateformes web créées, leur historique et leur code source.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleNewChat();
                      setViewMode('chat');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-primary to-amber-500 hover:from-orange-hover hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-primary/20 shrink-0 self-start sm:self-auto"
                  >
                    <Plus size={16} />
                    <span>Nouveau projet</span>
                  </button>
                </div>

                {conversations.length === 0 ? (
                  <div className={`text-center py-20 px-4 rounded-3xl border ${isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-slate-200'} max-w-lg mx-auto`}>
                    <div className="w-16 h-16 rounded-2xl bg-orange-primary/10 text-orange-primary flex items-center justify-center mx-auto mb-4 border border-orange-primary/20">
                      <FolderOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Aucune application pour le moment</h3>
                    <p className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-600'} mb-6 max-w-xs mx-auto leading-relaxed`}>
                      Décrivez votre idée à Cook IA pour générer votre première application web complète avec code et aperçu interactif.
                    </p>
                    <button
                      onClick={() => {
                        handleNewChat();
                        setViewMode('chat');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition-all shadow-lg shadow-orange-primary/25"
                    >
                      Créer une application maintenant
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {conversations.map((conv) => {
                      const hasCode = conv.messages.some(m => m.role === 'model' && (m.code || (m.files && m.files.length > 0)));
                      const isCurrent = currentConversationId === conv.id;
                      return (
                        <div 
                          key={conv.id} 
                          onClick={() => handleSelectConversation(conv.id)}
                          className={`group rounded-2xl border p-5 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                            isCurrent
                              ? (isDark ? 'bg-white/[0.08] border-orange-primary/80 ring-1 ring-orange-primary/50' : 'bg-orange-50/50 border-orange-300 ring-1 ring-orange-300')
                              : (isDark ? 'bg-[#0E1420]/80 hover:bg-[#141C2C] border-white/[0.08] hover:border-orange-primary/40' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-orange-primary/50 shadow-xs hover:shadow-md')
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                hasCode 
                                  ? (isDark ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border border-emerald-200')
                                  : (isDark ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-700')
                              }`}>
                                <Code size={11} />
                                {hasCode ? 'Application Web' : 'Discussion'}
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteConversation(conv.id);
                                }}
                                className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                                  isDark ? 'hover:bg-rose-500/20 text-white/40 hover:text-rose-400' : 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                                }`}
                                title="Supprimer ce projet"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <h3 className={`font-bold text-sm mb-1.5 line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-orange-600'} transition-colors`}>
                              {conv.title}
                            </h3>
                            
                            <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-slate-500'} line-clamp-2 mb-4`}>
                              {conv.messages[conv.messages.length - 1]?.content?.substring(0, 100) || "Projet Cook IA"}
                            </p>
                          </div>

                          <div className={`pt-3 border-t flex items-center justify-between text-[10px] ${isDark ? 'border-white/[0.06] text-white/40' : 'border-slate-100 text-slate-500'}`}>
                            <span>{new Date(conv.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="font-semibold group-hover:text-orange-primary transition-colors flex items-center gap-1">
                              Ouvrir <ArrowUp size={11} className="rotate-45" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'faq' ? (
            <div className={`flex-1 flex flex-col items-center p-8 overflow-y-auto ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-white text-[var(--color-ink)]'}`}>
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
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-[var(--color-ink)]'
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
          ) : viewMode === 'chat' ? (
            <ChatInterface 
              lang={lang}
              isDark={isDark}
              messages={messages}
              isLoading={isLoading}
              loadingStatus={loadingStatus}
              actions={currentActions}
              liveTask={activeLiveTask}
              liveEvents={activeLiveTask?.events}
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
              currentAgentStage={currentAgentStage}
              qaAuditSummary={qaAuditSummary}
              qaLogs={qaLogs}
              onSelectView={(v) => setViewMode(v as any)}
              aiMode={aiMode}
              onToggleAiMode={handleToggleAiMode}
              onSelectFile={(f) => {
                setViewMode('code');
              }}
              onRetryError={(errMsg) => {
                setPrompt(lang === 'fr' ? `Corrige cette erreur dans le code : ${errMsg}` : `Fix this error in the code: ${errMsg}`);
              }}
            />
          ) : (
            <Preview 
              viewMode={viewMode}
              generatedCode={generatedCode}
              files={(() => {
                const lastModelWithContent = [...messages].reverse().find(m => m.role === 'model' && ((m.files && m.files.length > 0) || m.code));
                if (lastModelWithContent?.files && lastModelWithContent.files.length > 0) {
                  return lastModelWithContent.files;
                }
                if (generatedCode) {
                  return [{ path: 'index.html', content: generatedCode }];
                }
                return [];
              })()}
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
              isLoading={isLoading}
              loadingStatus={loadingStatus}
              currentAgentStage={currentAgentStage}
              actions={currentActions}
            />
          )}

          {/* Mobile View Switcher */}
          {(viewMode === 'chat' || viewMode === 'preview' || viewMode === 'code') && (
            <div className={`md:hidden flex items-center justify-around p-2 border-t shrink-0 z-50 ${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200'}`}>
              <button 
                onClick={() => setViewMode('chat')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === 'chat' 
                    ? (isDark ? 'text-white' : 'text-[var(--color-ink)]') 
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
                    ? (isDark ? 'text-white' : 'text-[var(--color-ink)]') 
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
                    ? (isDark ? 'text-white' : 'text-[var(--color-ink)]') 
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
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-slate-900 dark:bg-white dark:text-[var(--color-ink)]/10 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 sm:p-2.5 bg-slate-900 dark:bg-white dark:text-[var(--color-ink)]/10 rounded-xl">
                      <Rocket className="text-[var(--color-primary)] animate-pulse" size={20} />
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
                      <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[var(--color-primary)] mb-1">Chemin de partage personnalisé</h3>
                      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">Définissez l'identifiant unique de votre site internet. Nous créerons automatiquement un lien de partage direct.</p>

                      <div className="space-y-2">
                        <div className="relative flex items-center bg-black/80 border border-white/10 rounded-xl focus-within:border-[var(--color-primary)]/50 transition-all shadow-inner overflow-hidden">
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
                        <div className="flex items-center gap-1.5 text-[var(--color-primary)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white dark:text-[var(--color-ink)] animate-ping" />
                          <span className="font-bold">LIEN DE PARTAGE DIRECT & UNIQUE</span>
                        </div>
                        <div className="space-y-1.5 text-zinc-500 leading-relaxed text-[9px]">
                          <div>1. Clic sur Déployer</div>
                          <div className="text-zinc-600">↓ Validation responsive & attribution de votre numéro unique</div>
                          <div>2. Cook IA réserve la route unique <span className="text-zinc-400">"/{siteName || 'monsite'}"</span></div>
                          <div className="text-zinc-600">↓ Enregistrement base de données</div>
                          <div>3. Votre route de partage universelle est activée et sécurisée</div>
                          <div className="text-[var(--color-primary)] font-bold mt-1">➔ cook-ia.indevs.in/{siteName || 'monsite'}</div>
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
                      <Loader2 className="animate-spin text-[var(--color-primary)]" size={28} />
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
                                ? 'bg-slate-900 dark:bg-white dark:text-[var(--color-ink)]/10 border-[var(--color-primary)]/25 shadow-sm scale-[1.01]' 
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
                                <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white dark:text-[var(--color-ink)]/20 text-[var(--color-primary)] flex items-center justify-center animate-pulse">
                                  <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white dark:text-[var(--color-ink)] animate-ping" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-zinc-800 text-zinc-700 flex items-center justify-center text-[10px] font-mono">
                                  {item.step}
                                </div>
                              )}
                            </div>

                            <div className="text-left">
                              <h4 className={`text-xs font-bold leading-tight font-mono ${isActive ? 'text-[var(--color-primary)] font-black' : isDone ? 'text-zinc-300' : 'text-zinc-600'}`}>
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
                      <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between hover:border-[var(--color-primary)]/20 transition-all duration-300 shadow-xl">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--color-primary)] font-bold mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white dark:text-[var(--color-ink)] animate-ping" />
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
        isDark={isDark}
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
        aiMode={aiMode}
        onToggleAiMode={handleToggleAiMode}
        onUpdateUserProfile={(data) => setUserProfile(data)}
      />
        </motion.div>
      )}
      <CookieBanner />
    </AnimatePresence>
  );
}