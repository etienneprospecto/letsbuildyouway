import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical,
  Circle,
  Check,
  CheckCheck,
  Clock,
  User,
  Users
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { getInitials } from '@/lib/utils'
import MessageService, { Conversation, ConversationWithMessages } from '@/services/messageService'
import { useToast } from '@/hooks/use-toast'

interface MessagesPageProps {
  coachId?: string
}

const MessagesPage: React.FC<MessagesPageProps> = ({ coachId }) => {
  const { profile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const { toast } = useToast()

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

  // Charger les vraies conversations depuis Supabase
  useEffect(() => {
    if (profile?.id) {
      loadConversations()
    }
  }, [profile?.id])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const conversationsData = await MessageService.getCoachConversations(profile!.id)
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
      if (conversationData) {
        setSelectedConversation(conversationData)
        
        // Marquer les messages comme lus
        await MessageService.markMessagesAsRead(conversationId, profile!.id)
        
        // Mettre à jour la conversation dans la liste
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        ))
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages.",
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
        sender_type: 'coach'
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-orange-500" />
              <span>Messages</span>
            </CardTitle>
            <CardDescription>
              Communiquez avec vos clients en temps réel
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Interface de chat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]"
      >
        {/* Liste des conversations */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Conversations ({conversations.length})</h3>
              
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un client..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto pr-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucune conversation</p>
                  <p className="text-xs text-gray-400">
                    Les conversations se créent automatiquement quand vous ajoutez des clients
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Avatar du client */}
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.client_avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800">
                              {getInitials(conversation.client_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Indicateur en ligne */}
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            conversation.is_online ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>

                        {/* Informations de la conversation */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 truncate">
                              {conversation.client_name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {conversation.last_message_time ? formatMessageTime(conversation.last_message_time) : ''}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.last_message || 'Aucun message'}
                          </p>
                          
                          {/* Indicateurs */}
                          <div className="flex items-center space-x-2 mt-2">
                            {conversation.unread_count > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {conversation.unread_count} nouveau(x)
                              </Badge>
                            )}
                            
                            {conversation.is_online && (
                              <div className="flex items-center space-x-1 text-xs text-green-600">
                                <Circle className="h-2 w-2 fill-current" />
                                <span>En ligne</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Zone de chat */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              {/* Header de la conversation */}
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.client_avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800">
                        {getInitials(selectedConversation.client_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold">{selectedConversation.client_name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {selectedConversation.is_online ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Circle className="h-2 w-2 fill-current" />
                            <span>En ligne</span>
                          </div>
                        ) : (
                          <span>Hors ligne</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0">
                <div className="h-[400px] flex flex-col">
                  {/* Zone des messages */}
                  <div className="flex-1 p-4 overflow-y-auto pr-2">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm">Aucun message</p>
                        <p className="text-xs text-gray-400">
                          Commencez la conversation en envoyant un message
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedConversation.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'coach' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${message.sender_type === 'coach' ? 'order-2' : 'order-1'}`}>
                              <div className={`rounded-lg px-4 py-2 ${
                                message.sender_type === 'coach'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                              </div>
                              
                              <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${
                                message.sender_type === 'coach' ? 'justify-end' : 'justify-start'
                              }`}>
                                <span>{formatMessageTime(message.timestamp)}</span>
                                
                                {message.sender_type === 'coach' && (
                                  <span className="ml-1">
                                    {message.is_read ? (
                                      <CheckCheck className="h-3 w-3 text-blue-500" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Zone de saisie */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        disabled={sendingMessage}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {sendingMessage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            /* État vide - aucune conversation sélectionnée */
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Aucune conversation sélectionnée</h3>
                <p className="text-sm">
                  Sélectionnez une conversation dans la liste pour commencer à discuter
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  )
}

export default MessagesPage
