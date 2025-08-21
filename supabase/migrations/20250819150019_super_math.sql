/*
  # Données initiales pour FitCoach Pro

  1. Exercices de base
    - Exercices standards pour tous les thèmes
    - Images et instructions complètes

  2. Trophées système
    - Système de gamification complet
    - Trophées progressifs et simples

  3. Données de démonstration
    - Profils de test
    - Données réalistes pour la démo
*/

-- Insert base exercises
INSERT INTO exercises (id, name, theme, objective, instructions, common_mistakes, variations, image_url, created_by, is_custom) VALUES
  (gen_random_uuid(), 'Push-ups', 'Upper Body', 'Renforcer pectoraux, triceps et épaules', 'Position planche, descendre jusqu''à effleurer le sol, remonter', 'Cambrure excessive du dos, amplitude incomplète', 'Sur les genoux, inclinées, diamant', 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false),
  (gen_random_uuid(), 'Squats', 'Lower Body', 'Renforcer cuisses et fessiers', 'Pieds écartés largeur épaules, descendre comme pour s''asseoir', 'Genoux qui rentrent vers l''intérieur, dos rond', 'Sumo, pistol, jump squats', 'https://images.pexels.com/photos/863926/pexels-photo-863926.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false),
  (gen_random_uuid(), 'Planche', 'Core', 'Renforcer le core et la stabilité générale', 'Position planche sur les avant-bras, maintenir l''alignement corps droit', 'Hanches trop hautes ou trop basses, tête qui tombe', 'Sur les genoux, latérale, dynamique', 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false),
  (gen_random_uuid(), 'Burpees', 'Circuit Training', 'Exercice complet cardio-musculaire', 'Squat, planche, pompe, retour squat, saut vertical', 'Mouvements bâclés, mauvaise technique de pompe', 'Sans pompe, sans saut, avec mountain climbers', 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false),
  (gen_random_uuid(), 'Fentes', 'Lower Body', 'Renforcement des cuisses et fessiers', 'Grand pas en avant, descendre le genou arrière vers le sol', 'Genou avant qui dépasse la pointe du pied', 'Statiques, marchées, latérales, sautées', 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false),
  (gen_random_uuid(), 'Mountain Climbers', 'Circuit Training', 'Cardio intense et renforcement du core', 'Position planche, alterner rapidement les genoux vers la poitrine', 'Hanches qui remontent, rythme irrégulier', 'Lent et contrôlé, croisé, avec pause', 'https://images.pexels.com/photos/4162452/pexels-photo-4162452.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false),
  (gen_random_uuid(), 'Jumping Jacks', 'Circuit Training', 'Échauffement cardio et coordination', 'Saut en écartant bras et jambes simultanément', 'Rythme irrégulier, mauvaise coordination', 'Demi-amplitude, avec squat, croisé', 'https://images.pexels.com/photos/4162455/pexels-photo-4162455.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false),
  (gen_random_uuid(), 'Étirements ischio-jambiers', 'Assouplissement', 'Améliorer la flexibilité des muscles arrière de cuisse', 'Assis, jambe tendue, pencher le buste vers l''avant', 'Dos rond, force excessive, respiration bloquée', 'Debout, allongé, avec sangle', 'https://images.pexels.com/photos/4162456/pexels-photo-4162456.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false),
  (gen_random_uuid(), 'Respiration diaphragmatique', 'Respiration', 'Améliorer la capacité respiratoire et la relaxation', 'Allongé, main sur ventre, inspirer en gonflant le ventre', 'Respiration thoracique, rythme trop rapide', 'Assis, debout, avec comptage', 'https://images.pexels.com/photos/4162457/pexels-photo-4162457.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false),
  (gen_random_uuid(), 'Salutation au soleil', 'Yoga/Flow', 'Séquence complète mobilité et éveil corporel', 'Enchaînement fluide de postures yoga, synchronisé avec la respiration', 'Transitions trop rapides, respiration désynchronisée', 'Modifiée, avec variations, lente', 'https://images.pexels.com/photos/4162458/pexels-photo-4162458.jpeg?auto=compress&cs=tinysrgb&w=300', (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1), false);

-- Insert system trophies
INSERT INTO trophies (id, name, description, category, type, levels, icon) VALUES
  (gen_random_uuid(), 'Premier pas', 'Félicitations ! Tu as créé ton profil', 'engagement', 'simple', NULL, '🎯'),
  (gen_random_uuid(), 'Première séance', 'Tu as terminé ta première séance d''entraînement', 'engagement', 'simple', NULL, '💪'),
  (gen_random_uuid(), 'Premier feedback', 'Tu as soumis ton premier feedback hebdomadaire', 'engagement', 'simple', NULL, '📝'),
  (gen_random_uuid(), 'Régularité', 'Complète des séances d''entraînement', 'discipline', 'progressive', ARRAY[5, 10, 25, 50, 100], '🔥'),
  (gen_random_uuid(), 'Semaine parfaite', 'Complète toutes tes séances de la semaine', 'discipline', 'progressive', ARRAY[1, 3, 5, 10, 20], '⭐'),
  (gen_random_uuid(), 'Feedback régulier', 'Soumets tes feedbacks hebdomadaires', 'discipline', 'progressive', ARRAY[3, 5, 10, 20, 50], '📊'),
  (gen_random_uuid(), 'Progression', 'Progresse vers ton objectif principal', 'objective', 'progressive', ARRAY[25, 50, 75, 100], '📈'),
  (gen_random_uuid(), 'Transformation', 'Ajoute des photos d''évolution', 'objective', 'progressive', ARRAY[1, 3, 5, 10, 20], '📸'),
  (gen_random_uuid(), 'Objectif atteint', 'Félicitations ! Tu as atteint ton objectif principal', 'objective', 'simple', NULL, '🏆'),
  (gen_random_uuid(), 'Curieux', 'Consulte tes ressources hebdomadaires', 'curiosity', 'progressive', ARRAY[3, 5, 10, 20, 50], '🧠'),
  (gen_random_uuid(), 'Bien-être', 'Maintiens un bon score d''hygiène de vie', 'curiosity', 'progressive', ARRAY[5, 10, 20, 50, 100], '🌟'),
  (gen_random_uuid(), 'Équilibre', 'Score parfait (90+) sur une semaine', 'curiosity', 'progressive', ARRAY[1, 3, 5, 10, 25], '⚖️');