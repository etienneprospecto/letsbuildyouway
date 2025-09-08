import React, { useState, useEffect, useRef } from 'react'
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fonction pour scroller vers le bas des messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

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

  // Scroller vers le bas quand les messages changent
  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

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

        // Scroller vers le bas après le chargement des messages
        setTimeout(() => {
          scrollToBottom()
        }, 100)
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
      
      // Scroller vers le bas après l'envoi du message
      setTimeout(() => {
        scrollToBottom()
      }, 200)
      
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
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Interface de chat principale */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste des conversations - FIXE */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
          {/* Header de la liste - FIXE */}
          <div className="px-6 pt-0 pb-4 border-b border-gray-200 flex-shrink-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
                <Badge variant="secondary" className="text-xs">
                  {conversations.length}
                </Badge>
              </div>
              
              {/* Barre de recherche améliorée */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un client..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-300 focus:ring-orange-200"
                />
              </div>
            </div>
          </div>
          
          {/* Liste des conversations - FIXE */}
          <div className="flex-1 overflow-hidden">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Les conversations se créent automatiquement quand vous ajoutez des clients
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                      selectedConversation?.id === conversation.id 
                        ? 'bg-orange-50 border-r-4 border-orange-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar du client amélioré */}
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                          <AvatarImage src={conversation.client_avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                            {getInitials(conversation.client_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Indicateur en ligne amélioré */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                          conversation.is_online ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>

                      {/* Informations de la conversation améliorées */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 truncate text-base">
                            {conversation.client_name}
                          </h4>
                          <span className="text-xs text-gray-500 font-medium">
                            {conversation.last_message_time ? formatMessageTime(conversation.last_message_time) : ''}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-2 leading-relaxed">
                          {conversation.last_message || 'Aucun message'}
                        </p>
                        
                        {/* Indicateurs améliorés */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {conversation.unread_count > 0 && (
                              <Badge className="bg-orange-500 text-white text-xs font-semibold px-2 py-1">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            
                            {conversation.is_online && (
                              <div className="flex items-center space-x-1 text-xs text-green-600 font-medium">
                                <Circle className="h-2 w-2 fill-current" />
                                <span>En ligne</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de chat principale - STRUCTURE FLEXBOX PARFAITE */}
        <div className="flex-1 bg-white h-screen flex flex-col">
          {selectedConversation ? (
            <>
              {/* ÉLÉMENT 1 - HEADER FIXE - BANDEAU PAUL FST */}
              <div className="flex-shrink-0 px-6 py-5 border-b-2 border-gray-300 bg-gray-50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-14 w-14 ring-3 ring-orange-200 shadow-lg">
                      <AvatarImage src={selectedConversation.client_avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg">
                        {getInitials(selectedConversation.client_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedConversation.client_name}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        {selectedConversation.is_online ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <Circle className="h-3 w-3 fill-current" />
                            <span className="font-semibold">En ligne</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Circle className="h-3 w-3 fill-current" />
                            <span className="font-semibold">Hors ligne</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-200">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* ÉLÉMENT 2 - ZONE DE MESSAGES SCROLLABLE */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {selectedConversation.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-6 bg-gray-100 rounded-full mb-6">
                      <MessageCircle className="h-12 w-12 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Commencez la conversation en envoyant un message à {selectedConversation.client_name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'coach' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${message.sender_type === 'coach' ? 'order-2' : 'order-1'}`}>
                          {/* Bulle de message */}
                          <div className={`rounded-2xl px-6 py-4 shadow-sm ${
                            message.sender_type === 'coach'
                              ? 'bg-orange-500 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          
                          {/* Timestamp et statut */}
                          <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 ${
                            message.sender_type === 'coach' ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="font-medium">{formatMessageTime(message.timestamp)}</span>
                            
                            {message.sender_type === 'coach' && (
                              <div className="flex items-center">
                                {message.is_read ? (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Check className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Élément invisible pour le scroll automatique */}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* ÉLÉMENT 3 - BARRE DE SAISIE FIXE */}
              <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="h-12 px-4 text-base border-gray-300 focus:border-orange-300 focus:ring-orange-200 rounded-xl"
                        disabled={sendingMessage}
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50"
                    >
                      {sendingMessage ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Envoi...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="h-4 w-4" />
                          <span>Envoyer</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* État vide - aucune conversation sélectionnée */
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="p-6 bg-gray-100 rounded-full mb-6 inline-block">
                  <MessageCircle className="h-16 w-16 text-gray-300" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Aucune conversation sélectionnée</h3>
                <p className="text-gray-500 leading-relaxed">
                  Sélectionnez une conversation dans la liste de gauche pour commencer à discuter avec vos clients
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagesPage
