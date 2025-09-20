import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { BillingService } from '../../services/billingService'

interface PricingPlanModalProps {
  plan?: any
  onClose: () => void
  onSave: (planData: any) => void
}

export const PricingPlanModal: React.FC<PricingPlanModalProps> = ({
  plan,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_amount: 0,
    currency: 'EUR',
    billing_interval: 'monthly',
    session_count: null as number | null,
    features: [] as string[],
    is_active: true
  })
  const [featureInput, setFeatureInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price_amount: plan.price_amount || 0,
        currency: plan.currency || 'EUR',
        billing_interval: plan.billing_interval || 'monthly',
        session_count: plan.session_count,
        features: plan.features || [],
        is_active: plan.is_active !== false
      })
    }
  }, [plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const planData = {
        ...formData,
        features: formData.features.length > 0 ? formData.features : null
      }
      await onSave(planData)
    } catch (error) {
      console.error('Error saving pricing plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }))
      setFeatureInput('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const currencies = [
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'Dollar US ($)' },
    { value: 'GBP', label: 'Livre Sterling (£)' },
    { value: 'CHF', label: 'Franc Suisse (CHF)' }
  ]

  const billingIntervals = [
    { value: 'one_time', label: 'Ponctuel' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'quarterly', label: 'Trimestriel' },
    { value: 'yearly', label: 'Annuel' }
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Modifier le plan tarifaire' : 'Nouveau plan tarifaire'}
          </DialogTitle>
          <DialogDescription>
            {plan ? 
              'Modifiez les détails de votre plan tarifaire' : 
              'Créez un nouveau plan tarifaire pour vos clients'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du plan *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Forfait Premium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez ce que comprend ce plan..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_amount">Prix *</Label>
              <Input
                id="price_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.price_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, price_amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_interval">Type de facturation *</Label>
              <Select
                value={formData.billing_interval}
                onValueChange={(value) => setFormData(prev => ({ ...prev, billing_interval: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billingIntervals.map(interval => (
                    <SelectItem key={interval.value} value={interval.value}>
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session_count">Nombre de séances (optionnel)</Label>
            <Input
              id="session_count"
              type="number"
              min="1"
              value={formData.session_count || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                session_count: e.target.value ? parseInt(e.target.value) : null 
              }))}
              placeholder="Laissez vide pour illimité"
            />
            <p className="text-sm text-gray-500">
              Laissez vide pour un abonnement illimité
            </p>
          </div>

          <div className="space-y-2">
            <Label>Fonctionnalités incluses</Label>
            <div className="flex gap-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="Ajouter une fonctionnalité..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFeature()
                  }
                }}
              />
              <Button type="button" onClick={addFeature} variant="outline">
                Ajouter
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                  >
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Plan actif</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : (plan ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}