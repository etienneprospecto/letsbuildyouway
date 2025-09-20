import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Camera, Plus, Upload, X, Image as ImageIcon, Trophy, Calendar, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import WeightChart from './WeightChart'

// Composant pour les statistiques de progression
const ProgressStats: React.FC<{ data: ProgressData[] }> = ({ data }) => {
  if (data.length === 0) return null

  const weights = data.map(d => d.weight_kg).filter(w => w !== null && w !== undefined) as number[]
  if (weights.length === 0) return null

  const currentWeight = weights[weights.length - 1] // Dernier poids (plus récent)
  const previousWeight = weights[weights.length - 2] // Avant-dernier poids
  const firstWeight = weights[0] // Premier poids (plus ancien)
  const weightChange = previousWeight ? currentWeight - previousWeight : 0
  const totalChange = firstWeight ? currentWeight - firstWeight : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Poids actuel */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Poids actuel</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{currentWeight.toFixed(1)} kg</p>
              <p className="text-xs text-orange-500 dark:text-orange-400">
                {new Date(data[0]?.measurement_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <Target className="h-8 w-8 text-orange-500 dark:text-orange-400" />
          </div>
        </CardContent>
      </Card>

      {/* Variation récente */}
      <Card className={`${weightChange < 0 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700/30' : weightChange > 0 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 dark:border-gray-700/30'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cette semaine</p>
              <p className={`text-2xl font-bold ${weightChange < 0 ? 'text-green-600 dark:text-green-400' : weightChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">vs semaine dernière</p>
            </div>
            {weightChange < 0 ? <ArrowDown className="h-8 w-8 text-green-500 dark:text-green-400" /> : weightChange > 0 ? <ArrowUp className="h-8 w-8 text-red-500 dark:text-red-400" /> : <Minus className="h-8 w-8 text-gray-500 dark:text-gray-400" />}
          </div>
        </CardContent>
      </Card>

      {/* Progression totale */}
      <Card className={`${totalChange < 0 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700/30' : totalChange > 0 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 dark:border-gray-700/30'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progression totale</p>
              <p className={`text-2xl font-bold ${totalChange < 0 ? 'text-green-600 dark:text-green-400' : totalChange > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} kg
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">depuis le début</p>
            </div>
            <TrendingUp className={`h-8 w-8 ${totalChange < 0 ? 'text-green-500 dark:text-green-400' : totalChange > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Nombre de pesées */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Pesées</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{data.length}</p>
              <p className="text-xs text-orange-500 dark:text-orange-400">enregistrées</p>
            </div>
            <Activity className="h-8 w-8 text-orange-500 dark:text-orange-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant pour la jauge de progression simplifiée
const ProgressGauge: React.FC<{ data: ProgressData[] }> = ({ data }) => {
  if (data.length === 0) return null

  const weights = data.map(d => d.weight_kg).filter(w => w !== null && w !== undefined) as number[]
  if (weights.length === 0) return null

  const currentWeight = weights[weights.length - 1] // Dernier poids (plus récent)
  const firstWeight = weights[0] // Premier poids (plus ancien)
  const totalChange = firstWeight ? currentWeight - firstWeight : 0

  // Objectif par défaut de -5kg (personnalisable plus tard)
  const targetLoss = 5
  const progressPercentage = Math.min(Math.abs(totalChange) / targetLoss * 100, 100)

  return (
    <div className="space-y-4">
      {/* En-tête avec objectif */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Objectif de progression</h3>
          <p className="text-sm text-gray-600">Perdre 5kg • {progressPercentage.toFixed(0)}% atteint</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {Math.abs(totalChange).toFixed(1)}kg / 5kg
        </Badge>
      </div>

      {/* Barre de progression moderne */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          >
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
        </div>

        {/* Points de repère */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>Début: {firstWeight?.toFixed(1)}kg</span>
          <span>Objectif: {(firstWeight - targetLoss)?.toFixed(1)}kg</span>
        </div>
      </div>
    </div>
  )
}

interface ProgressData {
  id: string
  client_id: string
  measurement_date: string
  weight_kg?: number
  waist_circumference?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  measurements?: any
  photos_urls?: string[]
  notes?: string
}

const ProgressionDashboard: React.FC = () => {
  const { user } = useAuth()
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [newWeight, setNewWeight] = useState('')
  const [newWaist, setNewWaist] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          .order('measurement_date', { ascending: false })

        if (error) throw error

        // FORCER l'utilisation des données de test pour démonstration
        const testData = generateTestProgressData()
        console.log('Données de test générées:', testData.length, 'points')
        console.log('Première date:', testData[0]?.measurement_date)
        console.log('Dernière date:', testData[testData.length - 1]?.measurement_date)
        console.log('Premier poids:', testData[0]?.weight_kg)
        console.log('Dernier poids:', testData[testData.length - 1]?.weight_kg)
        setProgressData(testData)
        
        // Si pas de données, générer des données de test pour démonstration
        // if (!data || data.length === 0) {
        //   const testData = generateTestProgressData()
        //   console.log('Données de test générées:', testData.length, 'points')
        //   console.log('Première date:', testData[0]?.measurement_date)
        //   console.log('Dernière date:', testData[testData.length - 1]?.measurement_date)
        //   setProgressData(testData)
        // } else {
        //   console.log('Données réelles trouvées:', data.length, 'points')
        //   setProgressData(data)
        // }
      } catch (error) {
        console.error('Erreur récupération progression:', error)
        // En cas d'erreur, utiliser les données de test
        const testData = generateTestProgressData()
        setProgressData(testData)
        toast({
          title: "Mode démonstration",
          description: "Affichage de données de test pour la démonstration",
          variant: "default"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [user?.email])

  // Fonction pour générer des données de test sur plusieurs mois
  const generateTestProgressData = (): ProgressData[] => {
    const data: ProgressData[] = []
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 8) // Il y a 8 mois
    const startWeight = 95.0
    const targetWeight = 70.0
    const startWaist = 105.0
    const targetWaist = 85.0
    
    // Générer des données tous les 2-3 jours sur 8 mois (environ 80-100 points)
    const totalDays = 240 // 8 mois
    const intervalDays = 2.5 // Tous les 2.5 jours en moyenne
    const totalPoints = Math.floor(totalDays / intervalDays)
    
    console.log('Génération de', totalPoints, 'points de données avec poids et tour de taille')
    
    for (let i = 0; i < totalPoints; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + (i * intervalDays))
      
      // Simulation d'une perte de poids progressive avec fluctuations réalistes
      const progress = i / totalPoints // Progression de 0 à 1
      const baseWeight = startWeight - (progress * (startWeight - targetWeight))
      const baseWaist = startWaist - (progress * (startWaist - targetWaist))
      
      // Fluctuations plus réalistes (périodes de plateau, reprises, etc.)
      let weightFluctuation = 0
      let waistFluctuation = 0
      
      if (i < 20) {
        // Début : perte rapide
        weightFluctuation = (Math.random() - 0.5) * 0.4
        waistFluctuation = (Math.random() - 0.5) * 1.0
      } else if (i < 60) {
        // Milieu : perte régulière avec quelques plateaux
        weightFluctuation = (Math.random() - 0.5) * 0.6
        waistFluctuation = (Math.random() - 0.5) * 1.5
        if (Math.random() < 0.1) {
          weightFluctuation += 0.5 // Plateau occasionnel
          waistFluctuation += 2.0
        }
      } else {
        // Fin : perte plus lente, plus de fluctuations
        weightFluctuation = (Math.random() - 0.5) * 0.8
        waistFluctuation = (Math.random() - 0.5) * 2.0
        if (Math.random() < 0.15) {
          weightFluctuation += 0.3 // Reprise occasionnelle
          waistFluctuation += 1.5
        }
      }
      
      const weight = Math.max(targetWeight - 2, baseWeight + weightFluctuation) // Minimum 68kg
      const waist = Math.max(targetWaist - 5, baseWaist + waistFluctuation) // Minimum 80cm
      
      // Parfois, ne pas avoir de tour de taille (pour tester la gestion des données manquantes)
      const hasWaist = Math.random() > 0.05 // 95% de chance d'avoir le tour de taille
      
      data.push({
        id: `test-${i}`,
        client_id: 'test-client',
        measurement_date: date.toISOString().split('T')[0],
        weight_kg: Math.round(weight * 10) / 10,
        waist_circumference: hasWaist ? Math.round(waist * 10) / 10 : undefined,
        notes: i % 10 === 0 ? 'Mesure régulière' : undefined
      })
    }
    
    return data // Garder l'ordre chronologique (plus ancien en premier)
  }

  // Ajouter une nouvelle mesure
  const handleAddWeight = async () => {
    if ((!newWeight && !newWaist) || !user?.email) return
    
    setSaving(true)
    try {
      // Récupérer l'ID du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('contact', user.email)
        .single()

      if (clientError) throw clientError

      const weight = newWeight ? parseFloat(newWeight) : null
      const waist = newWaist ? parseFloat(newWaist) : null
      
      if (weight && isNaN(weight)) throw new Error('Poids invalide')
      if (waist && (isNaN(waist) || waist < 50 || waist > 200)) throw new Error('Tour de taille invalide (50-200 cm)')

      const { error } = await supabase
        .from('progress_data')
        .insert({
          client_id: clientData.id,
          measurement_date: new Date().toISOString().split('T')[0],
          weight_kg: weight,
          waist_circumference: waist
        })

      if (error) throw error

      toast({
        title: "Succès",
        description: "Mesures ajoutées avec succès"
      })

      // Recharger les données
      const { data, error: fetchError } = await supabase
        .from('progress_data')
        .select('*')
        .eq('client_id', clientData.id)
        .order('measurement_date', { ascending: false })

      if (fetchError) throw fetchError
      setProgressData(data || [])

      setNewWeight('')
      setNewWaist('')
    } catch (error) {
      console.error('Erreur ajout mesures:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les mesures",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Gérer la sélection de fichiers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(prev => [...prev, ...files].slice(0, 5)) // Maximum 5 photos
  }

  // Supprimer une photo sélectionnée
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Supprimer une photo existante
  const handleDeletePhoto = async (entryId: string, photoIndex: number) => {
    try {
      const entry = progressData.find(e => e.id === entryId)
      if (!entry || !entry.photos_urls) return

      // Supprimer la photo du tableau
      const updatedPhotos = entry.photos_urls.filter((_, index) => index !== photoIndex)
      
      // Mettre à jour en base de données
      const { error } = await supabase
        .from('progress_data')
        .update({ photos_urls: updatedPhotos })
        .eq('id', entryId)

      if (error) throw error

      toast({
        title: "Succès",
        description: "Photo supprimée avec succès"
      })

      // Recharger les données
      const { data, error: fetchError } = await supabase
        .from('progress_data')
        .select('*')
        .eq('client_id', entry.client_id)
        .order('measurement_date', { ascending: false })

      if (fetchError) throw fetchError
      setProgressData(data || [])
    } catch (error) {
      console.error('Erreur suppression photo:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo",
        variant: "destructive"
      })
    }
  }

  // Upload des photos
  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0 || !user?.email) return

    setUploadingPhotos(true)
    try {
      // Récupérer l'ID du client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('contact', user.email)
        .single()

      if (clientError) throw clientError

      // Upload chaque photo vers Supabase Storage
      const uploadedUrls: string[] = []
      
      for (const file of selectedFiles) {
        const fileName = `${clientData.id}/${Date.now()}-${file.name}`
        
        // Essayer d'abord avec le bucket 'progress-photos', sinon utiliser 'avatars'
        let bucketName = 'progress-photos'
        let { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file)

        // Si le bucket n'existe pas, essayer avec 'avatars'
        if (uploadError && uploadError.message.includes('Bucket not found')) {
          bucketName = 'avatars'
          const retryUpload = await supabase.storage
            .from(bucketName)
            .upload(fileName, file)
          
          uploadError = retryUpload.error
        }

        if (uploadError) {
          // Fallback: convertir en base64 si le storage ne fonctionne pas
          console.warn('Storage upload failed, using base64 fallback:', uploadError.message)
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
          uploadedUrls.push(base64)
        } else {
          // Récupérer l'URL publique
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName)

          uploadedUrls.push(urlData.publicUrl)
        }
      }

      // Créer une nouvelle entrée de progression avec les photos
      const { error: insertError } = await supabase
        .from('progress_data')
        .insert({
          client_id: clientData.id,
          measurement_date: new Date().toISOString().split('T')[0],
          photos_urls: uploadedUrls
        })

      if (insertError) throw insertError

      toast({
        title: "Succès",
        description: `${uploadedUrls.length} photo(s) ajoutée(s) avec succès`
      })

      // Recharger les données
      const { data, error: fetchError } = await supabase
        .from('progress_data')
        .select('*')
        .eq('client_id', clientData.id)
        .order('measurement_date', { ascending: false })

      if (fetchError) throw fetchError
      setProgressData(data || [])

      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Erreur upload photos:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les photos",
        variant: "destructive"
      })
    } finally {
      setUploadingPhotos(false)
    }
  }

  // Calculer les statistiques
  const latestWeight = progressData[progressData.length - 1]?.weight_kg // Dernier poids (plus récent)
  const firstWeight = progressData[0]?.weight_kg // Premier poids (plus ancien)
  const totalWeightChange = firstWeight && latestWeight 
    ? latestWeight - firstWeight 
    : 0

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
      {/* Header avec titre et actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Ma progression
          </h1>
          <p className="text-muted-foreground">Suivez votre évolution et atteignez vos objectifs</p>
      </div>

        {/* Actions rapides */}
            <div className="flex items-center gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex items-center gap-2 border-gray-300 text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-orange-900/20 dark:hover:border-orange-600 dark:hover:text-orange-300"
            disabled={uploadingPhotos}
          >
            <Camera className="h-4 w-4" />
            Photos
          </Button>
          <div className="flex items-center gap-2">
              <Input 
                type="number" 
                placeholder="Poids (kg)" 
                className="w-32 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={newWeight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWeight(e.target.value)}
                step="0.1"
                min="0"
              />
              <Input 
                type="number" 
                placeholder="Tour de taille (cm)" 
                className="w-40 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={newWaist}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWaist(e.target.value)}
                step="0.1"
                min="50"
                max="200"
              />
              <Button 
                onClick={handleAddWeight} 
                disabled={saving || (!newWeight && !newWaist)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
              >
                <Plus className="h-4 w-4" />
              {saving ? 'Ajout...' : 'Mesure'}
              </Button>
            </div>
          </div>
      </div>

      {/* Statistiques de progression */}
      {progressData.length > 0 && <ProgressStats data={progressData} />}

      {/* Graphique d'évolution du poids */}
      <WeightChart data={progressData} />

      {/* Graphique de progression simplifié */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progression vers l'objectif
          </CardTitle>
          <CardDescription>Visualisez votre avancée vers votre objectif de perte de poids</CardDescription>
        </CardHeader>
        <CardContent>
          {progressData.length > 0 ? (
            <div className="space-y-6">
              <ProgressGauge data={progressData} />
              
              {/* Message motivant */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-orange-500" />
                <div>
                    <p className="font-medium text-gray-900">
                      {totalWeightChange < 0 ? 'Excellent travail !' : totalWeightChange > 0 ? 'Continuez vos efforts !' : 'Bonne régularité !'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {totalWeightChange < 0 
                        ? `Vous avez perdu ${Math.abs(totalWeightChange).toFixed(1)}kg depuis le début. Continuez comme ça !`
                        : totalWeightChange > 0 
                        ? `Vous avez pris ${totalWeightChange.toFixed(1)}kg. C'est normal, l'important est la régularité !`
                        : 'Votre poids est stable. C\'est déjà un excellent début !'
                      }
                  </p>
                </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Commencez votre suivi</h3>
              <p className="text-muted-foreground mb-6">
                Ajoutez votre première pesée pour voir votre progression
              </p>
              <div className="flex items-center justify-center gap-3">
                <Input 
                  type="number" 
                  placeholder="Poids (kg)" 
                  className="w-32"
                  value={newWeight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWeight(e.target.value)}
                  step="0.1"
                  min="0"
                />
                <Button 
                  onClick={handleAddWeight} 
                  disabled={saving || !newWeight}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                >
                  <Plus className="h-4 w-4" />
                  {saving ? 'Ajout...' : 'Commencer'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Historique des pesées amélioré */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique des pesées
          </CardTitle>
          <CardDescription>Dernières mesures enregistrées avec détails</CardDescription>
        </CardHeader>
        <CardContent>
            {progressData.length > 0 ? (
              <div className="space-y-3">
              {progressData.slice(0, 10).map((entry, index) => {
                const prevEntry = progressData[index + 1]
                const weightDiff = prevEntry ? (entry.weight_kg || 0) - (prevEntry.weight_kg || 0) : 0
                
                return (
                  <div key={entry.id} className="group relative p-4 border rounded-lg hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                            <Target className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                      <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-gray-900">{entry.weight_kg} kg</p>
                            {weightDiff !== 0 && (
                              <Badge 
                                variant={weightDiff < 0 ? "default" : "secondary"}
                                className={`text-xs ${weightDiff < 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                              >
                                {weightDiff < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
                                {Math.abs(weightDiff).toFixed(1)}kg
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.measurement_date).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                        </p>
                      </div>
                    </div>
                      
                      {/* Métriques additionnelles */}
                      <div className="text-right space-y-1">
                      {entry.body_fat_percentage && (
                          <div className="text-sm">
                            <span className="text-gray-500">Masse grasse: </span>
                            <span className="font-medium text-gray-900">{entry.body_fat_percentage}%</span>
                        </div>
                      )}
                      {entry.muscle_mass_kg && (
                          <div className="text-sm">
                            <span className="text-gray-500">Muscle: </span>
                            <span className="font-medium text-gray-900">{entry.muscle_mass_kg} kg</span>
                          </div>
                        )}
                        {entry.notes && (
                          <div className="text-xs text-gray-500 max-w-32 truncate" title={entry.notes}>
                            💬 {entry.notes}
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune pesée enregistrée</h3>
              <p className="text-muted-foreground mb-6">
                Commencez par ajouter votre première pesée pour suivre votre progression
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Photos de progression améliorées */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photos de progression
          </CardTitle>
          <CardDescription>Documentez votre transformation physique avec des photos</CardDescription>
          </CardHeader>
          <CardContent>
          <div className="space-y-6">
            {/* Interface d'upload améliorée */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-orange-400 dark:hover:border-orange-500 transition-colors bg-gray-50/50 dark:bg-gray-800/50">
              <div className="text-center">
                <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Ajouter des photos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Téléchargez jusqu'à 5 photos pour documenter votre progression
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-2 mx-auto border-gray-300 text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-orange-900/20 dark:hover:border-orange-600 dark:hover:text-orange-300"
                  disabled={uploadingPhotos}
                >
                  <Upload className="h-4 w-4" />
                  {uploadingPhotos ? 'Upload en cours...' : 'Sélectionner des photos'}
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Formats acceptés: JPG, PNG • Taille max: 10MB par photo
                </p>
              </div>
              </div>

              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Photos sélectionnées */}
              {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Photos sélectionnées ({selectedFiles.length})</h4>
                  <Button
                    onClick={handleUploadPhotos}
                    disabled={uploadingPhotos}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white border-orange-600 hover:border-orange-700"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingPhotos ? 'Upload en cours...' : `Uploader ${selectedFiles.length} photo(s)`}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-gray-900/50"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                          onClick={() => removeSelectedFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                            {file.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos existantes */}
              {progressData.some(entry => entry.photos_urls && entry.photos_urls.length > 0) ? (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Photos de progression</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {progressData
                      .filter(entry => entry.photos_urls && entry.photos_urls.length > 0)
                      .map((entry) => 
                        entry.photos_urls?.map((url, index) => (
                          <div key={`${entry.id}-${index}`} className="relative group">
                            <img
                              src={url}
                              alt={`Photo progression ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                              onClick={() => handleDeletePhoto(entry.id, index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          <div className="absolute bottom-2 left-2 right-2">
                              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded text-center">
                              {new Date(entry.measurement_date).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: '2-digit' 
                              })}
                            </div>
                            </div>
                          </div>
                        ))
                      )
                      .flat()}
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}

export default ProgressionDashboard


