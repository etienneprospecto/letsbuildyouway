import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Seance = Database['public']['Tables']['seances']['Row']
type ExerciceSeance = Database['public']['Tables']['exercices_seance']['Row']
type SeanceInsert = Database['public']['Tables']['seances']['Insert']
type SeanceUpdate = Database['public']['Tables']['seances']['Update']
type ExerciceSeanceInsert = Database['public']['Tables']['exercices_seance']['Insert']

export interface SeanceWithExercices extends Seance {
  exercices?: ExerciceSeance[]
}

export class SeanceService {
  // Récupérer toutes les séances d'un client
  static async getSeancesByClient(clientId: string): Promise<SeanceWithExercices[]> {
    try {
      const { data: seances, error: seancesError } = await supabase
        .from('seances')
        .select('*')
        .eq('client_id', clientId)
        .order('date_seance', { ascending: false })

      if (seancesError) throw seancesError

      // Récupérer les exercices pour chaque séance
      const seancesWithExercices = await Promise.all(
        seances.map(async (seance) => {
          const { data: exercices, error: exercicesError } = await supabase
            .from('exercices_seance')
            .select('*')
            .eq('seance_id', seance.id)
            .order('ordre')

          if (exercicesError) throw exercicesError

          return {
            ...seance,
            exercices: exercices || []
          }
        })
      )

      return seancesWithExercices
    } catch (error) {
      console.error('Error fetching seances:', error)
      throw error
    }
  }

  // Créer une nouvelle séance
  static async createSeance(seanceData: SeanceInsert): Promise<Seance> {
    try {
      const { data, error } = await supabase
        .from('seances')
        .insert(seanceData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating seance:', error)
      throw error
    }
  }

  // Mettre à jour une séance
  static async updateSeance(seanceId: string, updates: SeanceUpdate): Promise<Seance> {
    try {
      const { data, error } = await supabase
        .from('seances')
        .update(updates)
        .eq('id', seanceId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating seance:', error)
      throw error
    }
  }

  // Supprimer une séance
  static async deleteSeance(seanceId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('seances')
        .delete()
        .eq('id', seanceId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting seance:', error)
      throw error
    }
  }

  // Ajouter des exercices à une séance
  static async addExercicesToSeance(seanceId: string, exercices: ExerciceSeanceInsert[]): Promise<ExerciceSeance[]> {
    try {
      const exercicesWithSeanceId = exercices.map(ex => ({ ...ex, seance_id: seanceId }))
      
      const { data, error } = await supabase
        .from('exercices_seance')
        .insert(exercicesWithSeanceId)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding exercices to seance:', error)
      throw error
    }
  }

  // Mettre à jour un exercice de séance
  static async updateExerciceSeance(exerciceId: string, updates: Partial<ExerciceSeance>): Promise<ExerciceSeance> {
    try {
      const { data, error } = await supabase
        .from('exercices_seance')
        .update(updates)
        .eq('id', exerciceId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating exercice seance:', error)
      throw error
    }
  }

  // Marquer une séance comme terminée
  static async markSeanceCompleted(seanceId: string, feedback: {
    intensite_ressentie: number
    humeur: string
    commentaire_client?: string
    exercices_termines: number
    taux_reussite: number
  }): Promise<Seance> {
    try {
      const updates: SeanceUpdate = {
        statut: 'terminée',
        intensite_ressentie: feedback.intensite_ressentie,
        humeur: feedback.humeur,
        commentaire_client: feedback.commentaire_client,
        exercices_termines: feedback.exercices_termines,
        taux_reussite: feedback.taux_reussite,
        date_fin: new Date().toISOString()
      }

      return await this.updateSeance(seanceId, updates)
    } catch (error) {
      console.error('Error marking seance completed:', error)
      throw error
    }
  }

  // Marquer une séance comme manquée
  static async markSeanceMissed(seanceId: string): Promise<Seance> {
    try {
      return await this.updateSeance(seanceId, { statut: 'manquée' })
    } catch (error) {
      console.error('Error marking seance missed:', error)
      throw error
    }
  }

  // Répondre à une séance (coach)
  static async respondToSeance(seanceId: string, reponse: string): Promise<Seance> {
    try {
      return await this.updateSeance(seanceId, { reponse_coach: reponse })
    } catch (error) {
      console.error('Error responding to seance:', error)
      throw error
    }
  }

  // S'abonner aux changements de séances d'un client (realtime)
  static subscribeToClientSeances(clientId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`seances_client_${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seances',
          filter: `client_id=eq.${clientId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exercices_seance',
          filter: `seance_id=in.(select id from seances where client_id='${clientId}')`
        },
        callback
      )
      .subscribe()
  }

  // Vérifier les séances manquées (programmées mais passées)
  static async checkMissedSeances(clientId: string): Promise<Seance[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('seances')
        .select('*')
        .eq('client_id', clientId)
        .eq('statut', 'programmée')
        .lt('date_seance', today)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error checking missed seances:', error)
      throw error
    }
  }

  // Marquer automatiquement les séances manquées
  static async autoMarkMissedSeances(clientId: string): Promise<number> {
    try {
      const missedSeances = await this.checkMissedSeances(clientId)
      
      if (missedSeances.length === 0) return 0

      const updates = missedSeances.map(seance => 
        this.markSeanceMissed(seance.id)
      )

      await Promise.all(updates)
      return missedSeances.length
    } catch (error) {
      console.error('Error auto-marking missed seances:', error)
      throw error
    }
  }
}

export default SeanceService
