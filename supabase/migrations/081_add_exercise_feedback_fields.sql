-- Migration pour ajouter les champs de feedback par exercice
-- Cette migration ajoute des colonnes pour stocker les feedbacks détaillés de chaque exercice

-- Ajouter les colonnes de feedback à la table exercices_seance
ALTER TABLE exercices_seance 
ADD COLUMN IF NOT EXISTS sets_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reps_completed TEXT,
ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
ADD COLUMN IF NOT EXISTS form_rating INTEGER CHECK (form_rating >= 1 AND form_rating <= 10),
ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
ADD COLUMN IF NOT EXISTS pain_level INTEGER CHECK (pain_level >= 1 AND pain_level <= 10),
ADD COLUMN IF NOT EXISTS exercise_notes TEXT,
ADD COLUMN IF NOT EXISTS exercise_duration INTEGER DEFAULT 0, -- en secondes
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Ajouter des index pour améliorer les performances des requêtes de feedback
CREATE INDEX IF NOT EXISTS idx_exercices_seance_feedback 
ON exercices_seance (seance_id, completed, completed_at);

CREATE INDEX IF NOT EXISTS idx_exercices_seance_difficulty 
ON exercices_seance (difficulty_rating) WHERE difficulty_rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exercices_seance_energy 
ON exercices_seance (energy_level) WHERE energy_level IS NOT NULL;

-- Ajouter des colonnes pour le suivi global de la séance
ALTER TABLE seances 
ADD COLUMN IF NOT EXISTS total_duration INTEGER DEFAULT 0, -- durée totale en minutes
ADD COLUMN IF NOT EXISTS average_difficulty DECIMAL(3,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_energy DECIMAL(3,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_form DECIMAL(3,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_pain DECIMAL(3,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS session_completed_at TIMESTAMP WITH TIME ZONE;

-- Créer une fonction pour calculer automatiquement les moyennes de feedback
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

-- Créer le trigger pour calculer automatiquement les moyennes
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

-- Ajouter des commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN exercices_seance.sets_completed IS 'Nombre de séries réellement effectuées par le client';
COMMENT ON COLUMN exercices_seance.reps_completed IS 'Répétitions réellement effectuées (peut différer de repetitions)';
COMMENT ON COLUMN exercices_seance.difficulty_rating IS 'Difficulté ressentie par le client (1-10)';
COMMENT ON COLUMN exercices_seance.form_rating IS 'Qualité de la forme/technique (1-10)';
COMMENT ON COLUMN exercices_seance.energy_level IS 'Niveau d''énergie du client (1-10)';
COMMENT ON COLUMN exercices_seance.pain_level IS 'Niveau de douleur ressentie (1-10)';
COMMENT ON COLUMN exercices_seance.exercise_notes IS 'Notes personnelles du client sur l''exercice';
COMMENT ON COLUMN exercices_seance.exercise_duration IS 'Durée réelle de l''exercice en secondes';
COMMENT ON COLUMN exercices_seance.started_at IS 'Heure de début de l''exercice';
COMMENT ON COLUMN exercices_seance.completed_at IS 'Heure de fin de l''exercice';

COMMENT ON COLUMN seances.total_duration IS 'Durée totale de la séance en minutes';
COMMENT ON COLUMN seances.average_difficulty IS 'Difficulté moyenne ressentie (1-10)';
COMMENT ON COLUMN seances.average_energy IS 'Énergie moyenne du client (1-10)';
COMMENT ON COLUMN seances.average_form IS 'Forme moyenne du client (1-10)';
COMMENT ON COLUMN seances.average_pain IS 'Douleur moyenne ressentie (1-10)';
COMMENT ON COLUMN seances.session_started_at IS 'Heure de début de la séance';
COMMENT ON COLUMN seances.session_completed_at IS 'Heure de fin de la séance';

-- Créer une vue pour faciliter l'analyse des feedbacks
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

-- Ajouter des contraintes de validation
ALTER TABLE exercices_seance 
ADD CONSTRAINT check_difficulty_rating_range 
CHECK (difficulty_rating IS NULL OR (difficulty_rating >= 1 AND difficulty_rating <= 10));

ALTER TABLE exercices_seance 
ADD CONSTRAINT check_form_rating_range 
CHECK (form_rating IS NULL OR (form_rating >= 1 AND form_rating <= 10));

ALTER TABLE exercices_seance 
ADD CONSTRAINT check_energy_level_range 
CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 10));

ALTER TABLE exercices_seance 
ADD CONSTRAINT check_pain_level_range 
CHECK (pain_level IS NULL OR (pain_level >= 1 AND pain_level <= 10));

-- Ajouter des contraintes pour les moyennes de séance
ALTER TABLE seances 
ADD CONSTRAINT check_average_difficulty_range 
CHECK (average_difficulty IS NULL OR (average_difficulty >= 0 AND average_difficulty <= 10));

ALTER TABLE seances 
ADD CONSTRAINT check_average_energy_range 
CHECK (average_energy IS NULL OR (average_energy >= 0 AND average_energy <= 10));

ALTER TABLE seances 
ADD CONSTRAINT check_average_form_range 
CHECK (average_form IS NULL OR (average_form >= 0 AND average_form <= 10));

ALTER TABLE seances 
ADD CONSTRAINT check_average_pain_range 
CHECK (average_pain IS NULL OR (average_pain >= 0 AND average_pain <= 10));
