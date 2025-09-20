import { supabase } from '../lib/supabase'
import { BillingService } from './billingService'

export interface SimulatedPaymentData {
  invoice_id: string
  amount: number
  payment_method: 'card' | 'bank_transfer' | 'sepa' | 'apple_pay' | 'google_pay' | 'cash'
  currency: string
}

export class SimulatedPaymentService {
  /**
   * Simule un paiement pour une facture
   */
  static async processPayment(paymentData: SimulatedPaymentData): Promise<{
    success: boolean
    payment_id?: string
    error?: string
  }> {
    try {
      // Vérifier que la facture existe et n'est pas déjà payée
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', paymentData.invoice_id)
        .single()

      if (invoiceError || !invoice) {
        return { success: false, error: 'Facture non trouvée' }
      }

      if (invoice.amount_paid >= invoice.amount_total) {
        return { success: false, error: 'Cette facture est déjà payée' }
      }

      // Calculer le montant restant
      const remainingAmount = invoice.amount_total - invoice.amount_paid
      const paymentAmount = Math.min(paymentData.amount, remainingAmount)

      // Créer le paiement via la fonction SQL
      const { data: paymentId, error: paymentError } = await supabase
        .rpc('simulate_payment', {
          p_invoice_id: paymentData.invoice_id,
          p_payment_method: paymentData.payment_method,
          p_amount: paymentAmount
        })

      if (paymentError) {
        console.error('Erreur création paiement:', paymentError)
        return { success: false, error: 'Erreur lors de la création du paiement' }
      }

      return { 
        success: true, 
        payment_id: paymentId 
      }
    } catch (error) {
      console.error('Erreur simulation paiement:', error)
      return { 
        success: false, 
        error: 'Erreur interne du serveur' 
      }
    }
  }

  /**
   * Simule un paiement partiel
   */
  static async processPartialPayment(
    invoiceId: string, 
    amount: number, 
    paymentMethod: SimulatedPaymentData['payment_method'] = 'card'
  ): Promise<{ success: boolean; payment_id?: string; error?: string }> {
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (invoiceError || !invoice) {
        return { success: false, error: 'Facture non trouvée' }
      }

      const remainingAmount = invoice.amount_total - invoice.amount_paid
      if (amount > remainingAmount) {
        return { 
          success: false, 
          error: `Le montant ne peut pas dépasser ${remainingAmount.toFixed(2)} ${invoice.currency}` 
        }
      }

      return await this.processPayment({
        invoice_id: invoiceId,
        amount,
        payment_method: paymentMethod,
        currency: invoice.currency
      })
    } catch (error) {
      console.error('Erreur paiement partiel:', error)
      return { 
        success: false, 
        error: 'Erreur lors du paiement partiel' 
      }
    }
  }

  /**
   * Simule un paiement complet
   */
  static async processFullPayment(
    invoiceId: string, 
    paymentMethod: SimulatedPaymentData['payment_method'] = 'card'
  ): Promise<{ success: boolean; payment_id?: string; error?: string }> {
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (invoiceError || !invoice) {
        return { success: false, error: 'Facture non trouvée' }
      }

      const remainingAmount = invoice.amount_total - invoice.amount_paid

      return await this.processPayment({
        invoice_id: invoiceId,
        amount: remainingAmount,
        payment_method: paymentMethod,
        currency: invoice.currency
      })
    } catch (error) {
      console.error('Erreur paiement complet:', error)
      return { 
        success: false, 
        error: 'Erreur lors du paiement complet' 
      }
    }
  }

  /**
   * Obtient l'historique des paiements d'une facture
   */
  static async getInvoicePayments(invoiceId: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('processed_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur récupération paiements:', error)
      return []
    }
  }

  /**
   * Simule différents types de paiement avec des délais réalistes
   */
  static async processPaymentWithDelay(
    paymentData: SimulatedPaymentData,
    delayMs: number = 2000
  ): Promise<{ success: boolean; payment_id?: string; error?: string }> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.processPayment(paymentData)
        resolve(result)
      }, delayMs)
    })
  }

  /**
   * Simule un échec de paiement (pour les tests)
   */
  static async simulatePaymentFailure(
    invoiceId: string,
    reason: string = 'Carte refusée'
  ): Promise<{ success: boolean; error: string }> {
    try {
      // Créer un paiement échoué
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single()

      if (invoiceError || !invoice) {
        return { success: false, error: 'Facture non trouvée' }
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          amount: invoice.amount_total - invoice.amount_paid,
          currency: invoice.currency,
          payment_method: 'card',
          status: 'failed',
          failure_reason: reason,
          processed_at: new Date().toISOString()
        })

      if (paymentError) {
        return { success: false, error: 'Erreur lors de la création du paiement échoué' }
      }

      return { success: true, error: reason }
    } catch (error) {
      console.error('Erreur simulation échec paiement:', error)
      return { 
        success: false, 
        error: 'Erreur lors de la simulation d\'échec' 
      }
    }
  }
}
