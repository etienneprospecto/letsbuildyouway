-- Script pour ajuster le WorkoutService selon le schéma existant

-- D'abord, vérifions le schéma réel des tables
DO $$
DECLARE
    workouts_columns TEXT[];
    exercises_columns TEXT[];
    workout_exercises_columns TEXT[];
BEGIN
    -- Récupérer les colonnes de workouts
    SELECT array_agg(column_name::text ORDER BY ordinal_position)
    INTO workouts_columns
    FROM information_schema.columns
    WHERE table_name = 'workouts';

    -- Récupérer les colonnes d'exercises
    SELECT array_agg(column_name::text ORDER BY ordinal_position)
    INTO exercises_columns
    FROM information_schema.columns
    WHERE table_name = 'exercises';

    -- Récupérer les colonnes de workout_exercises
    SELECT array_agg(column_name::text ORDER BY ordinal_position)
    INTO workout_exercises_columns
    FROM information_schema.columns
    WHERE table_name = 'workout_exercises';

    -- Afficher les résultats
    RAISE NOTICE 'workouts columns: %', workouts_columns;
    RAISE NOTICE 'exercises columns: %', exercises_columns;
    RAISE NOTICE 'workout_exercises columns: %', workout_exercises_columns;
END $$;

-- Si les tables n'existent pas encore, créons-les
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    difficulty_level TEXT NOT NULL DEFAULT 'beginner',
    instructions TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    difficulty_level TEXT NOT NULL DEFAULT 'beginner',
    estimated_duration_minutes INTEGER,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    sets INTEGER NOT NULL DEFAULT 1,
    reps INTEGER,
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les colonnes manquantes si nécessaire
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS muscle_groups TEXT[] DEFAULT '{}';
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS equipment_needed TEXT[] DEFAULT '{}';
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS calories_burn_rate INTEGER;
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT '{}';
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS created_by UUID;

ALTER TABLE public.workout_exercises ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE public.workout_exercises ADD COLUMN IF NOT EXISTS weight_kg DECIMAL;
ALTER TABLE public.workout_exercises ADD COLUMN IF NOT EXISTS notes TEXT;

-- Créer les indexes
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON public.exercises(created_by);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);
CREATE INDEX IF NOT EXISTS idx_workouts_created_by ON public.workouts(created_by);
CREATE INDEX IF NOT EXISTS idx_workouts_category ON public.workouts(category);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);

-- Créer les triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_exercises_updated_at ON public.exercises;
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_workouts_updated_at ON public.workouts;
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_workout_exercises_updated_at ON public.workout_exercises;
CREATE TRIGGER update_workout_exercises_updated_at BEFORE UPDATE ON public.workout_exercises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ajouter une contrainte unique sur le nom si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'unique_exercises_name'
        AND table_name = 'exercises'
    ) THEN
        ALTER TABLE public.exercises ADD CONSTRAINT unique_exercises_name UNIQUE (name);
    END IF;
END $$;

-- Insérer des données de test si nécessaire
INSERT INTO public.exercises (name, description, category, difficulty_level, instructions, is_public)
VALUES
('Push-ups', 'Classic push-up exercise for chest and triceps', 'strength', 'beginner', 'Start in plank position, lower your chest to the ground, then push back up', true),
('Squats', 'Lower body strength exercise', 'strength', 'intermediate', 'Stand with feet shoulder-width apart, lower as if sitting in a chair, then stand back up', true),
('Burpees', 'Full body cardio exercise', 'cardio', 'advanced', 'From standing, squat down, kick back to plank, do a push-up, then jump forward and up', true)
ON CONFLICT (name) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Workout tables have been created/updated successfully!';
END $$;
