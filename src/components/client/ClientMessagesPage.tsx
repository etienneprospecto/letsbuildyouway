import React, { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { MessageService, Conversation, ConversationWithMessages } from '@/services/messageService'
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
  const { profile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const { toast } = useToast()

  // Charger les conversations du client depuis Supabase
  useEffect(() => {
    if (profile?.id) {
      loadConversations()
    }
  }, [profile?.id])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const conversationsData = await MessageService.getClientConversations(profile!.id)
      setConversations(conversationsData)
      
      // Si aucune conversation n'est sélectionnée, sélectionner la première
      if (conversationsData.length > 0 && !selectedConversation) {
        await loadConversationWithMessages(conversationsData[0].id)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
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
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la conversation.",
        variant: "destructive",
      })
    }
  }

  const handleConversationSelect = async (conversation: Conversation) => {
    await loadConversationWithMessages(conversation.id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !profile?.id) return

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

  const filteredConversations = conversations.filter(conv =>
    conv.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Liste des conversations */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Aucune conversation trouvée
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {conversation.client_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {conversation.client_name}
                        </p>
                        {conversation.last_message && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.last_message}
                          </p>
                        )}
                        {conversation.last_message_time && (
                          <p className="text-xs text-gray-400">
                            {new Date(conversation.last_message_time).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Zone de chat */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedConversation ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {selectedConversation.client_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedConversation.client_name}</span>
                </div>
              ) : (
                "Sélectionnez une conversation"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedConversation ? (
              <div className="flex flex-col h-[500px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                            {new Date(message.timestamp).toLocaleTimeString()}
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
