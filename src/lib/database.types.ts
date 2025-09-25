export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          client_id: string
          client_notes: string | null
          coach_id: string
          coach_notes: string | null
          created_at: string | null
          end_time: string
          id: string
          location: string | null
          meeting_link: string | null
          price: number | null
          session_type: Database["public"]["Enums"]["session_type"]
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          client_id: string
          client_notes?: string | null
          coach_id: string
          coach_notes?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          price?: number | null
          session_type?: Database["public"]["Enums"]["session_type"]
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          client_id?: string
          client_notes?: string | null
          coach_id?: string
          coach_notes?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          price?: number | null
          session_type?: Database["public"]["Enums"]["session_type"]
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          coach_id: string
          created_at: string | null
          day_of_week: number
          duration_minutes: number
          end_time: string
          id: string
          is_active: boolean
          max_clients: number
          price: number | null
          session_type: Database["public"]["Enums"]["session_type"]
          start_time: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          day_of_week: number
          duration_minutes?: number
          end_time: string
          id?: string
          is_active?: boolean
          max_clients?: number
          price?: number | null
          session_type?: Database["public"]["Enums"]["session_type"]
          start_time: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          day_of_week?: number
          duration_minutes?: number
          end_time?: string
          id?: string
          is_active?: boolean
          max_clients?: number
          price?: number | null
          session_type?: Database["public"]["Enums"]["session_type"]
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_periods: {
        Row: {
          coach_id: string
          created_at: string | null
          end_date: string
          end_time: string | null
          id: string
          is_all_day: boolean
          reason: string
          start_date: string
          start_time: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          end_date: string
          end_time?: string | null
          id?: string
          is_all_day?: boolean
          reason: string
          start_date: string
          start_time?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          end_date?: string
          end_time?: string | null
          id?: string
          is_all_day?: boolean
          reason?: string
          start_date?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_periods_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string
          api_key: string | null
          calendar_id: string
          calendar_name: string | null
          coach_id: string
          created_at: string | null
          id: string
          is_active: boolean
          last_error: string | null
          last_sync: string | null
          provider: Database["public"]["Enums"]["calendar_provider"]
          refresh_token: string | null
          sync_settings: Json | null
          token_expires_at: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token: string
          api_key?: string | null
          calendar_id: string
          calendar_name?: string | null
          coach_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_sync?: string | null
          provider: Database["public"]["Enums"]["calendar_provider"]
          refresh_token?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string
          api_key?: string | null
          calendar_id?: string
          calendar_name?: string | null
          coach_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_sync?: string | null
          provider?: Database["public"]["Enums"]["calendar_provider"]
          refresh_token?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_notifications: {
        Row: {
          appointment_id: string
          created_at: string | null
          error_message: string | null
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          recipient_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "calendar_notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_settings: {
        Row: {
          auto_create_meeting_links: boolean
          auto_sync_enabled: boolean
          coach_id: string
          conflict_resolution_mode: Database["public"]["Enums"]["conflict_resolution_mode"]
          created_at: string | null
          default_meeting_provider: string | null
          event_prefix: string
          id: string
          include_client_details: boolean
          reminder_24h_enabled: boolean
          reminder_2h_enabled: boolean
          sync_frequency_minutes: number
          travel_time_minutes: number
          updated_at: string | null
        }
        Insert: {
          auto_create_meeting_links?: boolean
          auto_sync_enabled?: boolean
          coach_id: string
          conflict_resolution_mode?: Database["public"]["Enums"]["conflict_resolution_mode"]
          created_at?: string | null
          default_meeting_provider?: string | null
          event_prefix?: string
          id?: string
          include_client_details?: boolean
          reminder_24h_enabled?: boolean
          reminder_2h_enabled?: boolean
          sync_frequency_minutes?: number
          travel_time_minutes?: number
          updated_at?: string | null
        }
        Update: {
          auto_create_meeting_links?: boolean
          auto_sync_enabled?: boolean
          coach_id?: string
          conflict_resolution_mode?: Database["public"]["Enums"]["conflict_resolution_mode"]
          created_at?: string | null
          default_meeting_provider?: string | null
          event_prefix?: string
          id?: string
          include_client_details?: boolean
          reminder_24h_enabled?: boolean
          reminder_2h_enabled?: boolean
          sync_frequency_minutes?: number
          travel_time_minutes?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_settings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_invitations: {
        Row: {
          accepted_at: string | null
          client_data: Json | null
          client_email: string
          client_first_name: string
          client_last_name: string
          coach_id: string
          created_at: string | null
          expires_at: string
          id: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          client_data?: Json | null
          client_email: string
          client_first_name: string
          client_last_name: string
          coach_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          status?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          client_data?: Json | null
          client_email?: string
          client_first_name?: string
          client_last_name?: string
          coach_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invitations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          age: number
          allergies: string | null
          body_fat_percentage: number | null
          coach_id: string
          coaching_type: string
          constraints: string | null
          contact: string
          created_at: string | null
          date_of_birth: string | null
          dietary_restrictions: string | null
          end_date: string | null
          equipment: string | null
          first_name: string
          fitness_level: string | null
          gender: string | null
          height: number | null
          height_cm: number | null
          id: string
          last_name: string
          last_session_date: string | null
          level: string
          lifestyle: string | null
          medical_conditions: string | null
          mentality: string
          morphotype: string | null
          needs_attention: boolean | null
          next_session_date: string | null
          objective: string
          phone: string | null
          photo_url: string | null
          poids_actuel: number | null
          poids_depart: number | null
          poids_objectif: number | null
          primary_goal: string | null
          progress_percentage: number | null
          sessions_completed: number | null
          sports_history: string
          start_date: string
          status: string | null
          total_workouts: number | null
          updated_at: string | null
          weight: number | null
          weight_kg: number | null
        }
        Insert: {
          age: number
          allergies?: string | null
          body_fat_percentage?: number | null
          coach_id: string
          coaching_type: string
          constraints?: string | null
          contact: string
          created_at?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string | null
          end_date?: string | null
          equipment?: string | null
          first_name: string
          fitness_level?: string | null
          gender?: string | null
          height?: number | null
          height_cm?: number | null
          id?: string
          last_name: string
          last_session_date?: string | null
          level: string
          lifestyle?: string | null
          medical_conditions?: string | null
          mentality: string
          morphotype?: string | null
          needs_attention?: boolean | null
          next_session_date?: string | null
          objective: string
          phone?: string | null
          photo_url?: string | null
          poids_actuel?: number | null
          poids_depart?: number | null
          poids_objectif?: number | null
          primary_goal?: string | null
          progress_percentage?: number | null
          sessions_completed?: number | null
          sports_history: string
          start_date: string
          status?: string | null
          total_workouts?: number | null
          updated_at?: string | null
          weight?: number | null
          weight_kg?: number | null
        }
        Update: {
          age?: number
          allergies?: string | null
          body_fat_percentage?: number | null
          coach_id?: string
          coaching_type?: string
          constraints?: string | null
          contact?: string
          created_at?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string | null
          end_date?: string | null
          equipment?: string | null
          first_name?: string
          fitness_level?: string | null
          gender?: string | null
          height?: number | null
          height_cm?: number | null
          id?: string
          last_name?: string
          last_session_date?: string | null
          level?: string
          lifestyle?: string | null
          medical_conditions?: string | null
          mentality?: string
          morphotype?: string | null
          needs_attention?: boolean | null
          next_session_date?: string | null
          objective?: string
          phone?: string | null
          photo_url?: string | null
          poids_actuel?: number | null
          poids_depart?: number | null
          poids_objectif?: number | null
          primary_goal?: string | null
          progress_percentage?: number | null
          sessions_completed?: number | null
          sports_history?: string
          start_date?: string
          status?: string | null
          total_workouts?: number | null
          updated_at?: string | null
          weight?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_client_relations: {
        Row: {
          client_email: string
          client_id: string
          coach_email: string
          coach_id: string
          created_at: string | null
          id: string
          relation_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          client_email: string
          client_id: string
          coach_email: string
          coach_id: string
          created_at?: string | null
          id?: string
          relation_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          client_email?: string
          client_id?: string
          coach_email?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          relation_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_client_relations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_client_relations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          id: string
          is_online: boolean | null
          last_message: string | null
          last_message_time: string | null
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          is_online?: boolean | null
          last_message?: string | null
          last_message_time?: string | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercices_seance: {
        Row: {
          completed: boolean | null
          created_at: string | null
          duree_secondes: number | null
          exercise_id: string
          id: string
          nom_exercice: string | null
          notes: string | null
          ordre: number
          poids_kg: number | null
          repetitions: string | null
          repos_secondes: number | null
          seance_id: string
          series: number | null
          temps_repos: string | null
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          duree_secondes?: number | null
          exercise_id: string
          id?: string
          nom_exercice?: string | null
          notes?: string | null
          ordre: number
          poids_kg?: number | null
          repetitions?: string | null
          repos_secondes?: number | null
          seance_id: string
          series?: number | null
          temps_repos?: string | null
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          duree_secondes?: number | null
          exercise_id?: string
          id?: string
          nom_exercice?: string | null
          notes?: string | null
          ordre?: number
          poids_kg?: number | null
          repetitions?: string | null
          repos_secondes?: number | null
          seance_id?: string
          series?: number | null
          temps_repos?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercices_seance_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercices_seance_seance_id_fkey"
            columns: ["seance_id"]
            isOneToOne: false
            referencedRelation: "seances"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          difficulty_level: string | null
          equipment_needed: string[] | null
          id: string
          image_url: string | null
          instructions: string | null
          is_public: boolean | null
          muscle_groups: string[] | null
          name: string
          tags: string[] | null
          tips: string | null
          type: Database["public"]["Enums"]["exercise_type"] | null
          updated_at: string | null
          video_url: string | null
          warnings: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          difficulty_level?: string | null
          equipment_needed?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_public?: boolean | null
          muscle_groups?: string[] | null
          name: string
          tags?: string[] | null
          tips?: string | null
          type?: Database["public"]["Enums"]["exercise_type"] | null
          updated_at?: string | null
          video_url?: string | null
          warnings?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          difficulty_level?: string | null
          equipment_needed?: string[] | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_public?: boolean | null
          muscle_groups?: string[] | null
          name?: string
          tags?: string[] | null
          tips?: string | null
          type?: Database["public"]["Enums"]["exercise_type"] | null
          updated_at?: string | null
          video_url?: string | null
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_questions: {
        Row: {
          created_at: string | null
          id: string
          options: string[] | null
          order_index: number
          ordre: number | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          required: boolean | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          options?: string[] | null
          order_index?: number
          ordre?: number | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          required?: boolean | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          options?: string[] | null
          order_index?: number
          ordre?: number | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          required?: boolean | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "feedback_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          created_at: string | null
          feedback_id: string
          id: string
          question_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          response: Json
        }
        Insert: {
          created_at?: string | null
          feedback_id: string
          id?: string
          question_id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          response: Json
        }
        Update: {
          created_at?: string | null
          feedback_id?: string
          id?: string
          question_id?: string
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          response?: Json
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks_hebdomadaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_question_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_templates: {
        Row: {
          coach_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          status: Database["public"]["Enums"]["feedback_status"] | null
          updated_at: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          status?: Database["public"]["Enums"]["feedback_status"] | null
          updated_at?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          status?: Database["public"]["Enums"]["feedback_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feedbacks_hebdomadaires: {
        Row: {
          client_id: string | null
          coach_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          responses: Json | null
          score: number | null
          sent_at: string | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          template_id: string | null
          updated_at: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          client_id?: string | null
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          responses?: Json | null
          score?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          template_id?: string | null
          updated_at?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          client_id?: string | null
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          responses?: Json | null
          score?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          template_id?: string | null
          updated_at?: string | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_hebdomadaires_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_hebdomadaires_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_hebdomadaires_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "feedback_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      hydration_tracking: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          glasses_count: number
          id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date?: string
          glasses_count?: number
          id?: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          glasses_count?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hydration_tracking_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
          sender_type: string
          timestamp: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
          sender_type: string
          timestamp: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
          sender_type?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_comments: {
        Row: {
          coach_id: string
          comment: string
          created_at: string | null
          id: string
          nutrition_entry_id: string
        }
        Insert: {
          coach_id: string
          comment: string
          created_at?: string | null
          id?: string
          nutrition_entry_id: string
        }
        Update: {
          coach_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          nutrition_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_comments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_comments_nutrition_entry_id_fkey"
            columns: ["nutrition_entry_id"]
            isOneToOne: false
            referencedRelation: "nutrition_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_entries: {
        Row: {
          calories: number | null
          carbs: number | null
          client_id: string
          coach_id: string
          created_at: string | null
          description: string
          fats: number | null
          id: string
          meal_type: string
          photo_url: string | null
          proteins: number | null
          updated_at: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          client_id: string
          coach_id: string
          created_at?: string | null
          description: string
          fats?: number | null
          id?: string
          meal_type: string
          photo_url?: string | null
          proteins?: number | null
          updated_at?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          client_id?: string
          coach_id?: string
          created_at?: string | null
          description?: string
          fats?: number | null
          id?: string
          meal_type?: string
          photo_url?: string | null
          proteins?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_entries_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_goals: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string | null
          daily_calories: number | null
          daily_carbs: number | null
          daily_fats: number | null
          daily_proteins: number | null
          daily_water_glasses: number | null
          id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string | null
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fats?: number | null
          daily_proteins?: number | null
          daily_water_glasses?: number | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string | null
          daily_calories?: number | null
          daily_carbs?: number | null
          daily_fats?: number | null
          daily_proteins?: number | null
          daily_water_glasses?: number | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_goals_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      progress_data: {
        Row: {
          body_fat_percentage: number | null
          client_id: string
          created_at: string | null
          id: string
          measurement_date: string
          measurements: Json | null
          muscle_mass_kg: number | null
          notes: string | null
          photos_urls: string[] | null
          updated_at: string | null
          waist_circumference: number | null
          weight_kg: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          client_id: string
          created_at?: string | null
          id?: string
          measurement_date: string
          measurements?: Json | null
          muscle_mass_kg?: number | null
          notes?: string | null
          photos_urls?: string[] | null
          updated_at?: string | null
          waist_circumference?: number | null
          weight_kg?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          client_id?: string
          created_at?: string | null
          id?: string
          measurement_date?: string
          measurements?: Json | null
          muscle_mass_kg?: number | null
          notes?: string | null
          photos_urls?: string[] | null
          updated_at?: string | null
          waist_circumference?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_data_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          file_path: string | null
          id: string
          is_public: boolean | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          is_public?: boolean | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ressources_personnalisees: {
        Row: {
          client_id: string
          created_at: string | null
          date_creation: string | null
          description: string | null
          fichier_path: string | null
          id: string
          nom_ressource: string | null
          tags: string[] | null
          taille_fichier: number | null
          theme: string | null
          titre: string
          type_ressource: string
          updated_at: string | null
          url: string | null
          url_fichier: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date_creation?: string | null
          description?: string | null
          fichier_path?: string | null
          id?: string
          nom_ressource?: string | null
          tags?: string[] | null
          taille_fichier?: number | null
          theme?: string | null
          titre: string
          type_ressource: string
          updated_at?: string | null
          url?: string | null
          url_fichier?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date_creation?: string | null
          description?: string | null
          fichier_path?: string | null
          id?: string
          nom_ressource?: string | null
          tags?: string[] | null
          taille_fichier?: number | null
          theme?: string | null
          titre?: string
          type_ressource?: string
          updated_at?: string | null
          url?: string | null
          url_fichier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ressources_personnalisees_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      seances: {
        Row: {
          client_id: string
          commentaire_client: string | null
          created_at: string | null
          date_fin: string | null
          date_seance: string
          duree_minutes: number | null
          evaluation: number | null
          exercices_termines: number | null
          humeur: string | null
          id: string
          intensite_ressentie: number | null
          nom_seance: string
          notes: string | null
          reponse_coach: string | null
          statut: string | null
          taux_reussite: number | null
          updated_at: string | null
          workout_id: string | null
        }
        Insert: {
          client_id: string
          commentaire_client?: string | null
          created_at?: string | null
          date_fin?: string | null
          date_seance: string
          duree_minutes?: number | null
          evaluation?: number | null
          exercices_termines?: number | null
          humeur?: string | null
          id?: string
          intensite_ressentie?: number | null
          nom_seance: string
          notes?: string | null
          reponse_coach?: string | null
          statut?: string | null
          taux_reussite?: number | null
          updated_at?: string | null
          workout_id?: string | null
        }
        Update: {
          client_id?: string
          commentaire_client?: string | null
          created_at?: string | null
          date_fin?: string | null
          date_seance?: string
          duree_minutes?: number | null
          evaluation?: number | null
          exercices_termines?: number | null
          humeur?: string | null
          id?: string
          intensite_ressentie?: number | null
          nom_seance?: string
          notes?: string | null
          reponse_coach?: string | null
          statut?: string | null
          taux_reussite?: number | null
          updated_at?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seances_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_events: {
        Row: {
          appointment_id: string | null
          coach_id: string
          created_at: string | null
          error_message: string | null
          event_data: Json | null
          external_event_id: string
          id: string
          last_synced: string | null
          provider: Database["public"]["Enums"]["calendar_provider"]
          sync_direction: Database["public"]["Enums"]["sync_direction"]
          sync_status: Database["public"]["Enums"]["sync_status"]
        }
        Insert: {
          appointment_id?: string | null
          coach_id: string
          created_at?: string | null
          error_message?: string | null
          event_data?: Json | null
          external_event_id: string
          id?: string
          last_synced?: string | null
          provider: Database["public"]["Enums"]["calendar_provider"]
          sync_direction: Database["public"]["Enums"]["sync_direction"]
          sync_status?: Database["public"]["Enums"]["sync_status"]
        }
        Update: {
          appointment_id?: string | null
          coach_id?: string
          created_at?: string | null
          error_message?: string | null
          event_data?: Json | null
          external_event_id?: string
          id?: string
          last_synced?: string | null
          provider?: Database["public"]["Enums"]["calendar_provider"]
          sync_direction?: Database["public"]["Enums"]["sync_direction"]
          sync_status?: Database["public"]["Enums"]["sync_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sync_events_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_events_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trophies: {
        Row: {
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon_url: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_trophies: {
        Row: {
          created_at: string | null
          earned_date: string | null
          id: string
          trophy_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          earned_date?: string | null
          id?: string
          trophy_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          earned_date?: string | null
          id?: string
          trophy_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trophies_trophy_id_fkey"
            columns: ["trophy_id"]
            isOneToOne: false
            referencedRelation: "trophies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_trophies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_feedbacks: {
        Row: {
          adherence_percentage: number | null
          client_id: string
          coach_feedback: string | null
          coach_id: string | null
          completed_at: string | null
          created_at: string | null
          energy_level: number | null
          general_mood: string | null
          id: string
          motivation_level: number | null
          notes: string | null
          sent_at: string | null
          sleep_quality: number | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          stress_level: number | null
          template_id: string | null
          updated_at: string | null
          week_end: string | null
          week_end_date: string
          week_start: string | null
          week_start_date: string
        }
        Insert: {
          adherence_percentage?: number | null
          client_id: string
          coach_feedback?: string | null
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          energy_level?: number | null
          general_mood?: string | null
          id?: string
          motivation_level?: number | null
          notes?: string | null
          sent_at?: string | null
          sleep_quality?: number | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          stress_level?: number | null
          template_id?: string | null
          updated_at?: string | null
          week_end?: string | null
          week_end_date: string
          week_start?: string | null
          week_start_date: string
        }
        Update: {
          adherence_percentage?: number | null
          client_id?: string
          coach_feedback?: string | null
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          energy_level?: number | null
          general_mood?: string | null
          id?: string
          motivation_level?: number | null
          notes?: string | null
          sent_at?: string | null
          sleep_quality?: number | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          stress_level?: number | null
          template_id?: string | null
          updated_at?: string | null
          week_end?: string | null
          week_end_date?: string
          week_start?: string | null
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_feedbacks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_feedbacks_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_feedbacks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "feedback_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          updated_at: string | null
          weight_kg: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          updated_at?: string | null
          weight_kg?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          updated_at?: string | null
          weight_kg?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          calories_burn_rate: number | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          estimated_duration_minutes: number | null
          id: string
          instructions: string | null
          is_template: boolean | null
          name: string
          tags: string[] | null
          target_audience: string[] | null
          target_muscle_groups: string[] | null
          tips: string | null
          type: Database["public"]["Enums"]["workout_type"] | null
          updated_at: string | null
          warnings: string | null
        }
        Insert: {
          calories_burn_rate?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_template?: boolean | null
          name: string
          tags?: string[] | null
          target_audience?: string[] | null
          target_muscle_groups?: string[] | null
          tips?: string | null
          type?: Database["public"]["Enums"]["workout_type"] | null
          updated_at?: string | null
          warnings?: string | null
        }
        Update: {
          calories_burn_rate?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_template?: boolean | null
          name?: string
          tags?: string[] | null
          target_audience?: string[] | null
          target_muscle_groups?: string[] | null
          tips?: string | null
          type?: Database["public"]["Enums"]["workout_type"] | null
          updated_at?: string | null
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workouts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          id: string
          coach_id: string
          name: string
          description: string | null
          price_amount: number
          currency: string
          billing_interval: Database["public"]["Enums"]["billing_interval"]
          session_count: number | null
          features: Json
          is_active: boolean
          stripe_price_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          coach_id: string
          name: string
          description?: string | null
          price_amount: number
          currency?: string
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          session_count?: number | null
          features?: Json
          is_active?: boolean
          stripe_price_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          coach_id?: string
          name?: string
          description?: string | null
          price_amount?: number
          currency?: string
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          session_count?: number | null
          features?: Json
          is_active?: boolean
          stripe_price_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          coach_id: string
          client_id: string
          pricing_plan_id: string
          stripe_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          current_period_start: string | null
          current_period_end: string | null
          next_billing_date: string | null
          sessions_remaining: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          coach_id: string
          client_id: string
          pricing_plan_id: string
          stripe_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          current_period_start?: string | null
          current_period_end?: string | null
          next_billing_date?: string | null
          sessions_remaining?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          coach_id?: string
          client_id?: string
          pricing_plan_id?: string
          stripe_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          current_period_start?: string | null
          current_period_end?: string | null
          next_billing_date?: string | null
          sessions_remaining?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_pricing_plan_id_fkey"
            columns: ["pricing_plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          id: string
          coach_id: string
          client_id: string
          subscription_id: string | null
          invoice_number: string
          stripe_invoice_id: string | null
          amount_total: number
          amount_paid: number
          currency: string
          status: Database["public"]["Enums"]["invoice_status"]
          due_date: string
          paid_at: string | null
          items: Json
          notes: string | null
          pdf_url: string | null
          tax_rate: number
          tax_amount: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          coach_id: string
          client_id: string
          subscription_id?: string | null
          invoice_number: string
          stripe_invoice_id?: string | null
          amount_total: number
          amount_paid?: number
          currency?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          due_date: string
          paid_at?: string | null
          items: Json
          notes?: string | null
          pdf_url?: string | null
          tax_rate?: number
          tax_amount?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          coach_id?: string
          client_id?: string
          subscription_id?: string | null
          invoice_number?: string
          stripe_invoice_id?: string | null
          amount_total?: number
          amount_paid?: number
          currency?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          due_date?: string
          paid_at?: string | null
          items?: Json
          notes?: string | null
          pdf_url?: string | null
          tax_rate?: number
          tax_amount?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["payment_status"]
          processed_at: string | null
          failure_reason: string | null
          metadata: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id: string
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          processed_at?: string | null
          failure_reason?: string | null
          metadata?: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          processed_at?: string | null
          failure_reason?: string | null
          metadata?: Json
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          id: string
          invoice_id: string
          reminder_type: Database["public"]["Enums"]["reminder_type"]
          sent_at: string | null
          status: Database["public"]["Enums"]["reminder_status"]
          email_content: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id: string
          reminder_type: Database["public"]["Enums"]["reminder_type"]
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          email_content?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string
          reminder_type?: Database["public"]["Enums"]["reminder_type"]
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          email_content?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          id: string
          coach_id: string
          stripe_account_id: string | null
          stripe_publishable_key: string | null
          stripe_secret_key: string | null
          payment_methods_enabled: Json
          auto_invoice_generation: boolean
          reminder_schedule: Json
          company_info: Json
          is_configured: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          coach_id: string
          stripe_account_id?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          payment_methods_enabled?: Json
          auto_invoice_generation?: boolean
          reminder_schedule?: Json
          company_info?: Json
          is_configured?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          coach_id?: string
          stripe_account_id?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          payment_methods_enabled?: Json
          auto_invoice_generation?: boolean
          reminder_schedule?: Json
          company_info?: Json
          is_configured?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_settings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhooks: {
        Row: {
          id: string
          stripe_event_id: string
          event_type: string
          processed: boolean
          data: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          stripe_event_id: string
          event_type: string
          processed?: boolean
          data: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          stripe_event_id?: string
          event_type?: string
          processed?: boolean
          data?: Json
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_appointment_conflicts: {
        Args: {
          p_appointment_date: string
          p_coach_id: string
          p_end_time: string
          p_exclude_appointment_id?: string
          p_start_time: string
        }
        Returns: boolean
      }
      get_available_slots: {
        Args: {
          p_coach_id: string
          p_date: string
          p_session_type?: Database["public"]["Enums"]["session_type"]
        }
        Returns: {
          available_spots: number
          duration_minutes: number
          end_time: string
          max_clients: number
          price: number
          session_type: Database["public"]["Enums"]["session_type"]
          slot_id: string
          start_time: string
        }[]
      }
      get_calendar_conflicts_simple: {
        Args: { p_coach_id: string; p_end_date?: string; p_start_date?: string }
        Returns: {
          conflict_end: string
          conflict_id: string
          conflict_start: string
          conflict_title: string
          conflict_type: string
          provider: string
          severity: string
        }[]
      }
      validate_calendar_integration: {
        Args: {
          p_access_token: string
          p_api_key: string
          p_calendar_id: string
          p_provider: string
        }
        Returns: boolean
      }
      get_coach_financial_stats: {
        Args: {
          p_coach_id: string
          p_period_days: number
        }
        Returns: Json
      }
      create_subscription: {
        Args: {
          p_coach_id: string
          p_client_id: string
          p_pricing_plan_id: string
          p_stripe_subscription_id?: string
        }
        Returns: string
      }
      create_invoice: {
        Args: {
          p_coach_id: string
          p_client_id: string
          p_subscription_id?: string
          p_items: Json
          p_due_date?: string
          p_notes?: string
        }
        Returns: string
      }
    }
    Enums: {
      appointment_status: "pending" | "confirmed" | "cancelled" | "completed"
      calendar_provider: "google" | "outlook" | "apple"
      conflict_resolution_mode: "manual" | "auto_reschedule" | "auto_block"
      exercise_difficulty: "beginner" | "intermediate" | "advanced"
      exercise_type:
        | "Cardio"
        | "Musculation"
        | "Étirement"
        | "Pilates"
        | "Yoga"
        | "CrossFit"
        | "Fonctionnel"
        | "Autre"
      feedback_status: "draft" | "sent" | "in_progress" | "completed"
      feedback_type: "Hebdomadaire" | "Mensuel" | "Trimestriel" | "Personnalisé"
      notification_status: "pending" | "sent" | "failed"
      notification_type:
        | "reminder_24h"
        | "reminder_2h"
        | "booking_confirmation"
        | "cancellation"
      question_type: "text" | "scale_1_10" | "multiple_choice" | "yes_no"
      resource_type: "document" | "video" | "link" | "image"
      seance_status:
        | "planned"
        | "in_progress"
        | "completed"
        | "missed"
        | "cancelled"
      session_type: "individual" | "group" | "video" | "in_person"
      sync_direction: "import" | "export" | "bidirectional"
      sync_status: "success" | "failed" | "pending"
      user_role: "coach" | "client"
      workout_difficulty: "beginner" | "intermediate" | "advanced"
      workout_type:
        | "Entraînement"
        | "Récupération"
        | "Test"
        | "Compétition"
        | "Autre"
      billing_interval: "one_time" | "weekly" | "monthly" | "quarterly" | "yearly"
      subscription_status: "active" | "paused" | "cancelled" | "past_due" | "incomplete" | "trialing"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "void"
      payment_status: "pending" | "succeeded" | "failed" | "cancelled" | "requires_action"
      payment_method: "card" | "bank_transfer" | "sepa" | "apple_pay" | "google_pay" | "cash" | "other"
      reminder_type: "first_notice" | "second_notice" | "final_notice" | "overdue"
      reminder_status: "pending" | "sent" | "failed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: ["pending", "confirmed", "cancelled", "completed"],
      calendar_provider: ["google", "outlook", "apple"],
      conflict_resolution_mode: ["manual", "auto_reschedule", "auto_block"],
      exercise_difficulty: ["beginner", "intermediate", "advanced"],
      exercise_type: [
        "Cardio",
        "Musculation",
        "Étirement",
        "Pilates",
        "Yoga",
        "CrossFit",
        "Fonctionnel",
        "Autre",
      ],
      feedback_status: ["draft", "sent", "in_progress", "completed"],
      feedback_type: ["Hebdomadaire", "Mensuel", "Trimestriel", "Personnalisé"],
      notification_status: ["pending", "sent", "failed"],
      notification_type: [
        "reminder_24h",
        "reminder_2h",
        "booking_confirmation",
        "cancellation",
      ],
      question_type: ["text", "scale_1_10", "multiple_choice", "yes_no"],
      resource_type: ["document", "video", "link", "image"],
      seance_status: [
        "planned",
        "in_progress",
        "completed",
        "missed",
        "cancelled",
      ],
      session_type: ["individual", "group", "video", "in_person"],
      sync_direction: ["import", "export", "bidirectional"],
      sync_status: ["success", "failed", "pending"],
      user_role: ["coach", "client"],
      workout_difficulty: ["beginner", "intermediate", "advanced"],
      workout_type: [
        "Entraînement",
        "Récupération",
        "Test",
        "Compétition",
        "Autre",
      ],
      billing_interval: ["one_time", "weekly", "monthly", "quarterly", "yearly"],
      subscription_status: ["active", "paused", "cancelled", "past_due", "incomplete", "trialing"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled", "void"],
      payment_status: ["pending", "succeeded", "failed", "cancelled", "requires_action"],
      payment_method: ["card", "bank_transfer", "sepa", "apple_pay", "google_pay", "cash", "other"],
      reminder_type: ["first_notice", "second_notice", "final_notice", "overdue"],
      reminder_status: ["pending", "sent", "failed", "cancelled"],
    },
  },
} as const