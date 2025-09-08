import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Dumbbell, Target, Clock, Settings, Video, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { WorkoutService, CreateExerciseData } from '@/services/workoutService'

interface AddExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  onExerciseAdded: () => void
  coachId: string
  exercises?: any[]
  editingExercise?: any | null
}

interface FormData {
  name: string
  description: string
  type: string
  difficulty: string
  video_url: string
  image_url: string
  muscle_groups: string[]
  equipment_needed: string[]
}

const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onExerciseAdded,
  coachId,
  exercises = [],
  editingExercise
}) => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'Musculation',
    difficulty: 'Facile',
    video_url: '',
    image_url: '',
    muscle_groups: [],
    equipment_needed: []
  })

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Pré-remplir le formulaire quand on édite un exercice
  React.useEffect(() => {
    if (editingExercise) {
      setFormData({
        name: editingExercise.name || '',
        description: editingExercise.description || '',
        type: editingExercise.type || 'Musculation',
        difficulty: editingExercise.difficulty || 'Facile',
        video_url: editingExercise.video_url || '',
        image_url: editingExercise.image_url || '',
        muscle_groups: editingExercise.muscle_groups || [],
        equipment_needed: editingExercise.equipment_needed || []
      })
    } else {
      // Reset form for new exercise
      setFormData({
        name: '',
        description: '',
        type: 'Musculation',
        difficulty: 'Facile',
        video_url: '',
        image_url: '',
        muscle_groups: [],
        equipment_needed: []
      })
    }
  }, [editingExercise])

  const handleArrayChange = (field: 'muscle_groups' | 'equipment_needed', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeArrayItem = (field: 'muscle_groups' | 'equipment_needed', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || !formData.difficulty) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const exerciseData: CreateExerciseData = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        muscle_groups: formData.muscle_groups.length > 0 ? formData.muscle_groups : undefined,
        difficulty: formData.difficulty,
        equipment_needed: formData.equipment_needed.length > 0 ? formData.equipment_needed : undefined,
        video_url: formData.video_url || undefined,
        image_url: formData.image_url || undefined
      }

      if (editingExercise) {
        await WorkoutService.updateExercise(editingExercise.id, exerciseData)
        toast({
          title: "Succès !",
          description: "Exercice modifié avec succès",
        })
      } else {
        await WorkoutService.createExercise(coachId, exerciseData)
        toast({
          title: "Succès !",
          description: "Exercice ajouté avec succès",
        })
      }

      onExerciseAdded()
      handleClose()

    } catch (error) {
      console.error('Error adding exercise:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'exercice",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      type: 'Musculation',
      difficulty: 'Facile',
      video_url: '',
      image_url: '',
      muscle_groups: [],
      equipment_needed: []
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">
                {editingExercise ? 'Modifier l\'exercice' : 'Ajouter un nouvel exercice'}
              </h2>
              <p className="text-muted-foreground">
                {editingExercise ? 'Modifiez les informations de l\'exercice' : 'Créez un exercice pour votre bibliothèque personnelle'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    Informations de base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom de l'exercice *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Push-ups, Squats, Burpees..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Description détaillée de l'exercice..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Musculation">Musculation</SelectItem>
                          <SelectItem value="Cardio">Cardio</SelectItem>
                          <SelectItem value="Étirement">Étirement</SelectItem>
                          <SelectItem value="Pilates">Pilates</SelectItem>
                          <SelectItem value="Yoga">Yoga</SelectItem>
                          <SelectItem value="CrossFit">CrossFit</SelectItem>
                          <SelectItem value="Fonctionnel">Fonctionnel</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="difficulty">Niveau *</Label>
                      <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Facile">Facile</SelectItem>
                          <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                          <SelectItem value="Difficile">Difficile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* Groupes musculaires et équipement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Groupes musculaires et équipement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Groupes musculaires ciblés</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Ex: chest, triceps..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleArrayChange('muscle_groups', (e.target as HTMLInputElement).value)
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Ex: chest, triceps..."]') as HTMLInputElement
                          if (input?.value) {
                            handleArrayChange('muscle_groups', input.value)
                            input.value = ''
                          }
                        }}
                      >
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.muscle_groups.map((group, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem('muscle_groups', index)}>
                          {group} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Équipement nécessaire</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Ex: none, dumbbells, resistance band..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleArrayChange('equipment_needed', (e.target as HTMLInputElement).value)
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Ex: none, dumbbells, resistance band..."]') as HTMLInputElement
                          if (input?.value) {
                            handleArrayChange('equipment_needed', input.value)
                            input.value = ''
                          }
                        }}
                      >
                        Ajouter
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.equipment_needed.map((equipment, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem('equipment_needed', index)}>
                          {equipment} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Médias et visibilité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Médias et visibilité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="video_url">URL vidéo (optionnel)</Label>
                    <Input
                      id="video_url"
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => handleInputChange('video_url', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">URL image (optionnel)</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => handleInputChange('image_url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading 
                    ? (editingExercise ? "Modification..." : "Création...") 
                    : (editingExercise ? "Modifier l'exercice" : "Créer l'exercice")
                  }
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AddExerciseModal
