import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Client, UpdateClientData } from '@/services/clientService'
import { useToast } from '@/hooks/use-toast'

interface EditClientModalProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onClientUpdated: (updatedClient: Client) => void
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  client,
  isOpen,
  onClose,
  onClientUpdated
}) => {
  const { toast } = useToast()
  const [formData, setFormData] = useState<UpdateClientData>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    height_cm: 0,
    weight_kg: 0,
    body_fat_percentage: 0,
    primary_goal: '',
    fitness_level: '',
    status: '',
    notes: '',
    medical_conditions: '',
    dietary_restrictions: ''
  })
  const [loading, setLoading] = useState(false)

  // Initialiser le formulaire quand le client change
  useEffect(() => {
    if (client) {
      setFormData({
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email,
        phone: client.phone || '',
        date_of_birth: client.date_of_birth || '',
        gender: client.gender || '',
        height_cm: client.height_cm || 0,
        weight_kg: client.weight_kg || 0,
        body_fat_percentage: client.body_fat_percentage || 0,
        primary_goal: client.primary_goal,
        fitness_level: client.fitness_level,
        status: client.status,
        notes: client.notes || '',
        medical_conditions: client.medical_conditions || '',
        dietary_restrictions: client.dietary_restrictions || ''
      })
    }
  }, [client])

  const handleInputChange = (field: keyof UpdateClientData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return

    setLoading(true)
    try {
      // Nettoyer les données avant l'envoi (convertir les chaînes vides en null)
      const cleanedData = {
        ...formData,
        date_of_birth: formData.date_of_birth || null,
        phone: formData.phone || null,
        gender: formData.gender || null,
        notes: formData.notes || null,
        medical_conditions: formData.medical_conditions || null,
        dietary_restrictions: formData.dietary_restrictions || null,
        height_cm: formData.height_cm || null,
        weight_kg: formData.weight_kg || null,
        body_fat_percentage: formData.body_fat_percentage || null
      }

      // Appeler le service pour mettre à jour le client
      const { ClientService } = await import('@/services/clientService')
      const updatedClient = await ClientService.updateClient(client.id, cleanedData)
      
      if (updatedClient) {
        onClientUpdated(updatedClient)
        toast({
          title: "Client mis à jour",
          description: `${updatedClient.first_name} ${updatedClient.last_name} a été modifié avec succès.`,
        })
        onClose()
      }
    } catch (error) {
      console.error('Error updating client:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le Client : {client.first_name} {client.last_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de Base</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="gender">Genre</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="height_cm">Taille (cm)</Label>
                <Input
                  id="height_cm"
                  type="number"
                  value={formData.height_cm}
                  onChange={(e) => handleInputChange('height_cm', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="weight_kg">Poids (kg)</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  value={formData.weight_kg}
                  onChange={(e) => handleInputChange('weight_kg', parseInt(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Objectifs et niveau */}
          <Card>
            <CardHeader>
              <CardTitle>Objectifs et Niveau</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_goal">Objectif principal *</Label>
                <Select value={formData.primary_goal} onValueChange={(value) => handleInputChange('primary_goal', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un objectif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Perte de poids</SelectItem>
                    <SelectItem value="muscle_gain">Prise de muscle</SelectItem>
                    <SelectItem value="general_fitness">Forme générale</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="strength">Force</SelectItem>
                    <SelectItem value="flexibility">Flexibilité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fitness_level">Niveau de fitness *</Label>
                <Select value={formData.fitness_level} onValueChange={(value) => handleInputChange('fitness_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="at_risk">À risque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes et informations médicales */}
          <Card>
            <CardHeader>
              <CardTitle>Notes et Informations Médicales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes générales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes sur le client, ses préférences, etc."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="medical_conditions">Conditions médicales</Label>
                <Textarea
                  id="medical_conditions"
                  value={formData.medical_conditions}
                  onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                  placeholder="Conditions médicales, blessures, etc."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="dietary_restrictions">Restrictions alimentaires</Label>
                <Textarea
                  id="dietary_restrictions"
                  value={formData.dietary_restrictions}
                  onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                  placeholder="Allergies, régimes, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Mettre à jour le Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
