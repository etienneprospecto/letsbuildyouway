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
  EyeOff
} from 'lucide-react'
import { useAuth } from '@/providers/OptimizedAuthProvider'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface ProfileData {
  first_name: string
  last_name: string
  email: string
  phone?: string
  bio?: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const SettingsPage: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth()
  const { toast } = useToast()
  
  // États pour les informations de profil
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: ''
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

  // Charger les données du profil au montage
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
        bio: profile.bio || ''
      })
      setLoading(false)
    }
  }, [profile, user])

  // Fonction pour recharger les données du profil
  const reloadProfileData = async () => {
    if (!profile?.id) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single()

      if (error) throw error

      if (data) {
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: user?.email || '',
          phone: data.phone || '',
          bio: data.bio || ''
        })
      }
    } catch (error) {
      console.error('Error reloading profile data:', error)
    }
  }

  // Gestionnaire pour les informations de profil
  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
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

  // Sauvegarder les informations de profil
  const handleSaveProfile = async () => {
    if (!profile?.id) return

    try {
      setSavingProfile(true)

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          bio: profileData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      // Recharger les données après la sauvegarde
      await reloadProfileData()
      await refreshProfile() // Mettre à jour le contexte d'authentification

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
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
          <p className="text-muted-foreground">Chargement des paramètres...</p>
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
              <span>Paramètres</span>
            </CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et votre mot de passe
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de profil */}
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
                    value={profileData.first_name}
                    onChange={(e) => handleProfileChange('first_name', e.target.value)}
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileData.last_name}
                    onChange={(e) => handleProfileChange('last_name', e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Input
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <Button 
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full bg-orange-500 hover:bg-orange-600"
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
                className="w-full bg-orange-500 hover:bg-orange-600"
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

export default SettingsPage
