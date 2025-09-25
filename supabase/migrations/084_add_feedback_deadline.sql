-- Migration 084: Ajout du système de deadline pour les feedbacks
-- Date: 2025-01-11
-- Description: Ajoute un champ deadline aux feedbacks hebdomadaires pour gérer les alertes de temps restant

-- Ajouter le champ deadline à la table feedbacks_hebdomadaires
ALTER TABLE feedbacks_hebdomadaires 
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- Ajouter un index pour améliorer les performances des requêtes de deadline
CREATE INDEX IF NOT EXISTS idx_feedbacks_hebdomadaires_deadline 
ON feedbacks_hebdomadaires (deadline) WHERE deadline IS NOT NULL;

-- Ajouter un index composite pour les feedbacks en attente avec deadline
CREATE INDEX IF NOT EXISTS idx_feedbacks_hebdomadaires_status_deadline 
ON feedbacks_hebdomadaires (status, deadline) 
WHERE status IN ('sent', 'in_progress') AND deadline IS NOT NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN feedbacks_hebdomadaires.deadline IS 'Date limite pour remplir le feedback. Utilisé pour afficher les alertes de temps restant aux clients.';
