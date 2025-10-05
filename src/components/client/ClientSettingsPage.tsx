import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings, 
  User, 
  Lock, 
  Save,
  Eye,
  EyeOff,
  Phone,
  Mail
} from 'lucide-react'
import { useAuth } from '@/providers/OptimizedAuthProvider'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface ClientData {
  first_name: string
  last_name: string
  contact: string
  phone?: string
  age?: number
  weight?: number
  height?: number
  primary_goal?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const ClientSettingsPage: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth()
  const { toast } = useToast()
  
  // États pour les informations du client
  const [clientData, setClientData] = useState<ClientData>({
    first_name: '',
    last_name: '',
    contact: '',
    phone: '',
    age: undefined,
    weight: undefined,
    height: undefined,
    primary_goal: ''
  })
  
  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // États pour l'interface
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Charger les données du client au montage
  useEffect(() => {
    if (profile && user) {
      loadClientData()
    }
  }, [profile, user])

  // Fonction pour recharger les données du client
  const reloadClientData = async () => {
    if (!user?.email) return

    try {
      const { data: clientRecord, error } = await supabase
        .from('clients')
        .select('*')
        .eq('contact', user.email)
        .single()

      if (error) throw error

      if (clientRecord) {
        setClientData({
          first_name: clientRecord.first_name || '',
          last_name: clientRecord.last_name || '',
          contact: clientRecord.contact || user.email || '',
          phone: clientRecord.phone || '',
          age: clientRecord.age || undefined,
          weight: clientRecord.weight || undefined,
          height: clientRecord.height || undefined,
          primary_goal: clientRecord.primary_goal || ''
        })
      }
    } catch (error) {
      console.error('Error reloading client data:', error)
    }
  }

  const loadClientData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les données du client depuis la table clients
      const { data: clientRecord, error } = await supabase
        .from('clients')
        .select('*')
        .eq('contact', user.email)
        .single()

      if (error) throw error

      if (clientRecord) {
        setClientData({
          first_name: clientRecord.first_name || '',
          last_name: clientRecord.last_name || '',
          contact: clientRecord.contact || user.email || '',
          phone: clientRecord.phone || '',
          age: clientRecord.age || undefined,
          weight: clientRecord.weight || undefined,
          height: clientRecord.height || undefined,
          primary_goal: clientRecord.primary_goal || ''
        })
      }
    } catch (error) {
      console.error('Error loading client data:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos informations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Gestionnaire pour les informations du client
  const handleClientChange = (field: keyof ClientData, value: string | number) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Gestionnaire pour le mot de passe
  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Sauvegarder les informations du client
  const handleSaveProfile = async () => {
    if (!user?.email) return

    try {
      setSavingProfile(true)

      const { error } = await supabase
        .from('clients')
        .update({
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          phone: clientData.phone,
          age: clientData.age,
          weight: clientData.weight,
          height: clientData.height,
          primary_goal: clientData.primary_goal,
          updated_at: new Date().toISOString()
        })
        .eq('contact', user.email)

      if (error) throw error

      // Recharger les données après la sauvegarde
      await reloadClientData()
      await refreshProfile() // Mettre à jour le contexte d'authentification

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      })
    } catch (error) {
      console.error('Error updating client profile:', error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil.",
        variant: "destructive",
      })
    } finally {
      setSavingProfile(false)
    }
  }

  // Changer le mot de passe
  const handleChangePassword = async () => {
    if (!user) return

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      })
      return
    }

    try {
      setChangingPassword(true)

      // Mettre à jour le mot de passe via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le mot de passe.",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-orange-500" />
              <span>Mes Paramètres</span>
            </CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et votre mot de passe
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-orange-500" />
                <span>Informations personnelles</span>
              </CardTitle>
              <CardDescription>
                Modifiez vos informations de base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={clientData.first_name}
                    onChange={(e) => handleClientChange('first_name', e.target.value)}
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={clientData.last_name}
                    onChange={(e) => handleClientChange('last_name', e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={clientData.contact}
                    disabled
                    className="bg-gray-50 pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={clientData.phone}
                    onChange={(e) => handleClientChange('phone', e.target.value)}
                    placeholder="Votre numéro de téléphone"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    type="number"
                    value={clientData.age || ''}
                    onChange={(e) => handleClientChange('age', parseInt(e.target.value) || undefined)}
                    placeholder="Âge"
                    min="1"
                    max="120"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={clientData.weight || ''}
                    onChange={(e) => handleClientChange('weight', parseFloat(e.target.value) || undefined)}
                    placeholder="Poids"
                    min="1"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Taille (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={clientData.height || ''}
                    onChange={(e) => handleClientChange('height', parseInt(e.target.value) || undefined)}
                    placeholder="Taille"
                    min="1"
                    max="250"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="goal">Objectif principal</Label>
                <Input
                  id="goal"
                  value={clientData.primary_goal}
                  onChange={(e) => handleClientChange('primary_goal', e.target.value)}
                  placeholder="Votre objectif principal"
                />
              </div>

              <Button 
                onClick={handleSaveProfile}
                disabled={savingProfile}
                variant="default" className="w-full"
              >
                {savingProfile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Changement de mot de passe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-orange-500" />
                <span>Sécurité</span>
              </CardTitle>
              <CardDescription>
                Modifiez votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Votre mot de passe actuel"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Votre nouveau mot de passe"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                variant="default" className="w-full"
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Modifier le mot de passe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default ClientSettingsPage
