import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Target, Scale, Trophy, Plus, Minus, Image, Upload, X, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ProgressPhotoService, { ProgressPhotoWithUrl } from '@/services/progressPhotoService'
import { useToast } from '@/hooks/use-toast'

interface ProgressionData {
  poids_depart: number | null
  poids_objectif: number | null
  poids_actuel: number | null
}

interface ProgressionChartProps {
  client: {
    first_name: string
    last_name: string
  } & ProgressionData
  clientId: string
  progressHistory?: Array<{
    date: string
    weight: number | null
    body_fat?: number
    muscle_mass?: number
  }>
  onSave?: (data: ProgressionData) => Promise<void>
  isLoading?: boolean
}

const ProgressionChart: React.FC<ProgressionChartProps> = ({ 
  client, 
  clientId,
  progressHistory = [],
  onSave,
  isLoading
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<ProgressionData>({
    poids_depart: client.poids_depart,
    poids_objectif: client.poids_objectif,
    poids_actuel: client.poids_actuel
  })
  const [photos, setPhotos] = useState<ProgressPhotoWithUrl[]>([])
  const [isAddingPhoto, setIsAddingPhoto] = useState(false)
  const [newPhotoDescription, setNewPhotoDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loadingPhotos, setLoadingPhotos] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  // Charger les photos au montage du composant
  useEffect(() => {
    loadPhotos()
  }, [clientId])

  const loadPhotos = async () => {
    try {
      setLoadingPhotos(true)
      const photosData = await ProgressPhotoService.getClientProgressPhotos(clientId)
      setPhotos(photosData)
    } catch (error) {
      console.error('Error loading photos:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les photos de progression.",
        variant: "destructive",
      })
    } finally {
      setLoadingPhotos(false)
    }
  }

  const { poids_depart, poids_objectif, poids_actuel } = editData

  // Calculs de progression
  const hasValidData = poids_depart && poids_objectif && poids_actuel
  
  let progressPercentage = 0
  let remainingWeight = 0
  let isGainingWeight = false
  let progressMessage = ""

  if (hasValidData) {
    const totalChange = Math.abs(poids_objectif - poids_depart)
    const currentChange = Math.abs(poids_actuel - poids_depart)
    
    // Déterminer si c'est une prise ou perte de poids
    isGainingWeight = poids_objectif > poids_depart
    
    if (totalChange > 0) {
      progressPercentage = Math.min((currentChange / totalChange) * 100, 100)
    }
    
    remainingWeight = Math.abs(poids_objectif - poids_actuel)
    
    if (progressPercentage >= 100) {
      progressMessage = "🎉 Objectif atteint ! Félicitations !"
    } else {
      const action = isGainingWeight ? "prendre" : "perdre"
      progressMessage = `Plus que ${remainingWeight.toFixed(1)} kg à ${action} !`
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave(editData)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      poids_depart: client.poids_depart,
      poids_objectif: client.poids_objectif,
      poids_actuel: client.poids_actuel
    })
    setIsEditing(false)
  }

  const updateWeight = (field: keyof ProgressionData, value: number) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Fonctions pour gérer les photos de progression
  const handleAddPhoto = () => {
    setIsAddingPhoto(true)
    setSelectedFile(null)
    setNewPhotoDescription('')
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier.",
        variant: "destructive",
      })
      return
    }

    if (!newPhotoDescription.trim()) {
      toast({
        title: "Erreur",
        description: "La description de la photo est obligatoire.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      
      const uploadData = {
        file: selectedFile,
        nom_photo: selectedFile.name,
        description: newPhotoDescription.trim(),
        date_prise: new Date().toISOString()
      }

      await ProgressPhotoService.uploadProgressPhoto(clientId, uploadData)
      
      toast({
        title: "Succès",
        description: "Photo ajoutée avec succès !",
      })
      
      setNewPhotoDescription('')
      setSelectedFile(null)
      setIsAddingPhoto(false)
      loadPhotos() // Recharger les photos après l'ajout
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la photo de progression.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      try {
        await ProgressPhotoService.deleteProgressPhoto(photoId)
        toast({
          title: "Succès",
          description: "Photo supprimée avec succès !",
        })
        loadPhotos() // Recharger les photos après la suppression
      } catch (error) {
        console.error('Error deleting photo:', error)
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la photo de progression.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCancelPhoto = () => {
    setIsAddingPhoto(false)
    setNewPhotoDescription('')
    setSelectedFile(null)
  }

  return (
    <div className="space-y-6">
      {/* Cartes de métriques */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Poids de départ</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={poids_depart || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWeight('poids_depart', parseFloat(e.target.value) || 0)}
                    placeholder="kg"
                    className="text-2xl font-bold"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  {poids_depart ? `${poids_depart} kg` : '--'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Point de départ
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Poids actuel</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={poids_actuel || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWeight('poids_actuel', parseFloat(e.target.value) || 0)}
                    placeholder="kg"
                    className="text-2xl font-bold"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  {poids_actuel ? `${poids_actuel} kg` : '--'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Dernière mesure
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objectif</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={poids_objectif || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateWeight('poids_objectif', parseFloat(e.target.value) || 0)}
                    placeholder="kg"
                    className="text-2xl font-bold"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold">
                  {poids_objectif ? `${poids_objectif} kg` : '--'}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Cible à atteindre
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphique de progression vers l'objectif */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-orange-500" />
                  <span>Progression vers l'objectif</span>
                </CardTitle>
                <CardDescription>
                  Suivi de l'évolution du poids
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasValidData ? (
              <>
                {/* Barre de progression */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progression</span>
                    <span className="text-muted-foreground">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-3"
                  />
                </div>

                {/* Message de progression */}
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <p className="text-lg font-semibold text-orange-800">
                    {progressMessage}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    {progressPercentage.toFixed(1)}% de l'objectif atteint
                  </p>
                </div>

                {/* Section Photos de progression */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Image className="h-5 w-5 text-blue-500" />
                      <span>Photos de progression</span>
                    </h4>
                    <Button
                      onClick={handleAddPhoto}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une photo
                    </Button>
                  </div>

                  {/* Zone d'ajout de photo */}
                  {isAddingPhoto && (
                    <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                      <div className="text-center space-y-3">
                        <Upload className="h-8 w-8 text-blue-500 mx-auto" />
                        <div>
                          <p className="font-medium text-blue-800">Ajouter une photo de progression</p>
                          <p className="text-sm text-blue-600">Documentez votre évolution physique</p>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Sélection de fichier */}
                          <div>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="max-w-xs mx-auto"
                            />
                            {selectedFile && (
                              <p className="text-xs text-blue-600 mt-1">
                                Fichier sélectionné : {selectedFile.name}
                              </p>
                            )}
                          </div>
                          
                          {/* Description */}
                          <Input
                            placeholder="Description de la photo (obligatoire)"
                            value={newPhotoDescription}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPhotoDescription(e.target.value)}
                            className="max-w-xs mx-auto"
                          />
                        </div>

                        <div className="flex justify-center space-x-2">
                          <Button
                            onClick={handlePhotoUpload}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600"
                            disabled={uploading || !selectedFile || !newPhotoDescription.trim()}
                          >
                            {uploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Upload en cours...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Ajouter la photo
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleCancelPhoto}
                            variant="outline"
                            size="sm"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grille des photos existantes */}
                  {loadingPhotos ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Chargement des photos...</p>
                    </div>
                  ) : photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div className="aspect-[3/4] rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={photo.previewUrl || photo.url_fichier}
                              alt={photo.description || photo.nom_photo}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback si l'image ne charge pas
                                const target = e.target as HTMLImageElement
                                target.src = 'https://via.placeholder.com/300x400/4F46E5/FFFFFF?text=Photo+Progression'
                              }}
                            />
                          </div>
                          
                          {/* Bouton supprimer */}
                          <Button
                            onClick={() => handleDeletePhoto(photo.id)}
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          
                          {/* Info de la photo */}
                          <div className="mt-2 text-center">
                            <p className="text-xs text-gray-600">
                              {new Date(photo.date_prise).toLocaleDateString('fr-FR')}
                            </p>
                            {photo.description && (
                              <p className="text-xs text-gray-500 truncate">
                                {photo.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Image className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Aucune photo de progression</p>
                      <p className="text-xs text-gray-400">
                        Ajoutez des photos pour documenter votre évolution
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Données de progression manquantes</p>
                <p className="text-sm text-gray-400">
                  Renseignez les poids de départ, actuel et objectif pour voir la progression
                </p>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  Ajouter les données
                </Button>
              </div>
            )}

            {/* Boutons d'action si en mode édition */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Annuler
                </Button>
                <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                  Sauvegarder
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ProgressionChart
