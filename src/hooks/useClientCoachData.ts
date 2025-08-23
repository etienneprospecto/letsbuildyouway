import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'

interface CoachClientRelation {
  coach_id: string
  client_id: string
  coach_email: string | null
  client_email: string | null
  relation_active: boolean
}

export const useClientCoachData = () => {
  const { user, profile } = useAuth()
  const [relation, setRelation] = useState<CoachClientRelation | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const isClient = profile?.role === 'client'

  useEffect(() => {
    const fetchRelation = async () => {
      if (!user || !isClient) {
        setLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('coach_client_relations')
          .select('coach_id, client_id, coach_email, client_email, relation_active')
          .eq('client_id', user.id)
          .eq('relation_active', true)
          .maybeSingle()

        if (error) throw error
        setRelation(data || null)
      } catch (e: any) {
        setError(e?.message || 'Erreur de chargement de la relation')
      } finally {
        setLoading(false)
      }
    }
    fetchRelation()
  }, [user, isClient])

  const permissions = useMemo(() => ({
    canEditProfile: isClient,
    canEditGoals: isClient,
    canEditConstraints: isClient,
    canEditSeanceFeedback: isClient,
    canSubmitWeeklyFeedback: isClient,
    canUploadProgressPhotos: isClient,
    canAddWeights: isClient,
  }), [isClient])

  return { relation, permissions, loading, error }
}


