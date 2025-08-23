export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'coach' | 'client'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'coach' | 'client'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'coach' | 'client'
          avatar_url?: string | null
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          coach_id: string
          first_name: string
          last_name: string
          age: number
          photo_url: string | null
          objective: string
          level: 'Débutant' | 'Intermédiaire' | 'Avancé'
          mentality: string
          coaching_type: string
          start_date: string
          end_date: string | null
          constraints: string | null
          allergies: string | null
          morphotype: string | null
          equipment: string | null
          lifestyle: string | null
          contact: string
          sports_history: string
          needs_attention: boolean
          poids_depart: number | null
          poids_objectif: number | null
          poids_actuel: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coach_id: string
          first_name: string
          last_name: string
          age: number
          photo_url?: string | null
          objective: string
          level: 'Débutant' | 'Intermédiaire' | 'Avancé'
          mentality: string
          coaching_type: string
          start_date: string
          end_date?: string | null
          constraints?: string | null
          allergies?: string | null
          morphotype?: string | null
          equipment?: string | null
          lifestyle?: string | null
          contact: string
          sports_history: string
          needs_attention?: boolean
          poids_depart?: number | null
          poids_objectif?: number | null
          poids_actuel?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          age?: number
          photo_url?: string | null
          objective?: string
          level?: 'Débutant' | 'Intermédiaire' | 'Avancé'
          mentality?: string
          coaching_type?: string
          end_date?: string | null
          constraints?: string | null
          allergies?: string | null
          morphotype?: string | null
          equipment?: string | null
          lifestyle?: string | null
          contact?: string
          sports_history?: string
          needs_attention?: boolean
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          theme: string
          video_url: string | null
          objective: string
          instructions: string
          common_mistakes: string
          variations: string | null
          image_url: string | null
          created_by: string
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          theme: string
          video_url?: string | null
          objective: string
          instructions: string
          common_mistakes: string
          variations?: string | null
          image_url?: string | null
          created_by: string
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          theme?: string
          video_url?: string | null
          objective?: string
          instructions?: string
          common_mistakes?: string
          variations?: string | null
          image_url?: string | null
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          name: string
          themes: string[]
          level: 'Débutant' | 'Intermédiaire' | 'Avancé'
          duration: number | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          themes: string[]
          level: 'Débutant' | 'Intermédiaire' | 'Avancé'
          duration?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          themes?: string[]
          level?: 'Débutant' | 'Intermédiaire' | 'Avancé'
          duration?: number | null
          updated_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          sets: number
          reps: string
          rest: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          sets: number
          reps: string
          rest: string
          order_index: number
          created_at?: string
        }
        Update: {
          sets?: number
          reps?: string
          rest?: string
          order_index?: number
        }
      }
      weekly_feedbacks: {
        Row: {
          id: string
          client_id: string
          week_start: string
          week_end: string
          alimentary_scores: Json
          lifestyle_scores: Json
          feelings_scores: Json
          alimentary_comment: string | null
          lifestyle_comment: string | null
          feelings_comment: string | null
          score: number
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          week_start: string
          week_end: string
          alimentary_scores: Json
          lifestyle_scores: Json
          feelings_scores: Json
          alimentary_comment?: string | null
          lifestyle_comment?: string | null
          feelings_comment?: string | null
          score: number
          submitted_at?: string
          created_at?: string
        }
        Update: {
          alimentary_scores?: Json
          lifestyle_scores?: Json
          feelings_scores?: Json
          alimentary_comment?: string | null
          lifestyle_comment?: string | null
          feelings_comment?: string | null
          score?: number
          submitted_at?: string
        }
      }
      progress_data: {
        Row: {
          id: string
          client_id: string
          date: string
          weight: number | null
          body_fat: number | null
          muscle_mass: number | null
          measurements: Json | null
          photos: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          date: string
          weight?: number | null
          body_fat?: number | null
          muscle_mass?: number | null
          measurements?: Json | null
          photos?: string[] | null
          created_at?: string
        }
        Update: {
          weight?: number | null
          body_fat?: number | null
          muscle_mass?: number | null
          measurements?: Json | null
          photos?: string[] | null
        }
      }
      sessions: {
        Row: {
          id: string
          client_id: string
          workout_id: string
          scheduled_date: string
          status: 'upcoming' | 'completed' | 'missed'
          intensity: number | null
          mood: string | null
          comment: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          workout_id: string
          scheduled_date: string
          status?: 'upcoming' | 'completed' | 'missed'
          intensity?: number | null
          mood?: string | null
          comment?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          status?: 'upcoming' | 'completed' | 'missed'
          intensity?: number | null
          mood?: string | null
          comment?: string | null
          completed_at?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          client_id: string
          coach_id: string
          last_message_at: string | null
          unread_count: number
          is_priority: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          coach_id: string
          last_message_at?: string | null
          unread_count?: number
          is_priority?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          last_message_at?: string | null
          unread_count?: number
          is_priority?: boolean
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          sender_type: 'coach' | 'client'
          content: string
          type: 'text' | 'image' | 'resource' | 'exercise'
          resource_id: string | null
          exercise_id: string | null
          image_url: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          sender_type: 'coach' | 'client'
          content: string
          type?: 'text' | 'image' | 'resource' | 'exercise'
          resource_id?: string | null
          exercise_id?: string | null
          image_url?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          content?: string
          read?: boolean
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          description: string
          type: 'video' | 'pdf' | 'link' | 'text'
          url: string | null
          content: string | null
          week_start: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          type: 'video' | 'pdf' | 'link' | 'text'
          url?: string | null
          content?: string | null
          week_start: string
          created_by: string
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          type?: 'video' | 'pdf' | 'link' | 'text'
          url?: string | null
          content?: string | null
        }
      }
      trophies: {
        Row: {
          id: string
          name: string
          description: string
          category: 'engagement' | 'discipline' | 'objective' | 'curiosity'
          type: 'simple' | 'progressive'
          levels: number[] | null
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'engagement' | 'discipline' | 'objective' | 'curiosity'
          type: 'simple' | 'progressive'
          levels?: number[] | null
          icon: string
          created_at?: string
        }
        Update: {
          name?: string
          description?: string
          category?: 'engagement' | 'discipline' | 'objective' | 'curiosity'
          type?: 'simple' | 'progressive'
          levels?: number[] | null
          icon?: string
        }
      }
      user_trophies: {
        Row: {
          id: string
          user_id: string
          trophy_id: string
          earned: boolean
          earned_at: string | null
          progress: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trophy_id: string
          earned?: boolean
          earned_at?: string | null
          progress?: number | null
          created_at?: string
        }
        Update: {
          earned?: boolean
          earned_at?: string | null
          progress?: number | null
        }
      }
      seances: {
        Row: {
          id: string
          client_id: string
          nom_seance: string
          date_seance: string
          statut: 'programmée' | 'terminée' | 'manquée'
          intensite_ressentie: number | null
          humeur: string | null
          commentaire_client: string | null
          date_fin: string | null
          exercices_termines: number
          taux_reussite: number
          reponse_coach: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          nom_seance: string
          date_seance: string
          statut?: 'programmée' | 'terminée' | 'manquée'
          intensite_ressentie?: number | null
          humeur?: string | null
          commentaire_client?: string | null
          date_fin?: string | null
          exercices_termines?: number
          taux_reussite?: number
          reponse_coach?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          nom_seance?: string
          date_seance?: string
          statut?: 'programmée' | 'terminée' | 'manquée'
          intensite_ressentie?: number | null
          humeur?: string | null
          commentaire_client?: string | null
          date_fin?: string | null
          exercices_termines?: number
          taux_reussite?: number
          reponse_coach?: string | null
          updated_at?: string
        }
      }
      exercices_seance: {
        Row: {
          id: string
          seance_id: string
          nom_exercice: string
          series: number
          repetitions: string
          temps_repos: string | null
          ordre: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          seance_id: string
          nom_exercice: string
          series: number
          repetitions: string
          temps_repos?: string | null
          ordre: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          nom_exercice?: string
          series?: number
          repetitions?: string
          temps_repos?: string | null
          ordre?: number
          completed?: boolean
        }
      }
      
      ressources_personnalisees: {
        Row: {
          id: string
          client_id: string
          nom_ressource: string
          type_ressource: 'video' | 'pdf' | 'link' | 'image' | 'document'
          theme: 'Alimentation' | 'Style de vie' | 'Ressentis' | 'Entraînement'
          url_fichier: string | null
          taille_fichier: number | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          nom_ressource: string
          type_ressource: 'video' | 'pdf' | 'link' | 'image' | 'document'
          theme: 'Alimentation' | 'Style de vie' | 'Ressentis' | 'Entraînement'
          url_fichier?: string | null
          taille_fichier?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          nom_ressource?: string
          type_ressource?: 'video' | 'pdf' | 'link' | 'image' | 'document'
          theme?: 'Alimentation' | 'Style de vie' | 'Ressentis' | 'Entraînement'
          url_fichier?: string | null
          taille_fichier?: number | null
          description?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'coach' | 'client'
      exercise_theme: 'Full Body' | 'Upper Body' | 'Lower Body' | 'Core' | 'Mobilité' | 'Assouplissement' | 'Respiration' | 'Circuit Training' | 'Split' | 'Yoga/Flow' | 'Force/Explosivité'
      session_status: 'upcoming' | 'completed' | 'missed'
      message_type: 'text' | 'image' | 'resource' | 'exercise'
      resource_type: 'video' | 'pdf' | 'link' | 'text'
      trophy_category: 'engagement' | 'discipline' | 'objective' | 'curiosity'
      trophy_type: 'simple' | 'progressive'
    }
  }
}