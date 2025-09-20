import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { BillingService } from '../../services/billingService'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../lib/supabase'

interface InvoiceModalProps {
  invoice?: any
  onClose: () => void
  onSave: (invoiceData: any) => void
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  onClose,
  onSave
}) => {
  const { user } = useAuth()
  const [clients, setClients] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [formData, setFormData] = useState({
    client_id: '',
    subscription_id: 'none',
    due_date: '',
    notes: '',
    currency: 'EUR'
  })
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, total: 0 }
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadClientsAndSubscriptions()
    }
  }, [user?.id])

  useEffect(() => {
    if (invoice) {
      setFormData({
        client_id: invoice.client_id || '',
        subscription_id: invoice.subscription_id || 'none',
        due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
        notes: invoice.notes || '',
        currency: invoice.currency || 'EUR'
      })
      if (invoice.items) {
        setItems(invoice.items)
      }
    } else {
      // Set default due date to 30 days from now
      const defaultDueDate = new Date()
      defaultDueDate.setDate(defaultDueDate.getDate() + 30)
      setFormData(prev => ({
        ...prev,
        due_date: defaultDueDate.toISOString().split('T')[0]
      }))
    }
  }, [invoice])

  const loadClientsAndSubscriptions = async () => {
    if (!user?.id) {
      console.log('No user ID found')
      return
    }

    try {
      console.log('Loading clients for coach:', user.id)
      console.log('User object:', user)
      
      // First, let's check if the user is a coach
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('Profile data:', profileData)
      console.log('Profile error:', profileError)

      if (profileError || profileData?.role !== 'coach') {
        console.log('User is not a coach or profile not found')
        setClients([])
        setSubscriptions([])
        return
      }

      const [clientsData, subscriptionsData] = await Promise.all([
        // Load clients from the clients table
        supabase
          .from('clients')
          .select(`
            id,
            first_name,
            last_name,
            contact
          `)
          .eq('coach_id', user.id),
        BillingService.getSubscriptions(user.id)
      ])

      console.log('Raw clients data:', clientsData)
      console.log('Clients data error:', clientsData.error)

      // Transform the data to get the client information
      const clients = clientsData.data?.map(client => ({
        id: client.id,
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.contact
      })) || []

      console.log('Loaded clients:', clients)
      console.log('Loaded subscriptions:', subscriptionsData)
      
      setClients(clients)
      setSubscriptions(subscriptionsData)
    } catch (error) {
      console.error('Error loading clients and subscriptions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Timeout de sécurité pour éviter le loading infini
    const timeoutId = setTimeout(() => {
      console.warn('Invoice creation timeout, forcing loading to false')
      setLoading(false)
    }, 10000) // 10 secondes

    try {
      const totalAmount = items.reduce((sum, item) => sum + item.total, 0)
      
      const invoiceData = {
        ...formData,
        subscription_id: formData.subscription_id === 'none' ? null : formData.subscription_id,
        amount_total: totalAmount,
        amount_paid: 0,
        status: 'draft',
        items: items,
        due_date: new Date(formData.due_date).toISOString()
      }

      console.log('Submitting invoice data:', invoiceData)
      await onSave(invoiceData)
      console.log('Invoice saved successfully')
    } catch (error) {
      console.error('Error saving invoice:', error)
      // Show error to user
      alert('Erreur lors de la création de la facture: ' + (error as Error).message)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      total: 0
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total = updatedItem.quantity * updatedItem.unit_price
        }
        return updatedItem
      }
      return item
    }))
  }

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </DialogTitle>
          <DialogDescription>
            {invoice ? 
              'Modifiez les détails de votre facture' : 
              'Créez une nouvelle facture pour votre client'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="client_id">Client *</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={loadClientsAndSubscriptions}
                  className="text-xs"
                >
                  🔄 Recharger
                </Button>
              </div>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  client_id: value,
                  subscription_id: 'none' // Reset subscription when client changes
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 ? (
                    <SelectItem value="no-clients" disabled>
                      Aucun client trouvé
                    </SelectItem>
                  ) : (
                    clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Aucun client trouvé. Assurez-vous d'avoir des clients dans votre base de données.</p>
                  <p>Coach ID: {user?.id}</p>
                  <p>Clients chargés: {clients.length}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription_id">Abonnement (optionnel)</Label>
              <Select
                value={formData.subscription_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subscription_id: value }))}
                disabled={!formData.client_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.client_id 
                      ? "Sélectionnez d'abord un client" 
                      : "Sélectionner un abonnement"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun abonnement</SelectItem>
                  {formData.client_id ? (
                    subscriptions
                      .filter(sub => sub.client_id === formData.client_id)
                      .map(subscription => (
                        <SelectItem key={subscription.id} value={subscription.id}>
                          {subscription.pricing_plans?.name} - {subscription.pricing_plans?.price_amount}€
                          {subscription.sessions_remaining !== null && (
                            ` (${subscription.sessions_remaining} séances restantes)`
                          )}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="no-client" disabled>
                      Sélectionnez d'abord un client
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formData.client_id && subscriptions.filter(sub => sub.client_id === formData.client_id).length === 0 && (
                <p className="text-sm text-gray-500">
                  Aucun abonnement trouvé pour ce client.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Date d'échéance *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
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
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">Dollar US ($)</SelectItem>
                  <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                  <SelectItem value="CHF">Franc Suisse (CHF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes additionnelles pour la facture..."
              rows={3}
            />
          </div>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Articles de la facture</CardTitle>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label htmlFor={`description-${item.id}`}>Description</Label>
                    <Input
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Description de l'article"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`quantity-${item.id}`}>Quantité</Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`unit_price-${item.id}`}>Prix unitaire</Label>
                    <Input
                      id={`unit_price-${item.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Total</Label>
                    <Input
                      value={item.total.toFixed(2)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      Total: {totalAmount.toFixed(2)} {formData.currency}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !formData.client_id || totalAmount === 0}>
              {loading ? 'Enregistrement...' : (invoice ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}