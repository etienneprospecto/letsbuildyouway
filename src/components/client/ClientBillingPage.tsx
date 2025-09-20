import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  CreditCard, 
  FileText, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  Euro
} from 'lucide-react'
import { BillingService } from '../../services/billingService'
import { useAuth } from '../../providers/AuthProvider'
import { StripePaymentForm } from '../ui/StripePaymentForm'
import { InvoiceDetailsModal } from '../ui/InvoiceDetailsModal'
import { SimulatedPaymentForm } from '../ui/SimulatedPaymentForm'
import { PDFService } from '../../services/pdfService'

export const ClientBillingPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('invoices')
  const [invoices, setInvoices] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadBillingData()
    }
  }, [user?.id])

  const loadBillingData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const [invoicesData, subscriptionsData] = await Promise.all([
        BillingService.getClientInvoices(user.id),
        BillingService.getClientSubscriptions(user.id)
      ])

      setInvoices(invoicesData)
      setSubscriptions(subscriptionsData)
    } catch (error) {
      console.error('Error loading billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowPaymentForm(true)
  }

  const handleDownloadPDF = async (invoice: any) => {
    try {
      const invoiceData = {
        ...invoice,
        client: {
          first_name: user?.user_metadata?.first_name || 'Client',
          last_name: user?.user_metadata?.last_name || 'Inconnu',
          email: user?.email || 'email@example.com'
        },
        coach: {
          name: 'Coach BYW',
          email: 'coach@byw.com',
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

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowInvoiceDetails(true)
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    loadBillingData() // Reload to update invoice status
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'overdue': return <AlertCircle className="w-4 h-4" />
      case 'sent': return <Clock className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée'
      case 'overdue': return 'En retard'
      case 'sent': return 'Envoyée'
      case 'draft': return 'Brouillon'
      default: return status
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  const upcomingInvoices = invoices.filter(invoice => 
    invoice.status === 'sent' && !isOverdue(invoice.due_date)
  )

  const overdueInvoices = invoices.filter(invoice => 
    invoice.status === 'overdue' || isOverdue(invoice.due_date)
  )

  const paidInvoices = invoices.filter(invoice => 
    invoice.status === 'paid'
  )

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
      <div>
        <h1 className="text-3xl font-bold">Mes factures</h1>
        <p className="text-gray-600">Gérez vos factures et abonnements</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {upcomingInvoices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(upcomingInvoices.reduce((sum, inv) => sum + inv.amount_total, 0))} à payer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures en retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueInvoices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(overdueInvoices.reduce((sum, inv) => sum + inv.amount_total, 0))} en retard
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidInvoices.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(paidInvoices.reduce((sum, inv) => sum + inv.amount_total, 0))} payées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Mes factures</TabsTrigger>
          <TabsTrigger value="subscriptions">Mes abonnements</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {/* Overdue Invoices Alert */}
          {overdueInvoices.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-semibold">Factures en retard</h3>
                </div>
                <p className="text-red-700 mt-2">
                  Vous avez {overdueInvoices.length} facture(s) en retard. 
                  Veuillez les régler dans les plus brefs délais.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des factures</CardTitle>
              <CardDescription>
                Toutes vos factures et leur statut de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">N° Facture</th>
                      <th className="text-left p-4">Date</th>
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
                          {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-4 font-semibold">
                          {formatCurrency(invoice.amount_total, invoice.currency)}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(invoice.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(invoice.status)}
                              {getStatusText(invoice.status)}
                            </div>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className={`${isOverdue(invoice.due_date) ? 'text-red-600' : ''}`}>
                            {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(invoice)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                            {invoice.status !== 'paid' && (
                              <Button
                                size="sm"
                                onClick={() => handlePayInvoice(invoice)}
                                className={isOverdue(invoice.due_date) ? 'bg-red-600 hover:bg-red-700' : ''}
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                                Payer
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

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes abonnements</CardTitle>
              <CardDescription>
                Gérez vos abonnements et forfaits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <Card key={subscription.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {subscription.pricing_plans?.name}
                          </h3>
                          <p className="text-gray-600">
                            {subscription.pricing_plans?.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>
                              Prix: {formatCurrency(subscription.pricing_plans?.price_amount, subscription.pricing_plans?.currency)}
                            </span>
                            <span>
                              Facturation: {subscription.pricing_plans?.billing_interval}
                            </span>
                            {subscription.sessions_remaining && (
                              <span>
                                Séances restantes: {subscription.sessions_remaining}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status}
                          </Badge>
                          {subscription.next_billing_date && (
                            <p className="text-sm text-gray-500 mt-1">
                              Prochaine facturation: {new Date(subscription.next_billing_date).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {subscription.status === 'active' && (
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            Pause
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Annuler
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <SimulatedPaymentForm
            invoice={selectedInvoice}
            onPaymentSuccess={handlePaymentSuccess}
            onClose={() => setShowPaymentForm(false)}
          />
        </div>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceDetails(false)
            setSelectedInvoice(null)
          }}
          onPay={() => {
            setShowInvoiceDetails(false)
            handlePayInvoice(selectedInvoice)
          }}
        />
      )}
    </div>
  )
}