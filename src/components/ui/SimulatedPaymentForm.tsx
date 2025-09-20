import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Alert, AlertDescription } from './alert'
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'
import { SimulatedPaymentService } from '../../services/simulatedPaymentService'

interface SimulatedPaymentFormProps {
  invoice: {
    id: string
    invoice_number: string
    amount_total: number
    amount_paid: number
    currency: string
    status: string
  }
  onPaymentSuccess: () => void
  onClose: () => void
}

export const SimulatedPaymentForm: React.FC<SimulatedPaymentFormProps> = ({
  invoice,
  onPaymentSuccess,
  onClose
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'sepa' | 'apple_pay' | 'google_pay' | 'cash'>('card')
  const [amount, setAmount] = useState<number>(invoice.amount_total - invoice.amount_paid)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const remainingAmount = invoice.amount_total - invoice.amount_paid
  const isFullPayment = amount >= remainingAmount

  const handlePayment = async () => {
    setIsProcessing(true)
    setResult(null)

    try {
      const paymentResult = await SimulatedPaymentService.processPaymentWithDelay({
        invoice_id: invoice.id,
        amount,
        payment_method: paymentMethod,
        currency: invoice.currency
      }, 2000) // 2 secondes de délai pour simuler le traitement

      if (paymentResult.success) {
        setResult({
          success: true,
          message: `Paiement de ${amount.toFixed(2)} ${invoice.currency} effectué avec succès !`
        })
        
        // Attendre un peu avant de fermer
        setTimeout(() => {
          onPaymentSuccess()
          onClose()
        }, 2000)
      } else {
        setResult({
          success: false,
          message: paymentResult.error || 'Erreur lors du paiement'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur inattendue lors du paiement'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      card: 'Carte bancaire',
      bank_transfer: 'Virement bancaire',
      sepa: 'Prélèvement SEPA',
      apple_pay: 'Apple Pay',
      google_pay: 'Google Pay',
      cash: 'Espèces'
    }
    return labels[method as keyof typeof labels] || method
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement de la facture
        </CardTitle>
        <CardDescription>
          Facture {invoice.invoice_number}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Informations de la facture */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Montant total:</span>
            <span className="font-semibold">{formatCurrency(invoice.amount_total, invoice.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Déjà payé:</span>
            <span className="text-green-600">{formatCurrency(invoice.amount_paid, invoice.currency)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-sm font-medium">Reste à payer:</span>
            <span className="font-bold text-orange-600">{formatCurrency(remainingAmount, invoice.currency)}</span>
          </div>
        </div>

        {/* Montant à payer */}
        <div className="space-y-2">
          <Label htmlFor="amount">Montant à payer</Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remainingAmount}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setAmount(remainingAmount)}
              disabled={isProcessing}
            >
              Tout
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Montant maximum: {formatCurrency(remainingAmount, invoice.currency)}
          </p>
        </div>

        {/* Méthode de paiement */}
        <div className="space-y-2">
          <Label htmlFor="payment-method">Méthode de paiement</Label>
          <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">💳 Carte bancaire</SelectItem>
              <SelectItem value="bank_transfer">🏦 Virement bancaire</SelectItem>
              <SelectItem value="sepa">🇪🇺 Prélèvement SEPA</SelectItem>
              <SelectItem value="apple_pay">🍎 Apple Pay</SelectItem>
              <SelectItem value="google_pay">📱 Google Pay</SelectItem>
              <SelectItem value="cash">💵 Espèces</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Résultat du paiement */}
        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing || amount <= 0 || amount > remainingAmount}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Payer {formatCurrency(amount, invoice.currency)}
              </>
            )}
          </Button>
        </div>

        {/* Note de simulation */}
        <div className="text-xs text-gray-500 text-center">
          <p>💡 Mode simulation - Aucun vrai paiement ne sera effectué</p>
          <p>Les montants seront mis à jour dans le système</p>
        </div>
      </CardContent>
    </Card>
  )
}
