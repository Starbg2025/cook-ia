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
  Scissors
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateWebsite, generateTitle, updateSection, convertToReact, improveText } from './services/geminiService';
import { analystReview, criticReview, plannerAgent, testerAgent } from './services/multiAgentService';
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

import { supabase, logErrorToSupabase } from './services/supabaseService';
import { deployToNetlify } from './services/netlifyService';
import JSZip from 'jszip';
import { Palette, Braces } from 'lucide-react';

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
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [isProjectSettings, setIsProjectSettings] = useState(true);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [pendingSend, setPendingSend] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'publish' | 'versions' | 'secrets' | 'integrations' | 'github' | 'general' | 'account' | 'help'>('publish');
  const [secrets, setSecrets] = useState<{ key: string; value: string }[]>([]);
  const [isLinkFullscreen, setIsLinkFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(true);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(() => {
    const saved = localStorage.getItem('isRealtimeEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('isRealtimeEnabled', JSON.stringify(isRealtimeEnabled));
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
  const [user, setUser] = useState<any>(null);
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

    // Mouse position sharing
    const handleMouseMove = (e: MouseEvent) => {
      channel.track({
        name: user.profile?.full_name || user.email,
        x: e.clientX,
        y: e.clientY
      });
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
    
    if (error) {
      if (error.message.includes("Refresh Token Not Found") || error.message.includes("Invalid Refresh Token")) {
        supabase.auth.signOut();
        setUser(null);
        setConversations([]);
      }
      console.error("Error loading conversations:", error);
      return;
    }
    if (data) setConversations(data);
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

      // 1. Analyst Phase for Section Update
      const review = await analystReview(`MISE À JOUR DE SECTION (${sectionEdit.selector}) : ${sectionPrompt}`, history);
      if (review.needsClarification) {
        const analystMessage: Message = {
          role: 'model',
          content: `[Analyste] Avant de modifier cette section (${sectionEdit.selector}), j'ai besoin de précisions :\n\n${review.questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`
        };
        const updatedMessages = [...messages, analystMessage];
        setMessages(updatedMessages);
        setIsLoading(false);
        await saveConversation(updatedMessages);
        return;
      }

      // 2. Engineer Phase
      const result = await updateSection(
        sectionPrompt,
        sectionEdit.sectionHtml,
        generatedCode,
        history
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
        []
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

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Check if verification is needed today
    const lastVerification = user.user_metadata?.last_verification_date;
    const today = new Date().toISOString().split('T')[0];

    if (lastVerification === today) {
      // Already verified today, send directly
      executeSend();
    } else {
      // Send directly without bot verification
      executeSend();
    }
  };

  const executeSend = async () => {
    // Update the verification date in user metadata
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: { last_verification_date: today }
        });
        if (!error && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error updating verification date:", err);
      }
    }

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
    setLoadingStatus("Analyse de votre demande...");
    setCurrentActions([]);

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

      // 1. Analyst Phase (Groq)
      const a1 = addAction('thought', "Démarrage de l'analyse sémantique du prompt...");
      const review = await analystReview(userMessage, history);
      completeAction(a1);
      
      setLoadingStatus("Planification stratégique...");
      const a2 = addAction('thought', "Élaboration de la stratégie de développement...");
      if (review.isTechnicalQuestion && review.answer) {
        completeAction(a2);
        const technicalMessage: Message = {
          role: 'model',
          content: `[Expert Technique] ${review.answer}`,
          _provider: 'Groq'
        };
        const updatedMessages = [...newMessages, technicalMessage];
        setMessages(updatedMessages);
        setIsLoading(false);
        await saveConversation(updatedMessages);
        return;
      }

      if (review.needsClarification) {
        const analystMessage: Message = {
          role: 'model',
          content: `[Analyste] Bonjour ! Je suis l'Analyste. Pour m'assurer que l'Architecte construise exactement le chef-d'œuvre que vous imaginez, j'ai besoin de quelques précisions :\n\n${review.questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`,
          _provider: 'Groq'
        };
        const updatedMessages = [...newMessages, analystMessage];
        setMessages(updatedMessages);
        setIsLoading(false);
        await saveConversation(updatedMessages);
        return;
      }

      // 2. Planner Phase (Gemini) - ALWAYS PLAN BEFORE CODING
      const a3 = addAction('read', "Vérification des composants réutilisables...");
      const planResult = await plannerAgent(userMessage, history);
      completeAction(a3);

      setLoadingStatus("Génération de l'architecture...");
      const a4 = addAction('thought', "Plan stratégique validé. Initialisation de l'Ingénieur IA...");
      const planningMessage: Message = {
        role: 'model',
        content: `[Planificateur] Voici mon plan d'action :\n\n${planResult.plan}${planResult.isComplex ? `\n\n**Complexité détectée !** Délégation aux sous-agents : ${planResult.subAgents.join(', ')}` : ''}`,
        _provider: 'Gemini'
      };
      setMessages(prev => [...prev, planningMessage]);

      // 3. Engineer Phase (Gemini)
      
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

      const a5 = addAction('thought', "Génération des fichiers sources (HTML/JS/React)...");
      let result = await generateWebsite(
        enrichedUserMessage, 
        history.slice(0, -1), 
        imageParts.length > 0 ? imageParts : undefined,
        videoParts.length > 0 ? videoParts : undefined
      );
      completeAction(a5);

      setLoadingStatus("Tests de qualité et validation...");
      const a6 = addAction('shell', "Compilation des assets et vérification de la syntaxe...");

      // 4. Automated Testing Phase (Groq)
      const testResult = await testerAgent(result.preview_code, enrichedUserMessage);
      completeAction(a6);
      
      if (!testResult.passed) {
        // Log error to Supabase
        await logErrorToSupabase(`Test failed for prompt: ${userMessage}`, { 
          errors: testResult.errors,
          prompt: userMessage,
          code: result.preview_code.substring(0, 1000)
        });

        // Auto-correction: Re-generate with test feedback
        const correctionMessage: Message = {
          role: 'model',
          content: `[Testeur] Bugs détectés : ${testResult.errors.join(', ')}. Je lance une correction automatique...`,
          _provider: 'Groq'
        };
        setMessages(prev => [...prev, correctionMessage]);

        result = await generateWebsite(
          `${enrichedUserMessage}\n\nCORRECTION DE BUGS (TESTS ÉCHOUÉS) :\n${testResult.errors.join('\n')}`,
          history.slice(0, -1),
          imageParts.length > 0 ? imageParts : undefined,
          videoParts.length > 0 ? videoParts : undefined
        );
      }

      // 5. Critic Phase (OpenRouter)
      const a7 = addAction('read', "Analyse de la conformité visuelle et UX...");
      const critic = await criticReview(enrichedUserMessage, result.preview_code);
      completeAction(a7);
      
      setLoadingStatus("Finalisation du design...");
      const a8 = addAction('thought', "Finalisation des derniers détails esthétiques...");
      if (!critic.approved) {
        completeAction(a8, 'failed');
        // Re-generate with feedback
        result = await generateWebsite(
          `${enrichedUserMessage}\n\nFEEDBACK DU CRITIQUE (À CORRIGER) :\n${critic.feedback}`,
          history.slice(0, -1),
          imageParts.length > 0 ? imageParts : undefined,
          videoParts.length > 0 ? videoParts : undefined
        );
      }
      
      const updatedMessages: Message[] = [...newMessages, planningMessage, { 
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
      
      let errorMessage = "Désolé, une erreur est survenue lors de la génération. Veuillez réessayer.";
      if (error.message?.includes("API key")) {
        errorMessage = "Clé API invalide ou manquante. Vérifiez votre configuration.";
      } else if (error.message?.includes("safety") || error.message?.includes("blocked")) {
        errorMessage = "Le contenu a été bloqué par les filtres de sécurité. Essayez une autre URL ou un autre prompt.";
      } else if (error.message?.includes("JSON")) {
        errorMessage = "L'IA a eu du mal à structurer sa réponse. Veuillez réessayer, cela arrive parfois avec des sites complexes.";
      }
        
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: errorMessage 
      }]);
    } finally {
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
    const url = `${siteName || 'votre-site'}.cook-ia.indevs.in`;
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
      
      // Get files from the last model message
      const lastModelMessage = [...messages].reverse().find(m => m.role === 'model' && m.files);
      const files = lastModelMessage?.files || [];

      // 1. Save to database for persistence
      const { error: dbError } = await supabase
        .from('published_sites')
        .upsert([
          { 
            slug, 
            code: generatedCode, 
            user_id: user.id 
          }
        ], { onConflict: 'slug' });

      if (dbError) throw dbError;

      // 2. Deploy via Backend API (The requested flow)
      // Frontend sends request -> Backend receives -> Site deployed -> URL accessible
      const result = await deployToNetlify(siteName, generatedCode, files, user.id);
      
      if (result.success) {
        setPublishedUrl(result.url);
      } else {
        throw new Error("Deployment failed");
      }
    } catch (error: any) {
      console.error("Error publishing site:", error);
      alert(`Erreur lors de la publication : ${error.message}`);
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
            window.location.href = "https://cook-ia.indevs.in";
          }}
          className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-black transition-all z-50 shadow-2xl flex items-center gap-2"
        >
          <img src={LOGO_URL} alt="Logo" className="w-4 h-4 object-contain" />
          Créé avec COOK IA
        </button>
        <CookieBanner />
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
           className="fixed inset-0 z-[1000]"
        >
          <LandingPage onEnter={() => setHasStarted(true)} />
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`flex flex-col h-screen ${isDark ? 'bg-abyssal-deep text-white' : 'bg-[#F8F9FA] text-slate-900'} overflow-hidden font-sans transition-colors duration-500`}
        >
          {showAnnouncement && (
            <div className={`bg-cyan-bio text-black px-4 py-2 flex items-center justify-between text-sm font-bold shrink-0 z-[60] shadow-[0_0_20px_rgba(0,245,212,0.2)]`}>
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
      <header className={`h-14 border-b flex items-center justify-between px-4 shrink-0 z-50 ${isDark ? 'bg-abyssal-deep border-cyan-bio/10' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-bio rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(0,245,212,0.4)]">
              <Zap size={14} className="text-white fill-white" />
            </div>
            <span className={`font-display font-black text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>COOK IA</span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#141414] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
          <button 
            onClick={() => setViewMode('chat')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'chat' 
                ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-sm') 
                : (isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600')
            }`}
          >
            <MessageSquare size={14} />
            Chat
          </button>
          <button 
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'code' 
                ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-sm') 
                : (isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600')
            }`}
          >
            <Code size={14} />
            Code
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'preview' 
                ? (isDark ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-sm') 
                : (isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600')
            }`}
          >
            <Eye size={14} />
            Preview
          </button>
        </div>

        <div className="flex items-center gap-3">
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
          ) : viewMode === 'chat' ? (
            <ChatInterface 
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
          ) : (
            <Preview 
              viewMode={viewMode}
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
            />
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
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 pr-32 text-sm font-mono focus:outline-none focus:border-orange-primary/50 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-mono text-sm">.cook-ia.indevs.in</span>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                    <span className="text-orange-primary font-mono text-sm truncate mr-4">
                      {siteName || 'votre-site'}.cook-ia.indevs.in
                    </span>
                    <button 
                      onClick={() => {
                        const url = publishedUrl || `https://${siteName || 'votre-site'}.cook-ia.indevs.in`;
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
      />
        </motion.div>
      )}
      <CookieBanner />
    </AnimatePresence>
  );
}