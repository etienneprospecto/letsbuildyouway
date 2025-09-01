import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Send, 
  Users, 
  Calendar, 
  FileText, 
  Clock,
  CheckCircle
} from 'lucide-react'
import { FeedbackTemplate } from '@/types/feedback'
import { toast } from '@/hooks/use-toast'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface SendFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  templates: FeedbackTemplate[]
  clients: Client[]
  onSend: (data: {
    templateId: string
    clientIds: string[]
    weekStart: string
    weekEnd: string
    message?: string
  }) => void
}

const SendFeedbackModal: React.FC<SendFeedbackModalProps> = ({
  isOpen,
  onClose,
  templates,
  clients,
  onSend
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [weekStart, setWeekStart] = useState<string>('')
  const [weekEnd, setWeekEnd] = useState<string>('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Définir la semaine courante par défaut
      const today = new Date()
      const weekStartDate = getWeekStart(today)
      const weekEndDate = getWeekEnd(today)
      
      setWeekStart(weekStartDate.toISOString().split('T')[0])
      setWeekEnd(weekEndDate.toISOString().split('T')[0])
    }
  }, [isOpen])

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    return monday
  }

  const getWeekEnd = (date: Date): Date => {
    const monday = new Date(getWeekStart(date))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return sunday
  }

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const selectAllClients = () => {
    setSelectedClients(clients.map(c => c.id))
  }

  const deselectAllClients = () => {
    setSelectedClients([])
  }

  const handleSend = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Erreur",
        description: "Sélectionnez un template",
        variant: "destructive"
      })
      return
    }

    if (selectedClients.length === 0) {
      toast({
        title: "Erreur",
        description: "Sélectionnez au moins un client",
        variant: "destructive"
      })
      return
    }

    if (!weekStart || !weekEnd) {
      toast({
        title: "Erreur",
        description: "Définissez la période",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await onSend({
        templateId: selectedTemplate,
        clientIds: selectedClients,
        weekStart,
        weekEnd,
        message: message.trim() || undefined
      })
      
      toast({
        title: "Succès",
        description: `Feedback envoyé à ${selectedClients.length} client(s)`
      })
      
      onClose()
    } catch (error) {
      console.error('Erreur envoi feedback:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le feedback",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)
  const selectedClientsData = clients.filter(c => selectedClients.includes(c.id))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Envoyer un feedback hebdomadaire</DialogTitle>
          <DialogDescription>
            Sélectionnez un template et envoyez-le à vos clients pour la semaine choisie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection du template */}
          <Card>
            <CardHeader>
              <CardTitle>Template de feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Choisir un template *</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates
                        .filter(t => t.is_active)
                        .map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4" />
                              <span>{template.name}</span>
                              {template.description && (
                                <span className="text-muted-foreground text-sm">
                                  - {template.description}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplateData && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Détails du template</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nom:</strong> {selectedTemplateData.name}</p>
                      {selectedTemplateData.description && (
                        <p><strong>Description:</strong> {selectedTemplateData.description}</p>
                      )}
                      <p><strong>Questions:</strong> {selectedTemplateData.questions.length}</p>
                      <div className="flex items-center space-x-2">
                        <span><strong>Statut:</strong></span>
                        <Badge variant={selectedTemplateData.is_active ? "default" : "secondary"}>
                          {selectedTemplateData.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sélection des clients */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Clients destinataires</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllClients}>
                    Tout sélectionner
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllClients}>
                    Tout désélectionner
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`client-${client.id}`}
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => handleClientToggle(client.id)}
                    />
                    <Label htmlFor={`client-${client.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{client.first_name} {client.last_name}</span>
                          <span className="text-muted-foreground ml-2">({client.email})</span>
                        </div>
                        {selectedClients.includes(client.id) && (
                          <Badge variant="default" className="ml-2">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Sélectionné
                          </Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedClients.length > 0 && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">
                    {selectedClients.length} client(s) sélectionné(s)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Période */}
          <Card>
            <CardHeader>
              <CardTitle>Période du feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="week-start">Début de semaine *</Label>
                  <Input
                    id="week-start"
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="week-end">Fin de semaine *</Label>
                  <Input
                    id="week-end"
                    type="date"
                    value={weekEnd}
                    onChange={(e) => setWeekEnd(e.target.value)}
                  />
                </div>
              </div>
              
              {weekStart && weekEnd && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Semaine du {new Date(weekStart).toLocaleDateString('fr-FR')} au {new Date(weekEnd).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message optionnel */}
          <Card>
            <CardHeader>
              <CardTitle>Message accompagnant le feedback (optionnel)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ajoutez un message personnalisé pour accompagner ce feedback..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Résumé */}
          {selectedTemplate && selectedClients.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-primary" />
                  <span>Résumé de l'envoi</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Template:</strong> {selectedTemplateData?.name}</p>
                  <p><strong>Clients:</strong> {selectedClients.length} sélectionné(s)</p>
                  <p><strong>Période:</strong> {weekStart && weekEnd ? `${new Date(weekStart).toLocaleDateString('fr-FR')} - ${new Date(weekEnd).toLocaleDateString('fr-FR')}` : 'Non définie'}</p>
                  {message && <p><strong>Message:</strong> {message}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={loading || !selectedTemplate || selectedClients.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Envoi...' : `Envoyer à ${selectedClients.length} client(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SendFeedbackModal
