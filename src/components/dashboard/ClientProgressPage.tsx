import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { AlertCircle, TrendingUp } from 'lucide-react'

type ProgressRow = {
  id: string
  date: string
  weight: number | null
  body_fat: number | null
}

const ClientProgressPage: React.FC = () => {
  const { profile } = useAuth()
  const [rows, setRows] = useState<ProgressRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgress = async () => {
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
          .from('progress_data')
          .select('id, date, weight, body_fat')
          .eq('client_id', client.id)
          .order('date', { ascending: true })
        if (error) throw error
        setRows((data || []) as ProgressRow[])
      } catch (e) {
        console.error(e)
        setError("Impossible de charger la progression")
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
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
          <CardTitle>Ma progression</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted-foreground">Aucune donnée de progression</p>
          ) : (
            <ul className="space-y-2">
              {rows.map(r => (
                <li key={r.id} className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4" />
                  <span>{new Date(r.date).toLocaleDateString('fr-FR')}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.weight ? `${r.weight} kg` : '—'} / {r.body_fat ? `${r.body_fat}%` : '—'}
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

export default ClientProgressPage


