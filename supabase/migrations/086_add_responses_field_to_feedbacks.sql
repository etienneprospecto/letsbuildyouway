-- Migration 086: Ajout du champ responses à feedbacks_hebdomadaires
-- Date: 2025-01-11
-- Description: Ajoute un champ responses JSONB pour stocker les réponses directement dans le feedback

-- Ajouter le champ responses à la table feedbacks_hebdomadaires
ALTER TABLE feedbacks_hebdomadaires 
ADD COLUMN IF NOT EXISTS responses JSONB;

-- Ajouter un index pour améliorer les performances des requêtes sur les réponses
CREATE INDEX IF NOT EXISTS idx_feedbacks_hebdomadaires_responses 
ON feedbacks_hebdomadaires USING GIN (responses) WHERE responses IS NOT NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN feedbacks_hebdomadaires.responses IS 'Réponses du client au feedback. Stockées au format JSONB pour éviter les problèmes de RLS avec feedback_responses.';
