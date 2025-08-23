-- Migration pour ajouter le lien entre séances et workouts

-- Ajouter le champ workout_id à la table seances
ALTER TABLE seances ADD COLUMN IF NOT EXISTS workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL;

-- Créer un index pour optimiser les requêtes par workout
CREATE INDEX IF NOT EXISTS idx_seances_workout_id ON seances(workout_id);

-- Mettre à jour les types de base de données si nécessaire
-- (Cette migration permet de faire le lien entre les séances assignées et les workouts créés par le coach)
