import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  BarChart3, 
  List, 
  CheckSquare,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { FeedbackTemplate, FeedbackQuestion } from '@/types/feedback'

interface FeedbackFormProps {
  template: FeedbackTemplate
  onSubmit: (responses: Record<string, any>) => void
  loading?: boolean
  initialResponses?: Record<string, any>
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  template,
  onSubmit,
  loading = false,
  initialResponses = {}
}) => {
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    const newErrors: Record<string, string> = {}
    
    template.questions.forEach(question => {
      if (question.required) {
        const response = responses[question.id]
        
        if (response === undefined || response === null || response === '') {
          newErrors[question.id] = 'Cette question est obligatoire'
        } else if (question.question_type === 'multiple_choice' && Array.isArray(response) && response.length === 0) {
          newErrors[question.id] = 'Sélectionnez au moins une option'
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(responses)
    }
  }

  const getProgressPercentage = (): number => {
    const totalQuestions = template.questions.length
    const answeredQuestions = Object.keys(responses).length
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
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

  const renderQuestionInput = (question: FeedbackQuestion) => {
    const questionId = question.id
    const value = responses[questionId]
    const error = errors[questionId]

    switch (question.question_type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>
              {question.question_text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={questionId}
              value={value || ''}
              onChange={(e) => handleResponseChange(questionId, e.target.value)}
              placeholder="Tapez votre réponse..."
              rows={3}
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <div className="flex items-center space-x-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )

      case 'scale_1_10':
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>
              {question.question_text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-3">
              <Select value={value?.toString() || ''} onValueChange={(val) => handleResponseChange(questionId, parseInt(val))}>
                <SelectTrigger className={error ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Sélectionnez une note..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}/10
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {value && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Note sélectionnée:</span>
                  <Badge variant="outline">{value}/10</Badge>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            <Label>
              {question.question_text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {(question.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${questionId}-${index}`}
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : []
                      if (e.target.checked) {
                        handleResponseChange(questionId, [...currentValues, option])
                      } else {
                        handleResponseChange(questionId, currentValues.filter(v => v !== option))
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`${questionId}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {error && (
              <div className="flex items-center space-x-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )

      case 'yes_no':
        return (
          <div className="space-y-2">
            <Label>
              {question.question_text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${questionId}-yes`}
                  name={questionId}
                  value="yes"
                  checked={value === 'yes'}
                  onChange={(e) => handleResponseChange(questionId, e.target.value)}
                  className="rounded"
                />
                <Label htmlFor={`${questionId}-yes`} className="cursor-pointer">
                  Oui
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${questionId}-no`}
                  name={questionId}
                  value="no"
                  checked={value === 'no'}
                  onChange={(e) => handleResponseChange(questionId, e.target.value)}
                  className="rounded"
                />
                <Label htmlFor={`${questionId}-no`} className="cursor-pointer">
                  Non
                </Label>
              </div>
            </div>
            {error && (
              <div className="flex items-center space-x-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const progressPercentage = getProgressPercentage()

  return (
    <div className="space-y-6">
      {/* Header du template */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              {template.description && (
                <p className="text-muted-foreground mt-1">{template.description}</p>
              )}
            </div>
            <Badge variant="outline">
              {template.questions.length} questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Progression</span>
              <span>{Object.keys(responses).length}/{template.questions.length} réponses</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{progressPercentage}%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {template.questions.map((question, index) => (
          <Card key={question.id} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    Question {index + 1}
                  </Badge>
                  <Badge variant="secondary">
                    {getQuestionTypeLabel(question.question_type)}
                  </Badge>
                  {question.required && (
                    <Badge variant="destructive">
                      Obligatoire
                    </Badge>
                  )}
                </div>
                {responses[question.id] !== undefined && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderQuestionInput(question)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bouton de soumission */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={loading || progressPercentage < 100}
          size="lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Soumission...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Soumettre le feedback
            </>
          )}
        </Button>
      </div>

      {/* Message d'aide */}
      {progressPercentage < 100 && (
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Complétez toutes les questions obligatoires pour pouvoir soumettre le feedback
          </p>
        </div>
      )}
    </div>
  )
}

export default FeedbackForm
