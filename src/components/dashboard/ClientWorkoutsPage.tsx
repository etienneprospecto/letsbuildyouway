import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { AlertCircle, Calendar } from 'lucide-react'

const ClientWorkoutsPage: React.FC = () => {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      if (!profile?.email) return
      try {
        setLoading(true)
        setError(null)
        // Récupérer le client par email puis ses sessions
        const { data: client } = await supabase
          .from('clients')
          .select('id')
          .eq('email', profile.email)
          .maybeSingle()

        if (!client) {
          setError('Profil client introuvable')
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('sessions')
          .select('id, scheduled_date, status, workout_id')
          .eq('client_id', client.id)
          .order('scheduled_date', { ascending: true })

        if (error) throw error
        setSessions(data || [])
      } catch (e) {
        console.error(e)
        setError("Impossible de charger vos séances")
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [profile?.email])

  if (loading) return <div>Chargement...</div>
  if (error) return (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-500">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mes séances</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground">Aucune séance planifiée</p>
          ) : (
            <ul className="space-y-3">
              {sessions.map(s => (
                <li key={s.id} className="flex items-center gap-3">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(s.scheduled_date).toLocaleDateString('fr-FR')}</span>
                  <span className="text-xs text-muted-foreground">({s.status})</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientWorkoutsPage


