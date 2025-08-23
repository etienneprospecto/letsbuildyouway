import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import { useClientCoachData } from './useClientCoachData'

export const useCoachConnection = () => {
  const { profile } = useAuth()
  const { relation } = useClientCoachData()
  const [isCoachOnline, setIsCoachOnline] = useState<boolean>(false)
  const [coachEmail, setCoachEmail] = useState<string | null>(null)

  useEffect(() => {
    setCoachEmail(relation?.coach_email || null)
  }, [relation])

  useEffect(() => {
    if (!relation?.coach_id) return

    const channel = supabase.channel(`presence:coach_${relation.coach_id}`, {
      config: { presence: { key: relation.coach_id } }
    })
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      setIsCoachOnline(!!state[relation.coach_id]?.length)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ user_id: relation.coach_id })
      }
    })

    return () => { channel.unsubscribe() }
  }, [relation?.coach_id])

  return { isCoachOnline, coachEmail }
}


