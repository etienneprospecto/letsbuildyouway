import { supabase } from '../lib/supabase'

// Types
export interface Exercise {
  id: string
  name: string
  description?: string
  category: string
  muscle_groups?: string[]
  difficulty_level: string
  equipment_needed?: string[]
  instructions?: string
  video_url?: string
  image_url?: string
  estimated_duration_minutes?: number
  calories_burn_rate?: number
  created_by?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  name: string
  description?: string
  category: string
  difficulty_level: string
  estimated_duration_minutes?: number
  target_audience?: string[]
  tags?: string[]
  is_template: boolean
  coach_id: string
  created_at: string
  updated_at: string
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  order_index: number
  sets: number
  reps?: number
  duration_seconds?: number
  rest_seconds: number
  weight_kg?: number
  notes?: string
  created_at: string
  updated_at: string
  exercise: Exercise
}

export interface WorkoutWithExercises extends Workout {
  workout_exercises: WorkoutExercise[]
}

export interface CreateExerciseData {
  name: string
  description?: string
  category: string
  muscle_groups?: string[]
  difficulty_level: string
  equipment_needed?: string[]
  instructions?: string
  video_url?: string
  image_url?: string
  estimated_duration_minutes?: number
  calories_burn_rate?: number
  is_public: boolean
}

export interface CreateWorkoutData {
  name: string
  description?: string
  category: string
  difficulty_level: string
  estimated_duration_minutes?: number
  target_audience?: string[]
  tags?: string[]
  is_template: boolean
}

export interface AddExerciseToWorkoutData {
  exercise_id: string
  order_index: number
  sets: number
  reps?: number
  duration_seconds?: number
  rest_seconds: number
  weight_kg?: number
  notes?: string
}

export class WorkoutService {
  // Exercices
  static async getExercises(userId?: string): Promise<Exercise[]> {
    console.log('getExercises called with userId:', userId)
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name')

    if (userId) {
      query = query.or(`created_by.eq.${userId},is_public.eq.true`)
    } else {
      query = query.eq('is_public', true)
    }

    const { data, error } = await query
    console.log('getExercises result:', { data, error })
    if (error) throw error
    return data || []
  }

  static async createExercise(userId: string, exerciseData: CreateExerciseData): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert({
        ...exerciseData,
        created_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateExercise(exerciseId: string, updateData: Partial<CreateExerciseData>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .update(updateData)
      .eq('id', exerciseId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteExercise(exerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId)

    if (error) throw error
  }

  // Workouts
  static async getWorkoutsByCoach(coachId: string): Promise<WorkoutWithExercises[]> {
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
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createWorkout(coachId: string, workoutData: CreateWorkoutData): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert({
        ...workoutData,
        created_by: coachId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateWorkout(workoutId: string, updateData: Partial<CreateWorkoutData>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update(updateData)
      .eq('id', workoutId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteWorkout(workoutId: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)

    if (error) throw error
  }

  // Workout Exercises
  static async addExerciseToWorkout(workoutId: string, exerciseData: AddExerciseToWorkoutData): Promise<WorkoutExercise> {
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: workoutId,
        ...exerciseData
      })
      .select(`
        *,
        exercises (*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async updateWorkoutExercise(workoutExerciseId: string, updateData: Partial<AddExerciseToWorkoutData>): Promise<WorkoutExercise> {
    const { data, error } = await supabase
      .from('workout_exercises')
      .update(updateData)
      .eq('id', workoutExerciseId)
      .select(`
        *,
        exercises (*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async removeExerciseFromWorkout(workoutExerciseId: string): Promise<void> {
    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('id', workoutExerciseId)

    if (error) throw error
  }

  static async reorderWorkoutExercises(workoutId: string, exerciseOrders: { id: string, order_index: number }[]): Promise<void> {
    const updates = exerciseOrders.map(({ id, order_index }) =>
      supabase
        .from('workout_exercises')
        .update({ order_index })
        .eq('id', id)
    )

    await Promise.all(updates)
  }

  // Statistiques
  static async getWorkoutStats(coachId: string): Promise<{
    totalWorkouts: number
    activeWorkouts: number
    totalExercises: number
    averageDuration: number
  }> {
    // Récupérer les stats des workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('id, estimated_duration_minutes, is_template')
      .eq('created_by', coachId)

    if (workoutsError) throw workoutsError

    // Récupérer les stats des exercices
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id')
      .eq('created_by', coachId)

    if (exercisesError) throw exercisesError

    const totalWorkouts = workouts?.length || 0
    const activeWorkouts = workouts?.filter(w => !w.is_template).length || 0
    const totalExercises = exercises?.length || 0
    const averageDuration = workouts?.length
      ? Math.round((workouts.reduce((sum, w) => sum + (w.estimated_duration_minutes || 0), 0) / workouts.length))
      : 0

    return {
      totalWorkouts,
      activeWorkouts,
      totalExercises,
      averageDuration
    }
  }
}