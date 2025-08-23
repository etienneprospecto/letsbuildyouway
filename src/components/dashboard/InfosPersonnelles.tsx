import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, User, Target, AlertTriangle, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface Client {
  id: string
  first_name: string
  last_name: string
  age: number
  contact: string
  objective: string
  level: 'Débutant' | 'Intermédiaire' | 'Avancé'
  mentality: string
  sports_history: string
  coaching_type: string
  start_date: string
  constraints: string | null
  allergies: string | null
  morphotype: string | null
  equipment: string | null
  lifestyle: string | null
}

interface InfosPersonnellesProps {
  client: Client
  onSave: (updatedClient: Partial<Client>) => Promise<void>
  isLoading?: boolean
}

const InfosPersonnelles: React.FC<InfosPersonnellesProps> = ({ 
  client, 
  onSave, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<Client>(client)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof Client, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave(formData)
      toast({
        title: "Informations mises à jour",
        description: "Les informations du client ont été sauvegardées avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les informations.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const sections = [
    {
      title: "Objectif & Contexte coaching",
      icon: Target,
      fields: [
        {
          key: 'objective' as keyof Client,
          label: 'Objectif principal',
          type: 'textarea',
          placeholder: 'Ex: Perte de poids et tonification'
        },
        {
          key: 'level' as keyof Client,
          label: 'Niveau',
          type: 'select',
          options: ['Débutant', 'Intermédiaire', 'Avancé']
        },
        {
          key: 'mentality' as keyof Client,
          label: 'Mentalité',
          type: 'textarea',
          placeholder: 'Décrivez la mentalité et motivation du client'
        },
        {
          key: 'sports_history' as keyof Client,
          label: 'Historique sportif',
          type: 'textarea',
          placeholder: 'Expérience sportive antérieure'
        },
        {
          key: 'coaching_type' as keyof Client,
          label: 'Type de coaching',
          type: 'select',
          options: ['Suivi personnalisé', 'Programme standard', 'Coaching intensif']
        },
        {
          key: 'start_date' as keyof Client,
          label: 'Début du coaching',
          type: 'date'
        }
      ]
    },
    {
      title: "Contraintes & Spécificités",
      icon: AlertTriangle,
      fields: [
        {
          key: 'constraints' as keyof Client,
          label: 'Limitations/Blessures',
          type: 'textarea',
          placeholder: 'Blessures, limitations physiques...'
        },
        {
          key: 'allergies' as keyof Client,
          label: 'Allergies',
          type: 'textarea',
          placeholder: 'Allergies alimentaires ou autres'
        },
        {
          key: 'morphotype' as keyof Client,
          label: 'Morphotype',
          type: 'select',
          options: ['Non défini', 'Ectomorphe', 'Mésomorphe', 'Endomorphe']
        },
        {
          key: 'equipment' as keyof Client,
          label: 'Matériel disponible',
          type: 'textarea',
          placeholder: 'Équipements sportifs disponibles'
        },
        {
          key: 'lifestyle' as keyof Client,
          label: 'Spécificités rythme de vie',
          type: 'textarea',
          placeholder: 'Horaires, contraintes professionnelles...'
        }
      ]
    },
    {
      title: "Identité & Contact",
      icon: User,
      fields: [
        {
          key: 'first_name' as keyof Client,
          label: 'Prénom',
          type: 'text'
        },
        {
          key: 'last_name' as keyof Client,
          label: 'Nom',
          type: 'text'
        },
        {
          key: 'age' as keyof Client,
          label: 'Âge',
          type: 'number'
        },
        {
          key: 'contact' as keyof Client,
          label: 'Email de contact',
          type: 'email'
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {sections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <section.icon className="h-5 w-5 text-orange-500" />
                <span>{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <Label htmlFor={field.key} className="text-sm font-medium">
                      {field.label}
                    </Label>
                    
                    {field.type === 'text' || field.type === 'email' ? (
                      <Input
                        id={field.key}
                        type={field.type}
                        value={formData[field.key] as string || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="mt-1"
                      />
                    ) : field.type === 'number' ? (
                      <Input
                        id={field.key}
                        type="number"
                        value={formData[field.key] as number || ''}
                        onChange={(e) => handleInputChange(field.key, parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    ) : field.type === 'date' ? (
                      <Input
                        id={field.key}
                        type="date"
                        value={formData[field.key] as string || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="mt-1"
                      />
                    ) : field.type === 'textarea' ? (
                      <Textarea
                        id={field.key}
                        value={formData[field.key] as string || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="mt-1"
                      />
                    ) : field.type === 'select' ? (
                      <Select
                        value={formData[field.key] as string || ''}
                        onValueChange={(value) => handleInputChange(field.key, value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={`Sélectionner ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Bouton de sauvegarde */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </motion.div>
    </div>
  )
}

export default InfosPersonnelles
