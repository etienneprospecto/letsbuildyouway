-- Migration 087: Désactivation des RLS pour les tables de feedback
-- Date: 2025-01-11
-- Description: Désactive RLS sur toutes les tables de feedback pour simplifier le développement

-- Désactiver RLS sur feedback_templates
ALTER TABLE feedback_templates DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur feedback_questions
ALTER TABLE feedback_questions DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur feedbacks_hebdomadaires
ALTER TABLE feedbacks_hebdomadaires DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur feedback_responses
ALTER TABLE feedback_responses DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes pour ces tables
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

-- Vérifier que RLS est bien désactivé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('feedback_templates', 'feedback_questions', 'feedbacks_hebdomadaires', 'feedback_responses')
ORDER BY tablename;
