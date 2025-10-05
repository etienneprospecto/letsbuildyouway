import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { BillingService } from '../../services/billingService'
import { StripeService } from '../../services/stripeService'
import { useAuth } from '@/providers/OptimizedAuthProvider'

interface StripeSettingsModalProps {
  onClose: () => void
  onSave: () => void
}

export const StripeSettingsModal: React.FC<StripeSettingsModalProps> = ({
  onClose,
  onSave
}) => {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    stripe_account_id: '',
    stripe_publishable_key: '',
    stripe_secret_key: '',
    payment_methods_enabled: {
      card: true,
      sepa: true,
      apple_pay: true,
      google_pay: true
    },
    auto_invoice_generation: true,
    reminder_schedule: {
      first_reminder_days: 3,
      second_reminder_days: 7,
      final_reminder_days: 15,
      overdue_suspension_days: 30
    },
    company_info: {
      name: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'FR',
      vat_number: '',
      phone: '',
      email: ''
    },
    is_configured: false
  })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<boolean | null>(null)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user?.id) {
      loadSettings()
    }
  }, [user?.id])

  const loadSettings = async () => {
    if (!user?.id) return

    try {
      const existingSettings = await BillingService.getPaymentSettings(user.id)
      if (existingSettings) {
        setSettings(prev => ({
          ...prev,
          ...existingSettings,
          payment_methods_enabled: existingSettings.payment_methods_enabled || prev.payment_methods_enabled,
          reminder_schedule: existingSettings.reminder_schedule || prev.reminder_schedule,
          company_info: existingSettings.company_info || prev.company_info
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      if (!user?.id) throw new Error('User not authenticated')

      const settingsData = {
        ...settings,
        coach_id: user.id
      }

      if (settings.is_configured) {
        await BillingService.updatePaymentSettings(user.id, settingsData)
      } else {
        await BillingService.createPaymentSettings(settingsData)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving settings:', error)
      setErrors({ general: 'Erreur lors de la sauvegarde des paramètres' })
    } finally {
      setLoading(false)
    }
  }

  const testStripeConnection = async () => {
    if (!settings.stripe_secret_key) {
      setErrors({ stripe_secret_key: 'Clé secrète requise pour tester la connexion' })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const stripeService = new StripeService(user?.id)
      const isConnected = await stripeService.testConnection()
      setTestResult(isConnected)
    } catch (error) {
      console.error('Error testing Stripe connection:', error)
      setTestResult(false)
    } finally {
      setTesting(false)
    }
  }

  const updatePaymentMethod = (method: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      payment_methods_enabled: {
        ...prev.payment_methods_enabled,
        [method]: enabled
      }
    }))
  }

  const updateReminderSchedule = (field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      reminder_schedule: {
        ...prev.reminder_schedule,
        [field]: value
      }
    }))
  }

  const updateCompanyInfo = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      company_info: {
        ...prev.company_info,
        [field]: value
      }
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuration Stripe</DialogTitle>
          <DialogDescription>
            Configurez votre compte Stripe pour accepter les paiements en ligne
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stripe API Keys */}
          <Card>
            <CardHeader>
              <CardTitle>Clés API Stripe</CardTitle>
              <CardDescription>
                Récupérez vos clés API dans votre tableau de bord Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe_account_id">ID du compte Stripe</Label>
                  <Input
                    id="stripe_account_id"
                    value={settings.stripe_account_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, stripe_account_id: e.target.value }))}
                    placeholder="acct_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe_publishable_key">Clé publique</Label>
                  <Input
                    id="stripe_publishable_key"
                    value={settings.stripe_publishable_key}
                    onChange={(e) => setSettings(prev => ({ ...prev, stripe_publishable_key: e.target.value }))}
                    placeholder="pk_test_... ou pk_live_..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripe_secret_key">Clé secrète</Label>
                <div className="relative">
                  <Input
                    id="stripe_secret_key"
                    type={showSecretKey ? 'text' : 'password'}
                    value={settings.stripe_secret_key}
                    onChange={(e) => setSettings(prev => ({ ...prev, stripe_secret_key: e.target.value }))}
                    placeholder="sk_test_... ou sk_live_..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.stripe_secret_key && (
                  <p className="text-sm text-red-500">{errors.stripe_secret_key}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testStripeConnection}
                  disabled={testing || !settings.stripe_secret_key}
                >
                  {testing ? 'Test en cours...' : 'Tester la connexion'}
                </Button>
                {testResult !== null && (
                  <div className="flex items-center gap-2">
                    {testResult ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Connexion réussie</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">Connexion échouée</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Moyens de paiement</CardTitle>
              <CardDescription>
                Sélectionnez les moyens de paiement acceptés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(settings.payment_methods_enabled).map(([method, enabled]) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Switch
                      id={method}
                      checked={enabled}
                      onCheckedChange={(checked) => updatePaymentMethod(method, checked)}
                    />
                    <Label htmlFor={method} className="capitalize">
                      {method.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reminder Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Planning des relances</CardTitle>
              <CardDescription>
                Configurez les délais pour les relances automatiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_reminder_days">1ère relance (jours)</Label>
                  <Input
                    id="first_reminder_days"
                    type="number"
                    min="1"
                    value={settings.reminder_schedule.first_reminder_days}
                    onChange={(e) => updateReminderSchedule('first_reminder_days', parseInt(e.target.value) || 3)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="second_reminder_days">2ème relance (jours)</Label>
                  <Input
                    id="second_reminder_days"
                    type="number"
                    min="1"
                    value={settings.reminder_schedule.second_reminder_days}
                    onChange={(e) => updateReminderSchedule('second_reminder_days', parseInt(e.target.value) || 7)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="final_reminder_days">Mise en demeure (jours)</Label>
                  <Input
                    id="final_reminder_days"
                    type="number"
                    min="1"
                    value={settings.reminder_schedule.final_reminder_days}
                    onChange={(e) => updateReminderSchedule('final_reminder_days', parseInt(e.target.value) || 15)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overdue_suspension_days">Suspension (jours)</Label>
                  <Input
                    id="overdue_suspension_days"
                    type="number"
                    min="1"
                    value={settings.reminder_schedule.overdue_suspension_days}
                    onChange={(e) => updateReminderSchedule('overdue_suspension_days', parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos factures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                  <Input
                    id="company_name"
                    value={settings.company_info.name}
                    onChange={(e) => updateCompanyInfo('name', e.target.value)}
                    placeholder="Votre nom ou nom de l'entreprise"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat_number">Numéro de TVA</Label>
                  <Input
                    id="vat_number"
                    value={settings.company_info.vat_number}
                    onChange={(e) => updateCompanyInfo('vat_number', e.target.value)}
                    placeholder="FR12345678901"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={settings.company_info.address}
                  onChange={(e) => updateCompanyInfo('address', e.target.value)}
                  placeholder="Adresse complète"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={settings.company_info.city}
                    onChange={(e) => updateCompanyInfo('city', e.target.value)}
                    placeholder="Ville"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    value={settings.company_info.postal_code}
                    onChange={(e) => updateCompanyInfo('postal_code', e.target.value)}
                    placeholder="75001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={settings.company_info.country}
                    onChange={(e) => updateCompanyInfo('country', e.target.value)}
                    placeholder="FR"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={settings.company_info.phone}
                    onChange={(e) => updateCompanyInfo('phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.company_info.email}
                    onChange={(e) => updateCompanyInfo('email', e.target.value)}
                    placeholder="contact@votre-entreprise.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Invoice Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Génération automatique</CardTitle>
              <CardDescription>
                Configurez la génération automatique des factures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_invoice_generation"
                  checked={settings.auto_invoice_generation}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_invoice_generation: checked }))}
                />
                <Label htmlFor="auto_invoice_generation">
                  Génération automatique des factures
                </Label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Les factures seront générées automatiquement selon les cycles d'abonnement
              </p>
            </CardContent>
          </Card>

          {errors.general && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !settings.stripe_publishable_key || !settings.stripe_secret_key}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}