-- Migration pour ajouter la préférence de thème aux utilisateurs
-- Date: 2025-01-27
-- Description: Ajoute une colonne theme_preference à la table users pour persister le choix de thème

-- Ajouter la colonne theme_preference à la table users
ALTER TABLE users 
ADD COLUMN theme_preference text DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system'));

-- Commentaire sur la colonne
COMMENT ON COLUMN users.theme_preference IS 'Préférence de thème de l''utilisateur: light, dark, ou system (suit la préférence système)';

-- Index pour optimiser les requêtes de recherche par thème
CREATE INDEX IF NOT EXISTS idx_users_theme_preference ON users(theme_preference);

-- Mettre à jour les utilisateurs existants avec la valeur par défaut
UPDATE users 
SET theme_preference = 'system' 
WHERE theme_preference IS NULL;
