import React, { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Alert, AlertDescription } from './alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { StripeService } from '../../services/stripeService'

interface StripePaymentFormProps {
  invoice: any
  onSuccess: () => void
  onCancel: () => void
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  invoice,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<any>(null)

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Veuillez sélectionner un moyen de paiement')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Here you would integrate with your actual Stripe payment processing
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      setError('Erreur lors du traitement du paiement. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Paiement réussi !
        </h3>
        <p className="text-gray-600">
          Votre paiement a été traité avec succès.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Détails de la facture</CardTitle>
          <CardDescription>
            Facture {invoice.invoice_number}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Montant total:</span>
              <span className="font-semibold">
                {formatCurrency(invoice.amount_total, invoice.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Échéance:</span>
              <span>
                {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Moyen de paiement</CardTitle>
          <CardDescription>
            Sélectionnez votre moyen de paiement préféré
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">Carte bancaire</div>
                <div className="text-sm text-gray-500">Visa, Mastercard, etc.</div>
              </button>
              
              <button
                onClick={() => setPaymentMethod('sepa')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'sepa' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">Prélèvement SEPA</div>
                <div className="text-sm text-gray-500">Virement bancaire</div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'apple_pay' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">Apple Pay</div>
                <div className="text-sm text-gray-500">Paiement mobile</div>
              </button>
              
              <button
                onClick={() => setPaymentMethod('google_pay')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'google_pay' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">Google Pay</div>
                <div className="text-sm text-gray-500">Paiement mobile</div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          onClick={handlePayment}
          disabled={loading || !paymentMethod}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            `Payer ${formatCurrency(invoice.amount_total, invoice.currency)}`
          )}
        </Button>
      </div>
    </div>
  )
}