import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { MessageService, Conversation, ConversationWithMessages } from '@/services/messageService'
import { ClientService } from '@/services/clientService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  Search, 
  Smile, 
  Paperclip, 
  Clock,
  Check,
  CheckCheck,
  Reply,
  ThumbsUp,
  MoreHorizontal
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ClientMessagesPageProps {
  clientId?: string
}

const ClientMessagesPage: React.FC<ClientMessagesPageProps> = ({ clientId }) => {
  const { profile, user } = useAuth()
  const [clientRecord, setClientRecord] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Fonction améliorée pour formater la date/heure des messages
  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return ''
    
    try {
      const messageDate = new Date(timestamp)
      
      if (isNaN(messageDate.getTime())) {
        console.warn('⚠️ Timestamp invalide:', timestamp)
        return 'Date invalide'
      }
      
      if (isToday(messageDate)) {
        return format(messageDate, 'HH:mm', { locale: fr })
      } else if (isYesterday(messageDate)) {
        return `Hier ${format(messageDate, 'HH:mm', { locale: fr })}`
      } else {
        return format(messageDate, 'dd/MM HH:mm', { locale: fr })
      }
    } catch (error) {
      console.error('❌ Erreur formatage timestamp:', error, 'Timestamp:', timestamp)
      return 'Erreur date'
    }
  }

  // Fonction pour formater la date des groupes de messages
  const formatMessageDate = (timestamp: string) => {
    if (!timestamp) return ''
    
    try {
      const messageDate = new Date(timestamp)
      
      if (isNaN(messageDate.getTime())) return ''
      
      if (isToday(messageDate)) {
        return "Aujourd'hui"
      } else if (isYesterday(messageDate)) {
        return "Hier"
      } else {
        return format(messageDate, 'EEEE d MMMM', { locale: fr })
      }
    } catch (error) {
      return ''
    }
  }

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

  // Auto-resize du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [newMessage])

  // Gestion du scroll automatique
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

  // Fonction pour gérer la frappe
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      // Simuler l'arrêt de frappe après 3 secondes
      setTimeout(() => setIsTyping(false), 3000)
    }
  }

  // Fonction pour ajouter une réaction
  const handleReaction = (messageId: string, reaction: string) => {

    console.log('Réaction ajoutée:', reaction, 'au message:', messageId)
  }

  // Fonction pour répondre à un message
  const handleReply = (message: any) => {
    setReplyingTo(message)
    textareaRef.current?.focus()
  }

  const handleConversationSelect = async (conversation: Conversation) => {
    await loadConversationWithMessages(conversation.id)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !clientRecord?.id) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setReplyingTo(null)

    try {
      setSendingMessage(true)
      
      // Envoyer le message via le service
      const message = await MessageService.sendMessage({
        conversation_id: selectedConversation.id,
        content: messageContent,
        sender_id: profile.id,
        sender_type: 'client'
      })

      // Mettre à jour la conversation sélectionnée
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
        last_message: messageContent,
        last_message_time: message.timestamp
      } : null)

      // Mettre à jour la liste des conversations
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? {
              ...conv,
              last_message: messageContent,
              last_message_time: message.timestamp,
              updated_at: new Date().toISOString()
            }
          : conv
      ))

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
    } else {
      handleTyping()
    }
  }

  // Fonction pour grouper les messages par date
  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {}
    
    messages.forEach(message => {
      const date = format(new Date(message.timestamp), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header moderne */}
      <div className="flex items-center justify-between p-6 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {selectedConversation?.coach_name?.split(' ').map(n => n[0]).join('') || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {selectedConversation?.coach_name || 'Votre Coach'}
            </h1>
            <p className="text-sm text-muted-foreground">En ligne</p>
          </div>
        </div>
      </div>

      {/* Zone de messages avec ScrollArea */}
      <div className="flex-1 overflow-hidden">
        {selectedConversation ? (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {selectedConversation.messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Commencez la conversation</h3>
                  <p className="text-muted-foreground">Envoyez votre premier message à votre coach</p>
                </div>
              ) : (
                Object.entries(groupMessagesByDate(selectedConversation.messages)).map(([date, messages]) => (
                  <div key={date}>
                    {/* Séparateur de date */}
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                        {formatMessageDate(messages[0].timestamp)}
                      </div>
                    </div>
                    
                    {/* Messages du jour */}
                    {messages.map((message, index) => (
                      <div key={message.id} className={`flex items-end gap-2 group ${
                        message.sender_type === 'client' ? 'justify-end' : 'justify-start'
                      }`}>
                        {message.sender_type === 'coach' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                              {selectedConversation.coach_name?.split(' ').map(n => n[0]).join('') || 'C'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`flex flex-col max-w-[70%] ${message.sender_type === 'client' ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`relative px-4 py-3 rounded-2xl ${
                              message.sender_type === 'client'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${
                              message.sender_type === 'client' ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className={`text-xs ${
                                message.sender_type === 'client' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {message.sender_type === 'client' && (
                                <div className="flex items-center">
                                  <CheckCheck className="h-3 w-3 text-blue-200" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions sur les messages */}
                          <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1 ${
                            message.sender_type === 'client' ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleReply(message)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleReaction(message.id, '👍')}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {message.sender_type === 'client' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs">
                              {profile?.first_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )}
              
              {/* Indicateur de frappe */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      {selectedConversation.coach_name?.split(' ').map(n => n[0]).join('') || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p>Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>

      {/* Zone de saisie moderne */}
      {selectedConversation && (
        <div className="border-t bg-white dark:bg-gray-800 p-4">
          {/* Message de réponse */}
          {replyingTo && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Répondre à</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 truncate max-w-xs">{replyingTo.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder="Tapez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[44px] max-h-[120px] resize-none pr-12"
                rows={1}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !newMessage.trim()}
              size="sm"
              className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {sendingMessage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientMessagesPage
