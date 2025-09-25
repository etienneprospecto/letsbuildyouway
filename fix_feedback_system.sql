-- Script SQL pour corriger le système de feedback
-- À exécuter dans l'interface Supabase SQL Editor

-- 1. Ajouter le champ responses à feedbacks_hebdomadaires
ALTER TABLE feedbacks_hebdomadaires 
ADD COLUMN IF NOT EXISTS responses JSONB;

-- 2. Désactiver RLS sur les tables de feedback
ALTER TABLE feedback_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks_hebdomadaires DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses DISABLE ROW LEVEL SECURITY;

-- 3. Supprimer toutes les politiques RLS existantes
DROP POLICY IF EXISTS "Coaches can manage own templates" ON feedback_templates;
DROP POLICY IF EXISTS "Coaches can manage questions in own templates" ON feedback_questions;
DROP POLICY IF EXISTS "Coaches can manage own feedbacks" ON feedbacks_hebdomadaires;
DROP POLICY IF EXISTS "Clients can view own feedbacks" ON feedbacks_hebdomadaires;
DROP POLICY IF EXISTS "Clients can update own feedbacks" ON feedbacks_hebdomadaires;
DROP POLICY IF EXISTS "Coaches can view responses of own feedbacks" ON feedback_responses;
DROP POLICY IF EXISTS "Clients can manage own responses" ON feedback_responses;
DROP POLICY IF EXISTS "Clients can insert own responses" ON feedback_responses;
DROP POLICY IF EXISTS "Clients can update own responses" ON feedback_responses;
DROP POLICY IF EXISTS "Clients can delete own responses" ON feedback_responses;
DROP POLICY IF EXISTS "Clients can view own responses" ON feedback_responses;

-- 4. Ajouter un index pour les performances
CREATE INDEX IF NOT EXISTS idx_feedbacks_hebdomadaires_responses 
ON feedbacks_hebdomadaires USING GIN (responses) WHERE responses IS NOT NULL;

-- 5. Vérifier que tout est correct
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('feedback_templates', 'feedback_questions', 'feedbacks_hebdomadaires', 'feedback_responses')
ORDER BY tablename;

-- 6. Tester l'insertion d'une réponse
UPDATE feedbacks_hebdomadaires 
SET responses = '[{"question_id": "test", "question_text": "Test", "question_type": "text", "response": "Test response"}]'
WHERE id IN (SELECT id FROM feedbacks_hebdomadaires LIMIT 1);

-- 7. Vérifier que la réponse a été insérée
SELECT id, responses FROM feedbacks_hebdomadaires WHERE responses IS NOT NULL LIMIT 1;
