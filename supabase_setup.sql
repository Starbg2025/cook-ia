-- ==========================================
-- COOK IA - CONFIGURATION COMPLÈTE SUPABASE
-- Protège le site et configure l'isolation
-- ==========================================

-- 1. Table des profils d'utilisateurs (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    username TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Active RLS pour les profils
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Nettoie les anciennes politiques profils pour éviter l'erreur POLICY ALREADY EXISTS
DROP POLICY IF EXISTS "Les profils sont visibles par tout le monde" ON public.profiles;
DROP POLICY IF EXISTS "L'utilisateur peut modifier son propre profil" ON public.profiles;
DROP POLICY IF EXISTS "L'utilisateur peut insérer son propre profil" ON public.profiles;

-- Crée des politiques propres
CREATE POLICY "Les profils sont visibles par tout le monde" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "L'utilisateur peut modifier son propre profil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "L'utilisateur peut insérer son propre profil" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);


-- 2. Table des conversations (conversations)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    title TEXT,
    messages JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Active RLS pour les conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Nettoie les anciennes politiques conversations
DROP POLICY IF EXISTS "L'utilisateur peut voir ses propres conversations" ON public.conversations;
DROP POLICY IF EXISTS "L'utilisateur peut créer ses conversations" ON public.conversations;
DROP POLICY IF EXISTS "L'utilisateur peut modifier ses conversations" ON public.conversations;
DROP POLICY IF EXISTS "L'utilisateur peut supprimer ses conversations" ON public.conversations;

-- Crée des politiques d'isolation d'accès
CREATE POLICY "L'utilisateur peut voir ses propres conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "L'utilisateur peut créer ses conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "L'utilisateur peut modifier ses conversations" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "L'utilisateur peut supprimer ses conversations" 
ON public.conversations FOR DELETE 
USING (auth.uid() = user_id);


-- 3. Table des sites publiés (published_sites)
CREATE TABLE IF NOT EXISTS public.published_sites (
    slug TEXT PRIMARY KEY,
    code TEXT,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Active RLS pour les sites publiés
ALTER TABLE public.published_sites ENABLE ROW LEVEL SECURITY;

-- Nettoie les anciennes politiques pour les sites publiés
DROP POLICY IF EXISTS "Tout le monde peut voir les sites publiés" ON public.published_sites;
DROP POLICY IF EXISTS "L'utilisateur peut créer son site" ON public.published_sites;
DROP POLICY IF EXISTS "L'utilisateur peut modifier son site" ON public.published_sites;
DROP POLICY IF EXISTS "L'utilisateur peut supprimer son site" ON public.published_sites;

-- Crée des politiques publiques/privées pour les sites
CREATE POLICY "Tout le monde peut voir les sites publiés" 
ON public.published_sites FOR SELECT 
USING (true);

CREATE POLICY "L'utilisateur peut créer son site" 
ON public.published_sites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "L'utilisateur peut modifier son site" 
ON public.published_sites FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "L'utilisateur peut supprimer son site" 
ON public.published_sites FOR DELETE 
USING (auth.uid() = user_id);


-- 4. Table des messages de support (support_messages)
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Active RLS pour les messages de support
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Nettoie les anciennes politiques
DROP POLICY IF EXISTS "L'utilisateur peut envoyer un message de support" ON public.support_messages;
DROP POLICY IF EXISTS "L'administrateur ou l'utilisateur peut voir les messages de support" ON public.support_messages;

-- Crée la politique d'envoi de messages de support
CREATE POLICY "L'utilisateur peut envoyer un message de support" 
ON public.support_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "L'utilisateur peut voir ses propres messages" 
ON public.support_messages FOR SELECT 
USING (auth.uid() = user_id);
