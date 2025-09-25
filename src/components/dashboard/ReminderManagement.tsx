import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react'
import { ReminderService, ReminderTemplate } from '../../services/reminderService'
import { useAuth } from '../../providers/AuthProvider'

export const ReminderManagement: React.FC = () => {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<ReminderTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReminderTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    days_after_due: 7,
    is_active: true
  })
  const [stats, setStats] = useState({
    total_sent: 0,
    total_failed: 0,
    success_rate: 0,
    overdue_invoices: 0,
    pending_reminders: 0
  })

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user?.id])

  const loadData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const [templatesData, statsData] = await Promise.all([
        ReminderService.getReminderTemplates(user.id),
        ReminderService.getReminderStats(user.id)
      ])
      
      setTemplates(templatesData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading reminder data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      if (editingTemplate) {
        await ReminderService.updateReminderTemplate(editingTemplate.id!, formData)
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...formData } : t))
      } else {
        const newTemplate = await ReminderService.createReminderTemplate({
          ...formData,
          coach_id: user.id
        })
        setTemplates(prev => [...prev, newTemplate])
      }

      resetForm()
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Erreur lors de la sauvegarde du template')
    }
  }

  const handleEdit = (template: ReminderTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      days_after_due: template.days_after_due,
      is_active: template.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return

    try {
      await ReminderService.deleteReminderTemplate(id)
      setTemplates(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Erreur lors de la suppression du template')
    }
  }

  const handleSendReminders = async () => {
    if (!user?.id) return

    try {
      const result = await ReminderService.sendAutomaticReminders(user.id)
      alert(`Relances envoyées: ${result.sent}, Échouées: ${result.failed}, Ignorées: ${result.skipped}`)
      loadData() // Recharger les données
    } catch (error) {
      console.error('Error sending reminders:', error)
      alert('Erreur lors de l\'envoi des relances')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      days_after_due: 7,
      is_active: true
    })
    setEditingTemplate(null)
    setShowForm(false)
  }

  const getDefaultTemplate = (days: number) => {
    const templates = {
      1: {
        name: 'Relance 1 - Rappel',
        subject: 'Rappel de paiement - Facture {invoice_number}',
        content: `Bonjour {client_name},

Nous vous rappelons que votre facture {invoice_number} d'un montant de {invoice_amount} était due le {due_date}.

Pourriez-vous procéder au règlement dans les plus brefs délais ?

Merci pour votre compréhension.

Cordialement,
{coach_name}`
      },
      7: {
        name: 'Relance 2 - Insistance',
        subject: 'URGENT - Paiement en retard - Facture {invoice_number}',
        content: `Bonjour {client_name},

Votre facture {invoice_number} d'un montant de {invoice_amount} est en retard de {days_overdue} jour(s).

Nous vous demandons de régulariser cette situation rapidement pour éviter tout désagrément.

Merci de votre compréhension.

Cordialement,
{coach_name}`
      },
      15: {
        name: 'Relance 3 - Dernière chance',
        subject: 'DERNIÈRE CHANCE - Facture {invoice_number}',
        content: `Bonjour {client_name},

Votre facture {invoice_number} d'un montant de {invoice_amount} est en retard de {days_overdue} jour(s).

Cette situation ne peut plus durer. Nous vous accordons 48h pour régulariser votre situation, faute de quoi nous serons contraints de prendre des mesures.

Cordialement,
{coach_name}`
      }
    }
    return templates[days as keyof typeof templates] || templates[7]
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
          <h2 className="text-2xl font-bold">Gestion des relances</h2>
          <p className="text-gray-600">Configurez et envoyez des relances automatiques</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSendReminders} variant="default">
            <Send className="w-4 h-4 mr-2" />
            Envoyer les relances
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau template
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Envoyées</p>
                <p className="text-2xl font-bold">{stats.total_sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Échouées</p>
                <p className="text-2xl font-bold">{stats.total_failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">En retard</p>
                <p className="text-2xl font-bold">{stats.overdue_invoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Settings className="h-4 w-4 text-purple-600" />
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-600">Taux de succès</p>
                <p className="text-2xl font-bold">{stats.success_rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de relance</CardTitle>
          <CardDescription>
            Configurez vos templates de relance automatique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      <Badge variant="outline">
                        J+{template.days_after_due}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Sujet:</strong> {template.subject}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {template.content}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
              </CardTitle>
              <CardDescription>
                Configurez votre template de relance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du template</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Relance 1 - Rappel"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="days_after_due">Jours après échéance</Label>
                    <Input
                      id="days_after_due"
                      type="number"
                      min="1"
                      value={formData.days_after_due}
                      onChange={(e) => setFormData(prev => ({ ...prev, days_after_due: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Sujet de l'email</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Ex: Rappel de paiement - Facture {invoice_number}"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenu de l'email</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenu de votre email..."
                    rows={8}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variables disponibles: {'{client_name}'}, {'{invoice_number}'}, {'{invoice_amount}'}, {'{due_date}'}, {'{days_overdue}'}, {'{coach_name}'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Template actif</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit">
                    {editingTemplate ? 'Modifier' : 'Créer'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  {!editingTemplate && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const defaultTemplate = getDefaultTemplate(formData.days_after_due)
                        setFormData(prev => ({ ...prev, ...defaultTemplate }))
                      }}
                    >
                      Template par défaut
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}