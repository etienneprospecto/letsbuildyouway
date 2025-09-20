import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  DollarSign, 
  CreditCard, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Settings,
  Download
} from 'lucide-react'
import { BillingService } from '../../services/billingService'
import { useAuth } from '../../providers/AuthProvider'
import { PricingPlanModal } from './PricingPlanModal'
import { InvoiceModal } from './InvoiceModal'
import { StripeSettingsModal } from './StripeSettingsModal'
import { FinancialDashboard } from './FinancialDashboard'
import { BillingTest } from './BillingTest'
import { PDFService } from '../../services/pdfService'
import { SimulatedPaymentService } from '../../services/simulatedPaymentService'
import { ReminderManagement } from './ReminderManagement'

export const CoachBillingPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [pricingPlans, setPricingPlans] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([])
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [financialStats, setFinancialStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showStripeModal, setShowStripeModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [editingInvoice, setEditingInvoice] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      loadBillingData()
    }
  }, [user?.id])

  const loadBillingData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const [
        plans,
        subs,
        invs,
        overdue,
        payments,
        stats
      ] = await Promise.all([
        BillingService.getPricingPlans(user.id),
        BillingService.getSubscriptions(user.id),
        BillingService.getInvoices(user.id),
        BillingService.getOverdueInvoices(user.id),
        BillingService.getRecentPayments(user.id, 5),
        BillingService.getCoachFinancialStats(user.id)
      ])

      setPricingPlans(plans)
      setSubscriptions(subs)
      setInvoices(invs)
      setOverdueInvoices(overdue)
      setRecentPayments(payments)
      setFinancialStats(stats)
    } catch (error) {
      console.error('Error loading billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (planData: any) => {
    try {
      const newPlan = await BillingService.createPricingPlan({
        ...planData,
        coach_id: user!.id
      })
      setPricingPlans(prev => [newPlan, ...prev])
      setShowPricingModal(false)
    } catch (error) {
      console.error('Error creating pricing plan:', error)
    }
  }

  const handleUpdatePlan = async (id: string, updates: any) => {
    try {
      const updatedPlan = await BillingService.updatePricingPlan(id, updates)
      setPricingPlans(prev => prev.map(p => p.id === id ? updatedPlan : p))
      setShowPricingModal(false)
    } catch (error) {
      console.error('Error updating pricing plan:', error)
    }
  }

  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      console.log('Creating invoice with data:', invoiceData)
      
      const invoiceNumber = await BillingService.generateInvoiceNumber(user!.id)
      console.log('Generated invoice number:', invoiceNumber)
      
      const newInvoice = await BillingService.createInvoice({
        ...invoiceData,
        coach_id: user!.id,
        invoice_number: invoiceNumber
      })
      console.log('Invoice created successfully:', newInvoice)
      
      setInvoices(prev => [newInvoice, ...prev])
      setShowInvoiceModal(false)
    } catch (error) {
      console.error('Error creating invoice:', error)
      // Re-throw the error so the modal can handle it
      throw error
    }
  }

  const handleDownloadPDF = async (invoice: any) => {
    try {
      // Récupérer les informations complètes de la facture
      const invoiceData = {
        ...invoice,
        client: {
          first_name: invoice.client_first_name || 'Client',
          last_name: invoice.client_last_name || 'Inconnu',
          email: invoice.client_email || 'email@example.com'
        },
        coach: {
          name: user?.user_metadata?.full_name || 'Coach BYW',
          email: user?.email || 'coach@byw.com',
          address: '123 Rue du Sport, 75001 Paris',
          phone: '+33 1 23 45 67 89',
          vat_number: 'FR12345678901'
        }
      }
      
      PDFService.downloadInvoicePDF(invoiceData)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erreur lors de la génération du PDF')
    }
  }

  const handleViewPDF = async (invoice: any) => {
    try {
      const invoiceData = {
        ...invoice,
        client: {
          first_name: invoice.client_first_name || 'Client',
          last_name: invoice.client_last_name || 'Inconnu',
          email: invoice.client_email || 'email@example.com'
        },
        coach: {
          name: user?.user_metadata?.full_name || 'Coach BYW',
          email: user?.email || 'coach@byw.com',
          address: '123 Rue du Sport, 75001 Paris',
          phone: '+33 1 23 45 67 89',
          vat_number: 'FR12345678901'
        }
      }
      
      PDFService.openInvoicePDF(invoiceData)
    } catch (error) {
      console.error('Error opening PDF:', error)
      alert('Erreur lors de l\'ouverture du PDF')
    }
  }

  const handleSimulatePayment = async (invoice: any) => {
    try {
      const result = await SimulatedPaymentService.processFullPayment(invoice.id, 'card')
      if (result.success) {
        alert('Paiement simulé avec succès !')
        loadBillingData() // Recharger les données
      } else {
        alert('Erreur lors du paiement simulé: ' + result.error)
      }
    } catch (error) {
      console.error('Error simulating payment:', error)
      alert('Erreur lors du paiement simulé')
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Facturation</h1>
          <p className="text-gray-600">Gérez vos revenus et la facturation de vos clients</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowStripeModal(true)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configuration Stripe
          </Button>
          <Button onClick={() => setShowInvoiceModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialStats?.monthly_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{financialStats?.revenue_growth || 0}% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures impayées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueInvoices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(overdueInvoices.reduce((sum, inv) => sum + inv.amount_total, 0))} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptions.length} abonnements au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de paiement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialStats?.payment_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Paiements à temps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="plans">Plans tarifaires</TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="reminders">Relances</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="test">Test Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Paiements récents</CardTitle>
                <CardDescription>Derniers paiements reçus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {payment.invoices?.profiles?.first_name} {payment.invoices?.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.invoices?.invoice_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.processed_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Overdue Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Factures en retard</CardTitle>
                <CardDescription>Factures nécessitant une relance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overdueInvoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {invoice.profiles?.first_name} {invoice.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {invoice.invoice_number}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">
                          {formatCurrency(invoice.amount_total, invoice.currency)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))} jours de retard
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Plans tarifaires</h2>
            <Button onClick={() => setShowPricingModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    {plan.name}
                    <Badge className={getStatusColor(plan.is_active ? 'active' : 'cancelled')}>
                      {plan.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Prix :</span>
                      <span className="font-bold">
                        {formatCurrency(plan.price_amount, plan.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Facturation :</span>
                      <span className="capitalize">{plan.billing_interval}</span>
                    </div>
                    {plan.session_count && (
                      <div className="flex justify-between">
                        <span>Séances :</span>
                        <span>{plan.session_count}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingPlan(plan)
                        setShowPricingModal(true)
                      }}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => BillingService.deletePricingPlan(plan.id).then(loadBillingData)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Abonnements clients</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Client</th>
                      <th className="text-left p-4">Plan</th>
                      <th className="text-left p-4">Statut</th>
                      <th className="text-left p-4">Prochaine facturation</th>
                      <th className="text-left p-4">Séances restantes</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b">
                        <td className="p-4">
                          {subscription.profiles?.first_name} {subscription.profiles?.last_name}
                        </td>
                        <td className="p-4">{subscription.pricing_plans?.name}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {subscription.next_billing_date ? 
                            new Date(subscription.next_billing_date).toLocaleDateString('fr-FR') : 
                            'N/A'
                          }
                        </td>
                        <td className="p-4">
                          {subscription.sessions_remaining || 'Illimité'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {subscription.status === 'active' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => BillingService.pauseSubscription(subscription.id).then(loadBillingData)}
                              >
                                Pause
                              </Button>
                            )}
                            {subscription.status === 'paused' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => BillingService.resumeSubscription(subscription.id).then(loadBillingData)}
                              >
                                Reprendre
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => BillingService.cancelSubscription(subscription.id).then(loadBillingData)}
                            >
                              Annuler
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Factures</h2>
            <Button onClick={() => setShowInvoiceModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">N° Facture</th>
                      <th className="text-left p-4">Client</th>
                      <th className="text-left p-4">Montant</th>
                      <th className="text-left p-4">Statut</th>
                      <th className="text-left p-4">Échéance</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="p-4 font-mono">{invoice.invoice_number}</td>
                        <td className="p-4">
                          {invoice.profiles?.first_name} {invoice.profiles?.last_name}
                        </td>
                        <td className="p-4">
                          {formatCurrency(invoice.amount_total, invoice.currency)}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadPDF(invoice)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewPDF(invoice)}
                            >
                              Voir
                            </Button>
                            {invoice.status !== 'paid' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSimulatePayment(invoice)}
                                className="text-green-600 hover:text-green-700"
                              >
                                💳 Payer
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <ReminderManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FinancialDashboard coachId={user?.id} />
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <BillingTest />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showPricingModal && (
        <PricingPlanModal
          plan={editingPlan}
          onClose={() => {
            setShowPricingModal(false)
            setEditingPlan(null)
          }}
          onSave={editingPlan ? 
            (updates) => handleUpdatePlan(editingPlan.id, updates) :
            handleCreatePlan
          }
        />
      )}

      {showInvoiceModal && (
        <InvoiceModal
          invoice={editingInvoice}
          onClose={() => {
            setShowInvoiceModal(false)
            setEditingInvoice(null)
          }}
          onSave={handleCreateInvoice}
        />
      )}

      {showStripeModal && (
        <StripeSettingsModal
          onClose={() => setShowStripeModal(false)}
          onSave={loadBillingData}
        />
      )}
    </div>
  )
}