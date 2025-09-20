import { supabase } from '../lib/supabase'

export interface ReminderTemplate {
  id?: string
  coach_id: string
  name: string
  subject: string
  content: string
  days_after_due: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Reminder {
  id?: string
  invoice_id: string
  template_id: string
  sent_at: string
  status: 'sent' | 'failed' | 'pending'
  error_message?: string
  created_at?: string
}

export class ReminderService {
  /**
   * Obtient les templates de relance pour un coach
   */
  static async getReminderTemplates(coachId: string): Promise<ReminderTemplate[]> {
    const { data, error } = await supabase
      .from('reminder_templates')
      .select('*')
      .eq('coach_id', coachId)
      .order('days_after_due', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Crée un template de relance
   */
  static async createReminderTemplate(template: Omit<ReminderTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ReminderTemplate> {
    const { data, error } = await supabase
      .from('reminder_templates')
      .insert(template)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Met à jour un template de relance
   */
  static async updateReminderTemplate(id: string, updates: Partial<ReminderTemplate>): Promise<ReminderTemplate> {
    const { data, error } = await supabase
      .from('reminder_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Supprime un template de relance
   */
  static async deleteReminderTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminder_templates')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Obtient les factures en retard qui nécessitent une relance
   */
  static async getOverdueInvoicesForReminder(coachId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        clients!invoices_client_id_fkey(*)
      `)
      .eq('coach_id', coachId)
      .in('status', ['sent', 'overdue'])
      .lt('due_date', new Date().toISOString())

    if (error) throw error
    return data || []
  }

  /**
   * Vérifie si une facture a déjà reçu une relance récemment
   */
  static async hasRecentReminder(invoiceId: string, days: number = 7): Promise<boolean> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data, error } = await supabase
      .from('reminders')
      .select('id')
      .eq('invoice_id', invoiceId)
      .gte('sent_at', cutoffDate.toISOString())
      .eq('status', 'sent')
      .limit(1)

    if (error) throw error
    return (data && data.length > 0)
  }

  /**
   * Envoie une relance pour une facture
   */
  static async sendReminder(invoiceId: string, templateId: string): Promise<Reminder> {
    // Créer l'enregistrement de relance
    const { data: reminder, error: reminderError } = await supabase
      .from('reminders')
      .insert({
        invoice_id: invoiceId,
        template_id: templateId,
        sent_at: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (reminderError) throw reminderError

    try {
      // Récupérer les informations de la facture et du template
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients!invoices_client_id_fkey(*),
          reminder_templates!reminders_template_id_fkey(*)
        `)
        .eq('id', invoiceId)
        .single()

      if (invoiceError) throw invoiceError

      // Simuler l'envoi d'email (dans un vrai système, on utiliserait un service d'email)
      console.log('📧 Envoi de relance:', {
        to: invoiceData.clients.contact,
        subject: invoiceData.reminder_templates.subject,
        content: this.processTemplate(invoiceData.reminder_templates.content, invoiceData)
      })

      // Marquer comme envoyé
      const { data: updatedReminder, error: updateError } = await supabase
        .from('reminders')
        .update({ status: 'sent' })
        .eq('id', reminder.id)
        .select()
        .single()

      if (updateError) throw updateError

      return updatedReminder
    } catch (error) {
      // Marquer comme échoué
      await supabase
        .from('reminders')
        .update({ 
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Erreur inconnue'
        })
        .eq('id', reminder.id)

      throw error
    }
  }

  /**
   * Traite un template de relance avec les données de la facture
   */
  static processTemplate(template: string, invoiceData: any): string {
    return template
      .replace(/\{client_name\}/g, `${invoiceData.clients.first_name} ${invoiceData.clients.last_name}`)
      .replace(/\{invoice_number\}/g, invoiceData.invoice_number)
      .replace(/\{invoice_amount\}/g, `${invoiceData.amount_total} ${invoiceData.currency}`)
      .replace(/\{due_date\}/g, new Date(invoiceData.due_date).toLocaleDateString('fr-FR'))
      .replace(/\{days_overdue\}/g, this.calculateDaysOverdue(invoiceData.due_date))
      .replace(/\{coach_name\}/g, 'Votre coach BYW')
  }

  /**
   * Calcule le nombre de jours de retard
   */
  static calculateDaysOverdue(dueDate: string): string {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = now.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays.toString() : '0'
  }

  /**
   * Envoie automatiquement les relances selon les templates
   */
  static async sendAutomaticReminders(coachId: string): Promise<{
    sent: number
    failed: number
    skipped: number
  }> {
    const templates = await this.getReminderTemplates(coachId)
    const overdueInvoices = await this.getOverdueInvoicesForReminder(coachId)
    
    let sent = 0
    let failed = 0
    let skipped = 0

    for (const invoice of overdueInvoices) {
      const daysOverdue = this.calculateDaysOverdue(invoice.due_date)
      
      // Trouver le template approprié
      const template = templates.find(t => 
        t.is_active && 
        parseInt(daysOverdue) >= t.days_after_due &&
        parseInt(daysOverdue) < (templates.find(t2 => t2.days_after_due > t.days_after_due)?.days_after_due || Infinity)
      )

      if (!template) {
        skipped++
        continue
      }

      // Vérifier si une relance a déjà été envoyée récemment
      const hasRecent = await this.hasRecentReminder(invoice.id, 7)
      if (hasRecent) {
        skipped++
        continue
      }

      try {
        await this.sendReminder(invoice.id, template.id!)
        sent++
      } catch (error) {
        console.error('Erreur envoi relance:', error)
        failed++
      }
    }

    return { sent, failed, skipped }
  }

  /**
   * Obtient l'historique des relances pour une facture
   */
  static async getInvoiceReminders(invoiceId: string): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        *,
        reminder_templates!reminders_template_id_fkey(*)
      `)
      .eq('invoice_id', invoiceId)
      .order('sent_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Obtient les statistiques de relances pour un coach
   */
  static async getReminderStats(coachId: string, startDate?: string, endDate?: string): Promise<{
    total_sent: number
    total_failed: number
    success_rate: number
    overdue_invoices: number
    pending_reminders: number
  }> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const end = endDate || new Date().toISOString()

    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('status')
      .eq('coach_id', coachId)
      .gte('sent_at', start)
      .lte('sent_at', end)

    if (remindersError) throw remindersError

    const totalSent = reminders?.filter(r => r.status === 'sent').length || 0
    const totalFailed = reminders?.filter(r => r.status === 'failed').length || 0
    const successRate = totalSent + totalFailed > 0 ? (totalSent / (totalSent + totalFailed)) * 100 : 0

    const { data: overdueInvoices, error: overdueError } = await supabase
      .from('invoices')
      .select('id')
      .eq('coach_id', coachId)
      .in('status', ['sent', 'overdue'])
      .lt('due_date', new Date().toISOString())

    if (overdueError) throw overdueError

    const { data: pendingReminders, error: pendingError } = await supabase
      .from('reminders')
      .select('id')
      .eq('coach_id', coachId)
      .eq('status', 'pending')

    if (pendingError) throw pendingError

    return {
      total_sent: totalSent,
      total_failed: totalFailed,
      success_rate: Math.round(successRate * 100) / 100,
      overdue_invoices: overdueInvoices?.length || 0,
      pending_reminders: pendingReminders?.length || 0
    }
  }
}