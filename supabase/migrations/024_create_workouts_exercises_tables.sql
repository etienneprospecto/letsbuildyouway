-- Créer la table exercises
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'balance', 'plyometric')),
    muscle_groups TEXT[] DEFAULT '{}',
    difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    equipment_needed TEXT[] DEFAULT '{}',
    instructions TEXT,
    video_url TEXT,
    image_url TEXT,
    estimated_duration_minutes INTEGER,
    calories_burn_rate INTEGER,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table workouts
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('strength', 'cardio', 'flexibility', 'recovery', 'general', 'custom')),
    difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_minutes INTEGER,
    target_audience TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_template BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table workout_exercises
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    sets INTEGER NOT NULL DEFAULT 1,
    reps INTEGER,
    duration_seconds INTEGER,
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    weight_kg DECIMAL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les indexes pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON public.exercises(created_by);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty_level ON public.exercises(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exercises_is_public ON public.exercises(is_public);

CREATE INDEX IF NOT EXISTS idx_workouts_created_by ON public.workouts(created_by);
CREATE INDEX IF NOT EXISTS idx_workouts_category ON public.workouts(category);
CREATE INDEX IF NOT EXISTS idx_workouts_difficulty_level ON public.workouts(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_workouts_is_template ON public.workouts(is_template);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON public.workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_order_index ON public.workout_exercises(order_index);

-- Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON public.workouts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at BEFORE UPDATE ON public.workout_exercises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activer RLS (Row Level Security)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour exercises
CREATE POLICY "Public exercises are viewable by everyone" ON public.exercises
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own exercises" ON public.exercises
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own exercises" ON public.exercises
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own exercises" ON public.exercises
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own exercises" ON public.exercises
    FOR DELETE USING (auth.uid() = created_by);

-- Politiques RLS pour workouts
CREATE POLICY "Coaches can view their own workouts" ON public.workouts
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Coaches can insert their own workouts" ON public.workouts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Coaches can update their own workouts" ON public.workouts
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Coaches can delete their own workouts" ON public.workouts
    FOR DELETE USING (auth.uid() = created_by);

-- Politiques RLS pour workout_exercises
CREATE POLICY "Users can view workout exercises of workouts they can access" ON public.workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = workout_exercises.workout_id
            AND workouts.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert workout exercises for their workouts" ON public.workout_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = workout_exercises.workout_id
            AND workouts.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update workout exercises of their workouts" ON public.workout_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = workout_exercises.workout_id
            AND workouts.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete workout exercises of their workouts" ON public.workout_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = workout_exercises.workout_id
            AND workouts.created_by = auth.uid()
        )
    );

-- Insérer des données de test
INSERT INTO public.exercises (name, description, category, difficulty_level, instructions, is_public, created_by) VALUES
('Push-ups', 'Classic push-up exercise for chest and triceps', 'strength', 'beginner', 'Start in plank position, lower your chest to the ground, then push back up', true, NULL),
('Squats', 'Lower body strength exercise', 'strength', 'intermediate', 'Stand with feet shoulder-width apart, lower as if sitting in a chair, then stand back up', true, NULL),
('Burpees', 'Full body cardio exercise', 'cardio', 'advanced', 'From standing, squat down, kick back to plank, do a push-up, then jump forward and up', true, NULL)
ON CONFLICT (name) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tables workouts, exercises, and workout_exercises created successfully with RLS policies!';
END $$;
