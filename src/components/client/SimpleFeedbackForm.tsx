import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  BarChart3, 
  CheckSquare,
  AlertCircle,
  CheckCircle,
  Star,
  Target,
  ArrowRight,
  Save,
  Send
} from 'lucide-react'
import { FeedbackTemplate, FeedbackQuestion } from '@/types/feedback'

interface SimpleFeedbackFormProps {
  template: FeedbackTemplate
  onSubmit: (responses: Record<string, any>) => void
  loading?: boolean
  initialResponses?: Record<string, any>
}

const SimpleFeedbackForm: React.FC<SimpleFeedbackFormProps> = ({
  template,
  onSubmit,
  loading = false,
  initialResponses = {}
}) => {
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    if (Object.keys(initialResponses).length > 0) {
      setResponses(initialResponses)
    }
  }, [])

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // Effacer l'erreur pour cette question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    console.log('🔍 Validation du formulaire...')
    const newErrors: Record<string, string> = {}
    
    template.questions.forEach(question => {
      console.log(`📋 Validation question ${question.id}:`, {
        question_text: question.question_text,
        required: question.required,
        question_type: question.question_type,
        response: responses[question.id]
      })
      
      if (question.required) {
        const response = responses[question.id]
        
        if (response === undefined || response === null || response === '') {
          console.log(`❌ Question ${question.id} manquante`)
          newErrors[question.id] = 'Cette question est obligatoire'
        } else if (question.question_type === 'multiple_choice' && Array.isArray(response) && response.length === 0) {
          console.log(`❌ Question ${question.id} choix multiple vide`)
          newErrors[question.id] = 'Sélectionnez au moins une option'
        } else {
          console.log(`✅ Question ${question.id} valide`)
        }
      }
    })
    
    console.log('📊 Erreurs trouvées:', newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    console.log('🔍 SimpleFeedbackForm - handleSubmit appelé')
    console.log('📝 Réponses actuelles:', responses)
    console.log('📋 Template questions:', template.questions)
    
    if (validateForm()) {
      console.log('✅ Validation réussie, soumission des réponses')
      onSubmit(responses)
    } else {
      console.log('❌ Validation échouée, erreurs:', errors)
    }
  }

  const getProgressPercentage = (): number => {
    const totalQuestions = template.questions.length
    const answeredQuestions = Object.keys(responses).length
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />
      case 'scale_1_10': return <BarChart3 className="h-4 w-4" />
      case 'multiple_choice': return <CheckSquare className="h-4 w-4" />
      case 'yes_no': return <CheckCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Texte libre'
      case 'scale_1_10': return 'Échelle 1-10'
      case 'multiple_choice': return 'Choix multiple'
      case 'yes_no': return 'Oui/Non'
      default: return 'Question'
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < template.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const renderQuestion = (question: FeedbackQuestion, index: number) => {
    const isActive = index === currentQuestionIndex
    const hasError = errors[question.id]
    const isAnswered = responses[question.id] !== undefined && responses[question.id] !== ''

    return (
      <div
        key={question.id}
        className={`space-y-4 ${isActive ? 'block' : 'hidden'}`}
      >
        <Card className={`transition-all duration-200 ${isActive ? 'ring-2 ring-primary shadow-lg' : ''}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {getQuestionTypeIcon(question.question_type)}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Question {index + 1} sur {template.questions.length}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getQuestionTypeLabel(question.question_type)}
                    </Badge>
                    {question.required && (
                      <Badge variant="destructive" className="text-xs">
                        Obligatoire
                      </Badge>
                    )}
                    {isAnswered && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Répondu
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {hasError && (
                <Alert className="w-auto p-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{hasError}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={question.id} className="text-base font-medium">
                {question.question_text}
              </Label>
            </div>

            {/* Rendu selon le type de question */}
            {question.question_type === 'text' && (
              <Textarea
                id={question.id}
                placeholder="Votre réponse..."
                value={responses[question.id] || ''}
                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                className="min-h-[100px]"
              />
            )}

            {question.question_type === 'scale_1_10' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">1 (Très faible)</span>
                  <span className="text-sm text-muted-foreground">10 (Excellent)</span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={responses[question.id] || 5}
                    onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="w-16 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {responses[question.id] || 5}
                    </div>
                    <div className="text-xs text-muted-foreground">/10</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                </div>
              </div>
            )}

            {question.question_type === 'multiple_choice' && (
              <div className="space-y-2">
                {question.options?.map((option: string, optionIndex: number) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`${question.id}-${optionIndex}`}
                      checked={responses[question.id]?.includes(option) || false}
                      onChange={(e) => {
                        const currentChoices = responses[question.id] || []
                        if (e.target.checked) {
                          handleResponseChange(question.id, [...currentChoices, option])
                        } else {
                          handleResponseChange(question.id, currentChoices.filter((choice: string) => choice !== option))
                        }
                      }}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor={`${question.id}-${optionIndex}`} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {question.question_type === 'yes_no' && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${question.id}-yes`}
                    name={question.id}
                    value="yes"
                    checked={responses[question.id] === 'yes'}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label htmlFor={`${question.id}-yes`} className="text-sm">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${question.id}-no`}
                    name={question.id}
                    value="no"
                    checked={responses[question.id] === 'no'}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <Label htmlFor={`${question.id}-no`} className="text-sm">Non</Label>
                </div>
                {responses[question.id] && (
                  <Badge variant={responses[question.id] === 'yes' ? 'default' : 'secondary'}>
                    {responses[question.id] === 'yes' ? '✅ Oui' : '❌ Non'}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-muted-foreground">
                {Object.keys(responses).length} / {template.questions.length} questions
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
            
            {/* Navigation rapide */}
            <div className="flex flex-wrap gap-2">
              {template.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToQuestion(index)}
                  className="relative"
                >
                  {index + 1}
                  {responses[template.questions[index].id] && (
                    <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {template.questions.map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Navigation et soumission */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Précédent
              </Button>
              <Button
                variant="outline"
                onClick={nextQuestion}
                disabled={currentQuestionIndex === template.questions.length - 1}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Sauvegarder en brouillon
                  console.log('Sauvegarde brouillon:', responses)
                }}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Soumettre le feedback
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé des réponses */}
      {Object.keys(responses).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Résumé de vos réponses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(responses).map(([questionId, response]) => {
                const question = template.questions.find(q => q.id === questionId)
                if (!question) return null
                
                return (
                  <div key={questionId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm font-medium truncate flex-1 mr-2">
                      {question.question_text}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {question.question_type === 'multiple_choice' && Array.isArray(response) 
                        ? `${response.length} choix`
                        : question.question_type === 'scale_1_10'
                        ? `${response}/10`
                        : question.question_type === 'yes_no'
                        ? (response === 'yes' ? 'Oui' : 'Non')
                        : 'Répondu'
                      }
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affichage des erreurs de validation */}
      {Object.keys(errors).length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-800 dark:text-red-200">Erreurs de validation</h4>
            </div>
            <ul className="space-y-1">
              {Object.entries(errors).map(([questionId, error]) => {
                const question = template.questions.find(q => q.id === questionId)
                return (
                  <li key={questionId} className="text-sm text-red-700 dark:text-red-300">
                    • {question?.question_text}: {error}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Boutons d'action */}
      <div className="flex justify-center space-x-3 pt-8 pb-4">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          size="lg"
          className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-xl text-lg px-8 py-3"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-3" />
              Envoyer le feedback
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default SimpleFeedbackForm
