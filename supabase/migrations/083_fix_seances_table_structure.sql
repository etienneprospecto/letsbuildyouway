-- Migration pour corriger la structure de la table seances
-- Cette migration restaure la structure correcte de la table seances

-- Supprimer la table seances actuelle
DROP TABLE IF EXISTS public.seances CASCADE;

-- Recréer la table seances avec la bonne structure
CREATE TABLE public.seances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  nom_seance TEXT NOT NULL,
  date_seance DATE NOT NULL,
  statut TEXT CHECK (statut IN ('programmée', 'terminée', 'manquée')) DEFAULT 'programmée',
  intensite_ressentie INTEGER CHECK (intensite_ressentie BETWEEN 1 AND 10),
  humeur TEXT,
  commentaire_client TEXT,
  date_fin TIMESTAMP,
  exercices_termines INTEGER DEFAULT 0,
  taux_reussite DECIMAL DEFAULT 0,
  reponse_coach TEXT,
  notes_coach TEXT,
  session_started_at TIMESTAMP,
  session_completed_at TIMESTAMP,
  total_duration INTEGER DEFAULT 0,
  average_difficulty DECIMAL(3,1) DEFAULT 0,
  average_energy DECIMAL(3,1) DEFAULT 0,
  average_form DECIMAL(3,1) DEFAULT 0,
  average_pain DECIMAL(3,1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Supprimer la table exercices_seance actuelle
DROP TABLE IF EXISTS public.exercices_seance CASCADE;

-- Recréer la table exercices_seance avec la bonne structure
CREATE TABLE public.exercices_seance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seance_id UUID REFERENCES seances(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  nom_exercice TEXT NOT NULL,
  series INTEGER NOT NULL,
  repetitions TEXT NOT NULL,
  temps_repos TEXT,
  ordre INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  sets_completed INTEGER DEFAULT 0,
  reps_completed TEXT,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  form_rating INTEGER CHECK (form_rating >= 1 AND form_rating <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 10),
  exercise_notes TEXT,
  exercise_duration INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_seances_client_id ON public.seances(client_id);
CREATE INDEX IF NOT EXISTS idx_seances_date ON public.seances(date_seance);
CREATE INDEX IF NOT EXISTS idx_exercices_seance_seance_id ON public.exercices_seance(seance_id);
CREATE INDEX IF NOT EXISTS idx_exercices_seance_exercise_id ON public.exercices_seance(exercise_id);

-- Recréer la fonction de calcul des moyennes
CREATE OR REPLACE FUNCTION calculate_session_feedback_averages()
RETURNS TRIGGER AS $$
DECLARE
    session_id UUID;
    avg_difficulty DECIMAL(3,1);
    avg_energy DECIMAL(3,1);
    avg_form DECIMAL(3,1);
    avg_pain DECIMAL(3,1);
    total_duration INTEGER;
BEGIN
    -- Récupérer l'ID de la séance
    session_id := NEW.seance_id;
    
    -- Calculer les moyennes des feedbacks
    SELECT 
        COALESCE(AVG(difficulty_rating), 0),
        COALESCE(AVG(energy_level), 0),
        COALESCE(AVG(form_rating), 0),
        COALESCE(AVG(pain_level), 0),
        COALESCE(SUM(exercise_duration), 0) / 60 -- convertir en minutes
    INTO avg_difficulty, avg_energy, avg_form, avg_pain, total_duration
    FROM exercices_seance 
    WHERE seance_id = session_id 
    AND completed = true;
    
    -- Mettre à jour la séance avec les moyennes calculées
    UPDATE seances 
    SET 
        average_difficulty = avg_difficulty,
        average_energy = avg_energy,
        average_form = avg_form,
        average_pain = avg_pain,
        total_duration = total_duration,
        updated_at = NOW()
    WHERE id = session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
DROP TRIGGER IF EXISTS trigger_calculate_session_feedback_averages ON exercices_seance;
CREATE TRIGGER trigger_calculate_session_feedback_averages
    AFTER UPDATE ON exercices_seance
    FOR EACH ROW
    WHEN (OLD.completed IS DISTINCT FROM NEW.completed OR 
          OLD.difficulty_rating IS DISTINCT FROM NEW.difficulty_rating OR
          OLD.energy_level IS DISTINCT FROM NEW.energy_level OR
          OLD.form_rating IS DISTINCT FROM NEW.form_rating OR
          OLD.pain_level IS DISTINCT FROM NEW.pain_level)
    EXECUTE FUNCTION calculate_session_feedback_averages();

-- Recréer la vue
CREATE OR REPLACE VIEW session_feedback_summary AS
SELECT 
    s.id as session_id,
    s.nom_seance,
    s.date_seance,
    s.statut,
    s.total_duration,
    s.average_difficulty,
    s.average_energy,
    s.average_form,
    s.average_pain,
    COUNT(es.id) as total_exercises,
    COUNT(CASE WHEN es.completed = true THEN 1 END) as completed_exercises,
    ROUND(
        (COUNT(CASE WHEN es.completed = true THEN 1 END)::DECIMAL / COUNT(es.id)) * 100, 
        2
    ) as completion_percentage
FROM seances s
LEFT JOIN exercices_seance es ON s.id = es.seance_id
GROUP BY s.id, s.nom_seance, s.date_seance, s.statut, s.total_duration, 
         s.average_difficulty, s.average_energy, s.average_form, s.average_pain;
