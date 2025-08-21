-- Script de reset complet de la base Supabase
-- ATTENTION: Ce script supprime TOUTES les données et structures

-- Suppression des tables dans l'ordre (gestion des dépendances)
DROP TABLE IF EXISTS user_trophies CASCADE;
DROP TABLE IF EXISTS trophies CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS progress_data CASCADE;
DROP TABLE IF EXISTS weekly_feedbacks CASCADE;
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Suppression des types personnalisés
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS exercise_theme CASCADE;
DROP TYPE IF EXISTS session_status CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS resource_type CASCADE;
DROP TYPE IF EXISTS trophy_category CASCADE;
DROP TYPE IF EXISTS trophy_type CASCADE;

-- Suppression des extensions (garder uuid-ossp car utilisé par auth.users)
-- DROP EXTENSION IF EXISTS "uuid-ossp"; -- Commenté car dépendance avec auth.users

-- Nettoyage des politiques RLS (si existantes)
-- Les politiques sont automatiquement supprimées avec les tables

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données complètement nettoyée. Prêt pour une nouvelle implémentation.';
    RAISE NOTICE 'Extension uuid-ossp conservée pour auth.users';
END $$;
