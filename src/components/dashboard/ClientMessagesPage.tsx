import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { AlertCircle, MessageSquare } from 'lucide-react'

type Conversation = {
  id: string
  last_message_at: string | null
  unread_count: number
}

const ClientMessagesPage: React.FC = () => {
  const { profile } = useAuth()
  const [convos, setConvos] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConvos = async () => {
      if (!profile?.email) return
      try {
        setLoading(true)
        setError(null)
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
          .from('conversations')
          .select('id, last_message_at, unread_count')
          .eq('client_id', client.id)
          .order('last_message_at', { ascending: false })
        if (error) throw error
        setConvos((data || []) as Conversation[])
      } catch (e) {
        console.error(e)
        setError("Impossible de charger les conversations")
      } finally {
        setLoading(false)
      }
    }
    fetchConvos()
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
          <CardTitle>Mes messages</CardTitle>
        </CardHeader>
        <CardContent>
          {convos.length === 0 ? (
            <p className="text-muted-foreground">Aucune conversation</p>
          ) : (
            <ul className="space-y-3">
              {convos.map(c => (
                <li key={c.id} className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  <span>Conversation {c.id.slice(0, 8)}...</span>
                  <span className="text-xs text-muted-foreground">
                    {c.last_message_at ? new Date(c.last_message_at).toLocaleString('fr-FR') : '—'}
                    {c.unread_count > 0 ? ` • ${c.unread_count} non lus` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientMessagesPage


