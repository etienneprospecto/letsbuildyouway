import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Target, UserCheck, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import ClientService, { CreateClientData } from '@/services/clientService'
import InvitationService, { CreateInvitationData } from '@/services/invitationService'
import { supabase } from '@/lib/supabase'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: () => void
  coachId: string
}

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  age: string
  height_cm: string
  weight_kg: string
  primary_goal: string
  fitness_level: string
  medical_conditions: string
  dietary_restrictions: string
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onClientAdded,
  coachId
}) => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [invitationSent, setInvitationSent] = useState<{
    email: string
    clientName: string
    invitationUrl?: string
  } | null>(null)

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    primary_goal: 'general_fitness',
    fitness_level: 'beginner',
    medical_conditions: '',
    dietary_restrictions: ''
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Fonction supprimée - plus besoin de générer des identifiants

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Vérifier que l'email n'est pas déjà utilisé par un autre coach
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id, coach_id')
        .eq('contact', formData.email)
        .maybeSingle()

      if (existingClient) {
        toast({
          title: "Email déjà utilisé",
          description: "Cet email est déjà utilisé par un autre client",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Vérifier s'il y a déjà une invitation en attente
      const { data: existingInvitation } = await supabase
        .from('client_invitations')
        .select('id, status')
        .eq('coach_id', coachId)
        .eq('client_email', formData.email)
        .eq('status', 'pending')
        .maybeSingle()

      if (existingInvitation) {
        toast({
          title: "Invitation déjà envoyée",
          description: "Une invitation est déjà en attente pour cet email",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Créer l'invitation
      const invitationData: CreateInvitationData = {
        coach_id: coachId,
        client_email: formData.email,
        client_first_name: formData.first_name,
        client_last_name: formData.last_name,
        client_phone: formData.phone || undefined,
        client_date_of_birth: formData.date_of_birth || undefined,
        client_gender: formData.gender || undefined,
        client_age: formData.age ? parseInt(formData.age) : undefined,
        client_height_cm: formData.height_cm ? parseInt(formData.height_cm) : undefined,
        client_weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
        client_primary_goal: formData.primary_goal,
        client_fitness_level: formData.fitness_level,
        client_medical_conditions: formData.medical_conditions || undefined,
        client_dietary_restrictions: formData.dietary_restrictions || undefined
      }

      const invitation = await InvitationService.createInvitation(invitationData)

      const invitationUrl = `${window.location.origin}/?token=${invitation.token}`

      toast({
        title: "Invitation envoyée !",
        description: `Un email d'invitation a été envoyé à ${formData.email}`,
      })

      setInvitationSent({
        email: formData.email,
        clientName: `${formData.first_name} ${formData.last_name}`,
        invitationUrl: invitationUrl
      })
      setStep(2) // Afficher la confirmation
      onClientAdded()

    } catch (error) {
      console.error('Error sending invitation:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'envoi de l'invitation",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setInvitationSent(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      age: '',
      height_cm: '',
      weight_kg: '',
      primary_goal: 'general_fitness',
      fitness_level: 'beginner',
      medical_conditions: '',
      dietary_restrictions: ''
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
              <h2 className="text-2xl font-bold">Ajouter un nouveau client</h2>
              <p className="text-muted-foreground">
                {step === 1 ? "Remplissez les informations du client" : "Invitation envoyée avec succès"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6">
            {step === 1 ? (
              /* Étape 1: Formulaire */
              <div className="space-y-6">
                {/* Informations de base */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informations de base
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">Prénom *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="Prénom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nom *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Nom"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">Date de naissance</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Âge</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="25"
                        min="16"
                        max="100"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Informations physiques et objectifs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Objectifs et niveau
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary_goal">Objectif principal *</Label>
                      <Select value={formData.primary_goal} onValueChange={(value) => handleInputChange('primary_goal', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight_loss">Perte de poids</SelectItem>
                          <SelectItem value="muscle_gain">Prise de muscle</SelectItem>
                          <SelectItem value="general_fitness">Forme générale</SelectItem>
                          <SelectItem value="endurance">Endurance</SelectItem>
                          <SelectItem value="strength">Force</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fitness_level">Niveau actuel *</Label>
                      <Select value={formData.fitness_level} onValueChange={(value) => handleInputChange('fitness_level', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Débutant</SelectItem>
                          <SelectItem value="intermediate">Intermédiaire</SelectItem>
                          <SelectItem value="advanced">Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="height_cm">Taille (cm)</Label>
                      <Input
                        id="height_cm"
                        type="number"
                        value={formData.height_cm}
                        onChange={(e) => handleInputChange('height_cm', e.target.value)}
                        placeholder="175"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight_kg">Poids (kg)</Label>
                      <Input
                        id="weight_kg"
                        type="number"
                        step="0.1"
                        value={formData.weight_kg}
                        onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                        placeholder="70.5"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notes et informations médicales */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notes et informations importantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="medical_conditions">Conditions médicales</Label>
                      <Textarea
                        id="medical_conditions"
                        value={formData.medical_conditions}
                        onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                        placeholder="Conditions médicales, blessures..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dietary_restrictions">Restrictions alimentaires</Label>
                      <Textarea
                        id="dietary_restrictions"
                        value={formData.dietary_restrictions}
                        onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                        placeholder="Allergies, régimes spéciaux..."
                        rows={2}
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
                    {isLoading ? "Envoi..." : "Envoyer l'invitation"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Étape 2: Confirmation d'invitation */
              <div className="space-y-6">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <UserCheck className="h-5 w-5" />
                      Invitation envoyée avec succès !
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Votre client recevra un email d'invitation pour rejoindre la plateforme
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Mail className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{invitationSent?.clientName}</p>
                          <p className="text-sm text-gray-600">{invitationSent?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <div className="text-blue-600 mt-0.5">ℹ️</div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Prochaines étapes :</p>
                          <ul className="mt-1 space-y-1">
                            <li>• Votre client recevra un email avec un lien d'invitation</li>
                            <li>• Il pourra configurer son mot de passe en cliquant sur le lien</li>
                            <li>• Une fois connecté, il apparaîtra dans votre liste de clients</li>
                            <li>• L'invitation expire dans 7 jours</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Lien d'invitation de secours */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <div className="text-yellow-600 mt-0.5">🔗</div>
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Lien d'invitation (de secours) :</p>
                          <p className="mt-1 text-xs text-yellow-700">
                            Si l'email n'arrive pas, vous pouvez envoyer ce lien manuellement :
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              value={invitationSent?.invitationUrl || ''}
                              readOnly
                              className="bg-white text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(invitationSent?.invitationUrl || '')}
                            >
                              Copier
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button onClick={handleClose}>
                    Terminé
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AddClientModal
