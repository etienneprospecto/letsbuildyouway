import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { Badge } from './badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Separator } from './separator'
import { 
  Download, 
  CreditCard, 
  Calendar, 
  Euro,
  FileText,
  User
} from 'lucide-react'

interface InvoiceDetailsModalProps {
  invoice: any
  onClose: () => void
  onPay: () => void
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  onClose,
  onPay
}) => {
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

  const items = invoice.items || []

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Facture {invoice.invoice_number}
          </DialogTitle>
          <DialogDescription>
            Détails de votre facture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations de facturation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {invoice.profiles?.first_name} {invoice.profiles?.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Date: {new Date(invoice.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-gray-500" />
                  <span>Devise: {invoice.currency}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statut et montant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Statut:</span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {getStatusText(invoice.status)}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Montant total:</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(invoice.amount_total, invoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant payé:</span>
                    <span className="font-semibold">
                      {formatCurrency(invoice.amount_paid, invoice.currency)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Reste à payer:</span>
                    <span className={invoice.amount_total - invoice.amount_paid > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(invoice.amount_total - invoice.amount_paid, invoice.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Articles de la facture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Quantité</th>
                      <th className="text-right p-2">Prix unitaire</th>
                      <th className="text-right p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">
                          {formatCurrency(item.unit_price, invoice.currency)}
                        </td>
                        <td className="p-2 text-right font-semibold">
                          {formatCurrency(item.total, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique des paiements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.payments.map((payment: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(payment.processed_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <Badge className={payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(invoice.pdf_url || '#', '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              {invoice.status !== 'paid' && (
                <Button onClick={onPay}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payer maintenant
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}