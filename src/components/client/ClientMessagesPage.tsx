import React, { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { MessageService, Conversation, ConversationWithMessages } from '@/services/messageService'
import { ClientService } from '@/services/clientService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ClientMessagesPageProps {
  clientId?: string
}

const ClientMessagesPage: React.FC<ClientMessagesPageProps> = ({ clientId }) => {
  const { profile, user } = useAuth()
  const [clientRecord, setClientRecord] = useState<any>(null)

  // Fonction pour formater la date/heure des messages
  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return ''
    
    try {
      const messageDate = new Date(timestamp)
      
      // Vérifier si la date est valide
      if (isNaN(messageDate.getTime())) {
        console.warn('⚠️ Timestamp invalide:', timestamp)
        return 'Date invalide'
      }
      
      const now = new Date()
      const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 24) {
        // Aujourd'hui : afficher l'heure
        return messageDate.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      } else if (diffInHours < 48) {
        // Hier : afficher "Hier" + heure
        return `Hier ${messageDate.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}`
      } else {
        // Plus ancien : afficher la date complète
        return messageDate.toLocaleDateString('fr-FR', { 
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
    } catch (error) {
      console.error('❌ Erreur formatage timestamp:', error, 'Timestamp:', timestamp)
      return 'Erreur date'
    }
  }
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const { toast } = useToast()

  // Charger l'ID du client et ses conversations depuis Supabase
  useEffect(() => {
    if (user?.email) {
      loadClientAndConversations()
    }
  }, [user?.email])

  // Scroll automatique vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (selectedConversation?.messages.length) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [selectedConversation?.messages.length])

  const loadClientAndConversations = async () => {
    try {
      setLoading(true)
      console.log('🔍 Recherche client avec email:', user!.email)
      
      // Récupérer l'ID du client depuis son email
      const client = await ClientService.getClientByEmail(user!.email)
      if (!client) {
        console.error('❌ Client non trouvé pour email:', user!.email)
        toast({
          title: "Erreur",
          description: "Client non trouvé",
          variant: "destructive",
        })
        return
      }
      
      console.log('✅ Client trouvé:', client)
      setClientRecord(client)
      
      // Charger la conversation avec le coach
      const conversationsData = await MessageService.getClientConversations(client.id)
      console.log('📋 Conversations trouvées:', conversationsData)
      setConversations(conversationsData)
      
      // Charger automatiquement la première conversation (avec le coach)
      if (conversationsData.length > 0) {
        await loadConversationWithMessages(conversationsData[0].id)
      }
    } catch (error) {
      console.error('❌ Erreur chargement client/conversations:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }



  const loadConversationWithMessages = async (conversationId: string) => {
    try {
      const conversationData = await MessageService.getConversationWithMessages(conversationId)
      setSelectedConversation(conversationData)
      
      // Scroll automatique vers le bas après un court délai pour laisser le DOM se mettre à jour
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la conversation.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour scroller vers le bas des messages
  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.messages-container')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  const handleConversationSelect = async (conversation: Conversation) => {
    await loadConversationWithMessages(conversation.id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !clientRecord?.id) return

    try {
      setSendingMessage(true)
      
      // Envoyer le message via le service
      const message = await MessageService.sendMessage({
        conversation_id: selectedConversation.id,
        content: newMessage,
        sender_id: profile.id,
        sender_type: 'client'
      })

      // Mettre à jour la conversation sélectionnée
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
        last_message: newMessage,
        last_message_time: message.timestamp
      } : null)

      // Mettre à jour la liste des conversations
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? {
              ...conv,
              last_message: newMessage,
              last_message_time: message.timestamp,
              updated_at: new Date().toISOString()
            }
          : conv
      ))

      setNewMessage('')
      
      // Scroll automatique vers le bas après envoi du message
      setTimeout(() => {
        scrollToBottom()
      }, 100)
      
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès.",
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des conversations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communiquez avec votre coach</p>
        </div>
      </div>

      <div className="h-[600px]">
        {/* Zone de chat directe avec le coach */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedConversation ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {selectedConversation.client_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span>Conversation avec votre coach</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                  <span>Chargement de la conversation...</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedConversation ? (
              <div className="flex flex-col h-[500px]">
                {/* Messages */}
                <div className="messages-container flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Aucun message pour le moment. Commencez la conversation !
                    </div>
                  ) : (
                    selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_type === 'client'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_type === 'client' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Zone de saisie */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Sélectionnez une conversation pour commencer à discuter</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ClientMessagesPage
