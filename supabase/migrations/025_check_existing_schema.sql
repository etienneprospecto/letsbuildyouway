-- Script pour vérifier le schéma existant et ajuster les requêtes

-- Vérifier les colonnes de la table workouts
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'workouts'
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table exercises
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'exercises'
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table workout_exercises
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'workout_exercises'
ORDER BY ordinal_position;
