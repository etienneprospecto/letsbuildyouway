import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Calendar, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface WeeklyFeedback {
  id: string
  week_start: string
  week_end: string
  alimentary_scores: number
  lifestyle_scores: number
  feelings_scores: number
  alimentary_comment?: string
  lifestyle_comment?: string
  feelings_comment?: string
  score: number
  submitted_at: string
}

const ClientFeedbacks: React.FC = () => {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState<WeeklyFeedback[]>([])
  const [currentFeedback, setCurrentFeedback] = useState({
    alimentation: 5,
    lifestyle: 5,
    feelings: 5,
    alimentationComment: '',
    lifestyleComment: '',
    feelingsComment: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Récupérer les feedbacks existants
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user?.email) return
      
      try {
        // Récupérer l'ID du client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('email', user.email)
          .single()

        if (clientError) throw clientError

        // Récupérer les feedbacks hebdomadaires
        const { data, error } = await supabase
          .from('weekly_feedbacks')
          .select('*')
          .eq('client_id', clientData.id)
          .order('week_start', { ascending: false })

        if (error) throw error

        setFeedbacks(data || [])
      } catch (error) {
        console.error('Erreur récupération feedbacks:', error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer tes feedbacks",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbacks()
  }, [user?.email])

  // Vérifier si un feedback existe pour la semaine courante
  const getCurrentWeekFeedback = () => {
    const today = new Date()
    const weekStart = getWeekStart(today)
    return feedbacks.find(f => f.week_start === weekStart)
  }

  // Calculer le début de la semaine (lundi)
  const getWeekStart = (date: Date): string => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  // Calculer la fin de la semaine (dimanche)
  const getWeekEnd = (date: Date): string => {
    const monday = new Date(getWeekStart(date))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return sunday.toISOString().split('T')[0]
  }

  // Soumettre le feedback hebdomadaire
  const handleSubmitFeedback = async () => {
    if (!user?.email) return
    
    setSaving(true)
    try {
      // Récupérer l'ID du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', user.email)
        .single()

      if (clientError) throw clientError

      const weekStart = getWeekStart(new Date())
      const weekEnd = getWeekEnd(new Date())
      const scoreGlobal = Math.round((currentFeedback.alimentation + currentFeedback.lifestyle + currentFeedback.feelings) / 3 * 10)

      const feedbackData = {
        client_id: clientData.id,
        week_start: weekStart,
        week_end: weekEnd,
        alimentary_scores: currentFeedback.alimentation,
        lifestyle_scores: currentFeedback.lifestyle,
        feelings_scores: currentFeedback.feelings,
        alimentary_comment: currentFeedback.alimentationComment || null,
        lifestyle_comment: currentFeedback.lifestyleComment || null,
        feelings_comment: currentFeedback.feelingsComment || null,
        score: scoreGlobal,
        submitted_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('weekly_feedbacks')
        .upsert(feedbackData, { onConflict: 'client_id,week_start' })

      if (error) throw error

      toast({
        title: "Succès",
        description: "Feedback hebdomadaire soumis avec succès"
      })

      // Mettre à jour la liste
      const newFeedback: WeeklyFeedback = {
        id: Date.now().toString(),
        ...feedbackData
      }
      setFeedbacks(prev => [newFeedback, ...prev])

      // Réinitialiser le formulaire
      setCurrentFeedback({
        alimentation: 5,
        lifestyle: 5,
        feelings: 5,
        alimentationComment: '',
        lifestyleComment: '',
        feelingsComment: ''
      })
    } catch (error) {
      console.error('Erreur soumission feedback:', error)
      toast({
        title: "Erreur",
        description: "Impossible de soumettre le feedback",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const currentWeekFeedback = getCurrentWeekFeedback()
  const weekStart = getWeekStart(new Date())
  const weekEnd = getWeekEnd(new Date())

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes feedbacks</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes feedbacks</h1>
        <p className="text-muted-foreground">Questionnaires hebdomadaires</p>
        <p className="text-sm text-muted-foreground mt-2">
          Semaine du {new Date(weekStart).toLocaleDateString('fr-FR')} au {new Date(weekEnd).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Feedback de la semaine courante */}
      {!currentWeekFeedback ? (
        <Card>
          <CardHeader>
            <CardTitle>Feedback de la semaine</CardTitle>
            <CardDescription>Évalue ta semaine écoulée</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alimentation</CardTitle>
                  <CardDescription>Note 1-10 et commentaire</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold">{currentFeedback.alimentation}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentFeedback.alimentation}
                    onChange={(e) => setCurrentFeedback(prev => ({ ...prev, alimentation: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <Textarea
                    placeholder="Comment s'est passée ton alimentation cette semaine ?"
                    value={currentFeedback.alimentationComment}
                    onChange={(e) => setCurrentFeedback(prev => ({ ...prev, alimentationComment: e.target.value }))}
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Style de vie</CardTitle>
                  <CardDescription>Sommeil, stress, etc.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold">{currentFeedback.lifestyle}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentFeedback.lifestyle}
                    onChange={(e) => setCurrentFeedback(prev => ({ ...prev, lifestyle: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <Textarea
                    placeholder="Comment s'est passé ton style de vie cette semaine ?"
                    value={currentFeedback.lifestyleComment}
                    onChange={(e) => setCurrentFeedback(prev => ({ ...prev, lifestyleComment: e.target.value }))}
                    rows={3}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ressentis généraux</CardTitle>
                  <CardDescription>Motivation, énergie</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold">{currentFeedback.feelings}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={currentFeedback.feelings}
                    onChange={(e) => setCurrentFeedback(prev => ({ ...prev, feelings: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <Textarea
                    placeholder="Comment te sens-tu globalement cette semaine ?"
                    value={currentFeedback.feelingsComment}
                    onChange={(e) => setCurrentFeedback(prev => ({ ...prev, feelingsComment: e.target.value }))}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleSubmitFeedback} disabled={saving} size="lg">
                {saving ? 'Soumission...' : 'Soumettre mon feedback'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Feedback de la semaine soumis
            </CardTitle>
            <CardDescription>
              Tu as déjà soumis ton feedback pour cette semaine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Alimentation</p>
                <p className="text-2xl font-bold">{currentWeekFeedback.alimentary_scores}/10</p>
                {currentWeekFeedback.alimentary_comment && (
                  <p className="text-sm mt-2">{currentWeekFeedback.alimentary_comment}</p>
                )}
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Style de vie</p>
                <p className="text-2xl font-bold">{currentWeekFeedback.lifestyle_scores}/10</p>
                {currentWeekFeedback.lifestyle_comment && (
                  <p className="text-sm mt-2">{currentWeekFeedback.lifestyle_comment}</p>
                )}
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Ressentis</p>
                <p className="text-2xl font-bold">{currentWeekFeedback.feelings_scores}/10</p>
                {currentWeekFeedback.feelings_comment && (
                  <p className="text-sm mt-2">{currentWeekFeedback.feelings_comment}</p>
                )}
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Score global</p>
              <p className="text-3xl font-bold">{currentWeekFeedback.score}/100</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des feedbacks */}
      {feedbacks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des feedbacks</CardTitle>
            <CardDescription>Tes évaluations des semaines précédentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbacks.slice(1).map((feedback) => (
                <div key={feedback.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        Semaine du {new Date(feedback.week_start).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score global: {feedback.score}/100
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      A: {feedback.alimentary_scores}/10
                    </span>
                    <span className="text-sm text-muted-foreground">
                      S: {feedback.lifestyle_scores}/10
                    </span>
                    <span className="text-sm text-muted-foreground">
                      R: {feedback.feelings_scores}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ClientFeedbacks


