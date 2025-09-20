import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'

type PricingPlan = Database['public']['Tables']['pricing_plans']['Row']
type PricingPlanInsert = Database['public']['Tables']['pricing_plans']['Insert']
type PricingPlanUpdate = Database['public']['Tables']['pricing_plans']['Update']

type Subscription = Database['public']['Tables']['subscriptions']['Row']
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

type Invoice = Database['public']['Tables']['invoices']['Row']
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

type Payment = Database['public']['Tables']['payments']['Row']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']

type PaymentReminder = Database['public']['Tables']['payment_reminders']['Row']
type PaymentReminderInsert = Database['public']['Tables']['payment_reminders']['Insert']

type PaymentSettings = Database['public']['Tables']['payment_settings']['Row']
type PaymentSettingsInsert = Database['public']['Tables']['payment_settings']['Insert']
type PaymentSettingsUpdate = Database['public']['Tables']['payment_settings']['Update']

export class BillingService {
  // ===== PRICING PLANS =====
  
  static async getPricingPlans(coachId: string): Promise<PricingPlan[]> {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createPricingPlan(plan: PricingPlanInsert): Promise<PricingPlan> {
    const { data, error } = await supabase
      .from('pricing_plans')
      .insert(plan)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updatePricingPlan(id: string, updates: PricingPlanUpdate): Promise<PricingPlan> {
    const { data, error } = await supabase
      .from('pricing_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deletePricingPlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('pricing_plans')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  }

  // ===== SUBSCRIPTIONS =====
  
  static async getSubscriptions(coachId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        pricing_plans(*)
      `)
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getClientSubscriptions(clientId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        pricing_plans(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createSubscription(subscription: SubscriptionInsert): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select(`
        *,
        pricing_plans(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async updateSubscription(id: string, updates: SubscriptionUpdate): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        pricing_plans(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async pauseSubscription(id: string): Promise<Subscription> {
    return this.updateSubscription(id, { 
      status: 'paused',
      updated_at: new Date().toISOString()
    })
  }

  static async resumeSubscription(id: string): Promise<Subscription> {
    return this.updateSubscription(id, { 
      status: 'active',
      updated_at: new Date().toISOString()
    })
  }

  static async cancelSubscription(id: string): Promise<Subscription> {
    return this.updateSubscription(id, { 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
  }

  // ===== INVOICES =====
  
  static async getInvoices(coachId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .rpc('get_invoices_with_clients', { p_coach_id: coachId })

    if (error) throw error
    return data || []
  }

  static async getClientInvoices(clientId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        subscriptions(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createInvoice(invoice: InvoiceInsert): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select(`
        *,
        subscriptions(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async updateInvoice(id: string, updates: InvoiceUpdate): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        subscriptions(*)
      `)
      .single()

    if (error) throw error
    return data
  }

  static async generateInvoiceNumber(coachId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('generate_invoice_number', { p_coach_id: coachId })

    if (error) throw error
    return data
  }

  static async markInvoiceAsPaid(id: string, paidAt?: string): Promise<Invoice> {
    return this.updateInvoice(id, {
      status: 'paid',
      paid_at: paidAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }

  static async markInvoiceAsOverdue(id: string): Promise<Invoice> {
    return this.updateInvoice(id, {
      status: 'overdue',
      updated_at: new Date().toISOString()
    })
  }

  // ===== PAYMENTS =====
  
  static async getPayments(invoiceId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createPayment(payment: PaymentInsert): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ===== PAYMENT REMINDERS =====
  
  static async getPaymentReminders(invoiceId: string): Promise<PaymentReminder[]> {
    const { data, error } = await supabase
      .from('payment_reminders')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createPaymentReminder(reminder: PaymentReminderInsert): Promise<PaymentReminder> {
    const { data, error } = await supabase
      .from('payment_reminders')
      .insert(reminder)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ===== PAYMENT SETTINGS =====
  
  static async getPaymentSettings(coachId: string): Promise<PaymentSettings | null> {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('coach_id', coachId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async createPaymentSettings(settings: PaymentSettingsInsert): Promise<PaymentSettings> {
    const { data, error } = await supabase
      .from('payment_settings')
      .insert(settings)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updatePaymentSettings(coachId: string, updates: PaymentSettingsUpdate): Promise<PaymentSettings> {
    const { data, error } = await supabase
      .from('payment_settings')
      .update(updates)
      .eq('coach_id', coachId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ===== FINANCIAL STATS =====
  
  static async getCoachFinancialStats(coachId: string, startDate?: string, endDate?: string) {
    const { data, error } = await supabase.rpc('get_coach_financial_stats', {
      p_coach_id: coachId,
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) throw error
    return data
  }

  // ===== OVERDUE INVOICES =====
  
  static async getOverdueInvoices(coachId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        subscriptions(*)
      `)
      .eq('coach_id', coachId)
      .eq('status', 'overdue')
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // ===== RECENT PAYMENTS =====
  
  static async getRecentPayments(coachId: string, limit: number = 10): Promise<Payment[]> {
    const { data, error } = await supabase
      .rpc('get_recent_payments_with_clients', { 
        p_coach_id: coachId,
        p_limit: limit 
      })

    if (error) throw error
    return data || []
  }
}