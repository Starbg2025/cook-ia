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
import { generateWebsite, generateTitle, updateSection, convertToReact, improveText } from './services/geminiService';
import { Message, ViewMode, Conversation, StyleConfig, SectionEditState } from './types';
import { ChatInterface } from './components/ChatInterface';
import { Preview } from './components/Preview';
import { HistorySidebar } from './components/HistorySidebar';
import { StyleEditor } from './components/StyleEditor';
import { SectionChat } from './components/SectionChat';
import { ImageSearchModal } from './components/ImageSearchModal';
import { UrlInputModal } from './components/UrlInputModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { supabase } from './services/supabaseService';
import { deployToNetlify } from './services/netlifyService';
import JSZip from 'jszip';
import { Palette, Rocket, Braces } from 'lucide-react';

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
  const [isStyleEditorOpen, setIsStyleEditorOpen] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlModalType, setUrlModalType] = useState<'clone' | 'ecommerce'>('clone');
  const [isConverting, setIsConverting] = useState(false);
  const [imageSearchContext, setImageSearchContext] = useState<'chat' | 'section'>('chat');
  const [isDeploying, setIsDeploying] = useState(false);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    primaryColor: '#FF6B00',
    fontFamily: 'Inter',
    borderRadius: '1rem'
  });
  const [sectionEdit, setSectionEdit] = useState<SectionEditState>({ isActive: false });
  const [settingsTab, setSettingsTab] = useState<any>('general');
  const [user, setUser] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const skipIframeUpdate = useRef(false);

  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'preview'>('chat');

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

  const handleConvertToReact = async (framework: 'react' | 'nextjs') => {
    if (!generatedCode || isConverting) return;

    setIsConverting(true);
    try {
      const result = await convertToReact(generatedCode, framework);
      
      const updatedMessages: Message[] = [...messages, { 
        role: 'model', 
        content: `Voici la conversion de votre site en composants ${framework === 'nextjs' ? 'Next.js' : 'React'} avec Tailwind CSS.`,
        files: result.files
      }];
      
      setMessages(updatedMessages);
      setViewMode('code');
      await saveConversation(updatedMessages);
    } catch (error) {
      console.error("Error converting to React:", error);
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
    setUrlModalType('clone');
    setIsUrlModalOpen(true);
  };

  const handleEcommerceProduct = () => {
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

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const userMessage = prompt;
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

      const result = await generateWebsite(
        enrichedUserMessage, 
        history.slice(0, -1), 
        imageParts.length > 0 ? imageParts : undefined,
        videoParts.length > 0 ? videoParts : undefined
      );
      
      const updatedMessages: Message[] = [...newMessages, { 
        role: 'model', 
        content: result._provider === 'claude' 
          ? `[Claude 3.5 Sonnet Fallback] ${result.explanation}` 
          : result.explanation,
        code: result.preview_code,
        files: result.files
      }];
      setMessages(updatedMessages);
      setGeneratedCode(result.preview_code);
      setViewMode('preview');
      
      // Enqueue invisible background task (Watchdog Architecture)
      fetch('/api/watchdog/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'site_optimization', 
          payload: { siteName: siteName || 'untitled', codeLength: result.preview_code.length } 
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

  const handleDownloadZip = async () => {
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model' && m.files);
    if (!lastModelMessage?.files) return;

    const zip = new JSZip();
    lastModelMessage.files.forEach(file => {
      zip.file(file.path, file.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${siteName || 'cook-ia-project'}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleAbort = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${siteName || 'votre-site'}.cook-ia.online`;
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

      const url = `https://${slug}.cook-ia.online`;
      setPublishedUrl(url);
      alert(`Félicitations ! Votre site est maintenant en ligne sur ${slug}.cook-ia.online`);
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
            window.location.href = "https://cook-ia.online";
          }}
          className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-black transition-all z-50 shadow-2xl flex items-center gap-2"
        >
          <img src={LOGO_URL} alt="Logo" className="w-4 h-4 object-contain" />
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
      <header className="flex items-center justify-between px-4 lg:px-10 py-4 lg:py-6 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-xl z-50 sticky top-0">
        <div className="flex items-center gap-3 lg:gap-6">
          <button 
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-2.5 lg:p-3.5 rounded-xl lg:rounded-2xl transition-all duration-300 ${isHistoryOpen ? 'bg-white text-black' : 'bg-[#141414] text-white/40 hover:bg-[#1A1A1A] hover:text-white'} border border-white/5 shadow-2xl group`}
          >
            <div className="flex flex-col gap-1 w-4 lg:w-5">
              <div className={`h-[1.5px] lg:h-[2px] transition-all duration-300 ${isHistoryOpen ? 'w-full bg-black' : 'w-full bg-current'}`} />
              <div className={`h-[1.5px] lg:h-[2px] transition-all duration-300 ${isHistoryOpen ? 'w-2/3 bg-black' : 'w-full bg-current'}`} />
              <div className={`h-[1.5px] lg:h-[2px] transition-all duration-300 ${isHistoryOpen ? 'w-full bg-black' : 'w-full bg-current'}`} />
            </div>
          </button>
          
          <div className="flex items-center gap-2 lg:gap-4 group cursor-pointer">
            <div className="w-8 h-8 lg:w-12 lg:h-12 bg-[#141414] rounded-lg lg:rounded-[1.25rem] flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden transition-transform group-hover:scale-105">
              <img src={LOGO_URL} alt="COOK IA Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-2xl font-black tracking-tighter flex items-center gap-1.5 leading-none mb-0.5 lg:mb-1">
                COOK <span className="text-orange-primary">IA</span>
              </h1>
              <p className="text-[8px] lg:text-[10px] text-white/20 uppercase tracking-[0.2em] lg:tracking-[0.3em] font-bold">Full-Stack Web Development</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-8">
          <div className="hidden md:flex bg-[#0D0D0D] p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
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

          <div className="hidden md:block h-10 w-[1px] bg-white/5" />
          
          <div className="flex items-center gap-2 lg:gap-6">
            {user ? (
              <div className="flex items-center gap-2 lg:gap-4 bg-white/5 pl-1.5 lg:pl-2 pr-3 lg:pr-4 py-1 lg:py-1.5 rounded-xl lg:rounded-2xl border border-white/5">
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-orange-primary/20 border border-orange-primary/20 flex items-center justify-center overflow-hidden shadow-inner">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] lg:text-[10px] font-black text-orange-primary">{user.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <button 
                  onClick={() => supabase.auth.signOut()}
                  className="text-white/30 hover:text-white text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="text-white/30 hover:text-white text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-colors px-3 lg:px-4 py-1.5 lg:py-2 hover:bg-white/5 rounded-lg lg:rounded-xl border border-transparent hover:border-white/5"
              >
                Sign In
              </button>
            )}

            <div className="hidden sm:block h-6 w-[1px] bg-white/5" />

            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={() => setIsStyleEditorOpen(!isStyleEditorOpen)}
                title="Style Editor"
                className={`transition-all p-2 lg:p-2.5 rounded-xl ${isStyleEditorOpen ? 'bg-orange-primary text-white shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
              >
                <Palette size={18} />
              </button>
              <button 
                onClick={() => handleConvertToReact('nextjs')}
                disabled={!generatedCode || isConverting}
                title="Convert to Next.js"
                className="text-white/30 hover:text-white transition-all p-2 lg:p-2.5 hover:bg-white/5 rounded-xl disabled:opacity-10 flex items-center gap-2"
              >
                {isConverting ? <Loader2 size={18} className="animate-spin" /> : <Braces size={18} />}
              </button>
              <button 
                onClick={handleNetlifyDeploy}
                disabled={!generatedCode || isDeploying}
                title="Deploy to Netlify"
                className="text-white/30 hover:text-white transition-all p-2 lg:p-2.5 hover:bg-white/5 rounded-xl disabled:opacity-10 flex items-center gap-2"
              >
                {isDeploying ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} />}
              </button>
              <button 
                onClick={handleDownload}
                disabled={!generatedCode}
                title="Download HTML"
                className="text-white/30 hover:text-white transition-all p-2 lg:p-2.5 hover:bg-white/5 rounded-xl disabled:opacity-10"
              >
                <Download size={18} />
              </button>
              <button 
                onClick={handleGithubClick}
                className="text-white/30 hover:text-white transition-all p-2 lg:p-2.5 hover:bg-white/5 rounded-xl"
              >
                <Github size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setIsPublishModalOpen(true)}
              className="bg-orange-primary hover:bg-orange-600 text-white px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-xl lg:rounded-[1.25rem] font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(255,107,0,0.15)] lg:shadow-[0_20px_40px_rgba(255,107,0,0.2)] active:scale-95 hover:-translate-y-0.5"
            >
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-white/5 bg-[#0A0A0A]">
        <button 
          onClick={() => setActiveMobileTab('chat')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeMobileTab === 'chat' ? 'text-orange-primary border-b-2 border-orange-primary' : 'text-white/20'}`}
        >
          Chat
        </button>
        <button 
          onClick={() => setActiveMobileTab('preview')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeMobileTab === 'preview' ? 'text-orange-primary border-b-2 border-orange-primary' : 'text-white/20'}`}
        >
          Preview
        </button>
      </div>

      <main className="flex flex-1 overflow-hidden p-2 lg:p-4 gap-2 lg:gap-4 relative">
        <AnimatePresence>
          {isHistoryOpen && (
            <>
              {/* Mobile Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHistoryOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              />
              <motion.div
                initial={{ width: 0, opacity: 0, x: -20 }}
                animate={{ width: 280, opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="absolute lg:relative left-0 top-0 bottom-0 z-[70] lg:z-0 h-full overflow-hidden bg-[#0D0D0D] lg:bg-transparent"
              >
                <HistorySidebar 
                  conversations={conversations}
                  currentConversationId={currentConversationId}
                  onSelectConversation={(id) => {
                    handleSelectConversation(id);
                    if (window.innerWidth < 1024) setIsHistoryOpen(false);
                  }}
                  onNewChat={() => {
                    handleNewChat();
                    if (window.innerWidth < 1024) setIsHistoryOpen(false);
                  }}
                  onDeleteConversation={handleDeleteConversation}
                  onOpenSettings={(tab) => {
                    setSettingsTab(tab || 'general');
                    setIsSettingsModalOpen(true);
                  }}
                  user={user}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className={`flex-1 flex gap-2 lg:gap-4 h-full overflow-hidden ${activeMobileTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
          <ChatInterface 
            messages={messages}
            prompt={prompt}
            setPrompt={setPrompt}
            handleSend={handleSend}
            onAbort={handleAbort}
            isLoading={isLoading}
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
            onCloneSite={handleCloneSite}
            onEcommerceProduct={handleEcommerceProduct}
          />
        </div>
        
        <div className={`flex-1 flex h-full overflow-hidden ${activeMobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
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
          />
        </div>
      </main>

      <AnimatePresence>
        {isStyleEditorOpen && (
          <StyleEditor 
            isOpen={isStyleEditorOpen}
            onClose={() => setIsStyleEditorOpen(false)}
            config={styleConfig}
            onChange={setStyleConfig}
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
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-mono text-sm">.cook-ia.online</span>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                    <span className="text-orange-primary font-mono text-sm truncate mr-4">
                      {siteName || 'votre-site'}.cook-ia.online
                    </span>
                    <button 
                      onClick={() => {
                        const url = publishedUrl || `https://${siteName || 'votre-site'}.cook-ia.online`;
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
      />
    </div>
  );
}
