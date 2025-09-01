import { supabase } from '@/lib/supabase'

export interface Message {
  id: string
  conversation_id: string
  content: string
  sender_id: string
  sender_type: 'coach' | 'client'
  timestamp: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  coach_id: string
  client_id: string
  client_name: string
  client_avatar?: string
  last_message?: string
  last_message_time?: string
  unread_count: number
  is_online: boolean
  created_at: string
  updated_at: string
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

export interface CreateMessageData {
  conversation_id: string
  content: string
  sender_id: string
  sender_type: 'coach' | 'client'
}

export class MessageService {
  // Récupérer toutes les conversations d'un coach
  static async getCoachConversations(coachId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          clients:client_id (
            first_name,
            last_name
          )
        `)
        .eq('coach_id', coachId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Transformer les données
      const conversationsList = (data || []).map((conv: any) => ({
        id: conv.id,
        coach_id: conv.coach_id,
        client_id: conv.client_id,
        client_name: `${conv.clients.first_name} ${conv.clients.last_name}`,
        client_avatar: undefined, // Pas de photo_url dans la table clients
        last_message: conv.last_message,
        last_message_time: conv.last_message_time,
        unread_count: conv.unread_count || 0,
        is_online: conv.is_online || false,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      }))

      return conversationsList
    } catch (error) {
      console.error('Error fetching coach conversations:', error)
      throw error
    }
  }

  // Récupérer les conversations d'un client avec son coach
  static async getClientConversations(clientId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          profiles:coach_id (
            first_name,
            last_name
          )
        `)
        .eq('client_id', clientId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Transformer les données
      const conversationsList = (data || []).map((conv: any) => ({
        id: conv.id,
        coach_id: conv.coach_id,
        client_id: conv.client_id,
        client_name: conv.client_name,
        client_avatar: undefined,
        last_message: conv.last_message,
        last_message_time: conv.last_message_time,
        unread_count: conv.unread_count || 0,
        is_online: conv.is_online || false,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      }))

      return conversationsList
    } catch (error) {
      console.error('Error fetching client conversations:', error)
      throw error
    }
  }

  // Récupérer une conversation avec tous ses messages
  static async getConversationWithMessages(conversationId: string): Promise<ConversationWithMessages | null> {
    try {
      // Récupérer la conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          clients:client_id (
            first_name,
            last_name
          )
        `)
        .eq('id', conversationId)
        .single()

      if (convError) throw convError

      // Récupérer les messages
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgError) throw msgError

      // Transformer les données
      const conversationWithMessages: ConversationWithMessages = {
        id: conversation.id,
        coach_id: conversation.coach_id,
        client_id: conversation.client_id,
        client_name: `${conversation.clients.first_name} ${conversation.clients.last_name}`,
        client_avatar: undefined, // Pas de photo_url dans la table clients
        last_message: conversation.last_message,
        last_message_time: conversation.last_message_time,
        unread_count: conversation.unread_count || 0,
        is_online: conversation.is_online || false,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        messages: messages || []
      }

      return conversationWithMessages
    } catch (error) {
      console.error('Error fetching conversation with messages:', error)
      throw error
    }
  }

  // Envoyer un nouveau message
  static async sendMessage(messageData: CreateMessageData): Promise<Message> {
    try {
      // Créer le timestamp
      const timestamp = new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })

      // Créer le message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageData.conversation_id,
          content: messageData.content,
          sender_id: messageData.sender_id,
          sender_type: messageData.sender_type,
          timestamp: timestamp
        })
        .select()
        .single()

      if (msgError) throw msgError

      // Mettre à jour la conversation (dernier message, temps, etc.)
      const { error: convError } = await supabase
        .from('conversations')
        .update({
          last_message: messageData.content,
          last_message_time: timestamp,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageData.conversation_id)

      if (convError) throw convError

      return message
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Créer une nouvelle conversation (appelé automatiquement quand un client est ajouté)
  static async createConversation(coachId: string, clientId: string): Promise<Conversation> {
    try {
      // Vérifier si la conversation existe déjà
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('coach_id', coachId)
        .eq('client_id', clientId)
        .single()

      if (existingConv) {
        // La conversation existe déjà, la retourner
        const existingConversation = await this.getConversationById(existingConv.id)
        if (existingConversation) {
          return existingConversation
        }
        // Si getConversationById retourne null, continuer pour créer une nouvelle
      }

      // Créer une nouvelle conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          coach_id: coachId,
          client_id: clientId,
          last_message: 'Conversation démarrée',
          last_message_time: new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          unread_count: 0,
          is_online: false
        })
        .select()
        .single()

      if (convError) throw convError

      // Créer un message de bienvenue
      await this.sendMessage({
        conversation_id: conversation.id,
        content: 'Bonjour ! Bienvenue dans votre espace de coaching. N\'hésitez pas à me poser vos questions !',
        sender_id: coachId,
        sender_type: 'coach'
      })

      // Retourner la conversation créée
      const newConversation = await this.getConversationById(conversation.id)
      if (!newConversation) {
        throw new Error('Failed to retrieve created conversation')
      }
      
      return newConversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  // Récupérer une conversation par ID
  static async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          clients:client_id (
            first_name,
            last_name
          )
        `)
        .eq('id', conversationId)
        .single()

      if (error) throw error

      return {
        id: data.id,
        coach_id: data.coach_id,
        client_id: data.client_id,
        client_name: `${data.clients.first_name} ${data.clients.last_name}`,
        client_avatar: undefined, // Pas de photo_url dans la table clients
        last_message: data.last_message,
        last_message_time: data.last_message_time,
        unread_count: data.unread_count || 0,
        is_online: data.is_online || false,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    } catch (error) {
      console.error('Error fetching conversation by ID:', error)
      return null
    }
  }

  // Marquer les messages comme lus
  static async markMessagesAsRead(conversationId: string, readerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', readerId)

      if (error) throw error

      // Mettre à jour le compteur de messages non lus
      const { error: convError } = await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)

      if (convError) throw convError
    } catch (error) {
      console.error('Error marking messages as read:', error)
      throw error
    }
  }

  // Supprimer une conversation
  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      // Supprimer d'abord tous les messages
      const { error: msgError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)

      if (msgError) throw msgError

      // Puis supprimer la conversation
      const { error: convError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (convError) throw convError
    } catch (error) {
      console.error('Error deleting conversation:', error)
      throw error
    }
  }
}

export default MessageService