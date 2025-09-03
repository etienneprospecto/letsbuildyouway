import { supabase } from '@/lib/supabase'

export interface Client {
  id: string
  coach_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  height_cm: number | null
  weight_kg: number | null
  body_fat_percentage: number | null
  primary_goal: string
  fitness_level: string
  status: string
  start_date: string
  last_session_date: string | null
  next_session_date: string | null
  progress_percentage: number
  sessions_completed: number
  total_workouts: number
  notes: string | null
  medical_conditions: string | null
  dietary_restrictions: string | null
  // Champs supplémentaires pour la fiche client complète
  mentality?: string
  coaching_type?: string
  constraints?: string
  allergies?: string
  morphotype?: string
  equipment?: string
  lifestyle?: string
  contact?: string
  sports_history?: string
  // Champs de progression
  poids_depart?: number | null
  poids_objectif?: number | null
  poids_actuel?: number | null
  created_at: string
  updated_at: string
}

export interface CreateClientData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: string
  height_cm?: number
  weight_kg?: number
  body_fat_percentage?: number
  primary_goal: string
  fitness_level: string
  status?: string
  notes?: string
  medical_conditions?: string
  dietary_restrictions?: string
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string
  // Champs supplémentaires pour la fiche client complète
  mentality?: string
  coaching_type?: string
  start_date?: string
  constraints?: string
  allergies?: string
  morphotype?: string
  equipment?: string
  lifestyle?: string
  contact?: string
  sports_history?: string
  poids_depart?: number
  poids_objectif?: number
  poids_actuel?: number
}

export class ClientService {
  // Récupérer tous les clients d'un coach
  static async getClientsByCoach(coachId: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching clients:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getClientsByCoach:', error)
      throw error
    }
  }

  // Récupérer un client par ID
  static async getClientById(clientId: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (error) {
        console.error('Error fetching client:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getClientById:', error)
      throw error
    }
  }

  // Créer un nouveau client
  static async createClient(coachId: string, clientData: CreateClientData): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          coach_id: coachId,
          status: clientData.status || 'active',
          start_date: new Date().toISOString().split('T')[0],
          progress_percentage: 0,
          sessions_completed: 0,
          total_workouts: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating client:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createClient:', error)
      throw error
    }
  }

  // Mettre à jour un client
  static async updateClient(clientId: string, updateData: UpdateClientData): Promise<Client> {
    try {
      console.log('updateClient called with:', { clientId, updateData })
      const { data, error } = await supabase
        .from('clients')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single()

      console.log('updateClient result:', { data, error })
      if (error) {
        console.error('Error updating client:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateClient:', error)
      throw error
    }
  }

  // Supprimer un client
  static async deleteClient(clientId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) {
        console.error('Error deleting client:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteClient:', error)
      throw error
    }
  }

  // Mettre à jour la progression d'un client
  static async updateClientProgress(
    clientId: string, 
    progressData: {
      progress_percentage?: number
      sessions_completed?: number
      total_workouts?: number
      last_session_date?: string
    }
  ): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          ...progressData,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single()

      if (error) {
        console.error('Error updating client progress:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateClientProgress:', error)
      throw error
    }
  }

  // Rechercher des clients
  static async searchClients(
    coachId: string, 
    searchTerm: string, 
    filters?: {
      status?: string
      fitness_level?: string
      primary_goal?: string
    }
  ): Promise<Client[]> {
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .eq('coach_id', coachId)

      // Appliquer les filtres
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.fitness_level) {
        query = query.eq('fitness_level', filters.fitness_level)
      }
      if (filters?.primary_goal) {
        query = query.eq('primary_goal', filters.primary_goal)
      }

      // Recherche textuelle
      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching clients:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in searchClients:', error)
      throw error
    }
  }

  // Obtenir les statistiques des clients
  static async getClientStats(coachId: string): Promise<{
    totalClients: number
    activeClients: number
    averageProgress: number
    totalSessions: number
  }> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('status, progress_percentage, sessions_completed')
        .eq('coach_id', coachId)

      if (error) {
        console.error('Error fetching client stats:', error)
        throw error
      }

      const totalClients = data?.length || 0
      const activeClients = data?.filter(c => c.status === 'active').length || 0
      const averageProgress = totalClients > 0 
        ? Math.round(data?.reduce((sum, c) => sum + c.progress_percentage, 0) / totalClients)
        : 0
      const totalSessions = data?.reduce((sum, c) => sum + c.sessions_completed, 0) || 0

      return {
        totalClients,
        activeClients,
        averageProgress,
        totalSessions
      }
    } catch (error) {
      console.error('Error in getClientStats:', error)
      throw error
    }
  }

  // Récupérer un client par email (utilisé côté client pour mapper auth.uid -> clients.id)
  static async getClientByEmail(email: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('contact', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching client by email:', error)
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Error in getClientByEmail:', error)
      throw error
    }
  }
}

export default ClientService