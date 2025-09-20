import Stripe from 'stripe'
import { supabase } from '../lib/supabase'
import { BillingService } from './billingService'

export class StripeService {
  private stripe: Stripe | null = null
  private coachId: string | null = null

  constructor(coachId?: string) {
    this.coachId = coachId || null
  }

  private async getStripeInstance(): Promise<Stripe> {
    if (this.stripe) return this.stripe

    if (!this.coachId) {
      throw new Error('Coach ID is required to initialize Stripe')
    }

    const settings = await BillingService.getPaymentSettings(this.coachId)
    if (!settings?.stripe_secret_key) {
      throw new Error('Stripe secret key not configured')
    }

    this.stripe = new Stripe(settings.stripe_secret_key, {
      apiVersion: '2024-06-20',
    })

    return this.stripe
  }

  // ===== CUSTOMERS =====
  
  async createCustomer(clientId: string, email: string, name: string): Promise<Stripe.Customer> {
    const stripe = await this.getStripeInstance()
    
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        client_id: clientId,
        coach_id: this.coachId!,
      },
    })

    return customer
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    const stripe = await this.getStripeInstance()
    return stripe.customers.retrieve(customerId) as Promise<Stripe.Customer>
  }

  async updateCustomer(customerId: string, updates: Stripe.CustomerUpdateParams): Promise<Stripe.Customer> {
    const stripe = await this.getStripeInstance()
    return stripe.customers.update(customerId, updates)
  }

  // ===== PRODUCTS & PRICES =====
  
  async createProduct(pricingPlan: any): Promise<Stripe.Product> {
    const stripe = await this.getStripeInstance()
    
    const product = await stripe.products.create({
      name: pricingPlan.name,
      description: pricingPlan.description,
      metadata: {
        pricing_plan_id: pricingPlan.id,
        coach_id: this.coachId!,
      },
    })

    return product
  }

  async createPrice(productId: string, pricingPlan: any): Promise<Stripe.Price> {
    const stripe = await this.getStripeInstance()
    
    const priceParams: Stripe.PriceCreateParams = {
      product: productId,
      unit_amount: Math.round(pricingPlan.price_amount * 100), // Convert to cents
      currency: pricingPlan.currency.toLowerCase(),
      metadata: {
        pricing_plan_id: pricingPlan.id,
        coach_id: this.coachId!,
      },
    }

    if (pricingPlan.billing_interval !== 'one_time') {
      priceParams.recurring = {
        interval: pricingPlan.billing_interval as Stripe.PriceCreateParams.Recurring.Interval,
      }
    }

    const price = await stripe.prices.create(priceParams)
    return price
  }

  async updatePrice(priceId: string, updates: Stripe.PriceUpdateParams): Promise<Stripe.Price> {
    const stripe = await this.getStripeInstance()
    return stripe.prices.update(priceId, updates)
  }

  // ===== SUBSCRIPTIONS =====
  
  async createSubscription(customerId: string, priceId: string, metadata?: Record<string, string>): Promise<Stripe.Subscription> {
    const stripe = await this.getStripeInstance()
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        coach_id: this.coachId!,
        ...metadata,
      },
      expand: ['latest_invoice.payment_intent'],
    })

    return subscription
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = await this.getStripeInstance()
    return stripe.subscriptions.retrieve(subscriptionId)
  }

  async updateSubscription(subscriptionId: string, updates: Stripe.SubscriptionUpdateParams): Promise<Stripe.Subscription> {
    const stripe = await this.getStripeInstance()
    return stripe.subscriptions.update(subscriptionId, updates)
  }

  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
    const stripe = await this.getStripeInstance()
    
    if (immediately) {
      return stripe.subscriptions.cancel(subscriptionId)
    } else {
      return stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    }
  }

  async pauseSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = await this.getStripeInstance()
    return stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: 'void',
      },
    })
  }

  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = await this.getStripeInstance()
    return stripe.subscriptions.update(subscriptionId, {
      pause_collection: null,
    })
  }

  // ===== PAYMENT INTENTS =====
  
  async createPaymentIntent(amount: number, currency: string, customerId: string, metadata?: Record<string, string>): Promise<Stripe.PaymentIntent> {
    const stripe = await this.getStripeInstance()
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        coach_id: this.coachId!,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return paymentIntent
  }

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    const stripe = await this.getStripeInstance()
    return stripe.paymentIntents.retrieve(paymentIntentId)
  }

  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.PaymentIntent> {
    const stripe = await this.getStripeInstance()
    return stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    })
  }

  // ===== INVOICES =====
  
  async createInvoice(customerId: string, subscriptionId?: string): Promise<Stripe.Invoice> {
    const stripe = await this.getStripeInstance()
    
    const invoice = await stripe.invoices.create({
      customer: customerId,
      subscription: subscriptionId,
      metadata: {
        coach_id: this.coachId!,
      },
    })

    return invoice
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    const stripe = await this.getStripeInstance()
    return stripe.invoices.retrieve(invoiceId)
  }

  async finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    const stripe = await this.getStripeInstance()
    return stripe.invoices.finalizeInvoice(invoiceId)
  }

  async sendInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    const stripe = await this.getStripeInstance()
    return stripe.invoices.sendInvoice(invoiceId)
  }

  async payInvoice(invoiceId: string, paymentMethodId: string): Promise<Stripe.Invoice> {
    const stripe = await this.getStripeInstance()
    return stripe.invoices.pay(invoiceId, {
      payment_method: paymentMethodId,
    })
  }

  // ===== PAYMENT METHODS =====
  
  async createPaymentMethod(type: string, card: Stripe.PaymentMethodCreateParams.Card1): Promise<Stripe.PaymentMethod> {
    const stripe = await this.getStripeInstance()
    
    const paymentMethod = await stripe.paymentMethods.create({
      type: type as Stripe.PaymentMethodCreateParams.Type,
      card,
    })

    return paymentMethod
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<Stripe.PaymentMethod> {
    const stripe = await this.getStripeInstance()
    return stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })
  }

  async getCustomerPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const stripe = await this.getStripeInstance()
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    return paymentMethods.data
  }

  // ===== WEBHOOKS =====
  
  async constructWebhookEvent(payload: string, signature: string, secret: string): Promise<Stripe.Event> {
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })
    return stripe.webhooks.constructEvent(payload, signature, secret)
  }

  // ===== REFUNDS =====
  
  async createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<Stripe.Refund> {
    const stripe = await this.getStripeInstance()
    
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      metadata: {
        coach_id: this.coachId!,
      },
    }

    if (amount) {
      refundParams.amount = Math.round(amount * 100) // Convert to cents
    }

    if (reason) {
      refundParams.reason = reason as Stripe.RefundCreateParams.Reason
    }

    return stripe.refunds.create(refundParams)
  }

  // ===== DISPUTES =====
  
  async getDisputes(): Promise<Stripe.Dispute[]> {
    const stripe = await this.getStripeInstance()
    
    const disputes = await stripe.disputes.list({
      limit: 100,
    })

    return disputes.data
  }

  // ===== BALANCE =====
  
  async getBalance(): Promise<Stripe.Balance> {
    const stripe = await this.getStripeInstance()
    return stripe.balance.retrieve()
  }

  async getBalanceTransactions(): Promise<Stripe.BalanceTransaction[]> {
    const stripe = await this.getStripeInstance()
    
    const transactions = await stripe.balanceTransactions.list({
      limit: 100,
    })

    return transactions.data
  }

  // ===== UTILITIES =====
  
  async testConnection(): Promise<boolean> {
    try {
      const stripe = await this.getStripeInstance()
      await stripe.balance.retrieve()
      return true
    } catch (error) {
      console.error('Stripe connection test failed:', error)
      return false
    }
  }

  async getAccountInfo(): Promise<Stripe.Account> {
    const stripe = await this.getStripeInstance()
    return stripe.accounts.retrieve()
  }
}