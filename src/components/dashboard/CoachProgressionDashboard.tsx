import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingUp, Camera, Plus, Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

// Composant pour la jauge de poids (identique au client)
const WeightGauge: React.FC<{ data: ProgressData[] }> = ({ data }) => {
  if (data.length === 0) return null

  const weights = data.map(d => d.weight_kg).filter(w => w !== null && w !== undefined) as number[]
  if (weights.length === 0) return null

  const currentWeight = weights[0] // Première entrée (la plus récente car triée par date desc)
  const previousWeight = weights[1] // Deuxième entrée
  const firstWeight = weights[weights.length - 1] // Dernière entrée (la plus ancienne)

  const weightChange = previousWeight ? currentWeight - previousWeight : 0
  const totalChange = firstWeight ? currentWeight - firstWeight : 0

  // Calculer le pourcentage de progression (exemple: objectif de perte de 5kg)
  const targetLoss = 5 // kg à perdre
  const progressPercentage = Math.min(Math.abs(totalChange) / targetLoss * 100, 100)

  return (
    <div className="w-full h-full flex flex-col space-y-2">
      {/* Poids actuel */}
      <div className="text-center mb-2">
        <div className="text-4xl font-bold text-gray-900">
          {currentWeight.toFixed(1)} <span className="text-lg text-gray-500">kg</span>
        </div>
        <div className="text-sm text-gray-400">
          {new Date(data[0]?.measurement_date).toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* Jauge horizontale avec points d'historique */}
      <div className="space-y-1">
        {/* En-tête de la jauge */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
          <span className="font-medium">Objectif: -5kg</span>
          <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
        </div>
        
        {/* Barre de progression avec points d'historique */}
        <div className="w-full bg-gray-200 rounded-full h-10 relative overflow-visible mb-8">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
          
          {/* Points d'historique sur la barre - maximum 3 points pour éviter les chevauchements */}
          {data.slice(0, 3).map((entry, index) => {
            const entryWeight = entry.weight_kg
            if (!entryWeight || !firstWeight || !currentWeight) return null
            
            const weightRange = currentWeight - firstWeight
            if (weightRange === 0) return null
            
            // Position uniforme : 20%, 50%, 80% pour éviter les chevauchements
            const uniformPositions = [20, 50, 80]
            const position = uniformPositions[index] || 50
            
            return (
              <div key={entry.id} className="absolute top-0 flex flex-col items-center z-10" style={{ left: `${position}%` }}>
                {/* Point sur la barre */}
                <div className="w-3 h-3 bg-white rounded-full border-2 border-orange-600 shadow-sm transform -translate-y-1" />
                {/* Info au survol */}
                <div className="absolute top-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  <div className="font-medium">{entryWeight.toFixed(1)} kg</div>
                  <div className="text-gray-300">
                    {new Date(entry.measurement_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
                {/* Info visible sous chaque point */}
                <div className="absolute top-12 text-center">
                  <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {entryWeight.toFixed(1)} kg
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.measurement_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Marqueur de position actuelle */}
          <div 
            className="absolute top-0 w-1 h-full bg-white shadow-sm z-5"
            style={{ left: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>

        {/* Valeurs min/max avec dates */}
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          <div className="text-center">
            <div className="font-medium">{firstWeight?.toFixed(1)} kg</div>
            <div>{new Date(data[data.length - 1]?.measurement_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Objectif: {(firstWeight - 5)?.toFixed(1)} kg</div>
            <div>Objectif</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProgressData {
  id: string
  measurement_date: string
  weight_kg?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  measurements?: any
  photos_urls?: string[]
  notes?: string
}

interface CoachProgressionDashboardProps {
  clientId: string
  clientName: string
}

const CoachProgressionDashboard: React.FC<CoachProgressionDashboardProps> = ({ clientId, clientName }) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [newWeight, setNewWeight] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Récupérer les données de progression
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!clientId) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('progress_data')
          .select('*')
          .eq('client_id', clientId)
          .order('measurement_date', { ascending: false })

        if (error) throw error
        setProgressData(data || [])
      } catch (error) {
        console.error('Erreur chargement progression:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de progression",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [clientId])

  const handleAddWeight = async () => {
    if (!newWeight || !clientId) return

    setSaving(true)
    try {
      const weight = parseFloat(newWeight)
      if (isNaN(weight)) throw new Error('Poids invalide')

      const { error } = await supabase
        .from('progress_data')
        .insert({
          client_id: clientId,
          measurement_date: new Date().toISOString().split('T')[0],
          weight_kg: weight
        })

      if (error) throw error

      toast({
        title: "Succès",
        description: "Poids ajouté avec succès"
      })

      // Recharger les données
      const { data, error: fetchError } = await supabase
        .from('progress_data')
        .select('*')
        .eq('client_id', clientId)
        .order('measurement_date', { ascending: false })

      if (fetchError) throw fetchError
      setProgressData(data || [])

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
        .eq('client_id', clientId)
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
    if (selectedFiles.length === 0 || !clientId) return

    setUploadingPhotos(true)
    try {
      // Upload chaque photo vers Supabase Storage
      const uploadedUrls: string[] = []
      
      for (const file of selectedFiles) {
        const fileName = `${clientId}/${Date.now()}-${file.name}`
        
        // Essayer d'abord avec le bucket 'progress-photos', sinon utiliser 'avatars'
        let bucketName = 'progress-photos'
        let { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file)

        // Si le bucket n'existe pas, essayer avec 'avatars'
        if (uploadError && uploadError.message.includes('Bucket not found')) {
          bucketName = 'avatars'
          const retryUpload = await supabase.storage
            .from(bucketName)
            .upload(fileName, file)
          
          uploadData = retryUpload.data
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
          client_id: clientId,
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
        .eq('client_id', clientId)
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
  const latestWeight = progressData[0]?.weight_kg
  const firstWeight = progressData[progressData.length - 1]?.weight_kg
  const totalWeightChange = firstWeight && latestWeight 
    ? latestWeight - firstWeight 
    : 0
  const weightChange = progressData.length > 1 
    ? (progressData[0]?.weight_kg || 0) - (progressData[1]?.weight_kg || 0)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données de progression...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progression de {clientName}</h1>
        <p className="text-muted-foreground">Graphiques, pesées et photos</p>
      </div>

      {/* Barre d'ajout de pesée */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Ajouter une pesée</h3>
              {progressData.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {progressData.length} entrées • {progressData[progressData.length - 1]?.measurement_date} → {progressData[0]?.measurement_date}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Input 
                type="number" 
                placeholder="Poids (kg)" 
                className="w-32"
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
          </div>
        </CardContent>
      </Card>

      {/* Graphique de progression - pleine largeur */}
      <Card>
        <CardHeader>
          <CardTitle>Graphique de progression</CardTitle>
          <CardDescription>Évolution du poids</CardDescription>
        </CardHeader>
        <CardContent>
          {progressData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-60 bg-muted rounded-md p-6">
                <WeightGauge data={progressData.slice(0, 7)} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Dernière pesée:</span>
                  <p className="font-medium">{latestWeight} kg</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Variation récente:</span>
                  <p className={`font-medium ${weightChange > 0 ? 'text-red-600' : weightChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Progression totale:</span>
                  <p className={`font-medium ${totalWeightChange > 0 ? 'text-red-600' : totalWeightChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {totalWeightChange > 0 ? '+' : ''}{totalWeightChange.toFixed(1)} kg
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-60 rounded-md border flex items-center justify-center text-sm text-muted-foreground">
              Aucune donnée de progression
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
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
                        <p className="font-medium">{entry.weight_kg} kg</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.measurement_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {entry.body_fat_percentage && (
                        <div className="mb-1">
                          <p className="text-sm text-muted-foreground">Masse grasse</p>
                          <p className="font-medium">{entry.body_fat_percentage}%</p>
                        </div>
                      )}
                      {entry.muscle_mass_kg && (
                        <div>
                          <p className="text-sm text-muted-foreground">Masse musculaire</p>
                          <p className="font-medium">{entry.muscle_mass_kg} kg</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune pesée enregistrée</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos de progression</CardTitle>
            <CardDescription>Photos de l'évolution physique</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Interface d'upload */}
            <div className="space-y-4">
              {/* Bouton d'upload */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={uploadingPhotos}
                >
                  <Upload className="h-4 w-4" />
                  Ajouter des photos
                </Button>
                <span className="text-sm text-muted-foreground">
                  Maximum 5 photos (JPG, PNG)
                </span>
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
                <div className="space-y-3">
                  <div className="text-sm font-medium">Photos sélectionnées :</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeSelectedFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                            {file.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleUploadPhotos}
                    disabled={uploadingPhotos}
                    className="w-full"
                  >
                    {uploadingPhotos ? 'Upload en cours...' : `Uploader ${selectedFiles.length} photo(s)`}
                  </Button>
                </div>
              )}

              {/* Photos existantes */}
              {progressData.some(entry => entry.photos_urls && entry.photos_urls.length > 0) ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Photos existantes :</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {progressData
                      .filter(entry => entry.photos_urls && entry.photos_urls.length > 0)
                      .map((entry) => 
                        entry.photos_urls?.map((url, index) => (
                          <div key={`${entry.id}-${index}`} className="relative group">
                            <img
                              src={url}
                              alt={`Photo progression ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeletePhoto(entry.id, index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="absolute bottom-1 left-1 right-1">
                              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded text-center">
                                {new Date(entry.measurement_date).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        ))
                      )
                      .flat()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune photo de progression</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}

export default CoachProgressionDashboard
