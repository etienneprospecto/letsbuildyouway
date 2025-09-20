-- Script pour créer la table user_themes manquante
-- À exécuter directement dans Supabase SQL Editor

-- Table des thèmes utilisateur
CREATE TABLE IF NOT EXISTS user_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  theme_name text DEFAULT 'Mon thème',
  primary_color text DEFAULT '#8B5CF6', -- Violet moderne par défaut
  secondary_color text DEFAULT '#A78BFA',
  accent_color text DEFAULT '#C4B5FD',
  success_color text DEFAULT '#10B981',
  warning_color text DEFAULT '#F59E0B',
  danger_color text DEFAULT '#EF4444',
  mode_preference text DEFAULT 'system' CHECK (mode_preference IN ('light', 'dark', 'system')),
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Table des thèmes communautaires
CREATE TABLE IF NOT EXISTS community_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES users(id),
  name text NOT NULL,
  description text,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  accent_color text NOT NULL,
  success_color text DEFAULT '#10B981',
  warning_color text DEFAULT '#F59E0B',
  danger_color text DEFAULT '#EF4444',
  is_public boolean DEFAULT false,
  downloads_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  tags text[],
  created_at timestamp DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_themes_user_id ON user_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_themes_active ON user_themes(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_community_themes_public ON community_themes(is_public);
CREATE INDEX IF NOT EXISTS idx_community_themes_tags ON community_themes USING GIN(tags);

-- RLS (Row Level Security)
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_themes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_themes
CREATE POLICY IF NOT EXISTS "Users can view their own themes" ON user_themes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own themes" ON user_themes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own themes" ON user_themes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own themes" ON user_themes
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour community_themes
CREATE POLICY IF NOT EXISTS "Anyone can view public themes" ON community_themes
  FOR SELECT USING (is_public = true);

CREATE POLICY IF NOT EXISTS "Users can view their own themes" ON community_themes
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can insert their own themes" ON community_themes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can update their own themes" ON community_themes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can delete their own themes" ON community_themes
  FOR DELETE USING (auth.uid() = created_by);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_themes_updated_at BEFORE UPDATE ON user_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_themes_updated_at BEFORE UPDATE ON community_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
