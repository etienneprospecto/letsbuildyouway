import { supabase } from '@/lib/supabase'
import { errorHandler } from './errorHandler'

export interface VoiceMessage {
  id: string
  conversation_id: string
  content: string
  sender_id: string
  sender_type: 'coach' | 'client'
  timestamp: string
  is_read: boolean
  created_at: string
  message_type: 'voice'
  voice_url: string
  voice_duration: number
  voice_file_size: number
  voice_mime_type: string
}

export interface CreateVoiceMessageData {
  conversation_id: string
  content: string
  sender_id: string
  sender_type: 'coach' | 'client'
  voice_url: string
  voice_duration: number
  voice_file_size: number
  voice_mime_type?: string
}

export class VoiceMessageService {
  /**
   * Upload un fichier audio vers Supabase Storage
   */
  static async uploadVoiceFile(
    audioBlob: Blob, 
    conversationId: string, 
    senderId: string
  ): Promise<string> {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now()
      const fileName = `voice-${conversationId}-${senderId}-${timestamp}.webm`
      const filePath = fileName // Pas besoin du préfixe voice-messages/ car on upload dans le bucket voice-messages

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('voice-messages')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erreur upload Supabase Storage:', error)
        throw new Error(`Erreur upload: ${error.message}`)
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(filePath)

      console.log('Fichier uploadé avec succès:', { filePath, publicUrl })
      return publicUrl
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de l\'upload du message vocal')
      throw error
    }
  }

  /**
   * Créer un message vocal dans la base de données
   */
  static async createVoiceMessage(
    messageData: CreateVoiceMessageData
  ): Promise<VoiceMessage> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageData.conversation_id,
          content: messageData.content,
          sender_id: messageData.sender_id,
          sender_type: messageData.sender_type,
          timestamp: new Date().toISOString(),
          message_type: 'voice',
          voice_url: messageData.voice_url,
          voice_duration: messageData.voice_duration,
          voice_file_size: messageData.voice_file_size,
          voice_mime_type: messageData.voice_mime_type || 'audio/webm'
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur création message vocal:', error)
        throw error
      }

      return data as VoiceMessage
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la création du message vocal')
      throw error
    }
  }

  /**
   * Envoyer un message vocal complet (upload + création en DB)
   */
  static async sendVoiceMessage(
    audioBlob: Blob,
    conversationId: string,
    senderId: string,
    senderType: 'coach' | 'client',
    content?: string
  ): Promise<VoiceMessage> {
    try {
      // 1. Upload du fichier audio
      const voiceUrl = await this.uploadVoiceFile(audioBlob, conversationId, senderId)

      // 2. Calculer la durée et la taille
      const duration = await this.getAudioDuration(audioBlob)
      const fileSize = audioBlob.size

      // 3. Créer le message en base
      const message = await this.createVoiceMessage({
        conversation_id: conversationId,
        content: content || '🎤 Message vocal',
        sender_id: senderId,
        sender_type: senderType,
        voice_url: voiceUrl,
        voice_duration: duration,
        voice_file_size: fileSize,
        voice_mime_type: 'audio/webm'
      })

      // 4. Mettre à jour la conversation
      await this.updateConversationLastMessage(conversationId, '🎤 Message vocal')

      return message
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de l\'envoi du message vocal')
      throw error
    }
  }

  /**
   * Obtenir la durée d'un fichier audio
   */
  private static async getAudioDuration(audioBlob: Blob): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const url = URL.createObjectURL(audioBlob)
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve(Math.floor(audio.duration))
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Impossible de charger le fichier audio'))
      }
      
      audio.src = url
    })
  }

  /**
   * Mettre à jour le dernier message d'une conversation
   */
  private static async updateConversationLastMessage(
    conversationId: string, 
    lastMessage: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          last_message: lastMessage,
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (error) throw error
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la mise à jour de la conversation')
      throw error
    }
  }

  /**
   * Supprimer un message vocal (fichier + DB)
   */
  static async deleteVoiceMessage(messageId: string): Promise<void> {
    try {
      // 1. Récupérer les infos du message
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('voice_url')
        .eq('id', messageId)
        .single()

      if (fetchError) throw fetchError

      // 2. Supprimer le fichier du storage
      if (message?.voice_url) {
        const fileName = message.voice_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('voice-messages')
            .remove([fileName]) // Pas besoin du préfixe voice-messages/ car on supprime du bucket voice-messages
        }
      }

      // 3. Supprimer le message de la DB
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (deleteError) throw deleteError
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la suppression du message vocal')
      throw error
    }
  }

  /**
   * Créer le bucket de stockage pour les messages vocaux
   */
  static async createVoiceMessagesBucket(): Promise<void> {
    try {
      const { data, error } = await supabase.storage
        .createBucket('voice-messages', {
          public: true,
          allowedMimeTypes: ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg'],
          fileSizeLimit: 10 * 1024 * 1024 // 10MB max
        })

      if (error && !error.message.includes('already exists')) {
        throw error
      }
    } catch (error) {
      errorHandler.handleError(error, 'Erreur lors de la création du bucket de stockage')
      throw error
    }
  }
}

export default VoiceMessageService
