-- Migration pour créer le système de thèmes personnalisables
-- Date: 2025-01-27
-- Description: Tables pour thèmes utilisateur et communauté

-- Table des thèmes utilisateur
CREATE TABLE user_themes (
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
CREATE TABLE community_themes (
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
CREATE INDEX idx_user_themes_user_id ON user_themes(user_id);
CREATE INDEX idx_user_themes_active ON user_themes(user_id, is_active);
CREATE INDEX idx_community_themes_public ON community_themes(is_public);
CREATE INDEX idx_community_themes_tags ON community_themes USING GIN(tags);

-- RLS (Row Level Security)
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_themes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_themes
CREATE POLICY "Users can view their own themes" ON user_themes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own themes" ON user_themes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own themes" ON user_themes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own themes" ON user_themes
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour community_themes
CREATE POLICY "Anyone can view public themes" ON community_themes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own community themes" ON community_themes
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert community themes" ON community_themes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own community themes" ON community_themes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own community themes" ON community_themes
  FOR DELETE USING (auth.uid() = created_by);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_user_themes_updated_at 
  BEFORE UPDATE ON user_themes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_themes_updated_at 
  BEFORE UPDATE ON community_themes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques thèmes communautaires par défaut
INSERT INTO community_themes (created_by, name, description, primary_color, secondary_color, accent_color, is_public, tags) VALUES
  (NULL, 'BYW Orange Classique', 'Thème orange signature BYW', '#FF6B35', '#FF8C42', '#FFB74D', true, ARRAY['officiel', 'orange', 'energie']),
  (NULL, 'Bleu Professionnel', 'Thème bleu pour un look professionnel', '#1976D2', '#42A5F5', '#64B5F6', true, ARRAY['professionnel', 'bleu', 'corporate']),
  (NULL, 'Vert Nature', 'Thème vert apaisant et naturel', '#388E3C', '#66BB6A', '#81C784', true, ARRAY['nature', 'vert', 'zen']),
  (NULL, 'Violet Creative', 'Thème violet pour la créativité', '#7B1FA2', '#AB47BC', '#CE93D8', true, ARRAY['creative', 'violet', 'artiste']),
  (NULL, 'Rouge Énergie', 'Thème rouge dynamique et énergique', '#D32F2F', '#F44336', '#FF8A80', true, ARRAY['energie', 'rouge', 'dynamique']),
  (NULL, 'Sombre Élégant', 'Thème sombre sophistiqué', '#1A1A1A', '#2D2D2D', '#404040', true, ARRAY['sombre', 'elegant', 'minimaliste']);

-- Commentaires sur les tables
COMMENT ON TABLE user_themes IS 'Thèmes personnalisés des utilisateurs';
COMMENT ON TABLE community_themes IS 'Thèmes partagés par la communauté';
COMMENT ON COLUMN user_themes.theme_name IS 'Nom du thème personnalisé';
COMMENT ON COLUMN user_themes.primary_color IS 'Couleur principale du thème (HEX)';
COMMENT ON COLUMN user_themes.secondary_color IS 'Couleur secondaire du thème (HEX)';
COMMENT ON COLUMN user_themes.accent_color IS 'Couleur d''accent du thème (HEX)';
COMMENT ON COLUMN user_themes.mode_preference IS 'Préférence de mode: light, dark, ou system';
COMMENT ON COLUMN community_themes.tags IS 'Tags pour catégoriser les thèmes';
