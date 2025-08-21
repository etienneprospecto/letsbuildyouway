import { create } from 'zustand'

export interface Exercise {
  id: string
  name: string
  theme: string
  objective: string
  instructions: string
  commonMistakes: string
  variations?: string
  imageUrl?: string
  videoUrl?: string
}

export interface WorkoutExercise {
  exerciseId: string
  sets: number
  reps: string
  rest: string
  notes?: string
}

export interface Workout {
  id: string
  name: string
  description?: string
  themes: string[]
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: number
  exercises: WorkoutExercise[]
  createdBy: string
  createdAt: string
  isTemplate: boolean
}

export interface Session {
  id: string
  clientId: string
  workoutId: string
  scheduledDate: string
  status: 'scheduled' | 'completed' | 'missed' | 'in-progress'
  feedback?: {
    intensity: number
    mood: string
    notes?: string
    completedAt: string
  }
}

interface WorkoutState {
  workouts: Workout[]
  exercises: Exercise[]
  sessions: Session[]
  isLoading: boolean
  
  // Actions
  setWorkouts: (workouts: Workout[]) => void
  addWorkout: (workout: Workout) => void
  updateWorkout: (id: string, updates: Partial<Workout>) => void
  deleteWorkout: (id: string) => void
  
  setExercises: (exercises: Exercise[]) => void
  addExercise: (exercise: Exercise) => void
  
  setSessions: (sessions: Session[]) => void
  addSession: (session: Session) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  
  setLoading: (loading: boolean) => void
  
  // Computed
  getWorkoutById: (id: string) => Workout | undefined
  getExerciseById: (id: string) => Exercise | undefined
  getSessionsByClient: (clientId: string) => Session[]
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  exercises: [],
  sessions: [],
  isLoading: false,

  setWorkouts: (workouts) => set({ workouts }),
  
  addWorkout: (workout) => set((state) => ({ 
    workouts: [...state.workouts, workout] 
  })),
  
  updateWorkout: (id, updates) => set((state) => ({
    workouts: state.workouts.map(workout => 
      workout.id === id ? { ...workout, ...updates } : workout
    )
  })),
  
  deleteWorkout: (id) => set((state) => ({
    workouts: state.workouts.filter(workout => workout.id !== id)
  })),
  
  setExercises: (exercises) => set({ exercises }),
  
  addExercise: (exercise) => set((state) => ({ 
    exercises: [...state.exercises, exercise] 
  })),
  
  setSessions: (sessions) => set({ sessions }),
  
  addSession: (session) => set((state) => ({ 
    sessions: [...state.sessions, session] 
  })),
  
  updateSession: (id, updates) => set((state) => ({
    sessions: state.sessions.map(session => 
      session.id === id ? { ...session, ...updates } : session
    )
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  getWorkoutById: (id) => get().workouts.find(workout => workout.id === id),
  
  getExerciseById: (id) => get().exercises.find(exercise => exercise.id === id),
  
  getSessionsByClient: (clientId) => get().sessions.filter(session => session.clientId === clientId)
}))