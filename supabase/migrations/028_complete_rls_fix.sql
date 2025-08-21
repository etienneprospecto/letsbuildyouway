-- Migration complète pour corriger les politiques RLS des tables workouts et workout_exercises
-- Vérifier d'abord l'état actuel et supprimer toutes les politiques problématiques

-- 1. Désactiver temporairement RLS pour pouvoir nettoyer
ALTER TABLE public.workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes
DO $$
DECLARE
    policy_name text;
BEGIN
    -- Supprimer toutes les politiques de workouts
    FOR policy_name IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'workouts' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.workouts', policy_name);
    END LOOP;
    
    -- Supprimer toutes les politiques de workout_exercises
    FOR policy_name IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'workout_exercises' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.workout_exercises', policy_name);
    END LOOP;
END $$;

-- 3. Réactiver RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- 4. Créer les nouvelles politiques simplifiées et fonctionnelles
-- Workouts - Politiques de base
CREATE POLICY "workouts_select_policy" ON public.workouts
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "workouts_insert_policy" ON public.workouts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "workouts_update_policy" ON public.workouts
    FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "workouts_delete_policy" ON public.workouts
    FOR DELETE USING (auth.uid() = coach_id);

-- Workout_exercises - Politiques de base
CREATE POLICY "workout_exercises_select_policy" ON public.workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = workout_exercises.workout_id
            AND workouts.coach_id = auth.uid()
        )
    );

CREATE POLICY "workout_exercises_insert_policy" ON public.workout_exercises
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "workout_exercises_update_policy" ON public.workout_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = workout_exercises.workout_id
            AND workouts.coach_id = auth.uid()
        )
    );

CREATE POLICY "workout_exercises_delete_policy" ON public.workout_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workouts
            WHERE workouts.id = workout_exercises.workout_id
            AND workouts.coach_id = auth.uid()
        )
    );

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'All RLS policies for workouts and workout_exercises have been completely reset and recreated!';
    RAISE NOTICE 'The tables should now work properly for INSERT operations.';
END $$;
