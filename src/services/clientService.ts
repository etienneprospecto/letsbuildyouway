import { supabase } from '@/lib/supabase'
import { ErrorHandler, ApiError } from './errorHandler'

// Interface pour les données de base de données (correspond exactement à la table)
export interface DbClient {
  id: string
  coach_id: string
  first_name: string
  last_name: string
  age: number
  photo_url: string | null
  objective: string
  level: string
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
  needs_attention: boolean | null
  created_at: string | null
  updated_at: string | null
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  height_cm: number | null
  weight_kg: number | null
  body_fat_percentage: number | null
  primary_goal: string | null
  fitness_level: string | null
  status: string | null
  last_session_date: string | null
  next_session_date: string | null
  progress_percentage: number | null
  sessions_completed: number | null
  total_workouts: number | null
  medical_conditions: string | null
  dietary_restrictions: string | null
  poids_depart: number | null
  poids_objectif: number | null
  poids_actuel: number | null
  weight: number | null
  height: number | null
}

// Interface pour le frontend (avec mapping des champs)
export interface Client {
  id: string
  coach_id: string
  first_name: string
  last_name: string
  email: string // Mappé depuis contact
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  height_cm: number | null
  weight_kg: number | null
  body_fat_percentage: number | null
  objective: string // Mappé depuis primary_goal
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
  // Fonctions de mapping
  private static mapDbClientToClient(dbClient: DbClient): Client {
    return {
      id: dbClient.id,
      coach_id: dbClient.coach_id,
      first_name: dbClient.first_name,
      last_name: dbClient.last_name,
      email: dbClient.contact, // Mapping contact -> email
      phone: dbClient.phone,
      date_of_birth: dbClient.date_of_birth,
      gender: dbClient.gender,
      height_cm: dbClient.height_cm,
      weight_kg: dbClient.weight_kg,
      body_fat_percentage: dbClient.body_fat_percentage,
      objective: dbClient.primary_goal || dbClient.objective, // Mapping primary_goal -> objective
      fitness_level: dbClient.fitness_level || dbClient.level,
      status: dbClient.status || 'active',
      start_date: dbClient.start_date,
      last_session_date: dbClient.last_session_date,
      next_session_date: dbClient.next_session_date,
      progress_percentage: dbClient.progress_percentage || 0,
      sessions_completed: dbClient.sessions_completed || 0,
      total_workouts: dbClient.total_workouts || 0,
      notes: dbClient.constraints,
      medical_conditions: dbClient.medical_conditions,
      dietary_restrictions: dbClient.dietary_restrictions,
      mentality: dbClient.mentality,
      coaching_type: dbClient.coaching_type,
      constraints: dbClient.constraints,
      allergies: dbClient.allergies,
      morphotype: dbClient.morphotype,
      equipment: dbClient.equipment,
      lifestyle: dbClient.lifestyle,
      contact: dbClient.contact,
      sports_history: dbClient.sports_history,
      poids_depart: dbClient.poids_depart,
      poids_objectif: dbClient.poids_objectif,
      poids_actuel: dbClient.poids_actuel,
      created_at: dbClient.created_at || new Date().toISOString(),
      updated_at: dbClient.updated_at || new Date().toISOString()
    }
  }

  private static mapClientToDbClient(client: Partial<Client>): Partial<DbClient> {
    return {
      first_name: client.first_name,
      last_name: client.last_name,
      contact: client.email || client.contact, // Mapping email -> contact
      phone: client.phone,
      date_of_birth: client.date_of_birth,
      gender: client.gender,
      height_cm: client.height_cm,
      weight_kg: client.weight_kg,
      body_fat_percentage: client.body_fat_percentage,
      primary_goal: client.objective, // Mapping objective -> primary_goal
      fitness_level: client.fitness_level,
      status: client.status,
      start_date: client.start_date,
      last_session_date: client.last_session_date,
      next_session_date: client.next_session_date,
      progress_percentage: client.progress_percentage,
      sessions_completed: client.sessions_completed,
      total_workouts: client.total_workouts,
      medical_conditions: client.medical_conditions,
      dietary_restrictions: client.dietary_restrictions,
      mentality: client.mentality,
      coaching_type: client.coaching_type,
      constraints: client.constraints,
      allergies: client.allergies,
      morphotype: client.morphotype,
      equipment: client.equipment,
      lifestyle: client.lifestyle,
      sports_history: client.sports_history,
      poids_depart: client.poids_depart,
      poids_objectif: client.poids_objectif,
      poids_actuel: client.poids_actuel
    }
  }

  // Récupérer tous les clients d'un coach avec pagination
  static async getClientsByCoach(
    coachId: string, 
    page?: number, 
    limit?: number
  ): Promise<Client[] | { clients: Client[], total: number, hasMore: boolean }> {
    try {
      // Si pas de pagination, retourner directement le tableau
      if (!page || !limit) {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('coach_id', coachId)
          .order('created_at', { ascending: false })

        if (error) {
          ErrorHandler.handleSupabaseError(error, 'getClientsByCoach')
        }

        return (data || []).map(dbClient => this.mapDbClientToClient(dbClient))
      }

      // Mode paginé
      const offset = (page - 1) * limit

      // Compter le total
      const { count, error: countError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('coach_id', coachId)

      if (countError) {
        ErrorHandler.handleSupabaseError(countError, 'getClientsByCoach count')
      }

      // Récupérer les données
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'getClientsByCoach')
      }

      const clients = (data || []).map(dbClient => this.mapDbClientToClient(dbClient))
      const total = count || 0
      const hasMore = offset + limit < total

      return { clients, total, hasMore }
    } catch (error) {
      if (error instanceof ApiError) throw error
      ErrorHandler.handleSupabaseError(error, 'getClientsByCoach')
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
        if (error.code === 'PGRST116') {
          return null // Client non trouvé
        }
        ErrorHandler.handleSupabaseError(error, 'getClientById')
      }

      return data ? this.mapDbClientToClient(data) : null
    } catch (error) {
      if (error instanceof ApiError) throw error
      ErrorHandler.handleSupabaseError(error, 'getClientById')
    }
  }

  // Créer un nouveau client
  static async createClient(coachId: string, clientData: CreateClientData): Promise<Client> {
    try {
      const dbData = {
        ...clientData,
        contact: clientData.email, // Mapping email -> contact
        primary_goal: clientData.primary_goal, // Garder primary_goal pour la DB
        coach_id: coachId,
        status: clientData.status || 'active',
        start_date: new Date().toISOString().split('T')[0],
        progress_percentage: 0,
        sessions_completed: 0,
        total_workouts: 0
      }

      const { data, error } = await supabase
        .from('clients')
        .insert(dbData)
        .select()
        .single()

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'createClient')
      }

      return this.mapDbClientToClient(data)
    } catch (error) {
      if (error instanceof ApiError) throw error
      ErrorHandler.handleSupabaseError(error, 'createClient')
    }
  }

  // Mettre à jour un client
  static async updateClient(clientId: string, updateData: UpdateClientData): Promise<Client> {
    try {
      const dbUpdateData = this.mapClientToDbClient(updateData)
      dbUpdateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('clients')
        .update(dbUpdateData)
        .eq('id', clientId)
        .select()
        .single()

      if (error) {
        ErrorHandler.handleSupabaseError(error, 'updateClient')
      }

      return this.mapDbClientToClient(data)
    } catch (error) {
      if (error instanceof ApiError) throw error
      ErrorHandler.handleSupabaseError(error, 'updateClient')
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
        ErrorHandler.handleSupabaseError(error, 'deleteClient')
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      ErrorHandler.handleSupabaseError(error, 'deleteClient')
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
        ErrorHandler.handleSupabaseError(error, 'getClientByEmail')
      }

      return data ? this.mapDbClientToClient(data) : null
    } catch (error) {
      if (error instanceof ApiError) throw error
      ErrorHandler.handleSupabaseError(error, 'getClientByEmail')
    }
  }
}

export default ClientService