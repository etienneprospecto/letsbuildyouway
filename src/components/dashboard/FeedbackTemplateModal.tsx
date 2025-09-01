import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  FileText, 
  BarChart3, 
  List, 
  CheckSquare 
} from 'lucide-react'
import { FeedbackTemplate, FeedbackQuestion } from '@/types/feedback'
import { toast } from '@/hooks/use-toast'

interface FeedbackTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template?: FeedbackTemplate | null
  onSave: (template: Omit<FeedbackTemplate, 'id' | 'created_at' | 'updated_at'>) => void
}

const FeedbackTemplateModal: React.FC<FeedbackTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [questions, setQuestions] = useState<FeedbackQuestion[]>([])
  const [loading, setLoading] = useState(false)

  const isEditing = !!template

  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description || '')
      setIsActive(template.is_active)
      setQuestions(template.questions)
    } else {
      resetForm()
    }
  }, [template])

  const resetForm = () => {
    setName('')
    setDescription('')
    setIsActive(true)
    setQuestions([])
  }

  const addQuestion = () => {
    const newQuestion: Omit<FeedbackQuestion, 'id' | 'created_at'> = {
      template_id: '', // Sera défini lors de la sauvegarde
      question_text: '',
      question_type: 'text',
      order_index: questions.length,
      required: true,
      options: []
    }
    setQuestions([...questions, newQuestion as FeedbackQuestion])
  }

  const updateQuestion = (index: number, field: keyof FeedbackQuestion, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuestions(updatedQuestions)
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    // Réindexer les questions
    updatedQuestions.forEach((q, i) => {
      q.order_index = i
    })
    setQuestions(updatedQuestions)
  }

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    const currentOptions = updatedQuestions[questionIndex].options || []
    updatedQuestions[questionIndex].options = [...currentOptions, '']
    setQuestions(updatedQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    const currentOptions = [...(updatedQuestions[questionIndex].options || [])]
    currentOptions[optionIndex] = value
    updatedQuestions[questionIndex].options = currentOptions
    setQuestions(updatedQuestions)
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions]
    const currentOptions = [...(updatedQuestions[questionIndex].options || [])]
    currentOptions.splice(optionIndex, 1)
    updatedQuestions[questionIndex].options = currentOptions
    setQuestions(updatedQuestions)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du template est requis",
        variant: "destructive"
      })
      return
    }

    if (questions.length === 0) {
      toast({
        title: "Erreur",
        description: "Ajoutez au moins une question",
        variant: "destructive"
      })
      return
    }

    if (questions.some(q => !q.question_text.trim())) {
      toast({
        title: "Erreur",
        description: "Toutes les questions doivent avoir un texte",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const templateData = isEditing && template ? {
        ...template,
        name: name.trim(),
        description: description.trim(),
        is_active: isActive,
        questions: questions.map((q, index) => ({
          ...q,
          order_index: index
        }))
      } : {
        name: name.trim(),
        description: description.trim(),
        is_active: isActive,
        questions: questions.map((q, index) => ({
          ...q,
          order_index: index
        }))
      }

      console.log('📤 Données envoyées au parent:', templateData)
      console.log('🔍 Mode édition:', isEditing)
      console.log('📋 Template original:', template)
      
      await onSave(templateData)
      
      toast({
        title: "Succès",
        description: `Template ${isEditing ? 'modifié' : 'créé'} avec succès`
      })
      
      onClose()
    } catch (error) {
      console.error('Erreur sauvegarde template:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getQuestionTypeIcon = (type: string) => {
    const icons = {
      text: FileText,
      scale_1_10: BarChart3,
      multiple_choice: List,
      yes_no: CheckSquare
    }
    return icons[type as keyof typeof icons] || FileText
  }

  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      text: 'Texte libre',
      scale_1_10: 'Échelle 1-10',
      multiple_choice: 'Choix multiple',
      yes_no: 'Oui/Non'
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le template' : 'Créer un nouveau template'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifiez les informations et questions de votre template de feedback'
              : 'Créez un nouveau template de feedback personnalisé pour vos clients'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du template *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Feedback bien-être hebdomadaire"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={isActive ? 'active' : 'inactive'} onValueChange={(value) => setIsActive(value === 'active')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description optionnelle du template..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Questions du template</CardTitle>
              <Button onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une question
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Aucune question ajoutée</p>
                  <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                            <Badge variant="outline">
                              Question {index + 1}
                            </Badge>
                            <Badge variant="secondary">
                              {getQuestionTypeLabel(question.question_type)}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Type de question</Label>
                            <Select
                              value={question.question_type}
                              onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Texte libre</SelectItem>
                                <SelectItem value="scale_1_10">Échelle 1-10</SelectItem>
                                <SelectItem value="multiple_choice">Choix multiple</SelectItem>
                                <SelectItem value="yes_no">Oui/Non</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Ordre</Label>
                            <Input
                              type="number"
                              value={question.order_index}
                              onChange={(e) => updateQuestion(index, 'order_index', parseInt(e.target.value))}
                              min={0}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Question *</Label>
                          <Textarea
                            value={question.question_text}
                            onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                            placeholder="Tapez votre question ici..."
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`required-${index}`}
                            checked={question.required}
                            onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor={`required-${index}`}>Question obligatoire</Label>
                        </div>

                        {/* Options pour les questions à choix multiple */}
                        {question.question_type === 'multiple_choice' && (
                          <div className="space-y-3">
                            <Label>Options de réponse</Label>
                            <div className="space-y-2">
                              {(question.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(index, optionIndex)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(index)}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter une option
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FeedbackTemplateModal
