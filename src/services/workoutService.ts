import { supabase } from '../lib/supabase';
import { Workout } from '../types';

export const workoutService = {
  async getWorkouts(coachId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercises (*)
        )
      `)
      .eq('created_by', coachId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createWorkout(workoutData: Omit<Workout, 'id'> & { createdBy: string }) {
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        name: workoutData.name,
        themes: workoutData.themes,
        level: workoutData.level,
        duration: workoutData.duration,
        created_by: workoutData.createdBy
      })
      .select()
      .single();

    if (workoutError) throw workoutError;

    // Insert workout exercises
    const workoutExercises = workoutData.exercises.map((exercise, index) => ({
      workout_id: workout.id,
      exercise_id: exercise.exercise.id,
      sets: exercise.sets,
      reps: exercise.reps,
      rest: exercise.rest,
      order_index: index
    }));

    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(workoutExercises);

    if (exercisesError) throw exercisesError;

    return workout;
  },

  async updateWorkout(workoutId: string, updates: Partial<Workout>) {
    const { data, error } = await supabase
      .from('workouts')
      .update({
        name: updates.name,
        themes: updates.themes,
        level: updates.level,
        duration: updates.duration,
        updated_at: new Date().toISOString()
      })
      .eq('id', workoutId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteWorkout(workoutId: string) {
    // Delete workout exercises first
    await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', workoutId);

    // Then delete workout
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
  }
};