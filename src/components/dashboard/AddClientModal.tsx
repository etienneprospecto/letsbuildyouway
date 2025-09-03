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
  height_cm: string
  weight_kg: string
  primary_goal: string
  fitness_level: string
  notes: string
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
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string
    password: string
    clientId: string
  } | null>(null)

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    primary_goal: 'general_fitness',
    fitness_level: 'beginner',
    notes: '',
    medical_conditions: '',
    dietary_restrictions: ''
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateClientCredentials = () => {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    const clientId = `CLIENT_${timestamp}_${randomSuffix}`
    
    // Générer un mot de passe sécurisé
    const password = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15).toUpperCase() +
                    Math.floor(Math.random() * 10) +
                    '!'
    
    return {
      email: formData.email,
      password,
      clientId
    }
  }

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

      // Étape 1: Générer les identifiants
      const credentials = generateClientCredentials()
      setGeneratedCredentials(credentials)

      // Étape 2: Créer le compte utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: 'client',
            client_id: credentials.clientId
          }
        }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        throw new Error('Erreur lors de la création du compte utilisateur: ' + authError.message)
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé')
      }

      // Étape 3: Créer la fiche client
      const clientData: CreateClientData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : undefined,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
        primary_goal: formData.primary_goal,
        fitness_level: formData.fitness_level,
        notes: formData.notes || undefined,
        medical_conditions: formData.medical_conditions || undefined,
        dietary_restrictions: formData.dietary_restrictions || undefined
      }

      const newClient = await ClientService.createClient(coachId, clientData)

      toast({
        title: "Succès !",
        description: "Client ajouté avec succès",
      })

      setStep(2) // Afficher les identifiants
      onClientAdded()

    } catch (error) {
      console.error('Error adding client:', error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout du client",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setGeneratedCredentials(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      height_cm: '',
      weight_kg: '',
      primary_goal: 'general_fitness',
      fitness_level: 'beginner',
      notes: '',
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
                {step === 1 ? "Remplissez les informations du client" : "Identifiants de connexion générés"}
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
                      <Label htmlFor="notes">Notes générales</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Informations générales sur le client..."
                        rows={3}
                      />
                    </div>
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
                    {isLoading ? "Création..." : "Créer le client"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Étape 2: Identifiants générés */
              <div className="space-y-6">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <UserCheck className="h-5 w-5" />
                      Client créé avec succès !
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Voici les identifiants de connexion pour votre client
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Email de connexion</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={generatedCredentials?.email}
                            readOnly
                            className="bg-white"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(generatedCredentials?.email || '')}
                          >
                            Copier
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Mot de passe temporaire</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={generatedCredentials?.password}
                            readOnly
                            className="bg-white"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(generatedCredentials?.password || '')}
                          >
                            Copier
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <div className="text-yellow-600 mt-0.5">⚠️</div>
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Important :</p>
                          <ul className="mt-1 space-y-1">
                            <li>• Envoyez ces identifiants à votre client par email</li>
                            <li>• Le client devra changer son mot de passe lors de la première connexion</li>
                            <li>• Ces identifiants ne seront plus affichés après fermeture</li>
                          </ul>
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
