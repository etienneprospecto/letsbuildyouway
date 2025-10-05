import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Camera, Plus, Upload, X, Image as ImageIcon, Trophy, Calendar, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { useAuth } from '@/providers/OptimizedAuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import WeightChart from './WeightChart'

// Composant pour les statistiques de progression
const ProgressStats: React.FC<{ data: ProgressData[] }> = ({ data }) => {
  if (data.length === 0) return null

  const weights = data.map(d => d.weight_kg).filter(w => w !== null && w !== undefined) as number[]
  const waists = data.map(d => d.waist_circumference).filter(w => w !== null && w !== undefined) as number[]
  
  if (weights.length === 0 && waists.length === 0) return null

  const currentWeight = weights[weights.length - 1] // Dernier poids (plus récent)
  const previousWeight = weights[weights.length - 2] // Avant-dernier poids
  const firstWeight = weights[0] // Premier poids (plus ancien)
  const weightChange = previousWeight ? currentWeight - previousWeight : 0
  const totalWeightChange = firstWeight ? currentWeight - firstWeight : 0

  const currentWaist = waists[waists.length - 1] // Dernier tour de taille (plus récent)
  const previousWaist = waists[waists.length - 2] // Avant-dernier tour de taille
  const firstWaist = waists[0] // Premier tour de taille (plus ancien)
  const waistChange = previousWaist ? currentWaist - previousWaist : 0
  const totalWaistChange = firstWaist ? currentWaist - firstWaist : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Poids actuel */}
      {weights.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Poids actuel</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{currentWeight.toFixed(1)} kg</p>
                <p className="text-xs text-blue-500 dark:text-blue-400">
                  {new Date(data[0]?.measurement_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tour de taille actuel */}
      {waists.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Tour de taille</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{currentWaist.toFixed(1)} cm</p>
                <p className="text-xs text-orange-500 dark:text-orange-400">
                  {new Date(data[0]?.measurement_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variation récente poids */}
      {weights.length > 1 && (
        <Card className={`${weightChange < 0 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700/30' : weightChange > 0 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 dark:border-gray-700/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Variation poids</p>
                <p className={`text-2xl font-bold ${weightChange < 0 ? 'text-green-600 dark:text-green-400' : weightChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">vs mesure précédente</p>
              </div>
              {weightChange < 0 ? <ArrowDown className="h-8 w-8 text-green-500 dark:text-green-400" /> : weightChange > 0 ? <ArrowUp className="h-8 w-8 text-red-500 dark:text-red-400" /> : <Minus className="h-8 w-8 text-gray-500 dark:text-gray-400" />}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variation récente tour de taille */}
      {waists.length > 1 && (
        <Card className={`${waistChange < 0 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700/30' : waistChange > 0 ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 dark:border-gray-700/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Variation tour</p>
                <p className={`text-2xl font-bold ${waistChange < 0 ? 'text-green-600 dark:text-green-400' : waistChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {waistChange > 0 ? '+' : ''}{waistChange.toFixed(1)} cm
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">vs mesure précédente</p>
              </div>
              {waistChange < 0 ? <ArrowDown className="h-8 w-8 text-green-500 dark:text-green-400" /> : waistChange > 0 ? <ArrowUp className="h-8 w-8 text-red-500 dark:text-red-400" /> : <Minus className="h-8 w-8 text-gray-500 dark:text-gray-400" />}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progression totale poids */}
      {weights.length > 1 && (
        <Card className={`${totalWeightChange < 0 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700/30' : totalWeightChange > 0 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 dark:border-gray-700/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progression poids</p>
                <p className={`text-2xl font-bold ${totalWeightChange < 0 ? 'text-green-600 dark:text-green-400' : totalWeightChange > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {totalWeightChange > 0 ? '+' : ''}{totalWeightChange.toFixed(1)} kg
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">depuis le début</p>
              </div>
              <TrendingUp className={`h-8 w-8 ${totalWeightChange < 0 ? 'text-green-500 dark:text-green-400' : totalWeightChange > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progression totale tour de taille */}
      {waists.length > 1 && (
        <Card className={`${totalWaistChange < 0 ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700/30' : totalWaistChange > 0 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 dark:from-gray-800/20 dark:to-gray-700/20 dark:border-gray-700/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progression tour</p>
                <p className={`text-2xl font-bold ${totalWaistChange < 0 ? 'text-green-600 dark:text-green-400' : totalWaistChange > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {totalWaistChange > 0 ? '+' : ''}{totalWaistChange.toFixed(1)} cm
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">depuis le début</p>
              </div>
              <TrendingUp className={`h-8 w-8 ${totalWaistChange < 0 ? 'text-green-500 dark:text-green-400' : totalWaistChange > 0 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nombre de mesures */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Mesures</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{data.length}</p>
              <p className="text-xs text-purple-500 dark:text-purple-400">enregistrées</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500 dark:text-purple-400" />
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Objectif de progression</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Perdre 5kg • {progressPercentage.toFixed(0)}% atteint</p>
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
  const [showAllMeasurements, setShowAllMeasurements] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, entry: ProgressData} | null>(null)
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
    
    // Générer seulement 10 prises de pesée sur 2 mois
    const totalDays = 60 // 2 mois
    const intervalDays = 6 // Tous les 6 jours en moyenne
    const totalPoints = 10 // Exactement 10 points
    
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
      
      // Générer des photos factices pour toutes les mesures
      const photos_urls = []
      // 90% de chance d'avoir des photos pour chaque mesure
      if (Math.random() > 0.1) {
        const photoCount = Math.floor(Math.random() * 3) + 1 // 1 à 3 photos
        for (let p = 0; p < photoCount; p++) {
          // Utiliser des images de placeholder
          photos_urls.push(`https://picsum.photos/400/300?random=${i * 10 + p}`)
        }
      }

      data.push({
        id: `test-${i}`,
        client_id: 'test-client',
        measurement_date: date.toISOString().split('T')[0],
        weight_kg: Math.round(weight * 10) / 10,
        waist_circumference: hasWaist ? Math.round(waist * 10) / 10 : undefined,
        photos_urls: photos_urls.length > 0 ? photos_urls : undefined,
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
            className="flex items-center gap-2"
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
                variant="default" className="flex items-center gap-2"
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
                    <p className="font-medium text-gray-900 dark:text-gray-100">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Commencez votre suivi</h3>
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
                  variant="default" className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {saving ? 'Ajout...' : 'Commencer'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Historique des mesures amélioré */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique des mesures
          </CardTitle>
          <CardDescription>7 dernières mesures enregistrées (poids et tour de taille)</CardDescription>
        </CardHeader>
        <CardContent>
            {progressData.length > 0 ? (
              <div className="space-y-3">
              {(showAllMeasurements ? progressData : progressData.slice(0, 7)).map((entry, index) => {
                const prevEntry = progressData[index + 1]
                const weightDiff = prevEntry ? (entry.weight_kg || 0) - (prevEntry.weight_kg || 0) : 0
                const waistDiff = prevEntry ? (entry.waist_circumference || 0) - (prevEntry.waist_circumference || 0) : 0
                
                return (
                  <div key={entry.id} className="group relative p-5 border rounded-lg hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 min-h-[140px]">
                    <div className="flex items-start justify-between h-full">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center">
                            <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                        </div>
                      <div className="flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.measurement_date).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                        </p>
                        
                        {/* Poids et tour de taille */}
                        <div className="space-y-2">
                          {/* Poids */}
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Poids: <strong className="text-gray-900 dark:text-gray-100">
                                {entry.weight_kg ? `${entry.weight_kg} kg` : 'N/A'}
                              </strong>
                            </span>
                            {weightDiff !== 0 && entry.weight_kg && (
                              <Badge 
                                variant={weightDiff < 0 ? "default" : "secondary"}
                                className={`text-xs ${weightDiff < 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}
                              >
                                {weightDiff < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
                                {Math.abs(weightDiff).toFixed(1)}kg
                              </Badge>
                            )}
                          </div>
                          
                          {/* Tour de taille */}
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Tour: <strong className="text-gray-900 dark:text-gray-100">
                                {entry.waist_circumference ? `${entry.waist_circumference} cm` : 'N/A'}
                              </strong>
                            </span>
                            {waistDiff !== 0 && entry.waist_circumference && (
                              <Badge 
                                variant={waistDiff < 0 ? "default" : "secondary"}
                                className={`text-xs ${waistDiff < 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}
                              >
                                {waistDiff < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : <ArrowUp className="h-3 w-3 mr-1" />}
                                {Math.abs(waistDiff).toFixed(1)}cm
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                      
                      {/* Métriques additionnelles et photos */}
                      <div className="flex flex-col items-end space-y-2 min-w-[200px]">
                        {/* Métriques additionnelles */}
                        <div className="text-right space-y-1">
                          {entry.body_fat_percentage && (
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Masse grasse: </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{entry.body_fat_percentage}%</span>
                            </div>
                          )}
                          {entry.muscle_mass_kg && (
                            <div className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Muscle: </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{entry.muscle_mass_kg} kg</span>
                            </div>
                          )}
                          {entry.notes && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate" title={entry.notes}>
                              💬 {entry.notes}
                            </div>
                          )}
                        </div>
                        
                        {/* Photos miniatures - toujours affichées */}
                        <div className="flex gap-2 justify-end">
                          {entry.photos_urls && entry.photos_urls.length > 0 ? (
                            <>
                              {entry.photos_urls.slice(0, 3).map((url, photoIndex) => (
                                <div
                                  key={photoIndex}
                                  className="relative group cursor-pointer"
                                  onClick={() => setSelectedPhoto({url, entry})}
                                >
                                  <img
                                    src={url}
                                    alt={`Photo ${photoIndex + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                  />
                                  {/* Overlay au survol */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Camera className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {entry.photos_urls.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                  +{entry.photos_urls.length - 3}
                                </div>
                              )}
                            </>
                          ) : (
                            // Placeholder quand pas de photos
                            <div className="flex gap-2">
                              {[1, 2, 3].map((placeholderIndex) => (
                                <div
                                  key={placeholderIndex}
                                  className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center"
                                >
                                  <Camera className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Bouton pour afficher plus de mesures */}
              {progressData.length > 7 && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllMeasurements(!showAllMeasurements)}
                    className="flex items-center gap-2"
                  >
                    {showAllMeasurements ? (
                      <>
                        <Minus className="h-4 w-4" />
                        Voir moins ({progressData.length - 7} mesures cachées)
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Voir toutes les mesures ({progressData.length - 7} de plus)
                      </>
                    )}
                  </Button>
                </div>
              )}
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
                  className="flex items-center gap-2 mx-auto"
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
                    variant="default" className="flex items-center gap-2"
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

      {/* Modal pour afficher les photos en grand */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            {/* Header de la modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Photo de progression
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selectedPhoto.entry.measurement_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Image principale */}
            <div className="p-4">
              <img
                src={selectedPhoto.url}
                alt="Photo de progression"
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            
            {/* Informations de la mesure */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedPhoto.entry.weight_kg && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Poids:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedPhoto.entry.weight_kg} kg
                    </span>
                  </div>
                )}
                {selectedPhoto.entry.waist_circumference && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Tour:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedPhoto.entry.waist_circumference} cm
                    </span>
                  </div>
                )}
                {selectedPhoto.entry.body_fat_percentage && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Masse grasse:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedPhoto.entry.body_fat_percentage}%
                    </span>
                  </div>
                )}
                {selectedPhoto.entry.muscle_mass_kg && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Muscle:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedPhoto.entry.muscle_mass_kg} kg
                    </span>
                  </div>
                )}
              </div>
              {selectedPhoto.entry.notes && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    "{selectedPhoto.entry.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressionDashboard


