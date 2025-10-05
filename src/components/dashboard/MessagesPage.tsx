import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Users,
  Smile,
  Paperclip,
  Reply,
  ThumbsUp,
  Mic,
  MicOff
} from 'lucide-react'
import { useAuth } from '@/providers/OptimizedAuthProvider'
import { getInitials } from '@/lib/utils'
import MessageService, { Conversation, ConversationWithMessages } from '@/services/messageService'
import { SimpleVoiceService } from '@/services/simpleVoiceService'
import { VoiceRecorder } from '@/components/ui/voice-recorder'
import { VoiceMessage } from '@/components/ui/voice-message'
import { useToast } from '@/hooks/use-toast'
import { format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'

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
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<any>(null)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [sendingVoiceMessage, setSendingVoiceMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Fonction pour scroller vers le bas des messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

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

  // Fonction pour gérer la frappe
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
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

  // Auto-resize du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [newMessage])

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
        sender_type: 'coach'
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
    } else {
      handleTyping()
    }
  }

  // Fonction pour gérer l'envoi de messages vocaux
  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!selectedConversation || !profile?.id) return

    try {
      setSendingVoiceMessage(true)
      
      // Envoyer le message vocal via le service simple
      const message = await SimpleVoiceService.sendVoiceMessage(
        audioBlob,
        selectedConversation.id,
        profile.id,
        'coach'
      )

      // Mettre à jour la conversation sélectionnée
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
        last_message: '🎤 Message vocal',
        last_message_time: message.timestamp
      } : null)

      // Mettre à jour la liste des conversations
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? {
              ...conv,
              last_message: '🎤 Message vocal',
              last_message_time: message.timestamp,
              updated_at: new Date().toISOString()
            }
          : conv
      ))

      // Fermer l'enregistreur vocal
      setShowVoiceRecorder(false)

      // Scroller vers le bas après l'envoi du message
      setTimeout(() => {
        scrollToBottom()
      }, 200)
      
      toast({
        title: "Message vocal envoyé",
        description: "Votre message vocal a été envoyé avec succès.",
      })
    } catch (error) {
      console.error('Error sending voice message:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message vocal.",
        variant: "destructive",
      })
    } finally {
      setSendingVoiceMessage(false)
    }
  }

  // Fonction pour gérer l'enregistrement vocal terminé
  const handleVoiceRecordingComplete = (audioBlob: Blob, duration: number) => {
    // Cette fonction est appelée quand l'enregistrement est terminé
    // On peut afficher un aperçu ou envoyer directement
    console.log('Voice recording completed:', { duration, size: audioBlob.size })
  }

  // Fonction pour télécharger un message vocal
  const handleDownloadVoiceMessage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredConversations = conversations.filter(conv =>
    conv.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    <div className="h-[calc(100vh-200px)] flex bg-white dark:bg-gray-900">
      {/* Colonne de gauche - Liste des clients */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header de la liste */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conversations</h3>
              <Badge variant="secondary" className="text-xs">
                {conversations.length}
              </Badge>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un client..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
        
        {/* Liste des conversations */}
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune conversation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
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
                      ? 'bg-primary/5 border-r-4 border-primary' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar du client */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                        <AvatarImage src={conversation.client_avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                          {getInitials(conversation.client_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Indicateur en ligne */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                        conversation.is_online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>

                    {/* Informations de la conversation */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
                          {conversation.client_name}
                        </h4>
                        <span className="text-xs text-gray-500 font-medium">
                          {conversation.last_message_time ? formatMessageTime(conversation.last_message_time) : ''}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-2 leading-relaxed">
                        {conversation.last_message || 'Aucun message'}
                      </p>
                      
                      {/* Indicateurs */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {conversation.unread_count > 0 && (
                            <Badge className="bg-primary text-white text-xs font-semibold px-2 py-1">
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
        </ScrollArea>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header moderne */}
            <div className="flex items-center justify-between p-6 border-b bg-white dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedConversation.client_avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      {getInitials(selectedConversation.client_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                    selectedConversation.is_online ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {selectedConversation.client_name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.is_online ? 'En ligne' : 'Hors ligne'}
                  </p>
                </div>
              </div>
            </div>

            {/* Zone de messages avec ScrollArea */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Commencez la conversation</h3>
                      <p className="text-muted-foreground">Envoyez votre premier message à {selectedConversation.client_name}</p>
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
                            message.sender_type === 'coach' ? 'justify-end' : 'justify-start'
                          }`}>
                            {message.sender_type === 'client' && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                  {getInitials(selectedConversation.client_name)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`flex flex-col max-w-[70%] ${message.sender_type === 'coach' ? 'items-end' : 'items-start'}`}>
                              {/* Message vocal */}
                              {(message as any).message_type === 'voice' ? (
                                <VoiceMessage
                                  voiceUrl={(message as any).voice_url}
                                  duration={(message as any).voice_duration}
                                  timestamp={message.timestamp}
                                  senderName={message.sender_type === 'coach' ? 'Vous' : selectedConversation.client_name}
                                  isOwn={message.sender_type === 'coach'}
                                  onDownload={handleDownloadVoiceMessage}
                                />
                              ) : (
                                /* Message texte */
                                <div
                                  className={`relative px-4 py-3 rounded-2xl ${
                                    message.sender_type === 'coach'
                                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed">{message.content}</p>
                                  <div className={`flex items-center gap-1 mt-1 ${
                                    message.sender_type === 'coach' ? 'justify-end' : 'justify-start'
                                  }`}>
                                    <span className={`text-xs ${
                                      message.sender_type === 'coach' ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                      {formatMessageTime(message.timestamp)}
                                    </span>
                                    {message.sender_type === 'coach' && (
                                      <div className="flex items-center">
                                        <CheckCheck className="h-3 w-3 text-orange-200" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Actions sur les messages */}
                              <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-1 ${
                                message.sender_type === 'coach' ? 'flex-row-reverse' : 'flex-row'
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
                            
                            {message.sender_type === 'coach' && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs">
                                  {profile?.first_name?.[0] || 'C'}
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
                          {getInitials(selectedConversation.client_name)}
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
            </div>

            {/* Zone de saisie moderne */}
            <div className="border-t bg-white dark:bg-gray-800 p-4">
              {/* Message de réponse */}
              {replyingTo && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-primary">
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
                      onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                      title="Enregistrer un message vocal"
                    >
                      {showVoiceRecorder ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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
                  className="h-11 w-11 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {sendingMessage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Enregistreur vocal */}
              {showVoiceRecorder && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                  <VoiceRecorder
                    onRecordingComplete={handleVoiceRecordingComplete}
                    onSendVoiceMessage={handleSendVoiceMessage}
                    disabled={sendingVoiceMessage}
                    maxDuration={300} // 5 minutes max
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p>Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage
