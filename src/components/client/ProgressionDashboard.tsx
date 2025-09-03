import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingUp, Camera, Plus } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface ProgressData {
  id: string
  date: string
  weight?: number
  body_fat?: number
  muscle_mass?: number
  measurements?: any
  photos?: string[]
}

const ProgressionDashboard: React.FC = () => {
  const { user } = useAuth()
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [newWeight, setNewWeight] = useState('')
  const [saving, setSaving] = useState(false)

  // Récupérer les données de progression
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user?.email) return
      
      try {
        // Récupérer l'ID du client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('contact', user.email)
          .single()

        if (clientError) throw clientError

        // Récupérer les données de progression
        const { data, error } = await supabase
          .from('progress_data')
          .select('*')
          .eq('client_id', clientData.id)
          .order('date', { ascending: false })

        if (error) throw error

        setProgressData(data || [])
      } catch (error) {
        console.error('Erreur récupération progression:', error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer tes données de progression",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [user?.email])

  // Ajouter une nouvelle pesée
  const handleAddWeight = async () => {
    if (!newWeight || !user?.email) return
    
    setSaving(true)
    try {
      // Récupérer l'ID du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', user.email)
        .single()

      if (clientError) throw clientError

      const weight = parseFloat(newWeight)
      if (isNaN(weight)) throw new Error('Poids invalide')

      const { error } = await supabase
        .from('progress_data')
        .insert({
          client_id: clientData.id,
          date: new Date().toISOString().split('T')[0],
          weight: weight
        })

      if (error) throw error

      toast({
        title: "Succès",
        description: "Poids ajouté avec succès"
      })

      // Mettre à jour la liste
      setProgressData(prev => [{
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        weight: weight
      }, ...prev])

      setNewWeight('')
    } catch (error) {
      console.error('Erreur ajout poids:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le poids",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Calculer les statistiques
  const latestWeight = progressData[0]?.weight
  const weightChange = progressData.length > 1 
    ? (progressData[0]?.weight || 0) - (progressData[1]?.weight || 0)
    : 0

  const progressPercentage = progressData.length > 0 ? 75 : 0 // Placeholder

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ma progression</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ma progression</h1>
        <p className="text-muted-foreground">Graphiques, pesées et photos</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Graphique de progression</CardTitle>
            <CardDescription>Évolution du poids</CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Graphique placeholder</p>
                    <p className="text-xs text-muted-foreground">Données disponibles: {progressData.length} entrées</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Dernière pesée:</span>
                    <p className="font-medium">{latestWeight} kg</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Variation:</span>
                    <p className={`font-medium ${weightChange > 0 ? 'text-red-600' : weightChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 rounded-md border flex items-center justify-center text-sm text-muted-foreground">
                Aucune donnée de progression
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ajouter une pesée</CardTitle>
            <CardDescription>Saisie rapide du poids</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input 
                type="number" 
                placeholder="Poids (kg)" 
                className="w-40"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                step="0.1"
                min="0"
              />
              <Button 
                onClick={handleAddWeight} 
                disabled={saving || !newWeight}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {saving ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
            
            {progressData.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression globale</span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Historique des pesées</CardTitle>
            <CardDescription>Dernières mesures enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.length > 0 ? (
              <div className="space-y-3">
                {progressData.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{entry.weight} kg</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {entry.body_fat && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Masse grasse</p>
                        <p className="font-medium">{entry.body_fat}%</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune pesée enregistrée</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Commence par ajouter ta première pesée
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Photos de progression</CardTitle>
            <CardDescription>Upload par toi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 rounded-md border flex items-center justify-center text-sm text-muted-foreground">
              <div className="text-center">
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p>Fonctionnalité photos à implémenter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProgressionDashboard


