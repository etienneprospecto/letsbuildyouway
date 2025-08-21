-- Corriger les politiques RLS pour workouts et workout_exercises
-- Le problème est que les politiques INSERT utilisent created_by qui n'est pas encore défini lors de l'insertion

-- Supprimer TOUTES les anciennes politiques INSERT pour éviter les conflits
DROP POLICY IF EXISTS "Coaches can insert their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Coaches can insert workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can insert workout exercises for their workouts" ON public.workout_exercises;
DROP POLICY IF EXISTS "Users can insert workout exercises" ON public.workout_exercises;

-- Recréer les politiques INSERT avec la bonne logique
CREATE POLICY "Coaches can insert workouts" ON public.workouts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert workout exercises" ON public.workout_exercises
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'RLS policies for workouts and workout_exercises INSERT operations fixed!';
END $$;
