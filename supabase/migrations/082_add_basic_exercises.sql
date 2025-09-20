-- Migration pour ajouter des exercices de base
-- Cette migration ajoute des exercices fondamentaux pour tester le système

-- Insérer des exercices de base
INSERT INTO public.exercises (name, description, type, muscle_groups, difficulty, equipment_needed, video_url, image_url) VALUES
('Push-ups', 'Exercice de musculation pour les pectoraux, triceps et deltoïdes', 'musculation', ARRAY['pectoraux', 'triceps', 'deltoïdes'], 'Intermédiaire', ARRAY[]::text[], null, null),
('Squats', 'Exercice de musculation pour les jambes et fessiers', 'musculation', ARRAY['quadriceps', 'fessiers', 'ischio-jambiers'], 'Facile', ARRAY[]::text[], null, null),
('Planche', 'Exercice de gainage pour le core', 'musculation', ARRAY['abdominaux', 'lombaires', 'deltoïdes'], 'Intermédiaire', ARRAY[]::text[], null, null),
('Burpees', 'Exercice cardio complet', 'cardio', ARRAY['tout le corps'], 'Difficile', ARRAY[]::text[], null, null),
('Pompes inclinées', 'Variante plus facile des pompes', 'musculation', ARRAY['pectoraux', 'triceps', 'deltoïdes'], 'Facile', ARRAY['banc'], null, null),
('Fentes', 'Exercice unilatéral pour les jambes', 'musculation', ARRAY['quadriceps', 'fessiers', 'ischio-jambiers'], 'Intermédiaire', ARRAY[]::text[], null, null),
('Mountain Climbers', 'Exercice cardio pour le core', 'cardio', ARRAY['abdominaux', 'deltoïdes', 'quadriceps'], 'Intermédiaire', ARRAY[]::text[], null, null),
('Pompes diamant', 'Variante avancée des pompes', 'musculation', ARRAY['triceps', 'pectoraux'], 'Difficile', ARRAY[]::text[], null, null),
('Jumping Jacks', 'Exercice cardio simple', 'cardio', ARRAY['tout le corps'], 'Facile', ARRAY[]::text[], null, null),
('Superman', 'Exercice pour le dos et les fessiers', 'musculation', ARRAY['lombaires', 'fessiers', 'deltoïdes'], 'Facile', ARRAY[]::text[], null, null);

-- Vérifier que les exercices ont été créés
SELECT COUNT(*) as total_exercises FROM public.exercises;
